export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[date.getDay()];
    const today = new Date();
    const isToday = (year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate());
    return `${month}月${day}日 ${isToday ? '今天' : '星期' + weekday}`;
};

export const formatAmount = (amount, type) => {
    const num = parseFloat(amount);
    const prefix = type === 'expense' ? '-' : '+';
    return `${prefix} ${num.toFixed(2)}`;
};
