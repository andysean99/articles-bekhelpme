# 燈塔文摘 · 〈我們正在衡量 AI 已經做得比人好的那一半〉 — Agentic Team Blueprint

> 版本：v1.1 ｜ 日期：2026-07-29 ｜ 環境：Claude Code on the web（remote container）
> 狀態：**已交付並上線**。G1／G3／G4／G5 全數批准，main `6fb3e32`。
> 未完成項：scoreboard 回寫 Drive 正本（工具無就地更新能力）、兩份 stale 檔刪除（工具無刪除能力）——皆需人工。

---

## 1. 目標宣言（G1 已於 2026-07-29 批准，選項 A）

- **Goal**：把已完稿的評論文章〈我們正在衡量 AI 已經做得比人好的那一半〉編譯成 `articles.bekhelpme.com` 上第一個重軌燈塔文摘（自包含互動 HTML），繁體公開版 ＋ 簡體版兩條 route，並讓「查證來源」這個動作在頁面內就能完成。
- **成功標準**
  1. `/measuring-the-half-ai-does-better` 與 `/measuring-the-half-ai-does-better-cn` 兩條 route 上線可讀，並進入首頁、`sitemap.xml`、`llms.txt`
  2. 文中所有外部來源全數列出；查證通過者可點且掛導覽卡，未通過者明標 `unverified` — **沒有第三種狀態**
  3. 文章本體逐句 diff = 0（授權例外 3 筆，見 §9 exception log）
- **交付物**：`app/<slug>/route.ts`、`app/<slug>-cn/route.ts`、`lib/digests.ts` 兩筆登記、`public/llms.txt` 兩行、源檔 `digest.html` / `digest-cn.html`、本藍圖、spawn prompts。
- **最終讀者**：一位讀完文章後打算引用其中某個數字去說服自己老闆的工程主管。他做的第一件事是點開來源核對。**這篇文章的全部價值，在他點下去的那一秒結算。**
- **硬限制**：文章逐字鎖定；禁止生成 URL；素材只有文章 ＋ 外部來源（兩份研究報告與 doT 案例明確排除）；本環境對外 HTTP 全數 403，只能用 WebSearch 查證；Google Drive 工具無刪除、無就地更新能力。

### Stop Condition（防漂移）

M6 push 完成、兩條 route 線上可讀、scoreboard append 檔產出、stale 清單交付即**停止**。不處理 handoff 的其他未解項目。不主動新增日文版。不修改文章內容——包括看起來明顯的錯誤（改動一律走 E1 上報）。

## 1b. 憲章（14 條，G1 已批准）

| # | 條款 | 驗證方式 |
|---|---|---|
| C-01 | 本文每個論點句與數字逐字出現在成品 | 正規化空白後逐句 diff，差異數 = 0（唯一例外見 §9） |
| C-02 | CoffeeCopy「場景鉤子開頭」與「一貫核心比喻」明文豁免；其餘 CoffeeCopy 條款照跑 | 人工核對；豁免理由記錄在案，不擴及其他條款 |
| C-03 | 證據等級附註為最高保護級：不改寫、不摺疊、不移出主流程 | `grep` 確認附註九條全在 `<section>` 主流程內，非 `<details>` |
| C-04 | 九個待查來源以兩次獨立 WebSearch 交叉驗證，標題／作者／年份相符才算過。**禁止生成 URL** | `work/sources/*.json` 每條含 `evidence: [{query, url, matched_fields}]` 兩筆；M-05 抽 30% 重查 |
| C-05 | 查不到的來源不掛連結，標 `<span class="unverified">未查證</span>`，識別碼照留 | 來源庫每條 status ∈ {verified, unverified}，無第三值 |
| C-06 | 導覽卡每個描述性子句可對應到來源原文；動詞強度與來源一致（allege/claim/predict ≠ 認定/證實/將會） | M-06 盲測抽樣；找不到對應的子句刪除而非改寫 |
| C-07 | handoff v2 的九個已確認 URL 逐字沿用，不重查、不改寫 | `work/sources/*.json` 標 `source: "handoff-v2"` |
| C-08 | 公開版每個 `.ent` 同時有 `href` 與 `data-url` 且字串相同 | `grep -c 'class="ent"'` = `grep -c 'data-url'` = `grep -co 'class="ent" href='` |
| C-09 | canEmbed 白名單只含 `(^\|\.)bekhelpme\.com$\|^localhost$\|^127\.\|^$` | 字串比對 |
| C-10 | 深色主題三處定義齊備（`:root` / `@media` / `[data-theme=dark]`）；圖表配色過 dataviz 雙主題 validator | grep 三處 ＋ validator 輸出 |
| C-11 | route.ts 內嵌 HTML 與源 HTML 逐位元組相同，唯一差異 = 腳本注入的 meta 區塊 | 抽出內嵌段落與源檔 `diff` |
| C-12 | 簡體版轉換前 URL 換佔位符、轉完還原；URL 集合與繁體版逐字元相同；`lang="zh-Hans"`；無語言切換連結 | `grep -o 'https\?://[^"]*' \| sort` 兩檔 diff 為空 |
| C-13 | `npx next build` 輸出含兩條 route，且首頁與 sitemap 含新文章 | build log grep |
| C-14 | 無自我回報。完成由 checker 執行的檢查決定；checker 抽查「怎麼過的」；orchestrator 產出同樣受檢 | M-05 抽查 ＋ M-06 盲測 ＋ orchestrator 產出由 M-05 覆核 |

**受保護素材清單**（逐字 machine-check）
1. 文章全文 146 行（Drive `1lW5c6aQY67CMRXOBA7SwwfGsjDhtT6B_`）
2. 證據等級附註九條（原文 139–146 行）— 最高保護級
3. handoff v2 的九個已確認 URL 字串

**來源盤點**（G4 產出定版清單，以下為開工前估計）
- **已確認 10 個**：handoff v2 的九個（τ-bench、DORA、Pragmatic Engineer、Laura Tacho、Goodhart 案例、Palantir Dev vs Delta、OpenAI FDE、philschmid pass^k、DX Core 4）＋ GitClear（orchestrator 2026-07-29 以兩次獨立查詢驗證，`gitclear.com/ai_assistant_code_quality_2025_research`，證據記入 `work/sources/orchestrator.json`，仍受 M-05 抽查）
- **待查 8 個來源 / 9 件產出**：METR（論文＋2026-02 公告）、SPACE、Anthropic evals、Böckeler、RAND、Gartner、MIT NANDA、McGrew
- 合計約 18 條，文章正文另有數個不需外連的提及（如 McKinsey 2023、Kent Beck）由 G4 裁定是否入庫

## 2. 研究發現 → 編制決策

| # | 關鍵發現 | 對編制的影響 |
|---|---|---|
| 1 | **WebFetch 對外全數 403**（arxiv.org、gitclear.com 兩網域實測；proxy `enabled:true, selective:false`；fu-chin HANDOFF 坑 #4 同載）。WebSearch 可用（走 Anthropic 檢索、不經 proxy） | 來源查證**不能**用 executable check（無 HTTP 200 可驗）。M-01 的驗證合約必須是 **exemplar-corpus 型**：兩次獨立查詢交叉比對 ＋ M-05 抽樣重查。這是全案最大的合約型態決策 |
| 2 | **原型 `.ent` 刻意無 `href`**（fu-chin HANDOFF §4.1、坑 #1）——為 claude.ai Artifact 檢視器所寫 | 移植時必須**反向改寫**成 href ＋ data-url 並存。照抄即廢掉全篇 GEO。C-08 為此獨立成條，M-05 有專屬檢查 |
| 3 | **原型 175KB、noindex、部署在 www 站、用 `regen_route.py`** | 我們走 articles 站、公開、用 `make_digest_route.py`。**兩支腳本不可混用。**且 M-03 不得整檔讀取原型（context 風險）→ orchestrator 先抽模組成 bootstrap |
| 4 | **原型已有 `digest-cn.html`** ＋ 含日文 URL 被轉字的實戰教訓 | 簡體版不是從零，是照既有流程重跑 → 可降檔給 Haiku 當 audition，且檢查完全機器化 |
| 5 | **`lib/digests.ts` 陣列為空** | 本站第一個重軌 digest，登記路徑未被走過 → C-13 必須實際跑 build 驗證，不能假設 |
| 6 | **scoreboard 有 `research-web × sonnet` n=4 全過**；`html-assembly` / `card-writing` / `i18n-convert` 零紀錄 | 研究線指派 Sonnet 有證據（n<10，tiebreaker 級）；其餘冷啟動 heuristic，本次補進 scoreboard |

## 3. 執行機制判定

- **機制：Subagents（Agent tool），循序 pipeline ＋ 研究段平行 fan-out。不用 Agent Team。**
  判定理由（對照 SKILL.md 3a 的三重門檻）：可平行 ✅（研究段）、成員需互相反應 ❌（沒有任何成員需要直接對話；打回一律經 orchestrator 路由）、品質要求高 ✅。**三個門檻只滿足兩個 → 不成立 team。** team 的成本是線性的（N 成員 ≈ N 倍 token），為一條不需要互聊的 pipeline 付這個價錢是過度工程化。
- **隔離策略：不用 worktree。** 每個成員擁有互斥的檔案路徑（見 §5），無重疊 → worktree 的 200–500ms/agent 成本不划算。
- **Bootstrap（orchestrator 開工前完成，避免 M-03 讀 175KB 原型）**
  - `work/bootstrap/design-system.css` — 從原型抽出設計 token ＋ 深色三處定義
  - `work/bootstrap/popup.js` — 從原型抽出 popup／canEmbed／iframe 區塊，**且已改為 href ＋ data-url 版本**
  - `work/bootstrap/modal.html` — modal 骨架片段
  - `work/bootstrap/article.md` — 文章本體（受保護素材，唯讀）
  - `work/bootstrap/constitution.md` — 憲章 14 條（每個 spawn prompt 引用）

## 4. 團隊架構圖

```
                          ┌──────────────────────────────┐
                          │  Orchestrator（本 session）   │
                          │  claude-opus-5, 高 effort     │
                          │  bootstrap / 仲裁 / 事實終審  │
                          └───┬──────────────────────┬────┘
                              │                      │ 打回
        ┌─────────────────────▼──────────┐           │
        │ 研究 subteam（用完即收）        │           │
        │ M-01a/b/c 來源查證官 ×3 Sonnet │           │
        └─────────────────┬──────────────┘           │
                          │ sources/*.json           │
                          ▼                          │
                 ┌────────────────┐                  │
                 │ M-02 導覽卡撰稿 │ Sonnet           │
                 └────────┬───────┘                  │
                          │ cards.json               │
                          ▼                          │
                 ┌────────────────┐                  │
                 │ M-03 HTML 組裝  │ Sonnet          │
                 └────────┬───────┘                  │
                          │ digest.html              │
                          ▼                          │
                 ┌────────────────┐                  │
                 │ M-04 簡體版     │ Haiku（audition）│
                 └────────┬───────┘                  │
                          │ digest-cn.html           │
                          ▼                          │
        ┌─────────────────────────────┐              │
        │ M-05 驗證官  Sonnet          ├──────────────┘
        │ 機器檢查 ＋ 反作弊抽查        │
        └─────────────┬───────────────┘
                      │ 導覽卡不可機器驗證的部分
                      ▼
        ┌─────────────────────────────┐
        │ M-06 盲測複核官  Opus 5      │ 只看成品，不看任何自我回報
        └─────────────────────────────┘
```

訊息流向：subagent 之間**不直接通訊**（Agent tool 限制），orchestrator 是唯一 router。打回路徑：M-05／M-06 → orchestrator → 知情重試 1 次 → 再失敗即改 spec。

## 5. 成員卡

### M-01a / M-01b / M-01c — 來源查證官 ×3（研究 subteam，用完即收）

- **職責**：把分配到的待查來源查出真實 URL 並交叉驗證；查不到就標 unverified，**絕不生成**
- **模型**：**Sonnet**（`claude-sonnet-5`）— 理由：全域 scoreboard `task_type=research-web` × sonnet **n=4，first_try_pass 全 true**（2026-07-20 ×2、07-25 ×2）。n<10 屬 tiebreaker 級權威，但方向一致且無反例
- **檔案 territory**：`work/sources/batch-a.json` / `batch-b.json` / `batch-c.json`（各自獨佔一檔）
- **分工**（待查 **8 個來源 / 9 件產出**——METR 為一個來源、兩件產出；GitClear 已由 orchestrator 於 2026-07-29 查證完成，移出待查）：
  - a = METR 論文（arXiv 2507.09089）、METR 2026-02 改設計公告、SPACE（ACM Queue 2021）
  - b = Anthropic evals（2026-01）、Böckeler（martinfowler.com）、RAND RR-A2680-1
  - c = Gartner 新聞稿、MIT Project NANDA、Bob McGrew（Sequoia podcast）
- **Deliverable**：每條含 `{claim_in_article, identifier, status, url, evidence:[{query,url,matched_fields}×2], notes}`
- **收件人**：orchestrator → 轉 M-02
- **依賴**：無，立即開始（三個平行）
- **驗證合約｜型 2 exemplar-corpus**：範例庫 = handoff v2 的九個已確認 URL（N=9，Bek 提供，agent 不得自選）。Grader = M-05（≠ worker 模型不成立時改用不同 effort 檔位 ＋ 盲輸入），對 30% 抽樣重跑兩次獨立查詢。**Grader 只能輸出「送人審」或「打回」，放行一律由 orchestrator。**同意率 <80% 即停用回退全人工。迴圈 ≤3

### M-02 — 導覽卡撰稿官

- **職責**：為每個 **status=verified** 的來源寫一張導覽卡 `{t, d}`；unverified 來源**不寫卡**
- **模型**：**Sonnet** — 理由：冷啟動（`card-writing` 無歷史），heuristic 指派 executor 檔位；本任務是照詳細規格產出短文案，不需旗艦
- **檔案 territory**：`work/cards.json`
- **Deliverable**：`cards.json`，key = 完整 URL，value = `{t, d, evidence_spans:[…]}`；`evidence_spans` 逐子句記錄對應出處
- **收件人**：orchestrator → 轉 M-03
- **依賴**：等 orchestrator 轉來的 `work/sources/*.json` 合併檔
- **驗證合約｜型 2 exemplar-corpus**：M-06 盲測抽 5 張（或全數 30%，取大者），**只收到卡片本身，不收到 M-02 的任何自述**。判準：每個描述性子句可對應 `evidence_spans`；動詞強度與來源一致。任一張不過 → 全批打回

### M-03 — HTML 組裝官

- **職責**：用 bootstrap 模組組出自包含 `digest.html`：植入文章本體、九個中文數字眉標、SVG 圖表、popup 系統、底部來源庫
- **模型**：**Sonnet** — 理由：冷啟動（`html-assembly` 無歷史）。這是全案最大的機械執行任務，照 bootstrap 與憲章走，不需 Opus。**不讀原型全檔**（175KB），只讀 orchestrator 抽好的 bootstrap
- **檔案 territory**：`work/digest.html`、`work/charts/*.svg`
- **Deliverable**：`work/digest.html`（單一自包含 HTML，無外部函式庫、無 CDN）
- **收件人**：orchestrator → 轉 M-04 與 M-05
- **依賴**：等 `work/cards.json` ＋ 合併後的 sources 檔
- **圖表**：1–3 張（PREFER，非 MUST）。候選：①METR 預測 24% / 事後 20% / 實測 −19% 的三柱對比 ②GitClear 重構 24.1%→9.5% 與複製貼上 8.3%→12.3% 雙線交叉 ③pass@k vs pass^k 概念圖。**先讀 dataviz skill 再寫第一行圖表碼**，每張配一句文字 Takeaway，Takeaway 的數字與本文逐字相同
- **驗證合約｜型 1 executable**：
  ```bash
  # C-08 三數相等
  test $(grep -c 'class="ent"' work/digest.html) -eq $(grep -c 'data-url' work/digest.html) \
    && test $(grep -c 'class="ent"' work/digest.html) -eq $(grep -co 'class="ent" href=' work/digest.html)
  # C-01 逐句 diff
  python3 scripts/verify_verbatim.py work/bootstrap/article.md work/digest.html   # 差異數 0
  # C-09 白名單、C-10 深色三處
  grep -q 'bekhelpme\\.com\$|^localhost\$' work/digest.html
  test $(grep -c -E ':root|prefers-color-scheme: dark|\\[data-theme=.dark.\\]' work/digest.html) -ge 3
  ```
  exit 0 = 過。**M-05 反作弊抽查**：確認 `.ent` 不是靠隱藏元素湊數、圖表 SVG 非空殼、逐句 diff 腳本本身未被修改（`git diff scripts/`）

### M-04 — 簡體版官（**audition 任務**）

- **職責**：以 OpenCC `tw2sp` 產出 `digest-cn.html`；轉換前用 regex 把所有 URL 換佔位符、轉完還原；「拷貝」→「复制」；`lang="zh-Hans"`；移除語言切換連結
- **模型**：**Haiku**（`claude-haiku-4-5-20251001`）— **本 swarm 的 audition 指派**。理由：scoreboard 對 Haiku 只有 n=1（`install-doc-draft`，audition 通過但有一個變數 bug），證據不足以路由但值得再測。選這個任務當 audition 是因為**它的檢查完全機器化且無死角**——URL 集合逐字元 diff 為空是二元判定，Haiku 若出錯 100% 會被抓到，風險上限已封住
- **檔案 territory**：`work/digest-cn.html`、`work/scripts/opencc_convert.py`
- **Deliverable**：`digest-cn.html` ＋ 轉換腳本
- **收件人**：orchestrator → 轉 M-05
- **依賴**：等 `work/digest.html` 定版
- **驗證合約｜型 1 executable**：
  ```bash
  diff <(grep -o 'https\\?://[^"]*' work/digest.html | sort -u) \
       <(grep -o 'https\\?://[^"]*' work/digest-cn.html | sort -u)      # 必須空
  grep -q 'lang="zh-Hans"' work/digest-cn.html
  ! grep -q 'digest.html\\|語言切換\\|繁體版' work/digest-cn.html
  ```
- **降檔條款**：1 次知情重試後仍失敗 → 改派 Sonnet，並在 scoreboard 記 `failure_mode`

### M-05 — 驗證官

- **職責**：執行全部機器檢查；對每個通過的產出做反作弊抽查；對 M-01 抽 30% 重跑查詢
- **模型**：**Sonnet** — 理由：檢查本身是執行指令與比對輸出，判斷成分低；scoreboard `task_type=verification` × sonnet n=1 通過（07-20），冷啟動偏弱但方向一致
- **檔案 territory**：`work/checks/*.log`、`work/checks/report.md`（唯讀所有其他路徑）
- **Deliverable**：檢查報告，每項含**原始輸出**而非摘要；失敗項必須寫出「為什麼」
- **收件人**：orchestrator
- **依賴**：各成員產出就緒即檢
- **授權**：**可打回任何人的工作，包含 orchestrator 的 bootstrap 與事實終審**
- **驗證合約｜型 1 + 反向抽查**：orchestrator 隨機重跑 M-05 宣稱通過的 3 項檢查；結果不符 → M-05 記 `failure_mode=gaming`，本 swarm 所有「通過」全部重驗

### M-06 — 盲測複核官

- **職責**：對導覽卡做盲測事實複核（唯一無法機器驗證的一層）
- **模型**：**Opus 5**（`claude-opus-5`）— Bek 於 2026-07-29 裁示升檔。
  原設計為 Sonnet ＋ 輸入剝離，但 M-02 也是 Sonnet，違反憲章「grader ≠ worker 模型」的硬要求，
  剝離只是代償而非滿足。改 Opus 後該條真正成立；**輸入剝離照舊執行**（只收卡片文字 ＋ 來源證據，
  不收 M-02 自述、不收 orchestrator 判定），從唯一保險降級為第二道保險。
  成本：約 +3–4 萬 token。換到的是導覽卡這一層——全案唯一無法機器驗證的部分——有真正的異模型複核
- **檔案 territory**：`work/checks/blind-review.json`
- **Deliverable**：每張抽樣卡的判定 `{card_key, verdict: "send_to_human" | "reject", offending_clauses:[…]}`
- **收件人**：orchestrator
- **依賴**：等 `cards.json`
- **治理**：**verdict 沒有「approve」這個值。**放行永遠是 orchestrator。首次上線需 orchestrator 盲測校準：同意率 <80% 即停用，改全人工

## 6. Approval Gates

| Gate | 位置 | Skill 鏈 | 批准人 | 方向錯了下游會怎樣 |
|---|---|---|---|---|
| ~~G1~~ | 目標＋憲章 | spec-engine（67🔴→91🟢）→ bek-2-senior-partner → 人類 | ✅ 已批准 2026-07-29（選項 A） | — |
| ~~G2~~ | 研究發現 | 併入 G1（orchestrator 已完成探測） | ✅ | — |
| **G3** | 本藍圖 | 人類 | ← 待批 | 編制錯了，五個 agent 會一致且有效率地做錯事 |
| **G4** | M-01 產出定版來源清單後、M-02 開工前 | spec-engine → 人類 | Bek | 來源清單錯了，導覽卡與來源庫全部要重做，且錯誤會上線 |
| **G5** | push 前 | M-05／M-06 全過 → akashic-review → 人類 | Bek | 這是對外公開文章，錯的 URL 上線就是永久記錄 |

G4 是 SP review 指出的缺口——「20 個來源」是估計值不是清單，沒有定版清單 M1 的 done condition 無法判定。

## 7. 溝通與關閉協議

- **訊息路由**：subagent 之間不直接通訊，orchestrator 是唯一 router。所有交付經 orchestrator 轉手
- **Logging**：全部寫 `work/logs/<member>.jsonl`，欄位 = `{task_type, model, model_version, attempt, pass, raw_check_output, ts}`
- **Shutdown**：orchestrator 發關閉請求 → 成員存檔並確認 → 才關閉。禁止硬殺；成員可要求「先存完」
- **打回協議**：check 失敗 → **失敗原始輸出**注入重試 prompt → 1 次知情重試 → 再失敗 = spec 壞了，上報改 spec，禁止第三次盲目重試
- **申訴路徑**：worker 可對 checker 判定提異議 → orchestrator 仲裁；checker 也可能被糾正
- **卡關協議**：同一問題卡 3 次即停手上報

## 8. 風險與預算

**Token 預估**：M-01 ×3 ≈ 230k｜M-02 ≈ 80k｜M-03 ≈ 300k｜M-04 ≈ 40k｜M-05 ≈ 100k｜M-06 ≈ 85k（Opus 升檔）｜orchestrator ≈ 200k → **約 1.05M tokens**

| # | 風險 | 緩解 |
|---|---|---|
| R1 | **URL 捏造**（最高風險）。WebFetch 全 403，agent 被要求附 URL 卻無法點開驗證，壓力方向就是編一個。所有機器檢查都會通過 | C-04 兩次獨立查詢 ＋ M-05 抽 30% 重查 ＋ C-05 unverified 是合法結局（降低編造誘因）＋ G4 人類看定版清單 |
| R2 | **popup 照抄原型的無-href 寫法**，廢掉全篇 GEO | C-08 grep 三數相等 ＋ bootstrap 已預先改寫好 ＋ M-05 專屬檢查 |
| R3 | **M-03 context 爆掉**（原型 175KB） | orchestrator 先抽 bootstrap 模組，M-03 不讀原型全檔 |
| R4 | **簡體版 URL 被 OpenCC 轉字**（原型踩過：含日文的網址） | C-12 佔位符保護 ＋ URL 集合 diff 為空的二元檢查 |
| R5 | **scoreboard 無法在地回寫**（Drive `create_file` 無 fileId，只能新建 → 會造成同名 stale fork） | 改產 `work/eval-scoreboard-append-2026-07-29.json` ＋ 手動合併步驟。**這是 Phase 5 的已知未通過項，不掩飾** |

**降檔方案**（預算超標時依序砍）：① M-06 降回 Sonnet ＋ 輸入剝離（不砍掉複核本身）② 導覽卡只做九個已確認來源 ③ 簡體版延後為第二批 ④ 圖表砍到 1 張。**不砍**：M-01 的兩次獨立查詢、M-05 的反作弊抽查。

**Eval 條款**
- 全域 scoreboard：`Obsidian Vault / 00_System / AI / eval-scoreboard.json`（Drive `1ISyGXhj5quUNxjghHrqwxnR9G29MGW99`，14 列，mtime 2026-07-25）
- 本次引用的歷史列：`research-web × sonnet` n=4（→ M-01）、`verification × sonnet` n=1（→ M-05，僅記錄不主導）、`install-doc-draft × haiku` n=1（→ M-04 audition 依據）
- 冷啟動標注：`html-assembly`、`card-writing`、`i18n-convert`、`blind-review` 四個 task_type 無歷史，本次 heuristic 指派並回寫
- audition：**Haiku × `i18n-convert`（M-04）**
- 回寫：受 R5 限制，產出 append 檔 ＋ 手動步驟，Phase 5 標為未通過

## 9. Assumptions ／ Exception Log

**Exception Log（本文授權改動，共 3 筆，全部位於證據等級附註或其引用的數據）**

| 位置 | 原文 | 改為 | 授權 | 證據 |
|---|---|---|---|---|
| 第 35 行 | 「從 **2021** 年的約 25%」 | 「從 **2020** 年的約 25%」 | Bek 2026-07-29「用真實的／正確的數字」 | 兩次獨立 WebSearch 一致回報 24.1%(2020)→9.5%(2024)；文章同句括號已寫 2020–2024，內部先矛盾 |
| 第 144 行（證據等級附註） | 「pass@k / pass^k 的定義出自 τ-bench（Yao et al., 2024）」 | 「pass^k 的定義出自 τ-bench（Yao et al., 2024）；pass@k 早於它，出自 Chen et al. 2021（Codex／HumanEval）」 | Bek 2026-07-29 裁示 E1 選項 A | pass@k 最早由 Kulal et al. 2019 提出、Chen et al. 2021（arXiv 2107.03374）確立普及，早於 τ-bench 三到五年；τ-bench 論文是拿既有 pass@k 對照以凸顯 pass^k。兩次獨立查詢一致。由 M-02 於卡片重新接地時發現並上報 |
| 第 141 行（證據等級附註） | 「Gartner 的 40% 預測：**基於** …民調，非嚴格抽樣」 | 「新聞稿未揭露樣本與計算方式，屬分析師預測。同一份新聞稿另引…民調，但該民調測的是**投資態度，與取消率無關**」 | Bek 2026-07-29 裁示 E1 #3 選項 A | 該民調量的是投資態度（19/42/8/31%），與取消率無關；>40% 未揭露樣本與計算。原句既歸屬錯誤又對來源過度寬容。由 M-06 盲測（Opus 5）發現，orchestrator 兩次獨立查詢確認 |

**Assumptions**

1. slug = `measuring-the-half-ai-does-better`、date = `2026-07-29`、title 用原標題、excerpt 用「我們想拿來衡量工程師的那些指標——bug 數、修復速度、缺陷率——描述的正好是 agent 已經做得不錯的那一半工作。」（Bek 未反對，視為採用）
2. 導覽卡張數由查證結果決定，不預設 20 或 9（依 Bek 2026-07-29「弄清楚再決定」）
3. 「涵蓋 Google、微軟、Meta 等專案」未證實（來源說法為「匿名私有 repo ＋ 25 個最大開源專案」）→ 列入 M-01 查證，若不符即觸發 E1 上報，**不自行修改**
4. 兩份 stale 檔（Drive `1Ek4XZFgCX_GPBNl_QKAICgeAcsfzg76m` v0.1 skill、`1tw3idf0-bop8_pksLYEOAd8GKQHCzSGj` 07-23 scoreboard fork）列入交付追蹤，**需 Bek 手動刪除**——本 session 無 Drive 刪除能力
5. 未呼叫 `ask_fable`：機制判定（subagents vs team）經三重門檻對照後明確不成立 team；Haiku audition 的風險上限已由二元檢查封住。兩者皆非「自我批評後仍無法確定」，依 SKILL.md 3e 不觸發 consult

## 附錄 A — Spawn Prompts

見 `docs/spawn-prompts-lighthouse-digest-measuring.md`。

## 附錄 B — swarm.json

不適用：本環境無 Ringer runtime。驗證合約依 3b 由 orchestrator 手動執行 checks。建議未來安裝 Ringer（github.com/NateBJones-Projects/ringer）以取得免費的機器驗證與 eval log。


---

## 10. 交付結果（v1.1 補記）

| 項目 | 結果 |
|---|---|
| 兩條 route | `○ /measuring-the-half-ai-does-better`、`○ /measuring-the-half-ai-does-better-cn`，main `6fb3e32` |
| 來源 | 21 條，每條 URL 由兩次獨立**內容式**查詢重現 |
| 導覽卡 | 21 張，Opus 5 盲測全審，打回 3 張全數修復 |
| 圖表 | 3 張 inline SVG，過 dataviz 雙主題 validator（以實際底色 #FAF7F0／#141715 覆核） |
| 逐句比對 | 108 句差異數 0 |
| C-11 | 切除注入 meta 後與源檔逐位元組相等，兩版皆通過 |
| 打回稽核 | 7 項 FAIL，全部有明確下場，無懸置 |

### 三個 E1 全部位於證據等級附註

| # | 錯誤 | 發現者 |
|---|---|---|
| 1 | GitClear 起始年份 2021 → 2020 | orchestrator |
| 2 | pass@k 誤歸 τ-bench（實為 Chen et al. 2021） | 卡片重新接地時 |
| 3 | Gartner 40% 預測誤稱「基於民調」 | **Opus 盲測** |

正文 107 句零錯誤。錯誤集中在附註，因為附註寫的是「這個證據多可靠」——那是關於來源方法論的二階陳述，最容易憑印象寫、最少被回頭核對。

### orchestrator 的五個失誤（供下次改進 spec）

1. **C-04 措辭**「independently-worded」被合理讀成「措辭不同」→ 24 筆查詢 7 筆誘導式
2. **卡片長度 40–70 字**：連原型自己都達不到（實測中位數 63、上限 94）
3. **`grep -c` 算行數不算次數**：C-08 讀到 39，真值 48
4. **漏派 Gartner 打回**：分類為「文章層級」後未回頭修卡片
5. **CN route 用舊 HTML 產生**：源檔對、部署檔錯，所有源檔檢查都會通過

失誤 4、5 同一類：**上游改了、下游沒重生成**。每個 agent 的產出都有檢查，但沒有任何檢查在看依賴鏈（article → digest → digest-cn → route ×2）是否全部重跑。**下次的 spec 要加一條 propagation check。**

失誤 1、2 同一類：把判斷壓縮成一個看起來精確的數字或詞，agent 照字面執行，字面與意圖分岔。
