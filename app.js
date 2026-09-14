let charts = {};
const $ = id => document.getElementById(id);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: "easeOutQuart" },
  plugins: { legend: { labels: { usePointStyle: true, padding: 16, font: { size: 10 } } } }
};

function setupForm(){
  $("formLink").href = CONFIG.GOOGLE_FORM_URL;
}

function animateNumber(el, target, decimals=0){
  const start = Number(String(el.textContent).replace(",", ".")) || 0;
  const end = Number(target) || 0;
  const t0 = performance.now();
  function tick(t){
    const p = Math.min((t-t0)/700,1);
    const e = 1-Math.pow(1-p,3);
    const value = start + (end-start)*e;
    el.textContent = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString("id-ID");
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function destroyCharts(){ Object.values(charts).forEach(c=>c?.destroy()); charts={}; }

function draw(data){
  const providers = data.providers || {};
  const usedProviders = data.usedProviders || {};
  const aspects = data.aspects || {};
  const satisfaction = data.satisfaction || {};

  animateNumber($("totalResponses"), data.totalResponses || 0);
  $("topProvider").textContent = data.topProvider || "—";
  $("topShare").textContent = data.topShare ? `${data.topShare}% dari total` : "—";
  $("avgSatisfaction").textContent = data.avgSatisfaction ? `${Number(data.avgSatisfaction).toFixed(2)} / 5` : "—";
  $("topArea").textContent = data.topArea || "—";
  $("areaShare").textContent = data.areaShare ? `${data.areaShare}% dari total` : "—";
  $("winnerName").textContent = data.topProvider || "Menunggu data survei...";
  $("winnerText").textContent = data.topProvider
    ? `Saat ini menjadi pilihan teratas berdasarkan ${data.totalResponses || 0} responden.`
    : "Isi kuesioner untuk ikut menentukan hasil.";
  $("growth").textContent = "Data survei tersinkron";
  const updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  const validUpdatedAt = !Number.isNaN(updatedAt.getTime());
  $("updateTime").textContent = validUpdatedAt
    ? "Sinkron: " + updatedAt.toLocaleString("id-ID",{dateStyle:"short",timeStyle:"short"})
    : "Sinkron berhasil";

  destroyCharts();

  const labels = Object.keys(providers);
  charts.provider = new Chart($("providerChart"),{
    type:"bar",
    data:{labels,datasets:[{label:"Responden",data:labels.map(k=>providers[k]),backgroundColor:["#087cf0","#f2b233","#22a06b","#8b45d9","#ef3f6d","#71839a"],borderRadius:8}]},
    options:{...chartDefaults,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}},x:{grid:{display:false}}}}
  });

  const satLabels=["Sangat Puas","Puas","Cukup Puas","Tidak Puas","Sangat Tidak Puas"];
  charts.satisfaction = new Chart($("satisfactionChart"),{
    type:"doughnut",
    data:{labels:satLabels,datasets:[{data:satLabels.map(k=>satisfaction[k]||0),backgroundColor:["#087cf0","#16bd8c","#f2c44b","#f47721","#ed3347"],borderWidth:0}]},
    options:{...chartDefaults,cutout:"68%",plugins:{legend:{position:"bottom",labels:{boxWidth:9,font:{size:9}}}}}
  });

  const aLabels=Object.keys(aspects), aValues=aLabels.map(k=>aspects[k]);
  charts.aspect = new Chart($("aspectChart"),{
    type:"bar",
    data:{labels:aLabels,datasets:[{label:"Rata-rata",data:aValues,backgroundColor:"#087cf0",borderRadius:7}]},
    options:{...chartDefaults,indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{min:0,max:5,ticks:{stepSize:1}},y:{grid:{display:false}}}}
  });

  const uLabels=Object.keys(usedProviders);
  charts.used = new Chart($("usedProviderChart"),{
    type:"polarArea",
    data:{labels:uLabels,datasets:[{data:uLabels.map(k=>usedProviders[k]),backgroundColor:["#087cf0","#f2b233","#22a06b","#8b45d9","#ef3f6d","#71839a"]}]},
    options:{...chartDefaults,scales:{r:{ticks:{display:false}}},plugins:{legend:{position:"bottom",labels:{boxWidth:9,font:{size:9}}}}}
  });
}

async function loadStats(){
  if(!CONFIG.STATS_API_URL || CONFIG.STATS_API_URL.startsWith("PASTE_")){
    $("updateTime").textContent="API belum dihubungkan";
    return;
  }
  try{
    const join=CONFIG.STATS_API_URL.includes("?")?"&":"?";
    const res=await fetch(CONFIG.STATS_API_URL+join+"t="+Date.now(),{cache:"no-store"});
    if(!res.ok) throw new Error("HTTP "+res.status);
    const data=await res.json();
    if(data.error) throw new Error(data.error);
    draw(data);
  }catch(err){
    console.error(err);
    $("updateTime").textContent="Gagal menyinkronkan data";
  }
}

const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")});
},{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

window.addEventListener("scroll",()=>{
  const h=document.documentElement.scrollHeight-innerHeight;
  $("progressBar").style.width=(scrollY/h*100)+"%";
});

$("refreshBtn").addEventListener("click",loadStats);
$("themeBtn").addEventListener("click",()=>{
  document.body.classList.toggle("dark");
  $("themeBtn").textContent=document.body.classList.contains("dark")?"☀":"☾";
  localStorage.setItem("theme",document.body.classList.contains("dark")?"dark":"light");
});
if(localStorage.getItem("theme")==="dark"){document.body.classList.add("dark");$("themeBtn").textContent="☀"}

setupForm();
loadStats();
setInterval(loadStats,CONFIG.REFRESH_MS);
