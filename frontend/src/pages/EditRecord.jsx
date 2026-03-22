import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const EditRecord = ({ onBack, categories, record, onSuccess }) => {
    const [amount, setAmount] = useState(record?.amount || 0);
    const [categoryId, setCategoryId] = useState(record?.categoryId || '');
    const [recordDate, setRecordDate] = useState(record?.recordDate || '');
    const [remark, setRemark] = useState(record?.remark || '');
    const [loading, setLoading] = useState(false);

    const isExpense = record?.type === 'expense';
    const cats = isExpense ? categories.expense : categories.income;

    const handleSave = async () => {
        if (!amount || !categoryId || !recordDate) return alert("请填写完整信息");

        setLoading(true);
        try {
            await apiFetch(`/records/${record.id}`, {
                method: 'PUT',
                auth: true,
                body: {
                    categoryId: parseInt(categoryId),
                    amount: parseFloat(amount),
                    type: record.type,
                    remark: remark,
                    recordDate: recordDate
                }
            });
            alert('🎉 修改成功！');
            if (onSuccess) onSuccess();
            onBack();
        } catch (e) {
            alert('修改失败: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!record) return null;

    return (
        <div id="page-edit-record" className="page-fullscreen" style={{ display: 'flex', zIndex: 500 }}>
            <div className="common-header">
                <i className="fas fa-chevron-left back-btn" onClick={onBack}></i>
                <div className="header-title">编辑记录</div>
                <div style={{ width: '25px' }}></div>
            </div>
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '5px' }}>账单类型</label>
                        <input type="text" className="form-input" value={isExpense ? '支出' : '收入'} disabled style={{ color: '#999', background: '#f9f9f9', borderBottom: 'none', borderRadius: '8px' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '5px' }}>修改金额 (¥)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={amount}
                            step="0.01"
                            onChange={e => setAmount(e.target.value)}
                            style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '5px' }}>修改分类</label>
                        <select
                            className="form-input"
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            style={{ width: '100%', border: 'none', borderBottom: '1px solid #ddd', outline: 'none', fontSize: '16px', background: 'transparent', padding: '10px 0' }}
                        >
                            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '5px' }}>修改日期</label>
                        <input
                            type="date"
                            className="form-input"
                            value={recordDate}
                            onChange={e => setRecordDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '30px' }}>
                        <label style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '5px' }}>备注说明</label>
                        <input
                            type="text"
                            className="form-input"
                            value={remark}
                            onChange={e => setRemark(e.target.value)}
                            placeholder="补充点什么..."
                        />
                    </div>
                    <button className="btn-block" onClick={handleSave} disabled={loading} style={{ boxShadow: '0 4px 10px rgba(255, 218, 68, 0.3)' }}>
                        {loading ? '保存中...' : '保存修改'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditRecord;
