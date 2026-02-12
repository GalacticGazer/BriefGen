import OpenAI from "openai";
import { AI_CONFIG } from "@/lib/config";
import { buildReportPrompt } from "@/lib/prompts";

type UsageSummary = {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
};

export async function generateReport(
  category: string,
  question: string,
): Promise<{ content: string; usage: UsageSummary }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in environment variables.");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const { systemPrompt, userPrompt } = buildReportPrompt(category, question);

  const response = await openai.chat.completions.create({
    model: AI_CONFIG.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_completion_tokens: AI_CONFIG.maxOutputTokens,
    temperature: AI_CONFIG.temperature,
  });

  const rawContent = response.choices[0]?.message?.content ?? "";
  const content = stripTrailingFollowUpSolicitations(rawContent);
  const inputTokens = response.usage?.prompt_tokens ?? 0;
  const outputTokens = response.usage?.completion_tokens ?? 0;

  const inputCost =
    (inputTokens / 1_000_000) * (AI_CONFIG.costPerMillionInput[AI_CONFIG.model] ?? 0);
  const outputCost =
    (outputTokens / 1_000_000) * (AI_CONFIG.costPerMillionOutput[AI_CONFIG.model] ?? 0);

  return {
    content,
    usage: {
      inputTokens,
      outputTokens,
      estimatedCost: Math.round((inputCost + outputCost) * 10000) / 10000,
    },
  };
}

export function stripTrailingFollowUpSolicitations(content: string): string {
  const solicitationPattern =
    /^(?:if\s+you(?:'d)?\s+(?:share|provide|send|give|tell)\b|share\s+your\b).{0,500}\b(?:i|we)\s+can\s+(?:tailor|customi[sz]e|translate|turn(?:\s+this)?\s+into|build|create|prepare|map|draft)\b/i;

  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  while (paragraphs.length > 0) {
    const lastParagraph = paragraphs[paragraphs.length - 1];
    if (!solicitationPattern.test(lastParagraph)) {
      break;
    }

    paragraphs.pop();
  }

  return paragraphs.join("\n\n").trim();
}
