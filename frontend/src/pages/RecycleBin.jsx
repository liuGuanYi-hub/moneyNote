import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { formatDate, formatAmount } from '../utils/format';

const RecycleBin = ({ onBack, categories, onRestore }) => {
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
            alert('恢复成功！');
            loadRecycleBin();
            if (onRestore) onRestore();
        } catch (e) {
            alert('恢复失败: ' + e.message);
        }
    };

    const handlePermanentDelete = async (id) => {
        if (!confirm('警告：彻底删除后将永远无法找回！确定要删除吗？')) return;
        try {
            await apiFetch(`/records/${id}/permanent`, { method: 'DELETE', auth: true });
            alert('已彻底销毁该记录');
            loadRecycleBin();
        } catch (e) {
            alert('彻底删除失败: ' + e.message);
        }
    };

    return (
        <div id="page-recycle-bin" className="page-fullscreen" style={{ display: 'flex' }}>
            <div className="common-header">
                <i className="fas fa-chevron-left back-btn" onClick={onBack}></i>
                <div className="header-title">回收站</div>
                <div style={{ width: '25px' }}></div>
            </div>
            <div id="recycle-bin-content" style={{ padding: '15px', overflowY: 'auto', flex: 1 }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>加载中...</div>
                ) : records.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <i className="fas fa-trash-alt" style={{ fontSize: '50px', color: '#E0E0E0', marginBottom: '15px' }}></i>
                        <div style={{ color: '#666', fontSize: '16px' }}>回收站空空如也</div>
                    </div>
                ) : (
                    records.map(record => {
                        const cat = categoryMap[record.categoryId] || { icon: 'fa-circle', name: '未知' };
                        return (
                            <div key={record.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                                        <i className={`fas ${cat.icon}`} style={{ color: '#666' }}></i>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{cat.name}</div>
                                        <div style={{ fontSize: '12px', color: '#999' }}>{formatDate(record.recordDate)}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: record.type === 'expense' ? '#333' : '#4CAF50' }}>{formatAmount(record.amount, record.type)}</div>
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
