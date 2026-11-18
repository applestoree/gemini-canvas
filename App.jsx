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
  History,
  ArrowLeft,
  CalendarDays,
  LayoutGrid,
  Settings,
} from 'lucide-react';

// Exact Edge Function Endpoints
const CRUD_MAKE_PROMPT_URL = 'https://jhpbtooefyzdndstlzva.supabase.co/functions/v1/crud-make-prompt';
const CRUD_MAKE_WEBHOOK_URL = 'https://jhpbtooefyzdndstlzva.supabase.co/functions/v1/crud-make-webhook';
const CALENDAR_SLOTS = ['09:00', '13:00', '19:00'];
const UPLOAD_IMAGE_URL = `${CRUD_MAKE_PROMPT_URL}/upload`;
const DEFAULT_LOGO_URL = 'https://jhpbtooefyzdndstlzva.supabase.co/storage/v1/object/public/apple/logo.png';

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

function serializeFieldForEditor(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

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

function buildMasterPrompt(vars, logoInstruction = '') {
  return `Create a premium Instagram Feed advertising design for @appletheexchangetrx.
Design a visually striking Apple product advertisement inspired by the clean, minimalist, premium aesthetic of Apple's official product campaigns, adapted for @appletheexchangetrx's Instagram branding.
${logoInstruction}
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
Follow all variables precisely. Do not invent additional headlines, product specifications, or promotional text. Render all supplied text accurately.`;
}

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

function getRecordHeadlinePreview(record) {
  if (!record?.headline) return '';
  if (typeof record.headline === 'string') return record.headline;
  if (typeof record.headline === 'object' && record.headline.text) {
    return String(record.headline.text);
  }
  return '';
}

export default function App() {
  const [anonKey, setAnonKey] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [calendarRecords, setCalendarRecords] = useState([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  // Logo upload state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(DEFAULT_LOGO_URL);

  // Records state
  const [records, setRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState(null);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Internal variables state (hidden from UI)
  const [variables, setVariables] = useState({ ...EMPTY_VARIABLES });

  // Generation & upload state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generatedImageBase64, setGeneratedImageBase64] = useState(null);
  const [generatedImageMimeType, setGeneratedImageMimeType] = useState('image/png');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [copiedImageUrl, setCopiedImageUrl] = useState(false);

  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [saveUrlError, setSaveUrlError] = useState(null);
  const [isImageUrlSaved, setIsImageUrlSaved] = useState(false);

  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

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

      setRecords(data.filter((record) => record?.is_ready === false));
    } catch (err) {
      setRecordsError(err.message || 'Failed to connect to crud-make-prompt Edge Function.');
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const response = await fetch(CRUD_MAKE_PROMPT_URL, {
        method: 'GET',
        headers: getEdgeHeaders(false)
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to load schedule (HTTP ${response.status}).`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of prompt records.');
      }
      setHistoryRecords(data.filter((record) => record?.is_ready === true));
    } catch (err) {
      setHistoryError(err.message || 'Failed to load schedule.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleOpenHistory = async () => {
    setShowHistory(true);
    setShowCalendar(false);
    setShowSettings(false);
    await loadHistory();
  };

  const loadCalendar = async () => {
    setIsLoadingCalendar(true);
    setCalendarError(null);
    try {
      const response = await fetch(`${CRUD_MAKE_WEBHOOK_URL}/get`, {
        method: 'GET',
        headers: getEdgeHeaders(false)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error || `Failed to load calendar (HTTP ${response.status}).`);
      }
      if (!Array.isArray(payload?.data)) {
        throw new Error('Invalid calendar response: expected data array.');
      }
      setCalendarRecords(payload.data);
    } catch (err) {
      setCalendarError(err.message || 'Failed to load calendar.');
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const handleOpenCalendar = async () => {
    setShowHistory(false);
    setShowCalendar(true);
    setShowSettings(false);
    await loadCalendar();
  };

  const handleOpenTemplates = () => {
    setShowHistory(false);
    setShowCalendar(false);
    setShowSettings(false);
    setSelectedHistoryId(null);
    setSelectedRecordId(null);
    setSelectedRecord(null);
  };

  const handleOpenSettings = () => {
    setShowHistory(false);
    setShowCalendar(false);
    setShowSettings(true);
  };

  // Handle Logo File Selection
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
      showToast('success', 'Brand logo attached successfully.');
    }
  };

  // Convert file to base64 for Gemini ingestion if needed
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Automatically trigger generation when a record is selected
  // Return to template selection only after confirming the record is_ready in the database.
  const handleBackToTemplates = async () => {
    if (!selectedRecordId || isGenerating || isUploading || isSavingUrl) return;

    try {
      const response = await fetch(
        `${CRUD_MAKE_PROMPT_URL}?id=${encodeURIComponent(selectedRecordId)}`,
        {
          method: 'GET',
          headers: getEdgeHeaders(false)
        }
      );

      if (!response.ok) {
        throw new Error(`Unable to verify template readiness (HTTP ${response.status}).`);
      }

      const payload = await response.json();
      const record = Array.isArray(payload) ? payload[0] : payload;

      if (!record || record.is_ready !== true) {
        showToast('error', 'Template is not marked as ready yet. Please wait and try again.');
        return;
      }

      setSelectedRecordId(null);
      setSelectedRecord(null);
      setGeneratedImageBase64(null);
      setUploadedImageUrl(null);
      setIsImageUrlSaved(false);
      setGenerationError(null);
      setUploadError(null);
      setSaveUrlError(null);
      setIsFullViewOpen(false);
      await loadRecords();
    } catch (err) {
      showToast('error', err.message || 'Failed to verify template readiness.');
    }
  };

  const handleSelectRecord = async (recordItem) => {
    setSelectedRecordId(recordItem.id);
    setGenerationError(null);
    setUploadError(null);
    setSaveUrlError(null);
    setGeneratedImageBase64(null);
    setUploadedImageUrl(null);
    setIsImageUrlSaved(false);

    let authoritativeRecord = recordItem;
    try {
      const response = await fetch(
        `${CRUD_MAKE_PROMPT_URL}?id=${encodeURIComponent(recordItem.id)}`,
        {
          method: 'GET',
          headers: getEdgeHeaders(false)
        }
      );

      if (response.ok) {
        const fetchedSingle = await response.json();
        if (fetchedSingle && typeof fetchedSingle === 'object' && !Array.isArray(fetchedSingle)) {
          authoritativeRecord = fetchedSingle;
        }
      }
    } catch {
      // Fallback to recordItem
    }

    setSelectedRecord(authoritativeRecord);
    const extracted = extractVariablesFromRecord(authoritativeRecord);
    setVariables(extracted);

    // Automatically generate image with extracted variables
    await executeGeneration(extracted, recordItem.id);
  };

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
          body: JSON.stringify({ image_url: imageUrl, is_ready: true })
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
        prev && prev.id === recordId ? { ...prev, ...payload, image_url: imageUrl, is_ready: true } : prev
      );
      setRecords((prev) =>
        prev.map((item) =>
          item.id === recordId ? { ...item, ...payload, image_url: imageUrl, is_ready: true } : item
        )
      );
      showToast('success', 'image_url saved to prompt record.');
    } catch (err) {
      setSaveUrlError(err.message || 'Failed to save image_url to database.');
    } finally {
      setIsSavingUrl(false);
    }
  };

  const uploadGeneratedImageToEdge = async (base64Data, mimeType, recordId) => {
    setIsUploading(true);
    setUploadError(null);
    setSaveUrlError(null);
    setIsImageUrlSaved(false);

    try {
      const imageFile = base64ToImageFile(base64Data, mimeType);
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        throw new Error('crud-make-prompt only accepts JPEG, PNG, or WEBP images.');
      }
      if (imageFile.size > 10 * 1024 * 1024) {
        throw new Error('Image size must not exceed 10 MB.');
      }
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

      if (recordId) {
        await saveImageUrlToPromptRecord(recordId, returnedUrl);
      } else {
        showToast('success', 'Image uploaded to Supabase Storage.');
      }
    } catch (err) {
      setUploadError(err.message || 'Network interruption or failure during image upload.');
      showToast('error', 'Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const executeGeneration = async (currentVars, recordId = selectedRecord?.id) => {
    setIsGenerating(true);
    setGenerationError(null);
    setUploadError(null);
    setUploadedImageUrl(null);

    try {
      let logoInstruction = '';
      let logoBase64Data = null;
      let logoMimeType = 'image/png';
      try {
        let logoSourceFile = logoFile;
        if (!logoSourceFile) {
          const logoResponse = await fetch(DEFAULT_LOGO_URL);
          if (!logoResponse.ok) {
            throw new Error(`Unable to load default brand logo (HTTP ${logoResponse.status}).`);
          }
          const logoBlob = await logoResponse.blob();
          logoSourceFile = new File([logoBlob], 'apple-store-malaysia-logo.png', {
            type: logoBlob.type || 'image/png'
          });
        }
        logoBase64Data = await fileToBase64(logoSourceFile);
        logoMimeType = logoSourceFile.type || 'image/png';
        logoInstruction = `brand_logo_placement: Use the provided original brand logo exactly as supplied. Preserve its original shape, proportions, colors, and details without redesigning, recreating, distorting, or altering it. Position it cleanly at the top-left corner of the advertisement canvas.`;
      } catch (logoError) {
        throw new Error(`Brand logo could not be loaded: ${logoError.message}`);
      }

      const promptToSend = buildMasterPrompt(currentVars, logoInstruction);
      const apiKey = '';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;

      const userParts = [{ text: promptToSend }];
      if (logoBase64Data) {
        userParts.push({
          inlineData: {
            mimeType: logoMimeType,
            data: logoBase64Data
          }
        });
      }

      const requestPayload = {
        contents: [
          {
            role: 'user',
            parts: userParts
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
          'Gemini returned an invalid or empty image output. Please try selecting the template again.'
        );
      }

      const b64 = inlinePart.inlineData.data;
      const mime = inlinePart.inlineData.mimeType || 'image/png';

      setGeneratedImageBase64(b64);
      setGeneratedImageMimeType(mime);
      setIsGenerating(false);

      await uploadGeneratedImageToEdge(b64, mime, recordId);
    } catch (err) {
      setIsGenerating(false);
      setGenerationError(err.message || 'Image generation failed.');
      showToast('error', 'Image generation failed.');
    }
  };

  const handleRetryGeneration = () => {
    if (selectedRecord) {
      executeGeneration(variables, selectedRecord.id);
    }
  };

  const handleRetryUpload = () => {
    if (!generatedImageBase64 || isUploading) return;
    uploadGeneratedImageToEdge(generatedImageBase64, generatedImageMimeType, selectedRecord?.id);
  };

  const handleRetrySaveUrl = () => {
    if (!selectedRecord?.id || !uploadedImageUrl || isSavingUrl) return;
    saveImageUrlToPromptRecord(selectedRecord.id, uploadedImageUrl);
  };

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

  const activePreviewSrc =
    uploadedImageUrl ||
    (generatedImageBase64 ? `data:${generatedImageMimeType};base64,${generatedImageBase64}` : null);

  return (
    <div className="h-[100vh] w-full bg-[#F5F5F7] flex justify-center overflow-hidden">
      <div className="w-full max-w-[500px] h-[100vh] bg-white flex flex-col border-x border-neutral-200 overflow-hidden relative">
        {/* Toast Notification Banner */}
        {toast && (
          <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex justify-center">
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
            B. MAIN CONTENT AREA (SIMPLIFIED & STREAMLINED)
           ============================================================ */}
        <main className={`flex-1 min-h-0 overflow-x-hidden bg-[#F5F5F7] p-4 flex flex-col ${showHistory || showCalendar || selectedRecordId ? "overflow-y-auto" : "overflow-hidden"}`}>
          {showHistory ? (
            <section className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-neutral-200 p-3 shadow-2xs">
              <div className="shrink-0 flex items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-black">Jadwal</h2>
                  <p className="text-[11px] text-neutral-500">
                    {historyRecords.length} completed products
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowHistory(false);
                    setSelectedHistoryId(null);
                  }}
                  className="h-8 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700 inline-flex items-center gap-1.5 shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pt-3">
                {isLoadingHistory && (
                  <div className="py-8 flex items-center justify-center gap-2 text-xs text-neutral-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading schedule...
                  </div>
                )}
                {!isLoadingHistory && historyError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
                    <p>{historyError}</p>
                    <button
                      type="button"
                      onClick={loadHistory}
                      className="h-8 px-3 rounded-lg bg-black text-white"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {!isLoadingHistory && !historyError && historyRecords.length === 0 && (
                  <div className="py-8 text-center text-xs text-neutral-500">
                    No completed products found.
                  </div>
                )}
                {!isLoadingHistory && !historyError && historyRecords.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {historyRecords.map((record) => {
                      const isCaptionVisible = selectedHistoryId === record.id;
                      const productName = serializeFieldForEditor(record.product) || 'Untitled Product';
                      const captionText = serializeFieldForEditor(record.caption) || 'No caption';
                      return (
                        <article key={record.id} className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setSelectedHistoryId(isCaptionVisible ? null : record.id)}
                            aria-expanded={isCaptionVisible}
                            aria-label={`${productName}. ${isCaptionVisible ? 'Hide' : 'Show'} caption`}
                            className="relative block w-full aspect-[4/5] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 text-left"
                          >
                            {record.image_url ? (
                              <img
                                src={record.image_url}
                                alt={productName}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] text-neutral-400">
                                No image available
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2.5 pt-8 pb-2.5">
                              <p className="text-[11px] leading-tight font-semibold text-white line-clamp-2">
                                {productName}
                              </p>
                            </div>
                            {isCaptionVisible && (
                              <div className="absolute inset-0 flex flex-col justify-end bg-black/85 p-2.5">
                                <p className="text-[9px] font-semibold uppercase tracking-wide text-white/70 mb-1">
                                  Caption
                                </p>
                                <p className="max-h-[72%] overflow-y-auto whitespace-pre-wrap break-words text-[10px] leading-relaxed text-white">
                                  {captionText}
                                </p>
                                <p className="mt-2 text-[9px] text-white/60">Tap to close</p>
                              </div>
                            )}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          ) : showCalendar ? (
            <section className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-neutral-200 p-3 shadow-2xs">
              <div className="shrink-0 flex items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                <div>
                  <h2 className="text-sm font-semibold text-black">Content Calendar</h2>
                  <p className="text-[11px] text-neutral-500">3 daily slots · Kuala Lumpur time</p>
                </div>
                <button
                  type="button"
                  onClick={loadCalendar}
                  disabled={isLoadingCalendar}
                  className="h-8 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700 inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pt-3 space-y-4">
                {isLoadingCalendar && (
                  <div className="py-8 flex items-center justify-center gap-2 text-xs text-neutral-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading calendar...
                  </div>
                )}
                {!isLoadingCalendar && calendarError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
                    <p>{calendarError}</p>
                    <button
                      type="button"
                      onClick={loadCalendar}
                      className="h-8 px-3 rounded-lg bg-black text-white"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {!isLoadingCalendar && !calendarError && calendarRecords.length === 0 && (
                  <div className="py-8 text-center text-xs text-neutral-500">
                    No calendar records found.
                  </div>
                )}
                {!isLoadingCalendar && !calendarError && [...new Set(calendarRecords.map((record) => record.date).filter(Boolean))].sort().map((date) => {
                  const dayLabel = new Date(`${date}T00:00:00+08:00`).toLocaleDateString('en-MY', {
                    timeZone: 'Asia/Kuala_Lumpur',
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  });
                  return (
                    <section key={date} className="space-y-2">
                      <h3 className="text-xs font-semibold text-neutral-800 sticky top-0 bg-white py-1">{dayLabel}</h3>
                      <div className="space-y-2">
                        {CALENDAR_SLOTS.map((slot) => {
                          const record = calendarRecords.find((item) => item.date === date && String(item.time || '').slice(0, 5) === slot);
                          return (
                            <article key={slot} className={`flex gap-3 rounded-xl border p-2.5 ${record ? 'border-neutral-200 bg-white' : 'border-dashed border-neutral-200 bg-neutral-50'}`}>
                              <div className="w-14 shrink-0 flex flex-col items-center justify-center rounded-lg bg-neutral-100 py-2">
                                <span className="text-[10px] font-semibold text-neutral-700">{slot}</span>
                                <span className="text-[9px] text-neutral-400">MYT</span>
                              </div>
                              {record ? (
                                <>
                                  {record.image_url ? (
                                    <img
                                      src={record.image_url}
                                      alt={`Calendar post ${slot}`}
                                      className="w-16 h-20 shrink-0 rounded-lg object-cover bg-neutral-100"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-16 h-20 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center text-[9px] text-neutral-400 text-center px-1">
                                      No image
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1 py-0.5">
                                    <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Scheduled content</p>
                                    <p className="mt-1 text-[11px] leading-relaxed text-neutral-700 whitespace-pre-wrap break-words line-clamp-4">
                                      {record.caption || 'No caption'}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <div className="flex-1 flex items-center">
                                  <p className="text-[11px] text-neutral-400">Empty slot</p>
                                </div>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </section>
          ) : showSettings ? (
            <section className="flex-1 min-h-0 overflow-y-auto bg-white rounded-2xl border border-neutral-200 p-4 space-y-4 shadow-2xs">
              <div>
                <h2 className="text-sm font-semibold text-black">Settings</h2>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Manage your brand assets and application preferences
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CloudUpload className="w-4 h-4 text-neutral-600" />
                  <div>
                    <h3 className="text-xs font-semibold text-black">Brand Logo</h3>
                    <p className="text-[10px] text-neutral-500">Logo used when generating product advertisements</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden flex items-center justify-center">
                    {logoPreviewUrl ? (
                      <img src={logoPreviewUrl} alt="Brand logo preview" className="w-full h-full object-contain" />
                    ) : (
                      <CloudUpload className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-[11px] text-neutral-600 truncate">
                      {logoFile ? logoFile.name : 'Default brand logo'}
                    </p>
                    <label
                      htmlFor="logo-upload-input"
                      className="inline-flex h-9 px-3 items-center justify-center gap-1.5 rounded-lg bg-black text-white text-[11px] font-medium cursor-pointer hover:bg-neutral-800"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                      Upload Logo
                    </label>
                    <input
                      id="logo-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <p className="text-[10px] leading-relaxed text-neutral-400">
                  The selected logo is used for image generation in this app session.
                </p>
              </div>
            </section>
          ) : (
            <>
          {/* Template Selection Cards: fill available height and hide after selection */}
          {!selectedRecordId && (
          <section className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-neutral-200 p-4 space-y-3 shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-black">Select Product Template</h2>
                <p className="text-[11px] text-neutral-500">
                  Tap any template below to instantly generate its ad
                </p>
                <p className="mt-1 text-[10px] text-neutral-400">
                  {records.length} available
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={loadRecords}
                  disabled={isLoadingRecords}
                  className="w-9 h-9 rounded-xl border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 disabled:opacity-50"
                  aria-label="Refresh templates"
                  title="Refresh templates"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingRecords ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {isLoadingRecords && (
              <div className="space-y-2">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 animate-pulse space-y-2"
                  >
                    <div className="h-3.5 w-1/2 bg-neutral-200 rounded" />
                    <div className="h-3 w-3/4 bg-neutral-200 rounded" />
                  </div>
                ))}
              </div>
            )}

            {!isLoadingRecords && recordsError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2">
                <div className="flex items-start gap-2 text-xs text-red-900">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p>{recordsError}</p>
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

            {!isLoadingRecords && !recordsError && records.length === 0 && (
              <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50 text-center space-y-1">
                <p className="text-xs font-semibold text-black">No Templates Found</p>
                <p className="text-[11px] text-neutral-500">
                  The Supabase API returned 0 templates.
                </p>
              </div>
            )}

            {!isLoadingRecords && !recordsError && records.length > 0 && (
              <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-0.5">
                {records.map((rec) => {
                  const isSelected = selectedRecordId === rec.id;
                  const productName = rec.product || rec.name || rec.id;
                  const subtext =
                    rec.subheadline || getRecordHeadlinePreview(rec) || rec.categories || '';

                  return (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => handleSelectRecord(rec)}
                      disabled={isGenerating || isUploading}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-neutral-900 border-neutral-900 text-white'
                          : 'bg-white border-neutral-200 hover:border-neutral-400 text-black'
                      } disabled:opacity-60`}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-black'}`}>
                          {productName}
                        </p>
                        {subtext && (
                          <p className={`text-[11px] truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                            {typeof subtext === 'string' ? subtext : JSON.stringify(subtext)}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {isSelected && (isGenerating || isUploading) ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Sparkles className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
          )}

          {/* Generation Status & Result Viewer */}
          {(activePreviewSrc || isGenerating || isUploading || isSavingUrl || generationError || uploadError || saveUrlError) && (
            <section className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-black">Generated Result</h2>
                  <p className="text-[11px] text-neutral-500">
                    {selectedRecord?.product || 'Instagram Ad (4:5)'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {isImageUrlSaved && selectedRecord?.is_ready === true && !isSavingUrl && (
                    <button
                      type="button"
                      onClick={handleBackToTemplates}
                      className="h-8 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-black inline-flex items-center gap-1.5 hover:bg-neutral-50 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  )}
                  {isGenerating && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-800 inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating
                    </span>
                  )}
                  {isUploading && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-800 inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Uploading
                    </span>
                  )}
                  {isSavingUrl && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-700 inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Saving URL
                    </span>
                  )}
                  {isImageUrlSaved && !isSavingUrl && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Saved to make_prompt
                    </span>
                  )}
                  {uploadedImageUrl && !isSavingUrl && !isImageUrlSaved && !saveUrlError && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                      Uploaded
                    </span>
                  )}
                </div>
              </div>

              {generationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-2">
                  <p className="font-semibold">Generation Failed</p>
                  <p className="text-red-700">{generationError}</p>
                  <button
                    type="button"
                    onClick={handleRetryGeneration}
                    className="h-8 px-3 rounded-lg bg-black text-white text-xs font-medium"
                  >
                    Retry Generation
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-2">
                  <p className="font-semibold">Image Upload Failed</p>
                  <p className="text-red-700">{uploadError}</p>
                  <button
                    type="button"
                    onClick={handleRetryUpload}
                    disabled={!generatedImageBase64 || isUploading}
                    className="h-8 px-3 rounded-lg bg-black text-white text-xs font-medium disabled:opacity-50"
                  >
                    Retry Upload
                  </button>
                </div>
              )}

              {saveUrlError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-2">
                  <p className="font-semibold">Database URL Save Failed</p>
                  <p className="text-red-700">{saveUrlError}</p>
                  <button
                    type="button"
                    onClick={handleRetrySaveUrl}
                    disabled={!selectedRecord?.id || !uploadedImageUrl || isSavingUrl}
                    className="h-8 px-3 rounded-lg bg-black text-white text-xs font-medium disabled:opacity-50"
                  >
                    Retry Save URL
                  </button>
                </div>
              )}

              {/* 4:5 Preview Card */}
              {activePreviewSrc && (
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img
                    src={activePreviewSrc}
                    alt="Advertisement Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setIsFullViewOpen(true)}
                    className="absolute bottom-3 right-3 h-9 px-3 rounded-xl bg-white/95 backdrop-blur-xs border border-neutral-200 text-black text-xs font-medium inline-flex items-center gap-1.5 shadow-xs hover:bg-white transition"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View Full</span>
                  </button>
                </div>
              )}

              {/* Public URL Box */}
              {uploadedImageUrl && (
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-700">Public URL</span>
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
                        <span>URL Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Public Image URL</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRetryGeneration}
                  disabled={isGenerating || !selectedRecord}
                  className="h-10 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-black text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={!generatedImageBase64}
                  className="h-10 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-black text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </section>
          )}
            </>
          )}
        </main>

        <nav className="shrink-0 h-16 border-t border-neutral-200 bg-white px-2 flex items-center justify-around z-20" aria-label="Main navigation">
          <button
            type="button"
            onClick={handleOpenTemplates}
            aria-current={!showHistory && !showCalendar && !showSettings ? 'page' : undefined}
            className={`min-w-0 flex-1 h-full flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition ${!showHistory && !showCalendar && !showSettings ? 'text-black' : 'text-neutral-400 hover:text-neutral-700'}`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span>Template</span>
          </button>
          <button
            type="button"
            onClick={handleOpenHistory}
            disabled={isLoadingHistory}
            aria-current={showHistory ? 'page' : undefined}
            className={`min-w-0 flex-1 h-full flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition disabled:opacity-50 ${showHistory ? 'text-black' : 'text-neutral-400 hover:text-neutral-700'}`}
          >
            <History className="w-5 h-5" />
            <span>Jadwal</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCalendar}
            disabled={isLoadingCalendar}
            aria-current={showCalendar ? 'page' : undefined}
            className={`min-w-0 flex-1 h-full flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition disabled:opacity-50 ${showCalendar ? 'text-black' : 'text-neutral-400 hover:text-neutral-700'}`}
          >
            <CalendarDays className="w-5 h-5" />
            <span>Calendar</span>
          </button>
          <button
            type="button"
            onClick={handleOpenSettings}
            aria-current={showSettings ? 'page' : undefined}
            className={`min-w-0 flex-1 h-full flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition ${showSettings ? 'text-black' : 'text-neutral-400 hover:text-neutral-700'}`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Fullscreen Image Preview Modal */}
        {isFullViewOpen && activePreviewSrc && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4">
            <div className="flex items-center justify-between text-white">
              <p className="text-sm font-semibold truncate">
                {selectedRecord?.product || 'Advertisement Preview'}
              </p>
              <button
                type="button"
                onClick={() => setIsFullViewOpen(false)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
              <img
                src={activePreviewSrc}
                alt="Full Advertisement"
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
                  <span>Copy URL</span>
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
