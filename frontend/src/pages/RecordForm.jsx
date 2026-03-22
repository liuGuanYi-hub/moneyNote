import { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { apiFetch } from '../services/api';

const RecordForm = ({ onBack, categories, onSuccess }) => {
    const [amountStr, setAmountStr] = useState('0.00');
    const [currentType, setCurrentType] = useState('expense');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [remark, setRemark] = useState('');
    const [loading, setLoading] = useState(false);

    const cats = useMemo(() => {
        const list = categories[currentType] || [];
        if (list.length > 0 && !selectedCategoryId) {
            // No need to set state here, we'll handle it in effect or derived
        }
        return list;
    }, [categories, currentType]);

    // Initialize selected category if not set
    if (cats.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(cats[0].id);
    }

    const selectedCat = useMemo(() => {
        return cats.find(c => c.id === selectedCategoryId) || cats[0] || { icon: 'fa-question', name: '未知' };
    }, [cats, selectedCategoryId]);

    const handleInput = (val) => {
        setAmountStr(prev => {
            if (prev === '0.00') return val === '.' ? '0.' : val;
            if (val === '.' && prev.includes('.')) return prev;
            return prev + val;
        });
    };

    const handleDel = () => {
        setAmountStr(prev => prev.length > 1 ? prev.slice(0, -1) : '0.00');
    };

    const handleClear = () => {
        setAmountStr('0.00');
    };

    const handleSubmit = async () => {
        const amount = parseFloat(amountStr);
        if (amount <= 0 || !selectedCategoryId) {
            alert('请选择分类并输入有效金额');
            return;
        }

        setLoading(true);
        try {
            const today = new Date();
            const recordDate = today.toISOString().split('T')[0];

            await apiFetch('/records', {
                method: 'POST',
                auth: true,
                body: {
                    categoryId: selectedCategoryId,
                    amount: amount,
                    type: currentType,
                    remark: remark,
                    recordDate: recordDate
                }
            });

            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.9 },
                shapes: ['circle'],
                colors: ['#FFDA44', '#FFA000']
            });

            setTimeout(() => {
                if (onSuccess) onSuccess();
                onBack();
            }, 500);
        } catch (e) {
            alert('记账失败: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="page-record" className="page-fullscreen" style={{ display: 'flex' }}>
            <div className="record-header-bar">
                <i className="fas fa-chevron-left back-btn" onClick={onBack}></i>
                <div className="type-switch">
                    <div
                        className={`type-btn ${currentType === 'expense' ? 'active' : ''}`}
                        onClick={() => { setCurrentType('expense'); setSelectedCategoryId(null); }}
                    >
                        支出
                    </div>
                    <div
                        className={`type-btn ${currentType === 'income' ? 'active' : ''}`}
                        onClick={() => { setCurrentType('income'); setSelectedCategoryId(null); }}
                    >
                        收入
                    </div>
                </div>
                <div style={{ width: '22px' }}></div>
            </div>

            <div className="category-grid">
                {cats.map(cat => (
                    <div
                        key={cat.id}
                        className={`cat-item ${selectedCategoryId === cat.id ? 'selected' : ''}`}
                        onClick={() => setSelectedCategoryId(cat.id)}
                    >
                        <div className="cat-circle"><i className={`fas ${cat.icon}`}></i></div>
                        <div className="cat-name">{cat.name}</div>
                    </div>
                ))}
            </div>

            <div className="keyboard-area">
                <div className="input-display">
                    <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                        <i className={`fas ${selectedCat.icon}`} style={{ marginRight: '10px', color: '#FFDA44', fontSize: '24px' }}></i>
                        <span>{selectedCat.name}</span>
                    </div>
                    <div className="input-value">{amountStr}</div>
                </div>
                <div style={{ padding: '10px 15px', borderTop: '1px solid var(--border-color)' }}>
                    <input
                        type="text"
                        placeholder="添加备注（可选）"
                        value={remark}
                        onChange={e => setRemark(e.target.value)}
                        style={{ width: '100%', padding: '10px', border: 'none', borderBottom: '1px solid #eee', outline: 'none', fontSize: '14px', background: 'transparent' }}
                    />
                </div>
                <div className="keypad">
                    <div className="nums">
                        <div className="key" onClick={() => handleInput('7')}>7</div>
                        <div className="key" onClick={() => handleInput('8')}>8</div>
                        <div className="key" onClick={() => handleInput('9')}>9</div>
                        <div className="key" onClick={() => handleInput('4')}>4</div>
                        <div className="key" onClick={() => handleInput('5')}>5</div>
                        <div className="key" onClick={() => handleInput('6')}>6</div>
                        <div className="key" onClick={() => handleInput('1')}>1</div>
                        <div className="key" onClick={() => handleInput('2')}>2</div>
                        <div className="key" onClick={() => handleInput('3')}>3</div>
                        <div className="key" onClick={() => handleInput('.')}>.</div>
                        <div className="key" onClick={() => handleInput('0')}>0</div>
                        <div className="key" onClick={handleClear}>清空</div>
                    </div>
                    <div className="ops">
                        <div className="key" onClick={handleDel}><i className="fas fa-backspace"></i></div>
                        <div className="key-ok" onClick={handleSubmit} style={{ opacity: loading ? 0.7 : 1 }}>
                            {loading ? '...' : '完成'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordForm;
