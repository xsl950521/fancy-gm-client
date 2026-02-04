// 数据分析页面逻辑

let currentJobId = '';
let currentSheet = '';
let charts = {};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadJobList();
    setupEventListeners();
});

// 设置事件监听
function setupEventListeners() {
    const jobSelect = document.getElementById('jobSelect');
    const sheetSelect = document.getElementById('sheetSelect');
    const analyzeBtn = document.getElementById('analyzeBtn');

    jobSelect.addEventListener('change', async (e) => {
        currentJobId = e.target.value;
        if (currentJobId) {
            await loadSheetList(currentJobId);
            document.getElementById('sheetGroup').style.display = 'block';
        } else {
            document.getElementById('sheetGroup').style.display = 'none';
            analyzeBtn.disabled = true;
        }
    });

    sheetSelect.addEventListener('change', (e) => {
        currentSheet = e.target.value;
        analyzeBtn.disabled = !currentJobId || !currentSheet;
    });

    analyzeBtn.addEventListener('click', () => {
        if (currentJobId && currentSheet) {
            analyzeData(currentJobId, currentSheet);
        }
    });
}

// 加载任务列表
async function loadJobList() {
    try {
        const response = await fetch('/api/history');
        const data = await response.json();

        const jobSelect = document.getElementById('jobSelect');
        jobSelect.innerHTML = '<option value="">-- 请选择任务 --</option>';

        const histories = data.histories || data.records || [];
        if (histories.length > 0) {
            histories.forEach(record => {
                const option = document.createElement('option');
                option.value = record.id;
                const dateStr = record.completedAt ? new Date(record.completedAt).toLocaleString() : '未完成';
                option.textContent = `${record.id} - ${record.mode || '未知'} (${dateStr})`;
                jobSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load job list:', error);
        showError('加载任务列表失败');
    }
}

// 加载工作表列表
async function loadSheetList(jobId) {
    try {
        // 从历史记录获取工作表信息
        const response = await fetch(`/api/history/${jobId}`);
        const data = await response.json();

        const sheetSelect = document.getElementById('sheetSelect');
        sheetSelect.innerHTML = '<option value="">-- 请选择工作表 --</option>';

        // 历史记录可能包含results.sheets，或者需要从analytics API获取
        let sheets = [];
        if (data.results && data.results.sheets) {
            sheets = data.results.sheets;
        } else if (data.sheets) {
            sheets = data.sheets;
        } else {
            // 尝试从analytics API获取
            const sheetResponse = await fetch(`/api/analytics/sheets?jobId=${jobId}`);
            const sheetData = await sheetResponse.json();
            if (sheetData.sheets) {
                sheets = sheetData.sheets;
            }
        }

        if (sheets.length > 0) {
            sheets.forEach(sheet => {
                const option = document.createElement('option');
                option.value = sheet.sheetName || sheet;
                const rowCount = sheet.rowCount || 0;
                const sheetName = sheet.sheetName || sheet;
                option.textContent = `${sheetName} (${rowCount} 行)`;
                sheetSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load sheet list:', error);
        showError('加载工作表列表失败');
    }
}

// 分析数据
async function analyzeData(jobId, sheetName) {
    // 显示加载状态
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('overviewSection').style.display = 'none';
    document.getElementById('chartsSection').style.display = 'none';

    // 销毁现有图表
    destroyAllCharts();

    try {
        const response = await fetch(`/api/analytics/statistics?jobId=${jobId}&sheet=${encodeURIComponent(sheetName)}`);
        const stats = await response.json();

        if (response.ok) {
            displayStatistics(stats);
        } else {
            showError(stats.error || '分析失败');
        }
    } catch (error) {
        console.error('Failed to analyze data:', error);
        showError('分析数据失败: ' + error.message);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// 显示统计数据
function displayStatistics(stats) {
    // 显示概览
    displayOverview(stats);

    // 根据数据类型显示不同的分析
    if (stats.isRankingData && stats.rankingAnalysis) {
        // 排行榜数据：显示专用分析
        document.getElementById('rankingAnalysisSection').style.display = 'block';
        document.getElementById('generalAnalysisSection').style.display = 'none';
        displayRankingAnalysis(stats.rankingAnalysis);
    } else {
        // 通用数据：显示通用分析
        document.getElementById('rankingAnalysisSection').style.display = 'none';
        document.getElementById('generalAnalysisSection').style.display = 'block';
        displayCharts(stats);
        displayTopRecords(stats.topRecords);
        displayColumnStats(stats.columnStats);
    }

    // 显示所有区域
    document.getElementById('overviewSection').style.display = 'grid';
    document.getElementById('chartsSection').style.display = 'block';
}

// 显示概览
function displayOverview(stats) {
    document.getElementById('totalRecords').textContent = stats.totalRecords || 0;

    let numericCount = 0;
    let stringCount = 0;
    let dateCount = 0;

    Object.values(stats.columnStats || {}).forEach(stat => {
        if (stat.type === 'number') numericCount++;
        else if (stat.type === 'string') stringCount++;
        else if (stat.type === 'date') dateCount++;
    });

    document.getElementById('numericColumns').textContent = numericCount;
    document.getElementById('stringColumns').textContent = stringCount;
    document.getElementById('dateColumns').textContent = dateCount;
}

// 显示图表
function displayCharts(stats) {
    // 分布图表
    const distribution = stats.distribution || {};
    const distributionCard = document.getElementById('distributionCard');
    const distributionCharts = document.getElementById('distributionCharts');
    distributionCharts.innerHTML = '';

    if (Object.keys(distribution).length > 0) {
        distributionCard.style.display = 'block';
        Object.entries(distribution).forEach(([column, data]) => {
            if (data && data.labels && data.data) {
                createDistributionChart(column, data, distributionCharts);
            }
        });
    } else {
        distributionCard.style.display = 'none';
    }

    // 时间序列图表
    const timeSeries = stats.timeSeries || [];
    const timeSeriesCard = document.getElementById('timeSeriesCard');
    if (timeSeries.length > 0) {
        timeSeriesCard.style.display = 'block';
        createTimeSeriesChart(timeSeries);
    } else {
        timeSeriesCard.style.display = 'none';
    }
}

// 创建分布图表
function createDistributionChart(columnName, data, container) {
    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'chart-wrapper';
    
    const chartTitle = document.createElement('div');
    chartTitle.className = 'chart-title';
    chartTitle.textContent = columnName;
    chartWrapper.appendChild(chartTitle);

    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'chart-canvas';
    const canvas = document.createElement('canvas');
    canvasContainer.appendChild(canvas);
    chartWrapper.appendChild(canvasContainer);

    container.appendChild(chartWrapper);

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: '数量',
                data: data.data,
                backgroundColor: 'rgba(37, 99, 235, 0.6)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    charts[`distribution_${columnName}`] = chart;
}

// 创建时间序列图表
function createTimeSeriesChart(timeSeries) {
    const canvas = document.getElementById('timeSeriesChart');
    const ctx = canvas.getContext('2d');

    const labels = timeSeries.map(point => point.label || point.time);
    const data = timeSeries.map(point => point.value);

    if (charts.timeSeries) {
        charts.timeSeries.destroy();
    }

    charts.timeSeries = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '数值',
                data: data,
                borderColor: 'rgba(37, 99, 235, 1)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// 显示Top记录
function displayTopRecords(topRecords) {
    const topRecordsCard = document.getElementById('topRecordsCard');
    const table = document.getElementById('topRecordsTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    if (!topRecords || topRecords.length === 0) {
        topRecordsCard.style.display = 'none';
        return;
    }

    topRecordsCard.style.display = 'block';

    // 清空表格
    thead.innerHTML = '';
    tbody.innerHTML = '';

    // 获取列名
    const columns = Object.keys(topRecords[0]);
    
    // 创建表头
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // 创建数据行
    topRecords.forEach(record => {
        const row = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = record[col] || '';
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
}

// 显示列统计
function displayColumnStats(columnStats) {
    const columnStatsCard = document.getElementById('columnStatsCard');
    const content = document.getElementById('columnStatsContent');
    content.innerHTML = '';

    if (!columnStats || Object.keys(columnStats).length === 0) {
        columnStatsCard.style.display = 'none';
        return;
    }

    columnStatsCard.style.display = 'block';

    Object.entries(columnStats).forEach(([columnName, stat]) => {
        const item = document.createElement('div');
        item.className = 'column-stat-item';

        const header = document.createElement('div');
        header.className = 'column-stat-header';
        
        const name = document.createElement('div');
        name.className = 'column-stat-name';
        name.textContent = columnName;
        
        const type = document.createElement('div');
        type.className = 'column-stat-type';
        type.textContent = stat.type;
        
        header.appendChild(name);
        header.appendChild(type);
        item.appendChild(header);

        const details = document.createElement('div');
        details.className = 'column-stat-details';

        if (stat.type === 'number') {
            details.appendChild(createStatDetail('最小值', stat.min));
            details.appendChild(createStatDetail('最大值', stat.max));
            details.appendChild(createStatDetail('平均值', stat.avg));
            details.appendChild(createStatDetail('总和', stat.sum));
        }
        
        details.appendChild(createStatDetail('总数', stat.count));
        details.appendChild(createStatDetail('非空数', stat.count - stat.nullCount));
        details.appendChild(createStatDetail('空值数', stat.nullCount));
        if (stat.uniqueValues !== undefined) {
            details.appendChild(createStatDetail('唯一值', stat.uniqueValues));
        }

        item.appendChild(details);
        content.appendChild(item);
    });
}

// 创建统计详情项
function createStatDetail(label, value) {
    const item = document.createElement('div');
    item.className = 'stat-detail-item';
    
    const labelEl = document.createElement('div');
    labelEl.className = 'stat-detail-label';
    labelEl.textContent = label;
    
    const valueEl = document.createElement('div');
    valueEl.className = 'stat-detail-value';
    valueEl.textContent = value !== null && value !== undefined ? value : '-';
    
    item.appendChild(labelEl);
    item.appendChild(valueEl);
    return item;
}

// 销毁所有图表
function destroyAllCharts() {
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    charts = {};
}

// 显示排行榜分析
function displayRankingAnalysis(analysis) {
    // 按组别统计
    if (analysis.byGroup && Object.keys(analysis.byGroup).length > 0) {
        displayByGroup(analysis.byGroup);
    }

    // 排名分布
    if (analysis.rankDistribution && analysis.rankDistribution.length > 0) {
        displayRankDistribution(analysis.rankDistribution);
    }

    // 分数分布
    if (analysis.scoreDistribution) {
        displayScoreDistribution(analysis.scoreDistribution);
    }

    // 按日期统计
    if (analysis.byDay && Object.keys(analysis.byDay).length > 0) {
        displayByDay(analysis.byDay);
    }

    // 各组别Top玩家
    if ((analysis.topByGroup && Object.keys(analysis.topByGroup).length > 0) ||
        (analysis.topByGroupDay && Object.keys(analysis.topByGroupDay).length > 0)) {
        displayTopByGroup(analysis.topByGroup, analysis.topByGroupDay);
    }
}

// 显示按组别统计
function displayByGroup(byGroup) {
    const card = document.getElementById('byGroupCard');
    const table = document.getElementById('byGroupTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    // 表头
    const headerRow = document.createElement('tr');
    ['组别', '玩家数', '平均排名', '平均分数', '最高分数', '最低分数', '最佳排名'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // 数据行
    const groups = Object.keys(byGroup).sort();
    groups.forEach(group => {
        const stats = byGroup[group];
        const row = document.createElement('tr');
        
        [group, stats.totalPlayers, stats.avgRank.toFixed(2), 
         stats.avgScore.toFixed(2), stats.maxScore.toFixed(2), 
         stats.minScore.toFixed(2), stats.topRank].forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
    });

    card.style.display = 'block';
}

// 显示排名分布
function displayRankDistribution(rankDist) {
    const card = document.getElementById('rankDistributionCard');
    const content = document.getElementById('rankDistributionContent');
    content.innerHTML = '';

    // 显示统计卡片
    rankDist.forEach(bucket => {
        const bucketEl = document.createElement('div');
        bucketEl.className = 'rank-bucket';
        
        const rangeEl = document.createElement('div');
        rangeEl.className = 'rank-bucket-range';
        rangeEl.textContent = bucket.label;
        
        const countEl = document.createElement('div');
        countEl.className = 'rank-bucket-count';
        countEl.textContent = bucket.count;
        
        bucketEl.appendChild(rangeEl);
        bucketEl.appendChild(countEl);
        content.appendChild(bucketEl);
    });

    // 创建图表
    const canvas = document.getElementById('rankDistributionChart');
    const ctx = canvas.getContext('2d');

    const labels = rankDist.map(b => b.label);
    const data = rankDist.map(b => b.count);

    if (charts.rankDistribution) {
        charts.rankDistribution.destroy();
    }

    charts.rankDistribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '玩家数量',
                data: data,
                backgroundColor: 'rgba(37, 99, 235, 0.6)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    card.style.display = 'block';
}

// 显示分数分布
function displayScoreDistribution(scoreDist) {
    const card = document.getElementById('scoreDistributionCard');
    const canvas = document.getElementById('scoreDistributionChart');
    const ctx = canvas.getContext('2d');

    if (charts.scoreDistribution) {
        charts.scoreDistribution.destroy();
    }

    charts.scoreDistribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: scoreDist.labels,
            datasets: [{
                label: '玩家数量',
                data: scoreDist.data,
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    card.style.display = 'block';
}

// 显示按日期统计
function displayByDay(byDay) {
    const card = document.getElementById('byDayCard');
    const canvas = document.getElementById('byDayChart');
    const ctx = canvas.getContext('2d');

    const days = Object.keys(byDay).sort();
    const avgScores = days.map(day => byDay[day].avgScore);
    const maxScores = days.map(day => byDay[day].maxScore);
    const playerCounts = days.map(day => byDay[day].totalPlayers);

    if (charts.byDay) {
        charts.byDay.destroy();
    }

    charts.byDay = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: '平均分数',
                    data: avgScores,
                    borderColor: 'rgba(37, 99, 235, 1)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: '最高分数',
                    data: maxScores,
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: '玩家数量',
                    data: playerCounts,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });

    card.style.display = 'block';
}

// 存储Top玩家数据，供切换使用
let topPlayersData = {
    byGroup: {},
    byGroupDay: {}
};

// 显示各组别Top玩家
function displayTopByGroup(topByGroup, topByGroupDay) {
    const card = document.getElementById('topByGroupCard');
    const groupSelect = document.getElementById('topGroupSelect');
    const daySelect = document.getElementById('topDaySelect');
    const dayGroup = document.getElementById('topDayGroup');

    // 保存数据供切换使用
    topPlayersData.byGroup = topByGroup || {};
    topPlayersData.byGroupDay = topByGroupDay || {};

    // 移除旧的事件监听器（通过克隆节点）
    const newGroupSelect = groupSelect.cloneNode(true);
    groupSelect.parentNode.replaceChild(newGroupSelect, groupSelect);
    const newDaySelect = daySelect.cloneNode(true);
    daySelect.parentNode.replaceChild(newDaySelect, daySelect);

    // 清空并填充组别下拉框
    newGroupSelect.innerHTML = '<option value="">-- 请选择组别 --</option>';
    const groups = Object.keys(topPlayersData.byGroup).sort();
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        newGroupSelect.appendChild(option);
    });

    // 组别选择事件
    newGroupSelect.addEventListener('change', function() {
        const selectedGroup = this.value;
        updateDaySelect(selectedGroup);
        updateTopPlayersTable(selectedGroup, newDaySelect.value);
    });

    // 日期选择事件
    newDaySelect.addEventListener('change', function() {
        updateTopPlayersTable(newGroupSelect.value, this.value);
    });

    // 如果有数据，默认选择第一个组别
    if (groups.length > 0) {
        newGroupSelect.value = groups[0];
        updateDaySelect(groups[0]);
        updateTopPlayersTable(groups[0], '');
    }

    card.style.display = 'block';
}

// 更新日期下拉框
function updateDaySelect(group) {
    const daySelect = document.getElementById('topDaySelect');
    const dayGroup = document.getElementById('topDayGroup');
    
    if (!daySelect || !dayGroup) return;
    
    daySelect.innerHTML = '<option value="">全部日期</option>';
    
    if (group && topPlayersData.byGroupDay[group] && Object.keys(topPlayersData.byGroupDay[group]).length > 0) {
        dayGroup.style.display = 'flex';
        const days = Object.keys(topPlayersData.byGroupDay[group]).sort();
        days.forEach(day => {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            daySelect.appendChild(option);
        });
    } else {
        dayGroup.style.display = 'none';
    }
}

// 更新Top玩家表格
function updateTopPlayersTable(group, day) {
    const table = document.getElementById('topPlayersTable');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    let players = [];

    if (day && topPlayersData.byGroupDay[group] && topPlayersData.byGroupDay[group][day]) {
        // 显示指定组别+日期的Top玩家
        players = topPlayersData.byGroupDay[group][day];
    } else if (group && topPlayersData.byGroup[group]) {
        // 显示指定组别的Top玩家（全部日期）
        players = topPlayersData.byGroup[group];
    }

    if (players.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.textContent = '暂无数据';
        cell.style.textAlign = 'center';
        cell.style.padding = '2rem';
        cell.style.color = 'var(--text-secondary)';
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    players.forEach((player, index) => {
        const row = document.createElement('tr');
        
        const rankCell = document.createElement('td');
        rankCell.textContent = player.rank || (index + 1);
        rankCell.style.fontWeight = '600';
        rankCell.style.color = 'var(--primary-color)';
        
        const memberCell = document.createElement('td');
        memberCell.textContent = player.member || '未知';
        
        const scoreCell = document.createElement('td');
        scoreCell.textContent = player.score ? player.score.toFixed(2) : '-';
        
        const dayCell = document.createElement('td');
        dayCell.textContent = player.day || '-';
        
        row.appendChild(rankCell);
        row.appendChild(memberCell);
        row.appendChild(scoreCell);
        row.appendChild(dayCell);
        
        tbody.appendChild(row);
    });
}

// 显示错误
function showError(message) {
    alert(message);
}
