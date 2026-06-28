---
para: resource
domain: 知識管理
type: 評估
tags:
  - 第二大腦
  - PARA
  - vault設計
  - 缺口分析
status: active
summary: 對照 Building a Second Brain 檢查目前 Obsidian vault 模板的缺口與改進建議
source: https://gist.typus.studio/cyw/3c1e23ede86d4ecb9fc884ab7f1e206b#file-building-a-second-brain
---

# Second Brain 模板缺口評估

## 結論

目前模板的骨架已經正確：`Inbox / Projects / Areas / Resources / Archives` 對應 PARA，`Identity / System` 補上 AI 協作與治理層。主要缺口不在頂層目錄，而在「從捕捉到輸出」的操作閉環還不夠具體。

## 已具備的能力

### 1. PARA 骨架完整

本 vault 已有：
- `Inbox/`：低摩擦收集
- `Projects/`：有期限、有完成條件的工作
- `Areas/`：持續責任
- `Resources/`：可複用知識
- `Archives/`：完成或不活躍內容

這符合 Second Brain 的 Organize 原則。

### 2. AI 治理層比原始 PARA 更完整

`Identity/` 與 `System/` 是合理擴充：
- `Identity/` 解決 AI 不知道使用者是誰的問題
- `System/` 解決規則、技能、候選偏好、審批流程的問題
- `.claude/CLAUDE.md` 定義了分形索引與變更協議

這讓模板不只是 PKM，也是一套 AI 協作作業系統。

### 3. 分形索引方向正確

`_index.md` 作為 L2 地圖，frontmatter 作為 L3 契約，能讓 AI 快速定位內容。這與 Second Brain 的「讓內容可重用、可找回」一致。

## 主要缺口

### 缺口 1：`System/OPERATING_RULES.md` 被引用但不存在

`AGENTS.md` 與 `.claude/CLAUDE.md` 都把 `System/OPERATING_RULES.md` 視為 canonical source，但目前工作區沒有這個檔案。

影響：
- AI 入口文件與實際檔案結構不一致
- 新 agent 可能先讀到缺失檔案，降低啟動可靠性
- 操作規則散落在 `.claude/CLAUDE.md`，不利於 Codex/Claude 共用

建議：
- 建立 `System/OPERATING_RULES.md`
- 從 `.claude/CLAUDE.md` 抽出跨工具通用規則
- `.claude/CLAUDE.md` 保留 Claude runtime 細節

此項屬於系統規則補齊，應視為可提案的中等影響變更。

### 缺口 2：Capture 標準還不夠明確

目前 `Inbox/_index.md` 說明「想到什麼就丟進來」，但沒有定義什麼值得捕捉。

風險：
- Inbox 可能變成雜物堆
- AI 只能分類，無法判斷哪些內容值得沉澱
- 使用者會捕捉過多低價值材料

建議補充捕捉準則：
- 與當前 project 有關
- 與長期 area 有關
- 引發共鳴或反覆出現
- 可作為未來輸出的素材
- 可改變決策、行動或理解

### 缺口 3：Distill 流程薄弱

模板已有 `summary`，但還沒有明確要求筆記內部做 progressive summarization。

風險：
- Resources 會累積長筆記，但未來重用成本高
- `_index.md` 只能看到一句摘要，看不到可直接拿來輸出的要點

建議建立筆記內部慣例：
- `## 一句話`
- `## 可複用重點`
- `## 使用場景`
- `## 相關連結`
- `## 下一步`

不必所有筆記都強制套用，但方法論、學習筆記、外部文章摘要應優先採用。

### 缺口 4：Express 沒有被明確設計成工作流

目前 `/intake` 和 `/reflect` 較完整，但「把知識轉成輸出」的技能還不明確。

風險：
- vault 會偏向收藏與整理，而不是完成專案
- Projects 與 Resources 的連結可能不足
- 完成專案後沒有穩定產生可複用資產

建議新增或擴充技能：
- `/express`：從一個 project 或主題召回相關 Resources，產生輸出草稿
- `/project-kickoff`：建立專案時自動搜尋相關資源、定義完成條件
- `/project-close`：結案、歸檔、產出 postmortem 與可複用模板

### 缺口 5：Projects 完成後的歸檔規則不夠具體

`Projects/_index.md` 有「完成後歸檔」，但沒有結案 checklist。

建議補上 project close checklist：
- 完成條件是否達成
- 相關任務是否結束
- 是否有可複用方法要寫入 `Resources/`
- 是否有決策或教訓要保留
- project 是否移入 `Archives/`
- `Projects/_index.md` 與 `Archives/_index.md` 是否同步

### 缺口 6：Resources 缺少「可重用性」檢查

`Resources/` 已定義方法論、模板、案例、學習筆記，但缺少資源成熟度標準。

建議給 Resources 增加健康檢查：
- 有沒有 `summary`
- 有沒有使用場景
- 有沒有連到至少一個 project、area 或其他 resource
- 是否已過時
- 是否只是原始資料，還沒有被蒸餾

### 缺口 7：週度回顧尚未連回 PARA 健康

`/reflect` 聚合 journals 與候選偏好，但還沒有明確檢查 PARA 結構健康。

建議每週回顧加入：
- active projects 是否仍有下一步
- inbox 是否堆積
- resources 是否新增但未蒸餾
- areas 是否有責任失衡或長期未更新
- archives 是否需要接收已完成內容

## 優先修補順序

1. 建立 `System/OPERATING_RULES.md`，解決 canonical source 缺失
2. 補強 `System/skills.md`：新增 `/express`、`/project-kickoff`、`/project-close`
3. 補強 `Inbox/_index.md`：加入 capture 標準
4. 建立 Resources 筆記模板：加入一句話、可複用重點、使用場景
5. 建立 project close checklist
6. 讓 `/reflect` 同時輸出 PARA 健康檢查

## 不建議改動

### 不建議新增更多頂層目錄

目前的頂層結構已足夠。缺口是操作流程，不是分類不足。

### 不建議把 PARA 變成硬規則表

本模板的優勢是「弱結構，強智能」。Second Brain 的原則應轉成判斷準則，而不是過度僵化的 if-else。

### 不建議自動修改 Identity

Identity 是高影響區域。即使 Second Brain 強調自我表達與身份轉變，這類變更仍應經過候選池與審批。

## 可直接採納的最小改動

- 新增 Second Brain 摘要與 PARA 操作規則筆記
- 在 `Resources/_index.md` 登記這份方法論
- 把 `System/OPERATING_RULES.md` 缺失列為待修補項
- 暫不修改 Identity 或頂層目錄

這樣能補上知識資產層，不會觸碰高風險治理結構。
