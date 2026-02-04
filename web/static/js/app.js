// 全局状态
const state = {
    files: [],
    jobId: null,
    currentSheet: null,
    currentPage: 1,
    pageSize: 100,
    totalRows: 0,
    sheets: [],
    currentPageName: 'parser', // 当前页面名称
    allData: [], // 存储所有数据（用于筛选）
    filteredData: [], // 筛选后的数据
    filters: {}, // 筛选条件
    columns: [] // 当前列
};

// DOM 元素
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    fileList: document.getElementById('fileList'),
    mode: document.getElementById('mode'),
    archive: document.getElementById('archive'),
    processBtn: document.getElementById('processBtn'),
    clearBtn: document.getElementById('clearBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    downloadMenu: document.getElementById('downloadMenu'),
    progressSection: document.getElementById('progressSection'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    resultSection: document.getElementById('resultSection'),
    sheetTabs: document.getElementById('sheetTabs'),
    stats: document.getElementById('stats'),
    dataTable: document.getElementById('dataTable'),
    tableHead: document.getElementById('tableHead'),
    tableBody: document.getElementById('tableBody'),
    pagination: document.getElementById('pagination'),
    filterSection: document.getElementById('filterSection'),
    filterGrid: document.getElementById('filterGrid'),
    clearFilters: document.getElementById('clearFilters')
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initNavigation();
});

// 初始化导航
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const page = link.getAttribute('data-page');
            // 如果链接有 href 属性，使用默认跳转
            if (link.getAttribute('href') && link.getAttribute('href') !== '#') {
                // 让浏览器处理跳转
                return;
            }
            // 否则使用 JavaScript 处理
            e.preventDefault();
            switchPage(page);
        });
    });
}

// 切换页面
function switchPage(page) {
    state.currentPageName = page;
    
    // 根据页面跳转
    if (page === 'parser') {
        // 解析页面（当前页面）
        // 不需要跳转，已经在解析页面
        return;
    } else if (page === 'history') {
        // 跳转到历史记录页面
        window.location.href = '/history.html';
        return;
    } else if (page === 'settings') {
        // TODO: 实现设置页面
        alert('设置功能开发中...');
        return;
    }
}

// 初始化事件监听
function initEventListeners() {
    // 文件上传
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽上传
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('dragover');
    });
    
    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('dragover');
    });
    
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // 按钮事件
    elements.processBtn.addEventListener('click', handleProcess);
    elements.clearBtn.addEventListener('click', handleClear);
    
    // 下载下拉菜单
    elements.downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = elements.downloadBtn.closest('.download-dropdown');
        dropdown.classList.toggle('active');
    });
    
    // 点击下载菜单项
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const format = item.getAttribute('data-format');
            handleDownload(format);
            elements.downloadBtn.closest('.download-dropdown').classList.remove('active');
        });
    });
    
    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.download-dropdown')) {
            document.querySelectorAll('.download-dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });

    // 清除筛选
    elements.clearFilters.addEventListener('click', clearAllFilters);
}

// 处理文件选择
function handleFileSelect(e) {
    handleFiles(e.target.files);
}

// 处理文件
function handleFiles(fileList) {
    const newFiles = Array.from(fileList).filter(file => 
        file.name.toLowerCase().endsWith('.txt')
    );
    
    state.files = [...state.files, ...newFiles];
    updateFileList();
    updateProcessButton();
}

// 更新文件列表
function updateFileList() {
    elements.fileList.innerHTML = '';
    
    if (state.files.length === 0) {
        return;
    }
    
    state.files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item-compact';
        fileItem.innerHTML = `
            <div class="file-info-compact">
                <span class="file-name-compact">${file.name}</span>
                <span class="file-size-compact">${formatFileSize(file.size)}</span>
            </div>
            <button class="file-remove-compact" onclick="removeFile(${index})">删除</button>
        `;
        elements.fileList.appendChild(fileItem);
    });
}

// 删除文件
function removeFile(index) {
    state.files.splice(index, 1);
    updateFileList();
    updateProcessButton();
}

// 更新处理按钮状态
function updateProcessButton() {
    elements.processBtn.disabled = state.files.length === 0;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 处理解析
async function handleProcess() {
    if (state.files.length === 0) return;

    elements.processBtn.disabled = true;
    elements.progressSection.style.display = 'block';
    elements.resultSection.style.display = 'none';

    try {
        // 上传文件
        const formData = new FormData();
        state.files.forEach(file => {
            formData.append('files', file);
        });
        formData.append('mode', elements.mode.value);
        formData.append('archive', elements.archive.checked);

        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!uploadResponse.ok) {
            throw new Error('上传失败');
        }

        const uploadData = await uploadResponse.json();
        state.jobId = uploadData.jobId;

        // 开始处理
        await fetch(`/api/process/${state.jobId}`, {
            method: 'POST'
        });

        // 轮询状态
        pollJobStatus();
    } catch (error) {
        alert('处理失败: ' + error.message);
        elements.processBtn.disabled = false;
    }
}

// 轮询任务状态
async function pollJobStatus() {
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`/api/status/${state.jobId}`);
            const job = await response.json();

            // 更新进度
            updateProgress(job.progress, job.processedFiles, job.totalFiles);

            if (job.status === 'completed') {
                clearInterval(interval);
                elements.processBtn.disabled = false;
                await loadResults(job);
            } else if (job.status === 'failed') {
                clearInterval(interval);
                elements.processBtn.disabled = false;
                alert('处理失败: ' + (job.error || '未知错误'));
            }
        } catch (error) {
            console.error('轮询状态失败:', error);
        }
    }, 1000);
}

// 更新进度
function updateProgress(progress, processed, total) {
    elements.progressFill.style.width = progress + '%';
    elements.progressText.textContent = `处理中: ${processed}/${total} 文件 (${progress}%)`;
}

// 加载结果
async function loadResults(job) {
    state.sheets = job.results || [];
    
    if (state.sheets.length === 0) {
        alert('没有解析结果');
        return;
    }

    elements.progressSection.style.display = 'none';
    elements.resultSection.style.display = 'block';
    elements.downloadBtn.disabled = false;

    // 显示工作表标签
    renderSheetTabs();
    
    // 加载第一个工作表
    if (state.sheets.length > 0) {
        state.currentSheet = state.sheets[0].sheetName;
        await loadSheetData(state.currentSheet, 1);
    }
}

// 渲染工作表标签
function renderSheetTabs() {
    elements.sheetTabs.innerHTML = '';
    
    state.sheets.forEach(sheet => {
        const tab = document.createElement('div');
        tab.className = 'sheet-tab';
        if (sheet.sheetName === state.currentSheet) {
            tab.classList.add('active');
        }
        tab.textContent = `${sheet.sheetName} (${sheet.rowCount.toLocaleString()} 行)`;
        tab.addEventListener('click', () => switchSheet(sheet.sheetName));
        elements.sheetTabs.appendChild(tab);
    });
}

// 切换工作表
async function switchSheet(sheetName) {
    state.currentSheet = sheetName;
    state.currentPage = 1;
    state.allData = []; // 清空之前的数据
    state.filters = {}; // 清空筛选条件
    renderSheetTabs();
    await loadSheetData(sheetName, 1);
}

// 加载工作表数据
async function loadSheetData(sheetName, page) {
    try {
        // 如果是第一次加载，获取所有数据
        if (state.allData.length === 0 || state.currentSheet !== sheetName) {
            await loadAllData(sheetName);
        }

        // 应用筛选
        applyFilters();

        // 分页显示
        const startIndex = (page - 1) * state.pageSize;
        const endIndex = startIndex + state.pageSize;
        const pageData = state.filteredData.slice(startIndex, endIndex);

        state.currentPage = page;
        state.totalRows = state.filteredData.length;

        // 更新统计信息
        updateStats({
            total: state.totalRows,
            page: page,
            pageSize: state.pageSize,
            columns: state.columns
        });

        // 渲染表格
        renderTable(state.columns, pageData);

        // 渲染分页
        renderPagination(state.totalRows, page, state.pageSize);
    } catch (error) {
        console.error('加载数据失败:', error);
        alert('加载数据失败: ' + error.message);
    }
}

// 加载所有数据
async function loadAllData(sheetName) {
    try {
        // 先获取第一页以了解总数据量和列信息
        const firstPageParams = new URLSearchParams({
            jobId: state.jobId,
            sheet: sheetName,
            page: 1,
            pageSize: 100
        });

        const firstResponse = await fetch(`/api/data?${firstPageParams}`);
        const firstData = await firstResponse.json();

        if (!firstData.columns || firstData.columns.length === 0) {
            throw new Error('无法获取列信息');
        }

        state.columns = firstData.columns;
        let allData = firstData.data || [];
        const totalRows = firstData.total;

        // 如果数据量不大（小于10000行），加载所有数据
        // 否则只加载前1000行用于筛选
        const maxRows = totalRows > 10000 ? 1000 : totalRows;
        
        if (totalRows > 100) {
            // 分页加载剩余数据
            const totalPages = Math.ceil(maxRows / 100);
            for (let page = 2; page <= totalPages; page++) {
                const params = new URLSearchParams({
                    jobId: state.jobId,
                    sheet: sheetName,
                    page: page,
                    pageSize: 100
                });

                const response = await fetch(`/api/data?${params}`);
                const data = await response.json();

                if (data.data && data.data.length > 0) {
                    allData = allData.concat(data.data);
                } else {
                    break;
                }
            }
        }

        state.allData = allData;
        state.filteredData = allData;
        state.filters = {};

        // 创建筛选输入框
        createFilterInputs();
    } catch (error) {
        console.error('加载所有数据失败:', error);
        throw error;
    }
}

// 创建筛选输入框
function createFilterInputs() {
    if (state.columns.length === 0) return;

    elements.filterGrid.innerHTML = '';
    elements.filterSection.style.display = 'block';

    state.columns.forEach(column => {
        const filterItem = document.createElement('div');
        filterItem.className = 'filter-item';
        filterItem.innerHTML = `
            <label>${column}</label>
            <input type="text" 
                   class="filter-input" 
                   data-column="${column}" 
                   placeholder="筛选 ${column}..."
                   value="${state.filters[column] || ''}">
        `;
        elements.filterGrid.appendChild(filterItem);
    });

    // 绑定筛选事件
    document.querySelectorAll('.filter-input').forEach(input => {
        input.addEventListener('input', debounce(handleFilterChange, 300));
    });
}

// 防抖函数
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

// 处理筛选变化
function handleFilterChange(e) {
    const column = e.target.getAttribute('data-column');
    const value = e.target.value.trim().toLowerCase();
    
    if (value) {
        state.filters[column] = value;
    } else {
        delete state.filters[column];
    }

    // 重新加载当前页（会触发筛选）
    loadSheetData(state.currentSheet, 1);
}

// 应用筛选
function applyFilters() {
    if (Object.keys(state.filters).length === 0) {
        state.filteredData = state.allData;
        return;
    }

    state.filteredData = state.allData.filter(row => {
        return Object.keys(state.filters).every(column => {
            const filterValue = state.filters[column].toLowerCase();
            const cellValue = String(row[column] || '').toLowerCase();
            return cellValue.includes(filterValue);
        });
    });
}

// 清除所有筛选
function clearAllFilters() {
    state.filters = {};
    document.querySelectorAll('.filter-input').forEach(input => {
        input.value = '';
    });
    loadSheetData(state.currentSheet, 1);
}

// 更新统计信息
function updateStats(data) {
    const currentSheet = state.sheets.find(s => s.sheetName === state.currentSheet);
    const filteredCount = Object.keys(state.filters).length > 0 ? state.filteredData.length : null;
    
    elements.stats.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">${filteredCount !== null ? '筛选后' : '总'}行数</span>
            <span class="stat-value">${data.total.toLocaleString()}</span>
        </div>
        ${filteredCount !== null ? `
        <div class="stat-item">
            <span class="stat-label">原始行数</span>
            <span class="stat-value">${state.allData.length.toLocaleString()}</span>
        </div>
        ` : ''}
        <div class="stat-item">
            <span class="stat-label">当前页</span>
            <span class="stat-value">${data.page} / ${Math.ceil(data.total / data.pageSize)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">列数</span>
            <span class="stat-value">${data.columns.length}</span>
        </div>
        ${Object.keys(state.filters).length > 0 ? `
        <div class="stat-item">
            <span class="stat-label">筛选条件</span>
            <span class="stat-value">${Object.keys(state.filters).length} 个</span>
        </div>
        ` : ''}
    `;
}

// 渲染表格
function renderTable(columns, data) {
    // 表头
    elements.tableHead.innerHTML = '';
    const headRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headRow.appendChild(th);
    });
    elements.tableHead.appendChild(headRow);

    // 表体
    elements.tableBody.innerHTML = '';
    if (data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = columns.length;
        td.textContent = '暂无数据';
        td.style.textAlign = 'center';
        td.style.color = 'var(--text-secondary)';
        tr.appendChild(td);
        elements.tableBody.appendChild(tr);
    } else {
        data.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col] || '';
                tr.appendChild(td);
            });
            elements.tableBody.appendChild(tr);
        });
    }
}

// 渲染分页
function renderPagination(total, page, pageSize) {
    const totalPages = Math.ceil(total / pageSize);
    
    elements.pagination.innerHTML = `
        <button onclick="changePage(${page - 1})" ${page === 1 ? 'disabled' : ''}>上一页</button>
        <span class="page-info">第 ${page} 页，共 ${totalPages} 页</span>
        <button onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>下一页</button>
    `;
}

// 切换页面
async function changePage(newPage) {
    if (newPage < 1) return;
    const totalPages = Math.ceil(state.totalRows / state.pageSize);
    if (newPage > totalPages) return;
    
    // 直接使用已加载的数据，不需要重新请求
    const startIndex = (newPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    const pageData = state.filteredData.slice(startIndex, endIndex);

    state.currentPage = newPage;

    // 更新统计信息
    updateStats({
        total: state.totalRows,
        page: newPage,
        pageSize: state.pageSize,
        columns: state.columns
    });

    // 渲染表格
    renderTable(state.columns, pageData);

    // 渲染分页
    renderPagination(state.totalRows, newPage, state.pageSize);
}

// 清空
function handleClear() {
    state.files = [];
    state.jobId = null;
    state.currentSheet = null;
    state.sheets = [];
    
    elements.fileList.innerHTML = '';
    elements.resultSection.style.display = 'none';
    elements.progressSection.style.display = 'none';
    elements.fileInput.value = '';
    updateProcessButton();
    elements.downloadBtn.disabled = true;
}

// 下载文件
function handleDownload(format) {
    if (!state.jobId) return;

    const url = `/api/download/${state.jobId}?format=${format}${state.currentSheet ? '&sheet=' + encodeURIComponent(state.currentSheet) : ''}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
