# 憲章 — 燈塔文摘〈我們正在衡量 AI 已經做得比人好的那一半〉

於 Gate G1 由 Bek 於 2026-07-29 批准（選項 A，全部 14 條生效）。
每個成員在第一個動作之前讀完本檔。有疑義走 ESCALATE，不要自行詮釋。

## 素材保護

- **C-01** 本文每個論點句與數字逐字出現在成品。
  檢查：`python3 scripts/verify_verbatim.py work/bootstrap/article.md <成品>` 差異數 0。
  唯一授權改動：GitClear 起始年份 2021 → 2020（已套用於 `article.md`，見藍圖 §9）。
- **C-02** CoffeeCopy 的「開頭場景鉤子」與「一貫核心比喻」兩條**明文豁免**。
  理由：METR 的 39 個百分點落差本身即是鉤子，改寫成場景故事會弱化。
  豁免**不擴及**其他 CoffeeCopy 條款——敘事段落零 bullet、專有名詞首次出現給一句白話、
  每張圖表配一句文字 Takeaway，全部照跑。
- **C-03** 證據等級附註（文末九條）為最高保護級：不改寫、不摺疊進 `<details>`、
  不移出主流程。這是目標讀者第一個要找的東西。

## 來源查證

- **C-04** 九件待查產出以**兩次獨立措辭**的 WebSearch 交叉驗證；標題／作者／年份與文中
  描述相符才算過。**禁止生成、猜測、或補全 URL。**
  本環境對外 HTTP 全數 403，你無法點開驗證——這正是編造 URL 的壓力來源，也正是本條存在的理由。
- **C-05** 查不到的來源**不掛連結**，標 `<span class="unverified">未查證</span>`，識別碼照留。
  status 只有 `verified` 與 `unverified` 兩個值，**沒有第三種狀態**。
  用首頁、相似文章、或二手報導頂替 = 視同捏造。
- **C-06** 導覽卡每個描述性子句必須能對應到來源原文。找不到對應就**刪除該子句**，
  不得改寫成較弱的說法。動詞強度須與來源一致：
  allege／claim／predict／estimate／poll **不得**變成 認定／證實／將會／顯示。
  預測不是發現。民調不是研究。預印本不是同儕審查文獻。
  （前科：曾有 subagent 把「訴訟指控」寫成「法院認定侵權」。）
- **C-07** `work/bootstrap/confirmed-urls.md` 的條目逐字沿用，不重查、不改寫。

## 工程

- **C-08** 公開版每個 `.ent` 同時有 `href` 與 `data-url`，兩者字串相同。
  檢查：`grep -c 'class="ent"'` = `grep -c 'data-url'` = `grep -co 'class="ent" href='`。
  原型刻意不放 href（為 Artifact 檢視器所寫），**本案相反**——href 就是 GEO 引用圖譜。
- **C-09** canEmbed 白名單只含 `(^|\.)bekhelpme\.com$|^localhost$|^127\.|^$`，不得放寬。
- **C-10** 深色主題三處定義齊備（`:root`／`@media prefers-color-scheme: dark`／
  `[data-theme=dark]`）；圖表配色先過 dataviz skill 的雙主題 validator。
- **C-11** `route.ts` 內嵌 HTML 與源 HTML 逐位元組相同，唯一允許差異 =
  `make_digest_route.py` 注入的 meta 區塊。
- **C-12** 簡體版轉換**前**先用 regex 把所有 URL 換成佔位符、轉完還原；
  URL 集合與繁體版逐字元相同；`lang="zh-Hans"`；「拷贝」→「复制」；
  兩版之間不放語言切換連結。
- **C-13** `npx next build` 輸出含 `○ /measuring-the-half-ai-does-better` 與
  `○ /measuring-the-half-ai-does-better-cn`，且首頁與 sitemap 含新文章。

## 紀律

- **C-14** **無自我回報。**「完成」由 checker 執行的檢查決定，你的「done」不會被閱讀。
  checker 抽查「怎麼過的」不只看「有沒有過」：隱藏元素湊數、空殼 SVG、
  修改檢查腳本本身，一律計為 gaming，該成員本輪所有產出全部重驗。
  **orchestrator 自己的產出同樣受檢，沒有職級豁免。**

## ESCALATE（停手上報，不自行決定）

- **E1** 來源說的與文章寫的不符（數字、年份、誰說的）→ 上報。**永遠不要修改文章。**
- **E2** 兩次查詢對同一來源回傳不同 URL。
- **E3** 導覽卡需要「推論」才寫得出來——來源沒明說的一律不寫。
- **E4** 逐句 diff 差異數 > 0 且原因不明。
- **E5** 任一 MUST 與 PREFER 衝突。

## Stop Condition

M6 部署完成即停止。不處理本專案以外的待辦。不主動新增日文版。
不修改文章內容——**包括看起來明顯的錯誤**（走 E1）。

## 打回與申訴

check 失敗 → 你會收到**原始失敗輸出** → 1 次知情重試 → 再失敗代表 spec 壞了，
由 orchestrator 改 spec，不准盲目重試第三次。
你認為 checker 判錯 → 帶證據向 orchestrator 申訴，不要默默照做。checker 也會被糾正。
同一問題卡 3 次 → 停手上報。
