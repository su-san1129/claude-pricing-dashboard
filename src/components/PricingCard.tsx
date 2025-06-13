import React from 'react';
import './PricingCard.css';

interface PricingCardProps {
  modelName: string;
  inputPrice: number;
  outputPrice: number;
  currency: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  modelName,
  inputPrice,
  outputPrice,
  currency
}) => {
  return (
    <div className="pricing-card">
      <div className="pricing-card-header">
        <h3>{modelName}</h3>
      </div>
      <div className="pricing-card-body">
        <div className="price-item">
          <span className="price-label">Input:</span>
          <span className="price-value">
            {currency}{inputPrice.toFixed(2)} / 1M tokens
          </span>
        </div>
        <div className="price-item">
          <span className="price-label">Output:</span>
          <span className="price-value">
            {currency}{outputPrice.toFixed(2)} / 1M tokens
          </span>
        </div>
      </div>
    </div>
  );
};

export default PricingCard;