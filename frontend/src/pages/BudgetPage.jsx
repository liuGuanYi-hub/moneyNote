import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useCategoryStore } from '../stores/categoryStore';
import { toast } from '../stores/toastStore';

const BudgetPage = () => {
  const navigate = useNavigate();
  const categories = useCategoryStore(s => s.expense);
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editValue, setEditValue] = useState('');

  const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  useEffect(() => {
    loadBudgets();
  }, [currentYear, currentMonth]);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/budgets/progress?month=${monthStr}`, { auth: true });
      setBudgets(data || []);
    } catch (e) {
      console.error('Failed to load budgets', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleMonth = (delta) => {
    let y = currentYear;
    let m = currentMonth + delta;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setCurrentYear(y);
    setCurrentMonth(m);
  };

  const handleSetBudget = async () => {
    if (!editingBudget || !editValue) return;
    const amount = parseFloat(editValue);
    if (isNaN(amount) || amount <= 0) {
      toast.error('请输入有效金额');
      return;
    }
    try {
      await apiFetch('/budgets', {
        method: 'PUT',
        auth: true,
        body: {
          categoryId: editingBudget.categoryId,
          month: monthStr,
          amount: amount
        }
      });
      toast.success('预算已设置');
      setEditingBudget(null);
      loadBudgets();
    } catch (e) {
      toast.error('设置失败: ' + e.message);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      await apiFetch(`/budgets/${budgetId}`, { method: 'DELETE', auth: true });
      toast.success('预算已删除');
      loadBudgets();
    } catch (e) {
      toast.error('删除失败: ' + e.message);
    }
  };

  const budgetMap = useMemo(() => {
    const map = {};
    budgets.forEach(b => { map[b.categoryId] = b; });
    return map;
  }, [budgets]);

  const totalBudget = useMemo(() => {
    return budgets.reduce((sum, b) => sum + parseFloat(b.budgetAmount || 0), 0);
  }, [budgets]);

  const totalSpent = useMemo(() => {
    // aggregate spent from all records within budgeted categories (approximate)
    return budgets.reduce((sum, b) => sum + parseFloat(b.spent || 0), 0);
  }, [budgets]);

  // Merge categories with budget data
  const budgetCategories = useMemo(() => {
    return categories.map(cat => {
      const budget = budgetMap[cat.id];
      return {
        ...cat,
        budgetAmount: budget ? parseFloat(budget.budgetAmount) : 0,
        spent: budget ? parseFloat(budget.spent) : 0,
        percentage: budget ? budget.percentage : 0,
        hasBudget: !!budget
      };
    }).sort((a, b) => b.budgetAmount - a.budgetAmount);
  }, [categories, budgetMap]);

  const startEditing = (cat) => {
    setEditingBudget(cat);
    setEditValue(cat.budgetAmount > 0 ? String(cat.budgetAmount) : '');
  };

  return (
    <div id="page-budgets" className="page-fullscreen" style={{ display: 'flex' }}>
      <div className="common-header">
        <i className="fas fa-chevron-left back-btn" onClick={() => navigate('/user')}></i>
        <div className="header-title">预算管理</div>
        <div style={{ width: '25px' }}></div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
        {/* Month selector */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--card-bg)', borderRadius: 12, padding: '12px 16px',
          marginBottom: 15, boxShadow: '0 2px 8px var(--shadow-color)'
        }}>
          <i className="fas fa-chevron-left" style={{ cursor: 'pointer', color: 'var(--text-sub)', fontSize: 18 }} onClick={() => toggleMonth(-1)}></i>
          <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-main)' }}>{currentYear}年{currentMonth}月</span>
          <i className="fas fa-chevron-right" style={{ cursor: 'pointer', color: 'var(--text-sub)', fontSize: 18 }} onClick={() => toggleMonth(1)}></i>
        </div>

        {/* Total summary */}
        <div className="card" style={{ marginBottom: 15 }}>
          <div style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 8 }}>本月预算总额</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: 'var(--text-main)' }}>
            ¥{totalBudget.toFixed(2)}
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-sub)', marginLeft: 10 }}>
              已用 ¥{totalSpent.toFixed(2)}
            </span>
          </div>
          {totalBudget > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="budget-progress-bg">
                <div
                  className={`budget-progress-bar ${totalSpent > totalBudget ? 'over-budget' : ''}`}
                  style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` }}
                ></div>
              </div>
              <div className="budget-progress-text">
                <span>{((totalSpent / totalBudget) * 100).toFixed(1)}%</span>
                <span>{totalSpent > totalBudget ? `超支 ¥${(totalSpent - totalBudget).toFixed(2)}` : `剩余 ¥${(totalBudget - totalSpent).toFixed(2)}`}</span>
              </div>
            </div>
          )}
        </div>

        {/* Category budgets */}
        <div className="card" style={{ marginBottom: 80 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>分类预算</div>
          <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 15 }}>点击分类设置预算金额</div>

          {loading && budgetCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-sub)' }}>
              <i className="fas fa-spinner fa-spin"></i> 加载中...
            </div>
          ) : budgetCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-sub)' }}>
              暂无支出分类数据
            </div>
          ) : (
            budgetCategories.map(cat => (
              <div key={cat.id}>
                <div className="budget-category-row" onClick={() => startEditing(cat)}>
                  <div className="cat-icon-sm">
                    <i className={`fas ${cat.icon}`} style={{ color: 'var(--text-main)' }}></i>
                  </div>
                  <div className="cat-info">
                    <div className="cat-name">{cat.name}</div>
                    {cat.hasBudget && (
                      <div className="mini-bar">
                        <div
                          className="mini-bar-fill"
                          style={{
                            width: `${Math.min(100, cat.percentage)}%`,
                            background: cat.percentage > 100
                              ? 'var(--danger-color)'
                              : cat.percentage > 80
                                ? 'var(--warning-color)'
                                : 'var(--success-color)'
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div className="cat-amount">
                    {cat.hasBudget ? (
                      <>
                        <span className="spent">¥{cat.spent.toFixed(0)}</span> / ¥{cat.budgetAmount.toFixed(0)}
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-sub)', fontWeight: 400, fontSize: 13 }}>未设置</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit budget dialog */}
      {editingBudget && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--overlay-bg)', zIndex: 1000,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
          }}
          onClick={() => setEditingBudget(null)}
        >
          <div
            style={{
              background: 'var(--card-bg)', width: '100%', maxWidth: 480,
              borderRadius: '20px 20px 0 0', padding: 24,
              animation: 'slideUp 0.3s'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div className="cat-icon-sm" style={{ margin: '0 auto 10px', width: 48, height: 48, fontSize: 22 }}>
                <i className={`fas ${editingBudget.icon}`} style={{ color: 'var(--text-main)' }}></i>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-main)' }}>{editingBudget.name}</div>
              {editingBudget.hasBudget && (
                <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>
                  已花费 ¥{editingBudget.spent.toFixed(2)}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ marginBottom: 8 }}>预算金额 (¥)</label>
              <input
                type="number"
                className="form-input"
                style={{
                  fontSize: 24, fontWeight: 'bold', color: 'var(--text-main)',
                  borderBottom: '2px solid var(--primary-color)', textAlign: 'center',
                  padding: '12px 0'
                }}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                placeholder="输入金额"
                step="0.01"
                min="0"
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {editingBudget.hasBudget && (
                <button
                  style={{
                    flex: 1, padding: 14, border: '1px solid var(--danger-color)',
                    borderRadius: 12, background: 'transparent', color: 'var(--danger-color)',
                    fontWeight: 600, cursor: 'pointer'
                  }}
                  onClick={() => {
                    handleDeleteBudget(editingBudget.id);
                    setEditingBudget(null);
                  }}
                >
                  删除预算
                </button>
              )}
              <button
                className="btn-block"
                style={{ flex: 1, marginTop: 0, boxShadow: '0 4px 10px rgba(255, 218, 68, 0.3)' }}
                onClick={handleSetBudget}
              >
                保存预算
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
