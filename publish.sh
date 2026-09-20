#!/usr/bin/env bash
# 一键发布到 GitHub 并准备 Render 部署。
# 用法：
#   1) 在 GitHub 生成一个有 repo 权限的 Personal Access Token (PAT)
#   2) 运行： GITHUB_TOKEN=ghp_xxx ./publish.sh
#      （可选指定仓库名/用户名：REPO_NAME=adhd-self-assessment GITHUB_USER=你的用户名 GITHUB_TOKEN=xxx ./publish.sh）
set -euo pipefail

REPO_NAME="${REPO_NAME:-adhd-self-assessment}"
GITHUB_USER="${GITHUB_USER:-$(git config user.name)}"
TOKEN="${GITHUB_TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo "❌ 缺少 GITHUB_TOKEN。"
  echo "   请先在 GitHub 生成 PAT（勾选 repo 权限），然后："
  echo "   GITHUB_TOKEN=ghp_xxx ./publish.sh"
  exit 1
fi
if [ -z "$GITHUB_USER" ]; then
  echo "❌ 无法确定 GitHub 用户名，请设置 GITHUB_USER=你的用户名"
  exit 1
fi

echo "→ 仓库：$GITHUB_USER/$REPO_NAME"

# 若远程已存在则跳过创建
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "→ 在 GitHub 创建仓库…"
  curl -s -o /dev/null -w "HTTP %{http_code}\n" \
    -X POST \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -d "{\"name\":\"$REPO_NAME\",\"description\":\"成人 ADHD 自评问卷 · ASRS v1.1 网页版 (Render + GitHub)\",\"auto_init\":false,\"private\":false}" \
    https://api.github.com/user/repos
fi

# 配置远程（用 token 作为密码）
REMOTE="https://x-access-token:${TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE"

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)"
[ "$BRANCH" = "HEAD" ] && BRANCH="main"
git branch -M main

echo "→ 推送至 GitHub…"
git push -u origin main

echo ""
echo "✅ 已推送。下一步在 Render 连接该仓库："
echo "   1. 打开 https://dashboard.render.com  →  New  →  Static Site"
echo "   2. Connect 你的 GitHub 账号，选择仓库 '$REPO_NAME'"
echo "   3. render.yaml 已自动配置；确认后 Create Static Site"
echo "   4. 部署完成后获得 *.onrender.com 永久链接"
