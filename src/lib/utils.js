export function formatMoney(amount) {
  if (!amount && amount !== 0) return '0';
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export function formatMoneyShort(amount) {
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}tỷ`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}tr`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return `${amount}`;
}

export function getDateLabel(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + 'T00:00:00');
  const diff = Math.floor((today - date) / 86400000);

  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Hôm qua';
  if (diff === 2) return 'Hôm kia';
  if (diff < 7) return `${diff} ngày trước`;

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

export function toDateStr(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getMonthLabel(monthStr) {
  const [y, m] = monthStr.split('-');
  return `Tháng ${parseInt(m)}/${y}`;
}

export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}
