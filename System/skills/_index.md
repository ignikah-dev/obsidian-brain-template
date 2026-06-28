---
para: system
type: 技能索引
status: active
summary: 可用技能清單，各技能定義在 System/skills/{name}/_index.md
---

# 技能系統

> 技能是預定義的工作流，用一個命令觸發，AI 按預設流程執行。

## Brain 技能

| 目錄 | 觸發 | 說明 |
|------|------|------|
| [[System/skills/agents/_index\|agents/]] | `/agents` | 列出、切換或新增 Agent |
| [[System/skills/brain_intake/_index\|brain_intake/]] | `/intake` `/wiki` | LLM-Wiki：Ingest / Query / Lint |
| [[System/skills/brain_writing/_index\|brain_writing/]] | `/writing` | 依使用者風格執行寫作 |
| [[System/skills/brain_reflect/_index\|brain_reflect/]] | `/reflect` | 聚合週日誌、提煉洞察 |
| [[System/skills/brain_stale/_index\|brain_stale/]] | `/stale` | 掃描知識庫腐敗，輸出修復清單 |

## Office 技能

| 目錄 | 觸發 | 說明 |
|------|------|------|
| [[System/skills/office_pdf/SKILL\|office_pdf/]] | `/pdf` | PDF 讀取與表單處理 |
| [[System/skills/office_docx/SKILL\|office_docx/]] | `/docx` | Word 文件操作 |
| [[System/skills/office_pptx/SKILL\|office_pptx/]] | `/pptx` | PowerPoint 投影片生成 |
| [[System/skills/office_xlsx/SKILL\|office_xlsx/]] | `/xlsx` | Excel 試算表操作 |
