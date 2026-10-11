import {
  AlignLeft, ArrowLeftRight, Brush, ChartNoAxesColumn, Code, Combine, Crop, Eraser, FileArchive, FileImage,
  FileText, FileType, Film, Fingerprint, Gauge, GitCompare, Hash, Image, Languages, Layers, LayoutGrid,
  ListOrdered, Minimize2, PackageOpen, PenLine, PenTool, Presentation, Quote, RefreshCw, Repeat, Scaling,
  ScanEye, ScanText, SearchCheck, Sheet, ShieldCheck, Signature, Sparkles, SpellCheck, Split, UserPen, Wand,
  Wand2, Wrench, type LucideIcon,
} from "lucide-react";

// Explicit map (not `import *`) so unused icons are tree-shaken.
const ICONS: Record<string, LucideIcon> = {
  AlignLeft, ArrowLeftRight, Brush, ChartNoAxesColumn, Code, Combine, Crop, Eraser, FileArchive, FileImage,
  FileText, FileType, Film, Fingerprint, Gauge, GitCompare, Hash, Image, Languages, Layers, LayoutGrid,
  ListOrdered, Minimize2, PackageOpen, PenLine, PenTool, Presentation, Quote, RefreshCw, Repeat, Scaling,
  ScanEye, ScanText, SearchCheck, Sheet, ShieldCheck, Signature, Sparkles, SpellCheck, Split, UserPen, Wand,
  Wand2, Wrench,
};

export function ToolIcon({ name, className, strokeWidth = 1.6 }: { name: string; className?: string; strokeWidth?: number }) {
  const Icon = ICONS[name] ?? FileText;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
