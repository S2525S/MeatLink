# MeatLink v2.0

## このZIPでできること
- MeatLinkトップ
- MeatLink Order
  - 得意先、納品日、商品、数量入力
  - AI画面から注文候補を受け取り
  - Apps Script APIへ注文送信
- MeatLink AI
  - 画像OCR（Tesseract.js）
  - PDF文字抽出、画像PDFの1ページ目OCR
  - 文章入力
  - API未設定時の簡易解析
  - Gemini APIを使った構造化解析
  - 商品マスターCSV読込
- Apps Script
  - Gemini解析
  - 注文履歴をスプレッドシートへ保存

## 最短の設置手順
1. ZIPを展開。
2. GitHubの MeatLink リポジトリで「Add file」→「Upload files」。
3. ZIP内の `index.html`、`order`、`ai` をドラッグして上書きし、Commit changes。
4. GitHub Pagesの反映を待ち、以下を確認。
   - `/MeatLink/`
   - `/MeatLink/order/`
   - `/MeatLink/ai/`

## Apps Script設定
1. 新しいApps Scriptプロジェクトを作成。
2. `api/MeatLink_API.gs` の内容を貼り付け。
3. プロジェクトの設定 → スクリプト プロパティ:
   - `GEMINI_API_KEY`: Google AI Studioで発行したキー
   - `GEMINI_MODEL`: `gemini-2.5-flash`（省略可）
   - `SPREADSHEET_ID`: 注文保存先スプレッドシートID（省略可）
4. デプロイ → 新しいデプロイ → ウェブアプリ。
   - 実行するユーザー: 自分
   - アクセスできるユーザー: 全員
5. 発行URLをMeatLink AIの「MeatLink API URL」へ貼り付け、保存。
6. 同じURLはブラウザのlocalStorageに保存されるため、Order画面でも利用されます。

## 商品マスターCSV
列名:
`code,name,unit,price`

例:
`P001,和牛ロース,kg,5000`

日本語列名 `商品CD,商品名,単位,価格` でも読み込めます。

## 注意
- OCRは端末内ブラウザで実行するため、初回はライブラリ読込に時間がかかります。
- PDFは先頭5ページの文字を抽出します。画像PDFは先頭1ページをOCRします。
- Gemini APIキーはGitHubへ書かず、Apps Scriptのスクリプトプロパティに保存してください。
- AI結果は必ず人が確認してから注文送信してください。
