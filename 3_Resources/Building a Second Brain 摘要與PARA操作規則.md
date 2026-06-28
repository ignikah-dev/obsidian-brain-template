---
para: resource
domain: 知識管理
type: 方法論
tags:
  - 第二大腦
  - PARA
  - CODE
  - 知識管理
status: active
summary: Tiago Forte《Building a Second Brain》的可執行摘要，以及適用於本 vault 的 PARA 分類操作規則
source: https://gist.typus.studio/cyw/3c1e23ede86d4ecb9fc884ab7f1e206b#file-building-a-second-brain
---

# Building a Second Brain 摘要與 PARA 操作規則

> 這份筆記是對《Building a Second Brain》的概念摘要與本 vault 的操作轉譯，不收錄原文。

## 一句話

第二大腦不是「把所有資訊都保存起來」，而是建立一套能把外部資訊轉化成未來輸出材料的系統。

## 核心框架：CODE

### Capture：捕捉有共鳴的材料

只捕捉對當前目標、責任、興趣或未來創作可能有用的內容。捕捉的標準不是「重要」，而是「有共鳴、可能被重用」。

在本 vault 的對應：
- 未分類輸入先進 `Inbox/`
- 每日碎片進 `journals/`
- 對話中可沉澱的洞察可先進 `Inbox/`，等待 `/intake`

### Organize：按行動性組織

PARA 的核心不是主題分類，而是行動性分類。越接近當前行動的內容越靠前。

在本 vault 的對應：
- `Projects/`：有目標、有期限、可完成
- `Areas/`：需要長期維護的責任
- `Resources/`：未來可複用的知識
- `Archives/`：已完成、暫停、不再活躍但保留

### Distill：逐層濃縮

筆記要能被未來的自己快速讀懂。整理不是把內容變長，而是讓重點更可見。

在本 vault 的對應：
- frontmatter 的 `summary` 是第一層濃縮
- `_index.md` 的成員描述是第二層濃縮
- 筆記內的「一句話」「決策」「下一步」是第三層濃縮

### Express：把知識轉化成輸出

第二大腦的氧氣是完成的專案。筆記的價值不在保存，而在被用於寫作、決策、學習、專案交付或反思。

在本 vault 的對應：
- `Projects/` 應該主動連回相關 `Resources/`
- `/reflect` 應該把 journal 片段轉成可行動的洞察
- 完成的專案應該歸檔，並留下可複用的 project postmortem

## PARA 分類規則

### 先問：這份內容接下來要推動什麼？

1. 有明確成果、期限、完成條件？放 `Projects/`
2. 是持續維護的責任或標準？放 `Areas/`
3. 是未來可能複用的材料、方法、參考？放 `Resources/`
4. 已完成、過時、暫停、低活躍但要保留？放 `Archives/`
5. 還判斷不出來？先放 `Inbox/`

### Projects 判斷

符合以下條件時歸到 `Projects/`：
- 有具體結果，例如「通過考試」「完成文章」「交付系統」
- 有期限或預計完成時間
- 有完成條件，可以被標記為 done
- 需要組織資源、任務、進度

典型 frontmatter：

```yaml
---
para: project
domain: 知識管理
type: 專案
status: active
deadline: YYYY-MM-DD
summary: 一句話說明
---
```

### Areas 判斷

符合以下條件時歸到 `Areas/`：
- 是長期責任，不會因一次交付而完成
- 需要定期維護標準或狀態
- 會承載多個 projects

例：健康、財務、AI 治理、職涯發展、家庭責任。

### Resources 判斷

符合以下條件時歸到 `Resources/`：
- 是方法論、模板、參考資料、案例、學習筆記
- 當下未必有行動，但未來可能複用
- 可以支援多個 project 或 area

這篇筆記本身就屬於 `Resources/`。

### Archives 判斷

符合以下條件時歸到 `Archives/`：
- project 已完成或取消
- area 不再需要維護
- resource 過時但有歷史價值
- 內容暫時不用，但不應刪除

歸檔不是失敗，是讓活躍系統保持清爽。

## 本 vault 的執行契約

### 入庫時

- 補齊 frontmatter：`para`、`domain`、`type`、`status`、`summary`
- 放到正確 PARA 目錄
- 更新目標目錄 `_index.md`
- 若建立新子目錄，同時建立 `_index.md`

### 整理時

- 優先按行動性分類，不按學科分類
- 不確定時先放 `Inbox/`，不要過度設計
- 同一份內容若同時屬於 project 與 resource，原文放最能推動行動的位置，另一側用 wiki link 連回

### 回顧時

- 每週檢查 active projects 是否仍有下一步
- 檢查 resources 是否有 summary，避免變成資料墳場
- 檢查 archives 是否承接了完成專案的結案紀錄

## 與本模板的關係

本模板已經採用 PARA + Inbox + Identity/System，比原始 PARA 多了 AI 協作所需的治理層。Second Brain 的補強點主要不是新增大結構，而是讓每個資料夾都更明確承擔 CODE 流程中的角色：

- `Inbox/` 承擔 Capture 緩衝
- `Resources/` 承擔 Distill 後的可複用知識
- `Projects/` 承擔 Express 的輸出場域
- `Archives/` 承擔完成與降噪
- `System/` 承擔規則、技能、審批與維護迴圈
