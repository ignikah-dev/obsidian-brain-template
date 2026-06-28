# /agents — 呼叫專門 Agent

列出或呼叫 `Identity/Agents/` 下的專門 agent。

## 執行步驟

1. **讀取 Agent 地圖**
   - 讀取 `Identity/Agents/_index.md`
   - 列出可用 agent、label 與職責

2. **判斷使用者意圖**
   - 若只輸入 `/agents`：列出可用 agent 與簡短用途
   - 若指定 agent：讀取對應定義並切換到該角色工作流
   - 若指定任務但未指定 agent：依任務選擇最合適 agent，並說明理由

3. **執行角色工作流**
   - 遵守該 agent 的觸發方式、輸出格式與邊界
   - 需要讀取外部來源時，保留來源 URL 與擷取日期
   - 需要寫入 vault 時，遵守 PARA 與 `_index.md` 同步規則

4. **輸出報告**
   ```markdown
   ## Agent 執行結果

   - 使用 agent：
   - 處理內容：
   - 產出：
   - 建議下一步：
   ```

## 目前可用 Agent

- CKO (`team:cko`) — 知識收集、學習地圖、題庫生成、考核回饋

## 注意事項

- agent 是工作模式，不是獨立人格。
- agent 可以建議修改知識庫，但 Identity 變更必須走審核。
- 新增 agent 時，需要同步更新 `Identity/Agents/_index.md`。
