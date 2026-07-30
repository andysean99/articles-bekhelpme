#!/usr/bin/env python3
"""憲章 C-01 的檢查：成品 HTML 是否逐句保留了受保護的文章本體。

用法：
    python3 scripts/verify_verbatim.py work/bootstrap/article.md work/digest.html

把 markdown 來源拆成句子，逐句確認每一句都以純文字形式出現在 HTML 的可見內容裡。
差異數 0 → exit 0。任何一句找不到 → 印出缺漏原文並 exit 1。

設計上刻意「笨」：不做模糊比對、不做同義判定。它要抓的正是「agent 覺得改一下更順」
這種行為，所以任何改寫都必須是失敗。

⚠ 這個檔案本身是反作弊的檢查對象。M-05 會跑 `git diff scripts/` ——
若這支腳本在本輪被修改過，通過的結果一律作廢。
"""
import re
import sys
import unicodedata


def strip_html(html: str) -> str:
    """取出 HTML 的可見文字。移除 script/style（含導覽卡 JSON）後再去標籤。"""
    html = re.sub(r"<script\b.*?</script>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<style\b.*?</style>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    html = re.sub(r"<[^>]+>", "", html)
    # 只還原會出現在正文裡的實體；未列出的實體留原樣，寧可誤判失敗也不要放行
    for ent, ch in (("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"),
                    ("&quot;", '"'), ("&#39;", "'"), ("&nbsp;", " ")):
        html = html.replace(ent, ch)
    return html


def normalize(text: str) -> str:
    """正規化空白與全形變體，但不動任何實際字元。"""
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"\s+", "", text)
    return text


def sentences(markdown: str):
    """把 markdown 正文拆成待比對的句子。

    跳過：標題行、水平線、frontmatter 分隔線、空行。
    保留：一般段落、引用塊、清單項（附註九條是清單，屬最高保護級 C-03）。
    """
    out = []
    for raw in markdown.splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or set(line) <= set("-*_ "):
            continue
        line = re.sub(r"^>\s*", "", line)          # 引用符號
        line = re.sub(r"^[-*+]\s+", "", line)      # 清單符號
        line = line.replace("**", "").replace("`", "")
        # 中文句末標點切句；保留標點本身以免相鄰句黏在一起後互相掩護
        for part in re.split(r"(?<=[。！？])", line):
            part = part.strip()
            if len(normalize(part)) >= 8:          # 太短的片段容易誤中，交給相鄰句涵蓋
                out.append(part)
    return out


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    src_path, html_path = sys.argv[1], sys.argv[2]
    with open(src_path, encoding="utf-8") as f:
        source = f.read()
    with open(html_path, encoding="utf-8") as f:
        haystack = normalize(strip_html(f.read()))

    missing = [s for s in sentences(source) if normalize(s) not in haystack]

    if missing:
        print(f"FAIL — {len(missing)} 句未在成品中逐字出現：\n")
        for s in missing:
            print(f"  · {s}")
        print("\n受保護素材不得改寫。若你認為原文有誤，走 E1 上報，不要自行修正。")
        return 1

    print(f"PASS — {len(sentences(source))} 句全數逐字保留，差異數 0")
    return 0


if __name__ == "__main__":
    sys.exit(main())
