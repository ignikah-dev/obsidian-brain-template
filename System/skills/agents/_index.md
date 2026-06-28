---
para: system
type: 技能定義
domain: 核心技能
status: active
summary: /agents 技能定義
name: agents
description: 列出、切換或新增 Agent 角色
metadata:
  version: 1.1.0
  status: active
  origin: manual
  source_agent: unknown
  source_session: unknown
  use_count: 78
  created: '2026-01-01'
---

# /agents

**觸發**：`/agents`、`/agents new`、`/agents {NAME}`、`/agents use {NAME}`

**作用**：
- 無參數 → 列出所有 Agent（表格）
- `new` → 互動式新增，自動同步 `Identity/Agents/_index.md` 與 `CLAUDE.md`
- `{NAME}` → 顯示單一 Agent 詳情
- `use {NAME}` → 切換為指定 Agent 角色

## 可用 Agent

| Agent | Label | 職責 |
|-------|-------|------|
| [[Identity/Agents/CKO\|CKO]] | `team:cko` | 知識收集、學習地圖、題庫生成、考核回饋 |
| [[Identity/Agents/STRATEGIST\|STRATEGIST]] | `team:strategist` | 策略壓力測試、蘇格拉底式追問 |

完整定義見 `Identity/Agents/`。

## 新增 Agent 流程

1. 在 `Identity/Agents/` 建立 `{NAME}.md`，包含 frontmatter + 角色定義
2. 更新 `Identity/Agents/_index.md` 成員表格
3. 更新本檔案「可用 Agent」表格
4. 更新 `CLAUDE.md` `<AGENTS>` 區塊
