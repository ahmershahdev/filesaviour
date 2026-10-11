"""
Single source of truth for every FileSaviour tool.

Pages, navigation, the command palette, sitemap.xml, JSON-LD, llms.txt and
llms-full.txt are all generated from this module. Adding a tool means adding
one `Tool(...)` entry here and (if it has a custom UI) one React workspace.

runtime:
  browser  file never leaves the device (pdf-lib, canvas, WASM)
  server   processed by the isolated Flask engine, deleted after TTL
  ai       text/file sent to the AI provider through the engine
"""

from dataclasses import asdict, dataclass
from functools import cache
from typing import Literal

CONTENT_UPDATED = "2026-10-11"  # bump when tool copy changes (sitemap lastmod)

Runtime = Literal["browser", "server", "ai"]
Status = Literal["live", "beta", "soon"]


@dataclass(frozen=True)
class Category:
    slug: str
    name: str
    short: str
    hub_title: str
    description: str
    accent: str  # design token name, see frontend/src/styles/app.css
    icon: str


@dataclass(frozen=True)
class Tool:
    slug: str
    name: str
    category: str
    icon: str  # lucide-react icon name
    summary: str  # <=155 chars, used for meta description
    intro: str  # first paragraph on the page, also llms-full.txt
    accepts: tuple[str, ...]
    output: str
    runtime: Runtime
    keywords: tuple[str, ...] = ()
    status: Status = "live"
    batch: bool = False
    related: tuple[str, ...] = ()
    notice: str = ""  # responsible-use note shown above the dropzone

    @property
    def path(self) -> str:
        return f"/{self.slug}"

    @property
    def title(self) -> str:
        return f"{self.name} — Free Online Tool | FileSaviour"

    def to_card(self) -> dict:
        return {
            "slug": self.slug,
            "name": self.name,
            "category": self.category,
            "icon": self.icon,
            "summary": self.summary,
            "runtime": self.runtime,
            "status": self.status,
            "path": self.path,
            "accepts": [a for a in self.accepts if a.startswith(".")],
        }

    def to_dict(self) -> dict:
        data = asdict(self)
        data["path"] = self.path
        return data


CATEGORIES: tuple[Category, ...] = (
    Category(
        "pdf", "PDF Tools", "PDF", "Free online PDF tools",
        "Merge, split, compress, convert, sign, protect and OCR PDF files.",
        "blue", "FileText",
    ),
    Category(
        "image", "Image Tools", "Image", "Free online image tools",
        "Compress, resize, crop, convert and clean up JPG, PNG, WebP and GIF images.",
        "sky", "Image",
    ),
    Category(
        "ai", "AI Writing Tools", "AI", "Free AI writing tools",
        "Summarize, paraphrase, proofread and check writing with AI.",
        "yellow", "Sparkles",
    ),
    Category(
        "utility", "Utility Tools", "Utility", "Free online text & file utilities",
        "Count words, analyse text and convert or optimise everyday files.",
        "mint", "Wrench",
    ),
)
CATEGORY_PATHS = {"pdf": "/pdf-tools", "image": "/image-tools", "ai": "/ai-writing-tools", "utility": "/utility-tools"}

_PDF = (".pdf",)
_IMG = (".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".heic", ".bmp", ".tiff")
_TXT = (".txt", ".docx", ".pdf", "paste")

TOOLS: tuple[Tool, ...] = (
    # ---------------------------------------------------------------- PDF (18)
    Tool("merge-pdf", "Merge PDF", "pdf", "Combine",
         "Merge PDF files online for free. Combine multiple PDFs into one document and reorder pages by drag and drop — files never leave your browser.",
         "Combine several PDFs into a single, ordered document. Drag files to reorder them, preview pages, and download one clean PDF. Merging runs entirely in your browser, so the files are never uploaded.",
         _PDF, "PDF", "browser", ("merge pdf", "combine pdf", "join pdf files"), batch=True,
         related=("split-pdf", "compress-pdf", "add-page-numbers")),
    Tool("split-pdf", "Split PDF", "pdf", "Split",
         "Split a PDF into separate files by page range, every N pages, or one file per page. Free, fast and private.",
         "Break a long PDF into smaller files: by custom ranges, at fixed intervals, or one file per page. The output arrives as individual PDFs or a single ZIP.",
         _PDF, "PDF / ZIP", "browser", ("split pdf", "separate pdf pages", "cut pdf"),
         related=("extract-pdf-pages", "merge-pdf")),
    Tool("extract-pdf-pages", "PDF Page Extractor", "pdf", "Layers",
         "Extract selected pages from a PDF into a new document. Pick pages visually and download only what you need.",
         "Select pages from a thumbnail grid and save them as a new PDF, without rebuilding the document by hand. Useful for pulling one chapter, form or invoice out of a larger file.",
         _PDF, "PDF", "browser", ("extract pdf pages", "pdf separator", "save pdf pages"),
         related=("split-pdf", "merge-pdf")),
    Tool("compress-pdf", "Compress PDF", "pdf", "FileArchive",
         "Reduce PDF file size online while keeping text sharp. Choose a compression level for email, portals or archiving.",
         "Shrink PDFs for email limits, upload portals and storage. Pick a level: light (print quality), balanced, or strong (screen quality). Images are resampled and fonts subset with Ghostscript.",
         _PDF, "PDF", "server", ("compress pdf", "reduce pdf size", "shrink pdf"),
         related=("merge-pdf", "compress-image")),
    Tool("word-to-pdf", "Word to PDF", "pdf", "FileType",
         "Convert DOC and DOCX to PDF online with layout, fonts and images preserved. Free Word to PDF converter.",
         "Turn Word documents into PDFs that look the same on every device. Layout, fonts, tables and images are kept intact by a LibreOffice rendering engine.",
         (".doc", ".docx", ".odt", ".rtf"), "PDF", "server", ("word to pdf", "docx to pdf", "convert word to pdf"),
         related=("pdf-to-word", "html-to-pdf")),
    Tool("pdf-to-word", "PDF to Word", "pdf", "FileText",
         "Convert PDF to editable Word (DOCX) online. Keep paragraphs, tables and images so you can edit the document.",
         "Get an editable DOCX from any PDF. Text flow, headings, tables and images are reconstructed; scanned PDFs are OCR'd first so the text is selectable.",
         _PDF, "DOCX", "server", ("pdf to word", "pdf to docx", "edit pdf in word"),
         related=("word-to-pdf", "ocr-pdf")),
    Tool("image-to-pdf", "Image to PDF", "pdf", "FileImage",
         "Convert JPG, PNG, WebP and HEIC images to PDF. Combine scans, receipts and photos into one document.",
         "Turn photos, scans and screenshots into a single PDF. Set page size, margins and orientation, then reorder images before export. Runs in your browser.",
         _IMG, "PDF", "browser", ("jpg to pdf", "image to pdf", "png to pdf"), batch=True,
         related=("merge-pdf", "compress-pdf")),
    Tool("edit-pdf", "PDF Editor", "pdf", "PenLine",
         "Edit PDF files online: add text, shapes, highlights, images and annotations. Free browser-based PDF editor.",
         "Add text boxes, highlights, shapes, images and comments to an existing PDF, then flatten and download. Editing happens on your device.",
         _PDF, "PDF", "browser", ("edit pdf", "pdf editor", "annotate pdf"), status="beta",
         related=("sign-pdf", "add-page-numbers")),
    Tool("pdf-to-powerpoint", "PDF to PowerPoint", "pdf", "Presentation",
         "Convert PDF to PowerPoint (PPTX) online. Turn PDF slides and layouts into editable presentations.",
         "Rebuild each PDF page as an editable PowerPoint slide, keeping text boxes and images where possible so you can rework a deck.",
         _PDF, "PPTX", "server", ("pdf to ppt", "pdf to powerpoint", "pdf to pptx"),
         related=("pdf-to-word", "pdf-to-excel")),
    Tool("pdf-to-excel", "PDF to Excel", "pdf", "Sheet",
         "Extract tables from PDF to Excel (XLSX). Convert bank statements, invoices and reports into spreadsheets.",
         "Detect tables in a PDF and export them to XLSX with rows and columns intact, ready for sorting, formulas and analysis.",
         _PDF, "XLSX", "server", ("pdf to excel", "pdf to xlsx", "extract table from pdf"),
         related=("pdf-to-word", "ocr-pdf")),
    Tool("sign-pdf", "Sign PDF", "pdf", "Signature",
         "Sign PDF documents online. Draw, type or upload a signature and place it anywhere on the page — free and private.",
         "Draw, type or upload your signature, drop it onto any page, and add dates or initials. The signature is applied locally; nothing is sent to a server.",
         _PDF, "PDF", "browser", ("sign pdf", "esign pdf", "add signature to pdf"),
         related=("edit-pdf", "protect-pdf")),
    Tool("protect-pdf", "Protect PDF", "pdf", "ShieldCheck",
         "Password-protect a PDF with AES-256 encryption. Restrict printing, copying and editing before you share.",
         "Encrypt a PDF with AES-256 and set an open password, plus optional permissions for printing, copying and editing.",
         _PDF, "PDF", "server", ("protect pdf", "password protect pdf", "encrypt pdf"),
         related=("sign-pdf", "compress-pdf")),
    Tool("html-to-pdf", "HTML to PDF", "pdf", "Code",
         "Convert a web page URL or HTML file to PDF with accurate CSS rendering. Save receipts, articles and templates.",
         "Paste a URL or upload HTML and get a print-accurate PDF rendered by a headless browser, with page size, margins and background options.",
         (".html", ".htm", "url"), "PDF", "server", ("html to pdf", "webpage to pdf", "url to pdf"),
         related=("word-to-pdf", "compress-pdf")),
    Tool("crop-pdf", "Crop PDF", "pdf", "Crop",
         "Crop PDF margins and page areas online. Trim whitespace from scans or cut pages to a custom size.",
         "Drag a crop box over the page to trim margins, headers or scanner borders. Apply it to one page or every page at once.",
         _PDF, "PDF", "browser", ("crop pdf", "trim pdf margins", "resize pdf page"),
         related=("edit-pdf", "split-pdf")),
    Tool("translate-pdf", "Translate PDF", "pdf", "Languages",
         "Translate PDF documents into 30+ languages with AI while keeping the original layout as closely as possible.",
         "Translate a PDF into another language with an AI model. The text is replaced in place so the layout stays recognisable; a side-by-side text export is also available.",
         _PDF, "PDF / TXT", "ai", ("translate pdf", "pdf translator", "translate document"), status="beta",
         related=("ocr-pdf", "ai-summarizer")),
    Tool("ocr-pdf", "OCR PDF", "pdf", "ScanText",
         "Make scanned PDFs searchable with OCR. Recognise text in 100+ languages and copy, search or index it.",
         "Run optical character recognition on scanned or photographed PDFs and add an invisible text layer, so the document becomes searchable and copyable.",
         _PDF, "PDF", "server", ("ocr pdf", "searchable pdf", "scan to text"),
         related=("pdf-to-word", "translate-pdf")),
    Tool("compare-pdf", "Compare PDF", "pdf", "GitCompare",
         "Compare two PDFs and highlight every text change side by side. Spot edits between contract or report versions.",
         "Upload two versions of a document and see additions, deletions and changes highlighted side by side, with a summary of what moved.",
         _PDF, "Report", "server", ("compare pdf", "pdf diff", "compare documents"),
         related=("ocr-pdf", "pdf-to-word")),
    Tool("add-page-numbers", "Add Page Numbers", "pdf", "ListOrdered",
         "Add page numbers to a PDF online. Choose position, style, start number and which pages to number.",
         "Stamp page numbers on a PDF with control over position, font, format (1, i, Page 1 of N) and page range.",
         _PDF, "PDF", "browser", ("add page numbers to pdf", "number pdf pages", "pdf pagination"),
         related=("merge-pdf", "edit-pdf")),
    # -------------------------------------------------------------- Image (12)
    Tool("compress-image", "Compress Image", "image", "Minimize2",
         "Compress JPG, PNG, WebP and GIF images online. Cut file size by up to 80% with a live quality preview.",
         "Shrink images for faster websites and lighter uploads. Compare before and after with a slider and pick the quality that still looks right. Compression runs in your browser.",
         _IMG, "Same format / WebP / AVIF", "browser", ("compress image", "reduce image size", "compress jpg"),
         related=("resize-image", "bulk-compress-images", "convert-image")),
    Tool("resize-image", "Resize Image", "image", "Scaling",
         "Resize images to exact pixels, percentage or social media presets. Free online image resizer for JPG, PNG and WebP.",
         "Change image dimensions by pixels or percentage, or choose a preset for Instagram, YouTube, LinkedIn and passport photos. Aspect ratio lock included.",
         _IMG, "Same format", "browser", ("resize image", "image resizer", "change image size"),
         related=("crop-image", "compress-image")),
    Tool("crop-image", "Crop Image", "image", "Crop",
         "Crop images online to any size or aspect ratio — 1:1, 16:9, 4:5 and custom. Free and private.",
         "Frame a photo exactly how you want with free-form or fixed aspect ratios, rotation and flip, then export at full resolution.",
         _IMG, "Same format", "browser", ("crop image", "crop photo", "image cropper"),
         related=("resize-image", "bulk-crop-images")),
    Tool("convert-image", "Image Converter", "image", "Repeat",
         "Convert images between JPG, PNG, WebP, AVIF, GIF and HEIC online. Fast, free image format converter.",
         "Change an image's format for compatibility or size: HEIC to JPG, PNG to WebP, WebP to PNG, and more, with quality and transparency options.",
         _IMG, "JPG / PNG / WebP / AVIF / GIF", "browser", ("convert image", "heic to jpg", "png to webp", "webp to png"),
         related=("bulk-convert-images", "compress-image")),
    Tool("bulk-crop-images", "Bulk Crop Images", "image", "LayoutGrid",
         "Crop many images at once with the same ratio or size. Ideal for product photos, galleries and thumbnails.",
         "Apply one crop ratio or size to a whole batch, adjust the focal point per image where needed, and download everything as a ZIP.",
         _IMG, "ZIP", "browser", ("bulk crop images", "batch crop", "crop multiple images"), batch=True,
         related=("crop-image", "bulk-convert-images")),
    Tool("bulk-convert-images", "Bulk Image Converter", "image", "RefreshCw",
         "Convert hundreds of images to JPG, PNG, WebP or AVIF in one go. Free batch image format conversion.",
         "Drop a folder of images and convert all of them to one format with shared quality settings. Results download as a ZIP.",
         _IMG, "ZIP", "browser", ("batch convert images", "bulk image converter", "convert multiple images"), batch=True,
         related=("convert-image", "bulk-compress-images")),
    Tool("bulk-compress-images", "Bulk Image Compressor", "image", "PackageOpen",
         "Compress many images at once. Batch-optimise JPG, PNG and WebP for websites, email and storage.",
         "Optimise an entire batch with one quality profile and see total savings at a glance. Results download as a ZIP.",
         _IMG, "ZIP", "browser", ("bulk compress images", "batch image compression", "optimize images"), batch=True,
         related=("compress-image", "bulk-convert-images")),
    Tool("compress-gif", "GIF Compressor", "image", "Film",
         "Compress animated GIFs online. Reduce colours, frames and dimensions to make GIFs lighter for chat and web.",
         "Make animated GIFs smaller by reducing colours, dropping frames and applying lossy optimisation with gifsicle, while keeping the animation smooth.",
         (".gif",), "GIF", "server", ("compress gif", "reduce gif size", "gif optimizer"),
         related=("compress-image", "convert-image")),
    Tool("remove-background", "Background Remover", "image", "Eraser",
         "Remove image backgrounds automatically with AI. Get a transparent PNG for products, profiles and thumbnails.",
         "Cut out the subject from any photo automatically and download a transparent PNG, or replace the background with a solid colour.",
         _IMG, "PNG", "server", ("remove background", "background remover", "transparent png"),
         related=("enhance-image", "crop-image")),
    Tool("enhance-image", "Image Enhancer", "image", "Wand2",
         "Upscale and enhance photos with AI. Sharpen details, reduce noise and fix lighting in one click.",
         "Upscale low-resolution images 2× or 4×, reduce noise and recover detail with an AI super-resolution model.",
         _IMG, "PNG / JPG", "server", ("image enhancer", "upscale image", "improve photo quality"), status="beta",
         related=("remove-background", "compress-image")),
    Tool("remove-watermark", "Watermark Remover", "image", "Brush",
         "Remove unwanted marks, text and objects from your own images with AI inpainting. For images you own or have rights to edit.",
         "Paint over a stamp, date, logo or object and AI inpainting fills the area to match its surroundings. Use it only on images you own or are licensed to edit.",
         _IMG, "PNG / JPG", "server", ("remove watermark", "remove object from photo", "inpainting"), status="beta",
         notice="Only use this on images you own or have permission to edit. Removing watermarks from copyrighted work may break the law and our Terms.",
         related=("enhance-image", "remove-background")),
    Tool("ai-image-detector", "AI Image Detector", "image", "ScanEye",
         "Check whether an image is likely AI-generated. Get a probability score and the signals behind it.",
         "Upload an image and get a probability that it was AI-generated, along with metadata and C2PA content-credential checks. Treat the score as a signal, not proof.",
         _IMG, "Report", "ai", ("ai image detector", "is this image ai", "detect ai generated image"), status="beta",
         related=("ai-content-detector", "enhance-image")),
    # ---------------------------------------------------------------- AI (8)
    Tool("ai-summarizer", "AI Summarizer", "ai", "AlignLeft",
         "Summarize articles, PDFs and notes with AI. Get key points, a TL;DR or a structured summary in seconds.",
         "Paste text or upload a document and get a concise summary as bullet points, a short paragraph or a structured outline, at the length you choose.",
         _TXT, "Text", "ai", ("ai summarizer", "summarize text", "summarize pdf"),
         related=("paraphrasing-tool", "translate-pdf")),
    Tool("paraphrasing-tool", "AI Paraphraser", "ai", "PenTool",
         "Paraphrase text with AI in fluent, formal, simple or creative modes while keeping the original meaning.",
         "Rewrite sentences and paragraphs in a different tone (fluent, formal, simple, shorter or creative) while keeping the meaning intact. Changes are highlighted.",
         _TXT, "Text", "ai", ("paraphrasing tool", "paraphraser", "rewrite text"),
         related=("content-improver", "grammar-checker")),
    Tool("grammar-checker", "Grammar Checker", "ai", "SpellCheck",
         "Free AI grammar checker. Fix spelling, punctuation and clarity issues with explanations for every change.",
         "Find and fix grammar, spelling, punctuation and style issues. Each suggestion comes with a short explanation so you learn as you edit.",
         _TXT, "Text", "ai", ("grammar checker", "spell check", "proofread online"),
         related=("content-improver", "paraphrasing-tool")),
    Tool("ai-content-detector", "AI Content Detector", "ai", "Fingerprint",
         "Estimate whether text was written by AI. Sentence-level highlighting with an honest confidence score.",
         "Paste text to estimate how likely it is to be machine-generated, with sentence-level highlighting. Detectors make mistakes, so never use the score alone to accuse anyone.",
         _TXT, "Report", "ai", ("ai detector", "ai content detector", "chatgpt detector"), status="beta",
         related=("plagiarism-checker", "ai-image-detector")),
    Tool("ai-humanizer", "AI Humanizer", "ai", "UserPen",
         "Make stiff, robotic drafts read naturally. Rewrite AI-assisted text in your own voice and tone.",
         "Rewrite stiff or generic drafts so they read like a person wrote them: varied rhythm, plain words, a consistent voice. Meant for your own drafts, not for disguising someone else's work.",
         _TXT, "Text", "ai", ("ai humanizer", "humanize ai text", "make text sound human"),
         notice="Follow your school's or employer's rules on AI-assisted writing.",
         related=("content-improver", "paraphrasing-tool")),
    Tool("plagiarism-checker", "Plagiarism Checker", "ai", "SearchCheck",
         "Check text for plagiarism against web sources. See matched passages, sources and an originality score.",
         "Compare your writing against web sources and see matched passages with links, so you can add citations or rewrite before you submit or publish.",
         _TXT, "Report", "ai", ("plagiarism checker", "check plagiarism", "originality checker"), status="soon",
         related=("plagiarism-remover", "ai-content-detector")),
    Tool("plagiarism-remover", "Citation & Rewrite Assistant", "ai", "Quote",
         "Fix flagged passages properly: add citations or rewrite overlapping text in your own words.",
         "Take passages flagged by the plagiarism checker and either add a properly formatted citation (APA, MLA, Chicago) or rewrite the idea in your own words with attribution.",
         _TXT, "Text", "ai", ("plagiarism remover", "rewrite plagiarized text", "citation generator"), status="soon",
         related=("plagiarism-checker", "paraphrasing-tool")),
    Tool("content-improver", "Content Improver", "ai", "Wand",
         "Improve writing tone, structure, flow and readability with AI. Tighten emails, essays, posts and docs.",
         "Get suggestions for tone, structure, clarity and flow, with a readability score before and after. Accept changes one by one or all at once.",
         _TXT, "Text", "ai", ("improve writing", "content improver", "rewrite for clarity"),
         related=("grammar-checker", "ai-humanizer")),
    # ----------------------------------------------------------- Utility (4)
    Tool("word-counter", "Word Counter", "utility", "Hash",
         "Count words, characters, sentences, paragraphs and reading time instantly. Free online word counter.",
         "Type or paste text and see live counts for words, characters (with and without spaces), sentences, paragraphs, reading and speaking time, and keyword density.",
         ("paste", ".txt", ".docx"), "Stats", "browser", ("word counter", "character counter", "count words"),
         related=("text-analyzer", "grammar-checker")),
    Tool("text-analyzer", "Text Analyzer", "utility", "ChartNoAxesColumn",
         "Analyse readability, keyword density, sentence length and tone. Flesch score and grade level included.",
         "Measure readability (Flesch, Flesch–Kincaid, Gunning Fog), sentence length, passive voice, keyword density and lexical diversity for any text.",
         ("paste", ".txt", ".docx"), "Report", "browser", ("text analyzer", "readability checker", "keyword density"),
         related=("word-counter", "content-improver")),
    Tool("file-converter", "File Converter", "utility", "ArrowLeftRight",
         "Convert documents, spreadsheets, presentations and images between 50+ formats. One free online file converter.",
         "One place for format changes: DOCX, ODT, RTF, TXT, XLSX, CSV, PPTX, images and more. Pick a target format and FileSaviour routes the file to the right engine.",
         (".docx", ".odt", ".rtf", ".txt", ".xlsx", ".csv", ".pptx", ".pdf", *_IMG), "Varies", "server",
         ("file converter", "convert files online", "document converter"),
         related=("word-to-pdf", "convert-image")),
    Tool("file-optimizer", "File Optimizer", "utility", "Gauge",
         "Optimise PDFs, images and office files for upload limits, email and storage. Strip metadata and shrink size.",
         "Drop any supported file and get a smaller, cleaner version: compressed media, removed metadata and embedded thumbnails, normalised formats.",
         (".pdf", ".docx", ".pptx", ".xlsx", *_IMG), "Same format", "server",
         ("optimize file size", "reduce file size", "remove metadata"),
         related=("compress-pdf", "compress-image")),
)


@cache
def by_slug() -> dict[str, Tool]:
    return {t.slug: t for t in TOOLS}


@cache
def categories() -> dict[str, Category]:
    return {c.slug: c for c in CATEGORIES}


def get(slug: str) -> Tool | None:
    return by_slug().get(slug)


def in_category(category: str) -> list[Tool]:
    return [t for t in TOOLS if t.category == category]


def category_payload() -> list[dict]:
    return [
        {**asdict(c), "path": CATEGORY_PATHS[c.slug], "count": len(in_category(c.slug))}
        for c in CATEGORIES
    ]


def catalog() -> list[dict]:
    """Compact list for nav, command palette and index pages."""
    return [t.to_card() for t in TOOLS]


RUNTIME_COPY = {
    "browser": "Runs in your browser. Your file never leaves this device.",
    "server": "Processed on our isolated servers over HTTPS and permanently deleted within 1 hour.",
    "ai": "Sent to our AI provider for processing. Not used to train models. Deleted within 1 hour.",
}


def howto_steps(tool: Tool) -> list[dict]:
    verb = "Paste or upload" if "paste" in tool.accepts else "Upload"
    return [
        {"name": f"{verb} your file", "text": f"{verb} {'files' if tool.batch else 'a file'} ({', '.join(a for a in tool.accepts[:4] if a not in ('paste', 'url'))}) to the {tool.name} workspace, or drop it anywhere on the page."},
        {"name": "Adjust the settings", "text": f"Choose the options for {tool.name.lower()}. The preview updates as you go."},
        {"name": "Download the result", "text": f"Download your {tool.output} file. {RUNTIME_COPY[tool.runtime]}"},
    ]


def faqs(tool: Tool) -> list[dict]:
    return [
        {"q": f"Is {tool.name} free?",
         "a": f"Yes. {tool.name} is free to use without an account. A free account adds history and larger file limits."},
        {"q": "Are my files safe?", "a": RUNTIME_COPY[tool.runtime]},
        {"q": f"Which formats does {tool.name} support?",
         "a": f"Input: {', '.join(a.lstrip('.').upper() for a in tool.accepts if a not in ('paste',))}. Output: {tool.output}."},
        {"q": "Does it work on mobile?",
         "a": "Yes. FileSaviour works in any modern browser on iPhone, Android, tablets and desktop, with no app to install."},
    ]


assert len(TOOLS) == 42, f"Expected 42 tools, found {len(TOOLS)}"
assert len(by_slug()) == len(TOOLS), "Duplicate tool slug"
assert all(len(t.summary) <= 160 for t in TOOLS), [t.slug for t in TOOLS if len(t.summary) > 160]
assert all(r in by_slug() for t in TOOLS for r in t.related), "Unknown related slug"
