import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { formatDate, formatAmount } from '../utils/format';
import { useCategoryStore } from '../stores/categoryStore';
import { toast } from '../stores/toastStore';
import EmptyState from '../components/EmptyState';

const RecycleBin = ({ onRestore }) => {
    const categories = useCategoryStore(s => ({ expense: s.expense, income: s.income }));
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const categoryMap = {};
    [...categories.expense, ...categories.income].forEach(cat => {
        categoryMap[cat.id] = cat;
    });

    useEffect(() => {
        loadRecycleBin();
    }, []);

    const loadRecycleBin = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/records/recycle-bin', { auth: true });
            setRecords(data || []);
        } catch (e) {
            console.error('Failed to load recycle bin', e);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        if (!confirm('确定要恢复这条记录吗？')) return;
        try {
            await apiFetch(`/records/${id}/restore`, { method: 'POST', auth: true });
            toast.success('恢复成功！');
            loadRecycleBin();
            if (onRestore) onRestore();
        } catch (e) {
            toast.error('恢复失败: ' + e.message);
        }
    };

    const handlePermanentDelete = async (id) => {
        if (!confirm('警告：彻底删除后将永远无法找回！确定要删除吗？')) return;
        try {
            await apiFetch(`/records/${id}/permanent`, { method: 'DELETE', auth: true });
            toast.success('已彻底销毁该记录');
            loadRecycleBin();
        } catch (e) {
            toast.error('彻底删除失败: ' + e.message);
        }
    };

    return (
        <div id="page-recycle-bin" className="page-fullscreen" style={{ display: 'flex' }}>
            <div className="common-header">
                <i className="fas fa-chevron-left back-btn" onClick={() => navigate('/user')}></i>
                <div className="header-title">回收站</div>
                <div style={{ width: '25px' }}></div>
            </div>
            <div id="recycle-bin-content" style={{ padding: '15px', overflowY: 'auto', flex: 1 }}>
                {loading ? (
                    <div style={{ padding: '15px' }}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="skeleton skeleton-card" style={{ height: 70, marginBottom: 10 }} />
                        ))}
                    </div>
                ) : records.length === 0 ? (
                    <EmptyState icon="fa-trash-alt" title="回收站空空如也" description="删除的记录会出现在这里" />
                ) : (
                    records.map(record => {
                        const cat = categoryMap[record.categoryId] || { icon: 'fa-circle', name: '未知' };
                        return (
                            <div key={record.id} style={{ background: 'var(--card-bg)', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'var(--hover-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                                        <i className={`fas ${cat.icon}`} style={{ color: 'var(--text-sub)' }}></i>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{cat.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{formatDate(record.recordDate)}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: record.type === 'expense' ? 'var(--text-main)' : 'var(--success-color)' }}>{formatAmount(record.amount, record.type)}</div>
                                    <div style={{ marginTop: '5px' }}>
                                        <button onClick={() => handleRestore(record.id)} style={{ padding: '4px 10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', marginRight: '5px', cursor: 'pointer' }}>恢复</button>
                                        <button onClick={() => handlePermanentDelete(record.id)} style={{ padding: '4px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>彻底删除</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RecycleBin;
