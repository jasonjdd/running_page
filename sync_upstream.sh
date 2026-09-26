#!/usr/bin/env bash
# =============================================================================
# sync_upstream.sh — 自动合并上游 yihong0618/running_page 的更新到个人 fork
#
# 用法:  bash sync_upstream.sh            # 自动合并并推送 master
#        UPSTREAM_URL=... bash sync_upstream.sh   # 自定义上游地址（如本地 file:// 路径）
#        DRY_RUN=1 bash sync_upstream.sh  # 只合并+验证，不推送
#
# 策略（与 2026-09-26 首次大合并一致）:
#   1. 拉取 origin 最新数据提交（CI 每天自动提交的数据）
#   2. fetch 上游 master（直连 GitHub，失败自动切 ghfast.top 镜像）
#   3. 创建备份分支，在合并分支上 `git merge -X theirs`（冲突取上游）
#   4. 自动解决 modify/delete 冲突，恢复个人数据文件（activities.json、assets）
#   5. 校验个人定制标记（TYPE_DICT/workout_name/30s 合并/周月统计等），
#      若上游覆盖了定制文件则中止并报告，绝不静默丢弃定制
#   6. Python 语法/lint + 前端构建验证通过后，快进合并到 master 并推送
# =============================================================================
set -euo pipefail

UPSTREAM_URL="${UPSTREAM_URL:-https://github.com/yihong0618/running_page.git}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-master}"
MIRROR_URL="https://ghfast.top/${UPSTREAM_URL}"

# 个人定制标记（文件:特征串）。合并后缺失即认为上游覆盖了定制代码，必须人工移植。
CUSTOM_MARKERS=(
  "run_page/config.py:TYPE_DICT"
  "run_page/generator/db.py:workout_name"
  "run_page/generator/db.py:start_date_local"
  "run_page/gpxtrackposter/track.py:TYPE_DICT.get"
  "run_page/gpxtrackposter/track_loader.py:0 < dt < 30"
  "run_page/garmin_sync.py:upload_fit_file_to_strava"
  "run_page/garmin_device_adaptor.py:4274"
  "src/core/hooks/useWeeklyMonthlyStats.ts:useWeeklyMonthlyStats"
  "src/components/WeeklyMonthlyStats.tsx:WeeklyMonthlyStats"
  "src/themes/classic/utils/const.ts:WEEK_STATISTIC_MESSAGE"
  "src/themes/classic/utils/utils.ts:titleForType"
  "src/themes/classic/components/RunTable/RunRow.tsx:displayTitle"
  "src/themes/classic/components/Header/index.tsx:useWeeklyMonthlyStats"
  "src/themes/dashboard/index.tsx:WeeklyMonthlyStats"
  ".github/workflows/run_data_sync.yml:garmin_cn"
)

log() { echo "[sync_upstream] $*"; }
die() { echo "[sync_upstream] 错误: $*" >&2; exit 1; }

# ── 0. 前置检查 ──────────────────────────────────────────────────────────────
[ "$(git rev-parse --abbrev-ref HEAD)" = "master" ] || die "请先切换到 master 分支"
[ -z "$(git status --porcelain)" ] || die "工作区有未提交改动，请先处理"

log "拉取 origin 最新数据提交（CI 自动同步的数据）..."
git pull --ff-only origin master || die "拉取 origin 失败，请先处理冲突"

# ── 1. fetch 上游 ────────────────────────────────────────────────────────────
git remote get-url upstream >/dev/null 2>&1 || git remote add upstream "$UPSTREAM_URL"
git remote set-url upstream "$UPSTREAM_URL"
if ! git fetch upstream "$UPSTREAM_BRANCH"; then
  log "直连 GitHub 失败，尝试镜像 $MIRROR_URL"
  git remote set-url upstream "$MIRROR_URL"
  git fetch upstream "$UPSTREAM_BRANCH" || die "fetch 上游失败（可设置 UPSTREAM_URL=file:///本地路径 重试）"
fi

if git merge-base --is-ancestor "upstream/$UPSTREAM_BRANCH" HEAD; then
  log "已是最新，无需合并"
  exit 0
fi

UPSTREAM_TIP=$(git rev-parse --short "upstream/$UPSTREAM_BRANCH")
NEW_COMMITS=$(git rev-list --count HEAD.."upstream/$UPSTREAM_BRANCH")
log "发现 $NEW_COMMITS 个上游新提交（tip: $UPSTREAM_TIP）"

# ── 2. 备份 ──────────────────────────────────────────────────────────────────
STAMP=$(date +%Y%m%d-%H%M)
BACKUP_BRANCH="backup/pre-upstream-$STAMP"
MERGE_BRANCH="merge-upstream-$STAMP"
git branch "$BACKUP_BRANCH" HEAD
git push origin "$BACKUP_BRANCH" || log "备份分支推送失败（不影响继续，本地备份仍存在）"
log "备份分支: $BACKUP_BRANCH"

# ── 3. 合并（-X theirs：内容冲突取上游）─────────────────────────────────────
git checkout -b "$MERGE_BRANCH"
if ! git merge "upstream/$UPSTREAM_BRANCH" -X theirs --no-edit \
  -m "Merge upstream running_page ($UPSTREAM_TIP)"; then
  log "存在冲突，自动解决 modify/delete（我们改过+上游删除→删除；我们删除+上游改过→取上游）..."
  while read -r code f; do
    case "$code" in
      UD) git rm -q --ignore-unmatch "$f" ;;
      DU) git checkout --theirs -- "$f" && git add "$f" ;;
      *) die "无法自动解决的冲突 ($code $f)，请人工处理（分支 $MERGE_BRANCH）" ;;
    esac
  done < <(git status --porcelain | awk '$1 ~ /^UU|^UD|^DU|^AA|^AU|^UA|^DD/ {print $1, $2}')
  git commit --no-edit || die "合并提交失败"
fi

# ── 4. 恢复个人数据文件（-X theirs 可能取上游版本；仅恢复被合并改动过的）────
log "恢复个人数据文件..."
for f in $(git diff HEAD --name-only -- assets/ src/static/activities.json); do
  git checkout HEAD -- "$f" 2>/dev/null || true
done

# ── 5. 定制标记校验 ──────────────────────────────────────────────────────────
log "校验个人定制代码完整性..."
MISSING=0
for m in "${CUSTOM_MARKERS[@]}"; do
  f="${m%%:*}"
  pat="${m#*:}"
  if [ ! -f "$f" ] || ! grep -qF "$pat" "$f" 2>/dev/null; then
    echo "  ✗ 标记丢失: $f（特征: $pat）"
    MISSING=1
  fi
done
if [ "$MISSING" -eq 1 ]; then
  echo
  echo "上游更新覆盖了部分个人定制文件，已中止（不会推送）。"
  echo "请在本分支 $MERGE_BRANCH 上参照备份分支 $BACKUP_BRANCH 手工移植后："
  echo "  git checkout master && git merge --ff-only $MERGE_BRANCH && git push origin master"
  exit 1
fi
log "定制标记全部通过"

# ── 6. 验证（Python 语法 + lint；前端构建可用 SKIP_BUILD=1 跳过）─────────────
log "验证: Python 语法 + lint..."
python -m compileall -q run_page || die "Python 语法检查失败"
python -m black --check . 2>/dev/null || die "black 检查失败"
python -m ruff check . || die "ruff 检查失败"

if [ "${SKIP_BUILD:-0}" != "1" ] && [ -d node_modules ]; then
  log "验证: 前端构建..."
  CI=true npx -y pnpm@8.9.0 build >/dev/null || die "前端构建失败"
fi

# ── 7. 快进合并到 master 并推送 ──────────────────────────────────────────────
git checkout master
git merge --ff-only "$MERGE_BRANCH"
if [ "${DRY_RUN:-0}" = "1" ]; then
  log "DRY_RUN 模式：已完成合并到本地 master，未推送"
else
  git push origin master
  log "完成：上游 $NEW_COMMITS 个提交已合并并推送到 master"
fi
