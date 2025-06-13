interface UsageRecord {
  usage_date_utc: string;
  model_version: string;
  api_key: string;
  workspace: string;
  usage_type: string;
  usage_input_tokens_no_cache: string;
  usage_input_tokens_cache_write_5m: string;
  usage_input_tokens_cache_write_1h: string;
  usage_input_tokens_cache_read: string;
  usage_output_tokens: string;
  web_search_count: string;
}

interface UserUsage {
  user: string;
  totalCostUSD: number;
  totalCostJPY: number;
  modelBreakdown: {
    [modelName: string]: {
      inputTokens: number;
      outputTokens: number;
      cost: number;
    };
  };
}

const MODEL_PRICING = {
  'claude-3-5-haiku-20241022': {
    name: 'Claude Haiku 3.5',
    inputPrice: 0.80,
    outputPrice: 4.00,
    cacheWrite5mPrice: 1.00,
    cacheWrite1hPrice: 1.60,
    cacheReadPrice: 0.08
  },
  'claude-sonnet-4-20250514': {
    name: 'Claude Sonnet 4',
    inputPrice: 3.0,
    outputPrice: 15.0,
    cacheWrite5mPrice: 3.75,
    cacheWrite1hPrice: 6.00,
    cacheReadPrice: 0.30
  },
  'claude-opus-4': {
    name: 'Claude Opus 4',
    inputPrice: 15.0,
    outputPrice: 75.0,
    cacheWrite5mPrice: 18.75,
    cacheWrite1hPrice: 30.00,
    cacheReadPrice: 1.50
  },
  'claude-3-5-sonnet-20241022': {
    name: 'Claude 3.5 Sonnet',
    inputPrice: 3.0,
    outputPrice: 15.0,
    cacheWrite5mPrice: 3.75,
    cacheWrite1hPrice: 6.00,
    cacheReadPrice: 0.30
  }
};

const USD_TO_JPY_RATE = 150;

function extractUserFromApiKey(apiKey: string): string {
  if (apiKey.startsWith('claude_code_key_')) {
    const userPart = apiKey.replace('claude_code_key_', '').split('_')[0];
    return userPart.replace('-', ' ');
  }
  if (apiKey.includes('-api-key')) {
    return apiKey.replace('-api-key', '').replace('-', ' ');
  }
  return apiKey;
}

function calculateTokenCost(tokens: number, pricePerMillion: number): number {
  return (tokens / 1000000) * pricePerMillion;
}

interface DailyUsage {
  date: string;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  modelBreakdown: {
    [modelName: string]: {
      inputTokens: number;
      outputTokens: number;
      cost: number;
    };
  };
}

export function calculateUserUsage(records: UsageRecord[]): UserUsage[] {
  const userUsageMap = new Map<string, UserUsage>();

  records.forEach(record => {
    const user = extractUserFromApiKey(record.api_key);
    const modelVersion = record.model_version;
    const pricing = MODEL_PRICING[modelVersion as keyof typeof MODEL_PRICING];
    
    if (!pricing) {
      console.warn(`Unknown model version: ${modelVersion}`);
      return;
    }

    const inputTokensNoCache = parseInt(record.usage_input_tokens_no_cache) || 0;
    const inputTokensCacheWrite5m = parseInt(record.usage_input_tokens_cache_write_5m) || 0;
    const inputTokensCacheWrite1h = parseInt(record.usage_input_tokens_cache_write_1h) || 0;
    const inputTokensCacheRead = parseInt(record.usage_input_tokens_cache_read) || 0;
    const outputTokens = parseInt(record.usage_output_tokens) || 0;

    const inputCost = calculateTokenCost(inputTokensNoCache, pricing.inputPrice);
    const cacheWrite5mCost = calculateTokenCost(inputTokensCacheWrite5m, pricing.cacheWrite5mPrice);
    const cacheWrite1hCost = calculateTokenCost(inputTokensCacheWrite1h, pricing.cacheWrite1hPrice);
    const cacheReadCost = calculateTokenCost(inputTokensCacheRead, pricing.cacheReadPrice);
    const outputCost = calculateTokenCost(outputTokens, pricing.outputPrice);
    
    const totalCost = inputCost + cacheWrite5mCost + cacheWrite1hCost + cacheReadCost + outputCost;

    if (!userUsageMap.has(user)) {
      userUsageMap.set(user, {
        user,
        totalCostUSD: 0,
        totalCostJPY: 0,
        modelBreakdown: {}
      });
    }

    const userUsage = userUsageMap.get(user)!;
    userUsage.totalCostUSD += totalCost;
    userUsage.totalCostJPY = userUsage.totalCostUSD * USD_TO_JPY_RATE;

    if (!userUsage.modelBreakdown[pricing.name]) {
      userUsage.modelBreakdown[pricing.name] = {
        inputTokens: 0,
        outputTokens: 0,
        cost: 0
      };
    }

    const modelBreakdown = userUsage.modelBreakdown[pricing.name];
    modelBreakdown.inputTokens += inputTokensNoCache + inputTokensCacheWrite5m + inputTokensCacheWrite1h + inputTokensCacheRead;
    modelBreakdown.outputTokens += outputTokens;
    modelBreakdown.cost += totalCost;
  });

  return Array.from(userUsageMap.values()).sort((a, b) => b.totalCostUSD - a.totalCostUSD);
}

export function calculateUserDailyUsage(records: UsageRecord[], targetUser: string): DailyUsage[] {
  const dailyUsageMap = new Map<string, DailyUsage>();

  records
    .filter(record => extractUserFromApiKey(record.api_key) === targetUser)
    .forEach(record => {
      const date = record.usage_date_utc;
      const modelVersion = record.model_version;
      const pricing = MODEL_PRICING[modelVersion as keyof typeof MODEL_PRICING];
      
      if (!pricing) {
        console.warn(`Unknown model version: ${modelVersion}`);
        return;
      }

      const inputTokensNoCache = parseInt(record.usage_input_tokens_no_cache) || 0;
      const inputTokensCacheWrite5m = parseInt(record.usage_input_tokens_cache_write_5m) || 0;
      const inputTokensCacheWrite1h = parseInt(record.usage_input_tokens_cache_write_1h) || 0;
      const inputTokensCacheRead = parseInt(record.usage_input_tokens_cache_read) || 0;
      const outputTokens = parseInt(record.usage_output_tokens) || 0;

      const inputCost = calculateTokenCost(inputTokensNoCache, pricing.inputPrice);
      const cacheWrite5mCost = calculateTokenCost(inputTokensCacheWrite5m, pricing.cacheWrite5mPrice);
      const cacheWrite1hCost = calculateTokenCost(inputTokensCacheWrite1h, pricing.cacheWrite1hPrice);
      const cacheReadCost = calculateTokenCost(inputTokensCacheRead, pricing.cacheReadPrice);
      const outputCost = calculateTokenCost(outputTokens, pricing.outputPrice);
      
      const totalCost = inputCost + cacheWrite5mCost + cacheWrite1hCost + cacheReadCost + outputCost;
      const totalInputTokens = inputTokensNoCache + inputTokensCacheWrite5m + inputTokensCacheWrite1h + inputTokensCacheRead;

      if (!dailyUsageMap.has(date)) {
        dailyUsageMap.set(date, {
          date,
          cost: 0,
          inputTokens: 0,
          outputTokens: 0,
          modelBreakdown: {}
        });
      }

      const dailyUsage = dailyUsageMap.get(date)!;
      dailyUsage.cost += totalCost;
      dailyUsage.inputTokens += totalInputTokens;
      dailyUsage.outputTokens += outputTokens;

      if (!dailyUsage.modelBreakdown[pricing.name]) {
        dailyUsage.modelBreakdown[pricing.name] = {
          inputTokens: 0,
          outputTokens: 0,
          cost: 0
        };
      }

      const modelBreakdown = dailyUsage.modelBreakdown[pricing.name];
      modelBreakdown.inputTokens += totalInputTokens;
      modelBreakdown.outputTokens += outputTokens;
      modelBreakdown.cost += totalCost;
    });

  return Array.from(dailyUsageMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}