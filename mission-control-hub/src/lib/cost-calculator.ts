// Token cost calculation per model (USD per 1K tokens)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'claude-sonnet-4-20250514': { input: 0.003, output: 0.015 },
  'claude-haiku-3-5-20241022': { input: 0.0008, output: 0.004 },
  'claude-opus-4-20250514': { input: 0.015, output: 0.075 },
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model] || { input: 0.003, output: 0.015 } // default to mid-range
  return (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output
}

export function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`
  return `$${cost.toFixed(2)}`
}

export function getBudgetStatus(current: number, soft: number, hard: number) {
  if (current >= hard) return { status: 'blocked' as const, color: 'red', percent: 100 }
  if (current >= soft) return { status: 'warning' as const, color: 'yellow', percent: Math.round((current / hard) * 100) }
  return { status: 'ok' as const, color: 'green', percent: Math.round((current / hard) * 100) }
}
