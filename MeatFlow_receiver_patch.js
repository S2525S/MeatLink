/* 既存MeatFlowのapp.jsで、bootstrap完了後に1回呼び出してください: importMeatFlowAiTransfer(); */
function importMeatFlowAiTransfer(){
  if(new URLSearchParams(location.search).get('aiImport')!=='1')return;
  try{
    const raw=localStorage.getItem('meatflow_ai_transfer_v1'); if(!raw)return;
    const p=JSON.parse(raw); if(!p||!Array.isArray(p.items))return;
    applyOrderToForm({deliveryDate:p.deliveryDate||'',deliveryCondition:p.deliveryCondition||'',receiveMethod:p.receiveMethod||'',preferredTime:p.preferredTime||'',orderNote:p.orderNote||'',items:p.items});
    localStorage.removeItem('meatflow_ai_transfer_v1'); switchTab('new');
    history.replaceState({},'',location.pathname+location.hash);
    alert('AI受注の内容を取り込みました。商品・数量・単位・希望日を必ず確認してください。');
  }catch(e){console.error(e);alert('AI受注データを取り込めませんでした。');}
}
