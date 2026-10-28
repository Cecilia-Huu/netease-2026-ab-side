# 我的2026 AB面 · V3.0 交互原型

用于产品 Mentor 评审的 React + TypeScript + Vite 静态 Demo。主态选四首歌录制 A 面，翻面后选一道 B 面问题分享；好友打开链接直接选一首歌，得到独立迷你唱片。主态可切换 0、1、3、6 位模拟好友，好友歌曲直接呈现在 B 面唱片上。所有歌曲推荐、听歌行为、好友记录和艺人内容均为演示素材，不连接网易云音乐接口。

线上预览：<https://cecilia-huu.github.io/netease-2026-ab-side/>

本地运行：

```bash
npm install
npm run dev
```

浏览器打开 <http://127.0.0.1:5173/>。桌面端左侧提供评审导航；手机端按单页面流程体验。独立客态示例链接：<https://cecilia-huu.github.io/netease-2026-ab-side/?view=guest&a=A01%3As25%2CA03%3As20%2CA05%3As09%2CA06%3As21&b=B03&name=%E9%98%BF%E4%BA%91>。

```bash
npm run build
npm run screenshots
```

截图保存于 `screenshots/v3/`，每个 PNG 为独立的 390 × 844 手机页面。截图脚本使用本机 Google Chrome，需要先启动开发服务器。

分享链接将 A 面题目与歌曲 ID、选中的 B 面题目 ID 写入 URL，可在另一台设备上直接打开客态选歌页。静态站点没有跨设备实时数据同步；好友贡献仅保存在当前页面会话，0/1/3/6 位好友状态均为明确标注的评审演示，不代表真实线上参与。原有 GitHub Pages 工作流保留。
