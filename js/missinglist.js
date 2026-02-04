// 漏发名单页面状态
const missingListState = {
    allData: [],
    filteredData: [],
    currentData: [],
    uploadedPlayers: [], // 上传的玩家列表
    currentGameType: 'bydr',
    currentResendIid: 'bydr', // 当前补发页签选择的iid
    currentResendRankType: 'daily_person', // 当前补发页签选择的榜单类型
    superLimits: {},
    rankConfigs: { // 榜单配置（当前游戏类型）
        daily_person: { title: '', content: '', reward: {} },
        total_person: { title: '', content: '', reward: {} },
        daily_person_super: { title: '', content: '', reward: {} },
        total_person_super: { title: '', content: '', reward: {} },
        daily_club: { title: '', content: '', reward: {} },
        total_club: { title: '', content: '', reward: {} }
    },
    // 按iid存储配置
    iidConfigs: {
        bydr: {},
        dsc: {},
        yxds: {},
        daqiqiu: {}
    }
};

// DOM 元素
const elements = {
    // 名单拉取相关
    baseUrl: document.getElementById('baseUrl'),
    timestamp: document.getElementById('timestamp'),
    sign: document.getElementById('sign'),
    iid: document.getElementById('iid'),
    fetchBtn: document.getElementById('fetchBtn'),
    messageArea: document.getElementById('messageArea'),
    filterSection: document.getElementById('filterSection'),
    filterHid: document.getElementById('filterHid'),
    filterIid: document.getElementById('filterIid'),
    filterOn: document.getElementById('filterOn'),
    filterRankType: document.getElementById('filterRankType'),
    filterRankCategory: document.getElementById('filterRankCategory'),
    filterBtn: document.getElementById('filterBtn'),
    resetFilterBtn: document.getElementById('resetFilterBtn'),
    dataSection: document.getElementById('dataSection'),
    dataTableBody: document.getElementById('dataTableBody'),
    dataCount: document.getElementById('dataCount'),
    exportBtn: document.getElementById('exportBtn'),
    // 奖励补发相关
    excelFile: document.getElementById('excelFile'),
    selectFileBtn: document.getElementById('selectFileBtn'),
    fileName: document.getElementById('fileName'),
    uploadMessageArea: document.getElementById('uploadMessageArea'),
    resendUrl: document.getElementById('resendUrl'),
    resendRankType: document.getElementById('resendRankType'),
    useBatchSend: document.getElementById('useBatchSend'),
    groupTypeContainer: document.getElementById('groupTypeContainer'),
    resendGroup: document.getElementById('resendGroup'),
    resendTimestamp: document.getElementById('resendTimestamp'),
    resendSign: document.getElementById('resendSign'),
    mailTitle: document.getElementById('mailTitle'),
    mailContent: document.getElementById('mailContent'),
    rewardConfig: document.getElementById('rewardConfig'),
    resendBtn: document.getElementById('resendBtn'),
    luaConfigFile: document.getElementById('luaConfigFile'),
    selectLuaFileBtn: document.getElementById('selectLuaFileBtn'),
    luaFileName: document.getElementById('luaFileName'),
    resendMessageArea: document.getElementById('resendMessageArea'),
    resultSection: document.getElementById('resultSection'),
    resendResult: document.getElementById('resendResult'),
    // 数据源选择相关
    dataSourceExcel: document.getElementById('dataSourceExcel'),
    dataSourceFetched: document.getElementById('dataSourceFetched'),
    excelUploadArea: document.getElementById('excelUploadArea'),
    fetchedDataArea: document.getElementById('fetchedDataArea'),
    fetchedDataCount: document.getElementById('fetchedDataCount'),
    useFetchedDataBtn: document.getElementById('useFetchedDataBtn'),
    // 子页签
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabFetch: document.getElementById('tabFetch'),
    tabConfig: document.getElementById('tabConfig'),
    tabResend: document.getElementById('tabResend'),
    // 榜单配置相关
    configStatus: document.getElementById('configStatus'),
    gameTabBtns: document.querySelectorAll('.game-tab-btn'),
    rankTabBtns: document.querySelectorAll('.rank-tab-btn'),
    rankTabContents: document.querySelectorAll('.rank-tab-content'),
    // 补发名单详情
    playerListSection: document.getElementById('playerListSection'),
    playerListBody: document.getElementById('playerListBody'),
    // 批量发送所有榜单
    sendAllRanks: document.getElementById('sendAllRanks'),
    // 榜单选择相关
    rankCheckboxes: document.querySelectorAll('.rank-checkbox'),
    rewardDetailSection: document.getElementById('rewardDetailSection'),
    rewardDetailContainer: document.getElementById('rewardDetailContainer'),
    // 补发页签的iid和榜单类型页签
    iidTabBtns: document.querySelectorAll('.iid-tab-btn'),
    resendRankTabBtns: document.querySelectorAll('.resend-rank-tab-btn'),
    resendRewardDetailContainer: document.getElementById('resendRewardDetailContainer'),
    resendMissingListBody: document.getElementById('resendMissingListBody'),
    resendMissingListCount: document.getElementById('resendMissingListCount'),
    // 新的三栏布局元素
    resendRankCheckboxes: document.querySelectorAll('.resend-rank-checkbox'),
    selectAllRanksBtn: document.getElementById('selectAllRanksBtn'),
    resendAllBtn: document.getElementById('resendAllBtn'),
    currentResendIidDisplay: document.getElementById('currentResendIidDisplay'),
    resendMissingListTitle: document.getElementById('resendMissingListTitle'),
    // 确认对话框元素
    confirmModal: document.getElementById('confirmModal'),
    confirmModalClose: document.getElementById('confirmModalClose'),
    confirmModalCancel: document.getElementById('confirmModalCancel'),
    confirmModalConfirm: document.getElementById('confirmModalConfirm'),
    confirmIid: document.getElementById('confirmIid'),
    confirmRankTypes: document.getElementById('confirmRankTypes'),
    confirmCount: document.getElementById('confirmCount'),
    confirmRankDetails: document.getElementById('confirmRankDetails'),
    confirmRankList: document.getElementById('confirmRankList')
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initTabs();
    // 延迟初始化榜单配置子页签，确保DOM已完全加载
    setTimeout(() => {
        initRankTabs();
    }, 100);
    // 设置默认值
    setDefaultValues();
    // 加载道具名称映射
    loadItemMap();
    // 加载默认榜单配置
    setActiveGameTab('bydr');
    loadDefaultConfig('bydr');
    
    // 初始化补发页签的iid和榜单类型
    setTimeout(() => {
        if (elements.iidTabBtns && elements.iidTabBtns.length > 0) {
            const firstIid = elements.iidTabBtns[0].getAttribute('data-iid');
            switchResendIid(firstIid);
        }
        if (elements.resendRankTabBtns && elements.resendRankTabBtns.length > 0) {
            const firstRankType = elements.resendRankTabBtns[0].getAttribute('data-rank-type');
            switchResendRankType(firstRankType);
        }
    }, 1000);
});

// 初始化子页签
function initTabs() {
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}

// 切换子页签
function switchTab(tab) {
    // 更新按钮状态
    elements.tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 更新内容显示
    const tabs = {
        'fetch': elements.tabFetch,
        'config': elements.tabConfig,
        'resend': elements.tabResend
    };
    
    Object.keys(tabs).forEach(tabKey => {
        const tabElement = tabs[tabKey];
        if (tabElement) {
            if (tabKey === tab) {
                tabElement.classList.add('active');
                tabElement.style.display = 'block';
                
                // 如果切换到补发页签，更新显示
                if (tabKey === 'resend') {
                    setTimeout(() => {
                        updateResendRewardDetail();
                        updateResendMissingList();
                    }, 100);
                }
            } else {
                tabElement.classList.remove('active');
                tabElement.style.display = 'none';
            }
        }
    });
    
    // 如果切换到榜单配置页签，初始化榜单配置子页签
    if (tab === 'config') {
        // 确保榜单配置子页签已初始化
        setTimeout(() => {
            const rankTabBtns = document.querySelectorAll('.rank-tab-btn');
            if (rankTabBtns && rankTabBtns.length > 0) {
                // 如果还没有绑定事件，重新初始化
                const firstBtn = rankTabBtns[0];
                if (!firstBtn.hasAttribute('data-initialized')) {
                    initRankTabs();
                    rankTabBtns.forEach(btn => btn.setAttribute('data-initialized', 'true'));
                }
            }
        }, 50);
    }
}

// 初始化事件监听
function initEventListeners() {
    // 名单拉取相关
    elements.fetchBtn.addEventListener('click', handleFetch);
    elements.filterBtn.addEventListener('click', handleFilter);
    elements.resetFilterBtn.addEventListener('click', handleResetFilter);
    elements.exportBtn.addEventListener('click', handleExport);
    
    // 奖励补发相关
    if (elements.selectFileBtn) {
        elements.selectFileBtn.addEventListener('click', () => {
            elements.excelFile.click();
        });
    }
    if (elements.excelFile) {
        elements.excelFile.addEventListener('change', handleFileSelect);
    }
    if (elements.resendBtn) {
        elements.resendBtn.addEventListener('click', () => {
            showConfirmDialog(false); // false表示单个补发
        });
    }
    
    if (elements.resendAllBtn) {
        elements.resendAllBtn.addEventListener('click', () => {
            showConfirmDialog(true); // true表示一键补发所有
        });
    }
    
    // 榜单类型复选框选择
    if (elements.resendRankCheckboxes) {
        elements.resendRankCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateResendRewardDetail(); // 更新奖励明细预览
                updateResendMissingList(); // 更新漏发名单显示
            });
        });
    }
    
    // 一键选择所有榜单类型
    if (elements.selectAllRanksBtn) {
        elements.selectAllRanksBtn.addEventListener('click', () => {
            const allChecked = Array.from(elements.resendRankCheckboxes).every(cb => cb.checked);
            elements.resendRankCheckboxes.forEach(cb => {
                cb.checked = !allChecked;
            });
            updateResendRewardDetail(); // 更新奖励明细预览
            updateResendMissingList(); // 更新漏发名单显示
        });
    }
    
    // 确认对话框事件
    if (elements.confirmModalClose) {
        elements.confirmModalClose.addEventListener('click', closeConfirmDialog);
    }
    if (elements.confirmModalCancel) {
        elements.confirmModalCancel.addEventListener('click', closeConfirmDialog);
    }
    if (elements.confirmModalConfirm) {
        elements.confirmModalConfirm.addEventListener('click', confirmResend);
    }
    if (elements.confirmModal) {
        elements.confirmModal.addEventListener('click', (e) => {
            if (e.target === elements.confirmModal) {
                closeConfirmDialog();
            }
        });
    }
    
    // iid选择页签（补发页签的步骤1）
    const resendIidTabs = document.querySelectorAll('.resend-step-1 .iid-tab');
    if (resendIidTabs && resendIidTabs.length > 0) {
        resendIidTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const iid = tab.getAttribute('data-iid');
                switchResendIid(iid);
                // 更新显示
                if (elements.currentResendIidDisplay) {
                    elements.currentResendIidDisplay.textContent = iid;
                }
                // 更新iid页签状态
                resendIidTabs.forEach(t => {
                    if (t === tab) {
                        t.classList.add('active');
                    } else {
                        t.classList.remove('active');
                    }
                });
            });
        });
    }
    
    // 榜单类型复选框选中状态更新rank-item的checked类
    if (elements.resendRankCheckboxes) {
        elements.resendRankCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const rankItem = checkbox.closest('.rank-item');
                if (rankItem) {
                    if (checkbox.checked) {
                        rankItem.classList.add('checked');
                    } else {
                        rankItem.classList.remove('checked');
                    }
                }
                updateResendMissingList();
            });
        });
    }
    
    // 数据源选择
    if (elements.dataSourceExcel) {
        elements.dataSourceExcel.addEventListener('change', handleDataSourceChange);
    }
    if (elements.dataSourceFetched) {
        elements.dataSourceFetched.addEventListener('change', handleDataSourceChange);
    }
    
    // 初始化时调用一次，确保显示正确的数据源区域
    handleDataSourceChange();
    if (elements.useFetchedDataBtn) {
        elements.useFetchedDataBtn.addEventListener('click', handleUseFetchedData);
    }
    
    // 批量发送选项变化时，显示/隐藏Group类型选择
    if (elements.useBatchSend && elements.groupTypeContainer) {
        elements.useBatchSend.addEventListener('change', () => {
            if (elements.useBatchSend.checked) {
                elements.groupTypeContainer.style.display = 'none';
            } else {
                elements.groupTypeContainer.style.display = 'block';
            }
        });
        // 初始化显示状态
        if (elements.useBatchSend.checked) {
            elements.groupTypeContainer.style.display = 'none';
        }
    }

    // 榜单选择变化时，更新奖励明细显示
    if (elements.rankCheckboxes && elements.rankCheckboxes.length > 0) {
        elements.rankCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateRewardDetail);
        });
        // 默认选中第一个榜单
        elements.rankCheckboxes[0].checked = true;
        // 延迟更新，确保配置已加载
        setTimeout(() => {
            updateRewardDetail();
        }, 500);
    }
    
    // 榜单配置：游戏类型切换
    if (elements.gameTabBtns) {
        elements.gameTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const gameType = btn.getAttribute('data-game');
                if (!gameType) return;
                setActiveGameTab(gameType);
                loadDefaultConfig(gameType);
            });
        });
    }

    // Lua配置文件上传（榜单配置页签）
    if (elements.selectLuaFileBtn) {
        elements.selectLuaFileBtn.addEventListener('click', () => {
            elements.luaConfigFile.click();
        });
    }
    if (elements.luaConfigFile) {
        elements.luaConfigFile.addEventListener('change', handleLuaFileSelect);
    }
    
    // 榜单类型变化时，同步到榜单配置页签
    if (elements.resendRankType) {
        elements.resendRankType.addEventListener('change', () => {
            const rankType = elements.resendRankType.value;
            switchRankTab(rankType);
            syncRankConfigToResendForm(rankType);
        });
    }
    
    // 批量发送所有榜单选项变化
    if (elements.sendAllRanks) {
        elements.sendAllRanks.addEventListener('change', () => {
            if (elements.sendAllRanks.checked) {
                if (elements.resendRankType) {
                    elements.resendRankType.disabled = true;
                }
            } else {
                if (elements.resendRankType) {
                    elements.resendRankType.disabled = false;
                }
            }
        });
    }
    
    // 监听榜单配置输入框的变化，实时更新状态
    document.querySelectorAll('.rank-title, .rank-content').forEach(input => {
        input.addEventListener('input', () => {
            const rankType = input.getAttribute('data-rank');
            if (rankType) {
                if (input.classList.contains('rank-title')) {
                    missingListState.rankConfigs[rankType].title = input.value;
                } else if (input.classList.contains('rank-content')) {
                    missingListState.rankConfigs[rankType].content = input.value;
                }
            }
        });
    });
}

// 设置默认值（防止页面脚本报错）
function setDefaultValues() {
    if (elements.resendUrl && !elements.resendUrl.value) {
        elements.resendUrl.value = 'http://172.20.192.21:20000/gm';
    }
    if (elements.resendTimestamp && !elements.resendTimestamp.value) {
        elements.resendTimestamp.value = '123456';
    }
    if (elements.resendSign && !elements.resendSign.value) {
        elements.resendSign.value = 'ae3f82244a10fd817ab1223c480c4d34';
    }
}

// 处理数据源切换
function handleDataSourceChange() {
    if (elements.dataSourceExcel && elements.dataSourceExcel.checked) {
        if (elements.excelUploadArea) {
            elements.excelUploadArea.style.display = 'block';
        }
        if (elements.fetchedDataArea) {
            elements.fetchedDataArea.style.display = 'none';
        }
        // 切换到Excel时，清空uploadedPlayers（除非已经有Excel数据）
        // 这里不清空，因为用户可能已经上传了Excel
    } else if (elements.dataSourceFetched && elements.dataSourceFetched.checked) {
        if (elements.excelUploadArea) {
            elements.excelUploadArea.style.display = 'none';
        }
        if (elements.fetchedDataArea) {
            elements.fetchedDataArea.style.display = 'block';
        }
        updateFetchedDataInfo();
        // 自动使用当前筛选的数据
        autoUseFetchedData();
    }
}

// 更新拉取数据信息
function updateFetchedDataInfo() {
    const count = missingListState.currentData.length;
    if (elements.fetchedDataCount) {
        elements.fetchedDataCount.textContent = count;
    }
    if (elements.useFetchedDataBtn) {
        elements.useFetchedDataBtn.disabled = count === 0;
    }
}

// 自动使用拉取的漏发名单数据（当选择"使用拉取的漏发名单"时）
function autoUseFetchedData() {
    // 优先使用 currentData，如果没有则使用 filteredData
    const data = missingListState.currentData.length > 0 
        ? missingListState.currentData 
        : (missingListState.filteredData.length > 0 
            ? missingListState.filteredData 
            : missingListState.allData);
    
    if (data.length === 0) {
        missingListState.uploadedPlayers = [];
        console.log('autoUseFetchedData: 没有可用数据，清空 uploadedPlayers');
        return;
    }

    // 转换为玩家信息格式
    const players = data.map(item => ({
        psid: item.psid || 0,
        rank: item.rank || 0,
        score: item.score || 0,
        clubid: item.clubid || null,
        username: item.username || '',
        userid: item.userid || '',
        is_club_rank: typeof item.is_club_rank === 'boolean' ? item.is_club_rank : null,
        rank_type: item.type || item.rank_type || ''
    })).filter(p => p.psid > 0 && p.rank > 0);

    missingListState.uploadedPlayers = players;
    console.log(`autoUseFetchedData: 已设置 ${players.length} 条玩家数据到 uploadedPlayers`);
}

// 使用拉取的漏发名单数据（手动点击按钮）
function handleUseFetchedData() {
    const data = missingListState.currentData.length > 0 
        ? missingListState.currentData 
        : missingListState.filteredData;
    
    if (data.length === 0) {
        showUploadMessage('没有可用的漏发名单数据，请先拉取数据', 'error');
        return;
    }

    // 转换为玩家信息格式
    const players = data.map(item => ({
        psid: item.psid || 0,
        rank: item.rank || 0,
        score: item.score || 0,
        clubid: item.clubid || null,
        username: item.username || '',
        userid: item.userid || '',
        is_club_rank: typeof item.is_club_rank === 'boolean' ? item.is_club_rank : null,
        rank_type: item.type || item.rank_type || ''
    })).filter(p => p.psid > 0 && p.rank > 0);

    if (players.length === 0) {
        showUploadMessage('漏发名单数据中没有有效的玩家信息（PSID和Rank）', 'error');
        return;
    }

    missingListState.uploadedPlayers = players;
    showUploadMessage(`成功使用 ${players.length} 条漏发名单数据`, 'success');
    
    // 显示补发名单详情
    displayPlayerList(players);
}

// 处理文件选择
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
        showUploadMessage('请选择Excel文件（.xlsx或.xls）', 'error');
        return;
    }

    elements.fileName.textContent = file.name;

    try {
        // 读取文件为Base64
        const base64 = await fileToBase64(file);
        
        // 调用API解析Excel
        const response = await fetch('/api/missinglist/parse-excel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file_data: base64
            })
        });

        const data = await response.json();
        if (iid === 'daqiqiu' || iid === 'cqsj') {
            console.log('[cqsj/daqiqiu] 后端返回完整配置:', data);
            if (data && data.config && data.config.rewards) {
                console.log('[cqsj/daqiqiu] 后端返回奖励明细:', data.config.rewards);
            }
        }

        if (!response.ok) {
            throw new Error(data.error || '解析失败');
        }

        if (data.success) {
            missingListState.uploadedPlayers = data.data || [];
            showUploadMessage(`成功解析 ${data.count} 条玩家数据`, 'success');
        } else {
            throw new Error('解析失败');
        }
    } catch (error) {
        console.error('解析Excel失败:', error);
        showUploadMessage('解析Excel失败: ' + error.message, 'error');
        missingListState.uploadedPlayers = [];
    }
}

// 文件转Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // 移除data:application/...;base64,前缀
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 处理Lua配置文件选择
async function handleLuaFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.lua')) {
        showResendMessage('请选择Lua配置文件（.lua）', 'error');
        return;
    }
    
    try {
        elements.selectLuaFileBtn.disabled = true;
        elements.selectLuaFileBtn.innerHTML = '<span>解析中...</span>';
        
        // 读取文件内容
        const content = await file.text();
        const gameType = missingListState.currentGameType || 'bydr';
        
        // 调用后端解析
        const response = await fetch('/api/missinglist/parse-lua', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: content,
                game_type: gameType
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '解析失败');
        }
        
        if (data.success && data.config) {
            // 应用解析后的配置
            applyLuaConfig(data.config);
            if (elements.luaFileName) {
                elements.luaFileName.textContent = file.name;
            }
            showConfigStatus('配置文件解析成功，已自动填充', 'success');
        } else {
            throw new Error('解析失败');
        }
    } catch (error) {
        console.error('解析Lua配置失败:', error);
        showConfigStatus('解析失败: ' + error.message, 'error');
    } finally {
        elements.selectLuaFileBtn.disabled = false;
        elements.selectLuaFileBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 16px; height: 16px;">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>选择Lua配置文件</span>
        `;
    }
}

// 应用Lua配置到表单
function applyLuaConfig(config) {
    // 更新所有榜单类型的配置
    const rankTypes = ['daily_person', 'total_person', 'daily_person_super', 'total_person_super', 'daily_club', 'total_club'];
    
    rankTypes.forEach(rankType => {
        // 更新标题（无论输入框是否存在，都保存到状态中）
        if (config.titles && config.titles[rankType]) {
            missingListState.rankConfigs[rankType].title = config.titles[rankType];
            const titleInput = document.querySelector(`.rank-title[data-rank="${rankType}"]`);
            if (titleInput) {
                titleInput.value = config.titles[rankType];
            }
        }
        
        // 更新内容（无论输入框是否存在，都保存到状态中）
        if (config.contents && config.contents[rankType]) {
            missingListState.rankConfigs[rankType].content = config.contents[rankType];
            const contentInput = document.querySelector(`.rank-content[data-rank="${rankType}"]`);
            if (contentInput) {
                contentInput.value = config.contents[rankType];
            }
        }
        
        // 更新奖励配置（表格渲染使用）
        if (config.rewards && config.rewards[rankType]) {
            try {
                missingListState.rankConfigs[rankType].reward = config.rewards[rankType];
            } catch (e) {
                console.error(`更新奖励配置失败 (${rankType}):`, e);
            }
        }
        
        // 更新包含道具名称的奖励配置（优先使用）
        if (config.rewards_with_names && config.rewards_with_names[rankType]) {
            try {
                missingListState.rankConfigs[rankType].reward_with_names = config.rewards_with_names[rankType];
            } catch (e) {
                console.error(`更新奖励配置（含名称）失败 (${rankType}):`, e);
            }
        }
    });
    
    // 不自动切换页签，只在当前是榜单配置页签时更新显示
    const currentTab = Array.from(elements.tabBtns).find(btn => btn.classList.contains('active'))?.getAttribute('data-tab');
    if (currentTab === 'config') {
        // 更新奖励明细显示
        updateRewardDetail();
    }

    // 超级奖限制
    missingListState.superLimits = config.super_limits || {};
    console.log('后端返回奖励明细:', config.rewards);
    console.log('后端返回超级奖限制:', config.super_limits);

    // 保存当前游戏类型的配置到iidConfigs
    const currentIid = missingListState.currentGameType || 'bydr';
    const rankConfigsCopy = {};
    Object.keys(missingListState.rankConfigs).forEach(rankType => {
        rankConfigsCopy[rankType] = {
            title: missingListState.rankConfigs[rankType].title || '',
            content: missingListState.rankConfigs[rankType].content || '',
            reward: missingListState.rankConfigs[rankType].reward || {},
            reward_with_names: missingListState.rankConfigs[rankType].reward_with_names || missingListState.rankConfigs[rankType].reward || {}
        };
    });
    
    console.log(`保存配置到 iidConfigs[${currentIid}]`, { 
        rankConfigsCopy,
        superLimits: missingListState.superLimits 
    });
    
    missingListState.iidConfigs[currentIid] = {
        rankConfigs: rankConfigsCopy,
        superLimits: JSON.parse(JSON.stringify(missingListState.superLimits))
    };

    // 渲染奖励详情表格（确保道具映射已加载）
    if (Object.keys(itemNameMap).length > 0 || Object.keys(missingListState.rankConfigs).some(rt => missingListState.rankConfigs[rt].reward_with_names)) {
        renderRewardTables();
    } else {
        // 如果道具映射未加载，等待加载完成后再渲染
        loadItemMap().then(() => {
            renderRewardTables();
        });
    }
    
    // 同步当前选择的榜单类型到补发配置
    const currentRankType = elements.resendRankType ? elements.resendRankType.value : 'daily_person';
    setTimeout(() => {
        switchRankTab(currentRankType);
        syncRankConfigToResendForm(currentRankType);
    }, 100);
    
    // 如果当前在补发页签，更新显示
    if (missingListState.currentResendIid === currentIid) {
        updateResendRewardDetail();
    }
}

// 同步榜单配置到补发表单
function syncRankConfigToResendForm(rankType) {
    const config = missingListState.rankConfigs[rankType];
    if (elements.mailTitle) {
        elements.mailTitle.value = config.title || '';
    }
    if (elements.mailContent) {
        elements.mailContent.value = config.content || '';
    }
    if (elements.rewardConfig) {
        const reward = config.reward || {};
        elements.rewardConfig.value = JSON.stringify(reward, null, 2);
    }
}

// 渲染奖励详情表格
function renderRewardTables() {
    const rankTypes = ['daily_person', 'total_person', 'daily_person_super', 'total_person_super', 'daily_club', 'total_club'];
    rankTypes.forEach(rankType => {
        const table = document.querySelector(`.reward-table[data-rank="${rankType}"]`);
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const rewardConfig = missingListState.rankConfigs[rankType].reward || {};
        const rankLimits = Object.keys(rewardConfig)
            .map(key => Number(key))
            .filter(num => !Number.isNaN(num))
            .sort((a, b) => a - b);

        if (rankLimits.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="2" style="color: var(--text-secondary);">暂无奖励配置</td>`;
            tbody.appendChild(row);
            return;
        }

        rankLimits.forEach(rankLimit => {
            const items = rewardConfig[String(rankLimit)] || {};
            const sortedItemIds = Object.keys(items)
                .map(itemId => Number(itemId))
                .filter(num => !Number.isNaN(num))
                .sort((a, b) => a - b);

            let itemTableHtml = '-';
            if (sortedItemIds.length > 0) {
                const rows = sortedItemIds.map(itemId => {
                    const count = items[String(itemId)] || 0;
                    const itemName = getItemName(String(itemId));
                    return `
                        <tr>
                            <td>${itemName}</td>
                            <td>${count}</td>
                        </tr>
                    `;
                }).join('');
                itemTableHtml = `
                    <table class="inner-reward-table">
                        <thead>
                            <tr>
                                <th>道具名称</th>
                                <th>数量</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                `;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${rankLimit}</td>
                <td>${itemTableHtml}</td>
            `;
            tbody.appendChild(row);
        });
    });
}

// 初始化榜单配置子页签
function initRankTabs() {
    // 重新获取元素引用（因为可能在页面加载时元素还不存在）
    const rankTabBtns = document.querySelectorAll('.rank-tab-btn');
    const rankTabContents = document.querySelectorAll('.rank-tab-content');
    
    if (rankTabBtns && rankTabBtns.length > 0) {
        rankTabBtns.forEach(btn => {
            // 移除旧的事件监听器（如果存在）
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // 添加新的事件监听器
            newBtn.addEventListener('click', () => {
                const rankType = newBtn.getAttribute('data-rank-tab');
                switchRankTab(rankType);
            });
        });
        
        // 更新元素引用
        elements.rankTabBtns = document.querySelectorAll('.rank-tab-btn');
        elements.rankTabContents = document.querySelectorAll('.rank-tab-content');
    }
}

// 切换榜单配置页签
function switchRankTab(rankType) {
    // 重新获取元素引用（确保获取到最新的DOM元素）
    const rankTabBtns = document.querySelectorAll('.rank-tab-btn');
    const rankTabContents = document.querySelectorAll('.rank-tab-content');
    
    // 更新按钮状态
    if (rankTabBtns && rankTabBtns.length > 0) {
        rankTabBtns.forEach(btn => {
            if (btn.getAttribute('data-rank-tab') === rankType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // 更新内容显示
    const rankTabMap = {
        'daily_person': 'rankTabDailyPerson',
        'total_person': 'rankTabTotalPerson',
        'daily_club': 'rankTabDailyClub',
        'total_club': 'rankTabTotalClub'
    };
    
    if (rankTabContents && rankTabContents.length > 0) {
        rankTabContents.forEach(content => {
            if (content.id === rankTabMap[rankType]) {
                content.style.display = 'block';
                content.classList.add('active');
            } else {
                content.style.display = 'none';
                content.classList.remove('active');
            }
        });
    }
    
    // 同步到补发配置的榜单类型选择
    if (elements.resendRankType && (!elements.sendAllRanks || !elements.sendAllRanks.checked)) {
        elements.resendRankType.value = rankType;
    }
    
    // 同步配置到补发表单
    syncRankConfigToResendForm(rankType);
}

// 设置当前游戏页签
function setActiveGameTab(gameType) {
    missingListState.currentGameType = gameType;
    if (elements.gameTabBtns) {
        elements.gameTabBtns.forEach(btn => {
            if (btn.getAttribute('data-game') === gameType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// 显示配置加载状态
function showConfigStatus(message, type) {
    if (!elements.configStatus) return;
    elements.configStatus.textContent = message;
    if (type === 'success') {
        elements.configStatus.style.color = 'var(--success-color)';
    } else if (type === 'error') {
        elements.configStatus.style.color = 'var(--error-color)';
    } else {
        elements.configStatus.style.color = 'var(--text-secondary)';
    }
}

// 加载默认配置（自动）
async function loadDefaultConfig(gameType) {
    const iid = gameType || 'bydr';
    
    try {
        showConfigStatus(`正在加载默认配置：${iid}...`, 'info');
        
        const response = await fetch('/api/missinglist/load-default-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                iid: iid
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '加载失败');
        }
        
        if (data.success && data.config) {
            applyLuaConfig(data.config);
            // 保存到iidConfigs（applyLuaConfig已经保存了，这里确保保存了reward_with_names）
            const rankConfigsCopy = {};
            Object.keys(missingListState.rankConfigs).forEach(rankType => {
                rankConfigsCopy[rankType] = {
                    title: missingListState.rankConfigs[rankType].title,
                    content: missingListState.rankConfigs[rankType].content,
                    reward: missingListState.rankConfigs[rankType].reward,
                    reward_with_names: missingListState.rankConfigs[rankType].reward_with_names || missingListState.rankConfigs[rankType].reward
                };
            });
            missingListState.iidConfigs[iid] = {
                rankConfigs: rankConfigsCopy,
                superLimits: JSON.parse(JSON.stringify(missingListState.superLimits))
            };
            showConfigStatus(`已加载默认配置：${iid}`, 'success');
            
            // 如果当前补发页签选择的是这个iid，更新显示
            if (missingListState.currentResendIid === iid) {
                updateResendRewardDetail();
            }
        } else {
            throw new Error('加载失败');
        }
    } catch (error) {
        console.error('加载默认配置失败:', error);
        showConfigStatus('加载失败: ' + error.message, 'error');
    }
}

// 加载默认配置（用于补发页签，不切换页签）
async function loadDefaultConfigForResend(iid) {
    try {
        const response = await fetch('/api/missinglist/load-default-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                iid: iid
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '加载失败');
        }
        
        if (data.success && data.config) {
            // 应用配置但不切换页签
            applyLuaConfigForResend(data.config, iid);
        } else {
            throw new Error('加载失败');
        }
    } catch (error) {
        console.error('加载默认配置失败:', error);
    }
}

// 应用Lua配置到表单（不切换页签）
function applyLuaConfigForResend(config, iid) {
    // 更新所有榜单类型的配置
    const rankTypes = ['daily_person', 'total_person', 'daily_person_super', 'total_person_super', 'daily_club', 'total_club'];
    
    rankTypes.forEach(rankType => {
        // 更新标题
        if (config.titles && config.titles[rankType]) {
            missingListState.rankConfigs[rankType].title = config.titles[rankType];
        }
        
        // 更新内容
        if (config.contents && config.contents[rankType]) {
            missingListState.rankConfigs[rankType].content = config.contents[rankType];
        }
        
        // 更新奖励配置（表格渲染使用）
        if (config.rewards && config.rewards[rankType]) {
            try {
                missingListState.rankConfigs[rankType].reward = config.rewards[rankType];
            } catch (e) {
                console.error(`更新奖励配置失败 (${rankType}):`, e);
            }
        }
        
        // 更新包含道具名称的奖励配置（优先使用）
        if (config.rewards_with_names && config.rewards_with_names[rankType]) {
            try {
                missingListState.rankConfigs[rankType].reward_with_names = config.rewards_with_names[rankType];
            } catch (e) {
                console.error(`更新奖励配置（含名称）失败 (${rankType}):`, e);
            }
        }
    });
    
    // 超级奖限制
    missingListState.superLimits = config.super_limits || {};
    
    // 保存当前游戏类型的配置到iidConfigs
    const currentIid = iid || missingListState.currentGameType || 'bydr';
    const rankConfigsCopy = {};
    Object.keys(missingListState.rankConfigs).forEach(rankType => {
        rankConfigsCopy[rankType] = {
            title: missingListState.rankConfigs[rankType].title || '',
            content: missingListState.rankConfigs[rankType].content || '',
            reward: missingListState.rankConfigs[rankType].reward || {},
            reward_with_names: missingListState.rankConfigs[rankType].reward_with_names || missingListState.rankConfigs[rankType].reward || {}
        };
    });
    
    console.log(`保存配置到 iidConfigs[${currentIid}] (applyLuaConfigForResend)`, { 
        rankConfigsCopy,
        superLimits: missingListState.superLimits 
    });
    
    missingListState.iidConfigs[currentIid] = {
        rankConfigs: rankConfigsCopy,
        superLimits: JSON.parse(JSON.stringify(missingListState.superLimits))
    };
}

// 切换补发页签的iid
async function switchResendIid(iid) {
    missingListState.currentResendIid = iid;
    
    // 更新iid页签状态（步骤1的iid页签）
    const resendIidTabs = document.querySelectorAll('.resend-step-1 .iid-tab');
    if (resendIidTabs && resendIidTabs.length > 0) {
        resendIidTabs.forEach(tab => {
            if (tab.getAttribute('data-iid') === iid) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
    
    // 更新显示
    if (elements.currentResendIidDisplay) {
        elements.currentResendIidDisplay.textContent = iid;
    }
    
    // 更新右侧提示
    const resendCurrentIidHint = document.getElementById('resendCurrentIidHint');
    if (resendCurrentIidHint) {
        resendCurrentIidHint.textContent = iid;
    }
    
    // 如果该iid的配置未加载，先加载（但不切换页签）
    if (!missingListState.iidConfigs[iid] || Object.keys(missingListState.iidConfigs[iid].rankConfigs || {}).length === 0) {
        // 保存当前页签状态
        const currentTab = Array.from(elements.tabBtns).find(btn => btn.classList.contains('active'))?.getAttribute('data-tab');
        
        // 加载配置（但不切换页签）
        await loadDefaultConfigForResend(iid);
        
        // 恢复页签状态（如果被切换了）
        if (currentTab && currentTab !== 'config') {
            switchTab(currentTab);
        }
    } else {
        // 恢复该iid的配置
        missingListState.rankConfigs = JSON.parse(JSON.stringify(missingListState.iidConfigs[iid].rankConfigs));
        missingListState.superLimits = JSON.parse(JSON.stringify(missingListState.iidConfigs[iid].superLimits));
    }
    
    // 如果选择了"使用拉取的漏发名单"，需要根据新的iid更新数据
    if (elements.dataSourceFetched && elements.dataSourceFetched.checked) {
        // 根据新的iid过滤数据
        const allFetchedData = missingListState.currentData.length > 0 
            ? missingListState.currentData 
            : (missingListState.filteredData.length > 0 ? missingListState.filteredData : []);
        
        // 过滤出当前iid的数据
        const iidFilteredData = allFetchedData.filter(item => item.iid === iid);
        
        // 更新uploadedPlayers
        missingListState.uploadedPlayers = iidFilteredData.map(item => ({
            psid: item.psid,
            rank: item.rank,
            score: item.score,
            clubid: item.clubid || null,
            iid: item.iid,
            is_club_rank: item.is_club_rank,
            rank_type: item.type === 'daily' ? 'daily' : (item.type === 'total' ? 'total' : null)
        }));
    }
    
    // 更新奖励明细和漏发名单显示
    updateResendRewardDetail();
    updateResendMissingList();
}

// 切换补发页签的榜单类型
function switchResendRankType(rankType) {
    missingListState.currentResendRankType = rankType;
    
    // 更新榜单类型页签状态
    if (elements.resendRankTabBtns) {
        elements.resendRankTabBtns.forEach(btn => {
            if (btn.getAttribute('data-rank-type') === rankType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // 更新奖励明细和漏发名单显示
    updateResendRewardDetail();
    updateResendMissingList();
}

// 更新补发页签的奖励明细显示
function updateResendRewardDetail() {
    if (!elements.resendRewardDetailContainer) return;
    
    const iid = missingListState.currentResendIid;
    
    // 获取选中的榜单类型
    const selectedRanks = Array.from(elements.resendRankCheckboxes || [])
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedRanks.length === 0) {
        elements.resendRewardDetailContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 13px;">
                请选择榜单类型查看奖励明细
            </div>
        `;
        return;
    }
    
    // 显示第一个选中榜单类型的奖励明细
    const rankType = selectedRanks[0];
    
    // 获取当前iid的配置
    const iidConfig = missingListState.iidConfigs[iid];
    if (!iidConfig || !iidConfig.rankConfigs) {
        elements.resendRewardDetailContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 13px;">
                请先加载配置
            </div>
        `;
        return;
    }
    
    const config = iidConfig.rankConfigs[rankType];
    if (!config || !config.reward || Object.keys(config.reward).length === 0) {
        elements.resendRewardDetailContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 13px;">
                暂无奖励配置
            </div>
        `;
        return;
    }
    
    // 优先使用包含道具名称的奖励配置
    let rewardToDisplay = config.reward;
    if (config.reward_with_names && typeof config.reward_with_names === 'object' && Object.keys(config.reward_with_names).length > 0) {
        rewardToDisplay = config.reward_with_names;
    } else if (config.reward && typeof config.reward === 'object') {
        // 如果没有reward_with_names，尝试使用itemNameMap转换
        rewardToDisplay = convertRewardWithNames(config.reward);
    }
    
    // 渲染奖励表格
    try {
        const rewardTable = renderRewardTable(rewardToDisplay);
        elements.resendRewardDetailContainer.innerHTML = rewardTable;
    } catch (error) {
        console.error('渲染奖励表格失败:', error);
        elements.resendRewardDetailContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #ef4444; font-size: 13px;">
                渲染奖励表格失败: ${error.message}
            </div>
        `;
    }
}

// 更新补发页签的漏发名单显示
function updateResendMissingList() {
    if (!elements.resendMissingListBody || !elements.resendMissingListCount) return;
    
    // 获取选中的榜单类型
    const selectedRanks = Array.from(elements.resendRankCheckboxes || [])
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedRanks.length === 0) {
        elements.resendMissingListBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 40px;">
                    请选择榜单类型查看漏发名单
                </td>
            </tr>
        `;
        elements.resendMissingListCount.textContent = '共 0 条';
        if (elements.resendMissingListTitle) {
            elements.resendMissingListTitle.textContent = '';
        }
        return;
    }
    
    const iid = missingListState.currentResendIid;
    
    // 如果选择了"使用拉取的漏发名单"，确保数据已按iid过滤
    if (elements.dataSourceFetched && elements.dataSourceFetched.checked) {
        const allFetchedData = missingListState.currentData.length > 0 
            ? missingListState.currentData 
            : (missingListState.filteredData.length > 0 ? missingListState.filteredData : []);
        
        // 过滤出当前iid的数据
        const iidFilteredData = allFetchedData.filter(item => item.iid === iid);
        
        // 更新uploadedPlayers
        missingListState.uploadedPlayers = iidFilteredData.map(item => ({
            psid: item.psid,
            rank: item.rank,
            score: item.score,
            clubid: item.clubid || null,
            iid: item.iid,
            is_club_rank: item.is_club_rank,
            rank_type: item.type === 'daily' ? 'daily' : (item.type === 'total' ? 'total' : null)
        }));
    }
    
    // 如果有多个选中的榜单类型，显示所有符合条件的玩家
    let filteredData = [];
    
    selectedRanks.forEach(rankType => {
        let players = filterPlayersByRankType(missingListState.uploadedPlayers, rankType);
        
        // 超级奖限制
        if (rankType === 'daily_person_super' || rankType === 'total_person_super') {
            const limit = missingListState.superLimits[rankType];
            if (limit) {
                const maxRank = Number(limit.max_rank || 0);
                const minScore = Number(limit.min_score || 0);
                players = players.filter(p => {
                    const rankOk = maxRank <= 0 || (p.rank > 0 && p.rank <= maxRank);
                    const scoreOk = minScore <= 0 || (p.score > 0 && p.score >= minScore);
                    return rankOk && scoreOk;
                });
            }
        }
        
        // 添加榜单类型标记
        players.forEach(p => {
            p._rankType = rankType;
        });
        
        filteredData = filteredData.concat(players);
    });
    
    // 去重（根据PSID和榜单类型）
    const uniqueMap = new Map();
    filteredData.forEach(p => {
        const key = `${p.psid}_${p._rankType}`;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, p);
        }
    });
    filteredData = Array.from(uniqueMap.values());
    
    // 更新标题
    if (elements.resendMissingListTitle) {
        if (selectedRanks.length === 1) {
            const rankName = Array.from(elements.resendRankCheckboxes).find(cb => cb.value === selectedRanks[0])?.getAttribute('data-rank-name') || selectedRanks[0];
            elements.resendMissingListTitle.textContent = `(${rankName})`;
        } else {
            elements.resendMissingListTitle.textContent = `(${selectedRanks.length}个榜单类型)`;
        }
    }
    
    // 渲染表格
    if (filteredData.length === 0) {
        elements.resendMissingListBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 40px;">
                    暂无符合条件的漏发名单
                </td>
            </tr>
        `;
    } else {
        let html = '';
        filteredData.forEach(item => {
            html += `
                <tr>
                    <td>${item.psid || '-'}</td>
                    <td>${item.rank || '-'}</td>
                    <td>${item.score || '-'}</td>
                    <td>${item.clubid || '-'}</td>
                    <td>${item.date_time || '-'}</td>
                    <td>${item.hid || '-'}</td>
                </tr>
            `;
        });
        elements.resendMissingListBody.innerHTML = html;
    }
    
    elements.resendMissingListCount.textContent = `共 ${filteredData.length} 条`;
}

// 显示补发名单详情
function displayPlayerList(players) {
    if (!elements.playerListBody || !elements.playerListSection) {
        return;
    }
    
    // 按排名排序
    const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);
    
    // 生成表格HTML
    let html = '';
    sortedPlayers.forEach(player => {
        html += `
            <tr>
                <td>${player.psid}</td>
                <td>${player.rank}</td>
                <td>${player.score}</td>
                <td>${player.clubid || '-'}</td>
                <td>${player.username || '-'}</td>
                <td>${player.userid || '-'}</td>
            </tr>
        `;
    });
    
    elements.playerListBody.innerHTML = html;
    elements.playerListSection.style.display = 'block';
    
    // 滚动到列表区域
    elements.playerListSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 显示上传提示信息
function showUploadMessage(message, type = 'info') {
    const messageArea = elements.uploadMessageArea;
    if (!messageArea) return;
    
    messageArea.textContent = message;
    messageArea.className = `message-area message-${type}`;
    messageArea.style.display = 'block';

    const timeout = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        messageArea.style.display = 'none';
    }, timeout);
}

// 解析奖励配置
function parseRewardConfig(configText, rankType) {
    try {
        const config = JSON.parse(configText);
        
        // 验证奖励配置
        if (!config || typeof config !== 'object') {
            throw new Error('奖励配置格式错误，必须是一个对象');
        }

        // 如果配置包含榜单类型键，提取对应榜单的配置
        if (config[rankType]) {
            return config[rankType];
        }
        
        // 如果配置不包含榜单类型键，可能是旧格式，直接返回
        // 检查是否包含榜单类型键
        const rankTypes = ['daily_person', 'total_person', 'daily_club', 'total_club'];
        const hasRankType = rankTypes.some(rt => config[rt] !== undefined);
        
        if (hasRankType) {
            throw new Error(`奖励配置中未找到榜单类型 "${rankType}" 的配置`);
        }
        
        // 旧格式，直接返回
        return config;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('JSON格式错误: ' + error.message);
        }
        throw error;
    }
}

// 确认对话框相关变量
let pendingResendAction = null; // 存储待执行的补发操作

// 显示确认对话框
function showConfirmDialog(isAllRanks = false) {
    const iid = missingListState.currentResendIid || 'bydr';
    
    // 获取选中的榜单类型
    const selectedRanks = Array.from(elements.resendRankCheckboxes || [])
        .filter(cb => cb.checked)
        .map(cb => ({
            value: cb.value,
            name: cb.getAttribute('data-rank-name') || cb.value
        }));
    
    if (!isAllRanks && selectedRanks.length === 0) {
        showResendMessage('请至少选择一个要补发的榜单类型', 'error');
        return;
    }
    
    // 计算补发个数
    let totalCount = 0;
    const rankCounts = [];
    
    if (isAllRanks) {
        // 一键补发所有：计算所有榜单类型的补发个数
        const allRankTypes = [
            { value: 'daily_person', name: '个人日榜' },
            { value: 'total_person', name: '个人总榜' },
            { value: 'daily_club', name: '公会日榜' },
            { value: 'total_club', name: '公会总榜' },
            { value: 'daily_person_super', name: '个人日榜超级奖' },
            { value: 'total_person_super', name: '个人总榜超级奖' }
        ];
        
        allRankTypes.forEach(rank => {
            let players = filterPlayersByRankType(missingListState.uploadedPlayers, rank.value);
            
            // 超级奖限制
            if (rank.value === 'daily_person_super' || rank.value === 'total_person_super') {
                const iidConfig = missingListState.iidConfigs[iid];
                const limit = iidConfig?.superLimits?.[rank.value] || missingListState.superLimits[rank.value];
                if (limit) {
                    const maxRank = Number(limit.max_rank || 0);
                    const minScore = Number(limit.min_score || 0);
                    players = players.filter(p => {
                        const rankOk = maxRank <= 0 || (p.rank > 0 && p.rank <= maxRank);
                        const scoreOk = minScore <= 0 || (p.score > 0 && p.score >= minScore);
                        return rankOk && scoreOk;
                    });
                }
            }
            
            const count = players.length;
            if (count > 0) {
                rankCounts.push({ name: rank.name, count: count });
                totalCount += count;
            }
        });
    } else {
        // 单个补发：只计算选中的榜单类型
        selectedRanks.forEach(rank => {
            let players = filterPlayersByRankType(missingListState.uploadedPlayers, rank.value);
            
            // 超级奖限制
            if (rank.value === 'daily_person_super' || rank.value === 'total_person_super') {
                const iidConfig = missingListState.iidConfigs[iid];
                const limit = iidConfig?.superLimits?.[rank.value] || missingListState.superLimits[rank.value];
                if (limit) {
                    const maxRank = Number(limit.max_rank || 0);
                    const minScore = Number(limit.min_score || 0);
                    players = players.filter(p => {
                        const rankOk = maxRank <= 0 || (p.rank > 0 && p.rank <= maxRank);
                        const scoreOk = minScore <= 0 || (p.score > 0 && p.score >= minScore);
                        return rankOk && scoreOk;
                    });
                }
            }
            
            const count = players.length;
            rankCounts.push({ name: rank.name, count: count });
            totalCount += count;
        });
    }
    
    // 更新对话框内容
    if (elements.confirmIid) {
        elements.confirmIid.textContent = iid;
    }
    if (elements.confirmRankTypes) {
        if (isAllRanks) {
            elements.confirmRankTypes.textContent = '所有榜单类型';
        } else {
            elements.confirmRankTypes.textContent = selectedRanks.map(r => r.name).join('、');
        }
    }
    if (elements.confirmCount) {
        elements.confirmCount.textContent = `${totalCount} 人`;
    }
    
    // 显示详细统计
    if (isAllRanks && rankCounts.length > 0) {
        if (elements.confirmRankList) {
            elements.confirmRankList.innerHTML = rankCounts.map(r => `
                <li class="confirm-rank-item">
                    <span class="confirm-rank-name">${r.name}</span>
                    <span class="confirm-rank-count">${r.count} 人</span>
                </li>
            `).join('');
        }
        if (elements.confirmRankDetails) {
            elements.confirmRankDetails.style.display = 'block';
        }
    } else {
        if (elements.confirmRankDetails) {
            elements.confirmRankDetails.style.display = 'none';
        }
    }
    
    // 存储待执行的补发操作
    pendingResendAction = { isAllRanks, selectedRanks };
    
    // 显示对话框
    if (elements.confirmModal) {
        elements.confirmModal.classList.add('show');
    }
}

// 关闭确认对话框
function closeConfirmDialog() {
    if (elements.confirmModal) {
        elements.confirmModal.classList.remove('show');
    }
    pendingResendAction = null;
}

// 确认补发
async function confirmResend() {
    if (!pendingResendAction) {
        closeConfirmDialog();
        return;
    }
    
    // 先保存待执行的操作，因为 closeConfirmDialog 会将 pendingResendAction 设置为 null
    const action = { ...pendingResendAction };
    
    closeConfirmDialog();
    
    const { isAllRanks, selectedRanks } = action;
    
    if (isAllRanks) {
        await handleResendAll();
    } else {
        await handleResend();
    }
}

// 补发邮件
async function handleResend() {
    const url = elements.resendUrl.value.trim();
    const useBatch = elements.useBatchSend ? elements.useBatchSend.checked : true;
    const group = elements.resendGroup ? elements.resendGroup.value : 'users';
    const timestamp = elements.resendTimestamp.value.trim();
    const sign = elements.resendSign.value.trim();
    
    // 获取选中的榜单类型（从复选框）
    const selectedRanks = Array.from(elements.resendRankCheckboxes || [])
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedRanks.length === 0) {
        showResendMessage('请至少选择一个要补发的榜单类型', 'error');
        return;
    }
    
    const rankTypesToSend = selectedRanks;

    if (!url) {
        showResendMessage('请填写补发接口URL', 'error');
        return;
    }

    // 如果选择了"使用拉取的漏发名单"，需要根据当前iid过滤数据
    if (elements.dataSourceFetched && elements.dataSourceFetched.checked) {
        const allFetchedData = missingListState.currentData.length > 0 
            ? missingListState.currentData 
            : (missingListState.filteredData.length > 0 ? missingListState.filteredData : []);
        
        // 过滤出当前iid的数据
        const iidFilteredData = allFetchedData.filter(item => item.iid === missingListState.currentResendIid);
        
        // 更新uploadedPlayers
        missingListState.uploadedPlayers = iidFilteredData.map(item => ({
            psid: item.psid,
            rank: item.rank,
            score: item.score,
            clubid: item.clubid || null,
            iid: item.iid,
            is_club_rank: item.is_club_rank,
            rank_type: item.type === 'daily' ? 'daily' : (item.type === 'total' ? 'total' : null)
        }));
    }
    
    if (missingListState.uploadedPlayers.length === 0) {
        showResendMessage('没有可用的漏发名单数据，请先拉取数据或上传Excel', 'error');
        return;
    }

    try {
        elements.resendBtn.disabled = true;
        elements.resendBtn.innerHTML = '<span>发送中...</span>';

        let allResults = [];
        
        // 遍历所有要发送的榜单类型
        for (const rankType of rankTypesToSend) {
            console.log(`开始处理榜单类型: ${rankType}`);
            
            // 从iid配置中读取标题、内容和奖励配置
            const iidConfig = missingListState.iidConfigs[missingListState.currentResendIid];
            if (!iidConfig || !iidConfig.rankConfigs || !iidConfig.rankConfigs[rankType]) {
                const errorMsg = `榜单类型 ${rankType} 的配置未加载，请先加载配置`;
                console.error(errorMsg, { iidConfig, currentIid: missingListState.currentResendIid });
                showResendMessage(errorMsg, 'error');
                continue;
            }
            
            const rankConfig = iidConfig.rankConfigs[rankType];
            const title = rankConfig.title || '';
            const content = rankConfig.content || '';
            const rewardConfig = rankConfig.reward || {};
            
            console.log(`配置检查: ${rankType}`, { 
                hasTitle: !!title, 
                hasContent: !!content, 
                rewardKeys: Object.keys(rewardConfig).length 
            });
            
            // 验证配置
            if (!title) {
                showResendMessage(`榜单类型 ${rankType} 的邮件标题未配置`, 'error');
                continue;
            }
            if (!content) {
                showResendMessage(`榜单类型 ${rankType} 的邮件内容未配置`, 'error');
                continue;
            }
            if (Object.keys(rewardConfig).length === 0) {
                showResendMessage(`榜单类型 ${rankType} 的奖励配置未配置`, 'error');
                continue;
            }

            // 按榜单类型过滤玩家
            let playersToSend = filterPlayersByRankType(missingListState.uploadedPlayers, rankType);
            console.log(`过滤前玩家数: ${playersToSend.length} (总玩家数: ${missingListState.uploadedPlayers.length})`);

            // 超级奖限制（排名+积分）
            if (rankType === 'daily_person_super' || rankType === 'total_person_super') {
                // 从iidConfig中读取超级奖限制，如果没有则从全局读取
                const limit = iidConfig.superLimits?.[rankType] || missingListState.superLimits[rankType];
                if (limit) {
                    const maxRank = Number(limit.max_rank || 0);
                    const minScore = Number(limit.min_score || 0);
                    console.log(`超级奖限制: ${rankType}`, { maxRank, minScore, limit });
                    const beforeFilter = playersToSend.length;
                    playersToSend = playersToSend.filter(p => {
                        const rankOk = maxRank <= 0 || (p.rank > 0 && p.rank <= maxRank);
                        const scoreOk = minScore <= 0 || (p.score > 0 && p.score >= minScore);
                        if (!rankOk || !scoreOk) {
                            console.log(`玩家 ${p.psid} 被过滤: rankOk=${rankOk} (rank=${p.rank}, maxRank=${maxRank}), scoreOk=${scoreOk} (score=${p.score}, minScore=${minScore})`);
                        }
                        return rankOk && scoreOk;
                    });
                    console.log(`超级奖过滤后玩家数: ${playersToSend.length} (过滤前: ${beforeFilter})`);
                } else {
                    // 如果没有配置超级奖限制，提示用户
                    console.warn(`超级榜 ${rankType} 的限制配置未找到`, { 
                        iidSuperLimits: iidConfig.superLimits, 
                        globalSuperLimits: missingListState.superLimits 
                    });
                    showResendMessage(`超级榜 ${rankType} 的限制配置未找到，无法发送`, 'error');
                    continue; // 没有限制配置，跳过发送
                }
            }

            if (playersToSend.length === 0) {
                const msg = rankType === 'daily_person_super' || rankType === 'total_person_super' 
                    ? `榜单类型 ${rankType} 无符合超级奖限制的玩家` 
                    : `榜单类型 ${rankType} 没有可发送的玩家`;
                console.warn(msg);
                showResendMessage(msg, 'info');
                continue;
            }
            
            console.log(`准备发送: ${rankType}`, { playersCount: playersToSend.length });

            // 发送补发请求
            console.log(`发送请求: ${rankType}`, { 
                playersCount: playersToSend.length,
                useBatch,
                group,
                url 
            });
            
            try {
                const response = await fetch('/api/missinglist/resend', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: url,
                        rank_type: rankType,
                        use_batch: useBatch,
                        group: group,
                        timestamp: timestamp,
                        sign: sign,
                        title: title,
                        content: content,
                        reward_config: rewardConfig,
                        players: playersToSend
                    })
                });

                const data = await response.json();
                console.log(`响应: ${rankType}`, { 
                    success: data.success, 
                    resultsCount: data.results?.length || 0,
                    error: data.error,
                    status: response.status,
                    data 
                });

                if (!response.ok) {
                    const errorMsg = data.error || `榜单类型 ${rankType} 补发失败 (HTTP ${response.status})`;
                    console.error(errorMsg, { data, response });
                    throw new Error(errorMsg);
                }

                if (data.success) {
                    // 为每个结果添加榜单类型信息
                    const resultsWithType = (data.results || []).map(r => ({
                        ...r,
                        rankType: rankType
                    }));
                    console.log(`成功: ${rankType}`, { resultsCount: resultsWithType.length });
                    allResults = allResults.concat(resultsWithType);
                } else {
                    if (data.results && data.results.length > 0) {
                        const resultsWithType = data.results.map(r => ({
                            ...r,
                            rankType: rankType
                        }));
                        console.log(`部分失败: ${rankType}`, { resultsCount: resultsWithType.length, error: data.error });
                        allResults = allResults.concat(resultsWithType);
                        showResendMessage(`榜单类型 ${rankType} 部分失败：${data.error || '请检查日志'}`, 'error');
                    } else {
                        const errorMsg = data.error || `榜单类型 ${rankType} 补发失败`;
                        console.error(errorMsg, { data });
                        throw new Error(errorMsg);
                    }
                }
            } catch (error) {
                console.error(`请求异常: ${rankType}`, error);
                throw error;
            }
        }

        // 按榜单类型分组结果
        const resultsByRankType = {};
        allResults.forEach(r => {
            const rt = r.rankType || 'unknown';
            if (!resultsByRankType[rt]) {
                resultsByRankType[rt] = [];
            }
            resultsByRankType[rt].push(r);
        });

        // 显示补发结果
        console.log('最终结果汇总', { 
            totalResults: allResults.length,
            resultsByRankType: Object.keys(resultsByRankType),
            allResults 
        });
        
        if (allResults.length > 0) {
            displayResendResults(allResults, resultsByRankType);
            const successCount = allResults.filter(r => r.success).length;
            showResendMessage(`补发完成，共处理 ${allResults.length} 条，成功 ${successCount} 条`, 'success');
        } else {
            console.error('没有成功发送任何补发请求', { 
                rankTypesToSend,
                allResults,
                resultsByRankType 
            });
            showResendMessage('没有成功发送任何补发请求', 'error');
        }
    } catch (error) {
        console.error('补发失败:', error);
        showResendMessage('补发失败: ' + error.message, 'error');
    } finally {
        elements.resendBtn.disabled = false;
        elements.resendBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>发送补发</span>
        `;
    }
}

// 一键补发所有榜单类型
async function handleResendAll() {
    const url = elements.resendUrl.value.trim();
    const useBatch = elements.useBatchSend ? elements.useBatchSend.checked : true;
    const group = elements.resendGroup ? elements.resendGroup.value : 'users';
    const timestamp = elements.resendTimestamp.value.trim();
    const sign = elements.resendSign.value.trim();

    if (!url) {
        showResendMessage('请填写补发接口URL', 'error');
        return;
    }

    // 如果选择了"使用拉取的漏发名单"，需要根据当前iid过滤数据
    if (elements.dataSourceFetched && elements.dataSourceFetched.checked) {
        const allFetchedData = missingListState.currentData.length > 0 
            ? missingListState.currentData 
            : (missingListState.filteredData.length > 0 ? missingListState.filteredData : []);
        
        // 过滤出当前iid的数据
        const iidFilteredData = allFetchedData.filter(item => item.iid === missingListState.currentResendIid);
        
        // 更新uploadedPlayers
        missingListState.uploadedPlayers = iidFilteredData.map(item => ({
            psid: item.psid,
            rank: item.rank,
            score: item.score,
            clubid: item.clubid || null,
            iid: item.iid,
            is_club_rank: item.is_club_rank,
            rank_type: item.type === 'daily' ? 'daily' : (item.type === 'total' ? 'total' : null)
        }));
    }
    
    if (missingListState.uploadedPlayers.length === 0) {
        showResendMessage('没有可用的漏发名单数据，请先拉取数据或上传Excel', 'error');
        return;
    }

    // 所有榜单类型
    const allRankTypes = [
        'daily_person',
        'total_person',
        'daily_club',
        'total_club',
        'daily_person_super',
        'total_person_super'
    ];

    try {
        if (elements.resendAllBtn) {
            elements.resendAllBtn.disabled = true;
            elements.resendAllBtn.innerHTML = '<span>准备发送...</span>';
        }

        // 榜单类型名称映射
        const rankTypeNames = {
            'daily_person': '个人日榜',
            'total_person': '个人总榜',
            'daily_club': '公会日榜',
            'total_club': '公会总榜',
            'daily_person_super': '个人日榜超级奖',
            'total_person_super': '个人总榜超级奖'
        };

        let allResults = [];
        let successCount = 0;
        let failCount = 0;
        const totalRankTypes = allRankTypes.length;
        
        // 按顺序遍历所有榜单类型，逐个发送
        for (let i = 0; i < allRankTypes.length; i++) {
            const rankType = allRankTypes[i];
            const rankTypeName = rankTypeNames[rankType] || rankType;
            
            // 更新按钮状态，显示当前发送的榜单类型
            if (elements.resendAllBtn) {
                elements.resendAllBtn.innerHTML = `<span>发送中 (${i + 1}/${totalRankTypes}): ${rankTypeName}</span>`;
            }
            
            // 从iid配置中读取标题、内容和奖励配置
            const iidConfig = missingListState.iidConfigs[missingListState.currentResendIid];
            if (!iidConfig || !iidConfig.rankConfigs || !iidConfig.rankConfigs[rankType]) {
                console.log(`跳过未配置的榜单类型: ${rankType}`);
                continue; // 跳过未配置的榜单类型
            }
            
            const rankConfig = iidConfig.rankConfigs[rankType];
            const title = rankConfig.title || '';
            const content = rankConfig.content || '';
            const rewardConfig = rankConfig.reward || {};
            
            // 验证配置
            if (!title || !content || Object.keys(rewardConfig).length === 0) {
                console.log(`跳过配置不完整的榜单类型: ${rankType}`);
                continue; // 跳过配置不完整的榜单类型
            }

            // 按榜单类型过滤玩家
            let playersToSend = filterPlayersByRankType(missingListState.uploadedPlayers, rankType);

            // 超级奖限制（排名+积分）
            if (rankType === 'daily_person_super' || rankType === 'total_person_super') {
                const limit = iidConfig.superLimits?.[rankType];
                if (limit) {
                    const maxRank = Number(limit.max_rank || 0);
                    const minScore = Number(limit.min_score || 0);
                    playersToSend = playersToSend.filter(p => {
                        const rankOk = maxRank <= 0 || (p.rank > 0 && p.rank <= maxRank);
                        const scoreOk = minScore <= 0 || (p.score > 0 && p.score >= minScore);
                        return rankOk && scoreOk;
                    });
                }
            }

            if (playersToSend.length === 0) {
                console.log(`跳过没有玩家的榜单类型: ${rankType}`);
                continue; // 跳过没有玩家的榜单类型
            }

            // 显示当前发送的榜单信息
            showResendMessage(`正在发送 ${rankTypeName} (${playersToSend.length} 人)...`, 'info');

            try {
                // 发送补发请求（按顺序，等待每个请求完成）
                const response = await fetch('/api/missinglist/resend', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: url,
                        rank_type: rankType,
                        use_batch: useBatch,
                        group: group,
                        timestamp: timestamp,
                        sign: sign,
                        title: title,
                        content: content,
                        reward_config: rewardConfig,
                        players: playersToSend
                    })
                });

                const data = await response.json();
                
                // 在请求之间添加延迟，避免连接复用问题
                // 给服务器足够的处理时间，确保连接状态正确
                // 总榜数据量大，需要更长的处理时间
                if (i < allRankTypes.length - 1) {
                    const delay = (rankType === 'total_person' || rankType === 'total_club') ? 1000 : 500;
                    await new Promise(resolve => setTimeout(resolve, delay)); // 总榜延迟1秒，其他500ms
                }

                if (!response.ok) {
                    // 请求失败，记录错误但继续发送其他榜单
                    const errorMsg = data.error || `榜单类型 ${rankType} 补发失败`;
                    console.error(`${rankTypeName} 发送失败:`, errorMsg);
                    showResendMessage(`${rankTypeName} 发送失败: ${errorMsg}`, 'error');
                    failCount++;
                    
                    // 为所有玩家添加失败结果
                    playersToSend.forEach(player => {
                        allResults.push({
                            psid: player.psid,
                            rank: player.rank,
                            success: false,
                            message: errorMsg,
                            rankType: rankType
                        });
                    });
                    continue; // 继续发送下一个榜单
                }

                if (data.success) {
                    // 为每个结果添加榜单类型信息
                    const resultsWithType = (data.results || []).map(r => ({
                        ...r,
                        rankType: rankType
                    }));
                    allResults = allResults.concat(resultsWithType);
                    successCount++;
                    showResendMessage(`${rankTypeName} 发送成功 (${playersToSend.length} 人)`, 'success');
                } else {
                    // 部分成功或失败
                    if (data.results && data.results.length > 0) {
                        const resultsWithType = data.results.map(r => ({
                            ...r,
                            rankType: rankType
                        }));
                        allResults = allResults.concat(resultsWithType);
                        const successInBatch = resultsWithType.filter(r => r.success).length;
                        const failInBatch = resultsWithType.filter(r => !r.success).length;
                        if (failInBatch > 0) {
                            showResendMessage(`${rankTypeName} 部分失败: 成功 ${successInBatch} 人，失败 ${failInBatch} 人`, 'error');
                            failCount++;
                        } else {
                            successCount++;
                            showResendMessage(`${rankTypeName} 发送成功 (${playersToSend.length} 人)`, 'success');
                        }
                    } else {
                        const errorMsg = data.error || `榜单类型 ${rankType} 补发失败`;
                        console.error(`${rankTypeName} 发送失败:`, errorMsg);
                        showResendMessage(`${rankTypeName} 发送失败: ${errorMsg}`, 'error');
                        failCount++;
                        
                        // 为所有玩家添加失败结果
                        playersToSend.forEach(player => {
                            allResults.push({
                                psid: player.psid,
                                rank: player.rank,
                                success: false,
                                message: errorMsg,
                                rankType: rankType
                            });
                        });
                    }
                }
            } catch (error) {
                // 网络错误或其他异常，记录错误但继续发送其他榜单
                console.error(`${rankTypeName} 发送异常:`, error);
                showResendMessage(`${rankTypeName} 发送异常: ${error.message}`, 'error');
                failCount++;
                
                // 为所有玩家添加失败结果
                playersToSend.forEach(player => {
                    allResults.push({
                        psid: player.psid,
                        rank: player.rank,
                        success: false,
                        message: `发送异常: ${error.message}`,
                        rankType: rankType
                    });
                });
                // 继续发送下一个榜单，不中断整个流程
                continue;
            }
        }

        // 更新按钮状态
        if (elements.resendAllBtn) {
            elements.resendAllBtn.disabled = false;
            elements.resendAllBtn.innerHTML = '<span>一键补发所有榜单类型</span>';
        }
        
        // 显示最终结果摘要
        const totalSent = allResults.length;
        const totalSuccess = allResults.filter(r => r.success).length;
        const totalFail = allResults.filter(r => !r.success).length;
        
        // 按榜单类型分组结果
        const resultsByRankType = {};
        allResults.forEach(r => {
            const rt = r.rankType || 'unknown';
            if (!resultsByRankType[rt]) {
                resultsByRankType[rt] = [];
            }
            resultsByRankType[rt].push(r);
        });

        // 显示补发结果
        if (allResults.length > 0) {
            displayResendResults(allResults, resultsByRankType);
            if (totalFail === 0) {
                showResendMessage(`所有榜单发送完成！共发送 ${totalSent} 人，成功 ${totalSuccess} 人`, 'success');
            } else {
                showResendMessage(`所有榜单发送完成！共发送 ${totalSent} 人，成功 ${totalSuccess} 人，失败 ${totalFail} 人`, 'error');
            }
        } else {
            showResendMessage('没有可发送的数据', 'info');
        }
    } catch (error) {
        console.error('补发失败:', error);
        showResendMessage('补发失败: ' + error.message, 'error');
        if (elements.resendAllBtn) {
            elements.resendAllBtn.disabled = false;
            elements.resendAllBtn.innerHTML = '<span>一键补发所有榜单类型</span>';
        }
    }
}

function filterPlayersByRankType(players, rankType) {
    if (!players || players.length === 0) return [];
    const hasMeta = players.some(p => p.rank_type || p.is_club_rank !== null);
    if (!hasMeta) {
        return players;
    }

    const isClub = rankType === 'daily_club' || rankType === 'total_club';
    const isDaily = rankType === 'daily_person' || rankType === 'daily_club' || rankType === 'daily_person_super';
    const isTotal = rankType === 'total_person' || rankType === 'total_club' || rankType === 'total_person_super';

    return players.filter(p => {
        if (p.is_club_rank !== null && p.is_club_rank !== isClub) {
            return false;
        }
        if (isDaily && p.rank_type && p.rank_type !== 'daily') {
            return false;
        }
        if (isTotal && p.rank_type && p.rank_type !== 'total') {
            return false;
        }
        return true;
    });
}

// 更新奖励明细显示
function updateRewardDetail() {
    if (!elements.rewardDetailSection || !elements.rewardDetailContainer) return;
    
    const selectedRanks = Array.from(elements.rankCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => ({
            value: cb.value,
            name: cb.getAttribute('data-rank-name') || cb.value
        }));
    
    if (selectedRanks.length === 0) {
        elements.rewardDetailSection.style.display = 'none';
        return;
    }
    
    elements.rewardDetailSection.style.display = 'block';
    
    let html = '';
    
    selectedRanks.forEach(rank => {
        const config = missingListState.rankConfigs[rank.value];
        if (!config || !config.reward || Object.keys(config.reward).length === 0) {
            html += `
                <div class="reward-detail-item">
                    <h4>${rank.name}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.85em;">暂无奖励配置</p>
                </div>
            `;
            return;
        }
        
        // 渲染奖励表格
        const rewardTable = renderRewardTable(config.reward);
        html += `
            <div class="reward-detail-item">
                <h4>${rank.name}</h4>
                <div class="reward-table-container">
                    ${rewardTable}
                </div>
            </div>
        `;
    });
    
    elements.rewardDetailContainer.innerHTML = html;
}

// 道具名称映射（从后端加载）
let itemNameMap = {};

// 加载道具名称映射
async function loadItemMap() {
    try {
        const response = await fetch('/api/missinglist/item-map');
        const data = await response.json();
        if (data.success && data.item_map) {
            itemNameMap = data.item_map;
            // 如果奖励表格已存在，重新渲染以显示道具名称
            if (document.querySelector('.reward-table[data-rank]')) {
                renderRewardTables();
            }
        }
    } catch (error) {
        console.error('加载道具映射失败:', error);
    }
    return Promise.resolve();
}

// 获取道具名称（如果找不到则返回ID）
function getItemName(itemId) {
    return itemNameMap[itemId] || itemId;
}

// 渲染奖励表格
function renderRewardTable(rewardConfig) {
    if (!rewardConfig || typeof rewardConfig !== 'object' || Object.keys(rewardConfig).length === 0) {
        return '<div style="padding: 20px; text-align: center; color: #6b7280; font-size: 13px;">暂无奖励配置</div>';
    }
    
    const rankLimits = Object.keys(rewardConfig).sort((a, b) => Number(a) - Number(b));
    
    let html = `
        <table class="reward-table">
            <thead>
                <tr>
                    <th>排名上限</th>
                    <th>奖励道具</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    rankLimits.forEach(limit => {
        const items = rewardConfig[limit];
        if (!items || typeof items !== 'object') {
            return;
        }
        
        const itemsHtml = Object.entries(items)
            .map(([id, count]) => {
                // 如果items是包含name的对象，使用name；否则使用ID
                let itemName = id;
                let itemCount = count;
                
                if (typeof count === 'object' && count !== null) {
                    // 新格式：{"id": "道具ID", "name": "道具名称", "count": 数量}
                    if (count.name) {
                        itemName = count.name;
                    }
                    if (count.count !== undefined) {
                        itemCount = count.count;
                    }
                } else {
                    // 旧格式：直接是数量，使用映射获取名称
                    itemName = getItemName(id);
                }
                
                return `<div class="reward-items">${itemName}: ${itemCount}</div>`;
            })
            .join('');
        
        html += `
            <tr>
                <td>${limit}</td>
                <td>
                    ${itemsHtml}
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    return html;
}

// 显示补发结果（按榜单分组）
function displayResendResults(results, rankTypeMap = {}) {
    if (!elements.resendResult || !elements.resultSection) return;

    // 如果没有rankTypeMap，尝试从结果中提取
    if (Object.keys(rankTypeMap).length === 0) {
        // 按结果分组（如果有rankType字段）
        const grouped = {};
        results.forEach(r => {
            const rankType = r.rankType || 'unknown';
            if (!grouped[rankType]) {
                grouped[rankType] = [];
            }
            grouped[rankType].push(r);
        });
        rankTypeMap = grouped;
    }

    const totalSuccess = results.filter(r => r.success).length;
    const totalFail = results.length - totalSuccess;

    let html = `
        <div style="margin-bottom: 20px; padding: 16px; background: var(--bg-main); border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="display: flex; gap: 24px; align-items: center;">
                <div>
                    <span style="color: var(--text-secondary);">总计:</span>
                    <strong style="color: var(--text-primary); font-size: 1.1em;">${results.length}</strong>
                </div>
                <div>
                    <span style="color: var(--text-secondary);">成功:</span>
                    <strong style="color: var(--success-color); font-size: 1.1em;">${totalSuccess}</strong>
                </div>
                <div>
                    <span style="color: var(--text-secondary);">失败:</span>
                    <strong style="color: var(--error-color); font-size: 1.1em;">${totalFail}</strong>
                </div>
            </div>
        </div>
    `;

    // 按榜单类型分组显示
    const rankTypeNames = {
        'daily_person': '个人日榜',
        'total_person': '个人总榜',
        'daily_person_super': '个人日榜超级奖',
        'total_person_super': '个人总榜超级奖',
        'daily_club': '公会日榜',
        'total_club': '公会总榜'
    };

    Object.entries(rankTypeMap).forEach(([rankType, rankResults]) => {
        const rankName = rankTypeNames[rankType] || rankType;
        const isSuper = rankType.includes('super');
        const successCount = rankResults.filter(r => r.success).length;
        const failCount = rankResults.length - successCount;
        
        const tableClass = isSuper ? 'resend-result-table super-rank-table' : 'resend-result-table';
        
        html += `
            <div class="resend-result-group">
                <div class="resend-result-group-header">
                    <div class="resend-result-group-title">${rankName}</div>
                    <div class="resend-result-group-stats">
                        <span>总计: <strong>${rankResults.length}</strong></span>
                        <span>成功: <strong class="success-count">${successCount}</strong></span>
                        <span>失败: <strong class="fail-count">${failCount}</strong></span>
                    </div>
                </div>
                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                    <table class="${tableClass}">
                        <thead>
                            <tr>
                                <th>状态</th>
                                <th>PSID</th>
                                <th>排名</th>
                                <th>积分</th>
                                <th>消息</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        rankResults.forEach(result => {
            const statusIcon = result.success 
                ? '<span class="status-icon success">✓</span>' 
                : '<span class="status-icon fail">✗</span>';
            
            // 从原始玩家数据中获取score
            const player = missingListState.uploadedPlayers.find(p => p.psid === result.psid);
            const score = player ? (player.score || '-') : '-';
            
            html += `
                <tr>
                    <td>${statusIcon}</td>
                    <td>${result.psid}</td>
                    <td>${result.rank}</td>
                    <td>${score}</td>
                    <td style="color: ${result.success ? 'var(--text-secondary)' : 'var(--error-color)'};">
                        ${result.message || (result.success ? '补发成功' : '补发失败')}
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });

    elements.resendResult.innerHTML = html;
    elements.resultSection.style.display = 'block';
}

// 显示补发提示信息
function showResendMessage(message, type = 'info') {
    const messageArea = elements.resendMessageArea;
    if (!messageArea) return;
    
    messageArea.textContent = message;
    messageArea.className = `message-area message-${type}`;
    messageArea.style.display = 'block';

    const timeout = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        messageArea.style.display = 'none';
    }, timeout);
}

// 拉取数据
async function handleFetch() {
    const baseUrl = elements.baseUrl.value.trim();
    const timestamp = elements.timestamp.value.trim();
    const sign = elements.sign.value.trim();
    const iid = elements.iid.value.trim();

    if (!baseUrl || !timestamp || !sign || !iid) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }

    try {
        elements.fetchBtn.disabled = true;
        elements.fetchBtn.innerHTML = '<span>拉取中...</span>';

        const response = await fetch('/api/missinglist/fetch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                base_url: baseUrl,
                timestamp: timestamp,
                sign: sign,
                iid: iid
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '拉取失败');
        }

        if (data.success) {
            missingListState.allData = data.data || [];
            missingListState.filteredData = [...missingListState.allData];
            missingListState.currentData = [...missingListState.filteredData];

            // 显示筛选区域和数据区域
            elements.filterSection.style.display = 'block';
            elements.dataSection.style.display = 'block';
            
            // 更新补发页签的漏发名单显示
            updateResendMissingList();

            // 渲染数据
            renderData();

            // 如果当前选择的是"使用拉取的漏发名单"，自动更新uploadedPlayers
            if (elements.dataSourceFetched && elements.dataSourceFetched.checked) {
                autoUseFetchedData();
            }
            
            // 更新拉取数据信息（如果奖励补发页签已打开）
            updateFetchedDataInfo();

            // 显示成功提示
            showMessage(`成功拉取 ${data.count} 条数据`, 'success');
        } else {
            throw new Error('拉取失败');
        }
    } catch (error) {
        console.error('拉取数据失败:', error);
        showMessage('拉取数据失败: ' + error.message, 'error');
    } finally {
        elements.fetchBtn.disabled = false;
        elements.fetchBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>拉取数据</span>
        `;
    }
}

// 筛选数据
async function handleFilter() {
    const hid = parseInt(elements.filterHid.value) || 0;
    const iid = elements.filterIid.value.trim();
    const on = parseInt(elements.filterOn.value) || 0;
    const rankTypeValue = elements.filterRankType.value;
    const isClubRank = rankTypeValue === '' ? null : rankTypeValue === 'true';
    const rankCategory = elements.filterRankCategory.value.trim();

    try {
        const response = await fetch('/api/missinglist/filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: missingListState.allData,
                hid: hid,
                iid: iid,
                on: on,
                is_club_rank: isClubRank,
                rank_type: rankCategory
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '筛选失败');
        }

        if (data.success) {
            missingListState.filteredData = data.data || [];
            missingListState.currentData = [...missingListState.filteredData];
            renderData();
            
            // 如果当前选择的是"使用拉取的漏发名单"，自动更新uploadedPlayers
            if (elements.dataSourceFetched && elements.dataSourceFetched.checked) {
                autoUseFetchedData();
            }
            
            // 更新拉取数据信息
            updateFetchedDataInfo();
        } else {
            throw new Error('筛选失败');
        }
    } catch (error) {
        console.error('筛选数据失败:', error);
        alert('筛选数据失败: ' + error.message);
    }
}

// 重置筛选
function handleResetFilter() {
    elements.filterHid.value = '';
    elements.filterIid.value = '';
    elements.filterOn.value = '';
    elements.filterRankType.value = '';
    elements.filterRankCategory.value = '';

    missingListState.filteredData = [...missingListState.allData];
    missingListState.currentData = [...missingListState.filteredData];
    renderData();
    
    // 如果当前选择的是"使用拉取的漏发名单"，自动更新uploadedPlayers
    if (elements.dataSourceFetched && elements.dataSourceFetched.checked) {
        autoUseFetchedData();
    }
    
    updateFetchedDataInfo();
}

// 渲染数据表格
function renderData() {
    const data = missingListState.currentData;

    if (data.length === 0) {
        elements.dataTableBody.innerHTML = `
            <tr>
                <td colspan="13" class="empty-state">
                    <div>
                        <h3>暂无数据</h3>
                        <p>请先拉取数据或调整筛选条件</p>
                    </div>
                </td>
            </tr>
        `;
        elements.dataCount.textContent = '0 条';
        return;
    }

    elements.dataTableBody.innerHTML = data.map(item => {
        return `
            <tr>
                <td>${item.hid || '-'}</td>
                <td>${item.iid || '-'}</td>
                <td>${item.on || '-'}</td>
                <td>${item.datetime || '-'}</td>
                <td>${item.is_club_rank ? '公会榜' : '个人榜'}</td>
                <td>${item.day || '-'}</td>
                <td>${item.psid || '-'}</td>
                <td>${item.score || '-'}</td>
                <td>${item.rank || '-'}</td>
                <td>${item.server_id || '-'}</td>
                <td>${item.type || '-'}</td>
                <td>${item.clubid || '-'}</td>
                <td>${item.clubscore || '-'}</td>
            </tr>
        `;
    }).join('');

    elements.dataCount.textContent = `${data.length} 条`;
}

// 导出数据
function handleExport() {
    const data = missingListState.currentData;

    if (data.length === 0) {
        alert('没有数据可导出');
        return;
    }

    // 转换为CSV格式
    const headers = ['HID', 'IID', 'ON', '日期时间', '榜单类型', 'Day', 'PSID', 'Score', 'Rank', 'Server ID', 'Type', 'Club ID', 'Club Score'];
    const rows = data.map(item => [
        item.hid || '',
        item.iid || '',
        item.on || '',
        item.datetime || '',
        item.is_club_rank ? '公会榜' : '个人榜',
        item.day || '',
        item.psid || '',
        item.score || '',
        item.rank || '',
        item.server_id || '',
        item.type || '',
        item.clubid || '',
        item.clubscore || ''
    ]);

    // 生成CSV内容
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // 添加BOM以支持中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `漏发名单_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 显示提示信息
function showMessage(message, type = 'info') {
    const messageArea = elements.messageArea;
    if (!messageArea) return;
    
    messageArea.textContent = message;
    messageArea.className = `message-area message-${type}`;
    messageArea.style.display = 'block';

    const timeout = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        messageArea.style.display = 'none';
    }, timeout);
}
