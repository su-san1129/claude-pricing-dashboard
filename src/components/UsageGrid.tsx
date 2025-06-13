import React from 'react';
import UsageCard from './UsageCard';
import './UsageGrid.css';

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

interface UsageGridProps {
  usageData: UserUsage[];
  rawUsageData: UsageRecord[];
}

const UsageGrid: React.FC<UsageGridProps> = ({ usageData, rawUsageData }) => {
  const totalCostUSD = usageData.reduce((sum, usage) => sum + usage.totalCostUSD, 0);
  const totalCostJPY = totalCostUSD * 150;

  return (
    <div className="usage-grid-container">
      <div className="usage-summary">
        <h3>合計使用料金</h3>
        <div className="summary-costs">
          <div className="summary-usd">${totalCostUSD.toFixed(2)}</div>
          <div className="summary-jpy">¥{Math.round(totalCostJPY).toLocaleString()}</div>
        </div>
      </div>
      <div className="usage-grid">
        {usageData.map((usage, index) => (
          <UsageCard key={index} usage={usage} rawUsageData={rawUsageData} />
        ))}
      </div>
    </div>
  );
};

export default UsageGrid;