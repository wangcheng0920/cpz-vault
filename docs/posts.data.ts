import { createContentLoader } from "vitepress";
import * as cheerio from "cheerio";

export function extractFirst3Paragraphs(html: string): string {
  const $ = cheerio.load(html);

  return $("p")
    .slice(0, 3)
    .map((_, el) => $(el).text().trim())
    .get()
    .join("");
}

export default createContentLoader("posts/**/*.md", {
  // includeSrc: true, // 包含原始 markdown 源?
  render: true, // 包含渲染的整页 HTML?
  excerpt: true, // 包含摘录?
  transform(rawData) {
    // 根据需要对原始数据进行 map、sort 或 filter
    // 最终的结果是将发送给客户端的内容

    return rawData
      .sort((a, b) => {
        return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date);
      })
      .map((page) => {
        // page.src; // 原始 markdown 源
        // page.html; // 渲染的整页 HTML
        // page.excerpt; // 渲染的摘录 HTML（第一个 `---` 上面的内容）
        return {
          title: page.frontmatter.title,
          date: page.frontmatter.date,
          description: page.frontmatter.description,
          url: page.url,
          excerpt: extractFirst3Paragraphs(page.html ?? ""),
        };
      });
  },
});
