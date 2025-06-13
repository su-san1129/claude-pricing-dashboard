import React from 'react';
import PricingCard from './PricingCard';
import './PricingGrid.css';

interface PricingData {
  modelName: string;
  inputPrice: number;
  outputPrice: number;
  currency: string;
}

interface PricingGridProps {
  pricingData: PricingData[];
}

const PricingGrid: React.FC<PricingGridProps> = ({ pricingData }) => {
  return (
    <div className="pricing-grid">
      {pricingData.map((pricing, index) => (
        <PricingCard
          key={index}
          modelName={pricing.modelName}
          inputPrice={pricing.inputPrice}
          outputPrice={pricing.outputPrice}
          currency={pricing.currency}
        />
      ))}
    </div>
  );
};

export default PricingGrid;