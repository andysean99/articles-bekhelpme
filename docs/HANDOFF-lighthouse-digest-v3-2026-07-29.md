# Handoff Packet — 燈塔文摘上線 **v3**
**日期**：2026-07-29 ｜ **狀態**：已交付上線，剩三項人工收尾
**承接**：`HANDOFF-量測與開發紀律-v2-2026-07-29.md`

---

## 一句話

v2 的「燈塔文摘投稿」項目卡在一個不存在的 blocker 上；驗證後那個 blocker 是發明的，於同日用 agentic team 產線把文章編譯成 articles.bekhelpme.com 上第一個重軌 digest，繁簡兩條 route 已上線。

---

## 已完成

**上線交付**
- `articles.bekhelpme.com/measuring-the-half-ai-does-better`（繁體，公開）
- `articles.bekhelpme.com/measuring-the-half-ai-does-better-cn`（簡體，獨立 slug，兩版之間刻意不放語言切換連結）
- main commit `6fb3e32`；`lib/digests.ts` 兩筆、`public/llms.txt` 兩行、進 sitemap 與首頁
- 21 條來源全數 verified，48 個 `.ent` 皆帶真 href（GEO 引用圖譜）
- 21 張 popup 導覽卡、3 張 inline SVG 圖表（過 dataviz 雙主題 validator）

**產線資產（`andysean99/articles-bekhelpme`，`docs/` 與 `work/`）**
- `docs/team-blueprint-lighthouse-digest-measuring.md` v1.1 — 完整藍圖含 §10 交付結果與失誤檢討
- `docs/spawn-prompts-lighthouse-digest-measuring.md` — 六個成員可直接複製的 spawn prompts
- `work/bootstrap/` — 可重用模組（design-system.css、**已改為 href+data-url 的 popup.js**、modal.html、constitution.md）
- `scripts/verify_verbatim.py` — 逐句鎖定檢查器，雙向煙霧測過
- `work/scripts/opencc_convert.py` — 簡體轉換，含 URL 保護 ＋ **五詞覆寫表**
- `work/checks/checker-report.md` — 全機器檢查原始輸出
- `work/sources/` — 21 條來源證據 ＋ 9 筆覆核紀錄
- `work/eval-scoreboard-append-2026-07-29.json` — 10 列路由證據

---

## 三項人工收尾（工具做不到，不是忘記）

| 項目 | 為什麼需要人 |
|---|---|
| **① 開兩個網址確認**（帶 `?x=1`） | 本環境對外全數封鎖：WebFetch 403、curl `000`。上線狀態無法自我驗證 |
| **② Drive scoreboard 換版** | `create_file` 無 fileId，只能新建。硬寫會產生同名 fork。**已合併好的 24 列檔案已直接送出**，用「管理版本 → 上傳新版本」，保留 file ID `1ISyGXhj…` |
| **③ 刪兩份 stale 檔** | Drive 工具無 delete。`1Ek4XZFgCX_GPBNl_QKAICgeAcsfzg76m`（v0.1 skill）、`1tw3idf0-bop8_pksLYEOAd8GKQHCzSGj`（07-23 scoreboard fork，在「Bekhelpme websites」資料夾，**不是** `00_System/AI/` 那份） |

**Phase 5 的「scoreboard 已回寫」在 ② 完成前是未通過的。**不記為完成。

---

## 關鍵決策與理由（不要在下一輪重新爭論）

| 決策 | 理由 |
|---|---|
| 用 subagent pipeline，不組 agent team | 三重門檻只滿足兩個——沒有成員需要互相對話，打回一律經 orchestrator。team 成本線性 |
| 來源查證用 exemplar-corpus 合約而非 executable | 環境對外 HTTP 全數 403，無 HTTP 200 可驗，只能用 WebSearch 交叉比對 |
| 公開版 `.ent` 必須 href ＋ data-url 並存 | 原型刻意不放 href 是為 claude.ai Artifact 檢視器；本案相反，href 就是引用圖譜。**照抄原型會廢掉全篇 SEO** |
| popup.js 移除原型的 Enter 鍵 handler | 真 `<a href>` 瀏覽器自動把 Enter 轉 click，保留會讓 modal 觸發兩次 |
| CoffeeCopy 的場景鉤子與核心比喻明文豁免 | METR 的 39 個百分點落差本身即是鉤子，改寫會弱化 |
| 簡體版用 tw2sp ＋ 五詞覆寫，不退回 tw2s | tw2sp 的七類詞彙替換（程式碼→代码等）正確且必要；只有五個詞需覆寫 |
| M-06 盲測升級為 Opus 5 | 憲章要求 grader ≠ worker 模型；M-02 是 Sonnet，輸入剝離只是代償 |
| 導覽卡不得從文章推導 | 循環接地：卡片存在是為了讓讀者拿文章對照來源 |

---

## 未解決 / 下一步

| 項目 | 狀態 | 卡在哪 |
|---|---|---|
| 三項人工收尾 | 見上 | 工具能力限制 |
| 379 條規模的來源庫導覽卡（若未來做大型 digest） | 未做 | 本次 21 條，原型 379 條只做了 71 張 |
| `verify_verbatim.py` 抽成共用工具 | 未做 | 目前綁在 articles repo；下一篇重軌可直接沿用 |
| propagation check | **建議新增** | 見下 |

---

## 給接手者的四個提醒

**一、三個 E1 全部在證據等級附註，正文 107 句零錯誤。**
附註寫的是「這個證據多可靠」——關於來源方法論的二階陳述，最容易憑印象寫、最少被回頭核對。Gartner 那條最說明問題：原文寫「非嚴格抽樣」是為了降低讀者信任，卻反而**假設了一個不存在的方法論基礎**（真相是連抽樣都沒有）。**過度寬容的批評也是一種錯誤。**

**二、下一版 spec 要加 propagation check。**
本輪 orchestrator 五個失誤裡，兩個是同一類：上游改了、下游沒重生成（漏派 Gartner 卡片修正；CN route 用舊 HTML 產生）。每個 agent 的產出都有檢查，但**沒有任何檢查在看依賴鏈是否全部重跑**。依賴鏈是 `article.md → digest.html → digest-cn.html → route.ts ×2`。

**三、寫給 agent 的規格也會被 Goodhart 化。**
另外兩個失誤是把判斷壓縮成一個看起來精確的規格：「independently-worded」（agent 讀成措辭不同，字面成立）、「40–70 字」（連原型自己都達不到）。第五個是 `grep -c` 算行數不算次數。**每次寫下一個數字或一個詞當檢查標準時，先問它可以被字面滿足而違反意圖嗎。**

**四、Haiku audition 通過，這是本輪唯一的新路由證據。**
`i18n-convert × haiku` 首試通過合約檢查，成本約 Sonnet 同類工作的三分之一。兩次重跑都不是它的錯（上游變更、我指定的 tw2sp 配置）。**結論：機械性且檢查完全機器化的任務可路由給 Haiku。**另六個 task_type 從無歷史變成 n=1，皆標冷啟動。

---

## 第一個動作

**動作**：開 `https://articles.bekhelpme.com/measuring-the-half-ai-does-better?x=1`，確認頁面出得來、點一個來源會彈導覽卡、底部 21 條來源庫在。
**時間**：______（填具體時間，不是「等一下」）

若 404 且重試一分鐘後仍 404 → Vercel 專案未接到 main 或建置失敗，回報給有 repo 權限的 session 處理。

**未填不算交接完成。**
