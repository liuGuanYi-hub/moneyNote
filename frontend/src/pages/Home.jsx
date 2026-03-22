import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../services/api';
import { formatDate, formatAmount } from '../utils/format';
import confetti from 'canvas-confetti';

const Home = ({ categories, refreshSignal, currentDate, onDateChange, onRecordClick, onRecordDeleted }) => {
    const [stats, setStats] = useState({ totalExpense: 0, totalIncome: 0, balance: 0 });
    const [records, setRecords] = useState([]);
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

            const [rawRecords, monthlyStats] = await Promise.all([
                apiFetch(`/records?startDate=${startDate}&endDate=${endDate}`, { auth: true }),
                apiFetch(`/statistics/monthly-overview?year=${year}&month=${month}`, { auth: true })
            ]);

            setRecords(rawRecords || []);
            setStats(monthlyStats || { totalExpense: 0, totalIncome: 0, balance: 0 });
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
                alert('删除成功');
                if (onRecordDeleted) onRecordDeleted();
            } catch (e) { alert('删除失败: ' + e.message); }
        } else {
            if (onRecordClick) onRecordClick(record);
        }
    };

    const aiRecord = async () => {
        const text = prompt("🤖 AI 记账助手已就绪\n\n请输入你的消费（支持口语化）：\n例如：今天打车去公司花了 35 元", "昨天买了两杯瑞幸咖啡，一共 38 块");
        if (!text) return;

        try {
            // Simple visual loading overlay
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
                alert("✨ 太聪明了！AI 已帮你自动记账！");
                if (onRecordDeleted) onRecordDeleted(); // reuse trigger
            }
        } catch (e) {
            alert("AI 大脑开小差了: " + e.message);
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
        onDateChange(new Date(pickerYear, m - 1, 1));
        setShowMonthPicker(false);
    };

    return (
        <div id="page-home" className="page" style={{ display: 'block' }}>
            <div className="home-header">
                <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                    <button
                        onClick={aiRecord}
                        style={{ background: 'var(--white)', border: 'none', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', color: '#333', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}
                    >
                        <i className="fas fa-robot" style={{ color: '#2196F3', marginRight: '5px', fontSize: '16px' }}></i>AI 语音/文字快记
                    </button>
                </div>

                <div className="overview-card" style={{ alignItems: 'center', marginBottom: '20px' }}>
                    <div className="month-select" onClick={() => { setPickerYear(year); setShowMonthPicker(true); }}>
                        <span>{year}年{month}月</span>
                        <i className="fas fa-caret-down" style={{ fontSize: '16px', marginLeft: '8px' }}></i>
                    </div>
                    <div style={{ fontSize: '14px', color: '#333' }}>本月结余 <b style={{ fontSize: '18px' }}>{parseFloat(stats.balance || 0).toFixed(2)}</b></div>
                </div>
                <div className="overview-card">
                    <div style={{ background: 'rgba(255,255,255,0.3)', padding: '10px', borderRadius: '8px', flex: 1, marginRight: '10px' }}>
                        <div style={{ fontSize: '12px' }}>本月支出</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>¥ {parseFloat(stats.totalExpense || 0).toFixed(2)}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.3)', padding: '10px', borderRadius: '8px', flex: 1 }}>
                        <div style={{ fontSize: '12px' }}>本月收入</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>¥ {parseFloat(stats.totalIncome || 0).toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div className="record-list">
                {loading && records.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '14px' }}><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>正在拉取...</div>
                ) : groupedRecords.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <i className="fas fa-box-open" style={{ fontSize: '50px', color: '#E0E0E0', marginBottom: '15px' }}></i>
                        <div style={{ color: '#666', fontSize: '16px', fontWeight: 'bold' }}>{year}年{month}月 暂无记账记录</div>
                    </div>
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
                                                <div style={{ fontSize: '12px', color: '#999' }}>{record.remark || '无备注'}</div>
                                            </div>
                                            <div className="record-amount" style={{ color: record.type === 'expense' ? '#333' : '#4CAF50' }}>{formatAmount(record.amount, record.type)}</div>
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
