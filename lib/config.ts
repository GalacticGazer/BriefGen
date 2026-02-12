export const AI_CONFIG = {
  // CHANGE THIS LINE TO SWITCH MODELS
  // Options: 'gpt-5.2', 'gpt-5.2-pro', 'gpt-5-mini', 'gpt-4o'
  model: "gpt-5.2",

  // Max tokens for output (3,000-4,000 word report ~= 4,000-6,000 tokens)
  maxOutputTokens: 8000,

  // Temperature: lower values increase consistency and reduce creative drift.
  temperature: 0.45,

  // Cost tracking (update if pricing changes)
  costPerMillionInput: {
    "gpt-5.2": 1.75,
    "gpt-5.2-pro": 21.0,
    "gpt-5-mini": 0.25,
    "gpt-4o": 2.5,
  } as Record<string, number>,

  costPerMillionOutput: {
    "gpt-5.2": 14.0,
    "gpt-5.2-pro": 168.0,
    "gpt-5-mini": 2.0,
    "gpt-4o": 10.0,
  } as Record<string, number>,
};
