// GOOGLE APPS SCRIPT — DASHBOARD STATISTIK
// Dipasang di Google Sheet respons Form.
// Jangan kirim data mentah responden ke website publik.

const SPREADSHEET_ID = "1DEBtfIV1bapk4Mark2OQrQOapjLMUboMCfh5qmPWifg";
const SHEET_NAME = "Form responses 1";

const ASPECTS = [
  "Kualitas jaringan",
  "Kecepatan internet",
  "Kestabilan koneksi",
  "Jangkauan jaringan",
  "Harga paket internet",
  "Pilihan paket internet",
  "Kemudahan membeli paket",
  "Promo dan bonus",
  "Pelayanan pelanggan"
];

function doGet(){
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh=ss.getSheetByName(SHEET_NAME);
  if(!sh) return out({error:"Sheet '"+SHEET_NAME+"' tidak ditemukan."});

  const all=sh.getDataRange().getValues();
  if(all.length<2) return out({updatedAt:null,totalResponses:0,providers:{},usedProviders:{},aspects:{},satisfaction:{},topProvider:null,avgSatisfaction:null});

  const headers=all[0].map(String);
  const rows=all.slice(1).filter(r=>r.some(v=>String(v).trim()!==""));
  const timestampCol=headers.findIndex(h=>h.toLowerCase().includes("timestamp"));
  const lastTimestamp=timestampCol>=0 && rows.length ? rows[rows.length-1][timestampCol] : null;

  const findCol=(text)=>{
    const i=headers.findIndex(h=>h.toLowerCase().includes(text.toLowerCase()));
    return i;
  };

  const providerBest=findCol("Provider mana yang menurut Anda paling baik");
  const providerUsed=findCol("Provider internet seluler yang paling sering Anda gunakan");
  const satCol=findCol("Secara keseluruhan, seberapa puas");
  const areaCol=findCol("Kecamatan tempat Anda tinggal");

  const providers=countCol(rows,providerBest>=0?providerBest:providerUsed);
  const usedProviders=countCol(rows,providerUsed);
  const satisfaction=countCol(rows,satCol);

  const aspects={};
  ASPECTS.forEach(aspect=>{
    const indexes=headers.map((h,i)=>({h:h.toLowerCase(),i}))
      .filter(x=>x.h.includes(aspect.toLowerCase().replace("di samarinda","").trim()))
      .map(x=>x.i);
    let sum=0,n=0;
    indexes.forEach(i=>rows.forEach(r=>{
      const v=scale(r[i]);
      if(v!==null){sum+=v;n++;}
    }));
    if(n) aspects[aspect]=Math.round((sum/n)*100)/100;
  });

  const top=topKey(providers);
  const area=countCol(rows,areaCol);
  const topA=topKey(area);

  let satSum=0,satN=0;
  rows.forEach(r=>{const v=scale(r[satCol]);if(v!==null){satSum+=v;satN++;}});

  return out({
    updatedAt:lastTimestamp instanceof Date ? lastTimestamp.toISOString() : null,
    totalResponses:rows.length,
    providers:providers,
    usedProviders:usedProviders,
    satisfaction:satisfaction,
    aspects:aspects,
    topProvider:top,
    topShare:top?Math.round((providers[top]/rows.length)*1000)/10:0,
    avgSatisfaction:satN?Math.round((satSum/satN)*100)/100:null,
    topArea:topA,
    areaShare:topA?Math.round((area[topA]/rows.length)*1000)/10:0
  });
}

function countCol(rows,index){
  const o={};
  if(index<0) return o;
  rows.forEach(r=>{
    const v=String(r[index]||"").trim();
    if(v)o[v]=(o[v]||0)+1;
  });
  return o;
}
function topKey(o){
  const keys=Object.keys(o);
  return keys.length?keys.sort((a,b)=>o[b]-o[a])[0]:null;
}
function scale(v){
  if(typeof v==="number") return v>=1&&v<=5?v:null;
  const s=String(v||"").toLowerCase().trim();
  const map={"sangat tidak puas":1,"tidak puas":2,"cukup puas":3,"puas":4,"sangat puas":5};
  if(map[s])return map[s];
  const n=Number(s);
  return n>=1&&n<=5?n:null;
}
function out(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
