import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { formatDate, formatAmount } from '../utils/format';
import { useCategoryStore } from '../stores/categoryStore';
import { useAppStore } from '../stores/appStore';
import { toast } from '../stores/toastStore';
import { SkeletonRecordRow } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import confetti from 'canvas-confetti';

const Home = () => {
    const categories = useCategoryStore(s => ({ expense: s.expense, income: s.income }));
    const refreshSignal = useAppStore(s => s.refreshSignal);
    const currentDate = useAppStore(s => s.currentDate);
    const setCurrentDate = useAppStore(s => s.setCurrentDate);
    const triggerRefresh = useAppStore(s => s.triggerRefresh);
    const navigate = useNavigate();

    const [stats, setStats] = useState({ totalExpense: 0, totalIncome: 0, balance: 0 });
    const [records, setRecords] = useState([]);
    const [budgetProgress, setBudgetProgress] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const categoryMap = useMemo(() => {
        const map = {};
        [...categories.expense, ...categories.income].forEach(cat => {
            map[cat.id] = cat;
        });
        return map;
    }, [categories]);

    useEffect(() => {
        loadData();
    }, [year, month, refreshSignal]);

    const loadData = async () => {
        setLoading(true);
        try {
            const monthStr = String(month).padStart(2, '0');
            const lastDay = new Date(year, month, 0).getDate();
            const startDate = `${year}-${monthStr}-01`;
            const endDate = `${year}-${monthStr}-${lastDay}`;

            const monthLabel = `${year}-${monthStr}`;
            const [rawRecords, monthlyStats, budgetData] = await Promise.all([
                apiFetch(`/records?startDate=${startDate}&endDate=${endDate}`, { auth: true }),
                apiFetch(`/statistics/monthly-overview?year=${year}&month=${month}`, { auth: true }),
                apiFetch(`/budgets/progress?month=${monthLabel}`, { auth: true })
            ]);

            setRecords(rawRecords || []);
            setStats(monthlyStats || { totalExpense: 0, totalIncome: 0, balance: 0 });
            setBudgetProgress(budgetData || []);
        } catch (e) {
            console.error('Failed to load home data', e);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordClick = async (record) => {
        const action = confirm('选择操作：\n确定 = 删除记录\n取消 = 编辑记录') ? 'delete' : 'edit';
        if (action === 'delete') {
            if (!confirm('确定要删除这条记录吗？删除后可在回收站恢复。')) return;
            try {
                await apiFetch(`/records/${record.id}`, { method: 'DELETE', auth: true });
                toast.success('已删除，可在回收站恢复');
                triggerRefresh();
            } catch (e) { toast.error('删除失败: ' + e.message); }
        } else {
            useAppStore.getState().setEditingRecord(record);
            navigate('/edit-record/' + record.id);
        }
    };

    const aiRecord = async () => {
        const text = prompt("🤖 AI 记账助手已就绪\n\n请输入你的消费（支持口语化）：\n例如：今天打车去公司花了 35 元", "昨天买了两杯瑞幸咖啡，一共 38 块");
        if (!text) return;

        try {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.innerHTML = '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:white;padding:20px;border-radius:10px;z-index:9999;"><i class="fas fa-spinner fa-spin"></i> AI 正在思考中...</div>';
            document.body.appendChild(loadingOverlay);

            const aiData = await apiFetch('/ai/parse', { method: 'POST', body: { text: text }, auth: true });
            document.body.removeChild(loadingOverlay);

            const confirmText = `💡 AI 识别结果：\n\n💰 金额：¥${aiData.amount}\n📂 分类：${aiData.category}\n📝 备注：${aiData.remark}\n\n✅ 准确无误，立即入账？`;

            if (confirm(confirmText)) {
                const targetCat = Object.values(categoryMap).find(c => c.name.includes(aiData.category) || aiData.category.includes(c.name)) || Object.values(categoryMap)[0];

                const record = {
                    categoryId: targetCat.id,
                    amount: parseFloat(aiData.amount),
                    type: aiData.type || 'expense',
                    remark: aiData.remark + " 🤖",
                    recordDate: new Date().toISOString().split('T')[0]
                };

                await apiFetch('/records', { method: 'POST', body: record, auth: true });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                triggerRefresh();
            }
        } catch (e) {
            toast.error("AI 大脑开小差了: " + e.message);
            const overlay = document.querySelector('div[style*="z-index: 9999"]');
            if (overlay) overlay.remove();
        }
    };

    const groupedRecords = useMemo(() => {
        const grouped = {};
        records.forEach(record => {
            const dateKey = record.recordDate;
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(record);
        });
        return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    }, [records]);

    const handleSelectMonth = (m) => {
        setCurrentDate(new Date(pickerYear, m - 1, 1));
        setShowMonthPicker(false);
    };

    return (
        <div id="page-home" className="page" style={{ display: 'block' }}>
            <div className="home-header">
                <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                    <button
                        onClick={aiRecord}
                        style={{ background: 'var(--white)', border: 'none', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', color: 'var(--text-main)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}
                    >
                        <i className="fas fa-robot" style={{ color: '#2196F3', marginRight: '5px', fontSize: '16px' }}></i>AI 语音/文字快记
                    </button>
                </div>

                <div className="overview-card" style={{ alignItems: 'center', marginBottom: '20px' }}>
                    <div className="month-select" onClick={() => { setPickerYear(year); setShowMonthPicker(true); }}>
                        <span>{year}年{month}月</span>
                        <i className="fas fa-caret-down" style={{ fontSize: '16px', marginLeft: '8px' }}></i>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>本月结余 <b style={{ fontSize: '18px' }}>{parseFloat(stats.balance || 0).toFixed(2)}</b></div>
                </div>
                <div className="overview-card">
                    <div style={{ background: 'rgba(255,255,255,0.3)', padding: '10px', borderRadius: '8px', flex: 1, marginRight: '10px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-main)' }}>本月支出</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>¥ {parseFloat(stats.totalExpense || 0).toFixed(2)}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.3)', padding: '10px', borderRadius: '8px', flex: 1 }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-main)' }}>本月收入</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>¥ {parseFloat(stats.totalIncome || 0).toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Budget progress dashboard */}
            {budgetProgress.length > 0 && (
              <div className="budget-section">
                <div className="budget-header">
                  <span className="title">📊 本月预算</span>
                  <span className="action" onClick={() => navigate('/budgets')}>管理预算 <i className="fas fa-chevron-right" style={{ fontSize: 10 }}></i></span>
                </div>
                {(() => {
                  const totalBudget = budgetProgress.reduce((s, b) => s + parseFloat(b.budgetAmount || 0), 0);
                  const totalSpent = budgetProgress.reduce((s, b) => s + parseFloat(b.spent || 0), 0);
                  const pct = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;
                  const isOver = totalSpent > totalBudget;
                  return (
                    <>
                      <div className="budget-progress-bg">
                        <div className={`budget-progress-bar ${isOver ? 'over-budget' : ''}`} style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="budget-progress-text">
                        <span>{isOver ? `超支 ¥${(totalSpent - totalBudget).toFixed(0)}` : `剩余 ¥${(totalBudget - totalSpent).toFixed(0)}`}</span>
                        <span>{pct.toFixed(0)}%</span>
                      </div>
                    </>
                  );
                })()}
                {/* Top overspent categories */}
                {budgetProgress.filter(b => b.percentage > 80).slice(0, 3).map(b => {
                  const cat = categories.expense.find(c => c.id === b.categoryId);
                  return (
                    <div key={b.categoryId} style={{ display: 'flex', alignItems: 'center', marginTop: 10, fontSize: 13 }}>
                      <i className={`fas ${cat?.icon || 'fa-circle'}`} style={{ color: b.percentage > 100 ? 'var(--danger-color)' : 'var(--warning-color)', marginRight: 8, width: 16 }}></i>
                      <span style={{ flex: 1, color: 'var(--text-main)' }}>{cat?.name || '未知'}</span>
                      <span style={{ color: b.percentage > 100 ? 'var(--danger-color)' : 'var(--text-sub)', fontWeight: 500 }}>
                        {b.percentage.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="record-list">
                {loading && records.length === 0 ? (
                    <div style={{ padding: '0 15px' }}>
                        {[...Array(5)].map((_, i) => <SkeletonRecordRow key={i} />)}
                    </div>
                ) : groupedRecords.length === 0 ? (
                    <EmptyState
                        icon="fa-box-open"
                        title={`${year}年${month}月 暂无记账记录`}
                        description="点击下方 + 号记下第一笔吧"
                    />
                ) : (
                    groupedRecords.map(([date, dayRecords]) => {
                        const dayTotal = dayRecords.reduce((sum, r) => sum + (r.type === 'expense' ? parseFloat(r.amount) : 0), 0);
                        return (
                            <div key={date}>
                                <div className="day-header">
                                    <span>{formatDate(date)}</span>
                                    <span>支 {dayTotal.toFixed(2)}</span>
                                </div>
                                {dayRecords.map(record => {
                                    const cat = categoryMap[record.categoryId] || { icon: 'fa-circle', name: '未知' };
                                    return (
                                        <div key={record.id} className="record-item" onClick={() => handleRecordClick(record)}>
                                            <div className="cat-icon"><i className={`fas ${cat.icon}`}></i></div>
                                            <div className="record-info">
                                                <div>{cat.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{record.remark || '无备注'}</div>
                                            </div>
                                            <div className="record-amount" style={{ color: record.type === 'expense' ? 'var(--text-main)' : 'var(--success-color)' }}>{formatAmount(record.amount, record.type)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                )}
            </div>

            {showMonthPicker && (
                <div id="month-picker-overlay" className="month-picker-overlay" onClick={() => setShowMonthPicker(false)}>
                    <div className="month-picker-body" onClick={e => e.stopPropagation()}>
                        <div className="year-control">
                            <div className="year-btn" onClick={() => setPickerYear(y => y - 1)}><i className="fas fa-chevron-left"></i></div>
                            <div>{pickerYear}年</div>
                            <div className="year-btn" onClick={() => setPickerYear(y => y + 1)}><i className="fas fa-chevron-right"></i></div>
                        </div>
                        <div className="year-grid">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                <div
                                    key={m}
                                    className={`month-item ${pickerYear === year && m === month ? 'active' : ''}`}
                                    onClick={() => handleSelectMonth(m)}
                                >
                                    {m}月
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
