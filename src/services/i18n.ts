export type Language = 'zh-CN' | 'zh-TW' | 'en';

export interface Translations {
  appName: string;
  appSubtitle: string;
  settings: string;
  apiSettings: string;
  geminiKey: string;
  geminiKeyPlaceholder: string;
  githubToken: string;
  githubTokenPlaceholder: string;
  githubRepo: string;
  githubRepoPlaceholder: string;
  githubBranch: string;
  githubBranchPlaceholder: string;
  saveSettings: string;
  settingsSaved: string;
  apiKeyMissing: string;
  githubMissing: string;
  
  // Forms
  productDetails: string;
  productName: string;
  productNamePlaceholder: string;
  category: string;
  categoryPlaceholder: string;
  keywords: string;
  keywordsPlaceholder: string;
  channel: string;
  
  // Prompt settings
  promptConfig: string;
  promptTemplate: string;
  editPrompt: string;
  saveAsTemplate: string;
  deleteTemplate: string;
  templateNamePrompt: string;
  templateSaved: string;
  templateDeleted: string;
  confirmDeleteTemplate: string;

  // Actions
  generateBtn: string;
  generatingBtn: string;
  saveToGithubBtn: string;
  savingBtn: string;
  saveSuccess: string;
  saveError: string;
  copySuccess: string;
  copyBtn: string;
  clearBtn: string;

  // Results
  resultsTitle: string;
  seoTitle: string;
  seoTitleDesc: string;
  description: string;
  descriptionDesc: string;
  mainImagePrompt: string;
  mainImagePromptDesc: string;
  detailImagePrompt: string;
  detailImagePromptDesc: string;

  // Product Browser
  savedProducts: string;
  refreshBtn: string;
  searchPlaceholder: string;
  noProducts: string;
  loadProduct: string;
  editProduct: string;
  id: string;
  date: string;
  confirmLoad: string;
  loadSuccess: string;
}

export const translations: Record<Language, Translations> = {
  'zh-CN': {
    appName: '千牛 AI 商品素材生成助手',
    appSubtitle: '为淘宝、天猫等平台一键生成 SEO 标题、文字描述及 AI 作图提示词',
    settings: '配置中心',
    apiSettings: 'API 配置 (BYOK)',
    geminiKey: 'Gemini API 密钥',
    geminiKeyPlaceholder: '请输入 AI Studio API Key...',
    githubToken: 'GitHub 访问令牌 (Token)',
    githubTokenPlaceholder: '请输入 GitHub Personal Access Token...',
    githubRepo: 'GitHub 仓库地址',
    githubRepoPlaceholder: '格式: 用户名/仓库名 (例如: owner/repo)',
    githubBranch: '提交分支',
    githubBranchPlaceholder: '例如: main 或 master',
    saveSettings: '保存配置',
    settingsSaved: '配置已安全保存到本地浏览器！',
    apiKeyMissing: '请先在配置中心填写 Gemini API 密钥！',
    githubMissing: '请先在配置中心填写完整的 GitHub Token 和仓库信息！',
    
    productDetails: '商品基本信息',
    productName: '商品名称',
    productNamePlaceholder: '例如：防晒冰丝防紫外线冰袖',
    category: '商品类目',
    categoryPlaceholder: '例如：户外运动/服饰配件',
    keywords: '核心主题词/卖点',
    keywordsPlaceholder: '例如：透气, 凉感, 强力防晒, 多色可选',
    channel: '发布平台渠道',
    
    promptConfig: 'AI 提示词模版配置',
    promptTemplate: '提示词模版选择',
    editPrompt: '当前使用提示词内容 (可自由编辑)',
    saveAsTemplate: '保存为新模板',
    deleteTemplate: '删除此模板',
    templateNamePrompt: '请输入新模版名称：',
    templateSaved: '模版已保存！',
    templateDeleted: '模版已删除！',
    confirmDeleteTemplate: '确定要删除这个模版吗？',

    generateBtn: 'AI 一键生成物料',
    generatingBtn: 'AI 正在努力生成中...',
    saveToGithubBtn: '保存至 GitHub 仓库',
    savingBtn: '正在同步到 GitHub...',
    saveSuccess: '成功保存到 GitHub product/{category} 目录下！',
    saveError: '保存失败，请检查 GitHub 配置及 Token 权限！',
    copySuccess: '复制成功！',
    copyBtn: '一键复制',
    clearBtn: '重置表单',

    resultsTitle: 'AI 生成物料结果',
    seoTitle: 'SEO 优化商品标题',
    seoTitleDesc: '适合特定平台的 SEO 关键词堆叠与吸睛标题',
    description: '宝贝文字详细描述',
    descriptionDesc: '突出核心卖点、规格参数及购买保障的宣传文案',
    mainImagePrompt: '主图 AI 作图提示词',
    mainImagePromptDesc: '可直接复制到 Midjourney / Stable Diffusion / Flux 中生成主图',
    detailImagePrompt: '详情图 AI 作图提示词',
    detailImagePromptDesc: '可直接复制到 Midjourney / Stable Diffusion / Flux 中生成详情页配图',

    savedProducts: 'GitHub 商品资产库',
    refreshBtn: '刷新列表',
    searchPlaceholder: '搜索已保存的商品...',
    noProducts: '暂无已保存的商品或尚未配置 GitHub。',
    loadProduct: '加载内容',
    editProduct: '编辑此商品',
    id: '商品ID',
    date: '保存时间',
    confirmLoad: '加载此商品将覆盖当前工作区的输入和结果，是否继续？',
    loadSuccess: '商品数据已成功载入工作区！',
  },
  'zh-TW': {
    appName: '千牛 AI 商品素材生成助手',
    appSubtitle: '為淘寶、天貓等平台一鍵生成 SEO 標題、文字描述及 AI 作圖提示詞',
    settings: '配置中心',
    apiSettings: 'API 配置 (BYOK)',
    geminiKey: 'Gemini API 金鑰',
    geminiKeyPlaceholder: '請輸入 AI Studio API Key...',
    githubToken: 'GitHub 存取權杖 (Token)',
    githubTokenPlaceholder: '請輸入 GitHub Personal Access Token...',
    githubRepo: 'GitHub 倉庫地址',
    githubRepoPlaceholder: '格式: 用戶名/倉庫名 (例如: owner/repo)',
    githubBranch: '提交分支',
    githubBranchPlaceholder: '例如: main 或 master',
    saveSettings: '保存配置',
    settingsSaved: '配置已安全保存至本地瀏覽器！',
    apiKeyMissing: '請先在配置中心填寫 Gemini API 金鑰！',
    githubMissing: '請先在配置中心填寫完整的 GitHub Token 和倉庫資訊！',
    
    productDetails: '商品基本資訊',
    productName: '商品名稱',
    productNamePlaceholder: '例如：防曬冰絲防紫外線冰袖',
    category: '商品類目',
    categoryPlaceholder: '例如：戶外運動/服飾配件',
    keywords: '核心主題詞/賣點',
    keywordsPlaceholder: '例如：透氣, 涼感, 強力防曬, 多色可選',
    channel: '發佈平台渠道',
    
    promptConfig: 'AI 提示詞模版配置',
    promptTemplate: '提示詞模版選擇',
    editPrompt: '當前使用提示詞內容 (可自由編輯)',
    saveAsTemplate: '保存為新模板',
    deleteTemplate: '刪除此模板',
    templateNamePrompt: '請輸入新模版名稱：',
    templateSaved: '模版已保存！',
    templateDeleted: '模版已刪除！',
    confirmDeleteTemplate: '確定要刪除這個模版嗎？',

    generateBtn: 'AI 一鍵生成物料',
    generatingBtn: 'AI 正在努力生成中...',
    saveToGithubBtn: '保存至 GitHub 倉庫',
    savingBtn: '正在同步至 GitHub...',
    saveSuccess: '成功保存至 GitHub product/{category} 目錄下！',
    saveError: '保存失敗，請檢查 GitHub 配置及 Token 權限！',
    copySuccess: '複製成功！',
    copyBtn: '一鍵複製',
    clearBtn: '重置表單',

    resultsTitle: 'AI 生成物料結果',
    seoTitle: 'SEO 優化商品標題',
    seoTitleDesc: '適合特定平台的 SEO 關鍵字堆疊與吸睛標題',
    description: '寶貝文字詳細描述',
    descriptionDesc: '突出核心賣點、規格參數及購買保障的宣傳文案',
    mainImagePrompt: '主圖 AI 作圖提示詞',
    mainImagePromptDesc: '可直接複製到 Midjourney / Stable Diffusion / Flux 中生成主圖',
    detailImagePrompt: '詳情圖 AI 作作圖提示詞',
    detailImagePromptDesc: '可直接複製到 Midjourney / Stable Diffusion / Flux 中生成詳情頁配圖',

    savedProducts: 'GitHub 商品資產庫',
    refreshBtn: '重新整理',
    searchPlaceholder: '搜尋已保存的商品...',
    noProducts: '暫無已保存的商品或尚未配置 GitHub。',
    loadProduct: '載入內容',
    editProduct: '編輯此商品',
    id: '商品ID',
    date: '保存時間',
    confirmLoad: '載入此商品將覆蓋當前工作區的輸入和結果，是否繼續？',
    loadSuccess: '商品數據已成功載入工作區！',
  },
  'en': {
    appName: 'Qianniu AI Product Asset Assistant',
    appSubtitle: 'Generate SEO titles, descriptions, and image prompts for Taobao, Tmall, etc.',
    settings: 'Configuration Center',
    apiSettings: 'API Settings (BYOK)',
    geminiKey: 'Gemini API Key',
    geminiKeyPlaceholder: 'Enter AI Studio API Key...',
    githubToken: 'GitHub Access Token',
    githubTokenPlaceholder: 'Enter GitHub Personal Access Token...',
    githubRepo: 'GitHub Repository',
    githubRepoPlaceholder: 'Format: owner/repo (e.g. owner/repo)',
    githubBranch: 'Target Branch',
    githubBranchPlaceholder: 'e.g. main or master',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved to browser local storage!',
    apiKeyMissing: 'Please input your Gemini API Key in the settings first!',
    githubMissing: 'Please input complete GitHub settings (Token, Repo) first!',
    
    productDetails: 'Product Details',
    productName: 'Product Name',
    productNamePlaceholder: 'e.g. UV-proof Ice Silk cooling arm sleeves',
    category: 'Product Category',
    categoryPlaceholder: 'e.g. Outdoor Sports/Apparel Accessories',
    keywords: 'Theme Keywords / USP',
    keywordsPlaceholder: 'e.g. breathable, cool-feeling, SPF50+, multiple colors',
    channel: 'Target Channel',
    
    promptConfig: 'AI Prompt Template Settings',
    promptTemplate: 'Select Prompt Template',
    editPrompt: 'Current Prompt Text (Editable)',
    saveAsTemplate: 'Save as New Template',
    deleteTemplate: 'Delete This Template',
    templateNamePrompt: 'Please enter a name for the new template:',
    templateSaved: 'Template saved successfully!',
    templateDeleted: 'Template deleted successfully!',
    confirmDeleteTemplate: 'Are you sure you want to delete this template?',

    generateBtn: 'AI One-Click Generate',
    generatingBtn: 'AI is generating...',
    saveToGithubBtn: 'Save to GitHub Repo',
    savingBtn: 'Syncing to GitHub...',
    saveSuccess: 'Successfully saved to GitHub under product/{category}/!',
    saveError: 'Failed to save. Please verify GitHub settings & token permissions.',
    copySuccess: 'Copied to clipboard!',
    copyBtn: 'Copy',
    clearBtn: 'Reset Form',

    resultsTitle: 'AI Generated Assets',
    seoTitle: 'SEO Optimized Product Title',
    seoTitleDesc: 'E-commerce platform optimized SEO title with high CTR keyword stacking',
    description: 'Product Detail Description',
    descriptionDesc: 'Copywriting highlighting key sell points, specs, and guarantee details',
    mainImagePrompt: 'Main Image AI Prompt',
    mainImagePromptDesc: 'Directly copy to Midjourney / Stable Diffusion / Flux to generate product main image',
    detailImagePrompt: 'Detail Page AI Prompt',
    detailImagePromptDesc: 'Directly copy to Midjourney / Stable Diffusion / Flux to generate detail page illustrations',

    savedProducts: 'GitHub Assets Library',
    refreshBtn: 'Refresh List',
    searchPlaceholder: 'Search saved products...',
    noProducts: 'No saved products found or GitHub is not configured.',
    loadProduct: 'Load Content',
    editProduct: 'Edit Product',
    id: 'Product ID',
    date: 'Save Time',
    confirmLoad: 'Loading this item will overwrite your current workspace. Continue?',
    loadSuccess: 'Product data loaded into workspace successfully!',
  }
};
