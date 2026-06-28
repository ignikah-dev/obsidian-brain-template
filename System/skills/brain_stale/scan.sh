#!/usr/bin/env bash
# /stale scan — 知識庫腐敗偵測
# 用法: bash scan.sh [VAULT_ROOT] [STALE_DAYS]
#   VAULT_ROOT  倉庫根目錄，預設為當前目錄
#   STALE_DAYS  幾天未更新視為僵化，預設 90

set -euo pipefail

VAULT_ROOT="${1:-.}"
STALE_DAYS="${2:-90}"
TODAY=$(date +%Y-%m-%d)
WORKDIR="$VAULT_ROOT/System/working-memory"
REPORT="$WORKDIR/stale-$TODAY.md"

mkdir -p "$WORKDIR"

# ---------- helpers ----------

count_lines() { echo "$1" | grep -c . 2>/dev/null || echo 0; }

# ---------- 掃描 ----------

{
echo "---"
echo "type: stale-report"
echo "date: $TODAY"
echo "stale_days: $STALE_DAYS"
echo "status: pending-review"
echo "---"
echo ""
echo "# /stale 報告 — $TODAY"
echo ""

# 1. 空洞：目錄下有 _index.md 但無其他 .md 成員
echo "## 空洞（目錄成員為空）"
echo ""
HOLLOW=""
while IFS= read -r idx; do
  dir=$(dirname "$idx")
  # Skills 子目錄只有 _index.md 是正常結構（skill 即文件），跳過
  case "$dir" in */skills/*) continue ;; esac
  n=$(find "$dir" -maxdepth 1 -name "*.md" ! -name "_index.md" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$n" -eq 0 ]; then
    HOLLOW="$HOLLOW\n- $dir/"
  fi
done < <(find "$VAULT_ROOT" -name "_index.md" \
           ! -path "*/.git/*" \
           ! -path "*/working-memory/*" \
           ! -path "*/session_logs/*")
if [ -z "$HOLLOW" ]; then
  echo "（無）"
else
  echo -e "$HOLLOW"
fi
echo ""

# 2. 孤島：.md 檔案未被任何 _index.md 引用（basename 或 wikilink）
echo "## 孤島（未被 _index.md 列入）"
echo ""
ORPHAN=""
while IFS= read -r f; do
  base=$(basename "$f" .md)
  # grep 搜尋 basename，支援子路徑引用（如 [[practice/diagnostic-junior]]）
  if ! grep -rql "$base" "$VAULT_ROOT" --include="_index.md" 2>/dev/null; then
    ORPHAN="$ORPHAN\n- $f"
  fi
done < <(find "$VAULT_ROOT" -name "*.md" \
           ! -name "_index.md" \
           ! -path "*/.git/*" \
           ! -path "*/.claude/*" \
           ! -path "*/.codex/*" \
           ! -path "*/journals/*" \
           ! -path "*/working-memory/*" \
           ! -path "*/session_logs/*" \
           ! -path "*/templates/*" \
           ! -path "*/assets/*" \
           ! -path "*/skills/office_*/*" \
           ! -name "AGENTS.md" \
           ! -name "README.md" \
           ! -name "SKILL.md")
if [ -z "$ORPHAN" ]; then
  echo "（無）"
else
  echo -e "$ORPHAN"
fi
echo ""

# 3. 僵化：frontmatter status: active 但超過 STALE_DAYS 天未更新
echo "## 僵化（status: active 且超過 ${STALE_DAYS} 天未更新）"
echo ""
STALE=""
while IFS= read -r f; do
  STALE="$STALE\n- $f"
done < <(find "$VAULT_ROOT" -name "*.md" \
           ! -path "*/.git/*" \
           ! -path "*/working-memory/*" \
           ! -path "*/session_logs/*" \
           -mtime +"$STALE_DAYS" | \
         xargs grep -l "status: active" 2>/dev/null || true)
if [ -z "$STALE" ]; then
  echo "（無）"
else
  echo -e "$STALE"
fi
echo ""

# 4. 混沌：Inbox 積壓計數
echo "## 混沌（Inbox 積壓）"
echo ""
INBOX_COUNT=$(find "$VAULT_ROOT/Inbox" -name "*.md" ! -name "_index.md" 2>/dev/null | wc -l | tr -d ' ')
if [ "$INBOX_COUNT" -eq 0 ]; then
  echo "Inbox 已清空 ✓"
else
  echo "Inbox 未歸檔筆記：**${INBOX_COUNT} 篇**"
  find "$VAULT_ROOT/Inbox" -name "*.md" ! -name "_index.md" 2>/dev/null | while read -r f; do
    echo "- $f"
  done
fi
echo ""

# 5. 斷裂：wikilink [[target]] 指向不存在的 .md
echo "## 斷裂（wikilink 目標不存在）"
echo ""
BROKEN=""
while IFS= read -r link; do
  # 去掉 alias 部分 (link|alias)
  target="${link%%|*}"
  # 找對應檔案
  found=$(find "$VAULT_ROOT" -name "${target}.md" ! -path "*/.git/*" 2>/dev/null | head -1)
  if [ -z "$found" ]; then
    BROKEN="$BROKEN\n- [[$link]]"
  fi
done < <(grep -roh '\[\[[^]#|]*[|]?[^]]*\]\]' "$VAULT_ROOT" \
           --include="*.md" 2>/dev/null | \
         sed 's/\[\[//;s/\]\]//' | \
         sort -u)
if [ -z "$BROKEN" ]; then
  echo "（無）"
else
  echo -e "$BROKEN"
fi
echo ""

echo "---"
echo ""
echo "**下一步**：將此報告交給 CKO，執行分類修復。"

} > "$REPORT"

echo "掃描完成 → $REPORT"
