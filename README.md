# 前端技术文档

## 技术栈

### 核心技术
- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **JavaScript (ES6+)** - 交互逻辑
- **Fetch API** - HTTP 请求
- **Chart.js** - 数据可视化（仅数据分析页面）

### 无构建工具
本项目前端为纯静态文件，无需 Webpack、Vite 等构建工具，直接通过浏览器加载。

## 项目结构

```
web/
├── static/
│   ├── index.html          # 主页面（文件上传/处理）
│   ├── history.html        # 历史记录页面
│   ├── analytics.html      # 数据分析页面
│   ├── missinglist.html    # 漏发名单页面
│   ├── css/
│   │   ├── style.css       # 主样式
│   │   ├── history.css     # 历史记录样式
│   │   ├── analytics.css   # 数据分析样式
│   │   └── missinglist.css # 漏发名单样式
│   └── js/
│       ├── app.js          # 主页面逻辑
│       ├── history.js      # 历史记录逻辑
│       ├── analytics.js    # 数据分析逻辑
│       └── missinglist.js  # 漏发名单逻辑
```

## 页面说明

### 1. 主页面 (index.html)

**功能**：
- 文件/文件夹批量上传
- 参数选择（处理模式）
- 处理进度显示
- 结果表格展示
- 数据筛选
- 结果下载（CSV/Excel）

**主要组件**：
- 左侧导航栏
- 文件上传区域
- 参数选择区域
- 进度显示区域
- 结果表格区域
- 下载按钮

### 2. 历史记录页面 (history.html)

**功能**：
- 历史任务列表
- 任务搜索/筛选
- 任务详情查看
- 任务删除

**主要组件**：
- 任务列表表格
- 搜索框
- 详情模态框

### 3. 数据分析页面 (analytics.html)

**功能**：
- 任务/工作表选择
- 数据统计概览
- 图表可视化
- 排行榜专项分析

**主要组件**：
- 任务选择下拉框
- 统计卡片
- Chart.js 图表容器
- 排行榜分析表格

### 4. 漏发名单页面 (missinglist.html)

**功能**：
- 漏发名单拉取
- 数据筛选/分组
- 榜单配置管理
- 奖励补发

**主要组件**：
- 三个子页签（名单拉取、奖励补发、榜单配置）
- 数据表格
- 配置表单
- 补发操作区域

## 核心功能实现

### 1. 文件上传

**实现位置**：`app.js`

```javascript
// 文件选择处理
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    // 处理文件列表
}

// 上传到服务器
async function uploadFiles(files, mode, archive) {
    const formData = new FormData();
    // 构建 FormData
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });
}
```

**特点**：
- 支持多文件选择
- 支持文件夹上传（通过 `webkitdirectory`）
- 异步上传，显示进度

### 2. 数据筛选

**实现位置**：`app.js`

```javascript
// 动态创建筛选输入框
function createFilterInputs(columns) {
    // 根据列名创建输入框
}

// 筛选逻辑
function filterData(data, filters) {
    return data.filter(row => {
        // 应用所有筛选条件
    });
}
```

**特点**：
- 动态生成筛选输入框
- 实时筛选（防抖处理）
- 支持多列筛选

### 3. 数据可视化

**实现位置**：`analytics.js`

**使用的库**：Chart.js

```javascript
// 创建图表
function createChart(canvasId, type, data, options) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: type,
        data: data,
        options: options
    });
}
```

**图表类型**：
- 柱状图（排名分布）
- 折线图（时间序列）
- 饼图（数据分布）

### 4. 状态管理

**实现位置**：各页面的 JS 文件

**状态对象**：
```javascript
const missingListState = {
    uploadedPlayers: [],      // 上传的玩家列表
    filteredData: [],        // 筛选后的数据
    currentResendIid: 'bydr', // 当前补发的游戏类型
    iidConfigs: {},          // 各游戏类型的配置
    superLimits: {}          // 超级奖限制
};
```

**特点**：
- 使用对象集中管理状态
- 状态变更触发 UI 更新

### 5. API 调用

**统一使用 Fetch API**：

```javascript
// GET 请求
async function fetchData(url) {
    const response = await fetch(url);
    return await response.json();
}

// POST 请求
async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}
```

## 样式设计

### 设计原则
- **简约科技感** - 简洁的界面，现代化的设计
- **浅色主题** - 以浅色为主色调
- **响应式布局** - 适配不同屏幕尺寸

### 主要样式类

```css
/* 导航栏 */
.nav-container { }
.nav-item { }
.nav-link { }

/* 卡片 */
.card { }
.card-header { }
.card-body { }

/* 按钮 */
.btn { }
.btn-primary { }
.btn-secondary { }

/* 表格 */
.data-table { }
.table-header { }
.table-body { }

/* 表单 */
.form-group { }
.form-input { }
.form-select { }
```

### 颜色方案

```css
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #17a2b8;
    --light-bg: #f8f9fa;
    --border-color: #dee2e6;
}
```

## 交互逻辑

### 1. 页面导航

**实现**：通过 `data-page` 属性切换页面

```javascript
function switchPage(pageName) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    // 显示目标页面
    document.getElementById(pageName).style.display = 'block';
}
```

### 2. 页签切换

**实现**：通过 `data-tab` 属性切换页签

```javascript
function switchTab(tabName) {
    // 移除所有活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // 添加活动状态
    event.target.classList.add('active');
    // 显示对应内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(tabName).style.display = 'block';
}
```

### 3. 模态框

**实现**：通过 CSS 类控制显示/隐藏

```javascript
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
```

### 4. 数据表格渲染

**实现**：动态创建表格行

```javascript
function renderTable(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        container.appendChild(tr);
    });
}
```

## 错误处理

### 1. API 错误处理

```javascript
try {
    const response = await fetch('/api/endpoint');
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
} catch (error) {
    console.error('请求失败:', error);
    showMessage('操作失败: ' + error.message, 'error');
}
```

### 2. 数据验证

```javascript
function validateInput(input, rules) {
    for (const rule of rules) {
        if (!rule.test(input.value)) {
            showError(rule.message);
            return false;
        }
    }
    return true;
}
```

## 性能优化

### 1. 防抖处理

```javascript
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 使用
const debouncedFilter = debounce(filterData, 300);
```

### 2. 虚拟滚动（大数据量）

对于大量数据，可以考虑虚拟滚动：

```javascript
function renderVirtualTable(data, container, itemHeight, visibleCount) {
    const startIndex = Math.floor(container.scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, data.length);
    
    // 只渲染可见区域的数据
    const visibleData = data.slice(startIndex, endIndex);
    renderTable(visibleData, container);
}
```

### 3. 数据缓存

```javascript
const cache = new Map();

async function fetchWithCache(url) {
    if (cache.has(url)) {
        return cache.get(url);
    }
    const data = await fetch(url).then(r => r.json());
    cache.set(url, data);
    return data;
}
```

## 浏览器兼容性

### 支持的浏览器
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### 不支持的浏览器
- IE 11 及以下

### Polyfill（如需要）

如果需要支持旧浏览器，可以添加：

```html
<!-- Promise polyfill -->
<script src="https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js"></script>

<!-- Fetch polyfill -->
<script src="https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.js"></script>
```

## 开发建议

### 1. 代码组织
- 按功能模块组织代码
- 使用函数封装可复用逻辑
- 保持函数单一职责

### 2. 命名规范
- 变量/函数：驼峰命名（camelCase）
- 常量：大写下划线（UPPER_SNAKE_CASE）
- CSS 类：短横线命名（kebab-case）

### 3. 注释
- 复杂逻辑添加注释
- 函数说明参数和返回值
- 关键步骤添加注释

### 4. 调试
- 使用 `console.log` 输出调试信息
- 使用浏览器开发者工具
- 使用 `debugger` 断点调试

## 未来改进方向

1. **TypeScript** - 添加类型检查
2. **模块化** - 使用 ES6 模块
3. **构建工具** - 引入 Vite 等构建工具
4. **组件化** - 提取可复用组件
5. **状态管理** - 引入轻量级状态管理库
6. **测试** - 添加单元测试和 E2E 测试
