/**
 * Serialize a JSON-LD object for safe embedding inside a <script> tag.
 * Escapes `<` (so a value containing `</script>` cannot break out) plus the
 * U+2028 / U+2029 separators that are invalid in raw JS string contexts.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
