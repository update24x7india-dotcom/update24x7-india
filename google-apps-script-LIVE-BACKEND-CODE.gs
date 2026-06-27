const SHEET_NAME = "UPDATE24_DATA";

function doGet(e) {
  try {
    const data = getSavedData_();
    return output_(data, e);
  } catch (err) {
    return output_({ homepage_services: [], guide_pages: {}, maintenance: { enabled: false, text: "" }, success: false, error: String(err) }, e);
  }
}

function doPost(e) {
  try {
    const bodyText = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const body = JSON.parse(bodyText);

    const data = {
      homepage_services: Array.isArray(body.homepage_services) ? body.homepage_services : [],
      guide_pages: body.guide_pages && typeof body.guide_pages === "object" ? body.guide_pages : {},
      maintenance: body.maintenance && typeof body.maintenance === "object" ? body.maintenance : { enabled: false, text: "" }
    };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = getOrCreateSheet_(ss);
    sh.clear();
    sh.getRange(1, 1).setValue(JSON.stringify(data));
    sh.getRange(1, 2).setValue(new Date());

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: "Saved", updatedAt: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSavedData_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = getOrCreateSheet_(ss);
  const value = sh.getRange(1, 1).getValue();
  if (!value) return { homepage_services: [], guide_pages: {}, maintenance: { enabled: false, text: "" } };

  const data = JSON.parse(value);
  return {
    homepage_services: Array.isArray(data.homepage_services) ? data.homepage_services : [],
    guide_pages: data.guide_pages && typeof data.guide_pages === "object" ? data.guide_pages : {},
    maintenance: data.maintenance && typeof data.maintenance === "object" ? data.maintenance : { enabled: false, text: "" }
  };
}

function getOrCreateSheet_(ss) {
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1).setValue(JSON.stringify({ homepage_services: [], guide_pages: {}, maintenance: { enabled: false, text: "" } }));
    sh.getRange(1, 2).setValue(new Date());
  }
  return sh;
}

function output_(obj, e) {
  const text = JSON.stringify(obj);
  const callback = e && e.parameter && e.parameter.callback ? String(e.parameter.callback) : "";

  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + text + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}
