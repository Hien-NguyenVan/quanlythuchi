export const expenseCategories = [
  // Ăn uống
  { id: 'com', name: 'Cơm', icon: '🍚', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'pho', name: 'Phở', icon: '🍜', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'hutieu', name: 'Hủ tiếu', icon: '🍲', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'bunbo', name: 'Bún bò', icon: '🥘', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'banhmi', name: 'Bánh mì', icon: '🥖', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'comvp', name: 'Cơm VP', icon: '🍱', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'lau', name: 'Lẩu', icon: '♨️', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'garan', name: 'Gà rán', icon: '🍗', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'pizza', name: 'Pizza', icon: '🍕', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'burger', name: 'Burger', icon: '🍔', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'mien', name: 'Miến', icon: '🍝', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'chao', name: 'Cháo', icon: '🥣', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'banh', name: 'Bánh cuốn', icon: '🥟', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'bbq', name: 'Nướng/BBQ', icon: '🥩', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'hai san', name: 'Hải sản', icon: '🦐', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'an vat', name: 'Ăn vặt', icon: '🍿', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'trai cay', name: 'Trái cây', icon: '🍉', group: 'Ăn uống', color: '#FF6B6B' },
  { id: 'com nha', name: 'Đi chợ nấu', icon: '🧑‍🍳', group: 'Ăn uống', color: '#FF6B6B' },

  // Đồ uống
  { id: 'caphe', name: 'Cà phê', icon: '☕', group: 'Đồ uống', color: '#D4A574' },
  { id: 'trasua', name: 'Trà sữa', icon: '🧋', group: 'Đồ uống', color: '#D4A574' },
  { id: 'nuoc', name: 'Nước uống', icon: '🥤', group: 'Đồ uống', color: '#D4A574' },
  { id: 'bia', name: 'Bia', icon: '🍺', group: 'Đồ uống', color: '#D4A574' },
  { id: 'ruou', name: 'Rượu', icon: '🍷', group: 'Đồ uống', color: '#D4A574' },
  { id: 'nuocep', name: 'Nước ép', icon: '🧃', group: 'Đồ uống', color: '#D4A574' },

  // Siêu thị / Cửa hàng
  { id: 'bhx', name: 'Bách Hoá Xanh', icon: '🟢', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'gs25', name: 'GS25', icon: '🏪', group: 'Mua sắm', color: '#45B7D1' },
  { id: '7eleven', name: '7-Eleven', icon: '🔴', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'circlek', name: 'Circle K', icon: '🟡', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'ministop', name: 'MiniStop', icon: '🔵', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'coopmart', name: 'Co.op Mart', icon: '🛒', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'winmart', name: 'WinMart', icon: '🛍️', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'lotte', name: 'Lotte Mart', icon: '🏬', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'bigc', name: 'Big C / Go!', icon: '🟠', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'aeon', name: 'AEON', icon: '🟣', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'mega', name: 'Mega Market', icon: '📦', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'tgdd', name: 'Thế Giới DĐ', icon: '📱', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'fpt', name: 'FPT Shop', icon: '💻', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'shopee', name: 'Shopee', icon: '🧡', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'lazada', name: 'Lazada', icon: '💙', group: 'Mua sắm', color: '#45B7D1' },
  { id: 'tiki', name: 'Tiki', icon: '💎', group: 'Mua sắm', color: '#45B7D1' },

  // Di chuyển
  { id: 'xang', name: 'Đổ xăng', icon: '⛽', group: 'Di chuyển', color: '#FECA57' },
  { id: 'grab', name: 'Grab', icon: '🚕', group: 'Di chuyển', color: '#FECA57' },
  { id: 'be', name: 'Be', icon: '🚗', group: 'Di chuyển', color: '#FECA57' },
  { id: 'bus', name: 'Xe buýt', icon: '🚌', group: 'Di chuyển', color: '#FECA57' },
  { id: 'metro', name: 'Metro', icon: '🚇', group: 'Di chuyển', color: '#FECA57' },
  { id: 'guixe', name: 'Gửi xe', icon: '🅿️', group: 'Di chuyển', color: '#FECA57' },
  { id: 'suaxe', name: 'Sửa xe', icon: '🔧', group: 'Di chuyển', color: '#FECA57' },
  { id: 'ruaxe', name: 'Rửa xe', icon: '🚿', group: 'Di chuyển', color: '#FECA57' },
  { id: 'taxi', name: 'Taxi', icon: '🚖', group: 'Di chuyển', color: '#FECA57' },
  { id: 've', name: 'Vé xe/máy bay', icon: '🎫', group: 'Di chuyển', color: '#FECA57' },

  // Nhà cửa / Hóa đơn
  { id: 'tiennha', name: 'Tiền nhà', icon: '🏠', group: 'Hóa đơn', color: '#A29BFE' },
  { id: 'tiendien', name: 'Tiền điện', icon: '💡', group: 'Hóa đơn', color: '#A29BFE' },
  { id: 'tiennuoc', name: 'Tiền nước', icon: '💧', group: 'Hóa đơn', color: '#A29BFE' },
  { id: 'internet', name: 'Internet', icon: '📶', group: 'Hóa đơn', color: '#A29BFE' },
  { id: 'dienthoai', name: 'Cước ĐT', icon: '📞', group: 'Hóa đơn', color: '#A29BFE' },
  { id: 'dongon', name: 'Dọn nhà', icon: '🧹', group: 'Hóa đơn', color: '#A29BFE' },
  { id: 'suachua', name: 'Sửa chữa', icon: '🛠️', group: 'Hóa đơn', color: '#A29BFE' },
  { id: 'gas', name: 'Gas', icon: '🔥', group: 'Hóa đơn', color: '#A29BFE' },

  // Sức khỏe
  { id: 'thuoc', name: 'Thuốc', icon: '💊', group: 'Sức khỏe', color: '#FF9FF3' },
  { id: 'khambenh', name: 'Khám bệnh', icon: '🏥', group: 'Sức khỏe', color: '#FF9FF3' },
  { id: 'nhakhoa', name: 'Nha khoa', icon: '🦷', group: 'Sức khỏe', color: '#FF9FF3' },
  { id: 'gym', name: 'Gym', icon: '💪', group: 'Sức khỏe', color: '#FF9FF3' },
  { id: 'mat', name: 'Mắt kính', icon: '👓', group: 'Sức khỏe', color: '#FF9FF3' },
  { id: 'baohiem', name: 'Bảo hiểm', icon: '🛡️', group: 'Sức khỏe', color: '#FF9FF3' },

  // Giải trí
  { id: 'phim', name: 'Xem phim', icon: '🎬', group: 'Giải trí', color: '#FD79A8' },
  { id: 'game', name: 'Game', icon: '🎮', group: 'Giải trí', color: '#FD79A8' },
  { id: 'karaoke', name: 'Karaoke', icon: '🎤', group: 'Giải trí', color: '#FD79A8' },
  { id: 'spotify', name: 'Spotify/Nhạc', icon: '🎵', group: 'Giải trí', color: '#FD79A8' },
  { id: 'netflix', name: 'Netflix/YouTube', icon: '📺', group: 'Giải trí', color: '#FD79A8' },
  { id: 'dulich', name: 'Du lịch', icon: '✈️', group: 'Giải trí', color: '#FD79A8' },
  { id: 'cafe', name: 'Cà phê ngồi', icon: '🪑', group: 'Giải trí', color: '#FD79A8' },

  // Cá nhân
  { id: 'quanao', name: 'Quần áo', icon: '👕', group: 'Cá nhân', color: '#E17055' },
  { id: 'giaydep', name: 'Giày dép', icon: '👟', group: 'Cá nhân', color: '#E17055' },
  { id: 'mypham', name: 'Mỹ phẩm', icon: '💄', group: 'Cá nhân', color: '#E17055' },
  { id: 'cattoc', name: 'Cắt tóc', icon: '✂️', group: 'Cá nhân', color: '#E17055' },
  { id: 'thucung', name: 'Thú cưng', icon: '🐕', group: 'Cá nhân', color: '#E17055' },
  { id: 'hoctap', name: 'Học tập', icon: '📚', group: 'Cá nhân', color: '#E17055' },
  { id: 'concai', name: 'Con cái', icon: '👶', group: 'Cá nhân', color: '#E17055' },
  { id: 'banhngot', name: 'Bánh ngọt', icon: '🍰', group: 'Cá nhân', color: '#E17055' },

  // Tài chính
  { id: 'chomuon', name: 'Cho mượn', icon: '💸', group: 'Tài chính', color: '#00B894' },
  { id: 'trano', name: 'Trả nợ', icon: '💳', group: 'Tài chính', color: '#00B894' },
  { id: 'quatang', name: 'Quà tặng', icon: '🎁', group: 'Tài chính', color: '#00B894' },
  { id: 'tuthien', name: 'Từ thiện', icon: '❤️', group: 'Tài chính', color: '#00B894' },
  { id: 'dautu', name: 'Đầu tư', icon: '📈', group: 'Tài chính', color: '#00B894' },
  { id: 'tietkiem', name: 'Tiết kiệm', icon: '🏦', group: 'Tài chính', color: '#00B894' },
  { id: 'khac_chi', name: 'Khác', icon: '📝', group: 'Tài chính', color: '#00B894' },
];

export const incomeCategories = [
  { id: 'luong', name: 'Lương', icon: '💰', group: 'Thu nhập', color: '#00C897' },
  { id: 'thuong', name: 'Thưởng', icon: '🎉', group: 'Thu nhập', color: '#00C897' },
  { id: 'phucap', name: 'Phụ cấp', icon: '💵', group: 'Thu nhập', color: '#00C897' },
  { id: 'thuno', name: 'Thu nợ', icon: '🤝', group: 'Thu nhập', color: '#00C897' },
  { id: 'laitk', name: 'Lãi tiết kiệm', icon: '🏦', group: 'Thu nhập', color: '#00C897' },
  { id: 'freelance', name: 'Freelance', icon: '💼', group: 'Thu nhập', color: '#00C897' },
  { id: 'chothue', name: 'Cho thuê', icon: '🏠', group: 'Thu nhập', color: '#00C897' },
  { id: 'duoccho', name: 'Được cho', icon: '🎁', group: 'Thu nhập', color: '#00C897' },
  { id: 'laidautu', name: 'Lãi đầu tư', icon: '📈', group: 'Thu nhập', color: '#00C897' },
  { id: 'bando', name: 'Bán đồ', icon: '🏷️', group: 'Thu nhập', color: '#00C897' },
  { id: 'trung', name: 'Trúng thưởng', icon: '🤑', group: 'Thu nhập', color: '#00C897' },
  { id: 'hoahong', name: 'Hoa hồng', icon: '💎', group: 'Thu nhập', color: '#00C897' },
  { id: 'ot', name: 'Làm thêm/OT', icon: '⏰', group: 'Thu nhập', color: '#00C897' },
  { id: 'khac_thu', name: 'Khác', icon: '📝', group: 'Thu nhập', color: '#00C897' },
];

export const allCategories = [...expenseCategories, ...incomeCategories];

export function getCategoryById(id) {
  return allCategories.find((c) => c.id === id);
}

export function getGroupedCategories(type) {
  const cats = type === 'income' ? incomeCategories : expenseCategories;
  const groups = {};
  cats.forEach((cat) => {
    if (!groups[cat.group]) groups[cat.group] = [];
    groups[cat.group].push(cat);
  });
  return groups;
}
