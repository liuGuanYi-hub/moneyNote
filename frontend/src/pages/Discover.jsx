import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { apiFetch } from '../services/api';

const Discover = ({ categories, currentDate }) => {
    const [showAchievements, setShowAchievements] = useState(false);
    const [medalsData, setMedalsData] = useState({ unlockedCount: 0, medals: [] });
    const [loadingAchievements, setLoadingAchievements] = useState(false);

    const tips = ['记账要持之以恒！', '设置预算上限控制支出。', '定期查看图表优化消费。', '给支出添加备注。', '记录收入准确计算结余。'];
    const showRandomTip = () => alert(tips[Math.floor(Math.random() * tips.length)]);

    const handleBudgetSuggestion = async () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        let budget = localStorage.getItem('moneyNote_budget');
        if (!budget) {
            budget = prompt("💰 开启智能预算监控\n\n请输入你本月的预算金额（元）:", "3000");
            if (!budget || isNaN(budget)) return;
            localStorage.setItem('moneyNote_budget', budget);
        }

        try {
            const overview = await apiFetch(`/statistics/monthly-overview?year=${year}&month=${month}`, { auth: true });
            const totalExpense = parseFloat(overview.totalExpense || 0);
            const totalBudget = parseFloat(budget);
            const remain = totalBudget - totalExpense;
            const percent = Math.min(100, (totalExpense / totalBudget) * 100).toFixed(1);

            const today = new Date();
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const daysLeft = lastDay - today.getDate() + 1;

            const dailyLimit = remain > 0 ? (remain / daysLeft).toFixed(2) : 0;

            let tip = "🎉 完美！预算非常充裕，继续保持！";
            if (percent > 80 && percent <= 100) tip = "⚠️ 警报！预算快见底了，接下来的日子请勒紧裤腰带。";
            else if (percent > 100) tip = "破产了！本月已超支，剁手要谨慎啊！";

            const msg = `【${year}年${month}月 预算监控】\n\n` +
                `目标预算：¥${totalBudget}\n` +
                `已用支出：¥${totalExpense} (${percent}%)\n` +
                `剩余预算：¥${remain.toFixed(2)}\n\n` +
                `📅 本月还剩 ${daysLeft} 天\n` +
                `💡 建议每日最多消费：¥${dailyLimit}\n\n` + tip;

            if (confirm(msg + "\n\n(点击“确定”可重新设置预算)")) {
                const newBudget = prompt("🔄 重新设置本月预算（元）:", budget);
                if (newBudget && !isNaN(newBudget)) {
                    localStorage.setItem('moneyNote_budget', newBudget);
                    alert("预算已更新！");
                }
            }
        } catch (e) { alert('获取数据失败: ' + e.message); }
    };

    const loadAchievements = async () => {
        setLoadingAchievements(true);
        setShowAchievements(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const [allRecords, stats] = await Promise.all([
                apiFetch('/records', { auth: true }),
                apiFetch(`/statistics/monthly-overview?year=${year}&month=${month}`, { auth: true })
            ]);

            const categoryMap = {};
            [...categories.expense, ...categories.income].forEach(cat => { categoryMap[cat.id] = cat; });

            // Calculations
            let unlockedCount = 0;
            const medals = [];

            // 1. First record
            const count = allRecords.length;
            medals.push({ id: 'first', name: '初来乍到', desc: '记下第一笔账', current: count, target: 1, icon: 'fa-seedling' });

            // 2. Streaks
            const dates = [...new Set(allRecords.map(r => r.recordDate))].sort();
            let maxStreak = 0, currentStr = 0;
            dates.forEach((d, i) => {
                if (i > 0 && (new Date(d) - new Date(dates[i - 1])) / 86400000 === 1) currentStr++;
                else currentStr = 1;
                maxStreak = Math.max(maxStreak, currentStr);
            });
            medals.push({ id: 'streak', name: '持之以恒', desc: '连续记账 7 天', current: maxStreak, target: 7, icon: 'fa-fire' });
            medals.push({ id: 'pro', name: '理财达人', desc: '连续记账 30 天', current: maxStreak, target: 30, icon: 'fa-gem' });

            // 3. Single large expense
            let maxExp = 0;
            allRecords.forEach(r => { if (r.type === 'expense') maxExp = Math.max(maxExp, parseFloat(r.amount)); });
            medals.push({ id: 'rich', name: '土豪勋章', desc: '单笔支出 > 1000', current: Math.floor(maxExp), target: 1000, icon: 'fa-coins' });

            // 4. Early bird
            const early = allRecords.some(r => new Date(r.createdAt).getHours() < 6) ? 1 : 0;
            medals.push({ id: 'early', name: '早起鸟', desc: '早晨 6 点前记账', current: early, target: 1, icon: 'fa-dove' });

            // 5. Late night dining
            const night = allRecords.some(r => {
                const h = new Date(r.createdAt).getHours();
                const cat = categoryMap[r.categoryId]?.name || "";
                return h >= 22 && cat.match(/[餐饮食]/);
            }) ? 1 : 0;
            medals.push({ id: 'night', name: '深夜食堂', desc: '22点后记餐饮', current: night, target: 1, icon: 'fa-moon' });

            // 6. Savings rate
            const income = parseFloat(stats.totalIncome || 0);
            const balance = parseFloat(stats.balance || 0);
            const rate = income > 0 ? (balance / income) : 0;
            medals.push({ id: 'master', name: '精打细算', desc: '结余率 > 30%', current: rate, target: 0.3, isPercentage: true, icon: 'fa-crown' });

            medals.forEach(m => { if (m.current >= m.target) unlockedCount++; });
            setMedalsData({ unlockedCount, medals });

            if (unlockedCount > 0) {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#FFDA44', '#FFA000', '#4CAF50', '#2196F3'] });
            }
        } catch (e) {
            console.error('Failed to load achievements', e);
        } finally {
            setLoadingAchievements(false);
        }
    };

    if (showAchievements) {
        return (
            <div id="page-medals" className="page-fullscreen" style={{ background: '#F8F9FA', display: 'flex' }}>
                <div className="common-header">
                    <i className="fas fa-chevron-left back-btn" onClick={() => setShowAchievements(false)}></i>
                    <div className="header-title">成就勋章</div>
                    <div style={{ width: '25px' }}></div>
                </div>
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '25px', background: 'var(--white)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '14px', color: '#999' }}>已点亮勋章</div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>{medalsData.unlockedCount}/{medalsData.medals.length}</div>
                    </div>

                    <div id="medal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', paddingBottom: '40px' }}>
                        {medalsData.medals.map(m => {
                            const unlocked = m.current >= m.target;
                            const ratio = Math.min(m.current / m.target, 1);
                            return (
                                <div key={m.id} className={`medal-card ${unlocked ? 'unlocked' : ''}`}>
                                    <div className="medal-icon-wrapper"><i className={`fas ${m.icon}`}></i></div>
                                    <div className="medal-name">{m.name}</div>
                                    <div className="medal-desc">{m.desc}</div>
                                    <div className="medal-progress-bg" style={{ display: unlocked ? 'none' : 'block' }}>
                                        <div className="medal-progress-bar" style={{ width: `${ratio * 100}%` }}></div>
                                    </div>
                                    <div className="medal-progress-text" style={{ display: unlocked ? 'none' : 'block' }}>
                                        {m.isPercentage ? `${(m.current * 100).toFixed(0)}%/${(m.target * 100).toFixed(0)}%` : `${m.current}/${m.target}`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="page-discover" className="page" style={{ display: 'block' }}>
            <div className="home-header">
                <div style={{ fontSize: '18px', fontWeight: 'bold', padding: '15px' }}>发现</div>
            </div>
            <div style={{ padding: '15px' }}>
                <div className="menu-list">
                    <div className="menu-item" onClick={showRandomTip}>
                        <span><i className="fas fa-lightbulb" style={{ color: '#FFDA44', marginRight: '10px' }}></i>记账小贴士</span>
                        <i className="fas fa-chevron-right" style={{ color: '#ccc' }}></i>
                    </div>
                    <div className="menu-item" onClick={handleBudgetSuggestion}>
                        <span><i className="fas fa-wallet" style={{ color: '#2196F3', marginRight: '10px' }}></i>预算建议</span>
                        <i className="fas fa-chevron-right" style={{ color: '#ccc' }}></i>
                    </div>
                    <div className="menu-item" onClick={loadAchievements}>
                        <span><i className="fas fa-trophy" style={{ color: '#FF9800', marginRight: '10px' }}></i>成就系统</span>
                        <i className="fas fa-chevron-right" style={{ color: '#ccc' }}></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Discover;
