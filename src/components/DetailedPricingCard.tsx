import React from 'react';
import './DetailedPricingCard.css';

interface DetailedPricingCardProps {
  modelName: string;
  inputPrice: number;
  outputPrice: number;
  cacheWrite5mPrice?: number;
  cacheWrite1hPrice?: number;
  cacheReadPrice?: number;
  currency: string;
}

const DetailedPricingCard: React.FC<DetailedPricingCardProps> = ({
  modelName,
  inputPrice,
  outputPrice,
  cacheWrite5mPrice,
  cacheWrite1hPrice,
  cacheReadPrice,
  currency
}) => {
  return (
    <div className="detailed-pricing-card">
      <div className="detailed-pricing-card-header">
        <h3>{modelName}</h3>
      </div>
      <div className="detailed-pricing-card-body">
        <div className="price-section">
          <h4>基本料金</h4>
          <div className="price-item">
            <span className="price-label">入力トークン:</span>
            <span className="price-value">
              {currency}{inputPrice} / 1M tokens
            </span>
          </div>
          <div className="price-item">
            <span className="price-label">出力トークン:</span>
            <span className="price-value">
              {currency}{outputPrice} / 1M tokens
            </span>
          </div>
        </div>

        {(cacheWrite5mPrice || cacheWrite1hPrice || cacheReadPrice) && (
          <div className="price-section">
            <h4>キャッシュ料金</h4>
            {cacheWrite5mPrice && (
              <div className="price-item">
                <span className="price-label">キャッシュ書き込み (5分):</span>
                <span className="price-value">
                  {currency}{cacheWrite5mPrice} / 1M tokens
                </span>
              </div>
            )}
            {cacheWrite1hPrice && (
              <div className="price-item">
                <span className="price-label">キャッシュ書き込み (1時間):</span>
                <span className="price-value">
                  {currency}{cacheWrite1hPrice} / 1M tokens
                </span>
              </div>
            )}
            {cacheReadPrice && (
              <div className="price-item">
                <span className="price-label">キャッシュ読み込み:</span>
                <span className="price-value">
                  {currency}{cacheReadPrice} / 1M tokens
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedPricingCard;