/**
 * MeatLink API v2.0
 *
 * Script Properties に設定:
 * GEMINI_API_KEY  必須（AI解析を使う場合）
 * GEMINI_MODEL    任意。未設定時 gemini-2.5-flash
 * SPREADSHEET_ID  任意。注文をシート保存する場合
 */
function doGet() {
  return json_({ok:true, service:"MeatLink API", version:"2.0"});
}

function doPost(e) {
  try {
    var body = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (body.action === "analyzeText") return json_(analyzeText_(body));
    if (body.action === "submitOrder") return json_(submitOrder_(body.order || {}));
    return json_({ok:false,error:"unknown action"});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function analyzeText_(body) {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY が未設定です。");
  var model = props.getProperty("GEMINI_MODEL") || "gemini-2.5-flash";
  var products = Array.isArray(body.products) ? body.products.slice(0,300) : [];
  var prompt = [
    "あなたは食肉卸の受注データ抽出担当です。",
    "入力文から得意先名、希望納品日、商品名、数量、単位を抽出してください。",
    "曖昧な値を捏造しないでください。数量不明は1、単位不明はkg。",
    "商品マスターがある場合は最も近い商品名と商品コードへ寄せてください。",
    "入力文:", String(body.text || ""),
    "商品マスター:", JSON.stringify(products)
  ].join("\n");

  var schema = {
    type:"OBJECT",
    properties:{
      customer:{type:"STRING"},
      deliveryDate:{type:"STRING"},
      items:{type:"ARRAY",items:{type:"OBJECT",properties:{
        code:{type:"STRING"},name:{type:"STRING"},qty:{type:"NUMBER"},unit:{type:"STRING"}
      },required:["name","qty","unit"]}}
    },
    required:["customer","deliveryDate","items"]
  };

  var url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(key);
  var payload = {
    contents:[{role:"user",parts:[{text:prompt}]}],
    generationConfig:{responseMimeType:"application/json",responseSchema:schema,temperature:0.1}
  };
  var res = UrlFetchApp.fetch(url,{
    method:"post",contentType:"application/json",payload:JSON.stringify(payload),
    muteHttpExceptions:true
  });
  var code = res.getResponseCode();
  var raw = res.getContentText();
  if (code < 200 || code >= 300) throw new Error("Gemini API " + code + ": " + raw);
  var data = JSON.parse(raw);
  var text = data.candidates && data.candidates[0] && data.candidates[0].content &&
             data.candidates[0].content.parts && data.candidates[0].content.parts[0].text;
  if (!text) throw new Error("Geminiから解析結果が返りませんでした。");
  return {ok:true,order:JSON.parse(text)};
}

function submitOrder_(order) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SPREADSHEET_ID");
  var orderId = Utilities.getUuid().slice(0,8).toUpperCase();
  if (!id) return {ok:true,orderId:orderId,saved:false};
  var ss = SpreadsheetApp.openById(id);
  var sh = ss.getSheetByName("注文履歴") || ss.insertSheet("注文履歴");
  if (sh.getLastRow() === 0) sh.appendRow(["受付番号","受付日時","得意先","納品日","商品CD","商品名","数量","単位","単価","備考"]);
  var items = Array.isArray(order.items) ? order.items : [];
  items.forEach(function(x){
    sh.appendRow([orderId,new Date(),order.customer||"",order.deliveryDate||"",x.code||"",x.name||"",x.qty||"",x.unit||"",x.price||"",order.note||""]);
  });
  return {ok:true,orderId:orderId,saved:true};
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
