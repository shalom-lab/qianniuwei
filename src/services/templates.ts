export interface PromptTemplate {
  id: string;
  name: string;
  nameEn: string;
  nameTw: string;
  isSystem: boolean;
  promptText: string;
}

export const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'standard-ecommerce',
    name: '经典爆款电商模板 (推荐)',
    nameEn: 'Classic E-commerce Hot Seller (Recommended)',
    nameTw: '經典爆款電商模板 (推薦)',
    isSystem: true,
    promptText: `你是一个顶尖的电商运营专家，请根据以下商品信息，为 {channel} 平台生成高转化率的上架物料素材。

商品基本信息：
- 商品名称: {productName}
- 商品类目: {category}
- 核心主题词/卖点: {keywords}
- 发布平台渠道: {channel}

请严格按照以下 JSON 格式输出，不要包含任何 markdown 标记（如 \`\`\`json ），只需输出原始的 JSON 字符串：
{
  "title": "符合 {channel} 搜索 SEO 的 30 字以内商品标题，包含多个热门搜索词和修饰词，吸睛且有高点击率。",
  "description": "一段详细的宝贝描述，包含：1. 痛点唤醒与吸引点；2. 核心卖点详细展开；3. 规格参数与适用场景；4. 售后服务保障。排版整洁，多用emoji，利于阅读。",
  "mainImagePrompt": "为 AI 绘图软件（如 Midjourney/Flux/SD）准备的主图作图提示词（英文或英文关键词形式）。要求：突出商品主体，光影极佳，商用摄影级品质，画面干净，无文字杂质。",
  "detailImagePrompt": "为 AI 绘图软件准备的详情页配图作图提示词（英文或英文关键词形式）。要求：展示商品使用场景，多角度细节，质感特写，柔和自然光，商用级电商质感。"
}

特别规则：
1. 必须是完全合法的 JSON 格式。
2. 标题和描述要进行 SEO 优化，将核心主题词和卖点自然地融入进去。
3. 发布渠道如果是 "淘宝" (或 Taobao)，请在标题或描述的促销/重点词汇周围嵌入 "￥{}" 占位符，例如：【限时狂欢】￥{包邮} ￥{热销} {productName}，或者在正文中使用 ￥{买一送一} 等，以符合淘宝的特定物料格式。`
  },
  {
    id: 'trendy-guochao',
    name: '国风潮牌 / 年轻化文案',
    nameEn: 'Chinese Trendy / Youthful Copywriting',
    nameTw: '國風潮牌 / 年輕化文案',
    isSystem: true,
    promptText: `你是一个深谙年轻人心理的创意电商文案大师，请为 {channel} 平台生成符合新消费趋势、独具个性的国潮或年轻化商品物料。

商品信息：
- 商品名称: {productName}
- 商品类目: {category}
- 核心主题词/卖点: {keywords}
- 发布平台渠道: {channel}

请严格按照以下 JSON 格式输出，不要包含任何 markdown 标记（如 \`\`\`json ），只需输出原始的 JSON 字符串：
{
  "title": "富有张力、年轻化、结合国潮或时尚热梗的 SEO 优化商品标题（30字以内）。",
  "description": "宝贝文字描述。摒弃传统说教式文案，使用更有个性、共情力强的年轻化语调，突出产品的设计美学、社交属性和使用体验。穿插潮流颜文字和emoji。",
  "mainImagePrompt": "A highly creative, aesthetic e-commerce main product photography prompt (English). Style: cyberpunk, vaporwave, neo-chinese, or hyper-realistic studio lighting, pop colors, ultra-detailed, 8k resolution, suitable for Midjourney/Flux.",
  "detailImagePrompt": "Detail shot prompt (English). Close-up of the material, dynamic angles, moody lighting, modern lifestyle background, luxury textures, suitable for Midjourney/Flux."
}

特别规则：
1. 必须是完全合法的 JSON 格式。
2. 标题和描述要进行 SEO 优化，将核心主题词和卖点自然地融入进去。
3. 发布渠道如果是 "淘宝" (或 Taobao)，请在标题或描述的促销/重点词汇周围嵌入 "￥{}" 占位符，例如：【潮人必备】￥{免邮} ￥{限时特惠} {productName}，或者在正文中使用 ￥{立减} 等，以符合淘宝的特定物料格式。`
  },
  {
    id: 'tech-scientific',
    name: '硬核科技 / 专业参数卖点',
    nameEn: 'Hardcore Tech / Professional Specs',
    nameTw: '硬核科技 / 專業參數賣點',
    isSystem: true,
    promptText: `你是一个严谨的产品经理兼硬核文案策划，请根据以下信息，生成一份突出科技感、专业参数与实际痛点解决方案的物料。

商品信息：
- 商品名称: {productName}
- 商品类目: {category}
- 核心主题词/卖点: {keywords}
- 发布平台渠道: {channel}

请严格按照以下 JSON 格式输出，不要包含任何 markdown 标记（如 \`\`\`json ），只需输出原始的 JSON 字符串：
{
  "title": "突出技术特征、专业参数与核心解决方案的 SEO 优化商品标题（30字以内）。",
  "description": "宝贝文字描述。采用结构化的专业表述，逻辑清晰：1. 传统产品的痛点；2. 本品的技术突破与参数指标（数据化呈现）；3. 权威认证或严苛测试；4. 售后无忧保障。给用户极致的安全感。",
  "mainImagePrompt": "Professional tech product studio photography (English). Clean setup, sharp focus, technical blueprints background elements, subtle blue or neutral lighting, hyper-realistic, commercial render quality, suitable for Midjourney/Flux.",
  "detailImagePrompt": "Exploded view or close-up detail shot (English). Macro photography, carbon fiber or aluminum texture, glowing led details, clean background, 8k resolution, suitable for Midjourney/Flux."
}

特别规则：
1. 必须是完全合法的 JSON 格式。
2. 标题和描述要进行 SEO 优化，将核心主题词和卖点自然地融入进去。
3. 发布渠道如果是 "淘宝" (或 Taobao)，请在标题或描述的促销/重点词汇周围嵌入 "￥{}" 占位符，例如：【科技首发】￥{新品限时特惠} ￥{免运费} {productName}，或者在正文中使用 ￥{质保三年} 等，以符合淘宝的特定物料格式。`
  }
];

const LOCAL_STORAGE_KEY = 'qianniu_custom_templates';

export const getTemplates = (): PromptTemplate[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return DEFAULT_TEMPLATES;
    const custom = JSON.parse(saved) as PromptTemplate[];
    return [...DEFAULT_TEMPLATES, ...custom];
  } catch (e) {
    console.error('Failed to parse custom templates', e);
    return DEFAULT_TEMPLATES;
  }
};

export const saveCustomTemplate = (name: string, promptText: string): PromptTemplate[] => {
  const customTemplates = getCustomTemplatesOnly();
  const newTemplate: PromptTemplate = {
    id: `custom-${Date.now()}`,
    name: name,
    nameEn: name,
    nameTw: name,
    isSystem: false,
    promptText: promptText
  };
  const updated = [...customTemplates, newTemplate];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return [...DEFAULT_TEMPLATES, ...updated];
};

export const deleteTemplate = (id: string): PromptTemplate[] => {
  const customTemplates = getCustomTemplatesOnly();
  const updated = customTemplates.filter(t => t.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return [...DEFAULT_TEMPLATES, ...updated];
};

const getCustomTemplatesOnly = (): PromptTemplate[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return [];
    return JSON.parse(saved) as PromptTemplate[];
  } catch (e) {
    return [];
  }
};

export const interpolateTemplate = (
  templateText: string,
  data: {
    productName: string;
    category: string;
    keywords: string;
    channel: string;
  }
): string => {
  return templateText
    .replace(/{productName}/g, data.productName)
    .replace(/{category}/g, data.category)
    .replace(/{keywords}/g, data.keywords)
    .replace(/{channel}/g, data.channel);
};
