import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    server: {
      port: 3000,
    },
  },
  title: "CPZ Vault",
  description: "A personal knowledge vault",
  themeConfig: {
    nav: [
      { text: "笔记", link: "/" },
      { text: "关于", link: "/about" },
    ],

    sidebar: undefined,

    socialLinks: [
      { icon: "github", link: "https://github.com/wangcheng0920/cpz-vault" },
    ],
  },
});
