import React, { useRef } from 'react';
import Papa from 'papaparse';
import './FileUpload.css';

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

interface FileUploadProps {
  onDataLoaded: (data: UsageRecord[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data as UsageRecord[];
        onDataLoaded(data.filter(record => record.usage_date_utc && record.model_version));
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('CSVファイルの解析中にエラーが発生しました');
      }
    });
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  return (
    <div className="file-upload-container">
      <div 
        className="file-upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">📁</div>
        <p>CSVファイルをここにドラッグ&ドロップするか、クリックして選択してください</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default FileUpload;