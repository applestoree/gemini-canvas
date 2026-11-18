import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Layers,
  Type,
  Sun,
  Palette,
  Layout,
  Plus,
  Trash2,
  ChevronRight,
  Cpu,
  Eye,
  FileImage,
  ShieldAlert
} from 'lucide-react';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
const SUPABASE_API_URL = 'https://jhpbtooefyzdndstlzva.supabase.co/functions/v1/crud-make-prompt';
const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-image';
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Safely deep-clones an object so the original API payload is never mutated.
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return Array.isArray(obj) ? [...obj] : { ...obj };
  }
}

/**
 * Safely extracts a human-readable string from fields that may be strings,
 * objects (e.g. { text: '...' } or { name: '...' }), or arrays.
 */
function extractDisplayValue(val, fallback = '') {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    return val.map((item) => extractDisplayValue(item)).filter(Boolean).join(', ') || fallback;
  }
  if (typeof val === 'object') {
    if (typeof val.text === 'string') return val.text;
    if (typeof val.title === 'string') return val.title;
    if (typeof val.name === 'string') return val.name;
    if (typeof val.description === 'string') return val.description;
    if (typeof val.value === 'string') return val.value;
    if (typeof val.preset === 'string') return val.preset;
    return Object.entries(val)
      .filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object')
      .map(([k, v]) => `${formatKey(k)}: ${v}`)
      .join(' • ') || fallback;
  }
  return fallback;
}

/**
 * Formats snake_case or camelCase keys into Title Case labels.
 */
function formatKey(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Normalizes categories from a template object into an array of strings.
 */
function extractCategories(template) {
  if (!template) return [];
  const raw = template.categories ?? template.category;
  if (!raw) return ['Uncategorized'];
  if (Array.isArray(raw)) {
    const cleaned = raw
      .map((c) => extractDisplayValue(c).trim())
      .filter(Boolean);
    return cleaned.length > 0 ? cleaned : ['Uncategorized'];
  }
  if (typeof raw === 'string') {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts : ['Uncategorized'];
  }
  const single = extractDisplayValue(raw).trim();
  return single ? [single] : ['Uncategorized'];
}

/**
 * Transforms the structured template JSON configuration into a coherent,
 * production-grade commercial advertising prompt for Gemini.
 */
function buildGeminiPrompt(config) {
  const productName = extractDisplayValue(config.product, 'Featured Product');
  const categories = extractCategories(config).join(', ');
  const style = extractDisplayValue(config.style);
  const visualStyle = extractDisplayValue(config.visual_style);

  // Headline extraction
  const headlineObj = typeof config.headline === 'object' && config.headline !== null ? config.headline : { text: config.headline };
  const headlineText = extractDisplayValue(headlineObj.text);
  const headlineTone = extractDisplayValue(headlineObj.tone);
  const headlineFocus = extractDisplayValue(headlineObj.focus);
  const headlineLang = extractDisplayValue(headlineObj.language);
  const headlineStrategy = extractDisplayValue(headlineObj.strategy);

  // Subheadline extraction
  const subheadlineObj = typeof config.subheadline === 'object' && config.subheadline !== null ? config.subheadline : { text: config.subheadline };
  const subheadlineText = extractDisplayValue(subheadlineObj.text || subheadlineObj.description || config.subheadline);

  // Feature items extraction
  const features = Array.isArray(config.feature_items) ? config.feature_items : [];
  const featureLines = features
    .map((item, idx) => {
      if (typeof item === 'string') return `${idx + 1}. ${item}`;
      if (item && typeof item === 'object') {
        const title = extractDisplayValue(item.title || item.text || item.name);
        const icon = extractDisplayValue(item.icon);
        return title ? `${idx + 1}. ${title}${icon ? ` (paired with minimal ${icon} icon)` : ''}` : '';
      }
      return '';
    })
    .filter(Boolean);

  // Composition extraction
  const comp = typeof config.composition === 'object' && config.composition !== null ? config.composition : {};
  const compDetails = Object.entries(comp)
    .map(([k, v]) => {
      const valStr = extractDisplayValue(v);
      return valStr ? `- ${formatKey(k)}: ${valStr}` : '';
    })
    .filter(Boolean);

  // Background extraction
  const bg = typeof config.background === 'object' && config.background !== null ? config.background : { preset: config.background };
  const bgDetails = Object.entries(bg)
    .map(([k, v]) => {
      const valStr = extractDisplayValue(v);
      return valStr ? `- ${formatKey(k)}: ${valStr}` : '';
    })
    .filter(Boolean);

  // Typography extraction
  const typo = typeof config.typography === 'object' && config.typography !== null ? config.typography : {};
  const typoDetails = Object.entries(typo)
    .map(([k, v]) => {
      const valStr = extractDisplayValue(v);
      return valStr ? `- ${formatKey(k)}: ${valStr}` : '';
    })
    .filter(Boolean);

  // Lighting extraction
  const light = typeof config.lighting === 'object' && config.lighting !== null ? config.lighting : {};
  const lightDetails = Object.entries(light)
    .map(([k, v]) => {
      const valStr = extractDisplayValue(v);
      return valStr ? `- ${formatKey(k)}: ${valStr}` : '';
    })
    .filter(Boolean);

  const sections = [];

  sections.push(
    `Create a high-end commercial product advertisement photograph in a 4:5 portrait aspect ratio (1024x1280).`
  );

  sections.push(
    `1. MAIN PRODUCT & IDENTITY:\n` +
    `- Product: "${productName}"${categories ? ` (Category: ${categories})` : ''}.\n` +
    `- Maintain strict product authenticity and physical accuracy. Do not invent unrequested features or alter the core product identity.\n` +
    (style ? `- Advertising Style: ${style}.\n` : '') +
    (visualStyle ? `- Visual Aesthetic: ${visualStyle}.` : '')
  );

  sections.push(
    `2. BRAND LOGO INTEGRATION (CRITICAL VISUAL REFERENCE):\n` +
    `- Use the attached reference image as the official brand logo.\n` +
    `- Place the uploaded logo cleanly in the upper-left corner of the advertisement.\n` +
    `- Keep the logo small, subtle, and refined with generous breathing room from the top and left edges.\n` +
    `- Strictly preserve the logo's original aspect ratio, exact proportions, brand colors, symbols, and lettering.\n` +
    `- Do NOT redesign, stylize, distort, warp, or replace the logo, and ensure it does not overpower or compete with the main product.`
  );

  if (compDetails.length > 0) {
    sections.push(`3. COMPOSITION & LAYOUT:\n${compDetails.join('\n')}`);
  } else {
    sections.push(`3. COMPOSITION & LAYOUT:\n- Hero-centric commercial framing with clear negative space reserved for typography and upper-left brand mark.`);
  }

  if (bgDetails.length > 0) {
    sections.push(`4. BACKGROUND & ENVIRONMENT:\n${bgDetails.join('\n')}`);
  }

  const copyParts = [];
  if (headlineText) {
    copyParts.push(
      `- Primary Headline Text: "${headlineText}"` +
      (headlineTone ? ` | Tone: ${headlineTone}` : '') +
      (headlineFocus ? ` | Focus: ${headlineFocus}` : '') +
      (headlineLang ? ` | Language: ${headlineLang}` : '') +
      (headlineStrategy ? ` | Strategy: ${headlineStrategy}` : '')
    );
  }
  if (subheadlineText) {
    copyParts.push(`- Subheadline Text: "${subheadlineText}"`);
  }
  if (featureLines.length > 0) {
    copyParts.push(`- Key Product Callouts / Features:\n  ${featureLines.join('\n  ')}`);
  }
  if (copyParts.length > 0) {
    sections.push(
      `5. ON-IMAGE ADVERTISING COPY & CALLOUTS:\n` +
      `Render the following text crisply, legibly, and accurately with zero spelling errors:\n` +
      copyParts.join('\n')
    );
  }

  if (typoDetails.length > 0) {
    sections.push(`6. TYPOGRAPHY & HIERARCHY:\n${typoDetails.join('\n')}`);
  }

  if (lightDetails.length > 0) {
    sections.push(`7. LIGHTING, SHADOWS & REFLECTIONS:\n${lightDetails.join('\n')}`);
  }

  sections.push(
    `8. PRODUCTION QUALITY:\n` +
    `- Studio-grade commercial photography, sharp focus on product materials and textures, balanced color grading, print and social media campaign ready.`
  );

  return sections.join('\n\n');
}

/**
 * Exponential backoff fetch wrapper for Gemini API reliability.
 */
async function fetchWithBackoff(url, options, maxRetries = 3) {
  let delay = 1000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.status !== 429 && response.status < 500) {
      return response;
    }
    if (attempt === maxRetries) {
      return response;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay *= 2;
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Renders structured nested properties cleanly in read-only or inspector cards.
 */
function PropertyGrid({ data, excludeKeys = [] }) {
  if (!data || typeof data !== 'object') return null;

  const entries = Object.entries(data).filter(([key, val]) => {
    if (excludeKeys.includes(key)) return false;
    if (val === null || val === undefined || val === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return false;
    return true;
  });

  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-2.5 mt-3 pt-3 border-t border-neutral-100">
      {entries.map(([key, val]) => (
        <div key={key} className="flex flex-col bg-neutral-50/80 rounded-xl p-2.5 border border-neutral-100">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            {formatKey(key)}
          </span>
          <span className="text-xs font-medium text-neutral-800 mt-0.5 leading-relaxed break-words">
            {extractDisplayValue(val, '—')}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Section accordion/card wrapper for the Template Editor.
 */
function EditorSection({ icon: Icon, title, badge, children }) {
  return (
    <section className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">{title}</h3>
        </div>
        {badge && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // Navigation & View State: 'library' | 'editor' | 'result'
  const [activeScreen, setActiveScreen] = useState('library');

  // Template API State
  const [templates, setTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Selected Template & Editable Copy State (Original API response preserved in `templates`)
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [editableConfig, setEditableConfig] = useState(null);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // Brand Logo State
  const [logoFile, setLogoFile] = useState(null); // { name, size, mimeType, base64Data, dataUrl }
  const [logoError, setLogoError] = useState(null);
  const fileInputRef = useRef(null);

  // Gemini Model & Generation State
  const [geminiModel, setGeminiModel] = useState(DEFAULT_GEMINI_MODEL);
  const [showModelConfig, setShowModelConfig] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generationError, setGenerationError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null); // { dataUrl, mimeType, promptUsed, modelUsed, timestamp }
  const [downloadStatus, setDownloadStatus] = useState(null);

  // --------------------------------------------------------------------------
  // 1. FETCH TEMPLATES FROM REAL SUPABASE ENDPOINT
  // --------------------------------------------------------------------------
  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    setTemplatesError(null);
    try {
      const response = await fetch(SUPABASE_API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Supabase API responded with status ${response.status} (${response.statusText || 'Request Failed'})`);
      }

      const payload = await response.json();

      // Handle either direct array or wrapped { data: [...] } / { prompts: [...] } responses
      let list = [];
      if (Array.isArray(payload)) {
        list = payload;
      } else if (payload && typeof payload === 'object') {
        if (Array.isArray(payload.data)) list = payload.data;
        else if (Array.isArray(payload.prompts)) list = payload.prompts;
        else if (Array.isArray(payload.items)) list = payload.items;
        else {
          throw new Error('Unexpected response format from template API: expected an array of templates.');
        }
      }

      // Ensure each record has a stable unique identifier
      const normalized = list.map((item, index) => ({
        ...item,
        id: item.id !== undefined && item.id !== null ? item.id : `template-${index}`
      }));

      setTemplates(normalized);
    } catch (err) {
      setTemplatesError(err.message || 'Failed to load prompt templates from Supabase.');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // --------------------------------------------------------------------------
  // 2. DYNAMIC CATEGORIES & FILTERING
  // --------------------------------------------------------------------------
  const categories = useMemo(() => {
    const set = new Set(['All']);
    templates.forEach((tpl) => {
      extractCategories(tpl).forEach((cat) => set.add(cat));
    });
    return Array.from(set);
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'All') return templates;
    return templates.filter((tpl) => extractCategories(tpl).includes(selectedCategory));
  }, [templates, selectedCategory]);

  // --------------------------------------------------------------------------
  // 3. TEMPLATE SELECTION & IMMUTABLE EDITING HANDLERS
  // --------------------------------------------------------------------------
  const handleSelectTemplate = (template) => {
    setSelectedTemplateId(template.id);
    // Create a clean editable deep clone so original API template is never mutated
    const clone = deepClone(template);

    // Normalize editable fields safely while preserving all nested metadata
    if (typeof clone.headline !== 'object' || clone.headline === null) {
      clone.headline = { text: extractDisplayValue(clone.headline) };
    } else if (clone.headline.text === undefined) {
      clone.headline.text = '';
    }

    if (typeof clone.subheadline !== 'object' || clone.subheadline === null) {
      clone.subheadline = { text: extractDisplayValue(clone.subheadline) };
    } else if (clone.subheadline.text === undefined && clone.subheadline.description !== undefined) {
      clone.subheadline.text = clone.subheadline.description;
    } else if (clone.subheadline.text === undefined) {
      clone.subheadline.text = '';
    }

    if (!Array.isArray(clone.feature_items)) {
      clone.feature_items = [];
    }

    setEditableConfig(clone);
    setGenerationError(null);
    setActiveScreen('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateProductField = (value) => {
    setEditableConfig((prev) => {
      if (!prev) return prev;
      if (typeof prev.product === 'object' && prev.product !== null) {
        return { ...prev, product: { ...prev.product, name: value, text: value } };
      }
      return { ...prev, product: value };
    });
  };

  const updateHeadlineText = (value) => {
    setEditableConfig((prev) => {
      if (!prev) return prev;
      const currentHeadline = typeof prev.headline === 'object' && prev.headline !== null ? prev.headline : {};
      return {
        ...prev,
        headline: { ...currentHeadline, text: value }
      };
    });
  };

  const updateSubheadlineText = (value) => {
    setEditableConfig((prev) => {
      if (!prev) return prev;
      const currentSub = typeof prev.subheadline === 'object' && prev.subheadline !== null ? prev.subheadline : {};
      return {
        ...prev,
        subheadline: {
          ...currentSub,
          text: value,
          ...(currentSub.description !== undefined ? { description: value } : {})
        }
      };
    });
  };

  const updateFeatureTitle = (index, value) => {
    setEditableConfig((prev) => {
      if (!prev || !Array.isArray(prev.feature_items)) return prev;
      const updated = prev.feature_items.map((item, i) => {
        if (i !== index) return item;
        if (typeof item === 'object' && item !== null) {
          return { ...item, title: value };
        }
        return { title: value, icon: '' };
      });
      return { ...prev, feature_items: updated };
    });
  };

  const addFeatureItem = () => {
    setEditableConfig((prev) => {
      if (!prev) return prev;
      const current = Array.isArray(prev.feature_items) ? prev.feature_items : [];
      return {
        ...prev,
        feature_items: [...current, { icon: 'sparkles', title: '' }]
      };
    });
  };

  const removeFeatureItem = (index) => {
    setEditableConfig((prev) => {
      if (!prev || !Array.isArray(prev.feature_items)) return prev;
      return {
        ...prev,
        feature_items: prev.feature_items.filter((_, i) => i !== index)
      };
    });
  };

  // --------------------------------------------------------------------------
  // 4. BRAND LOGO UPLOAD, VALIDATION & BASE64 CONVERSION
  // --------------------------------------------------------------------------
  const handleLogoUpload = (e) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setLogoError('Unsupported format. Please upload a PNG, JPG, JPEG, or WebP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setLogoError('File is too large. Maximum allowed logo size is 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === 'string') {
        const base64Data = dataUrl.split(',')[1];
        setLogoFile({
          name: file.name,
          size: file.size,
          mimeType: file.type,
          base64Data,
          dataUrl
        });
      }
    };
    reader.onerror = () => {
      setLogoError('Unable to read the selected image file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --------------------------------------------------------------------------
  // 5. CONSTRUCTED PROMPT MEMO
  // --------------------------------------------------------------------------
  const constructedPrompt = useMemo(() => {
    if (!editableConfig) return '';
    return buildGeminiPrompt(editableConfig);
  }, [editableConfig]);

  // --------------------------------------------------------------------------
  // 6. GEMINI IMAGE GENERATION (WITH STRICT MODEL CHECK & LOGO REFERENCE)
  // --------------------------------------------------------------------------
  const handleGenerateImage = async () => {
    if (isGenerating) return; // Prevent duplicate generation requests
    if (!editableConfig) return;

    if (!logoFile || !logoFile.base64Data) {
      setGenerationError('Brand logo is mandatory. Please upload your brand logo before generating.');
      return;
    }

    const trimmedModel = geminiModel.trim();
    if (!trimmedModel) {
      setGenerationError('Gemini model identifier is required. Configure a valid model name.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationStep('Constructing commercial ad prompt & encoding brand logo...');

    try {
      const promptText = buildGeminiPrompt(editableConfig);
      const apiKey = ''; // Runtime-injected by Gemini Canvas environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(trimmedModel)}:generateContent?key=${apiKey}`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType: logoFile.mimeType,
                  data: logoFile.base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: '4:5'
          }
        }
      };

      setGenerationStep(`Generating 4:5 product visual with ${trimmedModel}...`);

      const response = await fetchWithBackoff(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const apiErrMsg =
          result?.error?.message ||
          `HTTP ${response.status}: ${response.statusText || 'Gemini API request failed'}`;

        if (response.status === 404 || apiErrMsg.toLowerCase().includes('not found') || apiErrMsg.toLowerCase().includes('supported')) {
          throw new Error(
            `Model "${trimmedModel}" is unavailable or unsupported in this environment (${apiErrMsg}). No fallback model was substituted. Verify model access or adjust the model configuration.`
          );
        }

        if (response.status === 401 || response.status === 403 || apiErrMsg.toLowerCase().includes('api key')) {
          throw new Error(
            `Gemini API authentication or permission error (${apiErrMsg}). Ensure the Canvas environment or backend proxy is configured with valid Gemini credentials.`
          );
        }

        throw new Error(`Gemini Generation Error: ${apiErrMsg}`);
      }

      const candidate = result?.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find((p) => p.inlineData && p.inlineData.data);

      if (!imagePart) {
        const finishReason = candidate?.finishReason;
        const textFeedback = candidate?.content?.parts?.find((p) => p.text)?.text;
        throw new Error(
          `Gemini did not return an image payload.${finishReason ? ` Finish reason: ${finishReason}.` : ''}${textFeedback ? ` Message: ${textFeedback}` : ''}`
        );
      }

      const outMime = imagePart.inlineData.mimeType || 'image/png';
      const outDataUrl = `data:${outMime};base64,${imagePart.inlineData.data}`;

      setGeneratedImage({
        dataUrl: outDataUrl,
        mimeType: outMime,
        promptUsed: promptText,
        modelUsed: trimmedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      setDownloadStatus(null);
      setActiveScreen('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setGenerationError(err.message || 'An unexpected error occurred during image generation.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // --------------------------------------------------------------------------
  // 7. IMAGE DOWNLOAD HANDLER WITH ERROR FEEDBACK
  // --------------------------------------------------------------------------
  const handleDownloadImage = () => {
    setDownloadStatus(null);
    if (!generatedImage?.dataUrl) {
      setDownloadStatus({ type: 'error', message: 'No generated image available to download.' });
      return;
    }

    try {
      const productSlug = extractDisplayValue(editableConfig?.product, 'product-ad')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const ext = generatedImage.mimeType.includes('jpeg') || generatedImage.mimeType.includes('jpg')
        ? 'jpg'
        : generatedImage.mimeType.includes('webp')
        ? 'webp'
        : 'png';

      const link = document.createElement('a');
      link.href = generatedImage.dataUrl;
      link.download = `${productSlug || 'prompt-studio'}-4x5.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStatus({ type: 'success', message: 'Image downloaded to your device.' });
    } catch (err) {
      setDownloadStatus({
        type: 'error',
        message: `Download failed: ${err.message || 'Unable to trigger file download in this browser.'}`
      });
    }
  };

  // ==========================================================================
  // RENDER: CENTERED MOBILE-ONLY SHELL
  // ==========================================================================
  return (
    <div className="min-h-screen bg-neutral-100/90 text-neutral-900 font-sans antialiased flex justify-center selection:bg-neutral-900 selection:text-white">
      {/* Centered Mobile Viewport Frame (max-w-[440px] on desktop, full width on mobile) */}
      <div className="w-full max-w-[440px] min-h-screen bg-neutral-50 border-x border-neutral-200/80 shadow-[0_0_40px_rgba(0,0,0,0.04)] flex flex-col relative">
        
        {/* ====================================================================
            SCREEN 1: TEMPLATE LIBRARY
           ==================================================================== */}
        {activeScreen === 'library' && (
          <>
            {/* Sticky Top Header */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-neutral-900">
                      Prompt Studio
                    </h1>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Create premium product visuals.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchTemplates}
                  disabled={isLoadingTemplates}
                  aria-label="Refresh templates"
                  className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingTemplates ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Horizontally Scrollable Category Chips */}
              <div className="mt-4 -mx-5 px-5 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 pb-1">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-neutral-900 text-white shadow-sm'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </header>

            {/* Main Template Feed */}
            <main className="flex-1 px-5 py-5 space-y-4">
              {/* Loading Skeletons */}
              {isLoadingTemplates && (
                <div className="space-y-4" aria-label="Loading templates">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="bg-white rounded-2xl border border-neutral-200/80 p-4 space-y-3 animate-pulse"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-24 bg-neutral-200 rounded-full" />
                        <div className="h-4 w-16 bg-neutral-100 rounded-full" />
                      </div>
                      <div className="h-5 w-3/4 bg-neutral-200 rounded-lg" />
                      <div className="h-12 w-full bg-neutral-100 rounded-xl" />
                      <div className="h-11 w-full bg-neutral-200 rounded-xl" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {!isLoadingTemplates && templatesError && (
                <div className="bg-white rounded-2xl border border-red-200 p-6 text-center space-y-3 shadow-sm">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Unable to Load Templates
                  </h2>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {templatesError}
                  </p>
                  <button
                    type="button"
                    onClick={fetchTemplates}
                    className="w-full py-3 px-4 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 active:scale-[0.99] transition-all inline-flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoadingTemplates && !templatesError && filteredTemplates.length === 0 && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-neutral-900">
                    No Templates Found
                  </h2>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {selectedCategory === 'All'
                      ? 'The Supabase endpoint returned an empty template collection.'
                      : `No prompt templates match the "${selectedCategory}" category.`}
                  </p>
                  {selectedCategory !== 'All' ? (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('All')}
                      className="px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-medium"
                    >
                      Show All Templates
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={fetchTemplates}
                      className="px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-medium"
                    >
                      Refresh Library
                    </button>
                  )}
                </div>
              )}

              {/* Template Cards */}
              {!isLoadingTemplates &&
                !templatesError &&
                filteredTemplates.map((tpl) => {
                  const productName = extractDisplayValue(tpl.product, 'Untitled Product');
                  const tplCategories = extractCategories(tpl);
                  const adStyle = extractDisplayValue(tpl.style);
                  const visualStyle = extractDisplayValue(tpl.visual_style);
                  const headlinePreview = extractDisplayValue(
                    typeof tpl.headline === 'object' && tpl.headline !== null ? tpl.headline.text : tpl.headline,
                    extractDisplayValue(tpl.caption, 'No headline preview available.')
                  );

                  return (
                    <article
                      key={tpl.id}
                      className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-neutral-300 transition-all flex flex-col justify-between gap-3.5"
                    >
                      <div>
                        {/* Top Metadata Row: Categories & Ready Badge */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {tplCategories.map((cat) => (
                              <span
                                key={cat}
                                className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-medium"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                          {tpl.is_ready !== undefined && (
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                tpl.is_ready
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              }`}
                            >
                              {tpl.is_ready ? 'Ready' : 'Draft'}
                            </span>
                          )}
                        </div>

                        {/* Product Title */}
                        <h2 className="text-base font-bold text-neutral-900 mt-2.5 tracking-tight">
                          {productName}
                        </h2>

                        {/* Style & Visual Style Badges */}
                        {(adStyle || visualStyle) && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {adStyle && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-neutral-600 bg-neutral-50 border border-neutral-200/70 px-2.5 py-1 rounded-lg">
                                <Layout className="w-3 h-3 text-neutral-400" />
                                {adStyle}
                              </span>
                            )}
                            {visualStyle && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-neutral-600 bg-neutral-50 border border-neutral-200/70 px-2.5 py-1 rounded-lg">
                                <Palette className="w-3 h-3 text-neutral-400" />
                                {visualStyle}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Headline Preview Box */}
                        <div className="mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                            Headline Preview
                          </span>
                          <p className="text-xs font-medium text-neutral-800 line-clamp-2 leading-relaxed">
                            “{headlinePreview}”
                          </p>
                        </div>
                      </div>

                      {/* Primary Action */}
                      <button
                        type="button"
                        onClick={() => handleSelectTemplate(tpl)}
                        className="w-full py-3 px-4 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                      >
                        <span>Select Template</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </article>
                  );
                })}
            </main>
          </>
        )}

        {/* ====================================================================
            SCREEN 2 & 3: TEMPLATE EDITOR + BRAND LOGO UPLOAD + GENERATION
           ==================================================================== */}
        {activeScreen === 'editor' && editableConfig && (
          <>
            {/* Sticky Editor Header */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 py-3.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActiveScreen('library')}
                className="p-2.5 -ml-1 rounded-xl text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Templates</span>
              </button>

              <div className="text-center">
                <span className="text-xs font-bold text-neutral-900 block">
                  Template Editor
                </span>
                <span className="text-[10px] text-neutral-400 block">
                  4:5 Portrait • 1024×1280
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowModelConfig((v) => !v)}
                aria-label="Configure Gemini Model"
                className={`p-2.5 rounded-xl border transition-all ${
                  showModelConfig
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <Cpu className="w-4 h-4" />
              </button>
            </header>

            {/* Collapsible Gemini Model Configuration Drawer */}
            {showModelConfig && (
              <div className="bg-neutral-900 text-white px-5 py-4 border-b border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                    Gemini Image Model
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                    Strict Mode
                  </span>
                </div>
                <input
                  type="text"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  placeholder="gemini-3.1-flash-image"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                />
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Default: <code className="text-neutral-200">gemini-3.1-flash-image</code>. If unavailable, an explicit configuration error will be shown without silent substitution.
                </p>
              </div>
            )}

            {/* Editor Scroll Body */}
            <main className="flex-1 px-4 py-5 space-y-4 pb-36">
              {/* SECTION 3: MANDATORY BRAND LOGO UPLOAD */}
              <section className="bg-white rounded-2xl border-2 border-neutral-900/10 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                      <FileImage className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Brand Logo</h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-neutral-900 text-white">
                    Required
                  </span>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                  Placed subtly in the upper-left corner with original proportions and colors preserved. PNG, JPG, JPEG, or WebP (max 5 MB).
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                {!logoFile ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 px-4 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/70 hover:bg-neutral-100/70 hover:border-neutral-400 transition-all flex flex-col items-center justify-center gap-2 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shadow-xs">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-neutral-900 block">
                        Tap to Upload Brand Logo
                      </span>
                      <span className="text-[11px] text-neutral-400 mt-0.5 block">
                        PNG, JPG, JPEG, WebP
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-white border border-neutral-200 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={logoFile.dataUrl}
                        alt="Uploaded brand logo preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 truncate">
                        {logoFile.name}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {(logoFile.size / 1024).toFixed(1)} KB • {logoFile.mimeType.split('/')[1].toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-100 text-[11px] font-medium text-red-600 hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {logoError && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{logoError}</span>
                  </div>
                )}
              </section>

              {/* A. PRODUCT INFORMATION */}
              <EditorSection icon={Layers} title="A. Product Information" badge="Editable">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={extractDisplayValue(editableConfig.product)}
                      onChange={(e) => updateProductField(e.target.value)}
                      placeholder="Enter product name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm font-medium text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-100">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block">
                        Category
                      </span>
                      <span className="text-xs font-medium text-neutral-800 mt-0.5 block">
                        {extractCategories(editableConfig).join(', ')}
                      </span>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-100">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block">
                        Style
                      </span>
                      <span className="text-xs font-medium text-neutral-800 mt-0.5 block">
                        {extractDisplayValue(editableConfig.style, 'Standard')}
                      </span>
                    </div>
                  </div>
                </div>
              </EditorSection>

              {/* B. HEADLINE */}
              <EditorSection icon={Type} title="B. Headline" badge="Editable">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Headline Text
                    </label>
                    <textarea
                      rows={2}
                      value={
                        typeof editableConfig.headline === 'object' && editableConfig.headline !== null
                          ? editableConfig.headline.text || ''
                          : extractDisplayValue(editableConfig.headline)
                      }
                      onChange={(e) => updateHeadlineText(e.target.value)}
                      placeholder="Enter primary advertisement headline"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm font-medium text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                    />
                  </div>

                  {typeof editableConfig.headline === 'object' && editableConfig.headline !== null && (
                    <PropertyGrid data={editableConfig.headline} excludeKeys={['text']} />
                  )}
                </div>
              </EditorSection>

              {/* C. SUBHEADLINE */}
              <EditorSection icon={Type} title="C. Subheadline" badge="Editable">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Subheadline Description
                  </label>
                  <textarea
                    rows={2}
                    value={
                      typeof editableConfig.subheadline === 'object' && editableConfig.subheadline !== null
                        ? editableConfig.subheadline.text || editableConfig.subheadline.description || ''
                        : extractDisplayValue(editableConfig.subheadline)
                    }
                    onChange={(e) => updateSubheadlineText(e.target.value)}
                    placeholder="Enter supporting subheadline"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-medium text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors resize-none leading-relaxed"
                  />
                </div>
                {typeof editableConfig.subheadline === 'object' && editableConfig.subheadline !== null && (
                  <PropertyGrid data={editableConfig.subheadline} excludeKeys={['text', 'description']} />
                )}
              </EditorSection>

              {/* D. FEATURES */}
              <EditorSection icon={CheckCircle2} title="D. Features" badge="Editable">
                <div className="space-y-2.5">
                  {Array.isArray(editableConfig.feature_items) && editableConfig.feature_items.length > 0 ? (
                    editableConfig.feature_items.map((item, index) => {
                      const titleVal =
                        typeof item === 'object' && item !== null
                          ? item.title || item.text || ''
                          : extractDisplayValue(item);
                      const iconVal =
                        typeof item === 'object' && item !== null ? extractDisplayValue(item.icon) : '';

                      return (
                        <div key={index} className="flex items-center gap-2">
                          <div className="px-2.5 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200/70 text-[11px] font-medium text-neutral-600 shrink-0 min-w-[72px] text-center truncate">
                            {iconVal || `#${index + 1}`}
                          </div>
                          <input
                            type="text"
                            value={titleVal}
                            onChange={(e) => updateFeatureTitle(index, e.target.value)}
                            placeholder={`Feature ${index + 1} title`}
                            className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-medium text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeatureItem(index)}
                            aria-label="Remove feature"
                            className="p-2.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-neutral-400">No feature callouts configured.</p>
                  )}

                  <button
                    type="button"
                    onClick={addFeatureItem}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-neutral-300 text-xs font-medium text-neutral-600 hover:bg-neutral-50 flex items-center justify-center gap-1.5 mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Feature Callout
                  </button>
                </div>
              </EditorSection>

              {/* E. COMPOSITION */}
              {editableConfig.composition && (
                <EditorSection icon={Layout} title="E. Composition" badge="Preset">
                  <PropertyGrid data={editableConfig.composition} />
                </EditorSection>
              )}

              {/* F. BACKGROUND */}
              {editableConfig.background && (
                <EditorSection icon={ImageIcon} title="F. Background" badge="Preset">
                  {typeof editableConfig.background === 'object' ? (
                    <PropertyGrid data={editableConfig.background} />
                  ) : (
                    <p className="text-xs text-neutral-700">{extractDisplayValue(editableConfig.background)}</p>
                  )}
                </EditorSection>
              )}

              {/* G. TYPOGRAPHY */}
              {editableConfig.typography && (
                <EditorSection icon={Sliders} title="G. Typography" badge="Preset">
                  <PropertyGrid data={editableConfig.typography} />
                </EditorSection>
              )}

              {/* H. LIGHTING */}
              {editableConfig.lighting && (
                <EditorSection icon={Sun} title="H. Lighting" badge="Preset">
                  <PropertyGrid data={editableConfig.lighting} />
                </EditorSection>
              )}

              {/* I. VISUAL STYLE */}
              {editableConfig.visual_style && (
                <EditorSection icon={Palette} title="I. Visual Style" badge="Preset">
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    <span className="text-xs font-medium text-neutral-800 leading-relaxed">
                      {extractDisplayValue(editableConfig.visual_style)}
                    </span>
                  </div>
                </EditorSection>
              )}

              {/* PROMPT INSPECTOR TOGGLE */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-4">
                <button
                  type="button"
                  onClick={() => setShowPromptPreview((v) => !v)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-700"
                >
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-neutral-500" />
                    Inspect Constructed Gemini Prompt
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {showPromptPreview ? 'Hide' : 'View'}
                  </span>
                </button>
                {showPromptPreview && (
                  <pre className="mt-3 p-3 rounded-xl bg-neutral-900 text-neutral-200 text-[11px] whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
                    {constructedPrompt}
                  </pre>
                )}
              </div>

              {/* GENERATION ERROR DISPLAY */}
              {generationError && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 space-y-2">
                  <div className="flex items-start gap-2.5 text-red-800">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <div className="text-xs leading-relaxed">
                      <span className="font-bold block mb-0.5">Generation Blocked / Error</span>
                      {generationError}
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* Sticky Bottom Generate CTA Bar */}
            <div className="fixed bottom-0 w-full max-w-[440px] bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-4 z-30">
              {isGenerating ? (
                <div className="w-full py-3.5 px-4 rounded-2xl bg-neutral-900 text-white flex items-center justify-center gap-3">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span className="text-xs font-semibold truncate">
                    {generationStep || 'Generating advertisement...'}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={!logoFile}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm ${
                    logoFile
                      ? 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.99]'
                      : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {logoFile ? 'Generate 4:5 Product Image' : 'Upload Brand Logo to Generate'}
                  </span>
                </button>
              )}
            </div>
          </>
        )}

        {/* ====================================================================
            SCREEN 5: IMAGE RESULT
           ==================================================================== */}
        {activeScreen === 'result' && generatedImage && (
          <>
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 py-3.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveScreen('editor')}
                className="p-2.5 -ml-1 rounded-xl text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Editor</span>
              </button>

              <span className="text-xs font-bold text-neutral-900">
                Generated Visual
              </span>

              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                4:5 Ready
              </span>
            </header>

            <main className="flex-1 px-5 py-5 space-y-5">
              {/* 4:5 Portrait Image Container */}
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-200/70 border border-neutral-200 shadow-md relative">
                <img
                  src={generatedImage.dataUrl}
                  alt={`Generated advertisement for ${extractDisplayValue(editableConfig?.product)}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Result Metadata Card */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Product
                    </span>
                    <h2 className="text-base font-bold text-neutral-900">
                      {extractDisplayValue(editableConfig?.product, 'Product Advertisement')}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Generated
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Template ID</span>
                    <span className="font-medium text-neutral-700 truncate block">
                      {String(selectedTemplateId)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Model</span>
                    <span className="font-medium text-neutral-700 truncate block">
                      {generatedImage.modelUsed}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error feedback on regeneration or download */}
              {generationError && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generationError}</span>
                </div>
              )}

              {downloadStatus && (
                <div
                  className={`rounded-2xl p-3.5 border text-xs flex items-center gap-2 ${
                    downloadStatus.type === 'error'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  {downloadStatus.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{downloadStatus.message}</span>
                </div>
              )}

              {/* Action Controls */}
              <div className="space-y-2.5 pt-1 pb-6">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="w-full py-3.5 px-4 rounded-2xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Image</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                    className="py-3 px-4 rounded-2xl bg-white border border-neutral-200 text-neutral-900 text-xs font-semibold hover:bg-neutral-50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>{isGenerating ? 'Generating...' : 'Generate Again'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveScreen('editor')}
                    disabled={isGenerating}
                    className="py-3 px-4 rounded-2xl bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Editor</span>
                  </button>
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
