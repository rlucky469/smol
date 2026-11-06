


import { WalletActions } from './wallet.actions';
import { ChargeRequest, SearchType, UsageInfo } from './wallet.model';

// Used for CheckBalance and as a fallback when the response has no model name.
// answer_generation uses gpt-4o, so the estimate is based on the expensive model.
export const DEFAULT_AI_MODEL = 'gpt-4o';
export const DEFAULT_MAX_OUTPUT_TOKENS = 4000;
const MAX_ANSWER_LENGTH = 8000; // server limit unknown, keep payload safe

// Add 'embedding' here if the billing API does not know embedding models yet
const SKIP_KINDS: string[] = [];

// Reads token usage from one AI call (usage object or flat fields)
export function extractUsage(source: any): UsageInfo {
  const u = source?.usage ?? source ?? {};
  return {
    model: String(u.model ?? u.modelName ?? u.model_name ?? '') || DEFAULT_AI_MODEL,
    inputTokens: Number(u.inputTokens ?? u.input_tokens ?? u.prompt_tokens ?? 0) || 0,
    outputTokens: Number(u.outputTokens ?? u.output_tokens ?? u.completion_tokens ?? 0) || 0,
    cachedInputTokens:
      Number(
        u.cachedInputTokens ?? u.cacheTokens ?? u.cache_tokens ?? u.cached_tokens ?? u.cacheReadTokens ?? 0
      ) || 0,
  };
}

// usage.calls[] = every model call made for one user action
function extractCalls(source: any): any[] {
  const calls = source?.usage?.calls ?? source?.calls;
  return Array.isArray(calls) ? calls : [];
}

// One response can need several charges (one per model). Same-model calls are merged.
export function buildChargeRequests(
  searchType: SearchType,
  prompt: string,
  usageSource: any,
  requestKey?: string,
  answer?: string
): ChargeRequest[] {
  const baseKey = requestKey || crypto.randomUUID();
  const base = { searchType, prompt: (prompt ?? '').slice(0, 1000) };
  const fullAnswer = String(answer ?? usageSource?.answer ?? '').slice(0, MAX_ANSWER_LENGTH);
  const calls = extractCalls(usageSource);

  // Old response shape (no calls list): single charge, same as before
  if (!calls.length) {
    return [{ ...base, answer: fullAnswer, requestKey: baseKey, ...extractUsage(usageSource) }];
  }

  // Merge calls of the same model
  const byModel = new Map<string, UsageInfo>();
  for (const call of calls) {
    if (SKIP_KINDS.includes(call?.kind)) continue;
    const u = extractUsage(call);
    if (u.inputTokens + u.outputTokens === 0) continue;

    const sum = byModel.get(u.model);
    if (sum) {
      sum.inputTokens += u.inputTokens;
      sum.outputTokens += u.outputTokens;
      sum.cachedInputTokens += u.cachedInputTokens;
    } else {
      byModel.set(u.model, { ...u });
    }
  }

  // The answer is stored only on the charge of the model that wrote it
  const answerCall = calls.find((c) => c?.step === 'answer_generation') ?? calls[calls.length - 1];
  const answerModel = extractUsage(answerCall).model;

  return [...byModel.values()].map((u, i, all) => ({
    ...base,
    answer: u.model === answerModel ? fullAnswer : '',
    requestKey: all.length > 1 ? `${baseKey}-${i}` : baseKey,
    ...u,
  }));
}

// Ready-to-dispatch actions, one per charge
export function chargeActions(
  searchType: SearchType,
  prompt: string,
  usageSource: any,
  requestKey?: string,
  answer?: string
) {
  return buildChargeRequests(searchType, prompt, usageSource, requestKey, answer).map((request) =>
    WalletActions.chargeUsage({ request })
  );
}