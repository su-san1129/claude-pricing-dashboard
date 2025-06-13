import React, { useState } from 'react';
import './UsageCard.css';
import UserDetailModal from './UserDetailModal';

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

interface UsageCardProps {
  usage: UserUsage;
  rawUsageData: UsageRecord[];
}

const UsageCard: React.FC<UsageCardProps> = ({ usage, rawUsageData }) => {
  const [showDetail, setShowDetail] = useState(false);

  const handleCardClick = () => {
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
  };

  return (
    <>
      <div className="usage-card clickable" onClick={handleCardClick}>
      <div className="usage-card-header">
        <h3>{usage.user}</h3>
        <div className="total-cost">
          <div className="cost-usd">${usage.totalCostUSD.toFixed(2)}</div>
          <div className="cost-jpy">¥{Math.round(usage.totalCostJPY).toLocaleString()}</div>
        </div>
      </div>
      <div className="usage-card-body">
        <h4>モデル別内訳</h4>
        {Object.entries(usage.modelBreakdown).map(([modelName, breakdown]) => (
          <div key={modelName} className="model-breakdown">
            <div className="model-name">{modelName}</div>
            <div className="model-details">
              <div className="token-info">
                <span>入力: {breakdown.inputTokens.toLocaleString()} トークン</span>
                <span>出力: {breakdown.outputTokens.toLocaleString()} トークン</span>
              </div>
              <div className="model-cost">
                ${breakdown.cost.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    {showDetail && (
      <UserDetailModal
        user={usage.user}
        rawUsageData={rawUsageData}
        onClose={handleCloseDetail}
      />
    )}
    </>
  );
};

export default UsageCard;