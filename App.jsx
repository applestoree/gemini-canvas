import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  LayoutTemplate,
  FolderOpen,
  Briefcase,
  Calendar as CalendarIcon,
  Settings,
  HelpCircle,
  User,
  Plus,
  Search,
  Filter,
  Download,
  Undo2,
  Redo2,
  Eye,
  Save,
  Trash2,
  Copy,
  Layers,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Upload,
  Wand2,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Cpu,
  MessageSquare,
  Sliders,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  Grid,
  List as ListIcon,
  MoreHorizontal,
  Edit3,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Menu,
  Share2,
  Bookmark
} from 'lucide-react';

// ============================================================================
// CONSTANTS & MOCK DATA
// ============================================================================

const INSTAGRAM_FORMATS = [
  { id: 'portrait', name: 'Feed Portrait', width: 1080, height: 1350, ratio: '4:5', desc: 'Optimal vertical feed presence' },
  { id: 'square', name: 'Feed Square', width: 1080, height: 1080, ratio: '1:1', desc: 'Classic balanced grid format' },
  { id: 'story', name: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16', desc: 'Full-screen immersive vertical' },
  { id: 'carousel', name: 'Carousel Slide', width: 1080, height: 1350, ratio: '4:5', desc: 'Multi-slide storytelling format' },
];

const CONTENT_CATEGORIES = [
  { id: 'Product Highlight', title: 'Product Highlight', desc: 'Showcase flagship hardware details & finish' },
  { id: 'Product Launch', title: 'Product Launch', desc: 'High-impact announcement for new arrivals' },
  { id: 'Product Education', title: 'Product Education', desc: 'Tips, workflows, and hidden pro features' },
  { id: 'Promotional Campaign', title: 'Promotional Campaign', desc: 'Seasonal offers, trade-in, and financing' },
  { id: 'Store Experience', title: 'Store Experience', desc: 'Today at Apple sessions & TRX architecture' },
  { id: 'Event Announcement', title: 'Event Announcement', desc: 'Workshops, creator talks, and live sessions' },
  { id: 'Lifestyle Content', title: 'Lifestyle Content', desc: 'Everyday creativity in Kuala Lumpur' },
  { id: 'Product Comparison', title: 'Product Comparison', desc: 'Side-by-side specs to help buyers decide' },
];

const PRODUCT_CATEGORIES = [
  { id: 'iPhone', name: 'iPhone', icon: Smartphone, tagline: 'Titanium. So strong. So light.' },
  { id: 'Mac', name: 'Mac', icon: Laptop, tagline: 'Supercharged by Apple silicon.' },
  { id: 'iPad', name: 'iPad', icon: Tablet, tagline: 'Your next computer is not a computer.' },
  { id: 'Apple Watch', name: 'Apple Watch', icon: Watch, tagline: 'Smarter. Brighter. Mightier.' },
  { id: 'AirPods', name: 'AirPods', icon: Headphones, tagline: 'Adaptive Audio. Now playing.' },
  { id: 'Apple Accessories', name: 'Accessories', icon: Cpu, tagline: 'Designed to complement every device.' },
];

const DESIGN_STYLES = [
  { id: 'Minimalist', name: 'Minimalist', desc: 'Pure whitespace, crisp typography, subtle shadows', bg: '#FFFFFF', text: '#1D1D1F', accent: '#0071E3' },
  { id: 'Premium Editorial', name: 'Premium Editorial', desc: 'Warm stone tones, refined serif/sans contrast', bg: '#F5F5F7', text: '#1D1D1F', accent: '#1D1D1F' },
  { id: 'Product Focus', name: 'Product Focus', desc: 'Studio dark backdrop highlighting hardware contours', bg: '#111113', text: '#F5F5F7', accent: '#2997FF' },
  { id: 'Lifestyle', name: 'Lifestyle', desc: 'Warm natural daylight aesthetic for everyday moments', bg: '#FAF8F5', text: '#2C2C2E', accent: '#BF5AF2' },
  { id: 'Bold Typography', name: 'Bold Typography', desc: 'Oversized display headlines with high visual impact', bg: '#0071E3', text: '#FFFFFF', accent: '#FFFFFF' },
  { id: 'Seasonal Campaign', name: 'Seasonal Campaign', desc: 'Festive warm gold & crimson accents for TRX celebrations', bg: '#FBF7F0', text: '#1D1D1F', accent: '#C9933B' },
];

// Clean SVG Data URIs for crisp vector product & architectural illustrations (zero external broken links)
const SVG_ASSETS = {
  iphone_pro: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" fill="none"><defs><linearGradient id="ti" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E4E4E6"/><stop offset="50%" stop-color="#B8B8BE"/><stop offset="100%" stop-color="#8A8A93"/></linearGradient><linearGradient id="scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1C2536"/><stop offset="50%" stop-color="#0A0D14"/><stop offset="100%" stop-color="#1F2937"/></linearGradient></defs><rect x="95" y="30" width="210" height="440" rx="38" fill="url(#ti)" stroke="#75757C" stroke-width="3"/><rect x="104" y="39" width="192" height="422" rx="31" fill="url(#scr)"/><rect x="165" y="52" width="70" height="18" rx="9" fill="#000000"/><circle cx="200" cy="240" r="65" stroke="#0071E3" stroke-width="2" stroke-opacity="0.5"/><circle cx="200" cy="240" r="40" fill="#0071E3" fill-opacity="0.15"/></svg>`)}`,
  macbook_air: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" fill="none"><defs><linearGradient id="alu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F2F2F5"/><stop offset="100%" stop-color="#C7C7CC"/></linearGradient><linearGradient id="mscr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0F172A"/><stop offset="100%" stop-color="#1E293B"/></linearGradient></defs><rect x="75" y="45" width="350" height="225" rx="16" fill="#1D1D1F" stroke="#8E8E93" stroke-width="2"/><rect x="85" y="55" width="330" height="202" rx="8" fill="url(#mscr)"/><path d="M120 210 Q250 110 380 210" stroke="#38BDF8" stroke-width="3" fill="none" opacity="0.7"/><path d="M35 270 H465 L450 286 C446 290 440 292 432 292 H68 C60 292 54 290 50 286 Z" fill="url(#alu)"/><rect x="210" y="270" width="80" height="6" rx="3" fill="#AEAEB2"/></svg>`)}`,
  ipad_pro: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 500" fill="none"><rect x="65" y="35" width="290" height="430" rx="24" fill="#2C2C2E" stroke="#8E8E93" stroke-width="3"/><rect x="79" y="49" width="262" height="402" rx="14" fill="#090D16"/><circle cx="210" cy="250" r="85" fill="#0071E3" fill-opacity="0.2"/><path d="M140 310 C180 200, 240 200, 280 310" stroke="#60A5FA" stroke-width="4" stroke-linecap="round"/></svg>`)}`,
  apple_watch: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" fill="none"><path d="M135 40 H225 L235 130 H125 Z" fill="#D1D1D6"/><path d="M125 350 H235 L225 440 H135 Z" fill="#D1D1D6"/><rect x="105" y="125" width="150" height="230" rx="42" fill="#E5E5EA" stroke="#8E8E93" stroke-width="3"/><rect x="116" y="136" width="128" height="208" rx="34" fill="#000000"/><circle cx="180" cy="240" r="46" stroke="#34C759" stroke-width="8" stroke-dasharray="220 60"/><circle cx="180" cy="240" r="34" stroke="#0071E3" stroke-width="8" stroke-dasharray="160 60"/></svg>`)}`,
  airpods_max: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420" fill="none"><path d="M110 220 C110 100, 310 100, 310 220" stroke="#D1D1D6" stroke-width="18" stroke-linecap="round"/><rect x="82" y="195" width="56" height="115" rx="26" fill="#E5E5EA" stroke="#AEAEB2" stroke-width="2"/><rect x="282" y="195" width="56" height="115" rx="26" fill="#E5E5EA" stroke="#AEAEB2" stroke-width="2"/><rect x="132" y="205" width="14" height="95" rx="7" fill="#C7C7CC"/><rect x="274" y="205" width="14" height="95" rx="7" fill="#C7C7CC"/></svg>`)}`,
  trx_pavilion: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 360" fill="none"><rect width="500" height="360" fill="#F5F5F7"/><path d="M90 240 L250 110 L410 240 Z" fill="#E5E5EA" stroke="#86868B" stroke-width="2"/><path d="M125 240 L250 138 L375 240 Z" fill="#FFFFFF" stroke="#D1D1D6" stroke-width="1.5"/><rect x="130" y="240" width="240" height="65" fill="#E0F2FE" fill-opacity="0.6" stroke="#86868B" stroke-width="1.5"/><line x1="60" y1="305" x2="440" y2="305" stroke="#1D1D1F" stroke-width="2"/></svg>`)}`,
};

const INITIAL_ASSETS = [
  { id: 'asset-1', name: 'iPhone Pro Titanium Studio', category: 'iPhone', url: SVG_ASSETS.iphone_pro, date: '2026-11-10', type: 'Vector Studio' },
  { id: 'asset-2', name: 'MacBook Air Midnight Angle', category: 'Mac', url: SVG_ASSETS.macbook_air, date: '2026-11-11', type: 'Vector Studio' },
  { id: 'asset-3', name: 'iPad Pro Ultra Retina', category: 'iPad', url: SVG_ASSETS.ipad_pro, date: '2026-11-12', type: 'Vector Studio' },
  { id: 'asset-4', name: 'Apple Watch Activity Rings', category: 'Apple Watch', url: SVG_ASSETS.apple_watch, date: '2026-11-13', type: 'Vector Studio' },
  { id: 'asset-5', name: 'AirPods Max Silver Finish', category: 'AirPods', url: SVG_ASSETS.airpods_max, date: '2026-11-14', type: 'Vector Studio' },
  { id: 'asset-6', name: 'The Exchange TRX Roof Concept', category: 'Store Photography', url: SVG_ASSETS.trx_pavilion, date: '2026-11-15', type: 'Architectural' },
];

const INITIAL_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Titanium Flagship Launch',
    category: 'Product Launch',
    format: 'portrait',
    bgColor: '#F5F5F7',
    elements: [
      { id: 'el-1', type: 'text', text: 'NEW ARRIVAL', x: 80, y: 90, width: 920, height: 40, fontSize: 28, fontWeight: '600', color: '#0071E3', align: 'center', opacity: 1, letterSpacing: 4 },
      { id: 'el-2', type: 'text', text: 'iPhone Pro.', x: 80, y: 145, width: 920, height: 110, fontSize: 96, fontWeight: '700', color: '#1D1D1F', align: 'center', opacity: 1, letterSpacing: -2 },
      { id: 'el-3', type: 'text', text: 'Forged in aerospace-grade titanium. Experience it first at The Exchange TRX.', x: 140, y: 270, width: 800, height: 90, fontSize: 34, fontWeight: '400', color: '#86868B', align: 'center', opacity: 1, letterSpacing: 0 },
      { id: 'el-4', type: 'image', src: SVG_ASSETS.iphone_pro, x: 290, y: 400, width: 500, height: 625, opacity: 1 },
      { id: 'el-5', type: 'shape', shape: 'pill', bgColor: '#0071E3', x: 365, y: 1080, width: 350, height: 76, opacity: 1 },
      { id: 'el-6', type: 'text', text: 'Book a Session', x: 365, y: 1096, width: 350, height: 48, fontSize: 32, fontWeight: '600', color: '#FFFFFF', align: 'center', opacity: 1, letterSpacing: 0 },
      { id: 'el-7', type: 'text', text: 'Apple The Exchange TRX', x: 80, y: 1240, width: 920, height: 40, fontSize: 24, fontWeight: '500', color: '#86868B', align: 'center', opacity: 0.9, letterSpacing: 1 },
    ]
  },
  {
    id: 'tpl-2',
    name: 'Today at Apple Workshop',
    category: 'Store Experience',
    format: 'portrait',
    bgColor: '#FFFFFF',
    elements: [
      { id: 'el-21', type: 'shape', shape: 'rect', bgColor: '#F5F5F7', x: 60, y: 60, width: 960, height: 520, opacity: 1 },
      { id: 'el-22', type: 'image', src: SVG_ASSETS.trx_pavilion, x: 140, y: 90, width: 800, height: 460, opacity: 1 },
      { id: 'el-23', type: 'text', text: 'TODAY AT APPLE', x: 80, y: 640, width: 920, height: 40, fontSize: 26, fontWeight: '700', color: '#0071E3', align: 'left', opacity: 1, letterSpacing: 3 },
      { id: 'el-24', type: 'text', text: 'Architectural Photography at TRX Park', x: 80, y: 695, width: 920, height: 170, fontSize: 68, fontWeight: '700', color: '#1D1D1F', align: 'left', opacity: 1, letterSpacing: -1.5 },
      { id: 'el-25', type: 'text', text: 'Join our Creative Pros this Saturday at 4:00 PM to master ProRAW lighting and composition.', x: 80, y: 895, width: 900, height: 120, fontSize: 34, fontWeight: '400', color: '#86868B', align: 'left', opacity: 1, letterSpacing: 0 },
      { id: 'el-26', type: 'shape', shape: 'pill', bgColor: '#1D1D1F', x: 80, y: 1060, width: 340, height: 74, opacity: 1 },
      { id: 'el-27', type: 'text', text: 'Reserve Free Spot', x: 80, y: 1076, width: 340, height: 44, fontSize: 30, fontWeight: '600', color: '#FFFFFF', align: 'center', opacity: 1, letterSpacing: 0 },
      { id: 'el-28', type: 'text', text: 'Apple The Exchange TRX • Kuala Lumpur', x: 80, y: 1235, width: 920, height: 40, fontSize: 24, fontWeight: '500', color: '#86868B', align: 'left', opacity: 1, letterSpacing: 0.5 },
    ]
  },
  {
    id: 'tpl-3',
    name: 'Mac Studio Power Square',
    category: 'Product Feature',
    format: 'square',
    bgColor: '#111113',
    elements: [
      { id: 'el-31', type: 'text', text: 'MacBook Air', x: 80, y: 95, width: 920, height: 100, fontSize: 84, fontWeight: '700', color: '#F5F5F7', align: 'center', opacity: 1, letterSpacing: -1.5 },
      { id: 'el-32', type: 'text', text: 'Lean. Mean. M-series machine.', x: 80, y: 205, width: 920, height: 60, fontSize: 36, fontWeight: '400', color: '#86868B', align: 'center', opacity: 1, letterSpacing: 0 },
      { id: 'el-33', type: 'image', src: SVG_ASSETS.macbook_air, x: 140, y: 310, width: 800, height: 540, opacity: 1 },
      { id: 'el-34', type: 'text', text: 'Explore Custom Configurations • Apple The Exchange TRX', x: 80, y: 940, width: 920, height: 44, fontSize: 26, fontWeight: '500', color: '#2997FF', align: 'center', opacity: 1, letterSpacing: 0 },
    ]
  },
  {
    id: 'tpl-4',
    name: 'Wellness Rings Story',
    category: 'Lifestyle',
    format: 'story',
    bgColor: '#F5F5F7',
    elements: [
      { id: 'el-41', type: 'text', text: 'MOVE. EXERCISE. STAND.', x: 80, y: 180, width: 920, height: 44, fontSize: 28, fontWeight: '700', color: '#0071E3', align: 'center', opacity: 1, letterSpacing: 3 },
      { id: 'el-42', type: 'text', text: 'Close your rings in style.', x: 100, y: 250, width: 880, height: 180, fontSize: 84, fontWeight: '700', color: '#1D1D1F', align: 'center', opacity: 1, letterSpacing: -2 },
      { id: 'el-43', type: 'image', src: SVG_ASSETS.apple_watch, x: 240, y: 520, width: 600, height: 800, opacity: 1 },
      { id: 'el-44', type: 'shape', shape: 'pill', bgColor: '#0071E3', x: 315, y: 1450, width: 450, height: 86, opacity: 1 },
      { id: 'el-45', type: 'text', text: 'Try Bands In-Store', x: 315, y: 1470, width: 450, height: 50, fontSize: 34, fontWeight: '600', color: '#FFFFFF', align: 'center', opacity: 1, letterSpacing: 0 },
      { id: 'el-46', type: 'text', text: 'Apple The Exchange TRX', x: 80, y: 1740, width: 920, height: 44, fontSize: 26, fontWeight: '500', color: '#86868B', align: 'center', opacity: 1, letterSpacing: 1 },
    ]
  },
  {
    id: 'tpl-5',
    name: 'iPad Pro Creative Education',
    category: 'Product Education',
    format: 'portrait',
    bgColor: '#FAF8F5',
    elements: [
      { id: 'el-51', type: 'text', text: 'PRO WORKFLOW TIP 01', x: 80, y: 85, width: 920, height: 40, fontSize: 26, fontWeight: '700', color: '#86868B', align: 'left', opacity: 1, letterSpacing: 3 },
      { id: 'el-52', type: 'text', text: 'Sketch, annotate & render anywhere.', x: 80, y: 140, width: 920, height: 170, fontSize: 70, fontWeight: '700', color: '#1D1D1F', align: 'left', opacity: 1, letterSpacing: -1.5 },
      { id: 'el-53', type: 'image', src: SVG_ASSETS.ipad_pro, x: 240, y: 360, width: 600, height: 700, opacity: 1 },
      { id: 'el-54', type: 'text', text: 'Apple Pencil Pro hover preview gives pixel-accurate precision before you touch the display.', x: 80, y: 1090, width: 920, height: 95, fontSize: 30, fontWeight: '400', color: '#1D1D1F', align: 'left', opacity: 0.85, letterSpacing: 0 },
      { id: 'el-55', type: 'text', text: 'Apple The Exchange TRX', x: 80, y: 1245, width: 920, height: 40, fontSize: 24, fontWeight: '600', color: '#0071E3', align: 'left', opacity: 1, letterSpacing: 0.5 },
    ]
  },
  {
    id: 'tpl-6',
    name: 'Spatial Audio Immersion',
    category: 'Promotional',
    format: 'square',
    bgColor: '#F5F5F7',
    elements: [
      { id: 'el-61', type: 'text', text: 'SOUND REIMAGINED', x: 80, y: 85, width: 920, height: 40, fontSize: 26, fontWeight: '700', color: '#0071E3', align: 'center', opacity: 1, letterSpacing: 3 },
      { id: 'el-62', type: 'text', text: 'AirPods Max', x: 80, y: 135, width: 920, height: 96, fontSize: 84, fontWeight: '700', color: '#1D1D1F', align: 'center', opacity: 1, letterSpacing: -2 },
      { id: 'el-63', type: 'image', src: SVG_ASSETS.airpods_max, x: 265, y: 260, width: 550, height: 550, opacity: 1 },
      { id: 'el-64', type: 'text', text: 'Complimentary Personal Engraving Available In-Store', x: 80, y: 845, width: 920, height: 50, fontSize: 30, fontWeight: '500', color: '#1D1D1F', align: 'center', opacity: 1, letterSpacing: 0 },
      { id: 'el-65', type: 'text', text: 'Apple The Exchange TRX', x: 80, y: 955, width: 920, height: 40, fontSize: 24, fontWeight: '500', color: '#86868B', align: 'center', opacity: 1, letterSpacing: 1 },
    ]
  }
];

const INITIAL_PROJECTS = [
  {
    id: 'proj-101',
    name: 'iPhone Titanium Launch — TRX Hero',
    status: 'Published',
    format: 'portrait',
    category: 'Product Launch',
    product: 'iPhone',
    updatedAt: '2026-11-16 14:20',
    bgColor: '#F5F5F7',
    elements: INITIAL_TEMPLATES[0].elements,
  },
  {
    id: 'proj-102',
    name: 'Today at Apple: TRX Architecture Walk',
    status: 'Pending Approval',
    format: 'portrait',
    category: 'Store Experience',
    product: 'iPhone',
    updatedAt: '2026-11-15 18:05',
    bgColor: '#FFFFFF',
    elements: INITIAL_TEMPLATES[1].elements,
  },
  {
    id: 'proj-103',
    name: 'MacBook Air M-Series Developer Spotlight',
    status: 'Approved',
    format: 'square',
    category: 'Product Feature',
    product: 'Mac',
    updatedAt: '2026-11-14 11:40',
    bgColor: '#111113',
    elements: INITIAL_TEMPLATES[2].elements,
  },
  {
    id: 'proj-104',
    name: 'Weekend Fitness Challenge Story',
    status: 'Draft',
    format: 'story',
    category: 'Lifestyle Content',
    product: 'Apple Watch',
    updatedAt: '2026-11-13 09:15',
    bgColor: '#F5F5F7',
    elements: INITIAL_TEMPLATES[3].elements,
  },
];

const INITIAL_CAMPAIGNS = [
  { id: 'camp-1', title: 'iPhone Titanium Showcase Reel & Post', date: '2026-11-18', type: 'Product Launch', status: 'Scheduled', assignee: 'Aisha Rahman', projectId: 'proj-101' },
  { id: 'camp-2', title: 'Today at Apple: Night Mode at TRX Park', date: '2026-11-21', type: 'Store Experience', status: 'In Review', assignee: 'Daniel Lim', projectId: 'proj-102' },
  { id: 'camp-3', title: 'Mac for University Creators Carousel', date: '2026-11-25', type: 'Product Education', status: 'Drafting', assignee: 'Mei Ling Tan', projectId: 'proj-103' },
  { id: 'camp-4', title: 'Year-End Gifting Guide Teaser', date: '2026-11-28', type: 'Promotional Campaign', status: 'Planned', assignee: 'Aisha Rahman', projectId: 'proj-104' },
];

const DEFAULT_BRAND_SETTINGS = {
  brandName: 'Apple TRX Studio',
  storeName: 'Apple The Exchange TRX',
  location: 'Tun Razak Exchange, Kuala Lumpur',
  footerSignature: 'Apple The Exchange TRX',
  primaryColor: '#1D1D1F',
  secondaryColor: '#F5F5F7',
  accentColor: '#0071E3',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  defaultFormat: 'portrait',
  logoUrl: '',
  guidelines: 'Maintain generous negative space (minimum 15% margin). Keep product hardware unobstructed. Use sentence case for headlines and avoid exclamation marks in formal product announcements.',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = (prefix = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

const getFormatDimensions = (formatId) => {
  return INSTAGRAM_FORMATS.find((f) => f.id === formatId) || INSTAGRAM_FORMATS[0];
};

// ============================================================================
// MINI ARTBOARD PREVIEW COMPONENT (Renders scalable SVG/DOM preview of designs)
// ============================================================================

const DesignThumbnail = ({ format = 'portrait', bgColor = '#F5F5F7', elements = [], className = '' }) => {
  const dims = getFormatDimensions(format);
  return (
    <div
      className={`relative overflow-hidden select-none border border-[#E5E5E7] bg-[#F5F5F7] ${className}`}
      style={{ aspectRatio: `${dims.width} / ${dims.height}` }}
    >
      <svg
        viewBox={`0 0 ${dims.width} ${dims.height}`}
        className="w-full h-full block"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect x="0" y="0" width={dims.width} height={dims.height} fill={bgColor} />
        {elements.map((el) => {
          if (el.type === 'shape') {
            const rx = el.shape === 'pill' ? el.height / 2 : el.shape === 'circle' ? el.width / 2 : 24;
            return (
              <rect
                key={el.id}
                x={el.x}
                y={el.y}
                width={el.width}
                height={el.height}
                rx={rx}
                fill={el.bgColor || '#0071E3'}
                opacity={el.opacity ?? 1}
              />
            );
          }
          if (el.type === 'image' && el.src) {
            return (
              <image
                key={el.id}
                href={el.src}
                x={el.x}
                y={el.y}
                width={el.width}
                height={el.height}
                opacity={el.opacity ?? 1}
                preserveAspectRatio="xMidYMid meet"
              />
            );
          }
          if (el.type === 'text') {
            const textAnchor = el.align === 'center' ? 'middle' : el.align === 'right' ? 'end' : 'start';
            const textX =
              el.align === 'center'
                ? el.x + el.width / 2
                : el.align === 'right'
                ? el.x + el.width
                : el.x;
            return (
              <foreignObject
                key={el.id}
                x={el.x}
                y={el.y}
                width={el.width}
                height={Math.max(el.height, el.fontSize * 2.5)}
                opacity={el.opacity ?? 1}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    fontSize: `${el.fontSize}px`,
                    fontWeight: el.fontWeight || '500',
                    color: el.color || '#1D1D1F',
                    textAlign: el.align || 'left',
                    letterSpacing: `${el.letterSpacing || 0}px`,
                    lineHeight: 1.18,
                    fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
                    wordWrap: 'break-word',
                  }}
                >
                  {el.text}
                </div>
              </foreignObject>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};

// ============================================================================
// MAIN APPLICATION
// ============================================================================

export default function App() {
  // Navigation & Responsive UI State
  const [activeNav, setActiveNav] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Persistent State (LocalStorage backed)
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('apple_trx_projects');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [assets, setAssets] = useState(() => {
    try {
      const saved = localStorage.getItem('apple_trx_assets');
      return saved ? JSON.parse(saved) : INITIAL_ASSETS;
    } catch {
      return INITIAL_ASSETS;
    }
  });

  const [campaigns, setCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('apple_trx_campaigns');
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [brandSettings, setBrandSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('apple_trx_brand');
      return saved ? JSON.parse(saved) : DEFAULT_BRAND_SETTINGS;
    } catch {
      return DEFAULT_BRAND_SETTINGS;
    }
  });

  // Active Editor Project State
  const [editorProject, setEditorProject] = useState(projects[0]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('apple_trx_projects', JSON.stringify(projects));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('apple_trx_assets', JSON.stringify(assets));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [assets]);

  useEffect(() => {
    try {
      localStorage.setItem('apple_trx_campaigns', JSON.stringify(campaigns));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [campaigns]);

  useEffect(() => {
    try {
      localStorage.setItem('apple_trx_brand', JSON.stringify(brandSettings));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [brandSettings]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3400);
  };

  // Open any project or template in the interactive editor
  const openInEditor = (projectObj) => {
    setEditorProject(JSON.parse(JSON.stringify(projectObj)));
    setActiveNav('editor');
    setMobileMenuOpen(false);
  };

  const handleUseTemplate = (tpl) => {
    const newProj = {
      id: generateId('proj'),
      name: `${tpl.name} — Copy`,
      status: 'Draft',
      format: tpl.format,
      category: tpl.category,
      product: 'iPhone',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      bgColor: tpl.bgColor,
      elements: JSON.parse(JSON.stringify(tpl.elements)),
    };
    setProjects((prev) => [newProj, ...prev]);
    openInEditor(newProj);
    showToast(`Template "${tpl.name}" loaded into studio`);
  };

  const handleQuickStart = (formatId, label) => {
    const dims = getFormatDimensions(formatId);
    const newProj = {
      id: generateId('proj'),
      name: `Untitled ${label}`,
      status: 'Draft',
      format: formatId,
      category: 'Product Highlight',
      product: 'iPhone',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      bgColor: '#FFFFFF',
      elements: [
        {
          id: generateId('el'),
          type: 'text',
          text: 'Headline Goes Here.',
          x: 100,
          y: 140,
          width: dims.width - 200,
          height: 110,
          fontSize: 80,
          fontWeight: '700',
          color: '#1D1D1F',
          align: 'center',
          opacity: 1,
          letterSpacing: -1.5,
        },
        {
          id: generateId('el'),
          type: 'text',
          text: brandSettings.footerSignature,
          x: 100,
          y: dims.height - 110,
          width: dims.width - 200,
          height: 44,
          fontSize: 26,
          fontWeight: '500',
          color: '#86868B',
          align: 'center',
          opacity: 1,
          letterSpacing: 0.5,
        },
      ],
    };
    setProjects((prev) => [newProj, ...prev]);
    openInEditor(newProj);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-studio', label: 'AI Design Studio', icon: Sparkles, badge: 'AI' },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'assets', label: 'Asset Library', icon: FolderOpen },
    { id: 'projects', label: 'My Projects', icon: Briefcase },
    { id: 'captions', label: 'AI Caption Writer', icon: MessageSquare },
    { id: 'planner', label: 'Campaign Planner', icon: CalendarIcon },
    { id: 'brand', label: 'Brand Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col lg:flex-row font-sans antialiased selection:bg-[#0071E3] selection:text-white">
      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#1D1D1F] text-white px-4 py-3 rounded-2xl shadow-xl border border-white/10 transition-all duration-300">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-[#E5E5E7] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center font-semibold text-sm tracking-tight">
            TRX
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight leading-none">{brandSettings.brandName}</div>
            <div className="text-[11px] text-[#86868B] mt-0.5">Internal Creative Concept</div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl hover:bg-[#F5F5F7] text-[#1D1D1F]"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Persistent Left Sidebar (Hidden in full-screen editor unless toggled, visible on all other views) */}
      <aside
        className={`${
          mobileMenuOpen ? 'fixed inset-0 z-40 block' : 'hidden'
        } lg:block lg:w-64 lg:shrink-0 bg-white border-r border-[#E5E5E7] flex flex-col justify-between lg:sticky lg:top-0 lg:h-screen overflow-y-auto`}
      >
        <div className="p-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-7">
            <div
              onClick={() => {
                setActiveNav('dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {brandSettings.logoUrl ? (
                <img src={brandSettings.logoUrl} alt="Logo" className="w-9 h-9 rounded-xl object-cover border border-[#E5E5E7]" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center font-semibold text-xs tracking-wider shadow-sm group-hover:bg-[#0071E3] transition-colors">
                  TRX
                </div>
              )}
              <div>
                <h1 className="text-[15px] font-semibold tracking-tight text-[#1D1D1F] leading-tight">
                  {brandSettings.brandName}
                </h1>
                <p className="text-[11px] text-[#86868B] font-medium">The Exchange TRX • KL</p>
              </div>
            </div>
            {mobileMenuOpen && (
              <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1.5 rounded-lg text-[#86868B]">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Primary Create Button */}
          <button
            onClick={() => {
              setActiveNav('ai-studio');
              setMobileMenuOpen(false);
            }}
            className="w-full mb-6 py-2.5 px-3.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Design</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F5F5F7] text-[#1D1D1F] font-semibold'
                      : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0071E3]' : 'text-[#86868B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#0071E3]/10 text-[#0071E3]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Direct shortcut to Active Canvas Editor */}
            <button
              onClick={() => {
                setActiveNav('editor');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all cursor-pointer ${
                activeNav === 'editor'
                  ? 'bg-[#1D1D1F] text-white font-semibold'
                  : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className={`w-4 h-4 ${activeNav === 'editor' ? 'text-white' : 'text-[#86868B]'}`} />
                <span>Visual Canvas Editor</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#34C759]" title="Active workspace" />
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Section */}
        <div className="p-4 border-t border-[#E5E5E7] space-y-1">
          <button
            onClick={() => {
              setActiveNav('help');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
              activeNav === 'help' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help Center</span>
          </button>

          <div
            onClick={() => {
              setActiveNav('brand');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F5F7] cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#E5E5E7] text-[#1D1D1F] flex items-center justify-center text-xs font-semibold">
              CT
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-[#1D1D1F] truncate">Creative Team</div>
              <div className="text-[11px] text-[#86868B] truncate">TRX Social Studio</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 min-w-0 flex flex-col">
        {activeNav === 'dashboard' && (
          <DashboardView
            projects={projects}
            campaigns={campaigns}
            brandSettings={brandSettings}
            onCreateNew={() => setActiveNav('ai-studio')}
            onQuickStart={handleQuickStart}
            onOpenProject={openInEditor}
            onUseTemplate={handleUseTemplate}
            onNavigate={setActiveNav}
          />
        )}

        {activeNav === 'ai-studio' && (
          <AIDesignStudioView
            assets={assets}
            brandSettings={brandSettings}
            onDesignGenerated={(newProject) => {
              setProjects((prev) => [newProject, ...prev]);
              openInEditor(newProject);
            }}
            showToast={showToast}
          />
        )}

        {activeNav === 'editor' && (
          <DesignEditorView
            project={editorProject}
            assets={assets}
            brandSettings={brandSettings}
            onSaveProject={(updatedProj) => {
              setEditorProject(updatedProj);
              setProjects((prev) => {
                const exists = prev.some((p) => p.id === updatedProj.id);
                if (exists) {
                  return prev.map((p) => (p.id === updatedProj.id ? updatedProj : p));
                }
                return [updatedProj, ...prev];
              });
              showToast('Design saved to My Projects');
            }}
            onBack={() => setActiveNav('projects')}
            showToast={showToast}
          />
        )}

        {activeNav === 'templates' && (
          <TemplateLibraryView
            templates={INITIAL_TEMPLATES}
            onUseTemplate={handleUseTemplate}
          />
        )}

        {activeNav === 'assets' && (
          <AssetLibraryView
            assets={assets}
            setAssets={setAssets}
            onUseAssetInNewDesign={(asset) => {
              const newProj = {
                id: generateId('proj'),
                name: `${asset.name} Post`,
                status: 'Draft',
                format: 'portrait',
                category: 'Product Highlight',
                product: asset.category,
                updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                bgColor: '#F5F5F7',
                elements: [
                  {
                    id: generateId('el'),
                    type: 'text',
                    text: asset.name,
                    x: 80,
                    y: 120,
                    width: 920,
                    height: 90,
                    fontSize: 64,
                    fontWeight: '700',
                    color: '#1D1D1F',
                    align: 'center',
                    opacity: 1,
                    letterSpacing: -1,
                  },
                  {
                    id: generateId('el'),
                    type: 'image',
                    src: asset.url,
                    x: 240,
                    y: 280,
                    width: 600,
                    height: 720,
                    opacity: 1,
                  },
                  {
                    id: generateId('el'),
                    type: 'text',
                    text: brandSettings.footerSignature,
                    x: 80,
                    y: 1230,
                    width: 920,
                    height: 40,
                    fontSize: 24,
                    fontWeight: '500',
                    color: '#86868B',
                    align: 'center',
                    opacity: 1,
                    letterSpacing: 1,
                  },
                ],
              };
              setProjects((prev) => [newProj, ...prev]);
              openInEditor(newProj);
            }}
            showToast={showToast}
          />
        )}

        {activeNav === 'captions' && (
          <AICaptionGeneratorView brandSettings={brandSettings} showToast={showToast} />
        )}

        {activeNav === 'projects' && (
          <MyProjectsView
            projects={projects}
            setProjects={setProjects}
            onOpenProject={openInEditor}
            onCreateNew={() => setActiveNav('ai-studio')}
            showToast={showToast}
          />
        )}

        {activeNav === 'planner' && (
          <CampaignPlannerView
            campaigns={campaigns}
            setCampaigns={setCampaigns}
            projects={projects}
            onOpenProject={openInEditor}
            showToast={showToast}
          />
        )}

        {activeNav === 'brand' && (
          <BrandSettingsView
            brandSettings={brandSettings}
            setBrandSettings={setBrandSettings}
            showToast={showToast}
          />
        )}

        {activeNav === 'help' && <HelpCenterView onNavigate={setActiveNav} />}
      </main>
    </div>
  );
}

// ============================================================================
// 4. DASHBOARD VIEW
// ============================================================================

function DashboardView({
  projects,
  campaigns,
  brandSettings,
  onCreateNew,
  onQuickStart,
  onOpenProject,
  onUseTemplate,
  onNavigate,
}) {
  const stats = [
    { label: 'Total Designs', value: projects.length, sub: '+3 this week' },
    { label: 'Published Designs', value: projects.filter((p) => p.status === 'Published').length, sub: 'Live on @appletrx_concept' },
    { label: 'Pending Approval', value: projects.filter((p) => p.status === 'Pending Approval').length, sub: 'Awaiting lead sign-off' },
    { label: 'Active Campaigns', value: campaigns.length, sub: 'November 2026 schedule' },
  ];

  const quickStarts = [
    { id: 'portrait', title: 'Instagram Post', dims: '1080 × 1350 px', desc: 'High-engagement 4:5 vertical feed' },
    { id: 'carousel', title: 'Instagram Carousel', dims: '1080 × 1350 px', desc: 'Multi-slide product storytelling' },
    { id: 'story', title: 'Instagram Story', dims: '1080 × 1920 px', desc: 'Full-screen 9:16 vertical format' },
    { id: 'square', title: 'Campaign Square', dims: '1080 × 1080 px', desc: 'Classic 1:1 grid showcase' },
  ];

  return (
    <div className="max-w-7xl w-full mx-auto px-5 sm:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#86868B] mb-1">
            {brandSettings.storeName} • Creative Workspace
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F]">
            Good morning, Creative Team
          </h1>
          <p className="text-sm sm:text-base text-[#86868B] mt-1">
            Create something extraordinary for {brandSettings.storeName}.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-sm font-medium shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Design</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-[#E5E5E7] shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
          >
            <div className="text-xs font-medium text-[#86868B]">{s.label}</div>
            <div className="text-3xl font-semibold tracking-tight text-[#1D1D1F] mt-2">{s.value}</div>
            <div className="text-xs text-[#86868B] mt-1.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Start Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F]">Quick Start</h2>
          <span className="text-xs text-[#86868B]">Select a blank canvas preset</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStarts.map((qs) => (
            <button
              key={qs.id}
              onClick={() => onQuickStart(qs.id, qs.title)}
              className="group text-left bg-white hover:border-[#0071E3] rounded-2xl p-5 border border-[#E5E5E7] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F7] text-[11px] font-semibold text-[#1D1D1F]">
                    {qs.dims}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#F5F5F7] group-hover:bg-[#0071E3] group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                  {qs.title}
                </h3>
                <p className="text-xs text-[#86868B] mt-1">{qs.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Projects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F]">Recent Projects</h2>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-medium text-[#0071E3] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all projects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {projects.slice(0, 4).map((proj) => (
            <div
              key={proj.id}
              onClick={() => onOpenProject(proj)}
              className="group bg-white rounded-2xl border border-[#E5E5E7] overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="p-4 bg-[#F5F5F7]/70 flex items-center justify-center h-56">
                <div className="h-full flex items-center justify-center">
                  <DesignThumbnail
                    format={proj.format}
                    bgColor={proj.bgColor}
                    elements={proj.elements}
                    className="h-full w-auto rounded-lg shadow-sm group-hover:scale-[1.02] transition-transform"
                  />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F]">
                      {proj.status}
                    </span>
                    <span className="text-[11px] text-[#86868B] uppercase">{proj.format}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] line-clamp-1 group-hover:text-[#0071E3] transition-colors">
                    {proj.name}
                  </h3>
                </div>
                <p className="text-[11px] text-[#86868B] mt-2">Edited {proj.updatedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Templates */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F]">Featured Templates</h2>
            <p className="text-xs text-[#86868B]">Curated compositions tailored for Apple The Exchange TRX</p>
          </div>
          <button
            onClick={() => onNavigate('templates')}
            className="text-xs font-medium text-[#0071E3] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Browse gallery</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INITIAL_TEMPLATES.slice(0, 3).map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-[#E5E5E7] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="p-5 bg-[#F5F5F7]/60 flex items-center justify-center h-64">
                <DesignThumbnail
                  format={tpl.format}
                  bgColor={tpl.bgColor}
                  elements={tpl.elements}
                  className="h-full w-auto rounded-lg shadow-sm"
                />
              </div>
              <div className="p-4 border-t border-[#E5E5E7] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-medium text-[#0071E3]">{tpl.category}</span>
                  <h3 className="text-sm font-semibold text-[#1D1D1F]">{tpl.name}</h3>
                </div>
                <button
                  onClick={() => onUseTemplate(tpl)}
                  className="px-3.5 py-2 rounded-xl bg-[#1D1D1F] hover:bg-[#0071E3] text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// 5. AI DESIGN STUDIO (MULTI-STEP WORKFLOW + REAL GEMINI IMAGE GENERATION)
// ============================================================================

function AIDesignStudioView({ assets, brandSettings, onDesignGenerated, showToast }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('Product Highlight');
  const [product, setProduct] = useState('iPhone');
  const [selectedAssetId, setSelectedAssetId] = useState('asset-1');
  const [format, setFormat] = useState('portrait');
  const [style, setStyle] = useState('Minimalist');

  const [brief, setBrief] = useState({
    headline: 'Pro. Beyond Imagination.',
    supportingText: 'Experience aerospace-grade titanium and pro camera systems at The Exchange TRX.',
    cta: 'Discover In-Store',
    campaignMessage: 'Flagship Showcase • Kuala Lumpur',
    additionalInstructions: 'Clean studio lighting, refined negative space, subtle depth.',
  });

  const [engineeredPrompt, setEngineeredPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedConcepts, setGeneratedConcepts] = useState([]);
  const [generationMode, setGenerationMode] = useState('studio-hybrid'); // 'ai-image' or 'studio-hybrid'

  // Auto-select matching product asset when product changes
  useEffect(() => {
    const match = assets.find((a) => a.category.toLowerCase() === product.toLowerCase());
    if (match) setSelectedAssetId(match.id);
  }, [product, assets]);

  // Build detailed visual prompt from brief
  const enhancePromptWithAssistant = () => {
    const styleObj = DESIGN_STYLES.find((s) => s.id === style) || DESIGN_STYLES[0];
    const prompt = `Minimalist Apple-inspired commercial product photography and editorial layout for ${product} (${category}). Visual style: ${style} (${styleObj.desc}). Scene setting: refined architectural minimalism inspired by The Exchange TRX Kuala Lumpur, soft diffused studio lighting, natural shadows, clean neutral backdrop, ultra-high resolution commercial aesthetic, zero clutter, no text overlays.`;
    setEngineeredPrompt(prompt);
    showToast('AI Prompt Assistant refined your visual brief');
  };

  useEffect(() => {
    if (!engineeredPrompt) {
      enhancePromptWithAssistant();
    }
  }, [category, product, style]);

  // Call Gemini Image Generation API with graceful fallback to Smart Studio Composition
  const handleGenerateDesigns = async () => {
    setIsGenerating(true);
    setGenerationProgress(15);
    setGeneratedConcepts([]);

    const progressTimer = setInterval(() => {
      setGenerationProgress((prev) => (prev < 88 ? prev + 12 : prev));
    }, 500);

    const dims = getFormatDimensions(format);
    const chosenAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];
    const styleObj = DESIGN_STYLES.find((s) => s.id === style) || DESIGN_STYLES[0];

    let aiBackdropUrl = null;
    let isRealAI = false;

    try {
      const apiKey = '';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent?key=${apiKey}`;
      const promptText =
        engineeredPrompt ||
        `Minimalist studio product photography background for ${product}, ${style} aesthetic, soft architectural light, clean luxury retail feel, no text.`;

      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        const base64Data = result?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
        if (base64Data) {
          aiBackdropUrl = `data:image/png;base64,${base64Data}`;
          isRealAI = true;
        }
      }
    } catch (err) {
      // Graceful fallback to smart template synthesis
    }

    clearInterval(progressTimer);
    setGenerationProgress(100);

    // Build 3 distinct editable layout concepts
    const concepts = [
      {
        id: generateId('concept'),
        label: isRealAI ? 'AI Studio Hero (Generative Backdrop)' : 'Smart Studio Composition A (Editorial)',
        isAI: isRealAI,
        format,
        bgColor: styleObj.bg,
        elements: [
          ...(aiBackdropUrl
            ? [{ id: generateId('el'), type: 'image', src: aiBackdropUrl, x: 0, y: 0, width: dims.width, height: dims.height, opacity: 0.92 }]
            : []),
          {
            id: generateId('el'),
            type: 'text',
            text: brief.campaignMessage.toUpperCase(),
            x: 80,
            y: 85,
            width: dims.width - 160,
            height: 40,
            fontSize: 24,
            fontWeight: '700',
            color: isRealAI ? '#FFFFFF' : styleObj.accent,
            align: 'center',
            opacity: 1,
            letterSpacing: 3,
          },
          {
            id: generateId('el'),
            type: 'text',
            text: brief.headline,
            x: 80,
            y: 140,
            width: dims.width - 160,
            height: 150,
            fontSize: format === 'square' ? 74 : 86,
            fontWeight: '700',
            color: isRealAI ? '#FFFFFF' : styleObj.text,
            align: 'center',
            opacity: 1,
            letterSpacing: -1.8,
          },
          ...(!aiBackdropUrl && chosenAsset
            ? [
                {
                  id: generateId('el'),
                  type: 'image',
                  src: chosenAsset.url,
                  x: Math.round((dims.width - 520) / 2),
                  y: format === 'square' ? 320 : 410,
                  width: 520,
                  height: format === 'square' ? 460 : 580,
                  opacity: 1,
                },
              ]
            : []),
          {
            id: generateId('el'),
            type: 'shape',
            shape: 'pill',
            bgColor: isRealAI ? '#0071E3' : styleObj.accent === '#FFFFFF' ? '#1D1D1F' : styleObj.accent,
            x: Math.round((dims.width - 340) / 2),
            y: dims.height - 230,
            width: 340,
            height: 74,
            opacity: 1,
          },
          {
            id: generateId('el'),
            type: 'text',
            text: brief.cta,
            x: Math.round((dims.width - 340) / 2),
            y: dims.height - 213,
            width: 340,
            height: 44,
            fontSize: 30,
            fontWeight: '600',
            color: '#FFFFFF',
            align: 'center',
            opacity: 1,
            letterSpacing: 0,
          },
          {
            id: generateId('el'),
            type: 'text',
            text: brandSettings.footerSignature,
            x: 80,
            y: dims.height - 95,
            width: dims.width - 160,
            height: 40,
            fontSize: 24,
            fontWeight: '500',
            color: isRealAI ? '#F5F5F7' : '#86868B',
            align: 'center',
            opacity: 0.9,
            letterSpacing: 0.5,
          },
        ],
      },
      {
        id: generateId('concept'),
        label: 'Smart Studio Composition B (Asymmetric Split)',
        isAI: false,
        format,
        bgColor: '#FFFFFF',
        elements: [
          {
            id: generateId('el'),
            type: 'shape',
            shape: 'rect',
            bgColor: '#F5F5F7',
            x: 56,
            y: 56,
            width: dims.width - 112,
            height: Math.round(dims.height * 0.48),
            opacity: 1,
          },
          ...(chosenAsset
            ? [
                {
                  id: generateId('el'),
                  type: 'image',
                  src: chosenAsset.url,
                  x: Math.round((dims.width - 460) / 2),
                  y: 90,
                  width: 460,
                  height: Math.round(dims.height * 0.42),
                  opacity: 1,
                },
              ]
            : []),
          {
            id: generateId('el'),
            type: 'text',
            text: brief.headline,
            x: 72,
            y: Math.round(dims.height * 0.57),
            width: dims.width - 144,
            height: 130,
            fontSize: 68,
            fontWeight: '700',
            color: '#1D1D1F',
            align: 'left',
            opacity: 1,
            letterSpacing: -1.5,
          },
          {
            id: generateId('el'),
            type: 'text',
            text: brief.supportingText,
            x: 72,
            y: Math.round(dims.height * 0.71),
            width: dims.width - 144,
            height: 110,
            fontSize: 32,
            fontWeight: '400',
            color: '#86868B',
            align: 'left',
            opacity: 1,
            letterSpacing: 0,
          },
          {
            id: generateId('el'),
            type: 'text',
            text: `${brief.cta}  →`,
            x: 72,
            y: dims.height - 150,
            width: 500,
            height: 44,
            fontSize: 30,
            fontWeight: '600',
            color: '#0071E3',
            align: 'left',
            opacity: 1,
            letterSpacing: 0,
          },
          {
            id: generateId('el'),
            type: 'text',
            text: brandSettings.footerSignature,
            x: 72,
            y: dims.height - 85,
            width: dims.width - 144,
            height: 36,
            fontSize: 22,
            fontWeight: '500',
            color: '#86868B',
            align: 'left',
            opacity: 1,
            letterSpacing: 0.5,
          },
        ],
      },
      {
        id: generateId('concept'),
        label: 'Smart Studio Composition C (Dark Hardware Focus)',
        isAI: false,
        format,
        bgColor: '#111113',
        elements: [
          {
            id: generateId('el'),
            type: 'text',
            text: product.toUpperCase(),
            x: 80,
            y: 80,
            width: dims.width - 160,
            height: 40,
            fontSize: 26,
            fontWeight: '700',
            color: '#2997FF',
            align: 'center',
            opacity: 1,
            letterSpacing: 4,
          },
          {
            id: generateId('el'),
            type: 'text',
            text: brief.headline,
            x: 80,
            y: 135,
            width: dims.width - 160,
            height: 140,
            fontSize: 78,
            fontWeight: '700',
            color: '#F5F5F7',
            align: 'center',
            opacity: 1,
            letterSpacing: -1.5,
          },
          ...(chosenAsset
            ? [
                {
                  id: generateId('el'),
                  type: 'image',
                  src: chosenAsset.url,
                  x: Math.round((dims.width - 520) / 2),
                  y: format === 'square' ? 300 : 380,
                  width: 520,
                  height: format === 'square' ? 460 : 580,
                  opacity: 1,
                },
              ]
            : []),
          {
            id: generateId('el'),
            type: 'text',
            text: brandSettings.footerSignature,
            x: 80,
            y: dims.height - 95,
            width: dims.width - 160,
            height: 40,
            fontSize: 24,
            fontWeight: '500',
            color: '#86868B',
            align: 'center',
            opacity: 1,
            letterSpacing: 1,
          },
        ],
      },
    ];

    setGeneratedConcepts(concepts);
    setGenerationMode(isRealAI ? 'ai-image' : 'studio-hybrid');
    setIsGenerating(false);
    showToast(
      isRealAI
        ? 'Generated AI visual + editable studio layouts!'
        : 'Generated 3 editable studio layouts using your product assets'
    );
  };

  const handleSelectConcept = (concept) => {
    const newProj = {
      id: generateId('proj'),
      name: `${product} — ${brief.headline.slice(0, 24)}`,
      status: 'Draft',
      format: concept.format,
      category,
      product,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      bgColor: concept.bgColor,
      elements: concept.elements,
    };
    onDesignGenerated(newProj);
  };

  const stepsList = [
    { num: 1, title: 'Category' },
    { num: 2, title: 'Product' },
    { num: 3, title: 'Format' },
    { num: 4, title: 'Style' },
    { num: 5, title: 'Creative Brief' },
    { num: 6, title: 'Generate' },
  ];

  return (
    <div className="max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Design Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F]">
          Guided Campaign Generator
        </h1>
        <p className="text-sm text-[#86868B] mt-1">
          Configure your campaign parameters and generate editable Instagram compositions for {brandSettings.storeName}.
        </p>
      </div>

      {/* Stepper Bar */}
      <div className="bg-white rounded-2xl p-3 border border-[#E5E5E7] flex items-center justify-between overflow-x-auto gap-2">
        {stepsList.map((s) => {
          const active = step === s.num;
          const completed = step > s.num;
          return (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? 'bg-[#1D1D1F] text-white'
                  : completed
                  ? 'bg-[#F5F5F7] text-[#1D1D1F]'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                  active
                    ? 'bg-[#0071E3] text-white'
                    : completed
                    ? 'bg-[#34C759] text-white'
                    : 'bg-[#E5E5E7] text-[#1D1D1F]'
                }`}
              >
                {completed ? <Check className="w-3 h-3" /> : s.num}
              </span>
              <span>{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Panels */}
      <div className="bg-white rounded-3xl border border-[#E5E5E7] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* STEP 1: CONTENT CATEGORY */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Step 1 — Select Content Category</h2>
              <p className="text-sm text-[#86868B] mt-1">Choose the primary narrative objective for this Instagram post.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CONTENT_CATEGORIES.map((cat) => {
                const selected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                      selected
                        ? 'border-[#0071E3] bg-[#0071E3]/[0.04] ring-1 ring-[#0071E3]'
                        : 'border-[#E5E5E7] hover:border-[#86868B] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#1D1D1F]">{cat.title}</span>
                      {selected && <CheckCircle2 className="w-4 h-4 text-[#0071E3]" />}
                    </div>
                    <p className="text-xs text-[#86868B] leading-relaxed">{cat.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: PRODUCT & ASSET */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Step 2 — Select Product & Visual Asset</h2>
              <p className="text-sm text-[#86868B] mt-1">Select the Apple hardware focus and choose an asset from your library.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {PRODUCT_CATEGORIES.map((prod) => {
                const Icon = prod.icon;
                const selected = product === prod.id;
                return (
                  <button
                    key={prod.id}
                    onClick={() => setProduct(prod.id)}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                      selected
                        ? 'border-[#0071E3] bg-[#0071E3]/[0.05] ring-1 ring-[#0071E3]'
                        : 'border-[#E5E5E7] hover:border-[#86868B]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selected ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-[#1D1D1F]">{prod.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#E5E5E7]">
              <h3 className="text-sm font-semibold text-[#1D1D1F] mb-3">Choose Hardware / Store Asset</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {assets.map((asset) => {
                  const isSelected = selectedAssetId === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`rounded-2xl border p-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#0071E3] bg-[#0071E3]/[0.04] ring-1 ring-[#0071E3]'
                          : 'border-[#E5E5E7] hover:border-[#86868B]'
                      }`}
                    >
                      <div className="aspect-square bg-[#F5F5F7] rounded-xl p-2 flex items-center justify-center mb-2">
                        <img src={asset.url} alt={asset.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <p className="text-xs font-medium text-[#1D1D1F] truncate">{asset.name}</p>
                      <p className="text-[10px] text-[#86868B]">{asset.category}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: INSTAGRAM FORMAT */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Step 3 — Select Instagram Format</h2>
              <p className="text-sm text-[#86868B] mt-1">Choose exact pixel dimensions optimized for Instagram placements.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {INSTAGRAM_FORMATS.map((fmt) => {
                const selected = format === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selected
                        ? 'border-[#0071E3] bg-[#0071E3]/[0.04] ring-1 ring-[#0071E3]'
                        : 'border-[#E5E5E7] hover:border-[#86868B]'
                    }`}
                  >
                    <div className="w-full h-40 bg-[#F5F5F7] rounded-xl flex items-center justify-center mb-4 p-4">
                      <div
                        className={`border-2 ${
                          selected ? 'border-[#0071E3] bg-white' : 'border-[#86868B]/40 bg-white'
                        } rounded-md flex items-center justify-center text-[11px] font-semibold text-[#86868B] shadow-xs`}
                        style={{
                          aspectRatio: `${fmt.width}/${fmt.height}`,
                          height: fmt.id === 'story' ? '100%' : fmt.id === 'square' ? '78%' : '90%',
                        }}
                      >
                        {fmt.ratio}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1D1D1F]">{fmt.name}</span>
                        {selected && <CheckCircle2 className="w-4 h-4 text-[#0071E3]" />}
                      </div>
                      <p className="text-xs font-medium text-[#0071E3] mt-0.5">
                        {fmt.width} × {fmt.height} px
                      </p>
                      <p className="text-xs text-[#86868B] mt-1">{fmt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: DESIGN STYLE */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Step 4 — Select Visual Direction</h2>
              <p className="text-sm text-[#86868B] mt-1">Define the art direction, surface palette, and typographic contrast.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DESIGN_STYLES.map((st) => {
                const selected = style === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setStyle(st.id)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-[#0071E3] ring-1 ring-[#0071E3] bg-[#0071E3]/[0.03]'
                        : 'border-[#E5E5E7] hover:border-[#86868B]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-full border border-[#E5E5E7]"
                          style={{ backgroundColor: st.bg }}
                        />
                        <span
                          className="w-6 h-6 rounded-full border border-[#E5E5E7] -ml-3"
                          style={{ backgroundColor: st.accent }}
                        />
                      </div>
                      {selected && <CheckCircle2 className="w-4 h-4 text-[#0071E3]" />}
                    </div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">{st.name}</h3>
                    <p className="text-xs text-[#86868B] mt-1">{st.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: DESIGN BRIEF & AI PROMPT ASSISTANT */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Step 5 — Creative Design Brief</h2>
              <p className="text-sm text-[#86868B] mt-1">
                Customize your copy and let the AI Prompt Assistant structure the visual generation prompt.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Main Headline</label>
                  <input
                    type="text"
                    value={brief.headline}
                    onChange={(e) => setBrief({ ...brief, headline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-sm focus:outline-none focus:border-[#0071E3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Supporting Text</label>
                  <textarea
                    rows={2}
                    value={brief.supportingText}
                    onChange={(e) => setBrief({ ...brief, supportingText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-sm focus:outline-none focus:border-[#0071E3]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Call to Action</label>
                    <input
                      type="text"
                      value={brief.cta}
                      onChange={(e) => setBrief({ ...brief, cta: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-sm focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Campaign Tagline</label>
                    <input
                      type="text"
                      value={brief.campaignMessage}
                      onChange={(e) => setBrief({ ...brief, campaignMessage: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-sm focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Additional Art Direction Notes</label>
                  <input
                    type="text"
                    value={brief.additionalInstructions}
                    onChange={(e) => setBrief({ ...brief, additionalInstructions: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-sm focus:outline-none focus:border-[#0071E3]"
                  />
                </div>
              </div>

              {/* AI Prompt Assistant Box */}
              <div className="bg-[#F5F5F7] rounded-2xl p-5 border border-[#E5E5E7] flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3]">
                      <Wand2 className="w-3.5 h-3.5" />
                      AI Visual Prompt Assistant
                    </span>
                    <button
                      onClick={enhancePromptWithAssistant}
                      className="text-xs font-medium text-[#1D1D1F] hover:text-[#0071E3] underline cursor-pointer"
                    >
                      Refresh Prompt
                    </button>
                  </div>
                  <p className="text-xs text-[#86868B] mb-3">
                    Automatically synthesized from your product, category, and aesthetic direction:
                  </p>
                  <textarea
                    rows={6}
                    value={engineeredPrompt}
                    onChange={(e) => setEngineeredPrompt(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-white border border-[#E5E5E7] text-xs text-[#1D1D1F] leading-relaxed focus:outline-none focus:border-[#0071E3]"
                  />
                </div>
                <div className="text-[11px] text-[#86868B] bg-white/80 rounded-xl p-3 border border-[#E5E5E7]">
                  Tip: Click <strong>Next: Generate</strong> to synthesize both AI backdrops (when API is active) and multi-layer editable studio layouts.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: GENERATE & SELECT */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#1D1D1F]">Step 6 — Generate & Select Design</h2>
                <p className="text-sm text-[#86868B] mt-1">
                  Summary: <strong>{category}</strong> • <strong>{product}</strong> •{' '}
                  <strong>{getFormatDimensions(format).name}</strong> • <strong>{style}</strong>
                </p>
              </div>
              <button
                onClick={handleGenerateDesigns}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-60 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Concepts...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{generatedConcepts.length > 0 ? 'Regenerate Designs' : 'Generate Design with AI'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Loading Progress */}
            {isGenerating && (
              <div className="py-12 px-6 bg-[#F5F5F7] rounded-2xl border border-[#E5E5E7] text-center space-y-4">
                <Loader2 className="w-8 h-8 text-[#0071E3] animate-spin mx-auto" />
                <div className="max-w-md mx-auto space-y-2">
                  <p className="text-sm font-semibold text-[#1D1D1F]">
                    Composing Apple TRX Studio layouts & rendering visual assets...
                  </p>
                  <div className="w-full h-2 bg-[#E5E5E7] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0071E3] transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#86868B]">{generationProgress}% complete</p>
                </div>
              </div>
            )}

            {/* Generated Previews */}
            {!isGenerating && generatedConcepts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#F5F5F7] px-4 py-2.5 rounded-xl border border-[#E5E5E7]">
                  <span className="text-xs font-medium text-[#1D1D1F]">
                    Mode:{' '}
                    {generationMode === 'ai-image' ? (
                      <span className="text-[#0071E3] font-semibold">Live AI Image Generation + Editable Typography</span>
                    ) : (
                      <span className="text-[#1D1D1F] font-semibold">
                        Smart Studio Composition (Local Asset Synthesis — Fully Editable)
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-[#86868B]">Select any concept to customize in the Canvas Editor</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {generatedConcepts.map((concept) => (
                    <div
                      key={concept.id}
                      className="bg-white rounded-2xl border border-[#E5E5E7] overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all"
                    >
                      <div className="p-5 bg-[#F5F5F7] flex items-center justify-center h-80 relative">
                        <span
                          className={`absolute top-3 left-3 z-10 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                            concept.isAI
                              ? 'bg-[#0071E3] text-white'
                              : 'bg-white/90 text-[#1D1D1F] border border-[#E5E5E7]'
                          }`}
                        >
                          {concept.isAI ? 'AI Generated Visual' : 'Studio Smart Mockup'}
                        </span>
                        <DesignThumbnail
                          format={concept.format}
                          bgColor={concept.bgColor}
                          elements={concept.elements}
                          className="h-full w-auto rounded-lg shadow-sm"
                        />
                      </div>
                      <div className="p-4 border-t border-[#E5E5E7] space-y-3">
                        <h3 className="text-xs font-semibold text-[#1D1D1F]">{concept.label}</h3>
                        <button
                          onClick={() => handleSelectConcept(concept)}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#1D1D1F] hover:bg-[#0071E3] text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Select & Open in Editor
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isGenerating && generatedConcepts.length === 0 && (
              <div className="py-14 px-6 bg-[#F5F5F7]/60 rounded-2xl border border-dashed border-[#86868B]/40 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-[#0071E3] mx-auto" />
                <h3 className="text-base font-semibold text-[#1D1D1F]">Ready to Generate Your Instagram Concepts</h3>
                <p className="text-xs text-[#86868B] max-w-md mx-auto">
                  Click "Generate Design with AI" above to create three tailored, multi-layer Instagram designs ready for fine-tuning and PNG/JPG export.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step Navigation Footer */}
        <div className="mt-8 pt-5 border-t border-[#E5E5E7] flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E5E7] text-xs font-medium text-[#1D1D1F] disabled:opacity-40 hover:bg-[#F5F5F7] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {step < 6 && (
            <button
              onClick={() => {
                const next = step + 1;
                setStep(next);
                if (next === 6 && generatedConcepts.length === 0) {
                  handleGenerateDesigns();
                }
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-[#0071E3] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>{step === 5 ? 'Generate Designs' : 'Continue'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6 & 13. INTERACTIVE VISUAL DESIGN EDITOR + REAL CANVAS PNG/JPG EXPORT
// ============================================================================

function DesignEditorView({ project, assets, brandSettings, onSaveProject, onBack, showToast }) {
  const [title, setTitle] = useState(project?.name || 'Untitled Design');
  const [format, setFormat] = useState(project?.format || 'portrait');
  const [bgColor, setBgColor] = useState(project?.bgColor || '#FFFFFF');
  const [elements, setElements] = useState(project?.elements || []);
  const [selectedId, setSelectedId] = useState(elements[0]?.id || null);

  // Undo / Redo Stacks
  const [history, setHistory] = useState([{ bgColor: project?.bgColor || '#FFFFFF', elements: project?.elements || [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // UI Panels & Modals
  const [leftTab, setLeftTab] = useState('elements'); // templates, uploads, products, text, elements, backgrounds
  const [zoom, setZoom] = useState(0.42);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('png');
  const [exportQuality, setExportQuality] = useState(0.95);
  const [isExporting, setIsExporting] = useState(false);

  // Dragging state on artboard
  const [dragState, setDragState] = useState(null);
  const artboardRef = useRef(null);
  const fileInputRef = useRef(null);

  const dims = getFormatDimensions(format);
  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  // Responsive initial zoom
  useEffect(() => {
    const updateZoom = () => {
      if (window.innerWidth < 640) setZoom(0.26);
      else if (window.innerWidth < 1280) setZoom(0.35);
      else setZoom(0.42);
    };
    updateZoom();
  }, []);

  const commitState = (nextElements, nextBg = bgColor) => {
    const sliced = history.slice(0, historyIndex + 1);
    const updated = [...sliced, { bgColor: nextBg, elements: JSON.parse(JSON.stringify(nextElements)) }];
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
    setElements(nextElements);
    setBgColor(nextBg);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setElements(JSON.parse(JSON.stringify(history[idx].elements)));
      setBgColor(history[idx].bgColor);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setElements(JSON.parse(JSON.stringify(history[idx].elements)));
      setBgColor(history[idx].bgColor);
    }
  };

  const updateSelectedElement = (patch, recordHistory = true) => {
    if (!selectedId) return;
    const next = elements.map((el) => (el.id === selectedId ? { ...el, ...patch } : el));
    if (recordHistory) commitState(next);
    else setElements(next);
  };

  // Add Elements
  const addTextElement = (preset = 'body') => {
    const isHeading = preset === 'heading';
    const isSignature = preset === 'signature';
    const newEl = {
      id: generateId('txt'),
      type: 'text',
      text: isHeading
        ? 'Designed for Pro.'
        : isSignature
        ? brandSettings.footerSignature
        : 'Experience innovation at The Exchange TRX.',
      x: 120,
      y: Math.round(dims.height / 2 - 60),
      width: dims.width - 240,
      height: isHeading ? 110 : 60,
      fontSize: isHeading ? 76 : isSignature ? 24 : 36,
      fontWeight: isHeading ? '700' : isSignature ? '600' : '400',
      color: isSignature ? '#0071E3' : '#1D1D1F',
      align: 'center',
      opacity: 1,
      letterSpacing: isHeading ? -1.5 : 0,
    };
    const next = [...elements, newEl];
    commitState(next);
    setSelectedId(newEl.id);
  };

  const addShapeElement = (shapeType) => {
    const newEl = {
      id: generateId('shp'),
      type: 'shape',
      shape: shapeType,
      bgColor: shapeType === 'pill' ? '#0071E3' : '#E5E5E7',
      x: Math.round((dims.width - 340) / 2),
      y: Math.round((dims.height - 120) / 2),
      width: shapeType === 'circle' ? 240 : 340,
      height: shapeType === 'circle' ? 240 : shapeType === 'pill' ? 76 : 220,
      opacity: 1,
    };
    const next = [...elements, newEl];
    commitState(next);
    setSelectedId(newEl.id);
  };

  const addImageElement = (src) => {
    const newEl = {
      id: generateId('img'),
      type: 'image',
      src,
      x: Math.round((dims.width - 480) / 2),
      y: Math.round((dims.height - 480) / 2),
      width: 480,
      height: 480,
      opacity: 1,
    };
    const next = [...elements, newEl];
    commitState(next);
    setSelectedId(newEl.id);
  };

  const handleUploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        addImageElement(reader.result);
        showToast('Image added to canvas');
      }
    };
    reader.readAsDataURL(file);
  };

  // Layer Controls
  const deleteSelected = () => {
    if (!selectedId) return;
    const next = elements.filter((el) => el.id !== selectedId);
    commitState(next);
    setSelectedId(next[next.length - 1]?.id || null);
  };

  const duplicateSelected = () => {
    if (!selectedElement) return;
    const copy = {
      ...JSON.parse(JSON.stringify(selectedElement)),
      id: generateId('el'),
      x: selectedElement.x + 36,
      y: selectedElement.y + 36,
    };
    const next = [...elements, copy];
    commitState(next);
    setSelectedId(copy.id);
  };

  const moveLayer = (direction) => {
    if (!selectedId) return;
    const idx = elements.findIndex((el) => el.id === selectedId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= elements.length) return;
    const next = [...elements];
    const [removed] = next.splice(idx, 1);
    next.splice(targetIdx, 0, removed);
    commitState(next);
  };

  // Pointer Drag Handlers on Canvas
  const handlePointerDown = (e, el) => {
    e.stopPropagation();
    setSelectedId(el.id);
    setDragState({
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
    });
  };

  const handlePointerMove = (e) => {
    if (!dragState) return;
    const dx = (e.clientX - dragState.startX) / zoom;
    const dy = (e.clientY - dragState.startY) / zoom;
    setElements((prev) =>
      prev.map((el) =>
        el.id === dragState.id
          ? { ...el, x: Math.round(dragState.origX + dx), y: Math.round(dragState.origY + dy) }
          : el
      )
    );
  };

  const handlePointerUp = () => {
    if (dragState) {
      commitState(elements);
      setDragState(null);
    }
  };

  // Real HTML5 Canvas Export (PNG / JPG at full 1080px resolution)
  const handleExportDownload = async () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = dims.width;
      canvas.height = dims.height;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = bgColor || '#FFFFFF';
      ctx.fillRect(0, 0, dims.width, dims.height);

      // Render each layer sequentially
      for (const el of elements) {
        ctx.save();
        ctx.globalAlpha = el.opacity ?? 1;

        if (el.type === 'shape') {
          ctx.fillStyle = el.bgColor || '#0071E3';
          const radius = el.shape === 'pill' ? el.height / 2 : el.shape === 'circle' ? el.width / 2 : 24;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(el.x, el.y, el.width, el.height, radius);
          } else {
            ctx.rect(el.x, el.y, el.width, el.height);
          }
          ctx.fill();
        } else if (el.type === 'image' && el.src) {
          await new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              // Preserve aspect ratio within bounding box
              const scale = Math.min(el.width / img.width, el.height / img.height);
              const drawW = img.width * scale;
              const drawH = img.height * scale;
              const drawX = el.x + (el.width - drawW) / 2;
              const drawY = el.y + (el.height - drawH) / 2;
              ctx.drawImage(img, drawX, drawY, drawW, drawH);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = el.src;
          });
        } else if (el.type === 'text') {
          ctx.fillStyle = el.color || '#1D1D1F';
          const weight = el.fontWeight || '500';
          const size = el.fontSize || 36;
          ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, Inter, sans-serif`;
          ctx.textBaseline = 'top';
          ctx.textAlign = el.align || 'left';

          const drawX =
            el.align === 'center'
              ? el.x + el.width / 2
              : el.align === 'right'
              ? el.x + el.width
              : el.x;

          // Word wrap text inside el.width
          const words = (el.text || '').split(' ');
          let line = '';
          let currY = el.y;
          const lineHeight = size * 1.2;

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > el.width && n > 0) {
              ctx.fillText(line.trim(), drawX, currY);
              line = words[n] + ' ';
              currY += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line.trim(), drawX, currY);
        }
        ctx.restore();
      }

      const mimeType = exportFormat === 'jpg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mimeType, exportQuality);
      const link = document.createElement('a');
      const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `${safeName}-${dims.width}x${dims.height}.${exportFormat}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportModalOpen(false);
      showToast(`Exported ${dims.width}×${dims.height} ${exportFormat.toUpperCase()} successfully`);
    } catch (err) {
      showToast('Export encountered an issue. Please check image assets.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col h-[calc(100vh-57px)] lg:h-screen overflow-hidden bg-[#F5F5F7]"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* TOP EDITOR TOOLBAR */}
      <div className="bg-white border-b border-[#E5E5E7] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] cursor-pointer"
            title="Back to Projects"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm font-semibold text-[#1D1D1F] bg-transparent border border-transparent hover:border-[#E5E5E7] focus:border-[#0071E3] focus:bg-white rounded-lg px-2.5 py-1 focus:outline-none truncate max-w-[200px] sm:max-w-xs"
          />
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="hidden sm:block text-xs font-medium bg-[#F5F5F7] text-[#1D1D1F] rounded-lg px-2.5 py-1.5 border border-[#E5E5E7] focus:outline-none cursor-pointer"
          >
            {INSTAGRAM_FORMATS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.width}×{f.height})
              </option>
            ))}
          </select>
        </div>

        {/* Center Undo/Redo */}
        <div className="flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-xl border border-[#E5E5E7]">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg hover:bg-white disabled:opacity-35 text-[#1D1D1F] cursor-pointer"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg hover:bg-white disabled:opacity-35 text-[#1D1D1F] cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E5E7] bg-white hover:bg-[#F5F5F7] text-xs font-medium text-[#1D1D1F] cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            onClick={() =>
              onSaveProject({
                ...project,
                name: title,
                format,
                bgColor,
                elements,
                updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              })
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E5E5E7] bg-white hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE BODY: LEFT TOOL PANEL + CENTER ARTBOARD + RIGHT INSPECTOR */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* LEFT TOOL PANEL */}
        <div className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-[#E5E5E7] flex flex-col shrink-0 max-h-48 lg:max-h-none overflow-y-auto">
          {/* Category Tabs */}
          <div className="grid grid-cols-6 lg:grid-cols-3 gap-1 p-2 border-b border-[#E5E5E7] bg-[#F5F5F7]/50">
            {[
              { id: 'text', label: 'Text', icon: Type },
              { id: 'products', label: 'Products', icon: Smartphone },
              { id: 'elements', label: 'Shapes', icon: Square },
              { id: 'uploads', label: 'Uploads', icon: Upload },
              { id: 'backgrounds', label: 'Backdrop', icon: Palette },
              { id: 'templates', label: 'Templates', icon: LayoutTemplate },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setLeftTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                    leftTab === tab.id
                      ? 'bg-white text-[#0071E3] shadow-xs font-semibold'
                      : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {leftTab === 'text' && (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Typography Presets</p>
                <button
                  onClick={() => addTextElement('heading')}
                  className="w-full p-3.5 text-left rounded-xl border border-[#E5E5E7] hover:border-[#0071E3] bg-[#F5F5F7]/50 cursor-pointer"
                >
                  <div className="text-lg font-bold text-[#1D1D1F]">Add Display Headline</div>
                  <div className="text-[11px] text-[#86868B]">76px Bold • Tight tracking</div>
                </button>
                <button
                  onClick={() => addTextElement('body')}
                  className="w-full p-3.5 text-left rounded-xl border border-[#E5E5E7] hover:border-[#0071E3] bg-[#F5F5F7]/50 cursor-pointer"
                >
                  <div className="text-sm font-medium text-[#1D1D1F]">Add Supporting Copy</div>
                  <div className="text-[11px] text-[#86868B]">36px Regular • Editorial body</div>
                </button>
                <button
                  onClick={() => addTextElement('signature')}
                  className="w-full p-3.5 text-left rounded-xl border border-[#E5E5E7] hover:border-[#0071E3] bg-[#F5F5F7]/50 cursor-pointer"
                >
                  <div className="text-xs font-semibold text-[#0071E3]">{brandSettings.footerSignature}</div>
                  <div className="text-[11px] text-[#86868B]">24px Brand Signature</div>
                </button>
              </div>
            )}

            {leftTab === 'products' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Apple TRX Asset Library</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => addImageElement(asset.url)}
                      className="p-2.5 rounded-xl border border-[#E5E5E7] hover:border-[#0071E3] bg-[#F5F5F7]/60 text-left cursor-pointer group"
                    >
                      <div className="aspect-square flex items-center justify-center p-1.5">
                        <img src={asset.url} alt={asset.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="text-[11px] font-medium text-[#1D1D1F] truncate mt-1">{asset.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {leftTab === 'elements' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">UI & Graphic Shapes</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => addShapeElement('pill')}
                    className="p-3 rounded-xl border border-[#E5E5E7] hover:border-[#0071E3] flex flex-col items-center gap-1.5 cursor-pointer"
                  >
                    <div className="w-10 h-5 rounded-full bg-[#0071E3]" />
                    <span className="text-[11px] font-medium">CTA Pill</span>
                  </button>
                  <button
                    onClick={() => addShapeElement('rect')}
                    className="p-3 rounded-xl border border-[#E5E5E7] hover:border-[#0071E3] flex flex-col items-center gap-1.5 cursor-pointer"
                  >
                    <div className="w-8 h-6 rounded-md bg-[#E5E5E7]" />
                    <span className="text-[11px] font-medium">Card</span>
                  </button>
                  <button
                    onClick={() => addShapeElement('circle')}
                    className="p-3 rounded-xl border border-[#E5E5E7] hover:border-[#0071E3] flex flex-col items-center gap-1.5 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#1D1D1F]" />
                    <span className="text-[11px] font-medium">Badge</span>
                  </button>
                </div>
              </div>
            )}

            {leftTab === 'uploads' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Upload Custom Media</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-[#E5E5E7] hover:border-[#0071E3] text-center space-y-1.5 cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-[#0071E3] mx-auto" />
                  <div className="text-xs font-semibold text-[#1D1D1F]">Click to Upload PNG / JPG</div>
                  <div className="text-[11px] text-[#86868B]">Places directly onto artboard</div>
                </button>
              </div>
            )}

            {leftTab === 'backgrounds' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Canvas Surface</p>
                <div className="grid grid-cols-4 gap-2">
                  {['#FFFFFF', '#F5F5F7', '#FAF8F5', '#E8E8ED', '#1D1D1F', '#111113', '#0071E3', '#F0F4F8'].map(
                    (hex) => (
                      <button
                        key={hex}
                        onClick={() => commitState(elements, hex)}
                        className={`h-10 rounded-xl border cursor-pointer ${
                          bgColor === hex ? 'border-[#0071E3] ring-2 ring-[#0071E3]/30' : 'border-[#E5E5E7]'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    )
                  )}
                </div>
                <div className="pt-2">
                  <label className="text-xs text-[#86868B] block mb-1">Custom Hex Color</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => commitState(elements, e.target.value)}
                    className="w-full h-9 rounded-lg cursor-pointer border border-[#E5E5E7]"
                  />
                </div>
              </div>
            )}

            {leftTab === 'templates' && (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Switch Layout</p>
                {INITIAL_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setFormat(tpl.format);
                      commitState(JSON.parse(JSON.stringify(tpl.elements)), tpl.bgColor);
                      showToast(`Applied "${tpl.name}"`);
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#E5E5E7] hover:border-[#0071E3] flex items-center gap-3 text-left cursor-pointer"
                  >
                    <div className="w-10 h-12 shrink-0">
                      <DesignThumbnail format={tpl.format} bgColor={tpl.bgColor} elements={tpl.elements} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#1D1D1F] truncate">{tpl.name}</div>
                      <div className="text-[10px] text-[#86868B]">{tpl.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTER ARTBOARD WORKSPACE */}
        <div
          className="flex-1 bg-[#EAEAEF] relative overflow-auto flex items-center justify-center p-8 select-none"
          onClick={() => setSelectedId(null)}
        >
          {/* Scaled Instagram Artboard */}
          <div
            ref={artboardRef}
            onClick={(e) => e.stopPropagation()}
            className="relative shadow-2xl transition-shadow"
            style={{
              width: dims.width * zoom,
              height: dims.height * zoom,
              backgroundColor: bgColor,
            }}
          >
            <div
              className="origin-top-left relative"
              style={{
                width: dims.width,
                height: dims.height,
                transform: `scale(${zoom})`,
              }}
            >
              {elements.map((el) => {
                const isSelected = el.id === selectedId;
                return (
                  <div
                    key={el.id}
                    onPointerDown={(e) => handlePointerDown(e, el)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(el.id);
                    }}
                    style={{
                      position: 'absolute',
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      opacity: el.opacity ?? 1,
                      cursor: 'move',
                    }}
                    className={`group ${
                      isSelected ? 'ring-4 ring-[#0071E3]' : 'hover:ring-2 hover:ring-[#0071E3]/50'
                    }`}
                  >
                    {el.type === 'shape' && (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: el.bgColor || '#0071E3',
                          borderRadius:
                            el.shape === 'pill' ? el.height / 2 : el.shape === 'circle' ? '9999px' : '24px',
                        }}
                      />
                    )}

                    {el.type === 'image' && (
                      <img
                        src={el.src}
                        alt=""
                        draggable={false}
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    )}

                    {el.type === 'text' && (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          fontSize: `${el.fontSize}px`,
                          fontWeight: el.fontWeight || '500',
                          color: el.color || '#1D1D1F',
                          textAlign: el.align || 'left',
                          letterSpacing: `${el.letterSpacing || 0}px`,
                          lineHeight: 1.18,
                          fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
                          wordWrap: 'break-word',
                        }}
                      >
                        {el.text}
                      </div>
                    )}

                    {/* Corner selection handles */}
                    {isSelected && (
                      <>
                        <span className="w-5 h-5 bg-white border-4 border-[#0071E3] rounded-full absolute -top-2.5 -left-2.5" />
                        <span className="w-5 h-5 bg-white border-4 border-[#0071E3] rounded-full absolute -top-2.5 -right-2.5" />
                        <span className="w-5 h-5 bg-white border-4 border-[#0071E3] rounded-full absolute -bottom-2.5 -left-2.5" />
                        <span className="w-5 h-5 bg-white border-4 border-[#0071E3] rounded-full absolute -bottom-2.5 -right-2.5" />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating Zoom Controls */}
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-80 bg-white/95 backdrop-blur-xs border border-[#E5E5E7] rounded-full px-3 py-1.5 shadow-md flex items-center gap-2 z-10">
            <button
              onClick={() => setZoom((z) => Math.max(0.2, +(z - 0.05).toFixed(2)))}
              className="p-1 text-[#1D1D1F] hover:text-[#0071E3] cursor-pointer"
              title="Zoom Out"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold text-[#1D1D1F] w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(0.85, +(z + 0.05).toFixed(2)))}
              className="p-1 text-[#1D1D1F] hover:text-[#0071E3] cursor-pointer"
              title="Zoom In"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT INSPECTOR PANEL */}
        <div className="w-full lg:w-72 bg-white border-t lg:border-t-0 lg:border-l border-[#E5E5E7] p-4 overflow-y-auto shrink-0 space-y-5 max-h-64 lg:max-h-none">
          {selectedElement ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E7]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1D1D1F]">
                  {selectedElement.type} Properties
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={duplicateSelected}
                    className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#1D1D1F] cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text Content Editor */}
              {selectedElement.type === 'text' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#86868B] block mb-1">Text Content</label>
                    <textarea
                      rows={3}
                      value={selectedElement.text}
                      onChange={(e) => updateSelectedElement({ text: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E5E5E7] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[#86868B] block mb-1">Size (px)</label>
                      <input
                        type="number"
                        value={selectedElement.fontSize}
                        onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) || 24 })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E5E7] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#86868B] block mb-1">Weight</label>
                      <select
                        value={selectedElement.fontWeight}
                        onChange={(e) => updateSelectedElement({ fontWeight: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg border border-[#E5E5E7] text-xs bg-white"
                      >
                        <option value="400">Regular</option>
                        <option value="500">Medium</option>
                        <option value="600">Semibold</option>
                        <option value="700">Bold</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[#86868B] block mb-1">Alignment</label>
                      <div className="flex items-center border border-[#E5E5E7] rounded-lg overflow-hidden">
                        {['left', 'center', 'right'].map((al) => (
                          <button
                            key={al}
                            onClick={() => updateSelectedElement({ align: al })}
                            className={`p-1.5 cursor-pointer ${
                              selectedElement.align === al ? 'bg-[#1D1D1F] text-white' : 'bg-white text-[#1D1D1F]'
                            }`}
                          >
                            {al === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                            {al === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                            {al === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#86868B] block mb-1">Text Color</label>
                      <input
                        type="color"
                        value={selectedElement.color || '#1D1D1F'}
                        onChange={(e) => updateSelectedElement({ color: e.target.value })}
                        className="w-16 h-8 rounded-lg border border-[#E5E5E7] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Shape Fill Color */}
              {selectedElement.type === 'shape' && (
                <div>
                  <label className="text-[11px] font-semibold text-[#86868B] block mb-1">Fill Color</label>
                  <input
                    type="color"
                    value={selectedElement.bgColor || '#0071E3'}
                    onChange={(e) => updateSelectedElement({ bgColor: e.target.value })}
                    className="w-full h-9 rounded-lg border border-[#E5E5E7] cursor-pointer"
                  />
                </div>
              )}

              {/* Position & Dimensions */}
              <div className="space-y-2 pt-2 border-t border-[#E5E5E7]">
                <label className="text-[11px] font-semibold text-[#86868B] block">Position & Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#86868B]">X</span>
                    <input
                      type="number"
                      value={selectedElement.x}
                      onChange={(e) => updateSelectedElement({ x: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-[#E5E5E7] text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#86868B]">Y</span>
                    <input
                      type="number"
                      value={selectedElement.y}
                      onChange={(e) => updateSelectedElement({ y: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-[#E5E5E7] text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#86868B]">Width</span>
                    <input
                      type="number"
                      value={selectedElement.width}
                      onChange={(e) => updateSelectedElement({ width: Math.max(40, Number(e.target.value)) })}
                      className="w-full px-2 py-1 rounded-lg border border-[#E5E5E7] text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#86868B]">Height</span>
                    <input
                      type="number"
                      value={selectedElement.height}
                      onChange={(e) => updateSelectedElement({ height: Math.max(20, Number(e.target.value)) })}
                      className="w-full px-2 py-1 rounded-lg border border-[#E5E5E7] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Opacity & Layer Order */}
              <div className="space-y-3 pt-2 border-t border-[#E5E5E7]">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-[#86868B] mb-1">
                    <span>Opacity</span>
                    <span>{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={selectedElement.opacity ?? 1}
                    onChange={(e) => updateSelectedElement({ opacity: Number(e.target.value) })}
                    className="w-full accent-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#86868B] block mb-1.5">Layer Arrangement</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => moveLayer('up')}
                      className="py-1.5 px-2 rounded-lg border border-[#E5E5E7] hover:bg-[#F5F5F7] text-xs font-medium flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>Forward</span>
                    </button>
                    <button
                      onClick={() => moveLayer('down')}
                      className="py-1.5 px-2 rounded-lg border border-[#E5E5E7] hover:bg-[#F5F5F7] text-xs font-medium flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>Backward</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">Layers ({elements.length})</div>
              <p className="text-xs text-[#86868B]">Click any object on the artboard or select a layer below to customize.</p>
              <div className="space-y-1.5">
                {[...elements].reverse().map((el) => (
                  <button
                    key={el.id}
                    onClick={() => setSelectedId(el.id)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E5E7] hover:border-[#0071E3] text-left flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span className="truncate font-medium text-[#1D1D1F]">
                      {el.type === 'text' ? el.text : `${el.type.toUpperCase()} Layer`}
                    </span>
                    <span className="text-[10px] text-[#86868B] uppercase">{el.type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW MODAL (Instagram Feed Simulation) */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E5E5E7]">
            <div className="px-5 py-3.5 border-b border-[#E5E5E7] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#1D1D1F] text-white text-[10px] font-bold flex items-center justify-center">
                  TRX
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1D1D1F]">appletheexchangetrx</div>
                  <div className="text-[10px] text-[#86868B]">The Exchange TRX, Kuala Lumpur</div>
                </div>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F5F5F7] flex items-center justify-center max-h-[65vh] overflow-hidden p-4">
              <DesignThumbnail
                format={format}
                bgColor={bgColor}
                elements={elements}
                className="max-h-[58vh] w-auto rounded-xl shadow-md"
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <span className="text-xs text-[#86868B]">
                Actual Output: {dims.width} × {dims.height} px
              </span>
              <button
                onClick={() => {
                  setPreviewModalOpen(false);
                  setExportModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#0071E3] text-white text-xs font-semibold cursor-pointer"
              >
                Proceed to Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#E5E5E7]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#1D1D1F]">Export Instagram Design</h3>
                <p className="text-xs text-[#86868B]">High-resolution flattened canvas download</p>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Dimensions</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-xs font-medium bg-[#F5F5F7]"
                >
                  {INSTAGRAM_FORMATS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.width} × {f.height} px
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">File Format</label>
                <div className="grid grid-cols-2 gap-3">
                  {['png', 'jpg'].map((ext) => (
                    <button
                      key={ext}
                      onClick={() => setExportFormat(ext)}
                      className={`py-2.5 rounded-xl border text-xs font-semibold uppercase cursor-pointer ${
                        exportFormat === ext
                          ? 'border-[#0071E3] bg-[#0071E3]/10 text-[#0071E3]'
                          : 'border-[#E5E5E7] text-[#1D1D1F]'
                      }`}
                    >
                      {ext} {ext === 'png' ? '(Lossless)' : '(Compressed)'}
                    </button>
                  ))}
                </div>
              </div>

              {exportFormat === 'jpg' && (
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>JPEG Quality</span>
                    <span>{Math.round(exportQuality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1"
                    step="0.05"
                    value={exportQuality}
                    onChange={(e) => setExportQuality(Number(e.target.value))}
                    className="w-full accent-[#0071E3]"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E5E5E7] text-xs font-medium text-[#1D1D1F] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExportDownload}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Rendering...' : `Download ${exportFormat.toUpperCase()}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 7. TEMPLATE LIBRARY VIEW
// ============================================================================

function TemplateLibraryView({ templates, onUseTemplate }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Product Launch', 'Product Feature', 'Product Education', 'Promotional', 'Lifestyle', 'Store Experience'];

  const filtered = templates.filter((tpl) => {
    const matchCat = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchFmt = selectedFormat === 'All' || tpl.format === selectedFormat;
    const matchSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchFmt && matchSearch;
  });

  return (
    <div className="max-w-7xl w-full mx-auto px-5 sm:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Template Library</h1>
          <p className="text-sm text-[#86868B] mt-1">
            Editorial Instagram compositions engineered for Apple The Exchange TRX campaigns.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E5E5E7] text-xs focus:outline-none focus:border-[#0071E3]"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1D1D1F] text-white'
                  : 'bg-white border border-[#E5E5E7] text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E5E7] text-xs font-medium text-[#1D1D1F]"
        >
          <option value="All">All Formats</option>
          <option value="portrait">Feed Portrait (4:5)</option>
          <option value="square">Feed Square (1:1)</option>
          <option value="story">Story (9:16)</option>
        </select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tpl) => {
          const dims = getFormatDimensions(tpl.format);
          return (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-[#E5E5E7] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="p-6 bg-[#F5F5F7]/70 flex items-center justify-center h-72">
                <DesignThumbnail
                  format={tpl.format}
                  bgColor={tpl.bgColor}
                  elements={tpl.elements}
                  className="h-full w-auto rounded-lg shadow-sm"
                />
              </div>
              <div className="p-4 border-t border-[#E5E5E7] flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#0071E3]">{tpl.category}</span>
                    <span className="text-[11px] text-[#86868B]">• {dims.name}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] mt-0.5">{tpl.name}</h3>
                </div>
                <button
                  onClick={() => onUseTemplate(tpl)}
                  className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  Use Template
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 8. ASSET LIBRARY VIEW
// ============================================================================

function AssetLibraryView({ assets, setAssets, onUseAssetInNewDesign, showToast }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadCategory, setUploadCategory] = useState('iPhone');
  const [previewAsset, setPreviewAsset] = useState(null);
  const uploadRef = useRef(null);

  const assetCategories = ['All', 'iPhone', 'Mac', 'iPad', 'Apple Watch', 'AirPods', 'Store Photography', 'Brand Assets'];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const newAsset = {
          id: generateId('asset'),
          name: file.name.replace(/\.[^/.]+$/, ''),
          category: uploadCategory,
          url: reader.result,
          date: new Date().toISOString().slice(0, 10),
          type: 'Uploaded Media',
        };
        setAssets((prev) => [newAsset, ...prev]);
        showToast(`Uploaded "${newAsset.name}" to ${uploadCategory}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAsset = (id) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    showToast('Asset removed from library');
  };

  const filtered = assets.filter((a) => {
    const matchCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl w-full mx-auto px-5 sm:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Asset Library</h1>
          <p className="text-sm text-[#86868B] mt-1">
            Centralized repository for product photography, vector hardware renders, and TRX store visuals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-[#E5E5E7] text-xs font-medium text-[#1D1D1F]"
          >
            {assetCategories.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input ref={uploadRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <button
            onClick={() => uploadRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Asset</span>
          </button>
        </div>
      </div>

      {/* Category Filter + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {assetCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1D1D1F] text-white'
                  : 'bg-white border border-[#E5E5E7] text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E5E5E7] text-xs focus:outline-none focus:border-[#0071E3]"
          />
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-2xl border border-[#E5E5E7] overflow-hidden flex flex-col justify-between group"
          >
            <div
              onClick={() => setPreviewAsset(asset)}
              className="aspect-square bg-[#F5F5F7] p-6 flex items-center justify-center relative cursor-pointer"
            >
              <img
                src={asset.url}
                alt={asset.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
              />
              <span className="absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/90 text-[#1D1D1F] border border-[#E5E5E7]">
                {asset.category}
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-[#1D1D1F] truncate">{asset.name}</h3>
                <p className="text-[11px] text-[#86868B]">
                  {asset.type} • Added {asset.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUseAssetInNewDesign(asset)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#1D1D1F] hover:bg-[#0071E3] text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Use in Design
                </button>
                <button
                  onClick={() => handleDeleteAsset(asset.id)}
                  className="p-2 rounded-xl border border-[#E5E5E7] hover:bg-red-50 text-[#86868B] hover:text-red-600 cursor-pointer"
                  title="Delete Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#1D1D1F]">{previewAsset.name}</h3>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-square bg-[#F5F5F7] rounded-2xl p-8 flex items-center justify-center">
              <img src={previewAsset.url} alt={previewAsset.name} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#86868B]">Category: {previewAsset.category}</span>
              <button
                onClick={() => {
                  onUseAssetInNewDesign(previewAsset);
                  setPreviewAsset(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#0071E3] text-white text-xs font-semibold cursor-pointer"
              >
                Create Design with Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 9. AI CAPTION GENERATOR VIEW
// ============================================================================

function AICaptionGeneratorView({ brandSettings, showToast }) {
  const [product, setProduct] = useState('iPhone');
  const [category, setCategory] = useState('Product Highlight');
  const [objective, setObjective] = useState('Drive in-store hands-on visits at The Exchange TRX');
  const [tone, setTone] = useState('Premium');
  const [language, setLanguage] = useState('English');
  const [isGenerating, setIsGenerating] = useState(false);

  const [result, setResult] = useState({
    standard:
      'Precision meets everyday brilliance. Experience the latest iPhone lineup up close at Apple The Exchange TRX — where our Specialists are ready to help you explore every camera, display, and performance breakthrough.',
    short: 'Titanium strength. Pro camera mastery. Experience iPhone today at Apple The Exchange TRX.',
    long: 'Every detail matters when craft meets innovation. Step into Apple The Exchange TRX in the heart of Kuala Lumpur to test the pro camera system, compare finishes in natural light, and personalize your setup with one-on-one guidance from our team. Whether upgrading or switching, your next chapter starts here.',
    cta: 'Book a personal shopping session or visit us at Level G, The Exchange TRX.',
    hashtags: '#AppleTheExchangeTRX #ShotOniPhone #KualaLumpur #AppleDesign #TechLifestyle #TRXKL',
    source: 'Local Studio Demo',
  });

  const handleGenerateCaptions = async () => {
    setIsGenerating(true);
    try {
      const apiKey = '';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      const prompt = `Write Instagram social media copy for "${brandSettings.storeName}" in Kuala Lumpur.
Product: ${product}
Content Category: ${category}
Campaign Objective: ${objective}
Tone: ${tone}
Language: ${language}

Return ONLY valid JSON with keys: "standard", "short", "long", "cta", "hashtags". Keep copy refined, Apple-inspired, editorial, and free of excessive emojis.`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (raw) {
          const parsed = JSON.parse(raw);
          setResult({ ...parsed, source: 'Gemini AI Generated' });
          setIsGenerating(false);
          showToast('Generated fresh captions with Gemini AI');
          return;
        }
      }
    } catch {
      // Fallback to localized templates
    }

    // Localized Smart Pattern Fallback
    const localized = {
      English: {
        standard: `Designed to elevate every workflow. Discover the new ${product} at ${brandSettings.storeName} — ${objective.toLowerCase()}.`,
        short: `${product}. Refined for what comes next. Available now at ${brandSettings.storeName}.`,
        long: `From effortless performance to iconic industrial design, ${product} brings extraordinary capability to your everyday routine. Visit ${brandSettings.storeName} in Kuala Lumpur for hands-on sessions, Today at Apple workshops, and personalized setup support.`,
        cta: `Visit ${brandSettings.storeName} or reserve your session online.`,
        hashtags: `#AppleTheExchangeTRX #${product.replace(/\s+/g, '')} #KualaLumpur #Creativity #DesignStudio`,
      },
      'Bahasa Malaysia': {
        standard: `Direka untuk menyerlahkan setiap detik kreativiti anda. Terokai kehebatan ${product} baharu di ${brandSettings.storeName}.`,
        short: `${product}. Prestasi luar biasa, rekaan ikonik. Kunjungi ${brandSettings.storeName} hari ini.`,
        long: `Alami inovasi terkini secara dekat di ${brandSettings.storeName}, Kuala Lumpur. Pasukan Pakar kami sedia membantu anda mencuba ciri-ciri pro ${product} dan mendapatkan sesi bimbingan peribadi yang sesuai dengan gaya hidup anda.`,
        cta: `Singgah ke ${brandSettings.storeName} atau tempah sesi anda sekarang.`,
        hashtags: `#AppleTheExchangeTRX #${product.replace(/\s+/g, '')} #KualaLumpur #Malaysia #GayaHidup`,
      },
      'Bahasa Indonesia': {
        standard: `Dirancang untuk menyempurnakan setiap langkah kreatif Anda. Rasakan langsung keunggulan ${product} terbaru di ${brandSettings.storeName}.`,
        short: `${product}. Performa pro dalam desain ikonik. Kunjungi ${brandSettings.storeName}.`,
        long: `Temukan perpaduan sempurna antara kekuatan dan estetika minimalis bersama ${product}. Kunjungi ${brandSettings.storeName} di Kuala Lumpur untuk mencoba langsung fitur unggulan serta mengikuti sesi kreatif bersama tim kami.`,
        cta: `Kunjungi ${brandSettings.storeName} atau jadwalkan sesi Anda hari ini.`,
        hashtags: `#AppleTheExchangeTRX #${product.replace(/\s+/g, '')} #KualaLumpur #Desain #Inovasi`,
      },
    };

    const pack = localized[language] || localized.English;
    setResult({ ...pack, source: 'Local Pattern Demo' });
    setIsGenerating(false);
    showToast(`Generated ${language} captions (${tone} tone)`);
  };

  const copyText = (text, label) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast(`Copied ${label} to clipboard`);
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">AI Caption Generator</h1>
        <p className="text-sm text-[#86868B] mt-1">
          Craft editorial Instagram captions tailored to {brandSettings.storeName} in English, Bahasa Malaysia, or Bahasa Indonesia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Controls */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E5E5E7] p-6 space-y-4 h-fit">
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Product</label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-sm bg-white"
            >
              {PRODUCT_CATEGORIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Content Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-sm bg-white"
            >
              {CONTENT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Campaign Objective</label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Tone of Voice</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E7] text-xs font-medium bg-white"
              >
                {['Premium', 'Friendly', 'Informative', 'Professional', 'Engaging'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E7] text-xs font-medium bg-white"
              >
                {['English', 'Bahasa Malaysia', 'Bahasa Indonesia'].map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateCaptions}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isGenerating ? 'Writing Copy...' : 'Generate Captions'}</span>
          </button>
        </div>

        {/* Output Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Generated Copy Variants</span>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white border border-[#E5E5E7] text-[#1D1D1F]">
              {result.source}
            </span>
          </div>

          {[
            { title: 'Standard Instagram Caption', text: result.standard },
            { title: 'Short Punchy Caption (Reels / Story)', text: result.short },
            { title: 'Long Editorial Storytelling Caption', text: result.long },
            { title: 'Call to Action (CTA)', text: result.cta },
            { title: 'Recommended Hashtags', text: result.hashtags },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-[#E5E5E7] p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#0071E3]">{item.title}</h3>
                <button
                  onClick={() => copyText(item.text, item.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F5F5F7] hover:bg-[#E5E5E7] text-xs font-medium text-[#1D1D1F] cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-sm text-[#1D1D1F] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 10. MY PROJECTS VIEW
// ============================================================================

function MyProjectsView({ projects, setProjects, onOpenProject, onCreateNew, showToast }) {
  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameText, setRenameText] = useState('');

  const statuses = ['All', 'Draft', 'In Progress', 'Pending Approval', 'Approved', 'Published'];

  const filtered = projects.filter((p) => {
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleDuplicate = (proj) => {
    const copy = {
      ...JSON.parse(JSON.stringify(proj)),
      id: generateId('proj'),
      name: `${proj.name} (Copy)`,
      status: 'Draft',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setProjects((prev) => [copy, ...prev]);
    showToast('Project duplicated');
  };

  const handleDelete = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast('Project deleted');
  };

  const handleStatusChange = (id, newStatus) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
    showToast(`Status updated to ${newStatus}`);
  };

  const commitRename = (id) => {
    if (renameText.trim()) {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: renameText.trim() } : p)));
      showToast('Project renamed');
    }
    setRenamingId(null);
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-5 sm:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">My Projects</h1>
          <p className="text-sm text-[#86868B] mt-1">Manage drafts, approvals, and published Instagram designs.</p>
        </div>

        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#1D1D1F] text-white'
                  : 'bg-white border border-[#E5E5E7] text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#E5E5E7] text-xs"
            />
          </div>
          <div className="flex items-center bg-white border border-[#E5E5E7] rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'grid' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'text-[#86868B]'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'list' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'text-[#86868B]'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-[#E5E5E7] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div
                onClick={() => onOpenProject(proj)}
                className="p-5 bg-[#F5F5F7]/70 h-60 flex items-center justify-center cursor-pointer"
              >
                <DesignThumbnail
                  format={proj.format}
                  bgColor={proj.bgColor}
                  elements={proj.elements}
                  className="h-full w-auto rounded-lg shadow-sm hover:scale-[1.02] transition-transform"
                />
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <select
                      value={proj.status}
                      onChange={(e) => handleStatusChange(proj.id, e.target.value)}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5E7] cursor-pointer"
                    >
                      {statuses.filter((s) => s !== 'All').map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-[#86868B] uppercase">{proj.format}</span>
                  </div>

                  {renamingId === proj.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={renameText}
                        onChange={(e) => setRenameText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && commitRename(proj.id)}
                        autoFocus
                        className="w-full px-2 py-1 text-xs border border-[#0071E3] rounded-lg"
                      />
                      <button onClick={() => commitRename(proj.id)} className="p-1 text-[#0071E3]">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h3
                      onClick={() => onOpenProject(proj)}
                      className="text-sm font-semibold text-[#1D1D1F] truncate cursor-pointer hover:text-[#0071E3]"
                    >
                      {proj.name}
                    </h3>
                  )}
                  <p className="text-[11px] text-[#86868B] mt-0.5">Updated {proj.updatedAt}</p>
                </div>

                <div className="pt-2 border-t border-[#E5E5E7] flex items-center justify-between gap-1">
                  <button
                    onClick={() => onOpenProject(proj)}
                    className="px-3 py-1.5 rounded-lg bg-[#1D1D1F] hover:bg-[#0071E3] text-white text-xs font-medium cursor-pointer"
                  >
                    Open
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setRenamingId(proj.id);
                        setRenameText(proj.name);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] cursor-pointer"
                      title="Rename"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(proj)}
                      className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#86868B] hover:text-red-600 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white rounded-2xl border border-[#E5E5E7] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E7] text-[11px] font-semibold text-[#86868B] uppercase">
                <th className="py-3.5 px-4">Design</th>
                <th className="py-3.5 px-4">Format</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Modified</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E7] text-xs">
              {filtered.map((proj) => (
                <tr key={proj.id} className="hover:bg-[#F5F5F7]/50">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="w-10 h-12 shrink-0">
                      <DesignThumbnail format={proj.format} bgColor={proj.bgColor} elements={proj.elements} />
                    </div>
                    <span className="font-semibold text-[#1D1D1F]">{proj.name}</span>
                  </td>
                  <td className="py-3 px-4 uppercase text-[#86868B]">{proj.format}</td>
                  <td className="py-3 px-4">
                    <select
                      value={proj.status}
                      onChange={(e) => handleStatusChange(proj.id, e.target.value)}
                      className="px-2.5 py-1 rounded-full bg-[#F5F5F7] border border-[#E5E5E7] font-medium"
                    >
                      {statuses.filter((s) => s !== 'All').map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-[#86868B]">{proj.updatedAt}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => onOpenProject(proj)}
                      className="px-3 py-1.5 rounded-lg bg-[#1D1D1F] text-white font-medium cursor-pointer"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleDuplicate(proj)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E5E5E7] hover:bg-[#F5F5F7] cursor-pointer"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E5E5E7] text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 11. CAMPAIGN PLANNER VIEW
// ============================================================================

function CampaignPlannerView({ campaigns, setCampaigns, projects, onOpenProject, showToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: '2026-11-22',
    type: 'Product Highlight',
    status: 'Scheduled',
    assignee: 'Aisha Rahman',
    projectId: projects[0]?.id || '',
  });

  const handleAddCampaign = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const newCamp = {
      id: generateId('camp'),
      ...form,
    };
    setCampaigns((prev) => [...prev, newCamp]);
    setModalOpen(false);
    setForm({ ...form, title: '' });
    showToast('Campaign scheduled on calendar');
  };

  // November 2026 Calendar Days (Nov 1, 2026 is Sunday)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="max-w-7xl w-full mx-auto px-5 sm:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Campaign Planner</h1>
          <p className="text-sm text-[#86868B] mt-1">
            November 2026 • Editorial publishing calendar for Apple The Exchange TRX.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Campaign</span>
        </button>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="bg-white rounded-3xl border border-[#E5E5E7] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#E5E5E7] bg-[#F5F5F7]/70 text-center py-2.5 text-[11px] font-semibold text-[#86868B] uppercase">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 divide-x divide-y divide-[#E5E5E7]">
          {daysInMonth.map((day) => {
            const dateStr = `2026-11-${String(day).padStart(2, '0')}`;
            const dayCampaigns = campaigns.filter((c) => c.date === dateStr);
            const isToday = day === 16;

            return (
              <div key={day} className="min-h-[120px] p-2.5 flex flex-col justify-between bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isToday ? 'bg-[#0071E3] text-white' : 'text-[#1D1D1F]'
                    }`}
                  >
                    {day}
                  </span>
                  <button
                    onClick={() => {
                      setForm((f) => ({ ...f, date: dateStr }));
                      setModalOpen(true);
                    }}
                    className="text-[#86868B] hover:text-[#0071E3] p-0.5 cursor-pointer"
                    title="Add on this date"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {dayCampaigns.map((camp) => {
                    const linkedProj = projects.find((p) => p.id === camp.projectId);
                    return (
                      <div
                        key={camp.id}
                        onClick={() => linkedProj && onOpenProject(linkedProj)}
                        className="p-2 rounded-xl bg-[#F5F5F7] hover:bg-[#0071E3]/10 border border-[#E5E5E7] cursor-pointer transition-colors"
                      >
                        <div className="text-[10px] font-semibold text-[#0071E3] truncate">{camp.status}</div>
                        <div className="text-[11px] font-semibold text-[#1D1D1F] line-clamp-2 leading-snug">
                          {camp.title}
                        </div>
                        <div className="text-[10px] text-[#86868B] mt-0.5 truncate">{camp.assignee}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Campaign Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddCampaign}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E5E5E7]"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">Schedule Content</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Campaign Title</label>
              <input
                type="text"
                required
                placeholder="e.g. AirPods Max Holiday Story"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E5E5E7] text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Publish Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E5E7] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E5E7] text-xs bg-white"
                >
                  <option value="Planned">Planned</option>
                  <option value="Drafting">Drafting</option>
                  <option value="In Review">In Review</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Content Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E5E7] text-xs bg-white"
                >
                  {CONTENT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Assigned Creator</label>
                <input
                  type="text"
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E5E7] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Connect Design Project</label>
              <select
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E5E7] text-xs bg-white"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E5E7] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0071E3] text-white text-xs font-semibold cursor-pointer"
              >
                Save to Calendar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 12. BRAND SETTINGS VIEW
// ============================================================================

function BrandSettingsView({ brandSettings, setBrandSettings, showToast }) {
  const [form, setForm] = useState(brandSettings);
  const logoInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm({ ...form, logoUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setBrandSettings(form);
    showToast('Brand configuration updated across studio');
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-5 sm:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Brand Settings</h1>
        <p className="text-sm text-[#86868B] mt-1">
          Centralized identity defaults for Apple The Exchange TRX internal creative concept workflows.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#E5E5E7] p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Workspace Brand Name</label>
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Store Location Name</label>
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Default Footer Signature</label>
            <input
              type="text"
              value={form.footerSignature}
              onChange={(e) => setForm({ ...form, footerSignature: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Default Instagram Format</label>
            <select
              value={form.defaultFormat}
              onChange={(e) => setForm({ ...form, defaultFormat: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E7] text-sm bg-white"
            >
              {INSTAGRAM_FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.width}×{f.height})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Brand Palette */}
        <div className="pt-4 border-t border-[#E5E5E7]">
          <label className="block text-xs font-semibold text-[#1D1D1F] mb-3">Core Surface & Accent Palette</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: 'primaryColor', label: 'Primary Ink' },
              { key: 'secondaryColor', label: 'Canvas Surface' },
              { key: 'accentColor', label: 'Interactive Accent' },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E5E7]">
                <input
                  type="color"
                  value={form[item.key]}
                  onChange={(e) => setForm({ ...form, [item.key]: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-[#E5E5E7] cursor-pointer"
                />
                <div>
                  <div className="text-xs font-semibold text-[#1D1D1F]">{item.label}</div>
                  <div className="text-[11px] text-[#86868B] uppercase">{form[item.key]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workspace Logo Upload */}
        <div className="pt-4 border-t border-[#E5E5E7] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="Brand Logo" className="w-12 h-12 rounded-xl object-cover border border-[#E5E5E7]" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center font-semibold text-xs">
                TRX
              </div>
            )}
            <div>
              <div className="text-xs font-semibold text-[#1D1D1F]">Workspace Emblem</div>
              <div className="text-[11px] text-[#86868B]">Displayed in sidebar navigation</div>
            </div>
          </div>
          <div>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="px-4 py-2 rounded-xl border border-[#E5E5E7] hover:bg-[#F5F5F7] text-xs font-medium cursor-pointer"
            >
              Upload Logo
            </button>
          </div>
        </div>

        {/* Editorial Guidelines */}
        <div className="pt-4 border-t border-[#E5E5E7]">
          <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Creative & Editorial Guidelines</label>
          <textarea
            rows={4}
            value={form.guidelines}
            onChange={(e) => setForm({ ...form, guidelines: e.target.value })}
            className="w-full p-3.5 rounded-xl border border-[#E5E5E7] text-xs leading-relaxed"
          />
          <p className="text-[11px] text-[#86868B] mt-2">
            Note: Apple TRX Studio is an internal creative concept prototype designed for social content planning and layout composition.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold cursor-pointer"
          >
            Save Brand Settings
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// HELP CENTER VIEW
// ============================================================================

function HelpCenterView({ onNavigate }) {
  return (
    <div className="max-w-4xl w-full mx-auto px-5 sm:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Help Center & Studio Guide</h1>
        <p className="text-sm text-[#86868B] mt-1">Quick workflow documentation for the Apple TRX Creative Team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          {
            title: '1. Guided AI Design Workflow',
            desc: 'Use AI Design Studio to select your product, Instagram format (4:5, 1:1, 9:16), and design brief. Generate editable concepts and refine them in the visual canvas.',
            action: 'Open AI Design Studio',
            target: 'ai-studio',
          },
          {
            title: '2. Visual Canvas & Layer Editing',
            desc: 'Drag elements freely on the artboard, adjust typography sizes, colors, opacity, and arrange forward/backward layers with full Undo/Redo support.',
            action: 'Open Canvas Editor',
            target: 'editor',
          },
          {
            title: '3. High-Resolution PNG & JPG Export',
            desc: 'Export flattened 1080×1350, 1080×1080, or 1080×1920 assets directly to your device ready for Instagram publishing.',
            action: 'View My Projects',
            target: 'projects',
          },
          {
            title: '4. Multilingual Copywriting',
            desc: 'Generate tailored captions in English, Bahasa Malaysia, and Bahasa Indonesia with one-click clipboard copy.',
            action: 'Open Caption Writer',
            target: 'captions',
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E5E5E7] p-6 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-semibold text-[#1D1D1F]">{card.title}</h3>
              <p className="text-xs text-[#86868B] leading-relaxed mt-2">{card.desc}</p>
            </div>
            <button
              onClick={() => onNavigate(card.target)}
              className="self-start text-xs font-semibold text-[#0071E3] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{card.action}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
