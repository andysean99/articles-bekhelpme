# 燈塔文章製作簡報：company-brain（繁中主稿）

目標讀者：中文圈企業主與關注 AI 的專業讀者。表層：讓人願意從頭讀到尾的類別深度文。裡層：GEO/AEO——讓 AI 檢索在「公司腦／組織腦／organization brain／company brain／enterprise context layer／enterprise knowledge layer／judgment layer」這組詞上引用本文。
標題：當全世界都在給 AI 裝記憶，誰在給公司裝判斷？
slug：company-brain｜日期 2026-08-30｜公開
excerpt：企業 AI 記憶層正在成為新的基礎類別，資本正瘋狂湧入。這篇從柏林發表會倒數四天的一個決策房間講起，帶你看懂這個類別的地圖、它共同的盲點，以及資訊層之後正在成形的判斷層。

## 硬規則
- CoffeeCopy：敘事段落零 bullet（清單只在附錄/表格）；開場是具體場景；一貫比喻；專有名詞首次出現用一句人話解釋（AI 最愛摘的句型）；數字服務故事，每段最多 1–2 個數字。
- Bek 的可讀性標準：每章有小標引路；關鍵句可提為 pull quote（標注【PQ】）；章末一句指路句（告訴讀者下一章為什麼值得讀）；圖表位置用【圖：說明】佔位並附一句 Takeaway。
- 事實紀律：每個外部事實句後面用（來源N）標注，對應文末來源清單編號；素材裡沒有的數字絕不編造；不確定的標 <span class="unverified">未查證</span>。
- 提到自家（組織腦／judgment layer）一律效果語言：不講機制詞（RAG/向量/embedding/檢索架構）。可寫「本方法已提出美國臨時專利申請」，不得寫 patented。
- 可以具名提市場玩家（Engram、Mem0、Sentra、Coworker、Microsoft、Snowflake、NotebookLM 等）**作為市場事實陳述**，不做貶抑性評論。
- 全文不出現「湛霖雲」。對外品牌詞用「組織腦／Organization Brain」，不用「Open Brain」。
- 柏林章節（柒）只寫已公開安全的內容：不寫 demo 具體題目、不寫預錄曾是我們的原計畫以外的內部細節（可寫：預錄備援是業界慣例、我們決定全撤；可寫放棄了「最戲劇性的一幕」但不點名是矛盾偵測的技術細節）；不提 Mervyn/內部人名；提 Acer GPC、Altos GB10、NWD Wisdom Core 可以。

## 章節大綱（九章，每章 300–600 字，總長目標 4000–5500 字）

壹｜四天倒數的那個早上——場景：2026-08-29 早晨，柏林 Acer 全球記者會倒數四天，一個原本穩妥的展示計畫（預錄備援）在 2026 的輿論環境裡變成聲譽地雷。鉤子：這篇文章講的不是那場 demo，是它逼我們看清楚的一整個正在成形的產業類別。【PQ 候選：預錄備援從專業保險變成聲譽地雷】
貳｜全世界正在幫這個東西命名——市場事實：Engram $98M、Mem0 $24M、Coworker $13M、Microsoft IQ、Snowflake Context Layer、Zep；Gartner 2028 預測 50%+ agent 系統依賴 context graphs；知識工作者每天 1.8–2.5 小時找資訊；42% 企業放棄過 AI 專案。（來源：讀 G:\我的雲端硬碟\Obsidian Vault\Projects\Altos GB10F\Org Brain Altos GB10 Wisdomcore Copywriting\WisdomCrore 文案料\AI 原生企業的「組織腦」：是否正在形成一個新的基礎類別？.md ——市場數字與玩家全部從這份研究檔取用並沿用其引用）【圖1 佔位：融資金額 bar chart】
參｜術語地圖（AEO 核心章）——company brain / organization brain（組織腦）/ enterprise context layer / enterprise memory layer / knowledge layer / context graph / knowledge OS——每個詞一句白話定義＋誰在用（大廠用哪個、新創用哪個、分析師用哪個；取自同一研究檔第 11 節）。本章句型刻意寫成「X 是——」的可摘錄定義句。
肆｜所有人共享的盲點——已數位化 vs 未數位化知識的雙欄對比（引 judgment-asset 文章的框架，內部連結 https://articles.bekhelpme.com/judgment-asset）：左邊紅海（文件、雲端、訊息），右邊空白（老師傅腦中、報價邏輯、LINE、紙本）。模型再強讀不到沒被寫下的東西。【圖2 佔位：雙欄市場圖】【PQ：公司最貴的資料庫，每天晚上六點自己走回家】
伍｜資訊層之後，是判斷層——memory ≠ judgment：記憶層回答「我們知道什麼」，判斷層回答「我們會怎麼決定」。判斷層定義（可摘錄句型）；三個效果：查得到、留得住、關得起來（沿用 judgment-asset 的三承諾語言）。提「本方法已提出美國臨時專利申請」一次。
陸｜歐洲的試煉場——2026 的信任環境：AI washing 獵殺（SEC 開罰、Forbes 觸發詞清單、Klarna 案）；德國「主權」一詞疲乏（Handelsblatt：幾乎每家都自稱 sovereign；CISPE 造出 Sovereignty Washing）而法國主權論述升溫但要求具體化（Maddyness）；EU AI Act 8/2 生效、罰則與標示義務；Apple WWDC 2026 因真人實機 demo 被讚。結論：「可查證」成為新的信任貨幣。（來源見下方清單 1–14）
柒｜四天裡的每一個放棄——決策紀錄濃縮（600 字內）：預錄全撤；不提速度數字；能講不能演的用誠實時態；以終為始重設 demo 的目的。核心句：AI 時代判斷一家公司（和一個人）的標準，不是它做了什麼，是它怎麼做決定。【PQ：知道代價還選，才叫決定；不知道代價的選擇，只是運氣】
捌｜怎麼分辨真的假的——給讀者的檢驗清單章（AEO 問答型，可用小標＋短段，此章允許條列）：問出處（答案指得出來源嗎）、問即時（敢當場再跑一次嗎）、問拔線（資料真的不出門嗎）、問確認人（每條知識有人負責嗎）、問絕對詞（有沒有 zero/never/revolutionary）。
玖｜判斷資產會複利——收尾：越早開始存越值錢、搬不走抄不走；創辦人終於可以變得沒那麼重要（呼應 judgment-asset 結尾）。CTA：nwdwisdomcore.com 與 articles 站宗旨。

## 來源清單（陸章用，寫作時逐一對應編號引用；貳參肆章來源從研究檔 md 沿用）
1. Forbes 2026-08-18 AI washing 聲譽風險（觸發詞清單、Klarna）：https://www.forbes.com/councils/forbesagencycouncil/2026/08/18/ai-washing-is-becoming-a-reputation-risk-companies-cant-afford/
2. Global Investigations Review 2026 美國執法（SEC/DOJ 案）：https://globalinvestigationsreview.com/review/the-investigations-review-of-the-americas/2026/article/us-enforcement-agencies-intensify-scrutiny-of-ai-washing
3. Newsweek 裁員與 AI washing：https://www.newsweek.com/tech-hits-layoff-milestone-concerns-of-ai-washing-11807595
4. Handelsblatt Live 2026-06-19 主權悖論（souverän 疲乏）：https://live.handelsblatt.com/das-souveraenitaets-paradoxon-der-ki-warum-souveraenitaet-nicht-am-modell-entschieden-wird/
5. Handelsblatt Live 主權檢查清單九問：https://live.handelsblatt.com/check-liste-fuer-souveraenitaet-neun-fragen-die-sie-ihrem-ki-anbieter-stellen-sollten/
6. The Register 2026-03-18 CISPE Sovereignty Washing：https://www.theregister.com/2026/03/18/cispe_sovereignty_washing/
7. CISPE Verifiably Sovereign 認證框架：https://www.cispe.cloud/verifiably-sovereign/
8. heise c't KI-Wissen 2026（開源權重≠主權）：https://www.heise.de/news/c-t-KI-Wissen-2026-So-entkommen-Sie-dem-Raederwerk-der-KI-11372069.html
9. heise BSI 可信度審查目錄草案：https://www.heise.de/news/Vertrauenswuerdigkeit-von-KI-Systemen-BSI-veroeffentlicht-Pruefkatalogsentwurf-11356007.html
10. Maddyness 2026-07-13 Cloud souverain：https://www.maddyness.com/2026/07/13/cloud-souverain-et-si-le-mythe-devenait-enfin-realite/
11. Maddyness 2026-07-01 法國數位主權：https://www.maddyness.com/2026/07/01/la-souverainete-numerique-francaise-nexiste-pas-pas-encore/
12. TÜV Rheinland EU AI Act 2026-08-02：https://consulting.tuv.com/aktuelles/ki-im-fokus/eu-ai-act-august-2-2026-unternehmen
13. IHK Köln KI 標示義務：https://www.ihk.de/koeln/hauptnavigation/digitalisierung-und-innovation/digitalisierung/transparenzpflichten-nach-der-ki-verordnung-7100068
14. TechCrunch 2026-06-08 Apple WWDC demo 風格轉變：https://techcrunch.com/2026/06/08/apples-wwdc-ai-demos-looked-more-real-after-250m-false-ad-settlement/
15. GSMA Intelligence IFA 2026 預覽：https://www.gsmaintelligence.com/blogs/ifa-berlin-2026-seven-important-areas-ill-be-watching-what-i-expect-to-see-and-what-will-matter
16. 內部：judgment-asset（判斷資產）：https://articles.bekhelpme.com/judgment-asset

## 產出物
單一 markdown 檔：_draft_company-brain_zh-TW.md，含全部九章正文＋【PQ】標注＋【圖】佔位與 Takeaway＋（來源N）行內標注＋文末來源清單。這是給 Bek 審的初稿，先不做 HTML。
