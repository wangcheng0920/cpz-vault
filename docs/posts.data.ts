import { createContentLoader } from "vitepress";
import type { ContentData } from "vitepress";
import * as cheerio from "cheerio";
import dayjs from "dayjs";
import type { PostCard } from "./types";

/**
 * 提取 HTML 中前 N 个段落的纯文本内容。
 *
 * @param {string} html - 渲染后的 HTML 字符串。
 * @param {number} count - 需要提取的段落数量。
 * @returns {string} 拼接后的段落文本。
 */
export function extractFirstNParagraphs(html: string, count = 3): string {
  const $ = cheerio.load(html);

  return $("p")
    .slice(0, count)
    .map((_, el) => $(el).text().trim())
    .get()
    .join("");
}

/**
 * 按文章日期倒序排列原始内容数据。
 *
 * @param {ContentData} left - 左侧文章数据。
 * @param {ContentData} right - 右侧文章数据。
 * @returns {number} 排序比较结果。
 */
function comparePostByDate(left: ContentData, right: ContentData): number {
  return right.frontmatter.date - left.frontmatter.date;
}

/**
 * 将原始文章数据转换为首页卡片数据。
 *
 * @param {ContentData} page - 原始文章数据。
 * @returns {PostCard} 供页面渲染使用的文章卡片。
 */
function toPostCard(page: ContentData): PostCard {
  return {
    title: page.frontmatter.title,
    date: dayjs(page.frontmatter.date).format("YYYY-MM-DD"),
    description: page.frontmatter.description,
    url: page.url,
    excerpt: extractFirstNParagraphs(page.html ?? ""),
  };
}

export default createContentLoader("posts/**/*.md", {
  // includeSrc: true, // 包含原始 markdown 源?
  render: true, // 包含渲染的整页 HTML?
  excerpt: true, // 包含摘录?
  /**
   * 将 VitePress 读取到的原始文章数据转换为文章卡片列表。
   *
   * @param {ContentData[]} rawData - 原始文章数据数组。
   * @returns {PostCard[]} 首页文章卡片数组。
   */
  transform(rawData): PostCard[] {
    // 根据需要对原始数据进行 map、sort 或 filter
    // 最终的结果是将发送给客户端的内容
    return rawData.sort(comparePostByDate).map(toPostCard);
  },
});
