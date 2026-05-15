import fs from "fs-extra";
import handlebars from "handlebars";
import path from "path";

const postTpl = await fs.readFile(
  path.resolve(process.cwd(), "./templates/post.md.hbs"),
  "utf-8",
);
const postTemplate = handlebars.compile(postTpl);

/**
 * 将数字补齐为两位字符串。
 *
 * @param {number} value - 需要补齐的数字。
 * @returns {string} 补齐后的两位字符串。
 */
const padNumber = (value: number) => String(value).padStart(2, "0");

/**
 * 将日期格式化为 frontmatter 使用的时间字符串。
 *
 * @param {Date} date - 需要格式化的日期对象。
 * @returns {string} 格式化后的 YYYY-MM-DD HH:mm:ss 字符串。
 */
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());
  const hour = padNumber(date.getHours());
  const minute = padNumber(date.getMinutes());
  const second = padNumber(date.getSeconds());

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

/**
 * 将标题转换为可安全用于文件名的 slug。
 *
 * @param {string} title - 原始文章标题。
 * @returns {string} 处理后的文件名片段。
 */
const toFileName = (title: string) =>
  title
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-");

/**
 * 读取目标目录中的文章文件，生成下一个可用的数字前缀。
 *
 * @param {string} directoryPath - 文章输出目录。
 * @returns {Promise<string>} 下一个补零后的数字前缀。
 */
const getNextPostPrefix = async (directoryPath: string) => {
  await fs.ensureDir(directoryPath);

  const fileNames = await fs.readdir(directoryPath);
  const prefixMatches = fileNames
    .map((fileName) => fileName.match(/^(\d+)(?:-.*)?\.md$/))
    .filter((match): match is RegExpMatchArray => match !== null);

  const maxPrefix = prefixMatches.reduce(
    (currentMax, match) => Math.max(currentMax, Number.parseInt(match[1], 10)),
    0,
  );
  const prefixWidth = Math.max(
    2,
    ...prefixMatches.map((match) => match[1].length),
  );

  return String(maxPrefix + 1).padStart(prefixWidth, "0");
};

/**
 * 根据标题创建文章文件，并写入对应年月目录。
 *
 * @param {string} title - 用户输入的文章标题。
 * @returns {Promise<string>} 生成后的文章绝对路径。
 */
const createPost = async (title: string) => {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = padNumber(now.getMonth() + 1);
  const outputDir = path.resolve(process.cwd(), "./docs/posts", year, month);
  const titleSlug = toFileName(title);
  const postPrefix = await getNextPostPrefix(outputDir);
  const titleWithPrefix = titleSlug ? `${postPrefix}-${titleSlug}` : postPrefix;
  const fileName = `${titleWithPrefix}.md`;
  const result = postTemplate({
    title: title || "Draft Post",
    date: formatDate(now),
  });

  const outputPath = path.resolve(outputDir, fileName);

  await fs.outputFile(outputPath, result);

  return outputPath;
};

export default createPost;
