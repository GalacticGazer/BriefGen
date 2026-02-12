import { describe, expect, it } from "vitest";
import { stripTrailingFollowUpSolicitations } from "@/lib/openai";

describe("stripTrailingFollowUpSolicitations", () => {
  it("removes trailing follow-up solicitation paragraphs", () => {
    const content = [
      "Executive summary: choose HubSpot Starter for faster adoption.",
      "If you share your target buyer, current stack, and budget range, I can tailor this into a shortlist and rollout plan.",
    ].join("\n\n");

    expect(stripTrailingFollowUpSolicitations(content)).toBe(
      "Executive summary: choose HubSpot Starter for faster adoption.",
    );
  });

  it("keeps substantive conclusions that are not follow-up solicitations", () => {
    const content = [
      "Recommendation: start with one pipeline and one KPI.",
      "If you can only execute one initiative this quarter, I can recommend starting with onboarding automation first.",
    ].join("\n\n");

    expect(stripTrailingFollowUpSolicitations(content)).toBe(content);
  });

  it("removes stacked trailing solicitation paragraphs", () => {
    const content = [
      "Core analysis remains available.",
      "Share your current process map and I can customize this into a pilot checklist.",
      "If you'd provide team size and timeline, we can prepare a phased execution plan.",
    ].join("\n\n");

    expect(stripTrailingFollowUpSolicitations(content)).toBe("Core analysis remains available.");
  });

  it("keeps paragraphs that mention sharing without a follow-up offer", () => {
    const content = [
      "Final note: share your findings with stakeholders before implementation.",
      "This avoids hidden assumptions during rollout.",
    ].join("\n\n");

    expect(stripTrailingFollowUpSolicitations(content)).toBe(content);
  });
});
