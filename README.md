# MeatFlow AI Reception v0.1

FAX画像・PDF・注文文を、端末内OCR → Gemini（任意）→ 編集可能な注文データへ変換する独立Webアプリです。画像そのものをApps Scriptへ送らないため、従来のFAXタイムアウト経路を排除しています。

## 配置
1. このフォルダの `index.html / app.js / styles.css / config.js` を新しいGitHub Pagesリポジトリへ配置。
2. HTTPSで開く。初回OCR時のみTesseract日本語データを取得します。
3. 右上「設定」でMeatFlow URLを確認し、商品マスターCSVを読み込む。

## Geminiを使う（推奨）
1. 新しいApps Scriptプロジェクトに `AppsScript_AI_Proxy.gs` を貼り付ける。
2. スクリプトプロパティ `GEMINI_API_KEY` を設定。
3. `testGemini` を1回実行して権限承認。
4. Webアプリとして「自分として実行」「アクセスできるユーザー: 全員」でデプロイ。
5. 発行URLをAI受注画面の「AI解析API URL」に保存。

OCRはブラウザ、Geminiへ送るのは抽出文字だけです。APIが未設定・失敗時は端末内の簡易解析へ自動フォールバックします。

## MeatFlow連携
AI受注と既存MeatFlowを同じGitHub Pagesオリジン（例: `https://s2525s.github.io/...`）に配置してください。
既存MeatFlowの `app.js` に `MeatFlow_receiver_patch.js` の関数を追加し、bootstrap成功後（商品一覧描画後）に `importMeatFlowAiTransfer();` を1回呼びます。
「MeatFlowへ送る」はlocalStorageへ注文候補を保存してMeatFlowを開くだけで、発注処理は行いません。

## 商品マスターCSV
列名: `productCode, productName, displayName, defaultUnit`
候補選択の修正は端末内localStorageへ学習され、同じOCR表記の候補順位に反映されます。

## 注意
- AI/OCR結果は必ず人が確認してください。
- 端末内データを削除すると商品マスターと学習結果も消えます。
- CDN利用のため初回起動にはインターネット接続が必要です。
