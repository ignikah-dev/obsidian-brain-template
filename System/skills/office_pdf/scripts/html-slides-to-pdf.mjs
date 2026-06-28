#!/usr/bin/env node
// HTML slides → vector PDF via Playwright MCP
// Handles: Google Fonts hang fix (data URI), inline relative images, Noto Sans TC font injection
//
// Usage: node html-slides-to-pdf.mjs <input.html> <output.pdf>
// Or import and call htmlToPdf() directly.

import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

const MCP_HOST = 'metamcp.typus.studio';
const MCP_IP   = '10.111.3.10';  // DNS bypass: Node.js dns.lookup fails in this pod
const AUTH     = 'Bearer sk_mt_diE2U0PFkJjLpZPWR9CF0Lt1inArZJrgh6Ifj0k2bTjMU0kKM1wQn8CnKw5G4cz8';

function httpsPost(body, extra = {}, timeout = 120000) {
  return new Promise((resolve, reject) => {
    const s = JSON.stringify(body);
    const req = https.request({
      hostname: MCP_IP, port: 443,
      path: '/metamcp/studio_mcp/mcp',
      method: 'POST', servername: MCP_HOST,
      headers: {
        'Host': MCP_HOST, 'Authorization': AUTH,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Content-Length': Buffer.byteLength(s), ...extra,
      },
    }, res => {
      const sid = res.headers['mcp-session-id'] || '';
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ sid, body: d }));
    });
    req.setTimeout(timeout, () => { req.destroy(new Error('timeout')); });
    req.on('error', reject);
    req.write(s); req.end();
  });
}

function parseSSE(text) {
  return text.split('\n').filter(l => l.startsWith('data: '))
    .map(l => { try { return JSON.parse(l.slice(6)); } catch { return null; } }).filter(Boolean);
}

export async function createMcpSession() {
  const r = await httpsPost({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {
    protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'html-to-pdf', version: '1.0' }
  }});
  const sid = r.sid;
  await httpsPost({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }, { 'mcp-session-id': sid });
  let seq = 10;
  async function tool(name, args = {}, timeout = 120000) {
    const id = seq++;
    const res = await httpsPost(
      { jsonrpc: '2.0', id, method: 'tools/call', params: { name: 'studio-playwright__' + name, arguments: args } },
      { 'mcp-session-id': sid }, timeout
    );
    return parseSSE(res.body)[0]?.result;
  }
  return { tool };
}

// Replace relative img src with base64 data URIs (required before encoding as data URI)
function inlineImages(html, htmlDir) {
  return html.replace(/src="([^"]+)"/g, (match, src) => {
    if (src.startsWith('data:') || src.startsWith('http')) return match;
    const absPath = path.resolve(htmlDir, src);
    if (!fs.existsSync(absPath)) {
      console.warn(`  WARN: image not found: ${absPath}`);
      return match;
    }
    const ext = path.extname(absPath).slice(1).toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    const b64 = fs.readFileSync(absPath).toString('base64');
    console.log(`  inline: ${path.basename(absPath)} (${(b64.length * 0.75 / 1024).toFixed(0)}KB)`);
    return `src="data:${mime};base64,${b64}"`;
  });
}

const FONT_OVERRIDE = `
  * { font-family: "Noto Sans TC", "Noto Sans CJK TC", "WenQuanYi Micro Hei", sans-serif !important; }
  code, pre, .code, [class*="mono"] {
    font-family: "JetBrains Mono", "Consolas", "Courier New", monospace !important;
  }
`;

export async function htmlToPdf(tool, htmlPath, outPath) {
  console.log(`\n=== ${path.basename(htmlPath)} ===`);
  const htmlDir = path.dirname(htmlPath);

  let html = fs.readFileSync(htmlPath, 'utf8');

  // Step 1: Strip Google Fonts (causes 60s hang via Squid proxy in this pod)
  html = html
    .replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/g, '')
    .replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/g, '')
    .replace(/<link[^>]*preconnect[^>]*>/g, '');

  // Step 2: Inject Noto Sans TC (system font, confirmed available)
  html = html.replace('<head>', `<head><style>${FONT_OVERRIDE}</style>`);

  // Step 3: Inline relative images as base64 (MUST do before encoding as data URI)
  html = inlineImages(html, htmlDir);

  // Step 4: Encode as data URI (bypasses all network, navigate takes ~2s instead of 60s)
  const dataURI = `data:text/html;base64,${Buffer.from(html).toString('base64')}`;

  console.log('  Navigating via data URI...');
  const t0 = Date.now();
  await tool('browser_navigate', { url: dataURI }, 30000);
  console.log(`  nav: ${Date.now()-t0}ms`);
  await new Promise(r => setTimeout(r, 2500));

  // Step 5: Generate vector PDF via page.pdf()
  const code = `async (page) => {
    await page.addStyleTag({ content: \`
      @page { size: A4 landscape; margin: 0; }
      @media print {
        html, body { margin: 0; padding: 0; background: white; }
        .slide {
          page-break-after: always;
          page-break-inside: avoid;
          box-shadow: none !important;
          margin: 0 !important;
        }
      }
    \`});
    const pdf = await page.pdf({
      format: 'A4', landscape: true, printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    // Buffer constructor is sandboxed out, but Buffer instance methods work
    return pdf.toString('base64');
  }`;

  console.log('  Generating PDF...');
  const t1 = Date.now();
  const result = await tool('browser_run_code', { code }, 120000);
  console.log(`  pdf: ${Date.now()-t1}ms`);

  // Response format: '### Result\n"<base64>"' — extract base64 with regex
  const raw = result?.content?.find(c => c.type === 'text')?.text || '';
  const match = raw.match(/"([A-Za-z0-9+/=\n]+)"/s);
  if (!match) {
    console.error('  ERROR: no base64 in response');
    console.error('  raw:', raw.slice(0, 300));
    return false;
  }
  const b64 = match[1].replace(/\n/g, '');
  if (!b64.startsWith('JVBE')) {  // %PDF in base64
    console.error('  ERROR: not a PDF:', b64.slice(0, 20));
    return false;
  }

  fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
  const size = (fs.statSync(outPath).size / 1024).toFixed(0);
  console.log(`  PDF: ${outPath} (${size}KB)`);
  return true;
}

// CLI usage
if (process.argv[2]) {
  const htmlPath = path.resolve(process.argv[2]);
  const outPath = process.argv[3] || htmlPath.replace(/\.html$/, '.pdf');
  const { tool } = await createMcpSession();
  await htmlToPdf(tool, htmlPath, outPath);
  console.log('\nDone.');
}
