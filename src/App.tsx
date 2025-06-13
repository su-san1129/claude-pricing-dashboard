import React, { useState } from 'react';
import './App.css';
import DetailedPricingCard from './components/DetailedPricingCard';
import FileUpload from './components/FileUpload';
import UsageGrid from './components/UsageGrid';
import { calculateUserUsage } from './utils/costCalculator';

const mockPricingData = [
  {
    modelName: 'Claude Opus 4',
    inputPrice: 15.00,
    outputPrice: 75.00,
    cacheWrite5mPrice: 18.75,
    cacheWrite1hPrice: 30.00,
    cacheReadPrice: 1.50,
    currency: '$'
  },
  {
    modelName: 'Claude Sonnet 4',
    inputPrice: 3.00,
    outputPrice: 15.00,
    cacheWrite5mPrice: 3.75,
    cacheWrite1hPrice: 6.00,
    cacheReadPrice: 0.30,
    currency: '$'
  },
  {
    modelName: 'Claude Haiku 3.5',
    inputPrice: 0.80,
    outputPrice: 4.00,
    cacheWrite5mPrice: 1.00,
    cacheWrite1hPrice: 1.60,
    cacheReadPrice: 0.08,
    currency: '$'
  }
];

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

function App() {
  const [usageData, setUsageData] = useState<any[]>([]);
  const [rawUsageData, setRawUsageData] = useState<UsageRecord[]>([]);
  const [showUsage, setShowUsage] = useState(false);

  const handleDataLoaded = (data: UsageRecord[]) => {
    const calculatedUsage = calculateUserUsage(data);
    setUsageData(calculatedUsage);
    setRawUsageData(data);
    setShowUsage(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Claude Pricing Monitor</h1>
        <p>Monitor and track Claude API pricing and usage</p>
      </header>
      <main>
        <div className="pricing-dashboard">
          <h2>Current Pricing</h2>
          <div className="detailed-pricing-grid">
            {mockPricingData.map((pricing, index) => (
              <DetailedPricingCard
                key={index}
                modelName={pricing.modelName}
                inputPrice={pricing.inputPrice}
                outputPrice={pricing.outputPrice}
                cacheWrite5mPrice={pricing.cacheWrite5mPrice}
                cacheWrite1hPrice={pricing.cacheWrite1hPrice}
                cacheReadPrice={pricing.cacheReadPrice}
                currency={pricing.currency}
              />
            ))}
          </div>
          
          <div className="upload-section">
            <h2>Usage Analysis</h2>
            <p>CSVファイルをアップロードして、ユーザー別の使用料金を分析できます</p>
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>

          {showUsage && (
            <div className="usage-section">
              <h2>使用料金分析結果</h2>
              <UsageGrid usageData={usageData} rawUsageData={rawUsageData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
