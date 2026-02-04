// 历史记录页面状态
const historyState = {
    histories: [],
    filteredHistories: [],
    currentHistory: null,
    searchTerm: '',
    statusFilter: '',
    modeFilter: ''
};

// DOM 元素
const historyElements = {
    historyList: document.getElementById('historyList'),
    searchInput: document.getElementById('searchInput'),
    statusFilter: document.getElementById('statusFilter'),
    modeFilter: document.getElementById('modeFilter'),
    loading: document.getElementById('loading'),
    pagination: document.getElementById('pagination'),
    detailModal: document.getElementById('detailModal'),
    modalBody: document.getElementById('modalBody'),
    closeModal: document.getElementById('closeModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    downloadHistoryBtn: document.getElementById('downloadHistoryBtn'),
    downloadHistoryMenu: document.getElementById('downloadHistoryMenu')
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadHistories();
});

// 初始化事件监听
function initEventListeners() {
    // 搜索
    historyElements.searchInput.addEventListener('input', debounce(handleSearch, 300));

    // 筛选
    historyElements.statusFilter.addEventListener('change', handleFilter);
    historyElements.modeFilter.addEventListener('change', handleFilter);

    // 模态框
    historyElements.closeModal.addEventListener('click', closeModal);
    historyElements.closeModalBtn.addEventListener('click', closeModal);
    historyElements.detailModal.addEventListener('click', (e) => {
        if (e.target === historyElements.detailModal) {
            closeModal();
        }
    });

    // 下载菜单
    historyElements.downloadHistoryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = historyElements.downloadHistoryBtn.closest('.download-dropdown');
        dropdown.classList.toggle('active');
    });

    document.querySelectorAll('#downloadHistoryMenu .dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const format = item.getAttribute('data-format');
            downloadHistory(format);
            historyElements.downloadHistoryBtn.closest('.download-dropdown').classList.remove('active');
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

// 加载历史记录
async function loadHistories() {
    try {
        historyElements.loading.style.display = 'block';
        const response = await fetch('/api/history?limit=100');
        const data = await response.json();

        historyState.histories = data.histories || [];
        applyFilters();
    } catch (error) {
        console.error('加载历史记录失败:', error);
        showError('加载历史记录失败: ' + error.message);
    } finally {
        historyElements.loading.style.display = 'none';
    }
}

// 处理搜索
function handleSearch(e) {
    historyState.searchTerm = e.target.value.toLowerCase();
    applyFilters();
}

// 处理筛选
function handleFilter() {
    historyState.statusFilter = historyElements.statusFilter.value;
    historyState.modeFilter = historyElements.modeFilter.value;
    applyFilters();
}

// 应用筛选
function applyFilters() {
    let filtered = [...historyState.histories];

    // 搜索筛选
    if (historyState.searchTerm) {
        filtered = filtered.filter(history => {
            const searchable = [
                history.id,
                history.mode,
                ...history.files.map(f => f.filename)
            ].join(' ').toLowerCase();
            return searchable.includes(historyState.searchTerm);
        });
    }

    // 状态筛选
    if (historyState.statusFilter) {
        filtered = filtered.filter(history => history.status === historyState.statusFilter);
    }

    // 模式筛选
    if (historyState.modeFilter) {
        filtered = filtered.filter(history => history.mode === historyState.modeFilter);
    }

    historyState.filteredHistories = filtered;
    renderHistoryList();
}

// 渲染历史记录列表
function renderHistoryList() {
    if (historyState.filteredHistories.length === 0) {
        historyElements.historyList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <h3>暂无历史记录</h3>
                <p>${historyState.histories.length === 0 ? '还没有解析任务，去创建第一个任务吧！' : '没有匹配的筛选结果'}</p>
            </div>
        `;
        return;
    }

    historyElements.historyList.innerHTML = historyState.filteredHistories.map(history => {
        const statusClass = history.status === 'completed' ? 'completed' : 'failed';
        const statusText = history.status === 'completed' ? '已完成' : '失败';
        const modeText = getModeText(history.mode);
        const createdAt = formatDateTime(history.createdAt);
        const completedAt = history.completedAt ? formatDateTime(history.completedAt) : '-';
        const totalRows = history.results.reduce((sum, r) => sum + r.rowCount, 0);

        return `
            <div class="history-item" onclick="showHistoryDetail('${history.id}')">
                <div class="history-item-header">
                    <div class="history-item-title">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span class="history-item-id">${history.id}</span>
                            <span class="history-item-mode">${modeText}</span>
                        </div>
                    </div>
                    <span class="history-item-status ${statusClass}">
                        ${statusText}
                    </span>
                </div>
                <div class="history-item-info">
                    <div class="history-info-item">
                        <span class="history-info-label">文件数</span>
                        <span class="history-info-value">${history.totalFiles}</span>
                    </div>
                    <div class="history-info-item">
                        <span class="history-info-label">工作表数</span>
                        <span class="history-info-value">${history.results.length}</span>
                    </div>
                    <div class="history-info-item">
                        <span class="history-info-label">总行数</span>
                        <span class="history-info-value">${totalRows.toLocaleString()}</span>
                    </div>
                    <div class="history-info-item">
                        <span class="history-info-label">创建时间</span>
                        <span class="history-info-value">${createdAt}</span>
                    </div>
                </div>
                <div class="history-item-footer">
                    <span class="history-item-time">完成时间: ${completedAt}</span>
                    <div class="history-item-actions" onclick="event.stopPropagation()">
                        <button class="history-action-btn" onclick="showHistoryDetail('${history.id}')">查看详情</button>
                        <button class="history-action-btn delete" onclick="deleteHistory('${history.id}')">删除</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 显示历史记录详情
async function showHistoryDetail(id) {
    try {
        const response = await fetch(`/api/history/${id}`);
        const history = await response.json();

        historyState.currentHistory = history;
        renderHistoryDetail(history);
        historyElements.detailModal.style.display = 'flex';
    } catch (error) {
        console.error('加载历史记录详情失败:', error);
        alert('加载详情失败: ' + error.message);
    }
}

// 渲染历史记录详情
function renderHistoryDetail(history) {
    const statusClass = history.status === 'completed' ? 'completed' : 'failed';
    const statusText = history.status === 'completed' ? '已完成' : '失败';
    const modeText = getModeText(history.mode);
    const createdAt = formatDateTime(history.createdAt);
    const completedAt = history.completedAt ? formatDateTime(history.completedAt) : '-';
    const totalRows = history.results.reduce((sum, r) => sum + r.rowCount, 0);

    historyElements.modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">任务ID</span>
                <span class="detail-value" style="font-family: monospace; font-size: 0.85em;">${history.id}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">处理模式</span>
                <span class="detail-value">${modeText}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">状态</span>
                <span class="detail-value">
                    <span class="history-item-status ${statusClass}">${statusText}</span>
                </span>
            </div>
            <div class="detail-item">
                <span class="detail-label">归档</span>
                <span class="detail-value">${history.archive ? '是' : '否'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">文件数</span>
                <span class="detail-value">${history.totalFiles}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">已处理</span>
                <span class="detail-value">${history.processedFiles}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">错误数</span>
                <span class="detail-value">${history.errorFiles}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">创建时间</span>
                <span class="detail-value">${createdAt}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">完成时间</span>
                <span class="detail-value">${completedAt}</span>
            </div>
        </div>

        ${history.error ? `
        <div class="detail-section">
            <div class="detail-section-title">错误信息</div>
            <div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error-color); border-radius: 6px; color: var(--error-color);">
                ${history.error}
            </div>
        </div>
        ` : ''}

        <div class="detail-section">
            <div class="detail-section-title">文件列表 (${history.files.length})</div>
            <div class="file-list-detail">
                ${history.files.map(file => `
                    <div class="file-item-detail">
                        <span class="file-name">${file.filename}</span>
                        <span class="file-size">${formatFileSize(file.size)}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">工作表列表 (${history.results.length})</div>
            <div class="sheet-list-detail">
                ${history.results.map(sheet => `
                    <div class="sheet-item-detail">
                        <span class="sheet-name">${sheet.sheetName}</span>
                        <span class="sheet-rows">${sheet.rowCount.toLocaleString()} 行, ${sheet.columns.length} 列</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 关闭模态框
function closeModal() {
    historyElements.detailModal.style.display = 'none';
    historyState.currentHistory = null;
}

// 删除历史记录
async function deleteHistory(id) {
    if (!confirm('确定要删除这条历史记录吗？')) {
        return;
    }

    try {
        const response = await fetch(`/api/history/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('删除失败');
        }

        // 重新加载列表
        await loadHistories();
    } catch (error) {
        console.error('删除历史记录失败:', error);
        alert('删除失败: ' + error.message);
    }
}

// 下载历史记录
function downloadHistory(format) {
    if (!historyState.currentHistory) return;

    const jobId = historyState.currentHistory.id;
    const url = `/api/download/${jobId}?format=${format}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 获取模式文本
function getModeText(mode) {
    const modeMap = {
        'all': '全部',
        'daily': '日榜',
        'total': '总榜',
        'reward': '奖励记录',
        'mail': '邮件日志',
        'month': '月榜',
        'clubpid': '俱乐部PID'
    };
    return modeMap[mode] || mode;
}

// 格式化日期时间
function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 显示错误
function showError(message) {
    historyElements.historyList.innerHTML = `
        <div class="empty-state">
            <h3>加载失败</h3>
            <p>${message}</p>
        </div>
    `;
}
