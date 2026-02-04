# Fancy GM Client

游戏管理工具前端客户端

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js (数据分析页面)

## 项目结构

```
fancy-gm-client/
├── web/
│   └── static/
│       ├── index.html          # 主页面
│       ├── history.html        # 历史记录页面
│       ├── analytics.html      # 数据分析页面
│       ├── missinglist.html    # 漏发名单页面
│       ├── css/                # 样式文件
│       └── js/                 # JavaScript 文件
└── README.md
```

## 功能特性

- ✅ 批量文件上传（支持拖拽）
- ✅ 实时解析进度显示
- ✅ 数据表格展示（分页、排序、筛选）
- ✅ 多工作表支持
- ✅ 下载为 Excel 或 CSV 格式
- ✅ 数据分析与可视化
- ✅ 历史记录管理
- ✅ 漏发名单管理
- ✅ 奖励补发功能

## 使用说明

### 开发环境

前端为纯静态文件，无需构建工具，可直接在浏览器中打开。

### 部署

1. 将 `web/static` 目录下的文件部署到 Web 服务器
2. 配置后端 API 地址（默认：`http://localhost:8080`）
3. 确保后端服务已启动

### API 配置

前端通过 Fetch API 调用后端接口，默认 API 地址为：

```javascript
const API_BASE = 'http://localhost:8080/api';
```

如需修改，请编辑各 JS 文件中的 API 调用地址。

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## License

MIT
