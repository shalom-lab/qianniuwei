export interface GeneratedAssets {
  title: string;
  description: string;
  mainImagePrompt: string;
  detailImagePrompt: string;
}

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Higher Quality)' }
];

/**
 * Redact API key from any error message string
 */
const sanitizeErrorMsg = (msg: string, key: string): string => {
  if (!key) return msg;
  // Replace the exact API key or key sequence with REDACTED
  return msg.replace(new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), 'REDACTED_API_KEY');
};

export const generateProductAssets = async (
  apiKey: string,
  model: string,
  promptText: string
): Promise<GeneratedAssets> => {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: promptText
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Empty response received from Gemini API');
    }

    return parseGeminiResponse(responseText);
  } catch (error: any) {
    // Sanitize message before logging and throwing
    const cleanMessage = sanitizeErrorMsg(error.message || 'Unknown Gemini API Error', apiKey);
    console.error('Error generating assets:', cleanMessage);
    throw new Error(cleanMessage);
  }
};

const parseGeminiResponse = (text: string): GeneratedAssets => {
  try {
    // Attempt standard JSON parsing
    const parsed = JSON.parse(text.trim());
    return {
      title: parsed.title || '',
      description: parsed.description || '',
      mainImagePrompt: parsed.mainImagePrompt || '',
      detailImagePrompt: parsed.detailImagePrompt || ''
    };
  } catch (e) {
    console.warn('Failed to parse directly as JSON. Attempting regex extract...', e);
    // Attempt to extract JSON using regex if API didn't return pure JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        return {
          title: extracted.title || '',
          description: extracted.description || '',
          mainImagePrompt: extracted.mainImagePrompt || '',
          detailImagePrompt: extracted.detailImagePrompt || ''
        };
      }
    } catch (innerError) {
      console.error('Regex extraction parse failed:', innerError);
    }

    // Return text as-is in fields if parsing failed completely
    return {
      title: 'Parsing Error',
      description: text,
      mainImagePrompt: 'Could not extract prompts. Please check the AI output in description.',
      detailImagePrompt: ''
    };
  }
};
