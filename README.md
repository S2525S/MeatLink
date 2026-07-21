# MeatLink v2.2 完成版

## 今回の修正
- Order画面にAPI URL設定欄を追加
- AIから渡された注文候補をOrderへ自動入力
- OrderからApps Scriptへ注文送信
- SPREADSHEET_ID設定済みなら「注文履歴」シートへ保存
- Apps Scriptの doGet / doPost を整理し直し

## GitHub更新
1. ZIPを展開
2. GitHubの MeatLink リポジトリで Add file → Upload files
3. ZIP内の以下をアップロードして上書き
   - index.html
   - ai/index.html
   - order/index.html
   - api/MeatLink_API.gs
   - README.md
   - product-master-sample.csv
   - .nojekyll
4. Commit changes
5. GitHub Pages反映後に Ctrl + F5

## Apps Script更新
1. `api/MeatLink_API.gs` の内容でApps Scriptのコードを全置換
2. 保存
3. デプロイ → デプロイを管理 → 編集
4. 「新バージョン」を選んでデプロイ
5. ウェブアプリURLは同じものを使えます

## スクリプトプロパティ
- GEMINI_API_KEY: 既に設定したGemini APIキー
- GEMINI_MODEL: gemini-2.5-flash（任意）
- SPREADSHEET_ID: 注文保存先GoogleスプレッドシートID

スプレッドシートIDはURLの `/d/` と `/edit` の間です。

例:
`https://docs.google.com/spreadsheets/d/ここがID/edit`

## 最終テスト
1. AI画面で文章または画像を解析
2. MeatLink Orderへ送る
3. Order画面下部のAPI設定にApps Script URLを保存
4. 得意先名を入力
5. 注文を送信
6. 「注文履歴」シートに行が追加されれば完成
