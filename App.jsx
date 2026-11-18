import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Download,
  Maximize2,
  X,
  Image as ImageIcon,
  Sliders,
  FileText,
  CloudUpload,
  Key
} from 'lucide-react';

// Exact Edge Function Endpoints
const CRUD_MAKE_PROMPT_URL = 'https://jhpbtooefyzdndstlzva.supabase.co/functions/v1/crud-make-prompt';
const UPLOAD_IMAGE_URL = 'https://jhpbtooefyzdndstlzva.supabase.co/functions/v1/upload-image';

// Exact 10 Variable Keys (preserving exact spelling including 'typographhy')
const VARIABLE_KEYS = [
  'product',
  'style',
  'visual_style',
  'headline',
  'subheadline',
  'feature_items',
  'composition',
  'background',
  'typographhy',
  'lighting'
];

const EMPTY_VARIABLES = {
  product: '',
  style: '',
  visual_style: '',
  headline: '',
  subheadline: '',
  feature_items: '',
  composition: '',
  background: '',
  typographhy: '',
  lighting: ''
};

/**
 * Formats any API field (string, array, or nested object) into a clean editable string
 * without inventing missing data.
 */
function serializeFieldForEditor(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

/**
 * Extracts the exact 10 variables from a Supabase record without inventing missing values.
 * Maps both `typographhy` and `typography` from source record into the `typographhy` variable.
 */
function extractVariablesFromRecord(record) {
  if (!record || typeof record !== 'object') return { ...EMPTY_VARIABLES };

  const typographySource =
    record.typographhy !== undefined ? record.typographhy : record.typography;

  return {
    product: serializeFieldForEditor(record.product),
    style: serializeFieldForEditor(record.style),
    visual_style: serializeFieldForEditor(record.visual_style),
    headline: serializeFieldForEditor(record.headline),
    subheadline: serializeFieldForEditor(record.subheadline),
    feature_items: serializeFieldForEditor(record.feature_items),
    composition: serializeFieldForEditor(record.composition),
    background: serializeFieldForEditor(record.background),
    typographhy: serializeFieldForEditor(typographySource),
    lighting: serializeFieldForEditor(record.lighting)
  };
}

/**
 * Master Prompt Builder:
 * Preserves the exact master prompt verbatim and substitutes only the 10 placeholders.
 */
function buildMasterPrompt(vars) {
  return `Create a premium Instagram Feed advertising design for @appletheexchangetrx.
Design a visually striking Apple product advertisement inspired by the clean, minimalist, premium aesthetic of Apple's official product campaigns, adapted for @appletheexchangetrx's Instagram branding.
product
${vars.product}
style
${vars.style}
visual_style
${vars.visual_style}
headline
${vars.headline}
subheadline
${vars.subheadline}
feature_items
${vars.feature_items}
composition
${vars.composition}
background
${vars.background}
typographhy
${vars.typographhy}
lighting
${vars.lighting}
CREATIVE DIRECTION:
Create a premium product-focused Instagram advertisement with a sophisticated Apple-inspired art direction.
- Make the product the main visual attraction.
- Use elegant and minimal visual composition.
- Maintain a clean and luxurious aesthetic.
- Create strong visual hierarchy.
- Use precise product details and realistic materials.
- Integrate headline and subheadline naturally.
- Present product features with elegant visual callouts.
- Avoid unnecessary decorative elements.
- Maintain generous negative space.
- Ensure excellent readability on mobile screens.
BRAND DIRECTION:
The overall appearance should communicate premium quality, innovation, trust, and exclusivity.
The design should feel like a professionally art-directed Apple product campaign while maintaining a distinctive identity for @appletheexchangetrx.
OUTPUT REQUIREMENTS:
- Instagram Feed format.
- Aspect ratio: 4:5.
- Resolution: 1080 × 1350 px.
- Premium commercial advertising quality.
- Sharp details and refined typography.
- Balanced visual hierarchy.
- Product-centric composition.
IMPORTANT:
Follow all 10 variables precisely. Do not invent additional headlines, product specifications, or promotional text. Render all supplied text accurately.`;
}

/**
 * Clipboard copy helper compatible with sandboxed iFrames
 */
function copyTextToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

/**
 * Exponential backoff fetch wrapper for Gemini API reliability
 */
async function fetchWithBackoff(url, options, retries = 3) {
  let delay = 1000;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 429 || response.status >= 500) {
        if (i < retries - 1) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
      }
      return response;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

/**
 * Helper: Safely extract a short display headline for record cards
 */
function getRecordHeadlinePreview(record) {
  if (!record?.headline) return '';
  if (typeof record.headline === 'string') return record.headline;
  if (typeof record.headline === 'object' && record.headline.text) {
    return String(record.headline.text);
  }
  return '';
}

export default function App() {
  // Optional Supabase Anon Key if gateway/RLS requires it
  const [anonKey, setAnonKey] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // Step 1: Template Selection State
  const [records, setRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState(null);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isLoadingSingleRecord, setIsLoadingSingleRecord] = useState(false);

  // Step 2: 10 Variables Configuration State
  const [originalVariables, setOriginalVariables] = useState({ ...EMPTY_VARIABLES });
  const [variables, setVariables] = useState({ ...EMPTY_VARIABLES });
  const [validationErrors, setValidationErrors] = useState([]);

  // Step 3: Prompt Preview State
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Step 4: Gemini Image Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generatedImageBase64, setGeneratedImageBase64] = useState(null);
  const [generatedImageMimeType, setGeneratedImageMimeType] = useState('image/png');

  // Step 5: Edge Function Upload State (upload-image -> images bucket)
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [copiedImageUrl, setCopiedImageUrl] = useState(false);

  // Step 6: Save image_url to crud-make-prompt (PATCH /?id={id})
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [saveUrlError, setSaveUrlError] = useState(null);
  const [isImageUrlSaved, setIsImageUrlSaved] = useState(false);

  // Fullscreen Modal Preview
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);

  // Toast Feedback
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Build headers for Supabase Edge Functions
  const getEdgeHeaders = (includeJsonContentType = false) => {
    const headers = {};
    if (includeJsonContentType) {
      headers['Content-Type'] = 'application/json';
    }
    if (anonKey.trim()) {
      headers['apikey'] = anonKey.trim();
      headers['Authorization'] = `Bearer ${anonKey.trim()}`;
    }
    return headers;
  };

  // Retrieve all prompt records from GET /
  const loadRecords = async () => {
    setIsLoadingRecords(true);
    setRecordsError(null);
    try {
      const response = await fetch(CRUD_MAKE_PROMPT_URL, {
        method: 'GET',
        headers: getEdgeHeaders(false)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || `Edge Function returned HTTP ${response.status}.`
        );
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of prompt records.');
      }

      setRecords(data);
    } catch (err) {
      setRecordsError(err.message || 'Failed to connect to crud-make-prompt Edge Function.');
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Retrieve specific record via GET /?id={id} and populate all 10 variables
  const handleSelectRecord = async (recordItem) => {
    setSelectedRecordId(recordItem.id);
    setIsLoadingSingleRecord(true);
    setValidationErrors([]);
    setGenerationError(null);

    try {
      const response = await fetch(
        `${CRUD_MAKE_PROMPT_URL}?id=${encodeURIComponent(recordItem.id)}`,
        {
          method: 'GET',
          headers: getEdgeHeaders(false)
        }
      );

      let authoritativeRecord = recordItem;
      if (response.ok) {
        const fetchedSingle = await response.json();
        if (fetchedSingle && typeof fetchedSingle === 'object' && !Array.isArray(fetchedSingle)) {
          authoritativeRecord = fetchedSingle;
        }
      }

      setSelectedRecord(authoritativeRecord);
      const extracted = extractVariablesFromRecord(authoritativeRecord);
      setOriginalVariables(extracted);
      setVariables({ ...extracted });
      showToast('success', `Loaded variables for ${authoritativeRecord.product || authoritativeRecord.id}`);
    } catch {
      // Fallback to list record object if single fetch fails due to transient network error
      setSelectedRecord(recordItem);
      const extracted = extractVariablesFromRecord(recordItem);
      setOriginalVariables(extracted);
      setVariables({ ...extracted });
    } finally {
      setIsLoadingSingleRecord(false);
    }
  };

  // Live built prompt
  const finalPrompt = useMemo(() => buildMasterPrompt(variables), [variables]);

  // Handle variable edit
  const handleVariableChange = (key, value) => {
    setVariables((prev) => ({
      ...prev,
      [key]: value
    }));
    if (validationErrors.length > 0) {
      setValidationErrors((prev) => prev.filter((k) => k !== key));
    }
  };

  // Reset Variables to original record values
  const handleResetVariables = () => {
    setVariables({ ...originalVariables });
    setValidationErrors([]);
    showToast('success', 'Variables restored to original record values.');
  };

  // Copy Final Prompt
  const handleCopyPrompt = () => {
    const ok = copyTextToClipboard(finalPrompt);
    if (ok) {
      setCopiedPrompt(true);
      showToast('success', 'Final prompt copied to clipboard.');
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      showToast('error', 'Unable to copy prompt.');
    }
  };

  // Copy Uploaded Image URL
  const handleCopyImageUrl = () => {
    if (!uploadedImageUrl) return;
    const ok = copyTextToClipboard(uploadedImageUrl);
    if (ok) {
      setCopiedImageUrl(true);
      showToast('success', 'Public image URL copied.');
      setTimeout(() => setCopiedImageUrl(false), 2000);
    } else {
      showToast('error', 'Unable to copy image URL.');
    }
  };

  // Convert Base64 image to File preserving format and binary integrity
  const base64ToImageFile = (base64Data, mimeType) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const ext =
      mimeType === 'image/jpeg'
        ? 'jpg'
        : mimeType === 'image/webp'
        ? 'webp'
        : 'png';
    const safeSlug = (variables.product || selectedRecord?.id || 'apple-ad')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const fileName = `${safeSlug || 'ad'}-${Date.now()}.${ext}`;
    const blob = new Blob([byteArray], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  };

  /**
   * Save returned image_url to the selected record via PATCH /?id={id} on crud-make-prompt
   */
  const saveImageUrlToPromptRecord = async (recordId, imageUrl) => {
    if (!recordId || !imageUrl) return;
    setIsSavingUrl(true);
    setSaveUrlError(null);
    setIsImageUrlSaved(false);

    try {
      const response = await fetch(
        `${CRUD_MAKE_PROMPT_URL}?id=${encodeURIComponent(recordId)}`,
        {
          method: 'PATCH',
          headers: getEdgeHeaders(true),
          body: JSON.stringify({ image_url: imageUrl })
        }
      );

      const responseText = await response.text();
      let payload = {};
      try {
        payload = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(`Invalid response from crud-make-prompt PATCH (HTTP ${response.status}).`);
      }

      if (!response.ok) {
        throw new Error(
          payload.error ||
            payload.message ||
            `Failed to update image_url (HTTP ${response.status}).`
        );
      }

      setIsImageUrlSaved(true);
      setSelectedRecord((prev) =>
        prev && prev.id === recordId ? { ...prev, ...payload, image_url: imageUrl } : prev
      );
      setRecords((prev) =>
        prev.map((item) =>
          item.id === recordId ? { ...item, ...payload, image_url: imageUrl } : item
        )
      );
      showToast('success', 'image_url saved to prompt record.');
    } catch (err) {
      setSaveUrlError(err.message || 'Failed to save image_url to database.');
      showToast('error', 'Failed to save image_url. You can retry below.');
    } finally {
      setIsSavingUrl(false);
    }
  };

  /**
   * Upload generated image to POST https://jhpbtooefyzdndstlzva.supabase.co/functions/v1/upload-image
   * Handles multipart/form-data (primary Edge Function storage contract) with JSON fallback if required,
   * and strictly extracts the returned public image URL without fabricating URLs.
   */
  const uploadGeneratedImageToEdge = async (base64Data, mimeType) => {
    setIsUploading(true);
    setUploadError(null);
    setSaveUrlError(null);
    setIsImageUrlSaved(false);

    try {
      const imageFile = base64ToImageFile(base64Data, mimeType);
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch(UPLOAD_IMAGE_URL, {
        method: 'POST',
        headers: getEdgeHeaders(false),
        body: formData
      });

      const responseText = await response.text();
      let payload = {};
      try {
        payload = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(`Invalid non-JSON response from upload-image (HTTP ${response.status}).`);
      }

      if (!response.ok) {
        throw new Error(
          payload.error ||
            payload.message ||
            `Upload failed with HTTP ${response.status}.`
        );
      }

      // Extract returned public URL from documented response structure
      const returnedUrl =
        payload.image_url ||
        payload.publicUrl ||
        payload.public_url ||
        payload.url ||
        payload?.data?.image_url ||
        payload?.data?.publicUrl;

      if (!returnedUrl || typeof returnedUrl !== 'string') {
        throw new Error(
          'Upload succeeded, but upload-image response did not include a valid public image URL.'
        );
      }

      setUploadedImageUrl(returnedUrl);
      setIsUploading(false);

      // Automatically save returned URL to selected record's image_url via PATCH /?id={id}
      if (selectedRecord?.id) {
        await saveImageUrlToPromptRecord(selectedRecord.id, returnedUrl);
      } else {
        showToast('success', 'Image uploaded to Supabase Storage.');
      }
    } catch (err) {
      setUploadError(err.message || 'Network interruption or failure during image upload.');
      showToast('error', 'Image upload failed. You can retry upload below.');
    } finally {
      setIsUploading(false);
    }
  };

  // Validate all 10 variables, generate 4:5 image via Gemini, then automatically upload
  const handleGenerateAndUpload = async () => {
    if (isGenerating || isUploading || isSavingUrl) return;

    // 1. Validate all 10 variables
    const missingKeys = VARIABLE_KEYS.filter((key) => !variables[key] || !variables[key].trim());
    if (missingKeys.length > 0) {
      setValidationErrors(missingKeys);
      showToast('error', `Missing required variables: ${missingKeys.join(', ')}`);
      return;
    }

    setValidationErrors([]);
    setIsGenerating(true);
    setGenerationError(null);
    setUploadError(null);
    setUploadedImageUrl(null);
    setSaveUrlError(null);
    setIsImageUrlSaved(false);

    try {
      const promptToSend = buildMasterPrompt(variables);
      const apiKey = ''; // Provided automatically by Gemini Canvas runtime
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;

      const requestPayload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: promptToSend }]
          }
        ],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: '4:5'
          }
        }
      };

      const response = await fetchWithBackoff(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result) {
        throw new Error(
          result?.error?.message ||
            `Gemini Image Generation unavailable or failed (HTTP ${response.status}).`
        );
      }

      const inlinePart = result?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);

      if (!inlinePart?.inlineData?.data) {
        throw new Error(
          'Gemini returned an invalid or empty image output. Please verify your prompt variables and try again.'
        );
      }

      const b64 = inlinePart.inlineData.data;
      const mime = inlinePart.inlineData.mimeType || 'image/png';

      // Preserve generated image in state immediately
      setGeneratedImageBase64(b64);
      setGeneratedImageMimeType(mime);
      setIsGenerating(false);

      // Automatically proceed to upload-image Edge Function
      await uploadGeneratedImageToEdge(b64, mime);
    } catch (err) {
      setIsGenerating(false);
      setGenerationError(err.message || 'Image generation failed.');
      showToast('error', 'Image generation failed.');
    }
  };

  // Retry upload without regenerating the image
  const handleRetryUpload = () => {
    if (!generatedImageBase64 || isUploading) return;
    uploadGeneratedImageToEdge(generatedImageBase64, generatedImageMimeType);
  };

  // Retry saving image_url to crud-make-prompt without re-uploading or regenerating
  const handleRetrySaveUrl = () => {
    if (!selectedRecord?.id || !uploadedImageUrl || isSavingUrl) return;
    saveImageUrlToPromptRecord(selectedRecord.id, uploadedImageUrl);
  };

  // Download generated image locally
  const handleDownloadImage = () => {
    if (!generatedImageBase64) return;
    const ext =
      generatedImageMimeType === 'image/jpeg'
        ? 'jpg'
        : generatedImageMimeType === 'image/webp'
        ? 'webp'
        : 'png';
    const link = document.createElement('a');
    link.href = `data:${generatedImageMimeType};base64,${generatedImageBase64}`;
    link.download = `appletheexchangetrx-${selectedRecord?.id || 'ad'}-1080x1350.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Active preview source: prefer persistent uploaded URL whenever available, else local generated base64
  const activePreviewSrc =
    uploadedImageUrl ||
    (generatedImageBase64 ? `data:${generatedImageMimeType};base64,${generatedImageBase64}` : null);

  return (
    <div className="h-full w-full bg-[#F5F5F7] flex justify-center overflow-hidden">
      {/* Mobile-Only Shell: max-width 500px, flex column, overflow hidden */}
      <div className="w-full max-w-[500px] h-full bg-white flex flex-col border-x border-neutral-200 overflow-hidden relative">
        {/* ============================================================
            A. HEADER
           ============================================================ */}
        <header className="shrink-0 bg-white border-b border-neutral-200 px-4 py-3.5 flex items-center justify-between z-20">
          <div className="min-w-0">
            <h1 className="text-[17px] font-semibold tracking-tight text-black truncate">
              Apple Advertisement Studio
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              AI Image Generator • @appletheexchangetrx
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowKeyConfig((prev) => !prev)}
              className={`h-9 px-2.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition ${
                anonKey.trim()
                  ? 'bg-neutral-100 border-neutral-300 text-black'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
              title="Optional Supabase API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Key</span>
            </button>

            <button
              type="button"
              onClick={loadRecords}
              disabled={isLoadingRecords}
              className="h-9 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 active:scale-[0.98] text-black text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
              aria-label="Refresh records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRecords ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Optional Supabase Anon Key Drawer */}
        {showKeyConfig && (
          <div className="shrink-0 bg-neutral-50 border-b border-neutral-200 px-4 py-3 space-y-2 z-20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black">
                Supabase Anon Key (Optional)
              </span>
              <button
                type="button"
                onClick={() => setShowKeyConfig(false)}
                className="text-neutral-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="Paste Supabase anon key if required..."
                className="flex-1 h-9 px-3 rounded-xl bg-white border border-neutral-300 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => {
                  setShowKeyConfig(false);
                  loadRecords();
                }}
                className="h-9 px-3.5 rounded-xl bg-black text-white text-xs font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Toast Notification Banner */}
        {toast && (
          <div className="absolute top-16 left-4 right-4 z-30 pointer-events-none flex justify-center">
            <div
              className={`pointer-events-auto flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border shadow-sm text-xs font-medium max-w-full ${
                toast.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-black border-neutral-800 text-white'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span className="truncate">{toast.message}</span>
            </div>
          </div>
        )}

        {/* ============================================================
            INDEPENDENTLY SCROLLABLE MAIN CONTENT (flex: 1)
           ============================================================ */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F5F5F7] p-4 space-y-5">
          {/* ------------------------------------------------------------
              B. TEMPLATE SELECTION
             ------------------------------------------------------------ */}
          <section className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-semibold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-semibold text-black">Select Prompt Data</h2>
              </div>
              <span className="text-[11px] text-neutral-500">
                {records.length} {records.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            {/* Loading State */}
            {isLoadingRecords && (
              <div className="space-y-2">
                {[1, 2].map((skeleton) => (
                  <div
                    key={skeleton}
                    className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 animate-pulse space-y-2"
                  >
                    <div className="h-3.5 w-1/2 bg-neutral-200 rounded" />
                    <div className="h-3 w-3/4 bg-neutral-200 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {!isLoadingRecords && recordsError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2.5">
                <div className="flex items-start gap-2 text-red-900">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold">Unable to Load Prompt Records</p>
                    <p className="text-red-700 leading-relaxed">{recordsError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={loadRecords}
                  className="h-8 px-3 rounded-lg bg-black text-white text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            )}

            {/* Empty Records State */}
            {!isLoadingRecords && !recordsError && records.length === 0 && (
              <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50 text-center space-y-1">
                <p className="text-xs font-semibold text-black">No Prompt Records Found</p>
                <p className="text-[11px] text-neutral-500">
                  The crud-make-prompt Edge Function returned 0 records.
                </p>
              </div>
            )}

            {/* Records List */}
            {!isLoadingRecords && !recordsError && records.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
                {records.map((rec) => {
                  const isSelected = selectedRecordId === rec.id;
                  const templateName = rec.name || rec.template_name || rec.id;
                  const productName = rec.product || null;
                  const description =
                    rec.subheadline || getRecordHeadlinePreview(rec) || rec.caption || null;

                  return (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => handleSelectRecord(rec)}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-neutral-50 border-black ring-1 ring-black'
                          : 'bg-white border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-black truncate">
                            {templateName}
                          </span>
                          {rec.categories && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 truncate max-w-[110px]">
                              {Array.isArray(rec.categories)
                                ? rec.categories.join(', ')
                                : String(rec.categories)}
                            </span>
                          )}
                        </div>

                        {productName && (
                          <p className="text-xs font-medium text-neutral-800 truncate">
                            {productName}
                          </p>
                        )}

                        {description && (
                          <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                            {description}
                          </p>
                        )}
                      </div>

                      {/* Selection Indicator */}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition ${
                          isSelected
                            ? 'bg-black border-black text-white'
                            : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* ------------------------------------------------------------
              C. VARIABLE CONFIGURATION (10 EXACT VARIABLES)
             ------------------------------------------------------------ */}
          <section className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-semibold flex items-center justify-center">
                  2
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-black">10 Prompt Variables</h2>
                  <p className="text-[11px] text-neutral-500">
                    {isLoadingSingleRecord
                      ? 'Fetching full record...'
                      : selectedRecord
                      ? `Populated from ${selectedRecord.id}`
                      : 'Select a record or edit variables directly'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetVariables}
                disabled={!selectedRecord}
                className="h-8 px-2.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-[11px] font-medium text-black inline-flex items-center gap-1 transition disabled:opacity-40"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Variables</span>
              </button>
            </div>

            {validationErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-900">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">All 10 variables are required before generation.</p>
                  <p className="text-red-700 mt-0.5">
                    Missing: {validationErrors.join(', ')}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {VARIABLE_KEYS.map((key, idx) => {
                const value = variables[key] ?? '';
                const isMissingInSource = selectedRecord && value.trim() === '';
                const hasValidationError = validationErrors.includes(key);
                const isMultiline = [
                  'headline',
                  'subheadline',
                  'feature_items',
                  'composition',
                  'background',
                  'typographhy',
                  'lighting'
                ].includes(key);

                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`var-${key}`}
                        className="text-xs font-mono font-semibold text-black flex items-center gap-1.5"
                      >
                        <span className="text-neutral-400">{idx + 1}.</span>
                        <span>{key}</span>
                      </label>

                      {isMissingInSource && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Missing in record
                        </span>
                      )}
                    </div>

                    {isMultiline ? (
                      <textarea
                        id={`var-${key}`}
                        rows={key === 'feature_items' ? 4 : 2}
                        value={value}
                        onChange={(e) => handleVariableChange(key, e.target.value)}
                        placeholder={`Enter ${key}...`}
                        className={`w-full px-3 py-2 rounded-xl border text-xs text-black placeholder-neutral-400 focus:outline-none transition font-sans leading-relaxed ${
                          hasValidationError
                            ? 'border-red-400 bg-red-50/40 focus:border-red-600'
                            : 'border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-black'
                        }`}
                      />
                    ) : (
                      <input
                        id={`var-${key}`}
                        type="text"
                        value={value}
                        onChange={(e) => handleVariableChange(key, e.target.value)}
                        placeholder={`Enter ${key}...`}
                        className={`w-full h-9 px-3 rounded-xl border text-xs text-black placeholder-neutral-400 focus:outline-none transition ${
                          hasValidationError
                            ? 'border-red-400 bg-red-50/40 focus:border-red-600'
                            : 'border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-black'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ------------------------------------------------------------
              D. PROMPT PREVIEW
             ------------------------------------------------------------ */}
          <section className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-semibold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-semibold text-black">Master Prompt Preview</h2>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="h-8 px-2.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-[11px] font-medium text-black inline-flex items-center gap-1 transition"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsPromptExpanded((prev) => !prev)}
                  className="h-8 px-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-[11px] font-medium text-black inline-flex items-center gap-1 transition"
                >
                  <span>{isPromptExpanded ? 'Collapse' : 'Expand'}</span>
                  {isPromptExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div
              className={`rounded-xl bg-neutral-50 border border-neutral-200 p-3 font-mono text-[11px] text-neutral-800 whitespace-pre-wrap break-words leading-relaxed overflow-y-auto transition-all ${
                isPromptExpanded ? 'max-h-[420px]' : 'max-h-32'
              }`}
            >
              {finalPrompt}
            </div>
          </section>

          {/* ------------------------------------------------------------
              E. GENERATE IMAGE ACTION
             ------------------------------------------------------------ */}
          <div className="space-y-2.5">
            {generationError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-900">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Image Generation Error</p>
                  <p className="text-red-700 leading-relaxed">{generationError}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerateAndUpload}
              disabled={isGenerating || isUploading || isSavingUrl}
              className="w-full h-12 rounded-2xl bg-black hover:bg-neutral-800 active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating 4:5 Advertisement (1080×1350)...</span>
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to Supabase Storage...</span>
                </>
              ) : isSavingUrl ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving image_url to Record...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Image</span>
                </>
              )}
            </button>
          </div>

          {/* ------------------------------------------------------------
              F. IMAGE RESULT INTERFACE
             ------------------------------------------------------------ */}
          {(activePreviewSrc || isGenerating || isUploading || isSavingUrl || uploadError) && (
            <section className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-semibold flex items-center justify-center">
                    4
                  </span>
                  <h2 className="text-sm font-semibold text-black">Advertisement Result</h2>
                </div>

                {/* Generation & Upload Status Badges */}
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {generatedImageBase64 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-black border border-neutral-200">
                      Generated
                    </span>
                  )}
                  {isUploading && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 inline-flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      Uploading
                    </span>
                  )}
                  {uploadedImageUrl && !isUploading && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Uploaded
                    </span>
                  )}
                  {isSavingUrl && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 inline-flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      Saving URL
                    </span>
                  )}
                  {isImageUrlSaved && !isSavingUrl && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black text-white">
                      image_url Saved
                    </span>
                  )}
                </div>
              </div>

              {/* Metadata Summary */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">
                    Product
                  </span>
                  <span className="font-semibold text-black truncate block mt-0.5">
                    {variables.product || '—'}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">
                    Template Record
                  </span>
                  <span className="font-semibold text-black truncate block mt-0.5">
                    {selectedRecord?.name || selectedRecord?.id || 'Custom'}
                  </span>
                </div>
              </div>

              {/* 4:5 Portrait Preview Container */}
              {activePreviewSrc && (
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img
                    src={activePreviewSrc}
                    alt={variables.product || 'Generated Advertisement'}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setIsFullViewOpen(true)}
                    className="absolute bottom-3 right-3 h-9 px-3 rounded-xl bg-white/95 backdrop-blur-xs border border-neutral-200 text-black text-xs font-medium inline-flex items-center gap-1.5 shadow-xs hover:bg-white transition"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View Full Image</span>
                  </button>
                </div>
              )}

              {/* Upload Error Banner + Retry Upload Button */}
              {uploadError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2.5">
                  <div className="flex items-start gap-2 text-xs text-red-900">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold">Supabase Storage Upload Failed</p>
                      <p className="text-red-700 leading-relaxed">{uploadError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetryUpload}
                    disabled={isUploading}
                    className="h-9 px-3.5 rounded-xl bg-black text-white text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>Retry Upload</span>
                  </button>
                </div>
              )}

              {/* Save image_url Error Banner + Retry Save Button */}
              {saveUrlError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2.5">
                  <div className="flex items-start gap-2 text-xs text-red-900">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold">Failed to Save image_url to Record</p>
                      <p className="text-red-700 leading-relaxed">{saveUrlError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetrySaveUrl}
                    disabled={isSavingUrl}
                    className="h-9 px-3.5 rounded-xl bg-black text-white text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSavingUrl ? 'animate-spin' : ''}`} />
                    <span>Retry Save image_url</span>
                  </button>
                </div>
              )}

              {/* Returned Public Image URL Display & Copy Action */}
              {uploadedImageUrl && (
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-700">
                      Public Storage URL (bucket: images)
                    </span>
                    <a
                      href={uploadedImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium text-black inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-neutral-200 font-mono text-[11px] text-neutral-700 break-all">
                    {uploadedImageUrl}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyImageUrl}
                    className="w-full h-9 rounded-xl bg-black text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-neutral-800 transition"
                  >
                    {copiedImageUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Image URL Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Image URL</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Result Action Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGenerateAndUpload}
                  disabled={isGenerating || isUploading}
                  className="h-10 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-black text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Generate Again</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={!generatedImageBase64}
                  className="h-10 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-black text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="h-10 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-black text-xs font-medium inline-flex items-center justify-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </button>

                {generatedImageBase64 && !uploadedImageUrl && !isUploading && (
                  <button
                    type="button"
                    onClick={handleRetryUpload}
                    className="h-10 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-black text-xs font-medium inline-flex items-center justify-center gap-1.5 transition"
                  >
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>Retry Upload</span>
                  </button>
                )}
              </div>
            </section>
          )}
        </main>

        {/* Fullscreen Image Preview Modal */}
        {isFullViewOpen && activePreviewSrc && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4">
            <div className="flex items-center justify-between text-white">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {variables.product || 'Advertisement Preview'}
                </p>
                <p className="text-xs text-neutral-400">1080 × 1350 px (4:5)</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFullViewOpen(false)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
                aria-label="Close full preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
              <img
                src={activePreviewSrc}
                alt={variables.product || 'Full Advertisement'}
                className="max-h-full max-w-full rounded-xl object-contain"
              />
            </div>

            <div className="flex gap-2">
              {uploadedImageUrl && (
                <button
                  type="button"
                  onClick={handleCopyImageUrl}
                  className="flex-1 h-11 rounded-xl bg-white text-black text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Image URL</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleDownloadImage}
                className="flex-1 h-11 rounded-xl bg-neutral-800 text-white border border-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
