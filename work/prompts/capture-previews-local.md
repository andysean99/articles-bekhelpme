# 本機執行 prompt — 幫兩篇 digest 拍來源截圖（貼進本機 Claude Code 即可）

背景：articles.bekhelpme.com 的 popup 已支援「截圖預覽」——但截圖必須在
**有對外網路的機器**上拍（雲端 session 出口全封鎖，拍不了）。這個 prompt
在 Bek 的本機跑一次，21 個來源的截圖就永久生效，「blocked」畫面從此消失。

---

幫我完成 articles-bekhelpme 的來源截圖，全自動，做完給驗證報告：

1. 進 `C:\dev\articles-bekhelpme`，`git pull` 確認在 main 且包含
   `scripts/capture-previews.mjs`（沒有就停下來回報）。
2. `npm ci`，然後 `npx playwright install chromium`（只第一次需要）。
3. `node scripts/capture-previews.mjs` —— 它會：
   - 探測 21 個來源的 X-Frame-Options/CSP，回寫兩頁的 `noframeHosts` 名單
   - 對非 PDF 來源各拍一張截圖存到 `public/previews/`（PDF 由瀏覽器內建檢視器顯示，跳過）
   - 回寫兩頁的 `previewShots` JSON
   腳本結尾若列出 failures，逐條抄進報告——那些來源會維持導覽卡＋開新分頁，不擋上線。
4. 驗證：`npm run build` 必須綠；`git diff --stat` 應只動兩個 route.ts 與
   `public/previews/`；截圖檔數 = 21 − PDF 數 − failures 數。
5. 全過就 commit（訊息：`Add source screenshot previews for the measuring digest`）
   並 push 到 main。任何一步失敗就停下來回報，不要硬推。

報告要含：截圖張數與總 KB、noframeHosts 名單、failures 清單、build 結果、push 的 commit hash。
