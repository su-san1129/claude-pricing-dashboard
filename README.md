# Claude Pricing Monitor

Claude API の料金監視・分析ツールです。CSVファイルをアップロードして、ユーザー別の使用料金を分析できます。

## 機能

- **料金表示**: Claude各モデルの現在の料金を表示
- **CSV分析**: 使用量CSVファイルをアップロードしてユーザー別料金を分析
- **料金計算**: 入力・出力トークン数から自動的に料金を計算（USD・円表示）
- **モデル別内訳**: ユーザーごとにどのモデルをどれだけ使用したかを詳細表示

## Docker での起動方法

### 1. Docker Compose で起動（推奨）

```bash
# ビルドして起動
docker-compose up -d

# ログ確認
docker-compose logs -f

# 停止
docker-compose down
```

### 2. npm scripts を使用

```bash
# Docker イメージをビルド
npm run docker:build

# コンテナを起動
npm run docker:up

# ログを確認
npm run docker:logs

# コンテナを停止
npm run docker:down
```

アプリケーションは http://localhost:3000 でアクセスできます。

## 開発環境での起動

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm start
```

## CSVファイル形式

以下の形式のCSVファイルをアップロードしてください：

```csv
usage_date_utc,model_version,api_key,workspace,usage_type,usage_input_tokens_no_cache,usage_input_tokens_cache_write_5m,usage_input_tokens_cache_write_1h,usage_input_tokens_cache_read,usage_output_tokens,web_search_count
2025-06-12,claude-3-5-haiku-20241022,claude_code_key_user_abc,Claude Code,standard,8,0,0,0,1,0
```

## 対応モデル

- Claude 3.5 Haiku
- Claude Sonnet 4
- Claude 3 Opus  
- Claude 3.5 Sonnet

## 技術スタック

- React 18 + TypeScript
- Docker + Nginx
- Papa Parse (CSV解析)
- CSS3 (レスポンシブデザイン)