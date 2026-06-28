# PDF Processing Advanced Reference

This document contains advanced PDF processing features, detailed examples, and additional libraries not covered in the main skill instructions.

## pypdfium2 Library (Apache/BSD License)

### Overview
pypdfium2 is a Python binding for PDFium (Chromium's PDF library). It's excellent for fast PDF rendering, image generation, and serves as a PyMuPDF replacement.

### Render PDF to Images
```python
import pypdfium2 as pdfium
from PIL import Image

# Load PDF
pdf = pdfium.PdfDocument("document.pdf")

# Render page to image
page = pdf[0]  # First page
bitmap = page.render(
    scale=2.0,  # Higher resolution
    rotation=0  # No rotation
)

# Convert to PIL Image
img = bitmap.to_pil()
img.save("page_1.png", "PNG")

# Process multiple pages
for i, page in enumerate(pdf):
    bitmap = page.render(scale=1.5)
    img = bitmap.to_pil()
    img.save(f"page_{i+1}.jpg", "JPEG", quality=90)
```

### Extract Text with pypdfium2
```python
import pypdfium2 as pdfium

pdf = pdfium.PdfDocument("document.pdf")
for i, page in enumerate(pdf):
    text = page.get_text()
    print(f"Page {i+1} text length: {len(text)} chars")
```

## JavaScript Libraries

### pdf-lib (MIT License)

pdf-lib is a powerful JavaScript library for creating and modifying PDF documents in any JavaScript environment.

#### Load and Manipulate Existing PDF
```javascript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function manipulatePDF() {
    // Load existing PDF
    const existingPdfBytes = fs.readFileSync('input.pdf');
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Get page count
    const pageCount = pdfDoc.getPageCount();
    console.log(`Document has ${pageCount} pages`);

    // Add new page
    const newPage = pdfDoc.addPage([600, 400]);
    newPage.drawText('Added by pdf-lib', {
        x: 100,
        y: 300,
        size: 16
    });

    // Save modified PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('modified.pdf', pdfBytes);
}
```

#### Create Complex PDFs from Scratch
```javascript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

async function createPDF() {
    const pdfDoc = await PDFDocument.create();

    // Add fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Add page
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    // Add text with styling
    page.drawText('Invoice #12345', {
        x: 50,
        y: height - 50,
        size: 18,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.8)
    });

    // Add rectangle (header background)
    page.drawRectangle({
        x: 40,
        y: height - 100,
        width: width - 80,
        height: 30,
        color: rgb(0.9, 0.9, 0.9)
    });

    // Add table-like content
    const items = [
        ['Item', 'Qty', 'Price', 'Total'],
        ['Widget', '2', '$50', '$100'],
        ['Gadget', '1', '$75', '$75']
    ];

    let yPos = height - 150;
    items.forEach(row => {
        let xPos = 50;
        row.forEach(cell => {
            page.drawText(cell, {
                x: xPos,
                y: yPos,
                size: 12,
                font: helveticaFont
            });
            xPos += 120;
        });
        yPos -= 25;
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('created.pdf', pdfBytes);
}
```

#### Advanced Merge and Split Operations
```javascript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function mergePDFs() {
    // Create new document
    const mergedPdf = await PDFDocument.create();

    // Load source PDFs
    const pdf1Bytes = fs.readFileSync('doc1.pdf');
    const pdf2Bytes = fs.readFileSync('doc2.pdf');

    const pdf1 = await PDFDocument.load(pdf1Bytes);
    const pdf2 = await PDFDocument.load(pdf2Bytes);

    // Copy pages from first PDF
    const pdf1Pages = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
    pdf1Pages.forEach(page => mergedPdf.addPage(page));

    // Copy specific pages from second PDF (pages 0, 2, 4)
    const pdf2Pages = await mergedPdf.copyPages(pdf2, [0, 2, 4]);
    pdf2Pages.forEach(page => mergedPdf.addPage(page));

    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync('merged.pdf', mergedPdfBytes);
}
```

### pdfjs-dist (Apache License)

PDF.js is Mozilla's JavaScript library for rendering PDFs in the browser.

#### Basic PDF Loading and Rendering
```javascript
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker (important for performance)
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.js';

async function renderPDF() {
    // Load PDF
    const loadingTask = pdfjsLib.getDocument('document.pdf');
    const pdf = await loadingTask.promise;

    console.log(`Loaded PDF with ${pdf.numPages} pages`);

    // Get first page
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    // Render to canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };

    await page.render(renderContext).promise;
    document.body.appendChild(canvas);
}
```

#### Extract Text with Coordinates
```javascript
import * as pdfjsLib from 'pdfjs-dist';

async function extractText() {
    const loadingTask = pdfjsLib.getDocument('document.pdf');
    const pdf = await loadingTask.promise;

    let fullText = '';

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
            .map(item => item.str)
            .join(' ');

        fullText += `\n--- Page ${i} ---\n${pageText}`;

        // Get text with coordinates for advanced processing
        const textWithCoords = textContent.items.map(item => ({
            text: item.str,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width,
            height: item.height
        }));
    }

    console.log(fullText);
    return fullText;
}
```

#### Extract Annotations and Forms
```javascript
import * as pdfjsLib from 'pdfjs-dist';

async function extractAnnotations() {
    const loadingTask = pdfjsLib.getDocument('annotated.pdf');
    const pdf = await loadingTask.promise;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const annotations = await page.getAnnotations();

        annotations.forEach(annotation => {
            console.log(`Annotation type: ${annotation.subtype}`);
            console.log(`Content: ${annotation.contents}`);
            console.log(`Coordinates: ${JSON.stringify(annotation.rect)}`);
        });
    }
}
```

## Advanced Command-Line Operations

### poppler-utils Advanced Features

#### Extract Text with Bounding Box Coordinates
```bash
# Extract text with bounding box coordinates (essential for structured data)
pdftotext -bbox-layout document.pdf output.xml

# The XML output contains precise coordinates for each text element
```

#### Advanced Image Conversion
```bash
# Convert to PNG images with specific resolution
pdftoppm -png -r 300 document.pdf output_prefix

# Convert specific page range with high resolution
pdftoppm -png -r 600 -f 1 -l 3 document.pdf high_res_pages

# Convert to JPEG with quality setting
pdftoppm -jpeg -jpegopt quality=85 -r 200 document.pdf jpeg_output
```

#### Extract Embedded Images
```bash
# Extract all embedded images with metadata
pdfimages -j -p document.pdf page_images

# List image info without extracting
pdfimages -list document.pdf

# Extract images in their original format
pdfimages -all document.pdf images/img
```

### qpdf Advanced Features

#### Complex Page Manipulation
```bash
# Split PDF into groups of pages
qpdf --split-pages=3 input.pdf output_group_%02d.pdf

# Extract specific pages with complex ranges
qpdf input.pdf --pages input.pdf 1,3-5,8,10-end -- extracted.pdf

# Merge specific pages from multiple PDFs
qpdf --empty --pages doc1.pdf 1-3 doc2.pdf 5-7 doc3.pdf 2,4 -- combined.pdf
```

#### PDF Optimization and Repair
```bash
# Optimize PDF for web (linearize for streaming)
qpdf --linearize input.pdf optimized.pdf

# Remove unused objects and compress
qpdf --optimize-level=all input.pdf compressed.pdf

# Attempt to repair corrupted PDF structure
qpdf --check input.pdf
qpdf --fix-qdf damaged.pdf repaired.pdf

# Show detailed PDF structure for debugging
qpdf --show-all-pages input.pdf > structure.txt
```

#### Advanced Encryption
```bash
# Add password protection with specific permissions
qpdf --encrypt user_pass owner_pass 256 --print=none --modify=none -- input.pdf encrypted.pdf

# Check encryption status
qpdf --show-encryption encrypted.pdf

# Remove password protection (requires password)
qpdf --password=secret123 --decrypt encrypted.pdf decrypted.pdf
```

## Advanced Python Techniques

### pdfplumber Advanced Features

#### Extract Text with Precise Coordinates
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    page = pdf.pages[0]
    
    # Extract all text with coordinates
    chars = page.chars
    for char in chars[:10]:  # First 10 characters
        print(f"Char: '{char['text']}' at x:{char['x0']:.1f} y:{char['y0']:.1f}")
    
    # Extract text by bounding box (left, top, right, bottom)
    bbox_text = page.within_bbox((100, 100, 400, 200)).extract_text()
```

#### Advanced Table Extraction with Custom Settings
```python
import pdfplumber
import pandas as pd

with pdfplumber.open("complex_table.pdf") as pdf:
    page = pdf.pages[0]
    
    # Extract tables with custom settings for complex layouts
    table_settings = {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 3,
        "intersection_tolerance": 15
    }
    tables = page.extract_tables(table_settings)
    
    # Visual debugging for table extraction
    img = page.to_image(resolution=150)
    img.save("debug_layout.png")
```

### reportlab Advanced Features

#### Create Professional Reports with Tables
```python
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

# Sample data
data = [
    ['Product', 'Q1', 'Q2', 'Q3', 'Q4'],
    ['Widgets', '120', '135', '142', '158'],
    ['Gadgets', '85', '92', '98', '105']
]

# Create PDF with table
doc = SimpleDocTemplate("report.pdf")
elements = []

# Add title
styles = getSampleStyleSheet()
title = Paragraph("Quarterly Sales Report", styles['Title'])
elements.append(title)

# Add table with advanced styling
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 14),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
    ('GRID', (0, 0), (-1, -1), 1, colors.black)
]))
elements.append(table)

doc.build(elements)
```

## Complex Workflows

### Extract Figures/Images from PDF

#### Method 1: Using pdfimages (fastest)
```bash
# Extract all images with original quality
pdfimages -all document.pdf images/img
```

#### Method 2: Using pypdfium2 + Image Processing
```python
import pypdfium2 as pdfium
from PIL import Image
import numpy as np

def extract_figures(pdf_path, output_dir):
    pdf = pdfium.PdfDocument(pdf_path)
    
    for page_num, page in enumerate(pdf):
        # Render high-resolution page
        bitmap = page.render(scale=3.0)
        img = bitmap.to_pil()
        
        # Convert to numpy for processing
        img_array = np.array(img)
        
        # Simple figure detection (non-white regions)
        mask = np.any(img_array != [255, 255, 255], axis=2)
        
        # Find contours and extract bounding boxes
        # (This is simplified - real implementation would need more sophisticated detection)
        
        # Save detected figures
        # ... implementation depends on specific needs
```

### Batch PDF Processing with Error Handling
```python
import os
import glob
from pypdf import PdfReader, PdfWriter
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def batch_process_pdfs(input_dir, operation='merge'):
    pdf_files = glob.glob(os.path.join(input_dir, "*.pdf"))
    
    if operation == 'merge':
        writer = PdfWriter()
        for pdf_file in pdf_files:
            try:
                reader = PdfReader(pdf_file)
                for page in reader.pages:
                    writer.add_page(page)
                logger.info(f"Processed: {pdf_file}")
            except Exception as e:
                logger.error(f"Failed to process {pdf_file}: {e}")
                continue
        
        with open("batch_merged.pdf", "wb") as output:
            writer.write(output)
    
    elif operation == 'extract_text':
        for pdf_file in pdf_files:
            try:
                reader = PdfReader(pdf_file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text()
                
                output_file = pdf_file.replace('.pdf', '.txt')
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(text)
                logger.info(f"Extracted text from: {pdf_file}")
                
            except Exception as e:
                logger.error(f"Failed to extract text from {pdf_file}: {e}")
                continue
```

### Advanced PDF Cropping
```python
from pypdf import PdfWriter, PdfReader

reader = PdfReader("input.pdf")
writer = PdfWriter()

# Crop page (left, bottom, right, top in points)
page = reader.pages[0]
page.mediabox.left = 50
page.mediabox.bottom = 50
page.mediabox.right = 550
page.mediabox.top = 750

writer.add_page(page)
with open("cropped.pdf", "wb") as output:
    writer.write(output)
```

## Performance Optimization Tips

### 1. For Large PDFs
- Use streaming approaches instead of loading entire PDF in memory
- Use `qpdf --split-pages` for splitting large files
- Process pages individually with pypdfium2

### 2. For Text Extraction
- `pdftotext -bbox-layout` is fastest for plain text extraction
- Use pdfplumber for structured data and tables
- Avoid `pypdf.extract_text()` for very large documents

### 3. For Image Extraction
- `pdfimages` is much faster than rendering pages
- Use low resolution for previews, high resolution for final output

### 4. For Form Filling
- pdf-lib maintains form structure better than most alternatives
- Pre-validate form fields before processing

### 5. Memory Management
```python
# Process PDFs in chunks
def process_large_pdf(pdf_path, chunk_size=10):
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)
    
    for start_idx in range(0, total_pages, chunk_size):
        end_idx = min(start_idx + chunk_size, total_pages)
        writer = PdfWriter()
        
        for i in range(start_idx, end_idx):
            writer.add_page(reader.pages[i])
        
        # Process chunk
        with open(f"chunk_{start_idx//chunk_size}.pdf", "wb") as output:
            writer.write(output)
```

## Troubleshooting Common Issues

### Encrypted PDFs
```python
# Handle password-protected PDFs
from pypdf import PdfReader

try:
    reader = PdfReader("encrypted.pdf")
    if reader.is_encrypted:
        reader.decrypt("password")
except Exception as e:
    print(f"Failed to decrypt: {e}")
```

### Corrupted PDFs
```bash
# Use qpdf to repair
qpdf --check corrupted.pdf
qpdf --replace-input corrupted.pdf
```

### Text Extraction Issues
```python
# Fallback to OCR for scanned PDFs
import pytesseract
from pdf2image import convert_from_path

def extract_text_with_ocr(pdf_path):
    images = convert_from_path(pdf_path)
    text = ""
    for i, image in enumerate(images):
        text += pytesseract.image_to_string(image)
    return text
```

## HTML → PDF via Playwright MCP (K8s cto pod 環境)

> **適用場景**：pod 內無可用 Chrome（Puppeteer 下載的 Chrome 因 Alpine musl vs glibc 不相容無法執行；WeasyPrint 缺 libgobject 系統庫）。唯一可行路徑：Playwright MCP 截圖 → img2pdf 合併。

### 關鍵踩坑：`browser_navigate` 會 hang 60 秒

**根本原因**：HTML 內有 `<link href="https://fonts.googleapis.com/...">` → Squid proxy 封鎖 CDN → 瀏覽器等 font request timeout（~60 秒）才觸發 `load` 事件 → MCP 的 `browser_navigate` 預設 `waitUntil: 'load'`，因此每次 navigate 都卡 60 秒。

**解法**：把 HTML encode 成 `data:text/html;base64,...` URI，不走網路，navigate 降至 **2.5 秒**：

```javascript
const noFontHTML = html
  .replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/g, '')
  .replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/g, '');
const dataURI = `data:text/html;base64,${Buffer.from(noFontHTML).toString('base64')}`;
await tool('browser_navigate', { url: dataURI });
```

### ✅ 推薦做法：`browser_run_code` + `page.pdf()`（向量 PDF，最佳品質）

比截圖 + img2pdf 更好：文字向量化、清晰，且整個 HTML 一次輸出，無需逐 slide 截圖。

```javascript
// 1. navigate（data URI，2.5 秒）
await tool('browser_navigate', { url: dataURI }, 30000);
await wait(2000);

// 2. 用 browser_run_code 呼叫 page.pdf()
const code = `async (page) => {
  await page.addStyleTag({ content: \`
    @page { size: A4 landscape; margin: 0; }
    @media print {
      html,body { margin:0;padding:0;background:white; }
      .slide { page-break-after:always;page-break-inside:avoid;
               box-shadow:none!important;margin:0!important; }
    }
  \`});
  const pdf = await page.pdf({ format:'A4', landscape:true, printBackground:true,
    margin:{top:'0',right:'0',bottom:'0',left:'0'} });
  return pdf.toString('base64');  // Buffer 實例可直接 .toString()，無需 Buffer.from()
}`;

const result = await tool('browser_run_code', { code }, 90000);
const raw = result?.content?.find(c => c.type === 'text')?.text || '';
// 回傳格式：'### Result\n"<base64>"'，需 regex 提取
const match = raw.match(/"([A-Za-z0-9+/=\n]+)"/s);
const b64 = match ? match[1].replace(/\n/g,'') : '';
if (b64.startsWith('JVBE')) {   // %PDF in base64
  fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
}
```

**注意**：`browser_run_code` 的沙盒環境中 `Buffer`（建構子）不可用，但 `pdf.toString('base64')` 可以（pdf 已是 Buffer 實例）。

### 備用做法：截圖 + img2pdf（品質較差，僅在 page.pdf() 失敗時使用）

```javascript
// 1. navigate（data URI）
await tool('browser_navigate', { url: dataURI }, 30000);
await wait(2000);

// 2. 每張 slide：evaluate 只顯示該 slide → 截圖
for (let i = 0; i < count; i++) {
  await tool('browser_evaluate', {
    function: `async () => {
      const slides = document.querySelectorAll('.slide, .slide.cover, [class*="slide"]');
      slides.forEach((s, idx) => {
        s.style.display = idx === ${i} ? 'block' : 'none';
        s.style.margin = '0';
      });
      window.scrollTo(0, 0);
      return slides.length;
    }`
  }, 10000);
  await wait(600);

  const ss = await tool('browser_take_screenshot', {}, 15000);
  // 重要：用 .find() 而非 [0]，因 content[0] 可能是 text 說明
  const img = ss?.content?.find(c => c.type === 'image');
  if (img) fs.writeFileSync(pngPath, Buffer.from(img.data, 'base64'));
}

// 3. 合併 PNG → PDF（A4 landscape）
// python3: img2pdf.convert(pngs, layout_fun=img2pdf.get_layout_fun((mm_to_pt(297), mm_to_pt(210))))
```

### ⚠️ 踩坑：相對路徑圖片在 data URI 下斷裂

**現象**：HTML 內有 `<img src="../docs/assets/charts/xxx.png">`，轉成 data URI 後圖片全部消失。

**根本原因**：data URI 沒有 base URL，瀏覽器無法解析相對路徑。

**解法**：在 encode 為 data URI 之前，先把所有相對路徑圖片 inline 為 base64：

```javascript
import path from 'node:path';

function inlineImages(html, htmlDir) {
  return html.replace(/src="([^"]+)"/g, (match, src) => {
    if (src.startsWith('data:') || src.startsWith('http')) return match;
    const absPath = path.resolve(htmlDir, src);
    if (!fs.existsSync(absPath)) return match;
    const ext = path.extname(absPath).slice(1).toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    const b64 = fs.readFileSync(absPath).toString('base64');
    return `src="data:${mime};base64,${b64}"`;
  });
}

// 使用
const htmlDir = path.dirname(htmlPath);
html = inlineImages(html, htmlDir);
const dataURI = `data:text/html;base64,${Buffer.from(html).toString('base64')}`;
```

### ✅ 注入中文字體（取代 Google Fonts）

Google Fonts 被 Squid proxy 封鎖後，需注入 CSS 指定系統可用字體：

```javascript
const FONT_OVERRIDE = `
  * { font-family: "Noto Sans TC", "Noto Sans CJK TC", "WenQuanYi Micro Hei", sans-serif !important; }
  code, pre { font-family: "JetBrains Mono", "Consolas", monospace !important; }
`;
html = html.replace('<head>', `<head><style>${FONT_OVERRIDE}</style>`);
```

**確認可用字體**（在 MCP 瀏覽器環境）：Noto Sans TC ✓、Noto Sans CJK TC ✓、PingFang TC ✓、Source Han Sans TC ✓、WenQuanYi Micro Hei ✓

### ✅ 完整 HTML→PDF 流程（最終正確順序）

```javascript
let html = fs.readFileSync(htmlPath, 'utf8');
// 1. 去掉 Google Fonts link（避免 60 秒 hang）
html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/g, '')
           .replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/g, '')
           .replace(/<link[^>]*preconnect[^>]*>/g, '');
// 2. 注入字體 CSS
html = html.replace('<head>', `<head><style>${FONT_OVERRIDE}</style>`);
// 3. inline 相對路徑圖片（⚠️ 必須在 encode 前做）
html = inlineImages(html, path.dirname(htmlPath));
// 4. 轉 data URI
const dataURI = `data:text/html;base64,${Buffer.from(html).toString('base64')}`;
// 5. navigate + page.pdf()
```

### 其他注意事項

- `browser_take_screenshot` 回傳 content 可能有多個 item，**必須用 `.find(c => c.type === 'image')`**，不能直接取 `content[0]`
- `browser_run_code` 回傳格式：`### Result\n"<base64>"`，用 regex 提取 base64
- 完整向量 PDF 腳本：`skills/pdf/scripts/html-slides-to-pdf.mjs`

## License Information

- **pypdf**: BSD License
- **pdfplumber**: MIT License
- **pypdfium2**: Apache/BSD License
- **reportlab**: BSD License
- **poppler-utils**: GPL-2 License
- **qpdf**: Apache License
- **pdf-lib**: MIT License
- **pdfjs-dist**: Apache License