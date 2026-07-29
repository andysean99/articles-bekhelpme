# Checker Report — lighthouse-digest-measuring

Checker: M-05 (sonnet). Constitution read in full (14 clauses, ESCALATE rules, appeal process).
No self-reports trusted; every check below was executed directly.

## Overall verdict

**Part 1 (finished artifacts): PASS** (8/8 checks)
**Part 2 (source URL sample re-verify): 6 PASS / 1 FAIL** (row 14, SPACE framework — see below)
**Part 3 (anti-cheat): 1 substantive content defect found (not classified as gaming), 1 stale-constitution note, 1 unreproducible orchestrator self-verification claim**
**Part 4 (routes/build): PASS** (both routes present in build output, homepage + sitemap confirmed)

---

## Part 1 — Finished artifacts

### C-08 — entity link counts (must be 6 equal numbers)
```
for f in work/digest.html work/digest-cn.html; do
  for p in 'class="ent"' 'data-url' 'class="ent" href='; do grep -o "$p" $f | wc -l; done
done
```
Raw output:
```
--- work/digest.html ---
class="ent" => 48
data-url => 48
class="ent" href= => 48
--- work/digest-cn.html ---
class="ent" => 48
data-url => 48
class="ent" href= => 48
```
**PASS** — all six numbers equal 48.

### C-01 — verbatim lock
```
python3 scripts/verify_verbatim.py work/bootstrap/article.md work/digest.html
```
Raw output:
```
PASS — 108 句全數逐字保留，差異數 0
```
exit code 0. **PASS.**

### C-12 — URL sets identical across editions + lang tag
```
diff <(grep -o 'https\?://[^"]*' work/digest.html | sort -u) \
     <(grep -o 'https\?://[^"]*' work/digest-cn.html | sort -u)
```
Raw output: empty, diff exit code 0. **PASS.**
```
grep -q 'lang="zh-Hans"' work/digest-cn.html
```
Raw output: `FOUND`, only `lang="zh-Hans"` present. **PASS.**

Extra C-12 checks (拷贝→复制, no cross-edition language-switch links):
```
拷贝 count in digest-cn.html: 0
复制 count in digest-cn.html: 17
拷貝 count in digest.html:     0
複製 count in digest.html:    17
```
Traditional uses 複製 (17×), Simplified correctly uses 复制 (17×), no leftover 拷贝/拷貝. No cross-edition slug links found in either file. **PASS.**

### C-09 — canEmbed allowlist intact
```
grep -o 'bekhelpme[^/]*localhost[^/]*' work/digest.html | head -1
```
Raw output: `bekhelpme\.com$|^localhost$|^127\.|^$`
Full line (778): `var canEmbed = /(^|\.)bekhelpme\.com$|^localhost$|^127\.|^$/.test(location.hostname);`
Matches constitution's mandated pattern exactly. **PASS.**

### C-10 — dark theme, 3 definitions each
```
grep -o -E ':root|prefers-color-scheme: dark|\[data-theme=.dark.\]' $f | sort -u | wc -l
```
Raw output: `digest.html → 3`, `digest-cn.html → 3` (`:root`, `[data-theme="dark"]`, `prefers-color-scheme: dark` all present in both). **PASS.**

### C-03 — evidence appendix in main flow, not in `<details>`
```python
det=''.join(re.findall(r'<details.*?</details>',h,re.S))
print('appendix in details:', '未揭露樣本' in det, '| appendix present:', '未揭露樣本' in h)
```
Raw output: `appendix in details: False | appendix present: True`. **PASS.**

### Cards inlined == cards.json, no evidence_spans shipped
```python
c=json.loads(re.search(r'id="linkCards"[^>]*>(.*?)</script>',h,re.S).group(1))
print(f, len(c), sorted({k for v in c.values() for k in v}), 'evidence_spans' in h)
```
Raw output:
```
work/digest.html 21 ['d', 't'] False
work/digest-cn.html 21 ['d', 't'] False
```
`work/cards.json` itself has 21 entries, each with `t`, `d`, `evidence_spans`. Inlined cards in both HTML files strip `evidence_spans` down to just `t`/`d`, count matches (21), keys match. **PASS.**

---

## Part 2 — Sample re-verify of source URLs (C-04)

Random 30% sample (7 of 21 rows, seeded via `random.sample`, MIT NANDA forced in per instructions as the known-sensitive case): rows **2, 4, 12, 14, 17, 18, 19**.

Query rule followed throughout: no domain, no path fragment, no `site:` filter — title/author/publisher/topic only.

| # | Source | Recorded URL | Query 1 | Query 2 | Result |
|---|--------|-------------|---------|---------|--------|
| 2 | DORA anti-pattern guide | `https://dora.dev/guides/dora-metrics/` | "DORA software delivery performance metrics official research site homepage guides section" | "Google Cloud DORA metrics guides landing page deployment frequency lead time change failure rate" | **PASS** — `https://dora.dev/guides/dora-metrics/` appeared verbatim as top result in both queries. (Note: two earlier looser queries surfaced the sibling page `dora-metrics-four-keys/` instead, which is why two more targeted queries were run before concluding.) |
| 4 | Laura Tacho — individual metrics | `https://lauratacho.com/blog/using-metrics-to-measure-individual-developer-performance` | "Laura Tacho blog article using metrics to measure individual developer performance" | "engineering leadership coach Laura Tacho essay individual developer performance metrics" | **PASS** — exact URL returned in query 1's result list. |
| 12 | METR RCT paper | `https://arxiv.org/abs/2507.09089` | "METR study 16 experienced open-source developers AI tools made them slower randomized trial" | "paper measuring impact of early 2025 AI on experienced open source developer productivity" | **PASS** — both `[2507.09089]` and `[2507.09089v2]` returned in query 2. |
| 14 | SPACE framework (ACM Queue) | `https://queue.acm.org/detail.cfm?id=3454124` | "SPACE framework developer productivity ACM Queue 2021 Forsgren Storey Vasilescu" | "Nicole Forsgren GitHub Microsoft five dimensions software developer productivity framework paper" | **FAIL to literally reproduce.** See detailed note below — ran **5 independently-worded queries total** (including a verbatim repeat of the exact query recorded in `work/sources/orchestrator-reverify.json`); `queue.acm.org/detail.cfm?id=3454124` never appeared in any result list. |
| 17 | RAND RR-A2680-1 | `https://www.rand.org/pubs/research_reports/RRA2680-1.html` | "RAND report 65 engineers interviewed AI adoption barriers misunderstood problem definition" | "RAND Corporation research report why artificial intelligence projects fail interviews with engineers" | **PASS** — exact URL returned as top hit in both queries. |
| 18 | Gartner press release | `https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027` | "Gartner predicts over 40 percent agentic AI projects canceled by end of 2027" | "Gartner newsroom forecast agentic AI project cancellation rate cost value risk" | **PASS** — exact URL returned as top/near-top hit in both queries. |
| 19 | MIT Project NANDA overview (known-sensitive, G4-adjudicated) | `https://www.media.mit.edu/groups/nanda/overview/` | "Project NANDA MIT research group homepage networked agents open protocols" | "\"NANDA\" MIT Media Lab group overview page mission networked agents" | **PASS** — `Group Overview ‹ NANDA – MIT Media Lab` → `https://www.media.mit.edu/groups/nanda/overview/` appeared verbatim in both queries (neither query used the domain or a path fragment). This independently confirms the G4 adjudication was sound: the original PDF-report URL is genuinely unreproducible outside `site:` searches, but the official group overview page is real and independently discoverable. |

### Row 14 detail (FAIL)
Ran 5 queries, none surfaced `queue.acm.org/detail.cfm?id=3454124`:
1. "SPACE framework developer productivity ACM Queue 2021 Forsgren Storey Vasilescu" → returned Google Scholar, larridin.com, arxiv papers, space-framework.com, microsoft.com/research, getdx.com, codepulsehq.com. No queue.acm.org.
2. "Nicole Forsgren GitHub Microsoft five dimensions software developer productivity framework paper" → getdx.com, azure.microsoft.com, faros.ai, larridin.com, microsoft.com/research, arxiv, space-framework.com. No queue.acm.org.
3. `"The Space of Developer Productivity" journal article full text publication` → scilit.com, readwise.io, bohrium.com, people.uncw.edu (PDF mirror), **dl.acm.org/doi/10.1145/3453928**, **dl.acm.org/doi/fullHtml/10.1145/3454122.3454124**, researchgate.net, microsoft.com. No queue.acm.org.
4. "Forsgren Storey Maddila Zimmermann Houck Butler 2021 productivity paper original publisher" → researchr.org, **queue.acm.org/detail.cfm?id=3595878** (a *different* ACM Queue article, "DevEx"), dl.acm.org, semanticscholar.org, margaretstorey.com, nicolefv.com. Confirms `queue.acm.org/detail.cfm?id=X` is a real, live URL pattern, and confirms the DOI suffix `3454124` (from `dl.acm.org/doi/10.1145/3454122.3454124` in query 3) matches the `id=3454124` in the recorded URL — strong indirect corroboration, but not a literal hit.
5. Verbatim repeat of the exact query string recorded in `work/sources/orchestrator-reverify.json`'s own reverification note for this row — `"The SPACE of Developer Productivity" Forsgren Storey Zimmermann article where was it published` → researchr.org, getdx.com, researchgate.net, microsoft.com, newsletter.getdx.com, axify.io, larridin.com, arxiv. **No queue.acm.org at all**, contradicting the orchestrator's own claim (see Part 3 below).

Per this task's own rule ("A row whose URL you cannot reproduce is a FAIL"), row 14 is recorded as **FAIL**, despite reasonably strong indirect (DOI-based) corroboration that the URL is real. This is an E2-adjacent case (search behavior inconsistent with the paper trail) that should go to ESCALATE/appeal rather than be silently waved through.

---

## Part 3 — Anti-cheat spot-check

### `.ent` elements — real or padding?
Sampled markup directly:
```
<a class="ent" href="https://arxiv.org/abs/2507.09089" data-url="https://arxiv.org/abs/2507.09089">METR 做了一件簡單的事...</a>
```
- All 48 anchors carry non-empty text (min length 7 chars, max 112 chars, zero empty).
- CSS for `a.ent` (`a.ent{color:var(--accent); text-decoration:none; border-bottom:1px dotted var(--accent); ...}`) has no hiding rules (no `display:none`, `visibility:hidden`, zero width/height, `opacity:0`).
**Verdict: real, visible, not gamed.**

### Three SVG charts — real or stubs?
```
gitclear-crossover.svg: 25 drawing elements (4 circle, 7 line, 2 rect, 12 text)
metr-gap.svg:           20 drawing elements (4 line, 3 path, 2 rect, 11 text)
passk-vs-passpowerk.svg: 38 drawing elements (14 circle, 1 line, 12 path, 11 text)
```
All ≥20. Checked for zero-size degenerate elements (`width="0"`, `height="0"`, `r="0"`) — none found in any file. All `<text>` elements have non-empty content. Manually inspected `metr-gap.svg` in full: it is a genuine three-bar comparison chart (predicted +24% / recalled +20% / actual −19%) with a labeled 39-point gap bracket, legend, dark/light theme CSS custom properties, and per-bar `<title>` tooltips — not a stub.
**Verdict: real charts, not gamed.**

### `scripts/verify_verbatim.py` — was it modified to force a pass?
```
git log --oneline -- scripts/verify_verbatim.py
→ bb03f90 Add bootstrap modules and verbatim checker for the digest build   (only commit ever touching this file)

git diff bb03f90 HEAD -- scripts/verify_verbatim.py
→ (empty diff)
```
**Verdict: unchanged since introduction. Not gamed.**

### Guide cards — hidden padding, or text differing beyond script conversion?
Programmatic length-diff between TW/CN card `t`/`d` fields found only single-character deltas explained by legitimate Taiwan→Mainland *term* substitutions (not mere character mapping), e.g. `部落格`→`博客` (blog), `程式碼`→`代码` (code) — expected localization, not a defect.

**However, a real, systemic content defect was found, in scope of exactly this check ("text that differs between the two editions beyond script conversion"):**

Every single occurrence of **指標** (a load-bearing term throughout this article — "metric/indicator," central to an essay about *measuring*) was converted to **指针** ("pointer," the CS memory-address term) instead of the correct **指标**. This is not mere script conversion — 指標 is genuinely ambiguous in Taiwan usage (it means both "metric" in general/business contexts and "pointer" in CS/programming contexts), and the conversion tool/process appears to have applied the programming-sense mapping uniformly, corrupting the article's core vocabulary in the Simplified edition.

```
occurrences of correct term 指标 in digest-cn.html: 0
occurrences of WRONG term  指针 (pointer) in digest-cn.html: 15
occurrences of 指標 in digest.html (TW source): 15
```
Sample sentence pairs:
```
TW: ...更早就破除了三個迷思：生產力不等於活動量、生產力不只關乎個人、單一指標永遠不夠。
CN: ...更早就破除了三个迷思：生产力不等于活动量、生产力不只关乎个人、单一指针永远不够。   ← should be 指标
```
```
TW: Goodhart 法則在工程指標上不是隱喻，是每次都會發生的事。
CN: Goodhart 法则在工程指针上不是隐喻，是每次都会发生的事。   ← should be 指标
```
This also propagated into the inlined guide cards (e.g. card title `"提出pass^k可靠度指标"` became `"提出pass^k可靠度指针"` in CN).
**Verdict: 15/15 occurrences wrong, 0/15 correct. This is a genuine correctness FAIL for the Simplified edition (`work/digest-cn.html`), not attributed to `failure_mode: gaming` (it reads as an automated conversion-tool defect, not an attempt to defeat a check) — but it is squarely a substantive content bug that must be fixed before this edition ships. I am not authorized to edit `work/digest-cn.html`; reporting only.**

### Orchestrator's own outputs — no rank exemption

**1. `constitution.md` C-01 clause is stale relative to `work/sources/orchestrator.json` / `orchestrator-reverify.json`.**
Constitution text states: *"唯一授權改動：GitClear 起始年份 2021 → 2020"* (the **sole** authorized text change).
`diff work/bootstrap/article-original.md work/bootstrap/article.md` shows **three** changes, not one:
1. GitClear year 2021→2020 (line 35) — the one the constitution names.
2. Gartner 40%-prediction caveat rewritten (line 141) — traced in `orchestrator-reverify.json` to an explicit "E1 CONFIRMED, 裁示 A" ruling dated 2026-07-29, correcting an over-attribution to the unrelated 3,412-attendee poll.
3. pass@k/pass^k attribution split out to credit Chen et al. 2021 separately from τ-bench (line 144) — also traced to an explicit "E1 裁示 A" ruling dated 2026-07-29 in the same file.
Both additional changes have a clear, dated audit trail and are reflected identically in `work/digest.html` (which is why C-01's verbatim check against the edited `article.md` still passes cleanly). **This is not gaming** — it is a real, traceable, Bek-authorized set of edits — but `constitution.md`'s own text is now inaccurate ("唯一" / "sole" is false) and should be updated to name all three exceptions. Flagging per the checker's mandate to surface constitution/reality mismatches rather than silently rubber-stamp.

**2. `orchestrator-reverify.json` contains a self-reported WebSearch verification claim I could not reproduce.**
The file's SPACE-framework entry states: *"純內容查詢獨立回傳 queue.acm.org/detail.cfm?id=3454124"* ("a pure-content query independently returned queue.acm.org/detail.cfm?id=3454124"), citing the exact query: `"The SPACE of Developer Productivity" Forsgren Storey Zimmermann article where was it published`.
I ran that **exact same query string** verbatim (see Part 2, row 14, query 5) and got a completely different result set — **no `queue.acm.org` result at all**. Combined with 4 other independently-worded attempts also failing to surface it, this is a real discrepancy between the orchestrator's self-verification record and what I could reproduce. I note in fairness: the same file also records the orchestrator noticing a recurring fake mirror domain `spawn-queue.acm.org` in its search results, and I independently saw that exact same fake domain appear in one of my own searches for this row — which is a specific, checkable detail that argues the orchestrator's search session was real, not fabricated wholesale. I cannot determine from here whether this is WebSearch's inherent non-determinism across time/index state, or an over-generous reading of ambiguous results recorded as a clean "independently confirmed." **I am not calling this `failure_mode: gaming`** absent stronger evidence, but per C-14's "no rank exemption" instruction I am flagging it explicitly: the orchestrator's own audit trail contains an unreproducible claim on the same row that independently fails my Part 2 sample check, and this should go back to the orchestrator/Bek for a decision, not be treated as resolved.

---

## Part 4 — Routes, build, registration

### Route generation
```
python3 .claude/skills/lighthouse-digest/scripts/make_digest_route.py \
  --html work/digest.html --slug measuring-the-half-ai-does-better ... --deploy-dir /home/user/articles-bekhelpme
→ wrote /home/user/articles-bekhelpme/app/measuring-the-half-ai-does-better/route.ts
→ url:   https://articles.bekhelpme.com/measuring-the-half-ai-does-better
→ mode:  PUBLIC

python3 .claude/skills/lighthouse-digest/scripts/make_digest_route.py \
  --html work/digest-cn.html --slug measuring-the-half-ai-does-better-cn ... --lang zh-Hans --deploy-dir /home/user/articles-bekhelpme
→ wrote /home/user/articles-bekhelpme/app/measuring-the-half-ai-does-better-cn/route.ts
→ url:   https://articles.bekhelpme.com/measuring-the-half-ai-does-better-cn
→ mode:  PUBLIC
```
Both exit 0. Pre-flight hazard check (`` ` `` / `${`) on both source HTML files: zero occurrences in either, so no String.raw corruption risk.

### `lib/digests.ts` and `public/llms.txt`
Both entries appended (`digests` array was previously empty — this is genuinely the first heavy-track run through this code path, now build-tested, see below). Both article lines appended to `public/llms.txt` in the existing entry's format (title, URL, one-line excerpt).

### C-11 — embedded HTML byte-identical except meta block
```python
idx = orig.index('</title>') + len('</title>')
pre_orig, post_orig = orig[:idx], orig[idx:]
# compared against extracted `String.raw` body from route.ts
```
Raw output:
```
work/digest.html
 prefix identical: True
 suffix identical: True
 suffix match (tail): True
 embedded length - orig length: 1245   (== injected meta block byte length)

work/digest-cn.html
 prefix identical: True
 suffix identical: True
 suffix match (tail): True
 embedded length - orig length: 1254
```
Prefix (everything through `</title>`) and suffix (everything after the injected meta block) are byte-identical for both editions — the only difference is the injected meta block itself. **PASS.**

### `npm ci && npx next build`
```
npm ci → added 163 packages, audited 164 (5 high severity advisories reported by npm audit, pre-existing dependency tree, not part of this task's scope)

npx next build →
▲ Next.js 16.2.7 (Turbopack)
✓ Compiled successfully in 4.0s
  Running TypeScript ...
  Finished TypeScript in 2.6s
✓ Generating static pages using 3 workers (8/8) in 321ms

Route (app)
┌ ○ /
├ ○ /_not-found
├ ● /[slug]
│ └ /why-ai-cheaper-the-gap-widens
├ ○ /measuring-the-half-ai-does-better
├ ○ /measuring-the-half-ai-does-better-cn
├ ○ /robots.txt
└ ○ /sitemap.xml
```
Both `○ /measuring-the-half-ai-does-better` and `○ /measuring-the-half-ai-does-better-cn` present. **PASS (C-13).**

### Homepage + sitemap.xml
`sitemap.xml` (from `.next/server/app/sitemap.xml.body`):
```
<url><loc>https://articles.bekhelpme.com/measuring-the-half-ai-does-better</loc>...</url>
<url><loc>https://articles.bekhelpme.com/measuring-the-half-ai-does-better-cn</loc>...</url>
```
Homepage (`.next/server/app/index.html`) contains both article titles, both excerpts, both hrefs, and both entries in the page's `BlogPosting` JSON-LD list, correctly sorted newest-first ahead of the existing `why-ai-cheaper-the-gap-widens` post. **PASS.**

---

## Summary table

| Check | Clause | Result |
|---|---|---|
| Entity link counts (48=48=48, both editions) | C-08 | PASS |
| Verbatim lock | C-01 | PASS |
| URL sets identical across editions | C-12 | PASS |
| `lang="zh-Hans"` | C-12 | PASS |
| 拷贝→复制, no leftover 拷貝/拷贝 | C-12 | PASS |
| No cross-edition language-switch links | C-12 | PASS |
| canEmbed allowlist unmodified | C-09 | PASS |
| Dark theme 3 definitions, both editions | C-10 | PASS |
| Evidence appendix in main flow, not `<details>` | C-03 | PASS |
| Cards inlined match cards.json, no evidence_spans shipped | (eng.) | PASS |
| Sample URL re-verify (7/21 rows) | C-04 | 6 PASS, 1 FAIL (row 14) |
| `.ent` elements real, not hidden/empty | C-14 | PASS (no gaming) |
| 3 SVG charts real, ≥20 elements each | C-14 | PASS (no gaming) |
| `verify_verbatim.py` unmodified | C-14 | PASS (no gaming) |
| Guide-card text matches beyond script conversion | C-14 | **FAIL** — 指標→指针 mistranslation, 15/15 occurrences, both body and cards, digest-cn.html only |
| Constitution vs. orchestrator's own article.md edits | C-01 / process | FLAG — constitution.md text is stale (says "sole" authorized change; 3 exist, all traceable to dated Bek/G4 rulings) |
| Orchestrator's own reverify claim (SPACE URL) | C-14 | FLAG — unreproduced on identical re-query, not confirmed as fabrication but not confirmed as true either |
| Route generation, both slugs | — | PASS |
| C-11 byte-identical embed | C-11 | PASS |
| `npm ci && npx next build`, both routes in output | C-13 | PASS |
| Homepage + sitemap include both | C-13 | PASS |

## Recommended next actions (not performed — outside checker's file territory)
1. **digest-cn.html must be regenerated/fixed**: global find-replace `指针`→`指标` (verify no genuine CS-pointer usage exists elsewhere in the article before blanket-replacing — none was found in this article, all 15 occurrences are in the "metric" sense).
2. **constitution.md C-01 clause** should be updated to name all three authorized article.md changes (GitClear year, Gartner caveat, pass@k/pass^k attribution), each with its dated ruling reference, or an appeal should be filed to reconcile the mismatch.
3. **Row 14 (SPACE framework / ACM Queue URL) and the orchestrator's own reverify claim about it** should go to Bek/ESCALATE for a documented decision — either accept the DOI-based indirect corroboration explicitly as sufficient (and say so in the record), or treat the card/appendix note for this source per C-05 (unverified span, not a broken link since the source itself is well-attested elsewhere, but the specific URL's reproducibility is unresolved).
