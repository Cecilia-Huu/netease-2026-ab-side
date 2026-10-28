# 我的2026 AB面 · V2.0 交互原型

用于产品 Mentor 评审的 React + TypeScript + Vite 静态 Demo。A面选择4首歌，好友为B面贡献1首歌，结果页展示可翻面的唱片与迷你黑胶收藏墙。所有歌曲推荐、好友记录及艺人内容均为演示素材，不连接网易云音乐接口。

线上预览：<https://cecilia-huu.github.io/netease-2026-ab-side/>

本地运行：

```bash
npm install
npm run dev
```

浏览器打开 <http://127.0.0.1:5173/>。桌面端左侧提供12个评审节点；手机端按单页面流程体验。结果页的「评审演示模式」可切换0、1、3位模拟好友。独立客态示例链接：<https://cecilia-huu.github.io/netease-2026-ab-side/?view=guest&a=A01%3As01%2CA03%3As04%2CA05%3As09%2CA06%3As12&name=%E9%98%BF%E4%BA%91>。

```bash
npm run build
npm run screenshots
```

截图保存于 `screenshots/v2/`，每个PNG为独立的390 × 844手机页面。截图脚本使用本机Google Chrome，需要先启动开发服务器。

分享链接将A面题目和歌曲ID写入URL，能在另一台设备上打开客态入口。静态站点没有跨设备实时数据同步；好友贡献保存在当前页面会话，0/1/3位好友状态均为明确标注的评审演示，不代表真实线上参与。
