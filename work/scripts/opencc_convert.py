#!/usr/bin/env python3
"""
Convert Traditional Chinese HTML to Simplified Chinese while preserving URLs and critical terms.

This script:
1. Protects all URLs with unique placeholders
2. Protects critical terminology that tw2sp mistranslates
3. Converts remaining text using OpenCC (tw2sp config)
4. Restores URLs and terms byte-for-byte from their maps
5. Fixes copy-button label
6. Sets lang="zh-Hans"
7. Removes language-switch links
"""

import re
import sys
from opencc import OpenCC

# Term protection map: Traditional forms that tw2sp converts incorrectly
# Each entry is: Traditional -> (tw2sp_wrong_form, correct_simplified_form, reason)
# Ordered by length (longest first) to handle overlapping matches correctly
TERM_PROTECT_MAP = [
    ('開啟中', '打开中', '开启中', 'tw2sp mistranslates "opening" verb to "opened", loses progressive aspect'),
    ('高階', '高端', '高层', 'tw2sp uses "high-end" (商业术语), should be "high-level" (管理术语)'),
    ('建立', '创建', '建立', 'tw2sp uses "create" (coding jargon), should be "establish" (process verb)'),
    ('核心', '内核', '核心', 'tw2sp uses "kernel" (OS term), should be "core" (conceptual term)'),
    ('指標', '指针', '指标', 'tw2sp uses "pointer" (programming construct), should be "metric" — this essay is about metrics'),
]

def convert_traditional_to_simplified():
    # Read the input file
    input_path = '/home/user/articles-bekhelpme/work/digest.html'
    output_path = '/home/user/articles-bekhelpme/work/digest-cn.html'

    with open(input_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Step 1: Protect all URLs with placeholders
    url_pattern = r'https?://[^"\s<>]+'
    url_map = {}
    url_counter = [0]  # Use list to allow modification in nested function

    def replace_url(match):
        url = match.group(0)
        placeholder = f'__URL_PLACEHOLDER_{url_counter[0]}__'
        url_map[placeholder] = url
        url_counter[0] += 1
        return placeholder

    html_with_placeholders = re.sub(url_pattern, replace_url, html_content)

    # Step 2: Protect critical terms that tw2sp would mistranslate
    term_map = {}
    term_counter = [0]

    def replace_term(traditional_form):
        def replacer(match):
            placeholder = f'__TERM_PLACEHOLDER_{term_counter[0]}__'
            term_map[placeholder] = traditional_form  # Store the correct simplified form to restore later
            term_counter[0] += 1
            return placeholder
        return replacer

    # Protect each term (already ordered longest-first to avoid overlapping matches)
    for traditional, wrong_form, correct_form, reason in TERM_PROTECT_MAP:
        html_with_placeholders = re.sub(
            re.escape(traditional),
            replace_term(correct_form),
            html_with_placeholders
        )

    # Step 3: Convert text using OpenCC (tw2sp)
    converter = OpenCC('tw2sp')
    html_converted = converter.convert(html_with_placeholders)

    # Step 4: Restore URLs byte-for-byte
    for placeholder, url in url_map.items():
        html_converted = html_converted.replace(placeholder, url)

    # Step 5: Restore protected terms byte-for-byte (they were protected as Traditional, now restore as correct Simplified)
    for placeholder, correct_form in term_map.items():
        html_converted = html_converted.replace(placeholder, correct_form)

    # Step 6: Fix copy-button label: 拷贝 → 复制
    # The original should have 複製 in Traditional, which converts to 拷贝 in Simplified
    # We need to replace it with 复制
    html_converted = html_converted.replace('拷贝', '复制')

    # Step 7: Set lang="zh-Hans" on the <html> element
    html_converted = html_converted.replace('lang="zh-Hant"', 'lang="zh-Hans"')

    # Step 8: Remove language-switch link
    # Remove any link that contains digest.html, 語言切換, 繁體版, or measuring-the-half-ai-does-better
    # The pattern to remove could be a full link tag or partial text
    # We'll be conservative and look for common patterns

    # Remove the entire link if it references digest.html
    html_converted = re.sub(
        r'<a[^>]*href=["\']digest\.html["\'][^>]*>.*?</a>',
        '',
        html_converted,
        flags=re.IGNORECASE | re.DOTALL
    )

    # Remove any link with measuring-the-half-ai-does-better (the other language version ID)
    html_converted = re.sub(
        r'<a[^>]*measuring-the-half-ai-does-better[^>]*>.*?</a>',
        '',
        html_converted,
        flags=re.IGNORECASE | re.DOTALL
    )

    # Remove text like 繁體版 or 語言切換 that might be switch links
    html_converted = re.sub(
        r'<a[^>]*>[\s]*[繁体體][體]版[\s]*</a>',
        '',
        html_converted
    )

    html_converted = re.sub(
        r'<a[^>]*>[\s]*語言切換[\s]*</a>',
        '',
        html_converted
    )

    # Write output file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_converted)

    print(f"✓ Conversion complete: {output_path}")
    print(f"✓ Protected and restored {len(url_map)} URLs")
    print(f"✓ Protected and restored {len(term_map)} critical terms")
    print(f"✓ Language set to zh-Hans")
    print(f"✓ Copy-button label fixed")

    return output_path

if __name__ == '__main__':
    convert_traditional_to_simplified()
