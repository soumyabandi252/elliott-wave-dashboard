let allData = [];
let sortKey = "symbol";
let sortDir = 1;

async function loadData(){
  const res = await fetch("data.json", {cache: "no-store"});
  allData = await res.json();
  document.getElementById("lastUpdated").textContent =
    "Loaded " + allData.length + " tickers • " + new Date().toLocaleString();
  renderStats();
  render();
}

function renderStats(){
  const total = allData.length;
  const buy = allData.filter(d => d.signal === "BUY").length;
  const sell = allData.filter(d => d.signal === "SELL").length;
  const wait = allData.filter(d => d.signal === "WAIT").length;
  document.getElementById("statsRow").innerHTML = `
    <div class="stat-card"><div class="label">Total Tickers</div><div class="value">${total}</div></div>
    <div class="stat-card buy"><div class="label">Clean BUY</div><div class="value">${buy}</div></div>
    <div class="stat-card sell"><div class="label">Clean SELL</div><div class="value">${sell}</div></div>
    <div class="stat-card wait"><div class="label">Waiting</div><div class="value">${wait}</div></div>
  `;
}

function fundClass(f){
  if(!f) return "";
  if(f.includes("STRONG")) return "strong";
  if(f.includes("WEAK")) return "weak";
  if(f.includes("MODERATE")) return "moderate";
  return "";
}

function applyFilters(){
  const q = document.getElementById("searchBox").value.trim().toUpperCase();
  const sig = document.getElementById("signalFilter").value;
  const fund = document.getElementById("fundFilter").value;

  let rows = allData.filter(d => {
    if(q && !d.symbol.toUpperCase().includes(q)) return false;
    if(sig !== "ALL" && d.signal !== sig) return false;
    if(fund !== "ALL" && !(d.fundamental || "").toUpperCase().includes(fund)) return false;
    return true;
  });

  rows.sort((a,b) => {
    let av = a[sortKey], bv = b[sortKey];
    if(typeof av === "number" && typeof bv === "number") return (av - bv) * sortDir;
    return String(av).localeCompare(String(bv)) * sortDir;
  });

  return rows;
}

function render(){
  const rows = applyFilters();
  const tbody = document.getElementById("tableBody");
  const empty = document.getElementById("emptyState");

  if(rows.length === 0){
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = rows.map(d => `
    <tr>
      <td><strong>${d.symbol}</strong></td>
      <td>$${Number(d.price).toFixed(2)}</td>
      <td><span class="badge ${d.signal}">${d.signal}</span></td>
      <td>${d.degree || "-"}</td>
      <td>${d.wave || "-"}</td>
      <td>${d.latest_buy_date || "-"} ${d.latest_buy_tf ? "("+d.latest_buy_tf+")" : ""}</td>
      <td>${d.latest_sell_date || "-"} ${d.latest_sell_tf ? "("+d.latest_sell_tf+")" : ""}</td>
      <td><span class="fund-pill ${fundClass(d.fundamental)}">${d.fundamental || "UNKNOWN"}</span></td>
    </tr>
  `).join("");
}

function exportCSV(){
  const rows = applyFilters();
  const header = ["Symbol","Price","Signal","Degree","Wave","LatestBuyDate","LatestBuyTF","LatestSellDate","LatestSellTF","Fundamental"];
  const lines = [header.join(",")];
  rows.forEach(d => {
    lines.push([d.symbol,d.price,d.signal,d.degree,d.wave,d.latest_buy_date,d.latest_buy_tf,d.latest_sell_date,d.latest_sell_tf,d.fundamental].join(","));
  });
  const blob = new Blob([lines.join("\n")], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "elliott_wave_signals.csv";
  a.click();
}

document.getElementById("searchBox").addEventListener("input", render);
document.getElementById("signalFilter").addEventListener("change", render);
document.getElementById("fundFilter").addEventListener("change", render);
document.getElementById("exportBtn").addEventListener("click", exportCSV);

document.querySelectorAll("thead th").forEach(th => {
  th.addEventListener("click", () => {
    const key = th.dataset.key;
    if(sortKey === key){ sortDir *= -1; } else { sortKey = key; sortDir = 1; }
    render();
  });
});

loadData();
