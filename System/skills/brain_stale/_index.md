---
para: system
type: 技能定義
domain: 核心技能
status: active
summary: /stale 技能定義，掃描知識庫腐敗並輸出結構化報告
name: stale
description: 偵測知識庫中的六種腐敗：孤島、冗餘、僵化、混沌、斷裂、空洞，輸出可操作的修復清單
metadata:
  version: 1.0.0
  status: active
  origin: manual
  source_agent: CKO
  source_session: unknown
  use_count: 0
  created: '2026-06-27'
---

# /stale

**觸發**：`/stale`、`/stale {DAYS}`、「掃描腐敗」、「知識庫健康檢查」

**作用**：對整個知識庫執行腐敗偵測，輸出 `System/working-memory/stale-YYYY-MM-DD.md`，供 CKO 執行修復。

---

## 執行流程

### Step 1：執行 shell 掃描

```bash
bash System/skills/brain_stale/scan.sh . [DAYS]
```

- `DAYS` 預設 90，可覆蓋：`/stale 60` → 60 天未更新即視為僵化

### Step 2：讀取報告

讀取 `System/working-memory/stale-YYYY-MM-DD.md`，逐區塊解讀。

### Step 3：輸出分類摘要

以表格呈現各類腐敗計數：

| 類型 | 數量 | 優先級 |
|------|------|--------|
| 空洞 | N | 低（補成員清單即可） |
| 孤島 | N | 中（確認是否應加入 _index.md） |
| 僵化 | N | 中（確認是否仍 active） |
| 混沌 | N | 高（執行 /intake 歸檔） |
| 斷裂 | N | 高（修正 wikilink） |

冗餘（重複內容）無法純靠 shell 偵測，由 CKO 在閱讀過程中人工判斷。

### Step 4：提出修復建議

每類提出具體行動，使用者確認後執行：

- **混沌** → 執行 `/intake` 清空 Inbox
- **斷裂** → 修正 wikilink 目標路徑或刪除失效引用
- **孤島** → 加入對應 `_index.md` 成員清單
- **僵化** → 確認內容是否仍有效，更新 `status` 或 `updated` 欄位
- **空洞** → 補 `_index.md` 成員清單，或確認目錄是否應移除
- **冗餘** → 合併或刪除重複內容，保留最完整版本

### Step 5：更新報告狀態

修復完成後，將報告 frontmatter 的 `status: pending-review` 改為 `status: done`。

---

## 參數

| 參數 | 說明 | 預設 |
|------|------|------|
| `DAYS` | 幾天未更新視為僵化 | 90 |

---

## 輸出位置

`System/working-memory/stale-YYYY-MM-DD.md`

---

## 與 LLM-Wiki Lint 的分工

兩者都是健康檢查，但偵測層次不同：

| 面向 | `/stale` | LLM-Wiki Lint（`/wiki lint`）|
|------|----------|------------------------------|
| 層次 | **結構性**腐敗 | **內容性**腐敗 |
| 偵測對象 | 檔案系統與連結 | 頁面內容與知識品質 |
| 孤島 | ✓ 未被 `_index.md` 列入 | ✓ 無反向引用的知識條目 |
| 斷裂 | ✓ wikilink 指向不存在的檔案 | — |
| 空洞 | ✓ 目錄無成員 | — |
| 僵化 | ✓ `status: active` 但 mtime 過舊 | — |
| 混沌 | ✓ Inbox 積壓計數 | — |
| 矛盾 | — | ✓ 兩頁面陳述不一致 |
| 過時聲明 | — | ✓ 外部來源可能已更新 |
| 缺漏交叉引用 | — | ✓ 概念相關但未互連 |
| 工具 | shell 腳本（自動） | CKO 閱讀推理（半自動） |

**建議順序**：先跑 `/stale` 修結構，再跑 `/wiki lint` 修內容。結構不穩時做內容整合是浪費。

## 相關技能

- `[[System/skills/brain_intake/_index|LLM-Wiki]]` — `/wiki lint` 負責內容品質，與 /stale 互補
- `/reflect` — 週度蒸餾，著重洞察提煉而非問題偵測
