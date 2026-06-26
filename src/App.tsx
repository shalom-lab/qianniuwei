import { useState, useEffect } from 'react';
import { 
  Settings, Globe, Sun, Moon, 
  Sparkles, Save, Trash2, Copy, Check, RefreshCw, 
  FileText, Image, Search, X, Edit, Plus, FolderOpen
} from 'lucide-react';

import type { Language } from './services/i18n';
import { translations } from './services/i18n';
import type { PromptTemplate } from './services/templates';
import { 
  getTemplates, saveCustomTemplate, 
  deleteTemplate, interpolateTemplate 
} from './services/templates';
import { 
  generateProductAssets, AVAILABLE_MODELS 
} from './services/gemini';
import type { GitHubConfig, GitHubFileListItem } from './services/github';
import { 
  saveProductToGitHub, listSavedProducts, fetchProductDetails, 
  deleteProductFromGitHub, getDefaultBranch, sanitizeRepoName,
  saveTemplatesToGitHub, fetchTemplatesFromGitHub
} from './services/github';

interface Toast {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  // Theme & i18n States
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('qianniu_lang') as Language) || 'zh-CN';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('qianniu_theme') as 'dark' | 'light') || 'dark';
  });

  // API Config States
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('qianniu_gemini_key') || '');
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('qianniu_github_token') || '');
  const [githubRepo, setGithubRepo] = useState(() => localStorage.getItem('qianniu_github_repo') || 'shalom-lab/MerchForge');
  const [githubBranch, setGithubBranch] = useState(() => localStorage.getItem('qianniu_github_branch') || 'main');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('qianniu_gemini_model') || 'gemini-2.5-flash');

  // Input states (persisted drafts)
  const [productName, setProductName] = useState(() => localStorage.getItem('qn_draft_product_name') || '');
  const [category, setCategory] = useState(() => localStorage.getItem('qn_draft_category') || '');
  const [keywords, setKeywords] = useState(() => localStorage.getItem('qn_draft_keywords') || '');
  const [channel, setChannel] = useState(() => localStorage.getItem('qn_draft_channel') || '淘宝');

  // Templates states
  const [templatesList, setTemplatesList] = useState<PromptTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => localStorage.getItem('qn_selected_template_id') || 'standard-ecommerce');
  const [editedPromptText, setEditedPromptText] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  // Result output states
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [generatedMainImagePrompt, setGeneratedMainImagePrompt] = useState('');
  const [generatedDetailImagePrompt, setGeneratedDetailImagePrompt] = useState('');

  // CMS/Active Editing states

  // Status & List States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [savedProducts, setSavedProducts] = useState<GitHubFileListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Key Visibility toggles
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);

  const t = translations[language];

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-mode');
    } else {
      root.classList.remove('light-mode');
    }
    localStorage.setItem('qianniu_theme', theme);
  }, [theme]);

  // Auto-save form inputs & workspace drafts
  useEffect(() => {
    localStorage.setItem('qn_draft_product_name', productName);
  }, [productName]);

  useEffect(() => {
    localStorage.setItem('qn_draft_category', category);
  }, [category]);

  useEffect(() => {
    localStorage.setItem('qn_draft_keywords', keywords);
  }, [keywords]);

  useEffect(() => {
    localStorage.setItem('qn_draft_channel', channel);
  }, [channel]);

  // Auto-save selected template and edited prompt text
  useEffect(() => {
    localStorage.setItem('qn_selected_template_id', selectedTemplateId);
  }, [selectedTemplateId]);

  useEffect(() => {
    localStorage.setItem('qn_edited_prompt_text', editedPromptText);
  }, [editedPromptText]);

  // Load templates on mount
  useEffect(() => {
    const list = getTemplates();
    setTemplatesList(list);
    const savedPrompt = localStorage.getItem('qn_edited_prompt_text');
    if (savedPrompt) {
      setEditedPromptText(savedPrompt);
    } else {
      const defaultTpl = list.find(x => x.id === selectedTemplateId) || list[0];
      if (defaultTpl) {
        setEditedPromptText(defaultTpl.promptText);
      }
    }
  }, []);

  // Update prompt editor when template changes
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tpl = templatesList.find(x => x.id === templateId);
    if (tpl) {
      setEditedPromptText(tpl.promptText);
    }
  };

  // Sync lang to localStorage
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('qianniu_lang', lang);
  };

  // Notification Toast Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(item => item.id !== id));
    }, 4000);
  };

  // Save Settings to Local Storage
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRepo = sanitizeRepoName(githubRepo);
    setGithubRepo(cleanRepo);
    localStorage.setItem('qianniu_gemini_key', geminiKey.trim());
    localStorage.setItem('qianniu_github_token', githubToken.trim());
    localStorage.setItem('qianniu_github_repo', cleanRepo);
    
    let targetBranch = githubBranch.trim() || 'main';
    // Attempt auto detect default branch if branch is empty and we have a token
    if (githubToken && cleanRepo && !githubBranch.trim()) {
      showToast('Attempting to detect default branch...', 'info');
      targetBranch = await getDefaultBranch(githubToken.trim(), cleanRepo);
    }
    localStorage.setItem('qianniu_github_branch', targetBranch);
    setGithubBranch(targetBranch);
    localStorage.setItem('qianniu_gemini_model', selectedModel);

    showToast(t.settingsSaved, 'success');

    // Trigger loading products if configured
    if (githubToken && cleanRepo) {
      loadSavedProductsFromGitHub();
    }
  };

  // Generate Assets using Gemini API
  const handleGenerate = async () => {
    if (isGenerating) return; // Prevent double trigger
    if (!geminiKey.trim()) {
      showToast(t.apiKeyMissing, 'error');
      return;
    }

    if (!productName.trim() || !category.trim()) {
      showToast(language === 'en' ? 'Product Name and Category are required!' : '商品名称和类目为必填项！', 'error');
      return;
    }

    setIsGenerating(true);
    // Clear outputs during new generation to prevent user from copying old results
    setGeneratedTitle('');
    setGeneratedDescription('');
    setGeneratedMainImagePrompt('');
    setGeneratedDetailImagePrompt('');

    try {
      // Compile prompt by replacing templates variables
      const compiledPrompt = interpolateTemplate(editedPromptText, {
        productName: productName.trim(),
        category: category.trim(),
        keywords: keywords.trim() || '(无核心词，请根据品类智能创作)',
        channel: channel.trim()
      });

      const response = await generateProductAssets(geminiKey.trim(), selectedModel, compiledPrompt);
      
      setGeneratedTitle(response.title);
      setGeneratedDescription(response.description);
      setGeneratedMainImagePrompt(response.mainImagePrompt);
      setGeneratedDetailImagePrompt(response.detailImagePrompt);
      
      showToast(language === 'en' ? 'Material assets generated successfully!' : '物料素材生成成功！', 'success');
    } catch (error: any) {
      showToast(error.message || 'AI Generation Failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to Clipboard
  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(t.copySuccess, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Save / Update to GitHub
  const handleSaveToGitHub = async () => {
    if (isSaving) return; // Prevent double trigger
    if (!githubToken.trim() || !githubRepo.trim()) {
      showToast(t.githubMissing, 'error');
      return;
    }

    setIsSaving(true);
    try {
      const config: GitHubConfig = {
        token: githubToken.trim(),
        repo: githubRepo.trim(),
        branch: githubBranch.trim() || 'main'
      };

      // Always generate a unique ID to save as a new file (新增/创建)
      const productId = `prod_${Math.floor(Date.now() / 1000)}_${Math.random().toString(36).substring(2, 7)}`;

      const productData = {
        id: productId,
        productName: productName.trim(),
        category: category.trim(),
        keywords: keywords.trim(),
        channel: channel.trim(),
        title: generatedTitle,
        description: generatedDescription,
        mainImagePrompt: generatedMainImagePrompt,
        detailImagePrompt: generatedDetailImagePrompt,
      };

      const result = await saveProductToGitHub(config, productData);
      
      if (result.success) {
        showToast(t.saveSuccess.replace('{category}', category), 'success');
        
        // Clear active product state so subsequent saves are also new products

        // Refresh lists
        loadSavedProductsFromGitHub();
      } else {
        showToast(result.error || t.saveError, 'error');
      }
    } catch (error: any) {
      showToast(error.message || t.saveError, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Load Saved Products List from GitHub
  const loadSavedProductsFromGitHub = async () => {
    if (!githubToken.trim() || !githubRepo.trim()) return;
    
    setIsLoadingProducts(true);
    try {
      const config: GitHubConfig = {
        token: githubToken.trim(),
        repo: githubRepo.trim(),
        branch: githubBranch.trim() || 'main'
      };
      const list = await listSavedProducts(config);
      setSavedProducts(list);
    } catch (error: any) {
      console.error(error);
      // Don't show toast error on auto-load to avoid annoying user if settings are in-progress
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch product contents and load into Workspace
  const handleLoadProductDetails = async (path: string) => {
    if (productName || generatedTitle) {
      const confirm = window.confirm(t.confirmLoad);
      if (!confirm) return;
    }

    try {
      const config: GitHubConfig = {
        token: githubToken.trim(),
        repo: githubRepo.trim(),
        branch: githubBranch.trim() || 'main'
      };

      showToast(language === 'en' ? 'Fetching product details...' : '正在获取商品详情...', 'info');
      const product = await fetchProductDetails(config, path);

      // Load form details
      setProductName(product.productName || '');
      setCategory(product.category || '');
      setKeywords(product.keywords || '');
      setChannel(product.channel || '淘宝');

      // Load outputs
      setGeneratedTitle(product.title || '');
      setGeneratedDescription(product.description || '');
      setGeneratedMainImagePrompt(product.mainImagePrompt || '');
      setGeneratedDetailImagePrompt(product.detailImagePrompt || '');

      // Load status (we only load, not locking active product, so saving will create new product)

      showToast(t.loadSuccess, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to load product details', 'error');
    }
  };

  // Delete product from GitHub
  const handleDeleteProduct = async (path: string, sha: string) => {
    const confirm = window.confirm(language === 'en' ? 'Are you sure you want to delete this product from GitHub?' : '确定要从 GitHub 中删除该商品资产吗？');
    if (!confirm) return;

    try {
      const config: GitHubConfig = {
        token: githubToken.trim(),
        repo: githubRepo.trim(),
        branch: githubBranch.trim() || 'main'
      };

      const success = await deleteProductFromGitHub(config, path, sha);
      if (success) {
        showToast(language === 'en' ? 'Deleted successfully!' : '删除成功！', 'success');
        
        // Item deleted successfully

        loadSavedProductsFromGitHub();
      } else {
        showToast(language === 'en' ? 'Delete failed.' : '删除失败，请重试。', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Delete operation failed', 'error');
    }
  };

  // Reset workspace
  const handleResetForm = (clearOutputs = true) => {
    setProductName('');
    setCategory('');
    setKeywords('');
    setChannel('淘宝');

    if (clearOutputs) {
      setGeneratedTitle('');
      setGeneratedDescription('');
      setGeneratedMainImagePrompt('');
      setGeneratedDetailImagePrompt('');
    }

  };

  // Custom Prompt Template management
  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) {
      showToast(language === 'en' ? 'Please enter template name' : '请输入模板名称', 'error');
      return;
    }
    const updated = saveCustomTemplate(newTemplateName.trim(), editedPromptText);
    setTemplatesList(updated);
    // Find the newly saved custom template and select it
    const lastSaved = updated.filter(x => !x.isSystem).pop();
    if (lastSaved) {
      setSelectedTemplateId(lastSaved.id);
    }
    setNewTemplateName('');
    setShowSaveTemplateModal(false);
    showToast(t.templateSaved, 'success');
  };

  const handleDeleteTemplate = () => {
    const tpl = templatesList.find(x => x.id === selectedTemplateId);
    if (!tpl || tpl.isSystem) return;

    const confirm = window.confirm(t.confirmDeleteTemplate);
    if (!confirm) return;

    const updated = deleteTemplate(selectedTemplateId);
    setTemplatesList(updated);
    handleTemplateChange(updated[0].id);
    showToast(t.templateDeleted, 'success');
  };

  // Upload custom templates to GitHub as prompt.json
  const handleUploadTemplatesToGitHub = async () => {
    if (!githubToken.trim() || !githubRepo.trim()) {
      showToast(t.githubMissing, 'error');
      return;
    }

    const config: GitHubConfig = {
      token: githubToken.trim(),
      repo: githubRepo.trim(),
      branch: githubBranch.trim() || 'main'
    };

    // Filter only custom templates to upload
    const customTemplates = templatesList.filter(tpl => !tpl.isSystem);

    if (customTemplates.length === 0) {
      showToast(language === 'en' ? 'No custom templates to upload. Please save a template first!' : '没有自定义模板可上传，请先保存一个自定义模板！', 'error');
      return;
    }

    showToast(language === 'en' ? 'Uploading templates to GitHub...' : '正在上传模板至 GitHub...', 'info');
    const result = await saveTemplatesToGitHub(config, customTemplates);
    if (result.success) {
      showToast(language === 'en' ? 'Successfully uploaded custom templates (prompt.json) to GitHub!' : '成功将自定义模板 (prompt.json) 同步至 GitHub！', 'success');
    } else {
      showToast(result.error || 'Failed to upload templates', 'error');
    }
  };

  // Pull custom templates from GitHub prompt.json
  const handlePullTemplatesFromGitHub = async () => {
    if (!githubToken.trim() || !githubRepo.trim()) {
      showToast(t.githubMissing, 'error');
      return;
    }

    const config: GitHubConfig = {
      token: githubToken.trim(),
      repo: githubRepo.trim(),
      branch: githubBranch.trim() || 'main'
    };

    try {
      showToast(language === 'en' ? 'Pulling templates from GitHub...' : '正在从 GitHub 拉取模板...', 'info');
      const remoteTemplates = await fetchTemplatesFromGitHub(config);
      
      // Filter out invalid templates (must have name and promptText) and map structure
      const validRemotes = remoteTemplates
        .filter((t: any) => t && typeof t === 'object' && t.name && t.promptText)
        .map((t: any, idx: number) => ({
          id: t.id || `remote-custom-${Date.now()}-${idx}`,
          name: t.name,
          nameEn: t.nameEn || t.name,
          nameTw: t.nameTw || t.name,
          isSystem: false,
          promptText: t.promptText
        }));

      if (validRemotes.length === 0) {
        showToast(language === 'en' ? 'No valid templates found in prompt.json' : 'prompt.json 中未找到有效的模板。', 'error');
        return;
      }

      // Save pulled templates to local storage
      localStorage.setItem('qianniu_custom_templates', JSON.stringify(validRemotes));
      
      // Reload templates list in state
      const updated = getTemplates();
      setTemplatesList(updated);
      handleTemplateChange(updated[0].id);

      showToast(language === 'en' ? 'Successfully pulled custom templates from GitHub!' : '成功从 GitHub 同步拉取自定义模板！', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to pull templates', 'error');
    }
  };

  // Auto trigger products load if github settings exist on mount
  useEffect(() => {
    if (githubToken && githubRepo) {
      loadSavedProductsFromGitHub();
    }
  }, []);

  // Filtered saved products
  const filteredProducts = savedProducts.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.category.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term) ||
      item.path.toLowerCase().includes(term)
    );
  });

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {toast.type === 'success' && <Check size={16} />}
              {toast.type === 'error' && <X size={16} />}
              {toast.type === 'info' && <RefreshCw size={14} className="animate-spin" />}
            </span>
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">QN</div>
          <div className="brand-text">
            <h1>{t.appName}</h1>
            <p>{t.appSubtitle}</p>
          </div>
        </div>

        <div className="header-actions">
          {/* i18n Select */}
          <div className="flex-align-center">
            <Globe size={16} className="text-secondary" />
            <select 
              id="langSelect"
              className="form-input form-select language-select"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
            >
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button 
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* GitHub Repository Link */}
          <a 
            href="https://github.com/shalom-lab/MerchForge" 
            target="_blank" 
            rel="noopener noreferrer"
            className="theme-toggle-btn"
            title="GitHub Repository"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
        </div>
      </header>

      {/* Sidebar: Config Center & Preset Templates */}
      <aside className="sidebar">
        {/* Settings Panel */}
        <section className="glass-panel glass-card">
          <h3 className="sidebar-title">
            <Settings size={18} className="text-secondary" />
            {t.settings}
          </h3>
          <form onSubmit={handleSaveSettings} style={{ marginTop: '16px' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '12px' }}>
              {t.apiSettings}
            </h4>

            {/* Gemini API Key */}
            <div className="form-group">
              <label className="form-label">{t.geminiKey}</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showGeminiKey ? "text" : "password"}
                  className="form-input" 
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder={t.geminiKeyPlaceholder}
                />
                <button 
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}
                >
                  {showGeminiKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Gemini Model Select */}
            <div className="form-group">
              <label className="form-label">{language === 'en' ? 'Gemini Model' : '模型选择'}</label>
              <select 
                className="form-input form-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {AVAILABLE_MODELS.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>

            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', margin: '20px 0 12px 0' }}>
              GitHub Storage (BYOK)
            </h4>

            {/* GitHub Token */}
            <div className="form-group">
              <label className="form-label">{t.githubToken}</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showGithubToken ? "text" : "password"}
                  className="form-input" 
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder={t.githubTokenPlaceholder}
                />
                <button 
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}
                >
                  {showGithubToken ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* GitHub Repo */}
            <div className="form-group">
              <label className="form-label">{t.githubRepo}</label>
              <input 
                type="text" 
                className="form-input" 
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder={t.githubRepoPlaceholder}
              />
            </div>

            {/* GitHub Branch */}
            <div className="form-group">
              <label className="form-label">{t.githubBranch}</label>
              <input 
                type="text" 
                className="form-input" 
                value={githubBranch}
                onChange={(e) => setGithubBranch(e.target.value)}
                placeholder={t.githubBranchPlaceholder}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              <Save size={16} />
              {t.saveSettings}
            </button>
          </form>
        </section>

        {/* Info Banner if missing settings */}
        {(!geminiKey || !githubToken || !githubRepo) && (
          <div className="glass-panel" style={{ padding: '16px', background: 'var(--color-error-bg)', borderColor: 'rgba(239, 68, 68, 0.2)', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚠️ {language === 'en' ? 'Setup Required' : '需先配置 API 秘钥'}
            </span>
            <p style={{ color: 'var(--text-secondary)' }}>
              {language === 'en' 
                ? 'Please enter your Gemini API Key and GitHub settings to unlock generation and saving.'
                : '请在上方配置 Gemini API Key 以及 GitHub 仓库，即可一键生成物料并上传管理商品素材。'}
            </p>
          </div>
        )}
      </aside>

      {/* Main Workspace */}
      <main className="main-workspace">
        {/* Left Side: Product input form & prompt template configurations */}
        <div className="workspace-column">
          <section className="glass-panel glass-card inputs-grid">
            <div className="panel-header">
              <h2 className="panel-title">
                <FileText size={18} className="text-secondary" />
                {t.productDetails}
              </h2>
            </div>

            {/* Product Name */}
            <div className="form-group">
              <label className="form-label">{t.productName} *</label>
              <input 
                type="text" 
                className="form-input" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={t.productNamePlaceholder}
                required
              />
            </div>

            {/* Category & Channel Row */}
            <div className="horizontal-inputs">
              <div className="form-group">
                <label className="form-label">{t.category} *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={t.categoryPlaceholder}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.channel}</label>
                <select 
                  className="form-input form-select"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option value="淘宝">淘宝 (Taobao)</option>
                  <option value="天猫">天猫 (Tmall)</option>
                  <option value="京东">京东 (JD.com)</option>
                  <option value="拼多多">拼多多 (Pinduoduo)</option>
                  <option value="小红书">小红书 (RED)</option>
                  <option value="抖音">抖音 (Douyin)</option>
                </select>
              </div>
            </div>

            {/* Keywords */}
            <div className="form-group">
              <label className="form-label">{t.keywords}</label>
              <textarea 
                className="form-input" 
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={t.keywordsPlaceholder}
                style={{ minHeight: '80px' }}
              />
            </div>

            {/* Prompt Template Customizer block */}
            <div className="prompt-area" style={{ marginTop: '12px' }}>
              <label className="form-label">{t.promptConfig}</label>
              <div className="prompt-templates-row">
                <select
                  className="form-input form-select prompt-templates-select"
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  {templatesList.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {language === 'en' ? tpl.nameEn : language === 'zh-TW' ? tpl.nameTw : tpl.name}
                    </option>
                  ))}
                </select>
                
                {/* Delete custom template */}
                {(() => {
                  const currentTpl = templatesList.find(x => x.id === selectedTemplateId);
                  return currentTpl && !currentTpl.isSystem && (
                    <button 
                      type="button" 
                      onClick={handleDeleteTemplate} 
                      className="btn btn-secondary btn-danger"
                      title={t.deleteTemplate}
                      style={{ padding: '0 12px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  );
                })()}
              </div>

              <div className="prompt-templates-row" style={{ marginTop: '8px', marginBottom: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleUploadTemplatesToGitHub}
                  disabled={!githubToken || !githubRepo}
                  style={{ flex: 1, fontSize: '0.8rem' }}
                >
                  <Save size={14} />
                  {language === 'en' ? 'Upload Templates (prompt.json)' : '上传模板至 GitHub'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handlePullTemplatesFromGitHub}
                  disabled={!githubToken || !githubRepo}
                  style={{ flex: 1, fontSize: '0.8rem' }}
                >
                  <RefreshCw size={14} />
                  {language === 'en' ? 'Pull from GitHub' : '从 GitHub 拉取模板'}
                </button>
              </div>

              <div className="form-group">
                <div className="flex-between" style={{ marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>{t.editPrompt}</label>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowSaveTemplateModal(true)}
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    <Plus size={14} />
                    {t.saveAsTemplate}
                  </button>
                </div>
                <textarea 
                  className="form-input prompt-textarea" 
                  value={editedPromptText}
                  onChange={(e) => setEditedPromptText(e.target.value)}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex-between" style={{ marginTop: '16px', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => handleResetForm(true)}
              >
                {t.clearBtn}
              </button>

              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleGenerate}
                disabled={isGenerating || !geminiKey}
                style={{ flex: 1 }}
              >
                <Sparkles size={18} />
                {isGenerating ? t.generatingBtn : t.generateBtn}
              </button>
            </div>
          </section>
        </div>

        {/* Right Side: Generate output results */}
        <div className="workspace-column">
          <section className="glass-panel glass-card">
            <div className="panel-header">
              <h2 className="panel-title">
                <Sparkles size={18} className="text-secondary" />
                {t.resultsTitle}
              </h2>
              {/* GitHub Save Trigger */}
              <button 
                type="button" 
                className="btn btn-success btn-sm" 
                onClick={handleSaveToGitHub}
                disabled={isSaving || !githubToken || !githubRepo || !generatedTitle}
              >
                <Save size={16} />
                {isSaving ? t.savingBtn : t.saveToGithubBtn}
              </button>
            </div>

            {/* Result: SEO Title */}
            <div className="output-card">
              <div className="output-header">
                <div>
                  <div className="output-label">
                    <FileText size={15} style={{ color: 'var(--brand-primary)' }} />
                    {t.seoTitle}
                  </div>
                  <div className="output-subtitle">{t.seoTitleDesc}</div>
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handleCopy(generatedTitle, 'title')}
                  disabled={!generatedTitle}
                >
                  {copiedField === 'title' ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                  {copiedField === 'title' ? (language === 'en' ? 'Copied' : '已复制') : t.copyBtn}
                </button>
              </div>
              {isGenerating ? (
                <div className="shimmer-text"></div>
              ) : (
                <input 
                  type="text"
                  className="form-input output-content output-content-title"
                  value={generatedTitle}
                  onChange={(e) => setGeneratedTitle(e.target.value)}
                  placeholder={language === 'en' ? 'Waiting for generation...' : '等待 AI 一键生成物料...'}
                />
              )}
            </div>

            {/* Result: Text Description */}
            <div className="output-card">
              <div className="output-header">
                <div>
                  <div className="output-label">
                    <FileText size={15} style={{ color: 'var(--brand-secondary)' }} />
                    {t.description}
                  </div>
                  <div className="output-subtitle">{t.descriptionDesc}</div>
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handleCopy(generatedDescription, 'desc')}
                  disabled={!generatedDescription}
                >
                  {copiedField === 'desc' ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                  {copiedField === 'desc' ? (language === 'en' ? 'Copied' : '已复制') : t.copyBtn}
                </button>
              </div>
              {isGenerating ? (
                <div className="shimmer-text shimmer-desc"></div>
              ) : (
                <textarea
                  className="form-input output-content"
                  value={generatedDescription}
                  onChange={(e) => setGeneratedDescription(e.target.value)}
                  placeholder={language === 'en' ? 'Waiting for generation...' : '等待 AI 一键生成描述文案...'}
                  style={{ minHeight: '160px' }}
                />
              )}
            </div>

            {/* Result: Main Image Prompt */}
            <div className="output-card">
              <div className="output-header">
                <div>
                  <div className="output-label">
                    <Image size={15} style={{ color: 'var(--brand-tertiary)' }} />
                    {t.mainImagePrompt}
                  </div>
                  <div className="output-subtitle">{t.mainImagePromptDesc}</div>
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handleCopy(generatedMainImagePrompt, 'mainImage')}
                  disabled={!generatedMainImagePrompt}
                >
                  {copiedField === 'mainImage' ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                  {copiedField === 'mainImage' ? (language === 'en' ? 'Copied' : '已复制') : t.copyBtn}
                </button>
              </div>
              {isGenerating ? (
                <div className="shimmer-text"></div>
              ) : (
                <textarea
                  className="form-input output-content"
                  value={generatedMainImagePrompt}
                  onChange={(e) => setGeneratedMainImagePrompt(e.target.value)}
                  placeholder={language === 'en' ? 'Waiting for generation...' : '等待 AI 一键生成主图绘图词...'}
                  style={{ minHeight: '70px', fontFamily: 'monospace', fontSize: '0.82rem' }}
                />
              )}
            </div>

            {/* Result: Detail Image Prompt */}
            <div className="output-card">
              <div className="output-header">
                <div>
                  <div className="output-label">
                    <Image size={15} style={{ color: 'var(--brand-primary)' }} />
                    {t.detailImagePrompt}
                  </div>
                  <div className="output-subtitle">{t.detailImagePromptDesc}</div>
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handleCopy(generatedDetailImagePrompt, 'detailImage')}
                  disabled={!generatedDetailImagePrompt}
                >
                  {copiedField === 'detailImage' ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                  {copiedField === 'detailImage' ? (language === 'en' ? 'Copied' : '已复制') : t.copyBtn}
                </button>
              </div>
              {isGenerating ? (
                <div className="shimmer-text"></div>
              ) : (
                <textarea
                  className="form-input output-content"
                  value={generatedDetailImagePrompt}
                  onChange={(e) => setGeneratedDetailImagePrompt(e.target.value)}
                  placeholder={language === 'en' ? 'Waiting for generation...' : '等待 AI 一键生成详情图绘图词...'}
                  style={{ minHeight: '70px', fontFamily: 'monospace', fontSize: '0.82rem' }}
                />
              )}
            </div>
          </section>
        </div>

        {/* Bottom Section: CMS Assets Dashboard */}
        <section className="glass-panel glass-card cms-dashboard">
          <div className="cms-header">
            <h2 className="panel-title">
              <FolderOpen size={18} className="text-secondary" />
              {t.savedProducts}
            </h2>
            
            <div className="cms-controls">
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={loadSavedProductsFromGitHub}
                disabled={isLoadingProducts || !githubToken || !githubRepo}
              >
                <RefreshCw size={14} className={isLoadingProducts ? "animate-spin" : ""} />
                {t.refreshBtn}
              </button>
            </div>
          </div>

          {/* CMS Listings */}
          {isLoadingProducts ? (
            <div className="cms-empty">
              <RefreshCw size={24} className="animate-spin" />
              <p>{language === 'en' ? 'Loading assets list from GitHub...' : '正在从 GitHub 载入资产列表...'}</p>
            </div>
          ) : !githubToken || !githubRepo ? (
            <div className="cms-empty">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <p>{t.noProducts}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="cms-empty">
              <FolderOpen size={24} />
              <p>{language === 'en' ? 'No matching products found.' : '未能搜索到匹配的商品资产。'}</p>
            </div>
          ) : (
            <div className="cms-grid">
              {filteredProducts.map(item => (
                <div key={item.sha} className="cms-item-card">
                  <div className="cms-item-info">
                    <span className="cms-item-tag">{item.category}</span>
                    <h4>{item.id}</h4>
                    <div className="cms-item-meta">
                      <span><strong>Path:</strong> {item.path}</span>
                    </div>
                  </div>
                  <div className="cms-item-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleLoadProductDetails(item.path)}
                      style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                    >
                      <Edit size={12} />
                      {t.loadProduct}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-danger btn-sm"
                      onClick={() => handleDeleteProduct(item.path, item.sha)}
                      style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel glass-card" style={{ width: '400px', padding: '24px', position: 'relative' }}>
            <button 
              type="button" 
              onClick={() => setShowSaveTemplateModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>{t.saveAsTemplate}</h3>
            <div className="form-group">
              <label className="form-label">{t.templateNamePrompt}</label>
              <input 
                type="text" 
                className="form-input" 
                value={newTemplateName} 
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="例如: 极简性冷淡风格"
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowSaveTemplateModal(false)}>
                {language === 'en' ? 'Cancel' : '取消'}
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveAsTemplate} disabled={!newTemplateName.trim()}>
                {language === 'en' ? 'Save' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
