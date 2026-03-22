import { useState, useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { apiFetch } from '../services/api';

const Statistics = ({ categories, currentDate }) => {
    const [overview, setOverview] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [loading, setLoading] = useState(false);
    const pieRef = useRef(null);
    const barRef = useRef(null);
    const pieChart = useRef(null);
    const barChart = useRef(null);

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
        loadStats();
        return () => {
            if (pieChart.current) pieChart.current.dispose();
            if (barChart.current) barChart.current.dispose();
        };
    }, [year, month]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const [ov, dist, comp] = await Promise.all([
                apiFetch(`/statistics/monthly-overview?year=${year}&month=${month}`, { auth: true }),
                apiFetch(`/statistics/category-distribution?year=${year}&month=${month}`, { auth: true }),
                apiFetch('/statistics/income-expense-comparison?months=6', { auth: true })
            ]);

            setOverview(ov || { totalIncome: 0, totalExpense: 0, balance: 0 });
            renderCharts(dist, comp);
        } catch (e) {
            console.error('Failed to load stats', e);
        } finally {
            setLoading(false);
        }
    };

    const renderCharts = (distribution, comparison) => {
        // Pie Chart
        if (!pieChart.current && pieRef.current) {
            pieChart.current = echarts.init(pieRef.current);
        }

        const pieData = (distribution || []).map(item => ({
            value: parseFloat(item.amount),
            name: categoryMap[item.categoryId]?.name || '未知'
        }));

        pieChart.current?.setOption({
            tooltip: { trigger: 'item', formatter: '{b} : ¥{c} ({d}%)' },
            legend: { bottom: '0%', left: 'center', itemWidth: 10, itemHeight: 10 },
            color: ['#FFDA44', '#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0'],
            series: [{
                type: 'pie',
                radius: ['45%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
                label: { show: false, position: 'center' },
                emphasis: {
                    label: { show: true, fontSize: '18', fontWeight: 'bold' }
                },
                labelLine: { show: false },
                data: pieData.length > 0 ? pieData : [{ value: 0, name: '暂无数据' }]
            }]
        });

        // Bar Chart
        if (!barChart.current && barRef.current) {
            barChart.current = echarts.init(barRef.current);
        }

        const months = (comparison || []).map(item => item.monthLabel).reverse();
        const incomes = (comparison || []).map(item => parseFloat(item.income || 0)).reverse();
        const expenses = (comparison || []).map(item => parseFloat(item.expense || 0)).reverse();

        barChart.current?.setOption({
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            legend: { data: ['收入', '支出'], bottom: 0 },
            grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
            xAxis: { type: 'category', data: months, axisTick: { show: false } },
            yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
            series: [
                {
                    name: '收入', type: 'bar', data: incomes,
                    itemStyle: { color: '#4CAF50', borderRadius: [5, 5, 0, 0] },
                    barGap: '10%'
                },
                {
                    name: '支出', type: 'bar', data: expenses,
                    itemStyle: { color: '#F44336', borderRadius: [5, 5, 0, 0] }
                }
            ]
        });
    };

    return (
        <div id="page-statistics" className="page" style={{ display: 'block' }}>
            <div className="home-header">
                <div style={{ fontSize: '18px', fontWeight: 'bold', padding: '15px' }}>数据统计 ({year}年{month}月)</div>
            </div>
            <div style={{ padding: '15px' }}>
                {loading && !overview.totalIncome && !overview.totalExpense ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}><i className="fas fa-spinner fa-spin"></i> 正在生成状态...</div>
                ) : (
                    <>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>{year}年{month}月概览</div>
                            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#999', fontSize: '12px' }}>总收入</div>
                                    <div style={{ color: '#4CAF50', fontSize: '18px', fontWeight: 'bold' }}>¥{parseFloat(overview.totalIncome || 0).toFixed(2)}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#999', fontSize: '12px' }}>总支出</div>
                                    <div style={{ color: '#f44336', fontSize: '18px', fontWeight: 'bold' }}>¥{parseFloat(overview.totalExpense || 0).toFixed(2)}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#999', fontSize: '12px' }}>结余</div>
                                    <div style={{ color: '#2196F3', fontSize: '18px', fontWeight: 'bold' }}>¥{parseFloat(overview.balance || 0).toFixed(2)}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>分类支出占比</div>
                            <div ref={pieRef} style={{ width: '100%', height: '260px' }}></div>
                        </div>

                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>近6月收支趋势</div>
                            <div ref={barRef} style={{ width: '100%', height: '280px' }}></div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Statistics;
