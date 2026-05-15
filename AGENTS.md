# AI Coding 规范（Agent Spec）

本文件用于约束 AI（智能体）在本项目中生成代码的规范，确保代码风格一致、可维护、可阅读。

---

## 1. 函数注释规范（必须）

所有函数必须使用 **JSDoc 风格注释**，禁止使用其他形式的注释替代（如普通 `//` 描述函数用途）。

### 1.1 基本格式

```js
/**
 * 函数描述（必须简洁清晰）
 *
 * @param {type} paramName - 参数说明
 * @returns {type} 返回值说明
 */
function example(paramName) {
  return paramName;
}
```
