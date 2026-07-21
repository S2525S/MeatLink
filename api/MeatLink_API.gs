/**
 * MeatLink API v2.2
 *
 * スクリプトプロパティ:
 * GEMINI_API_KEY  必須（AI解析用）
 * GEMINI_MODEL    任意（未設定時 gemini-2.5-flash）
 * SPREADSHEET_ID  必須（注文保存用）
 */

function doGet() {
  return jsonOutput_({
    ok: true,
    service: "MeatLink API",
    version: "2.2"
  });
}

function doPost(e) {
  try {
    const body = JSON.parse(
      e && e.postData && e.postData.contents
        ? e.postData.contents
        : "{}"
    );

    if (body.action === "analyzeText") {
      return jsonOutput_(analyzeText_(body));
    }

    if (body.action === "submitOrder") {
      return jsonOutput_(submitOrder_(body.order || {}));
    }

    return jsonOutput_({
      ok: false,
      error: "不明な処理です。"
    });

  } catch (error) {
    return jsonOutput_({
      ok: false,
      error: String(error && error.message ? error.message : error)
    });
  }
}

function analyzeText_(body) {
  const properties = PropertiesService.getScriptProperties();
  const apiKey = properties.getProperty("GEMINI_API_KEY");

  if (!apiKey) {
    throw new Error("GEMINI_API_KEYが設定されていません。");
  }

  const model =
    properties.getProperty("GEMINI_MODEL") ||
    "gemini-2.5-flash";

  const products = Array.isArray(body.products)
    ? body.products.slice(0, 300)
    : [];

  const prompt = [
    "あなたは食肉卸会社の受注データ抽出担当です。",
    "入力された注文文章から注文情報を抽出してください。",
    "customer: 得意先名",
    "deliveryDate: 希望納品日。判別できなければ空文字",
    "items: code, name, qty, unit",
    "存在しない情報を作らないでください。",
    "数量不明は1、単位不明はkg。",
    "商品マスターに近い商品があれば商品名とコードを合わせてください。",
    "",
    "注文文章:",
    String(body.text || ""),
    "",
    "商品マスター:",
    JSON.stringify(products)
  ].join("\n");

  const responseSchema = {
    type: "OBJECT",
    properties: {
      customer: { type: "STRING" },
      deliveryDate: { type: "STRING" },
      items: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            code: { type: "STRING" },
            name: { type: "STRING" },
            qty: { type: "NUMBER" },
            unit: { type: "STRING" }
          },
          required: ["name", "qty", "unit"]
        }
      }
    },
    required: ["customer", "deliveryDate", "items"]
  };

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(model) +
    ":generateContent?key=" +
    encodeURIComponent(apiKey);

  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.1
    }
  };

  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode < 200 || responseCode >= 300) {
    throw new Error(
      "Gemini APIエラー " +
      responseCode +
      ": " +
      responseText
    );
  }

  const result = JSON.parse(responseText);
  const text =
    result.candidates &&
    result.candidates[0] &&
    result.candidates[0].content &&
    result.candidates[0].content.parts &&
    result.candidates[0].content.parts[0] &&
    result.candidates[0].content.parts[0].text;

  if (!text) {
    throw new Error("Geminiから解析結果が返りませんでした。");
  }

  return {
    ok: true,
    order: JSON.parse(text)
  };
}

function submitOrder_(order) {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  const orderId = Utilities.getUuid().slice(0, 8).toUpperCase();

  if (!spreadsheetId) {
    return {
      ok: true,
      orderId: orderId,
      saved: false
    };
  }

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName("注文履歴");

  if (!sheet) {
    sheet = spreadsheet.insertSheet("注文履歴");
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "受付番号",
      "受付日時",
      "得意先",
      "納品日",
      "商品CD",
      "商品名",
      "数量",
      "単位",
      "単価",
      "備考"
    ]);
  }

  const items = Array.isArray(order.items) ? order.items : [];

  items.forEach(function(item) {
    sheet.appendRow([
      orderId,
      new Date(),
      order.customer || "",
      order.deliveryDate || "",
      item.code || "",
      item.name || "",
      item.qty || "",
      item.unit || "",
      item.price || "",
      order.note || ""
    ]);
  });

  return {
    ok: true,
    orderId: orderId,
    saved: true
  };
}

function jsonOutput_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
