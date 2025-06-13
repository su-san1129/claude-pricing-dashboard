import React, { useState, useEffect } from 'react';
import './UserDetailModal.css';
import { calculateUserDailyUsage } from '../utils/costCalculator';

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

interface UserDetailModalProps {
  user: string;
  rawUsageData: UsageRecord[];
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, rawUsageData, onClose }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dailyData, setDailyData] = useState<DailyUsage[]>([]);

  useEffect(() => {
    const calculatedDailyData = calculateUserDailyUsage(rawUsageData, user);
    setDailyData(calculatedDailyData);
  }, [user, rawUsageData]);

  const getAggregatedData = () => {
    if (viewMode === 'daily') {
      return dailyData;
    }
    
    // 週毎・月毎の集計ロジック（簡易版）
    if (viewMode === 'weekly') {
      const weeklyData = dailyData.reduce((acc, day) => {
        const weekKey = getWeekKey(day.date);
        if (!acc[weekKey]) {
          acc[weekKey] = {
            date: weekKey,
            cost: 0,
            inputTokens: 0,
            outputTokens: 0,
            modelBreakdown: {}
          };
        }
        acc[weekKey].cost += day.cost;
        acc[weekKey].inputTokens += day.inputTokens;
        acc[weekKey].outputTokens += day.outputTokens;
        
        Object.entries(day.modelBreakdown).forEach(([model, breakdown]) => {
          if (!acc[weekKey].modelBreakdown[model]) {
            acc[weekKey].modelBreakdown[model] = { inputTokens: 0, outputTokens: 0, cost: 0 };
          }
          acc[weekKey].modelBreakdown[model].inputTokens += breakdown.inputTokens;
          acc[weekKey].modelBreakdown[model].outputTokens += breakdown.outputTokens;
          acc[weekKey].modelBreakdown[model].cost += breakdown.cost;
        });
        
        return acc;
      }, {} as { [key: string]: DailyUsage });
      
      return Object.values(weeklyData);
    }
    
    if (viewMode === 'monthly') {
      const monthlyData = dailyData.reduce((acc, day) => {
        const monthKey = day.date.substring(0, 7); // YYYY-MM
        if (!acc[monthKey]) {
          acc[monthKey] = {
            date: monthKey,
            cost: 0,
            inputTokens: 0,
            outputTokens: 0,
            modelBreakdown: {}
          };
        }
        acc[monthKey].cost += day.cost;
        acc[monthKey].inputTokens += day.inputTokens;
        acc[monthKey].outputTokens += day.outputTokens;
        
        Object.entries(day.modelBreakdown).forEach(([model, breakdown]) => {
          if (!acc[monthKey].modelBreakdown[model]) {
            acc[monthKey].modelBreakdown[model] = { inputTokens: 0, outputTokens: 0, cost: 0 };
          }
          acc[monthKey].modelBreakdown[model].inputTokens += breakdown.inputTokens;
          acc[monthKey].modelBreakdown[model].outputTokens += breakdown.outputTokens;
          acc[monthKey].modelBreakdown[model].cost += breakdown.cost;
        });
        
        return acc;
      }, {} as { [key: string]: DailyUsage });
      
      return Object.values(monthlyData);
    }
    
    return dailyData;
  };

  const getWeekKey = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const aggregatedData = getAggregatedData();

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{user}の詳細使用量</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="view-mode-selector">
          <button 
            className={viewMode === 'daily' ? 'active' : ''} 
            onClick={() => setViewMode('daily')}
          >
            日毎
          </button>
          <button 
            className={viewMode === 'weekly' ? 'active' : ''} 
            onClick={() => setViewMode('weekly')}
          >
            週毎
          </button>
          <button 
            className={viewMode === 'monthly' ? 'active' : ''} 
            onClick={() => setViewMode('monthly')}
          >
            月毎
          </button>
        </div>

        <div className="usage-detail-list">
          {aggregatedData.map((item, index) => (
            <div key={index} className="usage-detail-item">
              <div className="usage-detail-header">
                <h3>{item.date}</h3>
                <div className="usage-cost">
                  <span className="cost-usd">${item.cost.toFixed(2)}</span>
                  <span className="cost-jpy">¥{Math.round(item.cost * 150).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="usage-detail-summary">
                <div className="token-summary">
                  <span>入力: {item.inputTokens.toLocaleString()} トークン</span>
                  <span>出力: {item.outputTokens.toLocaleString()} トークン</span>
                </div>
              </div>

              <div className="model-breakdown-detail">
                <h4>モデル別内訳</h4>
                {Object.entries(item.modelBreakdown).map(([modelName, breakdown]) => (
                  <div key={modelName} className="model-detail-row">
                    <div className="model-name">{modelName}</div>
                    <div className="model-tokens">
                      <span>入力: {breakdown.inputTokens.toLocaleString()}</span>
                      <span>出力: {breakdown.outputTokens.toLocaleString()}</span>
                    </div>
                    <div className="model-cost">${breakdown.cost.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;