# 千牛卫 (AI 商品素材生成助手)

**千牛卫** 是一款专为电商（如淘宝、天猫、京东、拼多多、小红书等）卖家打造的、运行于浏览器端的免服务器 AI 助手与商品资产库管理系统 (CMS)。采用完全的 **BYOK (Bring Your Own Key)** 模式，兼顾数据隐私安全与高灵活度。

---

## ✨ 核心功能 (Core Features)

1. **高颜值玻璃拟态界面 (Premium Glassmorphic Design)**
   - 精致的深空夜色微光主题与明亮模式一键切换。
   - 沉浸式毛玻璃卡片、微交互悬浮卡片、防抖加载骨架屏与顺滑动画反馈。

2. **多语言国际化支持 (i18n)**
   - 原生支持 **简体中文 (zh-CN)**、**繁體中文 (zh-TW)** 和 **English (en)**。
   - UI 文本、占位符、操作状态及提示语一键瞬时翻译。

3. **原提示词高度自定义与模版管理 (Prompt Template System)**
   - 内置经典爆款、国潮年轻化、硬核参数等多款预设模版。
   - 原提示词在工作区**完全开放编辑**，允许使用 `{productName}`, `{category}`, `{keywords}`, `{channel}` 占位符进行动态渲染。
   - 支持将优秀提示词一键另存为新模版，并支持自定义模版的删除，持久化存储于浏览器 `localStorage` 中。

4. **特定平台物料分子嵌入 (E-commerce Channel Optimization)**
   - 针对不同发布渠道（淘宝、天猫、拼多多等）进行定制生成。
   - 选择 **淘宝 (Taobao)** 时，系统自动在提示词中追加包含 `￥{}` 形式的特定电商占位符号规则，使 AI 生成的 SEO 标题和宝贝详情文案完美适配淘宝特定的促销模块。

5. **Google Gemini 直连驱动 (BYOK API)**
   - 用户填入自己的 Google AI Studio Key 即可启用。
   - 强制启用 `application/json` 结构化输出模式，保证 SEO 标题、宝贝描述、主图作图提示词、详情图作图提示词的精准分离。
   - 生成的各项文案和作图词（可复制给其他 Midjourney/SD/Flux 绘图工具）均提供一键复制按钮。

6. **GitHub 商品资产管理库 (GitHub CMS Integration)**
   - 用户填入 GitHub Personal Access Token 和仓库即可启用。
   - **保存**: 自动转换为 UTF-8 Base64 并保存为 `product/{category}/{unique-id}.json` 资产文件。
   - **资产浏览器**: 单次 API 请求即可递归抓取仓库内 `product/` 目录下全部商品，且支持过滤搜索与刷新。
   - **载入与修改**: 支持一键加载已保存的商品至工作区，自动进入**修改状态**，保存时利用 SHA 锁覆盖原文件，杜绝文件重复冗余。

---

## 🛠️ 技术栈 (Tech Stack)

* **框架 (Core)**: React 19 + TypeScript + Vite 8
* **样式 (Styling)**: Vanilla CSS + Glassmorphism 变量换肤
* **图标 (Icons)**: Lucide React
* **外部 API (APIs)**: Google Gemini API (AI Studio), GitHub Contents/Git Trees REST API

---

## 🚀 快速开始 (Quick Start)

### 1. 本地启动

克隆项目并进入目录：
```powershell
npm install
npm run dev
```

### 2. 生产打包

```powershell
npm run build
```
打包产物将位于 `dist/` 文件夹中。由于本项目是 100% 纯静态单页面应用，您可以直接将 `dist` 目录托管到 GitHub Pages、Vercel、Netlify 或任何静态服务器上。

---

## ⚙️ 配置中心指南 (BYOK Configuration)

为开启完整体验，请在侧边栏配置中心填入以下密钥（仅存储在您的浏览器 LocalStorage 中，不会泄露给第三方）：
1. **Gemini API Key**: 前往 [Google AI Studio](https://aistudio.google.com/) 免费获取。
2. **GitHub Token**: 前往 GitHub Developer Settings 生成一个具有对应 Repo 读写权限 (Contents) 的 `Personal Access Token (classic)`。
3. **GitHub Repo**: 填写格式为 `用户名/仓库名` (如 `octocat/my-products`)。
4. **Target Branch**: 默认填 `main` 或 `master`。

---

## 💾 数据存储与持久化结构 (Data Storage & Persistence Architecture)

本项目遵循完全的客户端自治架构，所有数据持久化均通过 **本地浏览器 (LocalStorage)** 和 **远端 GitHub 仓库 (REST API)** 协作完成。

### 1. 本地浏览器持久化 (LocalStorage Schema)

应用运行期间，会将配置参数、草稿以及自定义模板零散地以单键值对方式扁平存储，防止数据在页面意外刷新时丢失。

| 本地存储键名 (Local Storage Key) | 存储类型 (Type) | 说明 (Description) |
| :--- | :--- | :--- |
| `qianniu_gemini_key` | `string` | 用户的 Google AI Studio Gemini API Key |
| `qianniu_github_token` | `string` | 用户的 GitHub Personal Access Token (classic) |
| `qianniu_github_repo` | `string` | 绑定的 GitHub 仓库路径 (格式: `owner/repo`，已做过滤校验) |
| `qianniu_github_branch` | `string` | 提交资产的目标 Git 分支 (例如: `main`) |
| `qianniu_gemini_model` | `string` | 当前选用的 Gemini 模型名称 (例如: `gemini-2.5-flash`) |
| `qianniu_theme` | `'dark' \| 'light'` | 全局视觉主题 (默认: `'dark'`) |
| `qianniu_lang` | `'zh-CN' \| 'zh-TW' \| 'en'` | 全局语言环境 (默认: `'zh-CN'`) |
| `qn_draft_product_name` | `string` | 当前输入区商品名称草稿 (自动保存) |
| `qn_draft_category` | `string` | 当前输入区商品类目草稿 (自动保存) |
| `qn_draft_keywords` | `string` | 当前输入区商品卖点/主题词草稿 (自动保存) |
| `qn_draft_channel` | `string` | 当前选用的发布渠道 (自动保存) |
| `qn_selected_template_id`| `string` | 上次选中的提示词模版 ID (自动保存) |
| `qn_edited_prompt_text` | `string` | 提示词编辑器中实时修改的原始提示词草稿 (自动保存) |
| `qianniu_custom_templates`| `JSON Array` | 本地存储的自定义提示词模版列表 (格式见下文) |

---

### 2. 远端 GitHub 持久化结构 (GitHub Remote Schema)

#### 📦 A. 商品资产文件
* **存储路径**: `product/{category}/{unique-id}.json`
  - `{category}`: 由商品分类名过滤特殊字符并转为小写字母后的安全目录名。
  - `{unique-id}`: 生成资产时的随机唯一 ID（格式：`prod_时间戳_随机字符`，如 `prod_1719391032_abc12`）。
* **商品资产 JSON 数据结构**:
```json
{
  "id": "prod_1719391032_abc12",
  "productName": "防晒冰丝防紫外线冰袖",
  "category": "户外运动/服饰配件",
  "keywords": "透气, 凉感, 强力防晒",
  "channel": "淘宝",
  "title": "【限时狂欢】￥{包邮} ￥{热销} 冰丝防晒冰袖女夏季户外骑行防紫外线...",
  "description": "一段详细的宝贝描述，突出核心卖点、规格参数及购买保障的宣传文案...",
  "mainImagePrompt": "A creative e-commerce main product photography of cooling arm sleeves, studio lighting...",
  "detailImagePrompt": "Close-up detail shot of breathable texture on arm sleeves, soft natural light..."
}
```

#### 📝 B. 提示词模版同步文件
* **存储路径**: `prompt.json` (位于仓库根目录)
* **模版同步 JSON 数据结构**:
```json
[
  {
    "id": "custom-1719391500000",
    "name": "极简日系风文案",
    "nameEn": "Minimalist Japanese Style Copy",
    "nameTw": "極簡日系風文案",
    "isSystem": false,
    "promptText": "你是一个严谨的产品文案大师，为 {channel} 编写以下商品的高转化率文案：\n- 商品名: {productName}\n- 分类: {category}\n..."
  }
]
```
*提示：系统从 GitHub 拉取 `prompt.json` 时，会自动过滤非法项并为缺失 ID/翻译字段的模板填充默认缺省值，确保 UI 渲染及切换的稳定性。*
