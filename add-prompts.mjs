import XLSX from 'xlsx';
import fs from 'fs';
const text = fs.readFileSync('C:/Users/admin/Desktop/Prompts - added.txt', 'utf-8');

// ── 2. Define lecture sections ────────────────────────────────────────
const sections = [
  { lecture: 92,  category: 'Supply Chain Analytics',            subs: ['Big Data Analytics','Real-Time Monitoring and Dashboards','KPI and Performance Measurement','Predictive and Prescriptive Analytics','Data-Driven Decision Making'] },
  { lecture: 93,  category: 'Supply Chain Integration',          subs: ['End-to-End Supply Chain Visibility','Integrated Business Planning','Collaborative Planning Forecasting and Replenishment','Information Sharing and Transparency','EDI and API Integration'] },
  { lecture: 94,  category: 'Risk and Resilience',               subs: ['Supply Chain Risk Assessment','Contingency Planning','Disruption Management','Business Continuity Planning','Supply Chain Security'] },
  { lecture: 95,  category: 'Sustainability and CSR',            subs: ['Carbon Footprint Reduction','Sustainable Packaging','Ethical Sourcing and Fair Trade','Circular Supply Chains','Environmental Impact Analysis'] },
  { lecture: 96,  category: 'Customer Service and Fulfillment',   subs: ['Order Management','Fulfillment Strategies','Returns and Reverse Logistics','Customer Experience Management','Service Level Agreements'] },
  { lecture: 97,  category: 'Supplier Relationship Management',  subs: ['Supplier Development Programs','Supplier Performance Monitoring','Strategic Alliances and Partnerships','Vendor Managed Inventory','Supplier Collaboration Platforms'] },
  { lecture: 98,  category: 'Product Lifecycle Management',      subs: ['New Product Introduction','End-of-Life Management','Product Data Management','Design for Supply Chain','Product Quality Management'] },
  { lecture: 99,  category: 'Global Supply Chain Management',    subs: ['International Trade Compliance','Global Logistics and Distribution','Cross-Border Supply Chain Management','Tariffs and Trade Policies','Cultural and Geopolitical Considerations'] },
  { lecture: 100, category: 'Cost Management',                   subs: ['Total Cost of Ownership','Cost-to-Serve Analysis','Cost Reduction Strategies','Budgeting and Financial Planning','Activity-Based Costing'] },
  { lecture: 101, category: 'Lean and Agile Supply Chains',      subs: ['Lean Manufacturing Principles','Agile Supply Chain Strategies','Continuous Improvement','Waste Reduction Techniques','Flexibility and Responsiveness'] },
  { lecture: 102, category: 'Performance Metrics and KPIs',      subs: ['Supply Chain Performance Measurement','Balanced Scorecard Approach','Benchmarking and Best Practices','Efficiency and Effectiveness Metrics','Continuous Improvement Programs'] },
  { lecture: 103, category: 'Ethics and Compliance',             subs: ['Regulatory Compliance','Anti-Corruption Measures','Ethical Business Practices','Labor Standards and Human Rights','Compliance Audits'] },
  { lecture: 104, category: 'Collaboration and Partnerships',    subs: ['Joint Ventures in Supply Chain','Public-Private Partnerships','Industry Consortiums','Collaborative Logistics','Strategic Alliances'] },
  { lecture: 105, category: 'Innovation and Future Trends',      subs: ['Emerging Technologies in SCM','Future Supply Chain Trends','Innovation Management','Digital Transformation','Industry 4.0'] },
];

// ── 3. Extract (prompt, note) pairs in order from text file ──────────
const lines = text.split('\n');
const pairs = [];
let cur = null;

const skipLines = new Set([
  'Supply Chain Analytics','Supply Chain Integration','Risk and Resilience',
  'Sustainability and CSR','Customer Service and Fulfillment',
  'Supplier Relationship Management','Product Lifecycle Management',
  'Global Supply Chain Management','Cost Management',
  'Lean and Agile Supply Chains','Performance Metrics and KPIs',
  'Ethics and Compliance','Collaboration and Partnerships',
  'Innovation and Future Trends','Collaborative Logistics',
]);

for (const line of lines) {
  const t = line.trim();
  if (!t) continue;
  if (/^\d+$/.test(t)) continue;
  if (/^\d+\.\s/.test(t)) continue;
  if (/^\d+min$/.test(t)) continue;
  if (['Play','Start','Not completed','Completed'].includes(t)) continue;
  if (skipLines.has(t)) continue;

  const qm = t.match(/^"(.+)"$/);
  if (qm) {
    if (cur) pairs.push(cur);
    cur = { prompt: qm[1], note: '' };
  } else if (cur && cur.note === '') {
    cur.note = t;
  }
}
if (cur) pairs.push(cur);

console.log(`Total pairs extracted: ${pairs.length}`);

// ── 4. Assign pairs to sections/subcategories (10 per subcategory) ────
const rows = [];
const TOTAL_PER_SUBCAT = 10;

for (const sec of sections) {
  let pairIdx = 0;
  for (const sub of sec.subs) {
    for (let i = 0; i < TOTAL_PER_SUBCAT; i++) {
      if (pairIdx >= pairs.length) break;
      const p = pairs[pairIdx++];
      rows.push({
        lecture: sec.lecture,
        category: sec.category,
        subcategory: sub,
        promptNo: i + 1,
        prompt: p.prompt,
        note: p.note,
      });
    }
  }
}

console.log(`Total rows generated: ${rows.length}`);
const lecCounts = {};
rows.forEach(r => { lecCounts[r.lecture] = (lecCounts[r.lecture] || 0) + 1; });
Object.entries(lecCounts).sort((a,b)=>+a[0]-+b[0]).forEach(([l,n]) => console.log(`  Lecture ${l}: ${n}`));

// ── 5. Read existing Excel ────────────────────────────────────────────
const wb = XLSX.readFile('C:/Users/admin/Desktop/section_16_genai_logistics_prompts.xlsx');
const ws = wb.Sheets['Prompts'];
const existing = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log(`\nExisting Excel rows (incl. header): ${existing.length}`);
const existingPrompts = new Set(existing.slice(1).map(r => r[4]));
const newRows = rows.filter(r => !existingPrompts.has(r.prompt));
console.log(`New rows after dedup: ${newRows.length} (filtered ${rows.length - newRows.length} duplicates)`);

// ── 6. Write back ─────────────────────────────────────────────────────
const header = existing[0];
const combined = [
  header,
  ...existing.slice(1),
  ...newRows.map(r => [r.lecture, r.category, r.subcategory, r.promptNo, r.prompt, r.note])
];

const newWs = XLSX.utils.aoa_to_sheet(combined);
newWs['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 40 }, { wch: 10 }, { wch: 85 }, { wch: 65 }];
wb.Sheets['Prompts'] = newWs;
const outPath = 'C:/Users/admin/Desktop/section_16_genai_logistics_prompts_v2.xlsx';
XLSX.writeFile(wb, outPath);
console.log(`\nWritten to: ${outPath}`);
console.log('(If the original is locked by Excel, rename this file manually)');

console.log(`\nFinal: ${combined.length - 1} data rows (${existing.length - 1} original + ${newRows.length} new)`);
