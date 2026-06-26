export interface GitHubConfig {
  token: string;
  repo: string; // "owner/repo"
  branch: string; // "main"
}

export interface SavedProduct {
  id: string;
  productName: string;
  category: string;
  keywords: string;
  channel: string;
  title: string;
  description: string;
  mainImagePrompt: string;
  detailImagePrompt: string;
  savedAt: string;
  updatedAt: string;
  sha?: string; // Stored from GitHub file fetch
  path?: string; // GitHub path
}

export interface GitHubFileListItem {
  path: string;
  sha: string;
  category: string;
  id: string;
  name: string;
}

/**
 * Modern safe UTF-8 Base64 Encoding
 */
export const encodeBase64 = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binString);
};

/**
 * Modern safe UTF-8 Base64 Decoding
 */
export const decodeBase64 = (base64Str: string): string => {
  const cleanBase64 = base64Str.replace(/\s/g, '');
  const binString = atob(cleanBase64);
  const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

/**
 * Clean up user input for repository names
 * Strips leading/trailing spaces, trailing slashes, and "https://github.com/" prefixes
 */
export const sanitizeRepoName = (repo: string): string => {
  let clean = repo.trim();
  // Remove https://github.com/ or http://github.com/ or github.com/ if present
  clean = clean.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '');
  // Remove leading and trailing slashes
  clean = clean.replace(/^\/+|\/+$/g, '');
  return clean;
};

/**
 * Get headers for GitHub API requests
 */
const getHeaders = (token: string) => {
  return {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };
};

/**
 * Check if the repository and token are valid
 */
export const validateGitHubConnection = async (config: GitHubConfig): Promise<boolean> => {
  const token = config.token.trim();
  const repo = sanitizeRepoName(config.repo);
  if (!token || !repo) return false;

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: getHeaders(token)
    });
    return response.ok;
  } catch (error) {
    console.error('GitHub validation error:', error);
    return false;
  }
};

/**
 * Fetch default branch of a repo if not specified
 */
export const getDefaultBranch = async (token: string, repo: string): Promise<string> => {
  const cleanRepo = sanitizeRepoName(repo);
  try {
    const response = await fetch(`https://api.github.com/repos/${cleanRepo}`, {
      headers: getHeaders(token)
    });
    if (!response.ok) return 'main';
    const data = await response.json();
    return data.default_branch || 'main';
  } catch (e) {
    return 'main';
  }
};

/**
 * Save product to GitHub (either create or update)
 */
export const saveProductToGitHub = async (
  config: GitHubConfig,
  product: Omit<SavedProduct, 'savedAt' | 'updatedAt'> & { savedAt?: string; sha?: string }
): Promise<{ success: boolean; path: string; sha: string; error?: string }> => {
  const token = config.token.trim();
  const repo = sanitizeRepoName(config.repo);
  const branch = config.branch.trim() || 'main';
  
  // Sanitize category to make a valid directory name
  const sanitizedCategory = product.category
    .trim()
    .replace(/[\/\\?%*:|"<>]/g, '-') // Replace path separators and invalid chars
    .toLowerCase() || 'uncategorized';
  
  const fileName = `${product.id}.json`;
  const filePath = `product/${sanitizedCategory}/${fileName}`;
  const url = `https://api.github.com/repos/${repo}/contents/${filePath}`;

  // Build JSON content
  const now = new Date().toISOString();
  const fileContent: SavedProduct = {
    ...product,
    savedAt: product.savedAt || now,
    updatedAt: now,
    path: filePath
  };

  const jsonString = JSON.stringify(fileContent, null, 2);
  const base64Content = encodeBase64(jsonString);

  // Try to find the file's current SHA if not provided, to allow update
  let currentSha = product.sha || null;
  if (!currentSha) {
    try {
      const getResponse = await fetch(`${url}?ref=${branch}`, {
        headers: getHeaders(token)
      });
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        currentSha = fileData.sha;
      }
    } catch (e) {
      // File does not exist yet, which is fine
    }
  }

  const body: any = {
    message: `Save product asset: ${product.productName} (${product.id})`,
    content: base64Content,
    branch: branch
  };

  if (currentSha) {
    body.sha = currentSha;
  }

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `GitHub returned status ${response.status}`);
    }

    const resData = await response.json();
    return {
      success: true,
      path: filePath,
      sha: resData.content.sha
    };
  } catch (error: any) {
    console.error('Error saving file to GitHub:', error);
    return {
      success: false,
      path: filePath,
      sha: '',
      error: error.message || 'Unknown network error'
    };
  }
};

/**
 * List all saved product JSON files in the product/ directory recursively
 */
export const listSavedProducts = async (
  config: GitHubConfig
): Promise<GitHubFileListItem[]> => {
  const token = config.token.trim();
  const repo = sanitizeRepoName(config.repo);
  const branch = config.branch.trim() || 'main';
  if (!token || !repo) return [];

  try {
    const url = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
    const response = await fetch(url, {
      headers: getHeaders(token)
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded or access forbidden. Check token permissions.');
      }
      if (response.status === 404) {
        throw new Error('Repository or branch not found. Verify repository name and branch config.');
      }
      throw new Error(`GitHub returned error: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    const tree = data.tree;

    if (!Array.isArray(tree)) {
      return [];
    }

    // Filter files in product/ directory that end in .json
    const productsList: GitHubFileListItem[] = tree
      .filter((file: any) => 
        file.type === 'blob' && 
        file.path &&
        file.path.startsWith('product/') && 
        file.path.endsWith('.json')
      )
      .map((file: any) => {
        const parts = file.path.split('/');
        const category = parts[1] || 'uncategorized';
        const fileBasename = parts[parts.length - 1];
        const id = fileBasename.replace('.json', '');
        
        return {
          path: file.path,
          sha: file.sha,
          category,
          id,
          name: id
        };
      });

    return productsList;
  } catch (error) {
    console.error('Error listing files from GitHub:', error);
    throw error;
  }
};

/**
 * Fetch a specific product's details and parse JSON content
 */
export const fetchProductDetails = async (
  config: GitHubConfig,
  path: string
): Promise<SavedProduct> => {
  const token = config.token.trim();
  const repo = sanitizeRepoName(config.repo);
  const branch = config.branch.trim() || 'main';
  const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;

  try {
    const response = await fetch(url, {
      headers: getHeaders(token)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.content) {
      throw new Error('File content is empty or structure is invalid');
    }

    // Double check encoding is base64
    let jsonString: string;
    if (data.encoding === 'base64') {
      jsonString = decodeBase64(data.content);
    } else {
      jsonString = data.content; // Plaintext fallback
    }

    const product = JSON.parse(jsonString) as SavedProduct;
    
    // Attach the latest SHA and Path from GitHub
    product.sha = data.sha;
    product.path = data.path;
    return product;
  } catch (error) {
    console.error('Error fetching file details:', error);
    throw error;
  }
};

/**
 * Delete a product from GitHub repo
 */
export const deleteProductFromGitHub = async (
  config: GitHubConfig,
  path: string,
  sha: string
): Promise<boolean> => {
  const token = config.token.trim();
  const repo = sanitizeRepoName(config.repo);
  const branch = config.branch.trim() || 'main';
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;

  try {
    const body = {
      message: `Delete product asset file: ${path}`,
      sha: sha,
      branch: branch
    };

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(token),
      body: JSON.stringify(body)
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting file from GitHub:', error);
    return false;
  }
};

/**
 * Save prompt templates to GitHub as prompt.json
 */
export const saveTemplatesToGitHub = async (
  config: GitHubConfig,
  templates: any[]
): Promise<{ success: boolean; error?: string }> => {
  const token = config.token.trim();
  const repo = sanitizeRepoName(config.repo);
  const branch = config.branch.trim() || 'main';
  const filePath = 'prompt.json';
  const url = `https://api.github.com/repos/${repo}/contents/${filePath}`;

  // Serialize custom templates
  const jsonString = JSON.stringify(templates, null, 2);
  const base64Content = encodeBase64(jsonString);

  // Try to find the file's current SHA if it exists
  let currentSha = null;
  try {
    const getResponse = await fetch(`${url}?ref=${branch}`, {
      headers: getHeaders(token)
    });
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      currentSha = fileData.sha;
    }
  } catch (e) {
    // File doesn't exist, which is fine
  }

  const body: any = {
    message: 'Sync custom prompt templates (prompt.json)',
    content: base64Content,
    branch: branch
  };

  if (currentSha) {
    body.sha = currentSha;
  }

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `GitHub returned status ${response.status}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error saving prompt.json to GitHub:', error);
    return {
      success: false,
      error: error.message || 'Unknown network error'
    };
  }
};

/**
 * Fetch prompt templates from GitHub's prompt.json
 */
export const fetchTemplatesFromGitHub = async (
  config: GitHubConfig
): Promise<any[]> => {
  const token = config.token.trim();
  const repo = sanitizeRepoName(config.repo);
  const branch = config.branch.trim() || 'main';
  const filePath = 'prompt.json';
  const url = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;

  try {
    const response = await fetch(url, {
      headers: getHeaders(token)
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('prompt.json not found in repository. Try uploading first.');
      }
      throw new Error(`Failed to fetch prompt.json: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.content) {
      throw new Error('File content is empty');
    }

    let jsonString: string;
    if (data.encoding === 'base64') {
      jsonString = decodeBase64(data.content);
    } else {
      jsonString = data.content;
    }

    const templates = JSON.parse(jsonString);
    if (!Array.isArray(templates)) {
      throw new Error('Invalid format: prompt.json must contain a JSON array of templates');
    }

    return templates;
  } catch (error) {
    console.error('Error fetching prompt.json from GitHub:', error);
    throw error;
  }
};
