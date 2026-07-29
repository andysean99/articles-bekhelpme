# Chart takeaways & source mapping

Colors used in every chart come only from `work/bootstrap/design-system.css`:
`--s1` (celadon, light `#177A5B` / dark `#2FA079`) and `--s2` (indigo, light
`#4661C2` / dark `#6B7FE0`), plus the existing ink/hair/surface tokens. No new
hues introduced. Palette validated with the dataviz skill's
`scripts/validate_palette.js` for both modes — see verification log below.

---

## 1. `metr-gap.svg` — METR：39 個百分點的落差

**Takeaway (for `<figcaption>`):**
> METR 的隨機對照試驗發現，開發者事前預測 AI 會讓自己快 24%、事後回想覺得快了
> 20%，但實測結果卻慢了 19%，感受與事實之間相差 39 個百分點。

**Numbers → source line in `article.md`:**
- "+24%"（開工前預測）→ line 11: 「開工前，開發者預測 AI 會讓他們快 24%。」
- "+20%"（事後回想）→ line 11: 「做完之後，他們回想，覺得自己快了 20%。」
- "−19%"（實測結果）→ line 13: 「實測結果是**慢了 19%**。」
- "39 個百分點" → line 7 heading: 「## 一個 39 個百分點的落差」（also line 15:
  「感覺與事實之間差了將近 40 個百分點」— chart uses the exact 39-point figure
  from the section heading, which is the more precise number: recalled +20%
  minus actual −19% = 39).

**Form:** diverging bar chart, zero baseline. Predicted/recalled (perception)
in `--s2` indigo; actual measured result in `--s1` celadon/accent — color
encodes the article's real distinction (subjective judgment vs. measured
fact), not decoration. Dimension bracket + caption make the 39-point gap
explicit without an extra number being invented.

---

## 2. `gitclear-crossover.svg` — GitClear：重構與複製貼上的交叉

**Takeaway (for `<figcaption>`):**
> GitClear 分析 2.11 億行程式碼變更發現，重構／搬移的程式碼佔比從 2020 年的
> 24.1%（約 25%）掉到 2024 年的 9.5%（不到 10%），複製貼上的程式碼從 8.3%
> 升到 12.3%，2024 年是複製貼上首度超過重構的一年。

**Numbers → source:**
- "2.11 億行程式碼變更（2020–2024）" → `article.md` line 35: 「GitClear 分析了
  2.11 億行程式碼變更（2020–2024…）」
- "約 25% → 不到 10%" (essay's stated approximation) → `article.md` line 35:
  「發現重構碼的佔比從 2020 年的約 25% 掉到 2024 年的不到 10%」
- "首度超過" → `article.md` line 35: 「複製貼上的程式碼首度超過搬移的程式碼」
- Precise figures printed on the chart — moved 24.1%→9.5%, copy-paste
  8.3%→12.3% — come from `work/sources/orchestrator.json` (two independently
  worded WebSearch queries both matched "moved lines 24.1% (2020) -> 9.5%
  (2024)" and "copy/paste 8.3% -> 12.3%", status `verified`, C-04 compliant).
  These are **strictly more precise than, and not contradictory with**, the
  essay's "約 25%" / "不到 10%" language, per the task's numeric rule.
  NOT used: "涵蓋 Google、微軟、Meta 等專案" — orchestrator.json flags this
  clause as unverified, so it is omitted from the chart entirely.

**Form:** two-point slope chart (2020 → 2024 only — no intermediate years are
invented). Moved/refactored code in `--s1`, copy-pasted code in `--s2`,
matching the "tell distinct series apart" job. The crossing is a direct,
honest consequence of connecting the two known endpoints, not an assertion
about the exact crossover date; the caption states only what the essay
supports ("2024 年…首度超過").

---

## 3. `passk-vs-passpowerk.svg` — pass@k vs pass^k

**Takeaway (for `<figcaption>`):**
> pass@k 是「跑 k 次至少成功一次」的機率，衡量能力上限；pass^k 是「跑 k 次全部
> 成功」的機率，衡量可靠度下限，pass@5 很高但 pass^5 很低的系統是「會做但不
> 穩定」。

**Numbers/definitions → source:**
- Definitions → `article.md` line 107: 「pass@k 是「跑 k 次至少成功一次」的
  機率，衡量能力上限；pass^k 是「跑 k 次全部成功」的機率，衡量可靠度下限。」
- k=5 example → `article.md` line 107: 「pass@5 很高但 pass^5 很低的系統，是
  「會做但不穩定」——對信任而言，那比不會做更糟。」

**Form:** this is a **conceptual diagram, not a data chart** — no percentages
or probabilities are shown or implied, only a schematic run of 5 illustrative
outcomes (3 success / 2 fail, generic — not attributed to any real system).
The same 5 outcomes are shown twice: once scored by OR-logic (pass@k — fail
runs dimmed because they don't change the verdict) and once by AND-logic
(pass^k — every run stays full-opacity because any single failure changes
the verdict). This directly visualizes *why* the two metrics diverge, which
is the essay's point, without inventing any data the essay doesn't state.

---

## Verification log

- Palette validator (`dataviz` skill, `scripts/validate_palette.js`):
  - Light: `node validate_palette.js "#177A5B,#4661C2" --mode light --surface "#FFFFFF"` → **ALL CHECKS PASS** (worst adjacent CVD ΔE 18.2 deutan, normal-vision ΔE 20.2, contrast ≥3:1)
  - Dark: `node validate_palette.js "#2FA079,#6B7FE0" --mode dark --surface "#1C1F1C"` → **ALL CHECKS PASS** (worst adjacent CVD ΔE 17.5 deutan, normal-vision ΔE 21.3, contrast ≥3:1)
- Rendered all three SVGs inline in an HTML harness using the real
  `design-system.css`, screenshotted with headless Chromium (Playwright) at
  900px (light + dark `color-scheme`) and at 375px mobile width — zero
  horizontal scroll (`scrollWidth === clientWidth === 375`), no label
  collisions, dual-theme colors resolve correctly via the three-tier CSS
  variable definitions (`:root`, `@media prefers-color-scheme: dark`,
  `:root[data-theme="dark"]`) embedded locally in each SVG's `<style>` block,
  matching C-10.
- `grep -in "http\|<img\|@import\|url("` over all three `.svg` files →
  no matches (no external references; xmlns attribute deliberately omitted
  since these are meant to be pasted inline into an HTML5 document, where
  the SVG namespace is assigned automatically by the parser).
- Every number appearing on every chart was traced to a specific line in
  `work/bootstrap/article.md` (verbatim) or to independently re-verified
  figures in `work/sources/orchestrator.json` (C-04 compliant, strictly more
  precise than and non-contradictory with the essay's rounded language) —
  see per-chart sections above. No number was invented.
