/* ============================================================
   GANTI DENGAN ID GOOGLE SHEET ANDA
   ============================================================ */
const SHEET_ID = "https://docs.google.com/spreadsheets/d/1R4qJ5VU-WEUSLpPUkpuTvgSpU45ZluKr3w-_J6MaPlc/edit?usp=sharing";
const SHEET_PENGEcer = "DataPengecer";
const SHEET_RESTORAN = "DataRestoran";

function doGet(e) {
  const action = e.parameter.action || "read";
  
  if (action === "read") {
    const data = {
      pengecer: getAllData(SHEET_PENGEcer),
      restoran: getAllData(SHEET_RESTORAN)
    };
    // Gabungkan kedua data
    const allData = [...data.pengecer, ...data.restoran].sort((a, b) => {
      return new Date(b.tanggal) - new Date(a.tanggal);
    });
    return jsonResponse({ success: true, data: allData });
  }
  
  return jsonResponse({ success: false, message: "Action tidak dikenal" });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { action, data } = body;
    let result = {};

    switch(action) {
      case "createPengecer":
        result = { success: true, message: "✅ Data Pengecer berhasil disimpan", id: createData(SHEET_PENGEcer, data) };
        break;
      case "createRestoran":
        result = { success: true, message: "✅ Data Restoran/Bar/Hotel berhasil disimpan", id: createData(SHEET_RESTORAN, data) };
        break;
      default:
        throw new Error("Action tidak valid");
    }
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ success: false, message: err.message });
  }
}

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(sheetName);
  if (!sh) {
    sh = ss.insertSheet(sheetName);
    // Header untuk Pengecer dan Restoran
    sh.appendRow([
      "ID", "Tanggal", "Jenis", "NamaPerusahaan", "NoPermohonan", 
      "Status", "BentukUsaha", "Golongan", "Alamat", "Telp", "Email",
      "NPWP", "BPJS", "Kegiatan", "NamaUsaha", "LokasiUsaha", 
      "PenanggungJawab", "MinumanA", "MinumanB", "MinumanC",
      "Dokumen", "JarakIbadah", "JarakSekolah", "JarakRS"
    ]);
  }
  return sh;
}

function getAllData(sheetName) {
  const sh = getSheet(sheetName);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.toLowerCase()] = row[i];
    });
    return obj;
  });
}

function createData(sheetName, d) {
  const sh = getSheet(sheetName);
  const id = "BAPL-" + new Date().getTime();
  sh.appendRow([
    id, d.tanggal, d.jenis, d.namaPerusahaan, d.noPermohonan,
    d.status, d.bentukUsaha, d.golongan, d.alamat, d.telp, d.email,
    d.npwp, d.bpjs, d.kegiatan, d.namaUsaha, d.lokasiUsaha,
    d.penanggungJawab, d.minumanA, d.minumanB, d.minumanC,
    d.dokumen, d.jarakIbadah, d.jarakSekolah, d.jarakRS
  ]);
  return id;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}