/** UPDATE24 Google Sheet Live Backend
 * Deploy: Apps Script > Deploy > Manage deployments > Edit > New version > Deploy
 * Web app access: Anyone
 */
const DATA_SHEET_NAME = 'WebsiteData';

function getDataSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(DATA_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(DATA_SHEET_NAME);
    sh.getRange('A1').setValue('json_data');
    sh.getRange('B1').setValue('updated_at');
  }
  return sh;
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const sh = getDataSheet_();
    const txt = sh.getRange('A2').getValue();
    if (!txt) return jsonOutput_({ homepage_services: [], guide_pages: {}, empty: true });
    return jsonOutput_(JSON.parse(txt));
  } catch (err) {
    return jsonOutput_({ success: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No POST body found');
    }
    const data = JSON.parse(e.postData.contents);
    if (!data.homepage_services) data.homepage_services = [];
    if (!data.guide_pages) data.guide_pages = {};

    const sh = getDataSheet_();
    sh.getRange('A1').setValue('json_data');
    sh.getRange('B1').setValue('updated_at');
    sh.getRange('A2').setValue(JSON.stringify(data));
    sh.getRange('B2').setValue(new Date());

    return jsonOutput_({ success: true, updated_at: new Date().toISOString() });
  } catch (err) {
    return jsonOutput_({ success: false, error: String(err) });
  }
}
