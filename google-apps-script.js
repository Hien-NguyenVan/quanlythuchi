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
// BƯỚC 5: Dán URL vào app Thu Chi → Cài đặt → Google Sheets URL
//
// ====================================================

// --- PASTE CODE NÀY VÀO GOOGLE APPS SCRIPT ---

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('transactions');

    if (!sheet) {
      sheet = ss.insertSheet('transactions');
      sheet.appendRow(['id', 'type', 'categoryId', 'amount', 'date', 'createdAt']);
    }

    if (action === 'sync') {
      // Nhận data từ app, ghi vào sheet
      var transactions = data.transactions || [];
      var existingIds = getExistingIds(sheet);

      var newRows = [];
      transactions.forEach(function(tx) {
        if (existingIds.indexOf(String(tx.id)) === -1) {
          newRows.push([tx.id, tx.type, tx.categoryId, tx.amount, tx.date, tx.createdAt]);
        }
      });

      if (newRows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 6).setValues(newRows);
      }

      return ContentService
        .createTextOutput(JSON.stringify({ success: true, added: newRows.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'delete') {
      var deleteId = String(data.id);
      var rows = sheet.getDataRange().getValues();
      for (var i = rows.length - 1; i >= 1; i--) {
        if (String(rows[i][0]) === deleteId) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('transactions');

    if (!sheet || sheet.getLastRow() <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ transactions: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
    var transactions = data.map(function(row) {
      return {
        id: row[0],
        type: row[1],
        categoryId: row[2],
        amount: Number(row[3]),
        date: row[4],
        createdAt: row[5]
      };
    });

    return ContentService
      .createTextOutput(JSON.stringify({ transactions: transactions }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getExistingIds(sheet) {
  if (sheet.getLastRow() <= 1) return [];
  var ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  return ids.map(function(row) { return String(row[0]); });
}
