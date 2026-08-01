export const site = {
  name: "Bek 文章",
  tagline: "把公司編譯成 AI 用得上的系統。",
  author: "Bek Tsai",
  authorZh: "蔡奇峯",
  // Every name the author publishes under — keeps the Person entity consistent
  // for search/answer engines across all JSON-LD blocks.
  authorAliases: ["蔡奇峯", "Andy Tsai", "Bek"],
  url: "https://articles.bekhelpme.com",
  locale: "zh-TW",
  email: "bek8278728@gmail.com",
  phone: "0908 278 094",
  // sibling sites in the Bek brand
  links: {
    home: "https://www.bekhelpme.com",
    course: "https://4days.bekhelpme.com",
  },
} as const;

// Shared schema.org Person for every JSON-LD author/publisher reference.
export const authorPerson = {
  "@type": "Person",
  name: site.author,
  alternateName: [...site.authorAliases],
  sameAs: [site.links.home],
} as const;
