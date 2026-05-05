const fs = require('fs');
const path = require('path');

class NodeEnergyReportHelper {
  static results = [];

  static addResult(result) {
    this.results.push(result);
  }

  static generateHtmlReport() {
    const reportDir = path.join(process.cwd(), 'test-results', 'node-energy-dashboard');
    const reportPath = path.join(reportDir, 'index.html');

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const cards = this.results.map((r) => `
      <div class="card">
        <h2>${r.title}</h2>
        <div class="meta">${r.numberLabel}: <strong>${r.searchValue}</strong></div>

        <div class="grid">
          <div><span>LAR</span><b>${r.lar ?? 'null'}</b></div>
          <div><span>PAR</span><b>${r.par ?? 'null'}</b></div>
          <div><span>Energy Delta</span><b>${r.energyDelta ?? 'null'}</b></div>
          <div><span>MF</span><b>${r.mf ?? 'null'}</b></div>
          <div><span>Energy Received</span><b>${r.energyReceived ?? 'null'}</b></div>
          <div><span>Retailed Energy</span><b>${r.retailedEnergy ?? 'null'}</b></div>
          <div><span>Losses</span><b>${r.losses ?? 'null'}</b></div>
          <div><span>Loss %</span><b>${r.lossPct ?? 'null'}</b></div>
          <div><span>Connected Customers</span><b>${r.connectedCustomers ?? 'null'}</b></div>
          <div><span>Active Band</span><b>${r.activeBand ?? 'null'}</b></div>
          <div><span>Tariff Rate</span><b>${r.tariffRate ?? 'null'}</b></div>
          <div><span>Expected Revenue</span><b>${r.expectedRevenue ?? 'null'}</b></div>
        </div>
      </div>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Node Energy Analysis Dashboard</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f5f7fb;
      margin: 0;
      padding: 32px;
      color: #111827;
    }
    h1 {
      margin-bottom: 6px;
    }
    .subtitle {
      color: #6b7280;
      margin-bottom: 28px;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 24px;
    }
    .card {
      background: #ffffff;
      border-radius: 18px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
    }
    .card h2 {
      margin: 0 0 8px;
      font-size: 22px;
    }
    .meta {
      color: #6b7280;
      margin-bottom: 20px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    .grid div {
      background: #f9fafb;
      padding: 14px;
      border-radius: 12px;
      border: 1px solid #eef0f4;
    }
    span {
      display: block;
      color: #6b7280;
      font-size: 12px;
      margin-bottom: 6px;
    }
    b {
      font-size: 18px;
    }
  </style>
</head>
<body>
  <h1>Node Energy Analysis Dashboard</h1>
  <div class="subtitle">Generated from Playwright automation run</div>
  <div class="cards">${cards}</div>
</body>
</html>
`;

    fs.writeFileSync(reportPath, html);
    return reportPath;
  }
}

module.exports = { NodeEnergyReportHelper };