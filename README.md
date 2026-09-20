# 成人 ADHD 自评问卷（网页版 · ASRS v1.1）

一个纯静态、零依赖的网页版 ADHD 自我筛查工具，基于 WHO 与哈佛医学院联合开发的
**成人 ADHD 自评量表（Adult ADHD Self-Report Scale, v1.1）**。共 18 题，作答后即时出结果。

> ⚠️ 本工具为**自我筛查**，不能替代医学诊断。结果异常请前往正规医院精神科/心理科就诊。

## 特性
- 18 题完整 ASRS v1.1（Part A 6 题核心筛查 + Part B 12 题补充症状）
- 按官方 Screener 阈值计分：核心 6 题 ≥4 题阳性即提示阳性
- 纯前端，无后端、无追踪、无依赖；可直接静态托管
- 响应式 + 深色主题，手机/桌面都可用

## 本地预览
```bash
cd adhd-self-assessment
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 部署到 Render（连接 GitHub 仓库）
本项目用 `render.yaml` 声明为 Render 静态站点，连接 GitHub 后自动部署。

**方式 A：用脚本一键建仓库并推送（推荐）**
1. 在 GitHub 生成 PAT（勾选 `repo` 权限）
2. 运行：
   ```bash
   GITHUB_TOKEN=ghp_xxx ./publish.sh
   ```

**方式 B：手动**
1. 在 GitHub 新建仓库（如 `adhd-self-assessment`），把本目录内容 push 上去
2. 打开 https://dashboard.render.com → **New** → **Static Site**
3. Connect GitHub，选择该仓库
4. Render 读取 `render.yaml` 自动配置；点 **Create Static Site**
5. 完成后获得 `https://<你的服务名>.onrender.com` 永久链接

> 免费版 Render 静态站点：每月带宽充足、自动 HTTPS、每次 push 自动重新部署。

## 文件结构
```
index.html    页面结构
styles.css    样式（深色主题）
app.js        量表数据 + 渲染 + 计分逻辑
render.yaml   Render 静态站点部署配置
publish.sh    一键建 GitHub 仓库并推送
```

## 量表出处
Kessler R.C. et al. (2005). *The World Health Organization Adult ADHD Self-Report Scale (ASRS): a short screening scale for use in the general population.* Psychological Medicine, 35(2), 245–256.
