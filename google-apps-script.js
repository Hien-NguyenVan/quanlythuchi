// ====================================================
// HƯỚNG DẪN CÀI ĐẶT GOOGLE SHEETS LÀM DATABASE
// ====================================================
//
// BƯỚC 1: Tạo Google Sheet mới tại https://sheets.google.com
//         Đặt tên: "Thu Chi Data"
//
// BƯỚC 2: Tạo 1 sheet tên "transactions" (đổi tên sheet mặc định)
//         Thêm header ở dòng 1:
//         A1: id | B1: type | C1: categoryId | D1: amount | E1: date | F1: createdAt
//
// BƯỚC 3: Vào menu Extensions → Apps Script
//         Xóa hết code cũ, paste toàn bộ code bên dưới vào
//
// BƯỚC 4: Nhấn Deploy → New deployment
//         - Type: Web app
//         - Execute as: Me
//         - Who has access: Anyone
//         - Nhấn Deploy → Copy URL
//
// ⚠️ LƯU Ý: Nếu đã deploy trước đó, phải vào Deploy → Manage deployments
//         → chọn deployment → nhấn icon ✏️ → Version: New version → Deploy
//         để cập nhật code mới!
//
// BƯỚC 5: Dán URL vào app Thu Chi → Cài đặt → Google Sheets URL
//
// ====================================================

// --- PASTE CODE NÀY VÀO GOOGLE APPS SCRIPT ---

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'list';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('transactions');

    if (!sheet) {
      sheet = ss.insertSheet('transactions');
      sheet.appendRow(['id', 'type', 'categoryId', 'amount', 'date', 'createdAt']);
    }

    // === SYNC: nhận data từ app, ghi vào sheet ===
    if (action === 'sync') {
      var jsonData = decodeURIComponent(e.parameter.data || '[]');
      var transactions = JSON.parse(jsonData);
      var existingIds = getExistingIds(sheet);

      var newRows = [];
      for (var i = 0; i < transactions.length; i++) {
        var tx = transactions[i];
        if (existingIds.indexOf(String(tx.id)) === -1) {
          newRows.push([tx.id, tx.type, tx.categoryId, tx.amount, tx.date, tx.createdAt]);
        }
      }

      if (newRows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 6).setValues(newRows);
      }

      return jsonResponse({ success: true, added: newRows.length });
    }

    // === DELETE: xóa 1 giao dịch ===
    if (action === 'delete') {
      var deleteId = String(e.parameter.id);
      var rows = sheet.getDataRange().getValues();
      for (var i = rows.length - 1; i >= 1; i--) {
        if (String(rows[i][0]) === deleteId) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return jsonResponse({ success: true });
    }

    // === LIST: trả về toàn bộ giao dịch ===
    if (sheet.getLastRow() <= 1) {
      return jsonResponse({ transactions: [] });
    }

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
    var transactions = [];
    for (var i = 0; i < data.length; i++) {
      transactions.push({
        id: data[i][0],
        type: data[i][1],
        categoryId: data[i][2],
        amount: Number(data[i][3]),
        date: data[i][4],
        createdAt: data[i][5]
      });
    }

    return jsonResponse({ transactions: transactions });

  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function getExistingIds(sheet) {
  if (sheet.getLastRow() <= 1) return [];
  var ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  return ids.map(function(row) { return String(row[0]); });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
