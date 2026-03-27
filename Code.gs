// ============================================================
// FILE: Code.gs — Google Apps Script Nâng Cao Nhận Dữ Liệu
// HƯỚNG DẪN: Copy toàn bộ file này → Dán vào Google Apps Script
// Nhớ thay YOUR_SPREADSHEET_ID bằng ID thật của Google Sheets
// ============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    var newTime = data.timestamp || new Date().toLocaleString('vi-VN');
    var newName = data.name || '';
    var newPhone = data.phone || '';
    var newEmail = data.email || '';
    var newSource = data.source || '';
    var newSessionId = data.sessionId || '';
    var newHistory = data.chatHistory || '';

    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var rowIndexToUpdate = -1;

    // Tìm kiếm xem Session ID (Cột F - index 5) đã tồn tại chưa
    if (newSessionId) {
      for (var i = values.length - 1; i > 0; i--) { 
        var rowSessionId = values[i][5] ? values[i][5].toString().trim() : '';
        if (rowSessionId === newSessionId) {
          rowIndexToUpdate = i + 1; 
          break;
        }
      }
    }

    if (rowIndexToUpdate > -1) {
      // CẬP NHẬT GỘP (Chỉ ghi đè nếu thông tin cũ đang trống)
      var currentRow = values[rowIndexToUpdate - 1];
      if (!currentRow[1] && newName) sheet.getRange(rowIndexToUpdate, 2).setValue(newName);
      if (!currentRow[2] && newPhone) sheet.getRange(rowIndexToUpdate, 3).setValue(newPhone);
      if (!currentRow[3] && newEmail) sheet.getRange(rowIndexToUpdate, 4).setValue(newEmail);
      
      // Ghi đè lịch sử chat bằng bản mới nhất
      if (newHistory) sheet.getRange(rowIndexToUpdate, 7).setValue(newHistory);
      
      // Update thời gian tương tác mới nhất
      sheet.getRange(rowIndexToUpdate, 1).setValue(newTime);
    } else {
      // TẠO DÒNG MỚI nếu chưa có Session ID này
      sheet.appendRow([newTime, newName, newPhone, newEmail, newSource, newSessionId, newHistory]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("API Chatbot Leads Nâng Cao đang hoạt động ngon lành! ✅");
}
