/* Planet Motors – Combined Scripts */
/* Auto-extracted from index.html */

function escHtml(s){
  return String(s==null?'':s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

window.vdp2SwitchTab = function(tabId, clickedEl) {
  // Hide all tab contents
  document.querySelectorAll('.vdp2-tab-content').forEach(function(el){el.classList.remove('active');});
  // Show selected
  var target = document.getElementById('vdp2tab-' + tabId);
  if(target) target.classList.add('active');
  // Update tab active state
  document.querySelectorAll('.vdp2-tab').forEach(function(el){el.classList.remove('active');});
  if(clickedEl) clickedEl.classList.add('active');
  // Scroll to top of VDP left area
  document.querySelector('.vdp2-left').scrollIntoView({behavior:'smooth',block:'nearest'});
};

// Keep backward compatibility with switchVdpTab used elsewhere
window.switchVdpTab = function(tabId, el) {
  var map = {photos:'photos',overview:'overview','features':'features',history:'history',price:'price',ratings:'ratings',protection:'protection'};
  vdp2SwitchTab(map[tabId]||tabId, el);
};

// (card sync handled inside openVdp in main JS)

/* ── VDP expandable sections (features / specs / packages) ── */
function toggleVdpSection(sectionId, btnId, labelCollapsed, labelExpanded) {
  var section = document.getElementById(sectionId);
  var btn = document.getElementById(btnId);
  if (!section) return;
  var isHidden = section.style.display === 'none';
  section.style.display = isHidden ? 'block' : 'none';
  if (btn) btn.textContent = isHidden ? labelExpanded : labelCollapsed;
}

// ──────────────────────────────────────────────────────────────────

// ============================================================
// INVENTORY DATA - All 31 vehicles
// ============================================================
const INVENTORY = [
  {id:1,year:2021,make:'Jeep',model:'Wrangler 4xe',trim:'Unlimited Sahara',price:36200,km:60950,biweekly:255,fuel:'hybrid',body:'SUV',color:'Sarge Green',badges:['HYBRID'],img:'https://images.carpages.ca/inventory/13498070.788832287?w=640&h=480&q=75&s=bfd30b3d84de15595a20099aed7c8e2a',vin:'1C4JJXP6XMW777325',stock:'PM73254025',vdp:'https://dev.planetmotors.ca/inventory/used/jeep/wrangler-4xe/2021-jeep-wrangler-4xe-13498070',description:'2021 Jeep Wrangler 4xe Unlimited Sahara · Sarge Green · 60,950km'},
  {id:2,year:2025,make:'Tesla',model:'Model 3',trim:'Premium',price:53900,km:45895,biweekly:375,fuel:'electric',body:'Sedan',color:'Stealth Grey',badges:['EV', '2024+'],img:'https://images.carpages.ca/inventory/13705661',vin:'5YJ3E1EB6SF922646',stock:'PE26464022',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2025-tesla-model-3-13705661',description:'2025 Tesla Model 3 Premium · Stealth Grey · 45,895km'},
  {id:3,year:2024,make:'Tesla',model:'Model Y',trim:'Long Range',price:51250,km:39895,biweekly:360,fuel:'electric',body:'SUV',color:'Solid Black',badges:['EV', '2024+', 'LOW KM'],img:'https://images.carpages.ca/inventory/13705658',vin:'7SAYGDEE1RF053088',stock:'PE30884025',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-y/2024-tesla-model-y-13705658',description:'2024 Tesla Model Y Long Range · Solid Black · 39,895km'},
  {id:4,year:2022,make:'Tesla',model:'Model Y',trim:'Performance',price:44500,km:37950,biweekly:310,fuel:'electric',body:'SUV',color:'Solid Black',badges:['EV', 'PERFORMANCE'],img:'https://images.carpages.ca/inventory/13695737',vin:'7SAYGDEF9NF308752',stock:'PE87524015',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-y/2022-tesla-model-y-13695737',description:'2022 Tesla Model Y Performance · Solid Black · 37,950km'},
  {id:5,year:2025,make:'Tesla',model:'Model 3',trim:'Premium',price:49500,km:57850,biweekly:345,fuel:'electric',body:'Sedan',color:'Deep Blue Metallic',badges:['EV', '2024+'],img:'https://images.carpages.ca/inventory/13695731',vin:'5YJ3E1EB8SF894252',stock:'PE42524021',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2025-tesla-model-3-13695731',description:'2025 Tesla Model 3 Premium · Deep Blue Metallic · 57,850km'},
  {id:6,year:2023,make:'Tesla',model:'Model Y',trim:'Long Range',price:46900,km:44985,biweekly:330,fuel:'electric',body:'SUV',color:'Solid Black',badges:['EV'],img:'https://images.carpages.ca/inventory/13695743',vin:'7SAYGDEE6PF771846',stock:'PE18464017',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-y/2023-tesla-model-y-13695743',description:'2023 Tesla Model Y Long Range · Solid Black · 44,985km'},
  {id:7,year:2024,make:'Tesla',model:'Model 3',trim:'',price:43500,km:15750,biweekly:305,fuel:'electric',body:'Sedan',color:'Stealth Grey',badges:['EV', '2024+', 'LOW KM'],img:'https://images.carpages.ca/inventory/13695740',vin:'LRW3E7FA5RC089290',stock:'PE92904020',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2024-tesla-model-3-13695740',description:'2024 Tesla Model 3 · Stealth Grey · 15,750km'},
  {id:8,year:2023,make:'Tesla',model:'Model 3',trim:'',price:32995,km:24750,biweekly:230,fuel:'electric',body:'Sedan',color:'Midnight Silver Metallic',badges:['EV', 'LOW KM'],img:'https://images.carpages.ca/inventory/13645748.784412831?w=640&h=480&q=75&oid=32760.87&s=0cad87ad427fbbd9a46c8c3c462cf5ad',vin:'5YJ3E1EAXPF681818',stock:'PE18184014',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2023-tesla-model-3-13645748',description:'2023 Tesla Model 3 · Midnight Silver Metallic · 24,750km'},
  {id:9,year:2022,make:'Tesla',model:'Model 3',trim:'Performance',price:33900,km:91850,biweekly:235,fuel:'electric',body:'Sedan',color:'Pearl White Multi-Coat',badges:['EV', 'PERFORMANCE'],img:'https://images.carpages.ca/inventory/13609091.782834564?w=640&h=480&q=75&s=a3c1716c8f3d1f2a7dbd4ea1bdf2f461',vin:'5YJ3E1EC6NF183078',stock:'PE30784010',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2022-tesla-model-3-13609091',description:'2022 Tesla Model 3 Performance · Pearl White Multi-Coat · 91,850km'},
  {id:10,year:2020,make:'Tesla',model:'Model 3',trim:'Standard Range Plus',price:18000,km:147500,biweekly:125,fuel:'electric',body:'Sedan',color:'Solid Black',badges:['EV'],img:'https://images.carpages.ca/inventory/13612685.783030566?w=640&h=480&q=75&s=b2bfa156d8e0f7a4625e88af65fa640f',vin:'5YJ3E1EA7LF642341',stock:'PE23414013',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2020-tesla-model-3-13612685',description:'2020 Tesla Model 3 Standard Range Plus · Solid Black · 147,500km'},
  {id:11,year:2022,make:'Tesla',model:'Model S',trim:'Plaid',price:89950,km:35950,biweekly:630,fuel:'electric',body:'Sedan',color:'Midnight Silver Metallic',badges:['EV', 'PERFORMANCE', 'PREMIUM'],img:'https://images.carpages.ca/inventory/13607230',vin:'5YJSA1E64NF476477',stock:'PE64774011',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-s/2022-tesla-model-s-13607230',description:'2022 Tesla Model S Plaid · Midnight Silver Metallic · 35,950km'},
  {id:12,year:2025,make:'Chevrolet',model:'Equinox EV',trim:'RS',price:44200,km:12775,biweekly:310,fuel:'electric',body:'SUV',color:'Iridescent Pearl Tricoat',badges:['EV', '2024+', 'LOW KM'],img:'https://images.carpages.ca/inventory/13594670',vin:'3GN7DSRR5SS127703',stock:'PE77034007',vdp:'https://dev.planetmotors.ca/inventory/used/chevrolet/equinox-ev/2025-chevrolet-equinox-ev-13594670',description:'2025 Chevrolet Equinox EV RS · Iridescent Pearl Tricoat · 12,775km'},
  {id:13,year:2022,make:'Kia',model:'Soul EV',trim:'EV Limited',price:22750,km:35950,biweekly:160,fuel:'electric',body:'SUV',color:'Neptune Blue',badges:['EV'],img:'https://images.carpages.ca/inventory/13590317.781710002?w=640&h=480&q=75&s=b949f246f6a06a7e1c07d404863bf4b0',vin:'KNDJ33A12N7025940',stock:'PE59404003',vdp:'https://dev.planetmotors.ca/inventory/used/kia/soul-ev/2022-kia-soul-ev-13590317',description:'2022 Kia Soul EV EV Limited · Neptune Blue · 35,950km'},
  {id:14,year:2023,make:'Tesla',model:'Model 3',trim:'Long Range',price:36375,km:58500,biweekly:255,fuel:'electric',body:'Sedan',color:'Pearl White Multi-Coat',badges:['EV'],img:'https://images.carpages.ca/inventory/13590743.783048641?w=640&h=480&q=75&s=ae8591ec47b683a69488331a6c2362db',vin:'LRW3E1EBXPC876367',stock:'PE63674006',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2023-tesla-model-3-13590743',description:'2023 Tesla Model 3 Long Range · Pearl White Multi-Coat · 58,500km'},
  {id:15,year:2023,make:'Tesla',model:'Model 3',trim:'',price:31100,km:41577,biweekly:220,fuel:'electric',body:'Sedan',color:'Pearl White Multi-Coat',badges:['EV'],img:'https://images.carpages.ca/inventory/13566092.780874442?w=640&h=480&q=75&s=c8ac6700b18abe71420db104b59770dc',vin:'5YJ3E1EAXPF507456',stock:'PE74563998',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2023-tesla-model-3-13566092',description:'2023 Tesla Model 3 · Pearl White Multi-Coat · 41,577km'},
  {id:16,year:2024,make:'Tesla',model:'Model 3',trim:'',price:38700,km:45850,biweekly:270,fuel:'electric',body:'Sedan',color:'Solid Black',badges:['EV', '2024+'],img:'https://images.carpages.ca/inventory/13566395.782318990?w=640&h=480&q=75&s=7cedd8825e5f34c66114b8b1bf4f1350',vin:'LRW3E7FA8RC262591',stock:'PE25913996',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2024-tesla-model-3-13566395',description:'2024 Tesla Model 3 · Solid Black · 45,850km'},
  {id:17,year:2023,make:'Volkswagen',model:'Taos',trim:'Highline',price:25970,km:63600,biweekly:180,fuel:'gasoline',body:'SUV',color:'Cornflower Blue',badges:[],img:'https://images.carpages.ca/inventory/13566533.782677001?w=640&h=480&q=75&s=5124517a961194a45a08e281a5171849',vin:'3VV4X7B24PM371188',stock:'PM11883997',vdp:'https://dev.planetmotors.ca/inventory/used/volkswagen/taos/2023-volkswagen-taos-13566533',description:'2023 Volkswagen Taos Highline · Cornflower Blue · 63,600km'},
  {id:18,year:2021,make:'Tesla',model:'Model Y',trim:'Standard Range',price:30500,km:72850,biweekly:215,fuel:'electric',body:'SUV',color:'Pearl White Multi-Coat',badges:['EV'],img:'https://images.carpages.ca/inventory/13560197.780021821?w=640&h=480&q=75&s=ad9533e993e1e1a723903daa7f60552a',vin:'5YJYGDED2MF121136',stock:'PE11363994',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-y/2021-tesla-model-y-13560197',description:'2021 Tesla Model Y Standard Range · Pearl White Multi-Coat · 72,850km'},
  {id:19,year:2025,make:'Hyundai',model:'Kona Electric',trim:'Preferred',price:36350,km:15750,biweekly:255,fuel:'electric',body:'SUV',color:'Cyber Grey',badges:['EV', '2024+', 'LOW KM'],img:'https://images.carpages.ca/inventory/13539194.782684999?w=640&h=480&q=75&s=1377e63a1481239f6ab5592546ce4111',vin:'KM8HC3A62SU023138',stock:'PE31383991',vdp:'https://dev.planetmotors.ca/inventory/used/hyundai/kona-electric/2025-hyundai-kona-electric-13539194',description:'2025 Hyundai Kona Electric Preferred · Cyber Grey · 15,750km'},
  {id:20,year:2022,make:'Tesla',model:'Model 3',trim:'Performance',price:39300,km:38525,biweekly:275,fuel:'electric',body:'Sedan',color:'Red Multi-Coat',badges:['EV', 'PERFORMANCE'],img:'https://images.carpages.ca/inventory/13501295.779804999?w=640&h=480&q=75&s=b7bb5cb27a21d57e6d347b977ddb2db9',vin:'5YJ3E1EC5NF234540',stock:'PE45403977',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2022-tesla-model-3-13501295',description:'2022 Tesla Model 3 Performance · Red Multi-Coat · 38,525km'},
  {id:21,year:2018,make:'Volkswagen',model:'Tiguan',trim:'Comfortline',price:17900,km:87895,biweekly:125,fuel:'gasoline',body:'SUV',color:'Platinum Gray Metallic',badges:[],img:'https://images.carpages.ca/inventory/13501298.782663048?w=640&h=480&q=75&s=6e4c6d1603f92ba4f799ad6b2f338241',vin:'3VV2B7AX2JM008723',stock:'PM87233979',vdp:'https://dev.planetmotors.ca/inventory/used/volkswagen/tiguan/2018-volkswagen-tiguan-13501298',description:'2018 Volkswagen Tiguan Comfortline · Platinum Gray Metallic · 87,895km'},
  {id:22,year:2024,make:'Tesla',model:'Model 3',trim:'',price:37050,km:70500,biweekly:260,fuel:'electric',body:'Sedan',color:'Pearl White Multi-Coat',badges:['EV', '2024+'],img:'https://images.carpages.ca/inventory/13470853.777782934?w=640&h=480&q=75&s=2629f8b428ce57d1fe5b389eac66fd42',vin:'LRW3E7FAXRC093951',stock:'PE39513961',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2024-tesla-model-3-13470853',description:'2024 Tesla Model 3 · Pearl White Multi-Coat · 70,500km'},
  {id:23,year:2021,make:'Tesla',model:'Model 3',trim:'Standard Range Plus',price:25600,km:60959,biweekly:180,fuel:'electric',body:'Sedan',color:'Deep Blue Metallic',badges:['EV'],img:'https://images.carpages.ca/inventory/13466886.779745992?w=640&h=480&q=75&s=7d52182a1792afc73f53c467d45571bd',vin:'5YJ3E1EA9MF973939',stock:'PE39393963',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2021-tesla-model-3-13466886',description:'2021 Tesla Model 3 Standard Range Plus · Deep Blue Metallic · 60,959km'},
  {id:24,year:2022,make:'Tesla',model:'Model Y',trim:'Long Range',price:35700,km:95575,biweekly:250,fuel:'electric',body:'SUV',color:'Pearl White Multi-Coat',badges:['EV'],img:'https://images.carpages.ca/inventory/13437834.786836250?w=640&h=480&q=75&s=5b807336f6f76b972fd0ecd55ab594d2',vin:'7SAYGDEE7NF449780',stock:'PE97803964',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-y/2022-tesla-model-y-13437834',description:'2022 Tesla Model Y Long Range · Pearl White Multi-Coat · 95,575km'},
  {id:25,year:2021,make:'Tesla',model:'Model 3',trim:'Standard Range Plus',price:25550,km:60775,biweekly:180,fuel:'electric',body:'Sedan',color:'Midnight Silver Metallic',badges:['EV'],img:'https://images.carpages.ca/inventory/13437837.780827666?w=640&h=480&q=75&s=aca79e20f6ee1d57bc0224ed21f36d6b',vin:'5YJ3E1EA3MF848712',stock:'PE87123965',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2021-tesla-model-3-13437837',description:'2021 Tesla Model 3 Standard Range Plus · Midnight Silver Metallic · 60,775km'},
  {id:26,year:2022,make:'Tesla',model:'Model Y',trim:'Long Range',price:33895,km:108685,biweekly:235,fuel:'electric',body:'SUV',color:'Pearl White Multi-Coat',badges:['EV'],img:'https://images.carpages.ca/inventory/13287776.777782764?w=640&h=480&q=75&s=259df11263ee7c90c1cc7e4121687363',vin:'7SAYGDEE3NF371580',stock:'PE15803948',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-y/2022-tesla-model-y-13287776',description:'2022 Tesla Model Y Long Range · Pearl White Multi-Coat · 108,685km'},
  {id:27,year:2024,make:'Tesla',model:'Model Y',trim:'',price:41500,km:28575,biweekly:290,fuel:'electric',body:'SUV',color:'Stealth Grey',badges:['EV', '2024+', 'LOW KM'],img:'https://images.carpages.ca/inventory/13287755',vin:'LRWYGDFD2RC640445',stock:'PE04453953',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-y/2024-tesla-model-y-13287755',description:'2024 Tesla Model Y · Stealth Grey · 28,575km'},
  {id:28,year:2019,make:'Tesla',model:'Model 3',trim:'Standard Range Plus',price:19875,km:101850,biweekly:140,fuel:'electric',body:'Sedan',color:'Solid Black',badges:['EV'],img:'https://images.carpages.ca/inventory/13204466.777782742?w=640&h=480&q=75&s=af0ff5932ea8e596dcfa045c6699aa4f',vin:'5YJ3E1EA7KF321382',stock:'PM13823944',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2019-tesla-model-3-13204466',description:'2019 Tesla Model 3 Standard Range Plus · Solid Black · 101,850km'},
  {id:29,year:2020,make:'Tesla',model:'Model 3',trim:'Standard Range Plus',price:21250,km:102500,biweekly:150,fuel:'electric',body:'Sedan',color:'Deep Blue Metallic',badges:['EV'],img:'https://images.carpages.ca/inventory/13133429.777782778?w=640&h=480&q=75&s=b2ffc414f0693e106d6599c5317e10dd',vin:'5YJ3E1EA4LF642619',stock:'PE26193923',vdp:'https://dev.planetmotors.ca/inventory/used/tesla/model-3/2020-tesla-model-3-13133429',description:'2020 Tesla Model 3 Standard Range Plus · Deep Blue Metallic · 102,500km'},
  {id:30,year:2018,make:'Audi',model:'Q3',trim:'Technik',price:19250,km:82950,biweekly:135,fuel:'gasoline',body:'SUV',color:'Glacier White Metallic',badges:[],img:'https://images.carpages.ca/inventory/13133426.777782762?w=640&h=480&q=75&s=473f7f8921abdd59190e0a1d86a45086',vin:'WA1GCCFS9JR009139',stock:'PM91393926',vdp:'https://dev.planetmotors.ca/inventory/used/audi/q3/2018-audi-q3-13133426',description:'2018 Audi Q3 Technik · Glacier White Metallic · 82,950km'},
];

// Expose INVENTORY on window so ES module scripts (firebase-auth.js) can access it
window.INVENTORY = INVENTORY;

// ============================================================
// STATE
// ============================================================
let currentPage = 'home';
let filteredInventory = [...INVENTORY];
let currentInvPage = 1;
const ITEMS_PER_PAGE = 9;
let homeFilter = 'all';
window.selectedVehicle = null;

// ============================================================
// PAGE ROUTING
// ============================================================
function showPage(page) {
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
    p.style.display = '';
  });
  var target = document.getElementById('page-' + page);
  if (!target) { console.error('showPage: page not found:', page); return; }
  target.classList.add('active');
  target.style.display = 'block';
  currentPage = page;
  window.scrollTo({top:0,behavior:'smooth'});
  if (page === 'inventory') renderInventory();
  if (page === 'home') renderHomeInventory();
  if (page === 'finance') { if(typeof updateCalc === 'function') updateCalc(); }
  if (page === 'carvalue') { if(typeof cvcUpdate === 'function') cvcUpdate(); }
}

function filterAndGo(filter) {
  homeFilter = filter;
  // Clear all previous filters before applying the new category to prevent
  // stale filter state when switching between tabs (e.g. Tesla -> Electric Vehicles)
  ['f-make','f-body','f-fuel','f-model'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  ['f-minprice','f-maxprice','f-minkm','f-maxkm','f-minyear','f-maxyear'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  const searchEl = document.getElementById('invSearch'); if (searchEl) searchEl.value = '';
  showPage('inventory');
  if (filter === 'ev') { document.getElementById('f-fuel').value = 'electric'; }
  else if (filter === 'tesla') { document.getElementById('f-make').value = 'Tesla'; }
  else if (filter === 'suv') { document.getElementById('f-body').value = 'suv'; }
  applyFilters();
}

function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// ============================================================
// VEHICLE CARD RENDERER
// ============================================================
function createCard(v, size='normal') {
  const hasBanner = true;
  const isEV = v.fuel === 'electric';
  const isHybrid = v.fuel === 'hybrid';
  const fuelIcon = isEV ? '⚡' : isHybrid ? '🔌' : '⛽';
  const noAcc = v.badges.includes('no-accident');
  const oneOwner = v.badges.includes('one-owner');
  
  const eYear = escHtml(v.year), eMake = escHtml(v.make), eModel = escHtml(v.model);
  const eTrim = escHtml(v.trim), eColor = escHtml(v.color), eImg = escHtml(v.img);
  const eFuel = escHtml(v.fuel.charAt(0).toUpperCase()+v.fuel.slice(1));
  const id = Number(v.id);
  return `
  <div class="vehicle-card" onclick="openVdp(${id})">
    <div class="vehicle-card-img">
      <div class="card-banner">Shop Online Nationwide. PlanetMotors.app · 1-866-797-3332</div>
      <img src="${eImg}" alt="${eYear} ${eMake} ${eModel}${v.trim?' '+eTrim:''} ${eColor} for sale in Richmond Hill, ON" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80'">
      <div class="card-badge">
        ${noAcc ? '<span class="badge green">✓ No Accident</span>' : ''}
        ${oneOwner ? '<span class="badge blue">✓ One Owner</span>' : ''}
        ${isEV ? '<span class="badge green">⚡ EV</span>' : ''}
      </div>
      <div class="card-heart" data-vid="${id}" onclick="event.stopPropagation();toggleSaveVehicleCard(${id},this)" title="Save vehicle" aria-label="Save ${eYear} ${eMake} ${eModel}">♡</div>
      <div class="inv-compare-check" onclick="event.stopPropagation()">
        <input type="checkbox" id="cmp-${id}" onchange="toggleCompare(${id})" aria-label="Add to compare">
        <label for="cmp-${id}">Compare</label>
      </div>
    </div>
    <div class="vehicle-card-body">
      <div class="vehicle-year-make">${eYear} ${eMake} ${eModel}</div>
      <div class="vehicle-trim">${eTrim.toUpperCase()}</div>
      <div class="vehicle-meta">
        <span>📏 ${v.km.toLocaleString()} km</span>
        <span>${fuelIcon} ${eFuel}</span>
      </div>
      <div class="vehicle-price-block">
        <div>
          <div class="vehicle-price">$${v.price.toLocaleString()}</div>
          <div class="vehicle-price-suffix">+ tax &amp; lic</div>
        </div>
        <div class="vehicle-biweekly">
          <strong>$${v.biweekly}/biweekly</strong>
          <span>$0 down · OAC</span>
        </div>
      </div>
      <div class="carfax-row">
        <div class="carfax-logo">CARFAX</div>
        <div class="carfax-badges">
          ${noAcc ? '<span class="no-accident">No Reported Accidents</span>' : ''}
          ${oneOwner ? '<span class="one-owner">One Owner</span>' : ''}
        </div>
      </div>
      <div class="learn-more-btn">Learn More →</div>
    </div>
  </div>`;
}

// ============================================================
// HOME INVENTORY (6 featured)
// ============================================================
function renderHomeInventory() {
  const grid = document.getElementById('homeInventoryGrid');
  if (!grid) return;
  let veh = [...INVENTORY];
  if (homeFilter === 'ev') veh = veh.filter(v => v.fuel === 'electric');
  else if (homeFilter === 'tesla') veh = veh.filter(v => v.make === 'Tesla');
  else if (homeFilter === 'under30') veh = veh.filter(v => v.price < 30000);
  else if (homeFilter === 'suv') veh = veh.filter(v => v.body === 'suv');
  const perPage = 6;
  const maxPage = Math.max(0, Math.ceil(veh.length / perPage) - 1);
  if (homePage > maxPage) homePage = maxPage;
  const slice = veh.slice(homePage * perPage, (homePage + 1) * perPage);
  grid.innerHTML = slice.map(v => createCard(v)).join('');
  // Dots
  const dots = document.getElementById('homeDots');
  if (dots) {
    const total = Math.ceil(veh.length / perPage);
    dots.innerHTML = Array.from({length: total}, (_,i) =>
      `<span onclick="homePage=${i};renderHomeInventory()" style="width:8px;height:8px;border-radius:50%;background:${i===homePage?'#111':'#ddd'};display:inline-block;cursor:pointer"></span>`
    ).join('');
  }
}

function setQuickFilter(f, el) {
  homeFilter = f;
  document.querySelectorAll('.quick-filter').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  homePage = 0;
  renderHomeInventory();
}

let homePage = 0;
function homeGridNext() { homePage++; renderHomeInventory(); }
function homeGridPrev() { if(homePage>0){homePage--;renderHomeInventory();} }

function switchSellTab(tab) {
  const plateBtn = document.getElementById('plateTabBtn');
  const vinBtn = document.getElementById('vinTabBtn');
  const inp = document.getElementById('plateInput');
  if (!plateBtn || !vinBtn || !inp) return;
  if (tab === 'plate') {
    plateBtn.style.background = '#111'; plateBtn.style.color = '#fff';
    vinBtn.style.background = 'transparent'; vinBtn.style.color = '#555';
    inp.placeholder = 'Licence plate number';
  } else {
    vinBtn.style.background = '#111'; vinBtn.style.color = '#fff';
    plateBtn.style.background = 'transparent'; plateBtn.style.color = '#555';
    inp.placeholder = 'VIN number';
  }
}

function doHeroSearch() {
  const qEl = document.getElementById('heroSearch');
  const q = qEl ? qEl.value : '';
  const invEl = document.getElementById('invSearch');
  if (invEl) invEl.value = q;
  showPage('inventory');
  applyFilters();
}

// ============================================================
// INVENTORY FILTERS + RENDER
// ============================================================
function applyFilters() {
  const search = (document.getElementById('invSearch')?.value || '').toLowerCase();
  const make = document.getElementById('f-make')?.value || '';
  const body = document.getElementById('f-body')?.value || '';
  const fuel = document.getElementById('f-fuel')?.value || '';
  const minP = parseFloat(document.getElementById('f-minprice')?.value) || 0;
  const maxP = parseFloat(document.getElementById('f-maxprice')?.value) || 999999;
  const minK = parseFloat(document.getElementById('f-minkm')?.value) || 0;
  const maxK = parseFloat(document.getElementById('f-maxkm')?.value) || 999999;
  const minY = parseInt(document.getElementById('f-minyear')?.value) || 2000;
  const maxY = parseInt(document.getElementById('f-maxyear')?.value) || 2030;
  const sort = document.getElementById('sortSelect')?.value || 'default';
  
  filteredInventory = INVENTORY.filter(v => {
    const matchSearch = !search || `${v.year} ${v.make} ${v.model} ${v.trim}`.toLowerCase().includes(search);
    const matchMake = !make || v.make === make;
    const matchBody = !body || v.body.toLowerCase() === body.toLowerCase();
    const matchFuel = !fuel || v.fuel.toLowerCase() === (fuel === 'gas' ? 'gasoline' : fuel).toLowerCase();
    const matchPrice = v.price >= minP && v.price <= maxP;
    const matchKm = v.km >= minK && v.km <= maxK;
    const matchYear = v.year >= minY && v.year <= maxY;
    return matchSearch && matchMake && matchBody && matchFuel && matchPrice && matchKm && matchYear;
  });

  if (sort === 'price-asc') filteredInventory.sort((a,b) => a.price-b.price);
  else if (sort === 'price-desc') filteredInventory.sort((a,b) => b.price-a.price);
  else if (sort === 'km-asc') filteredInventory.sort((a,b) => a.km-b.km);
  else if (sort === 'year-desc') filteredInventory.sort((a,b) => b.year-a.year);

  currentInvPage = 1;
  renderInventory();
}

function resetFilters() {
  ['f-make','f-body','f-fuel','f-model'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  ['f-minprice','f-maxprice','f-minkm','f-maxkm','f-minyear','f-maxyear'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  filteredInventory = [...INVENTORY];
  currentInvPage = 1;
  renderInventory();
}

function renderInventory() {
  const grid = document.getElementById('inventoryGrid');
  const countEl = document.getElementById('resultCount');
  const countHead = document.getElementById('resultCountHead');
  if (!grid) return;
  
  const total = filteredInventory.length;
  if (countEl) countEl.textContent = total;
  if (countHead) countHead.textContent = total;
  
  const start = (currentInvPage-1) * ITEMS_PER_PAGE;
  const pageItems = filteredInventory.slice(start, start + ITEMS_PER_PAGE);
  
  // Insert promo cards every 6th spot
  let html = '';
  pageItems.forEach((v, i) => {
    if (i === 2) html += promoCard('finance');
    if (i === 5) html += promoCard('sell');
    html += createCard(v);
  });
  if (pageItems.length === 0) {
    html = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-soft)"><div style="font-size:48px;margin-bottom:12px">🔍</div><h3>No vehicles match your filters</h3><p style="margin-top:8px">Try adjusting your search or <a onclick="resetFilters()" style="color:var(--blue);cursor:pointer;font-weight:600">clear all filters</a></p></div>';
  }
  grid.innerHTML = html;
  renderPagination(total);
  // Re-mark saved hearts after render (firebase-auth.js owns _refreshAllCardHearts)
  if (typeof window._pmRefreshHearts === 'function') window._pmRefreshHearts();
}

function promoCard(type) {
  if (type === 'finance') return `<div class="promo-card"><h3>Get Your Financing Rates &amp; Payments Today</h3><p style="font-size:13px;opacity:.85;margin-bottom:16px">All credit types approved. New to Canada welcome.</p><a onclick="showPage('finance')">Apply Now →</a></div>`;
  return `<div class="promo-card" style="background:linear-gradient(135deg,var(--red),#9b1c1c)"><h3>We Buy &amp; Trade-In Vehicles</h3><p style="font-size:13px;opacity:.85;margin-bottom:16px">Get a fair market offer for your current vehicle.</p><a onclick="showPage('sell')" style="color:var(--red)">Get Offer →</a></div>`;
}

function renderPagination(total) {
  const bar = document.getElementById('paginationBar');
  if (!bar) return;
  const pages = Math.ceil(total / ITEMS_PER_PAGE);
  if (pages <= 1) { bar.innerHTML = ''; return; }
  let html = '';
  if (currentInvPage > 1) html += `<button type="button" class="page-btn" onclick="goPage(${currentInvPage-1})">‹</button>`;
  for (let i=1;i<=pages;i++) {
    html += `<button type="button" class="page-btn ${i===currentInvPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  if (currentInvPage < pages) html += `<button type="button" class="page-btn" onclick="goPage(${currentInvPage+1})">›</button>`;
  bar.innerHTML = html;
}

function goPage(n) {
  currentInvPage = n;
  renderInventory();
  document.getElementById('page-inventory').scrollIntoView({behavior:'smooth',block:'start'});
}

// ============================================================
// VDP
// ============================================================
function openVdp(id) {
  const v = INVENTORY.find(x => x.id === id);
  if (!v) return;
  window.selectedVehicle = v;
  selectedVehicle = v;
  const title = v.year + ' ' + v.make + ' ' + v.model;
  (document.getElementById('vdpTitle')||{textContent:''}).textContent = title;
  (document.getElementById('vdpBreadcrumb')||{textContent:''}).textContent = v.model;
  (document.getElementById('vdpMake')||{textContent:''}).textContent = v.make;
  (document.getElementById('vdpPriceTop')||{textContent:''}).textContent = '$' + v.price.toLocaleString();
  (document.getElementById('vdpBiweeklyTop')||{textContent:''}).textContent = '$' + v.biweekly + '/biweekly';
  (document.getElementById('vdpKmTop')||{textContent:''}).textContent = v.km.toLocaleString() + ' km';
  var priceBoxEl = document.getElementById('vdpPriceBox');
  if (priceBoxEl) priceBoxEl.textContent = '$' + v.price.toLocaleString();
  var biweeklyBoxEl = document.getElementById('vdpBiweeklyBox');
  if (biweeklyBoxEl) biweeklyBoxEl.textContent = '$' + v.biweekly;
  const vinEl = document.getElementById('vdpVin');
  if (vinEl) vinEl.textContent = v.vin || '—';
  const stockEl = document.getElementById('vdpStock');
  if (stockEl) stockEl.textContent = v.stock || '—';
  const listingEl = document.getElementById('vdpFullListing');
  if (listingEl && v.vdp) listingEl.href = v.vdp;
  const fuelLabel = v.fuel === 'electric' ? 'Electric' : v.fuel === 'hybrid' ? 'PHEV' : 'Gasoline';
  (document.getElementById('ov-fuel')||{textContent:''}).textContent = fuelLabel;
  (document.getElementById('ov-trans')||{textContent:''}).textContent = 'Automatic ' + (v.body==='suv'?'AWD':'RWD');
  (document.getElementById('ov-engine')||{textContent:''}).textContent = v.fuel === 'electric' ? 'Dual Motor' : v.fuel === 'hybrid' ? '2.0L PHEV' : '4-Cyl';
  (document.getElementById('ov-seats')||{textContent:''}).textContent = '5 seats';
  const svRange = document.getElementById('sv-range');
  const svExt = document.getElementById('sv-ext');
  const svInt = document.getElementById('sv-int');
  const svDrive = document.getElementById('sv-drive');
  if (svRange) svRange.textContent = v.fuel === 'electric' ? '358 km (EPA)' : v.fuel === 'hybrid' ? '35 km electric' : '—';
  if (svExt) svExt.textContent = v.color || 'Silver';
  if (svInt) svInt.textContent = 'Black';
  if (svDrive) svDrive.textContent = v.body === 'suv' ? 'AWD' : 'RWD';
  var svMotor = document.getElementById('sv-motor');
  if (svMotor) svMotor.textContent = v.fuel === 'electric' ? 'Dual Electric Motor' : v.fuel === 'hybrid' ? '2.0L + Electric Motor' : '2.5L 4-Cylinder';
  var svCargo = document.getElementById('sv-cargo');
  if (svCargo) svCargo.textContent = v.body === 'suv' || v.body === 'SUV' ? '1,868' : '425';
  var svWheels = document.getElementById('sv-wheels');
  if (svWheels) svWheels.textContent = v.fuel === 'electric' ? '18" Aero Wheels' : '17" Alloy Wheels';
  var svStock2 = document.getElementById('sv-stock2');
  if (svStock2) svStock2.textContent = v.stock || '—';
  // Reset expandable sections when opening a new VDP
  ['vdpFeatExtra','vdpSpecExtra','vdpPkgFeatures'].forEach(function(sId) {
    var el = document.getElementById(sId); if (el) el.style.display = 'none';
  });
  var featBtn = document.getElementById('vdpFeatToggleBtn'); if (featBtn) featBtn.innerHTML = 'View all features <span>\u203a</span>';
  var specBtn = document.getElementById('vdpSpecToggleBtn'); if (specBtn) specBtn.innerHTML = 'View all specs <span>\u203a</span>';
  var pkgBtn = document.getElementById('vdpPkgToggleBtn'); if (pkgBtn) pkgBtn.textContent = '3 features \u203a';
  // Update package features based on vehicle type
  var isElectric = v.fuel === 'electric';
  var pkgF1 = document.getElementById('pkg-feat-1'); if (pkgF1) pkgF1.textContent = isElectric ? 'Navigate on Autopilot' : 'Heated Steering Wheel';
  var pkgF2 = document.getElementById('pkg-feat-2'); if (pkgF2) pkgF2.textContent = isElectric ? 'Auto Lane Change' : 'Remote Start';
  var pkgF3 = document.getElementById('pkg-feat-3'); if (pkgF3) pkgF3.textContent = isElectric ? 'Autopark' : 'Panoramic Sunroof';
  const pkgEl = document.getElementById('vdpPkgName');
  if (pkgEl) pkgEl.textContent = v.fuel === 'electric' ? 'Enhanced Autopilot Package' : 'Premium Package';
  const ratingEl = document.getElementById('vdpRatingDesc');
  if (ratingEl) {
    var ratingDesc;
    if (v.fuel === 'electric') {
      ratingDesc = 'The ' + v.year + ' ' + v.make + ' ' + v.model + ' offers strong electric performance, solid real-world range, and a well-equipped interior. A great choice for Canadian drivers looking for zero-emission driving done right.';
    } else if (v.fuel === 'hybrid') {
      ratingDesc = 'The ' + v.year + ' ' + v.make + ' ' + v.model + ' combines the efficiency of electric driving with the flexibility of a gasoline engine. Perfect for Canadian drivers looking to reduce fuel costs without range anxiety.';
    } else {
      ratingDesc = 'The ' + v.year + ' ' + v.make + ' ' + v.model + ' delivers a solid balance of reliability, comfort, and value. A dependable choice for Canadian drivers who want a well-rounded vehicle at a fair price.';
    }
    ratingEl.textContent = ratingDesc;
  }
  var mainImgEl = document.getElementById('vdpMainImg');
  mainImgEl.src = v.img;
  mainImgEl.alt = 'Front exterior view of ' + v.color + ' ' + v.year + ' ' + v.make + ' ' + v.model + (v.trim?' '+v.trim:'') + ' for sale in Richmond Hill, ON';
  const thumbContainer = document.getElementById('vdpThumbs');
  if (thumbContainer) {
    // Build thumbnail array - use main img + alternate angle queries
    var thumbUrls = [v.img];
    // Add secondary angles using Unsplash car interior/exterior shots as supplements
    var angles = [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=280&q=70&auto=format',
      'https://images.unsplash.com/photo-1551830820-330a71b99659?w=400&h=280&q=70&auto=format',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=280&q=70&auto=format'
    ];
    thumbUrls = thumbUrls.concat(angles);
    var vName = escHtml(v.year) + ' ' + escHtml(v.make) + ' ' + escHtml(v.model) + (v.trim ? ' ' + escHtml(v.trim) : '');
    var viewLabels = ['Front exterior', 'Side exterior', 'Interior cabin', 'Detail view'];
    thumbContainer.innerHTML = thumbUrls.map(function(url,i) {
      var altText = viewLabels[i] + ' view of ' + escHtml(v.color) + ' ' + vName + ' for sale in Richmond Hill';
      return '<div class="vdp-thumb ' + (i===0?'active':'') + '" onclick="changeThumb(this,\'' + escHtml(url) + '\')" title="' + viewLabels[i] + '"><img src="' + escHtml(url) + '" loading="lazy" alt="' + altText + '"></div>';
    }).join('');
  }
  const similar = INVENTORY.filter(x => x.id !== id && (x.make === v.make || x.fuel === v.fuel)).slice(0,3);
  const sg = document.getElementById('vdpSimilarGrid');
  if (sg) {
    if (similar.length) {
      sg.innerHTML = similar.map(s =>
        '<div class="inv-card" onclick="openVdp(' + s.id + ')" style="cursor:pointer">' +
        '<div class="inv-card-img"><img src="' + escHtml(s.img) + '" alt="' + escHtml(s.year) + ' ' + escHtml(s.make) + ' ' + escHtml(s.model) + (s.trim?' '+escHtml(s.trim):'') + ' for sale in Richmond Hill, ON" loading="lazy"></div>' +
        '<div class="inv-card-body">' +
        '<div class="inv-card-title">' + escHtml(s.year) + ' ' + escHtml(s.make) + ' ' + escHtml(s.model) + '</div>' +
        '<div class="inv-card-meta">' + escHtml(s.trim) + ' \u2022 ' + s.km.toLocaleString() + ' km</div>' +
        '<div class="inv-card-price">$' + s.price.toLocaleString() + '</div>' +
        '<div class="inv-card-bw">$' + escHtml(s.biweekly) + '/biweekly \u00b7 $0 down</div>' +
        '</div></div>'
      ).join('');
    } else {
      sg.innerHTML = '<p style="color:var(--text-soft);font-size:14px">No similar vehicles found.</p>';
    }
  }
  // Update elements missing from original openVdp
  var trimEl = document.getElementById('vdpTrim');
  if (trimEl) trimEl.textContent = v.trim || '';
  var cardTitleEl = document.getElementById('vdpCardTitle');
  if (cardTitleEl) cardTitleEl.textContent = v.year + ' ' + v.make + ' ' + v.model;
  var cardMetaEl = document.getElementById('vdpCardMeta');
  if (cardMetaEl) cardMetaEl.textContent = (v.trim || '') + ' · ' + v.km.toLocaleString() + ' km';
  var cardWasEl = document.getElementById('vdpCardWas');
  if (cardWasEl) {
    if (v.was) {
      cardWasEl.textContent = 'Was $' + Number(v.was).toLocaleString();
      cardWasEl.style.display = 'block';
      var pdEl = document.getElementById('vdp2PriceDrop');
      if (pdEl) pdEl.style.display = 'block';
    } else {
      cardWasEl.style.display = 'none';
    }
  }
  var mileEl = document.getElementById('vdpMileageHighlight');
  if (mileEl) mileEl.textContent = v.km.toLocaleString() + ' km';
  var specRangeEl = document.getElementById('vdpSpecRange');
  if (specRangeEl) specRangeEl.textContent = v.fuel === 'electric' ? '358 km range' : v.fuel === 'hybrid' ? '35 km EV' : '—';
  // Pricing tab — populate Planet Motors price details
  var hst = Math.round(v.price * 0.13 / 10) * 10;
  var total = v.price + hst + 22 + 595; // + OMVIC $22 + Certification $595
  var fmt = function(n){ return '$' + Number(n).toLocaleString('en-CA'); };
  ['vdpPriceMonthly2','vdpPriceOnce2','vdpLineVehicle'].forEach(function(id){
    var el = document.getElementById(id);
    if(el){ if(id==='vdpPriceMonthly2') el.textContent = fmt(v.biweekly); else el.textContent = fmt(v.price); }
  });
  var hstEl = document.getElementById('vdpLineHST');
  if(hstEl) hstEl.textContent = fmt(hst);
  var totalEl = document.getElementById('vdpLineTotal');
  if(totalEl) totalEl.textContent = fmt(total);
  // Reset tabs - fix: use correct .vdp2-tab class
  if (typeof vdp2SwitchTab === 'function') {
    vdp2SwitchTab('photos', document.querySelector('.vdp2-tab'));
  }
  showPage('vdp');
}

function changeThumb(el, url) {
  document.querySelectorAll('.vdp-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('vdpMainImg').src = url;
}

function switchExtInt(mode) {
  const extBtn = document.getElementById('extBtn');
  const intBtn = document.getElementById('intBtn');
  if (extBtn) extBtn.classList.toggle('active', mode === 'ext');
  if (intBtn) intBtn.classList.toggle('active', mode === 'int');
}

function scrollThumbs(dir) {
  const container = document.getElementById('vdpThumbs');
  if (container) container.scrollBy({left: dir * 140, behavior: 'smooth'});
}

function switchVdpTab(tab, el) {
  document.querySelectorAll('.vdp-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.vdp-tab-content').forEach(c => c.style.display = 'none');
  if (el) el.classList.add('active');
  else { const tabs = document.querySelectorAll('.vdp-tab'); if(tabs[0]) tabs[0].classList.add('active'); }
  const tabEl = document.getElementById('vtab-' + tab);
  if (tabEl) tabEl.style.display = 'block';
}

// ============================================================
// FINANCE CALCULATOR
// ============================================================
function updateCalc() {
  var cpEl = document.getElementById('calcPrice');
  if (!cpEl) return;
  const price = parseInt(cpEl.value);
  const down = parseInt(document.getElementById('calcDown').value);
  const trade = parseInt(document.getElementById('calcTrade').value);
  const termMonths = parseInt(document.getElementById('calcTerm').value);
  const rate = parseFloat(document.getElementById('calcRate').value);
  
  document.getElementById('calcPriceVal').textContent = '$' + price.toLocaleString();
  document.getElementById('calcDownVal').textContent = '$' + down.toLocaleString();
  document.getElementById('calcTradeVal').textContent = '$' + trade.toLocaleString();
  document.getElementById('calcTermVal').textContent = termMonths + ' months';
  document.getElementById('calcRateVal').textContent = rate.toFixed(2) + '%';
  
  const hst = price * 0.13;
  const financed = price + hst - down - trade;
  const annualRate = rate / 100;
  const biweeklyRate = annualRate / 26;
  const numPayments = termMonths / 12 * 26;
  const biweekly = financed > 0 ? financed * biweeklyRate / (1 - Math.pow(1 + biweeklyRate, -numPayments)) : 0;
  
  document.getElementById('cbPrice').textContent = '$' + price.toLocaleString();
  document.getElementById('cbDown').textContent = '-$' + down.toLocaleString();
  document.getElementById('cbTrade').textContent = '-$' + trade.toLocaleString();
  document.getElementById('cbHst').textContent = '$' + Math.round(hst).toLocaleString();
  document.getElementById('cbFinanced').textContent = '$' + Math.round(financed).toLocaleString();
  document.getElementById('cbRate').textContent = rate.toFixed(2) + '%';
  document.getElementById('cbTerm').textContent = termMonths + ' months';
  const bwFormatted = '$' + Math.round(biweekly).toLocaleString();
  document.getElementById('cbPayment').textContent = bwFormatted;
  document.getElementById('calcResult').textContent = Math.round(biweekly).toLocaleString();
}

// ============================================================
// NOTIFICATION
// ============================================================
function showNotification(msg) {
  const n = document.getElementById('notification');
  n.textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3500);
}

// ============================================================
// LOGO LOADING
// ============================================================
function loadLogo() {
  const url = "/planet-motors-logo.png";
  ['navLogo','footerLogo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.src = url; el.style.height = id === 'footerLogo' ? '52px' : '48px'; }
  });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  loadLogo();
  renderHomeInventory();
  updateCalc();
  // Try to load actual logo
  const img = new Image();
  img.onload = function() {
    ['navLogo','footerLogo'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.src = this.src;
    });
  };
  // Logo already set via navLogo src attribute
});

// ── CAR VALUE CALCULATOR ──────────────────────────────────
window.cvcUpdate = function() {
  var year = document.getElementById('cvcYear') && document.getElementById('cvcYear').value;
  var make = document.getElementById('cvcMake') && document.getElementById('cvcMake').value.trim();
  var model = document.getElementById('cvcModel') && document.getElementById('cvcModel').value.trim();
  var km = document.getElementById('cvcKm') && document.getElementById('cvcKm').value;
  var btn = document.getElementById('cvcBtn');
  if (btn) btn.disabled = !(year && make && model && km);
  // Hide result when inputs change
  var res = document.getElementById('cvcResult');
  if (res) res.style.display = 'none';
};

window.cvcCalculate = function() {
  var year = document.getElementById('cvcYear') ? parseInt(document.getElementById('cvcYear').value) : 0;
  var make = document.getElementById('cvcMake') ? document.getElementById('cvcMake').value.trim() : '';
  var model = document.getElementById('cvcModel') ? document.getElementById('cvcModel').value.trim() : '';
  var km = document.getElementById('cvcKm') ? parseInt(document.getElementById('cvcKm').value) || 0 : 0;
  if (!year || !make || !model) { showNotification('Please fill in Year, Make, and Model first.'); return; }

  var btn = document.getElementById('cvcBtn');
  if (btn) { btn.textContent = 'Calculating…'; btn.disabled = true; }

  setTimeout(function() {
    // Estimated value based on age + km
    var age = 2026 - year;
    var baseVal = 45000;
    var ageFactor = Math.pow(0.88, age); // ~12% depreciation/yr
    var kmPenalty = Math.max(0, (km - 15000 * age) / 10000) * 400;
    var est = Math.round((baseVal * ageFactor - kmPenalty) / 100) * 100;
    est = Math.max(2000, est);
    var low = Math.round(est * 0.92 / 100) * 100;
    var high = Math.round(est * 1.08 / 100) * 100;
    // Display result
    var res = document.getElementById('cvcResult');
    if (res) {
      res.style.display = 'block';
      var label = res.querySelector('.cvc-result-label');
      var range = res.querySelector('.cvc-result-range');
      var sub = res.querySelector('.cvc-result-sub');
      if (label) label.textContent = 'Estimated Market Value';
      if (range) range.textContent = '$' + low.toLocaleString('en-CA') + ' – $' + high.toLocaleString('en-CA');
      if (sub) sub.textContent = 'Based on ' + km.toLocaleString() + ' km, ' + (2026 - age) + ' model year. Actual offer confirmed at inspection.';
    }
    if (btn) { btn.textContent = 'Get My Value'; btn.disabled = false; }
  }, 800);
};

// ──────────────────────────────────────────────────────────────────

/* ═══════════════════════════════════════════════
   PLANET MOTORS — VANILLA JS CHECKOUT v2
   Steps: Payment → Trade-In → Deal + GAP → Personal → Credit → Delivery → Review + Deposit
   + 30-min hold timer in header
═══════════════════════════════════════════════ */
(function(){

var _state = {
  step: 0,
  payment: 'finance',
  hasTrade: null,
  trade: {year:'', make:'', model:'', trim:'', km:'', condition:'good'},
  tradeOffer: 0,
  down: 0,
  term: 84,
  apr: 8.99,
  gap: false,
  gapCost: 699,
  personal: {first:'',last:'',email:'',phone:'',dob:'',addr:'',city:'',prov:'ON',postal:''},
  credit: {employer:'',income:'',employed:'fulltime',sinLast4:''},
  delivery: {method:'deliver',date:'',time:'10:00 AM',addr:'',city:'',prov:'ON',postal:''},
  dlConfirm: false,
  consent1: false,
  finalConsent: false,
  depositCard: {num:'',exp:'',cvv:''},
  submitted: false,
  refNum: '',
  holdTimer: null,
  holdSecs: 1800,
  // ── Delivery cost (set by calcDelivery / pmCO.updateDeliveryPostal) ──
  deliveryCost: 0
};

var STEPS = ['Payment','Trade-In','Your Deal','Personal','Credit','Delivery','Review'];

function fmt(n){ return '$' + Math.round(n).toLocaleString('en-CA'); }
function calcPmt(principal, apr, months){
  if(apr === 0) return principal/months;
  var r = apr/100/26;
  var n = months * 26 / 12;
  return principal * r / (1 - Math.pow(1+r,-n));
}
function getFinancials(){
  var v = window.selectedVehicle || {};
  var price = v.price || 0;
  var hst = Math.round(price * 0.13);
  var omvic = 22;
  var cert = 595;
  var gap = _state.gap ? _state.gapCost : 0;
  var fees = omvic + cert + gap;
  var trade = _state.hasTrade ? (_state.tradeOffer || 0) : 0;
  var down = _state.down || 0;
  var principal = Math.max(0, price + hst + fees - trade - down);
  var pmt = calcPmt(principal, _state.apr, _state.term);
  var total = price + hst + fees;
  var delivery = _state.deliveryCost || 0;
  return {price, hst, omvic, cert, gap, fees, trade, down, principal, pmt, total, delivery};
}

/* ─── TIMER ─── */
function startHoldTimer(){
  if(_state.holdTimer) clearInterval(_state.holdTimer);
  _state.holdSecs = 1800;
  _state.holdTimer = setInterval(function(){
    _state.holdSecs--;
    var el = document.getElementById('pmHoldTimer');
    if(el){
      var m = Math.floor(_state.holdSecs/60);
      var s = _state.holdSecs % 60;
      el.textContent = (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
      if(_state.holdSecs <= 300) el.style.color = '#d02126';
    }
    if(_state.holdSecs <= 0){
      clearInterval(_state.holdTimer);
      var el2 = document.getElementById('pmHoldTimer');
      if(el2) el2.textContent = 'EXPIRED';
    }
  }, 1000);
}
function stopHoldTimer(){
  if(_state.holdTimer){ clearInterval(_state.holdTimer); _state.holdTimer = null; }
}

/* ─── RENDER ─── */
function render(){
  var root = document.getElementById('pm-checkout-root');
  if(!root) return;
  var v = window.selectedVehicle || {};
  var F = getFinancials();
  if(_state.submitted){ root.innerHTML = renderConfirmation(v, F); stopHoldTimer(); return; }
  root.innerHTML =
    '<div class="pm-app">' +
      renderTimerBar(v) +
      '<div class="pm-checkout">' +
        '<div class="pm-checkout-left">' +
          renderProgress(_state.step) +
          renderStep(_state.step, v, F) +
        '</div>' +
        '<div class="pm-checkout-right">' +
          renderSummaryCard(v, F) +
        '</div>' +
      '</div>' +
    '</div>';
}

function renderTimerBar(v){
  var m = Math.floor(_state.holdSecs/60);
  var s = _state.holdSecs % 60;
  var time = (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
  return '<div class="pm-timer-bar">' +
    '<div class="pm-timer-left">' +
      '<span class="pm-timer-lock">🔒</span>' +
      '<span>' + escHtml(v.year||'') + ' ' + escHtml(v.make||'') + ' ' + escHtml(v.model||'') + ' is reserved for you</span>' +
    '</div>' +
    '<div class="pm-timer-right">' +
      '<span class="pm-timer-label">Hold expires in</span>' +
      '<span class="pm-timer-count" id="pmHoldTimer">' + time + '</span>' +
    '</div>' +
  '</div>';
}

function renderProgress(s){
  var html = '<div class="pm-progress"><div class="pm-steps-row">';
  STEPS.forEach(function(name, i){
    var cls = i < s ? 'done' : i === s ? 'active' : '';
    var circle = i < s ? '✓' : (i+1);
    html += '<div class="pm-step-item ' + cls + '">' +
      '<div class="pm-step-circle">' + circle + '</div>' +
      '<div class="pm-step-label">' + name + '</div>' +
    '</div>';
    if(i < STEPS.length-1) html += '<div class="pm-step-line ' + (i<s?'done':'') + '"></div>';
  });
  return html + '</div></div>';
}

function renderSummaryCard(v, F){
  return '<div class="pm-summary-card">' +
    '<img class="pm-summary-img" src="'+escHtml(v.img||'')+'" alt="'+escHtml(v.year||'')+' '+escHtml(v.make||'')+' '+escHtml(v.model||'')+' photo" loading="lazy">' +
    '<div class="pm-summary-body">' +
      '<div class="pm-summary-vehicle">'+escHtml(v.year||'')+' '+escHtml(v.make||'')+' '+escHtml(v.model||'')+'</div>' +
      '<div class="pm-summary-trim">'+escHtml(v.trim||'')+' · '+((v.km||0).toLocaleString())+' km</div>' +
      '<div class="pm-summary-lines">' +
        '<div class="pm-summary-line"><span>Vehicle</span><span>'+fmt(F.price)+'</span></div>' +
        '<div class="pm-summary-line"><span>HST (13%)</span><span>'+fmt(F.hst)+'</span></div>' +
        '<div class="pm-summary-line"><span>OMVIC fee</span><span>$22</span></div>' +
        '<div class="pm-summary-line"><span>Certification fee</span><span>$595</span></div>' +
        (_state.gap ? '<div class="pm-summary-line"><span>GAP Insurance</span><span>'+fmt(F.gapCost)+'</span></div>' : '') +
        /* Delivery cost line — only shown when delivery method is selected */
        (_state.delivery.method === 'deliver' ?
          '<div class="pm-summary-line"><span>Delivery</span><span>' +
            (F.delivery > 0
              ? '$'+F.delivery.toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2})
              : (_state.delivery.postal
                  ? '<span style="color:#16a34a;font-weight:700">Free</span>'
                  : '<span style="color:#9ca3af;font-size:12px">Enter postal in Step 5</span>')) +
          '</span></div>' : '') +
        (F.trade>0 ? '<div class="pm-summary-line deduct"><span>Trade-in</span><span>−'+fmt(F.trade)+'</span></div>' : '') +
        (F.down>0 ? '<div class="pm-summary-line deduct"><span>Down payment</span><span>−'+fmt(F.down)+'</span></div>' : '') +
        '<div class="pm-summary-line total"><span>Total</span><span>'+fmt(F.total - F.down - F.trade)+'</span></div>' +
      '</div>' +
      (_state.payment==='finance' ?
        '<div class="pm-summary-payment">'+fmt(F.pmt)+'<span>/biweekly</span></div>' : '') +
      '<div style="background:#f0fdf4;border-radius:8px;padding:10px 12px;font-size:12px;color:#166534;margin-top:12px;">'+
        '✅ $250 refundable deposit applied to purchase price at signing'+
      '</div>'+
    '</div>' +
  '</div>';
}

function renderStep(s, v, F){
  switch(s){
    case 0: return step0_Payment();
    case 1: return step1_TradeIn();
    case 2: return step2_Deal(v, F);
    case 3: return step3_Personal();
    case 4: return step4_Credit();
    case 5: return step5_Delivery();
    case 6: return step6_Review(v, F);
    default: return '';
  }
}

/* STEP 0 — PAYMENT */
function step0_Payment(){
  var f = _state.payment === 'finance';
  return '<div class="pm-step-panel"><div class="pm-step-heading">How would you like to pay?</div>' +
  '<div class="pm-step-sub">Financing approval takes less than 5 minutes. No hard credit pull at this stage.</div>' +
  '<div class="pm-pay-options">' +
    '<div class="pm-pay-opt '+(f?'selected':'')+'" onclick="pmCO.setPayment(\'finance\')">' +
      '<div class="pm-pay-icon">💳</div><div class="pm-pay-label">Finance</div>' +
      '<div class="pm-pay-desc">Flexible terms · All credit types · $0 down options · OAC</div>' +
    '</div>' +
    '<div class="pm-pay-opt '+(!f?'selected':'')+'" onclick="pmCO.setPayment(\'cash\')">' +
      '<div class="pm-pay-icon">🏦</div><div class="pm-pay-label">Pay in Full</div>' +
      '<div class="pm-pay-desc">Bank draft, wire transfer, or certified cheque</div>' +
    '</div>' +
  '</div>' +
  '<div class="pm-info-box" style="margin-top:16px;">ℹ️ A <strong>$250 fully refundable deposit</strong> will be collected at the final step to reserve this vehicle for you. It is applied directly to your purchase price.</div>' +
  navBtns(null, 'pmCO.next()') + '</div>';
}

/* STEP 1 — TRADE IN */
function step1_TradeIn(){
  var hasTrade = _state.hasTrade;
  var t = _state.trade;
  var offer = _state.tradeOffer;
  var inner = '';
  if(hasTrade === null){
    inner = '<div class="pm-tradein-question">' +
      '<div class="pm-ti-opt" onclick="pmCO.setTrade(true)">Yes, I have a trade-in 🚗</div>' +
      '<div class="pm-ti-opt" onclick="pmCO.setTrade(false)">No trade-in. Continue →</div>' +
    '</div>';
  } else if(hasTrade && !offer){
    inner = '<div class="pm-trade-form">' +
      field('Year','pmTYear',t.year,'number','e.g. 2018') +
      field('Make','pmTMake',t.make,'text','e.g. Toyota') +
      field('Model','pmTModel',t.model,'text','e.g. Camry') +
      '<div class="pm-field"><label class="pm-field-label" for="pmTKm">Mileage (km)</label>' +
        '<input class="pm-input" id="pmTKm" type="number" value="'+escHtml(t.km||'')+'" placeholder="e.g. 75000" name="trade_km"></div>' +
      '<div class="pm-field"><label class="pm-field-label" for="pmTCond">Condition</label>' +
        '<select class="pm-input" id="pmTCond" name="trade_condition">'+opt(['excellent','good','fair','poor'],t.condition)+'</select></div>' +
      '<button type="button" class="btn-apply-trade" onclick="pmCO.getTradeOffer()">Get My Trade Offer →</button>' +
    '</div>';
  } else if(hasTrade && offer){
    inner = '<div class="pm-trade-offer">' +
      '<div class="pm-trade-offer-label">Your Trade-In Offer</div>' +
      '<div class="pm-trade-offer-amount">'+fmt(offer)+'</div>' +
      '<div class="pm-trade-offer-note">✅ Applied to your purchase price automatically. Final offer confirmed at inspection.</div>' +
    '</div>';
  } else {
    inner = '<div class="pm-info-box">No trade-in. Moving on.</div>';
  }
  return '<div class="pm-step-panel"><div class="pm-step-heading">Do you have a trade-in?</div>'+inner+navBtns('pmCO.back()','pmCO.next()')+'</div>';
}

/* STEP 2 — DEAL + GAP */
function step2_Deal(v, F){
  var maxDown = Math.round(v.price * 0.5);
  var gapSel = _state.gap;
  return '<div class="pm-step-panel"><div class="pm-step-heading">Customize Your Deal</div>' +
  '<div class="pm-step-sub">Adjust your down payment and term to find the right payment for you.</div>' +
  '<div class="pm-slider-wrap">' +
    '<div class="pm-slider-header"><span class="pm-slider-label">Down Payment</span><span class="pm-slider-val" id="pmDownVal">'+fmt(F.down)+'</span></div>' +
    '<input class="pm-slider" type="range" min="0" max="'+maxDown+'" step="500" value="'+F.down+'" oninput="pmCO.setDown(this.value)">' +
  '</div>' +
  '<div class="pm-slider-wrap">' +
    '<div class="pm-slider-header"><span class="pm-slider-label">Term</span><span class="pm-slider-val" id="pmTermVal">'+_state.term+' months</span></div>' +
    '<input class="pm-slider" type="range" min="24" max="96" step="12" value="'+_state.term+'" oninput="pmCO.setTerm(this.value)">' +
  '</div>' +
  '<div class="pm-deal-summary">' +
    '<div class="pm-deal-line"><span>Financed amount</span><span>'+fmt(F.principal)+'</span></div>' +
    '<div class="pm-deal-line"><span>Rate (OAC)</span><span>'+_state.apr+'% APR</span></div>' +
    '<div class="pm-deal-payment-big" id="pmDealPmt">'+fmt(F.pmt)+'<span class="pm-label">/biweekly</span></div>' +
  '</div>' +
  /* GAP Insurance upsell */
  '<div class="pm-gap-card">' +
    '<div class="pm-gap-header">' +
      '<div>' +
        '<div class="pm-gap-title">🛡️ GAP Insurance <span class="pm-gap-badge">Recommended</span></div>' +
        '<div class="pm-gap-desc">If your vehicle is written off or stolen, GAP covers the difference between what you owe and what insurance pays. Especially valuable in the first 2 years of financing.</div>' +
      '</div>' +
      '<div class="pm-gap-price">'+fmt(_state.gapCost)+'<span>one-time</span></div>' +
    '</div>' +
    '<div class="pm-gap-options">' +
      '<div class="pm-gap-opt '+(gapSel?'selected':'')+'" onclick="pmCO.setGap(true)">' +
        '<div class="pm-gap-opt-check">'+(gapSel?'●':'○')+'</div>' +
        '<div>' +
          '<div style="font-weight:700;font-size:14px;">Yes, add GAP protection</div>' +
          '<div style="font-size:12px;color:#555;">Added to financed amount · '+fmt(calcPmt(F.principal + _state.gapCost, _state.apr, _state.term))+'/biweekly</div>' +
        '</div>' +
      '</div>' +
      '<div class="pm-gap-opt '+(!gapSel?'selected':'')+'" onclick="pmCO.setGap(false)">' +
        '<div class="pm-gap-opt-check">'+(!gapSel?'●':'○')+'</div>' +
        '<div>' +
          '<div style="font-weight:700;font-size:14px;">No thanks, I\'ll skip GAP</div>' +
          '<div style="font-size:12px;color:#555;">I understand my lender payout may exceed insurance value</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +
  navBtns('pmCO.back()','pmCO.next()') + '</div>';
}

/* STEP 3 — PERSONAL */
function step3_Personal(){
  var p = _state.personal;
  return '<div class="pm-step-panel"><div class="pm-step-heading">Personal Information</div>' +
  '<div class="pm-field-row">'+field('First Name','pmPFirst',p.first,'text')+field('Last Name','pmPLast',p.last,'text')+'</div>' +
  '<div class="pm-field-row">'+field('Email','pmPEmail',p.email,'email')+field('Phone','pmPPhone',p.phone,'tel')+'</div>' +
  field('Date of Birth','pmPDob',p.dob,'date') +
  field('Street Address','pmPAddr',p.addr,'text') +
  '<div class="pm-field-row">'+field('City','pmPCity',p.city,'text')+
    '<div class="pm-field"><label class="pm-field-label" for="pmPProv">Province</label><select class="pm-input" id="pmPProv" name="province">'+opt(['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'],p.prov)+'</select></div>'+
    field('Postal','pmPPostal',p.postal,'text','A1A 1A1') +
  '</div>' +
  navBtns('pmCO.back()','pmCO.nextPersonal()') + '</div>';
}

/* STEP 4 — CREDIT */
function step4_Credit(){
  if(_state.payment === 'cash'){
    return '<div class="pm-step-panel"><div class="pm-step-heading">Cash Payment</div>' +
      '<div class="pm-info-box">You selected cash/bank draft. No credit application needed.<br><br>Please prepare a bank draft payable to <strong>Planet Motors Inc.</strong> for the full amount at time of delivery.</div>' +
      navBtns('pmCO.back()','pmCO.next()') + '</div>';
  }
  var cr = _state.credit;
  return '<div class="pm-step-panel"><div class="pm-step-heading">Employment & Income</div>' +
  '<div class="pm-step-sub">Used for financing only. No hard credit pull at this stage.</div>' +
  '<div class="pm-field"><label class="pm-field-label" for="pmCEmpStatus">Employment Status</label>' +
    '<select class="pm-input" id="pmCEmpStatus" aria-label="Employment Status" name="employment_status">'+opt(['fulltime','parttime','self','retired','other'],cr.employed,['Full-Time','Part-Time','Self-Employed','Retired','Other'])+'</select>' +
  '</div>' +
  field('Employer / Company Name','pmCEmployer',cr.employer,'text') +
  field('Annual Gross Income ($)','pmCIncome',cr.income,'number','e.g. 65000') +
  '<div class="pm-field"><label class="pm-field-label" for="pmCSin">Last 4 digits of SIN (optional)</label>' +
    '<input class="pm-input" id="pmCSin" maxlength="4" value="'+escHtml(cr.sinLast4||'')+'" placeholder="••••" name="sin_last4" aria-describedby="hint-pmCSin"><span id="hint-pmCSin" style="font-size:11px;color:#666;display:block;margin-top:3px;">Used for credit bureau consent only. Not stored.</span></div>' +
  '<div class="pm-consent-box">' +
    '<label style="display:flex;gap:10px;cursor:pointer;align-items:flex-start">' +
      '<input type="checkbox" id="pmConsent1" '+ (_state.consent1?'checked':'') +' onchange="pmCO.setConsent1(this.checked)" style="margin-top:2px;flex-shrink:0" name="financing_consent">' +
      '<span class="pm-consent-text">I consent to Planet Motors collecting and sharing my information with partner lenders for financing purposes in accordance with PIPEDA and Ontario privacy law.</span>' +
    '</label>' +
  '</div>' +
  navBtns('pmCO.back()','pmCO.nextCredit()') + '</div>';
}

/* STEP 5 — DELIVERY */
function step5_Delivery(){
  var d = _state.delivery;
  // Build next 7 business days
  var dates = [];
  var dt = new Date();
  dt.setDate(dt.getDate() + 1);
  while(dates.length < 7){
    var day = dt.getDay();
    if(day !== 0 && day !== 6){
      dates.push(new Date(dt));
    }
    dt.setDate(dt.getDate() + 1);
  }
  var dateOpts = dates.map(function(d2){
    var iso = d2.toISOString().split('T')[0];
    var label = d2.toLocaleDateString('en-CA',{weekday:'short',month:'short',day:'numeric'});
    return '<option value="'+iso+'"'+(d.date===iso?' selected':'')+'>'+label+'</option>';
  }).join('');

  return '<div class="pm-step-panel"><div class="pm-step-heading">Delivery & Pick-Up</div>' +
  '<div class="pm-delivery-options">' +
    '<div class="pm-pay-opt '+(d.method==='deliver'?'selected':'')+'" onclick="pmCO.setDelivery(\'deliver\')">' +
      '<div class="pm-pay-icon">🚚</div><div class="pm-pay-label">Home Delivery</div>' +
      '<div class="pm-pay-desc">We deliver to your door · GTA &amp; Ontario · Free</div>' +
    '</div>' +
    '<div class="pm-pay-opt '+(d.method==='pickup'?'selected':'')+'" onclick="pmCO.setDelivery(\'pickup\')">' +
      '<div class="pm-pay-icon">📍</div><div class="pm-pay-label">Dealership Pick-Up</div>' +
      '<div class="pm-pay-desc">30 Major Mackenzie Dr E, Richmond Hill · Available weekdays 9am–6pm</div>' +
    '</div>' +
  '</div>' +
  '<div class="pm-field-row" style="margin-top:20px;">' +
    '<div class="pm-field"><label class="pm-field-label" for="pmDDate">Preferred Date</label><select class="pm-input" id="pmDDate" name="delivery_date">'+dateOpts+'</select></div>' +
    '<div class="pm-field"><label class="pm-field-label" for="pmDTime">Preferred Time</label><select class="pm-input" id="pmDTime" name="delivery_time">'+
      opt(['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'],d.time)+
    '</select></div>' +
  '</div>' +
  (d.method==='deliver' ?
    field('Delivery Address','pmDAddr',d.addr,'text','Street address') +
    '<div class="pm-field-row">'+field('City','pmDCity',d.city,'text')+
      '<div class="pm-field"><label class="pm-field-label" for="pmPProv">Province</label><select class="pm-input" id="pmDProv" name="delivery_province">'+opt(['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'],d.prov)+'</select></div>'+
      /* Postal: onblur triggers real driving-distance delivery cost calc via /api/distance */
      '<div class="pm-field"><div class="pm-field-label">Postal</div><input class="pm-input" id="pmDPostal" type="text" value="'+escHtml(d.postal||'')+'" placeholder="A1A 1A1" maxlength="7" autocomplete="postal-code" onblur="pmCO.updateDeliveryPostal()" aria-label="Delivery postal code"></div>' +
    '</div>' : '') +
  navBtns('pmCO.back()','pmCO.next()') + '</div>';
}

/* STEP 6 — REVIEW + DEPOSIT */
function step6_Review(v, F){
  var p = _state.personal;
  var d = _state.delivery;
  var dep = _state.depositCard;
  return '<div class="pm-step-panel">' +
  '<div class="pm-step-heading">Review Your Order</div>' +

  /* Vehicle summary */
  '<div class="pm-review-section"><div class="pm-review-shead">Vehicle</div>' +
    '<div class="pm-review-line"><span>'+escHtml(v.year)+' '+escHtml(v.make)+' '+escHtml(v.model)+' '+escHtml(v.trim)+'</span><span>'+fmt(v.price)+'</span></div>' +
    '<div class="pm-review-line"><span>HST (13%)</span><span>'+fmt(F.hst)+'</span></div>' +
    '<div class="pm-review-line"><span>OMVIC fee</span><span>$22</span></div>' +
    '<div class="pm-review-line"><span>Certification fee</span><span>$595</span></div>' +
    (_state.gap ? '<div class="pm-review-line"><span>GAP Insurance</span><span>'+fmt(_state.gapCost)+'</span></div>' : '') +
    (F.trade>0 ? '<div class="pm-review-line"><span>Trade-in credit</span><span style="color:#16a34a">−'+fmt(F.trade)+'</span></div>' : '') +
    (F.down>0 ? '<div class="pm-review-line"><span>Down payment</span><span>−'+fmt(F.down)+'</span></div>' : '') +
    '<div class="pm-review-line total"><span>Amount financed</span><span>'+fmt(F.principal)+'</span></div>' +
    /* Delivery cost line in review — always shown for transparency */
    '<div class="pm-review-line"><span>Delivery</span><span>' +
      (_state.delivery.method === 'pickup'
        ? '<span style="color:#16a34a">Pickup: Free</span>'
        : (F.delivery > 0
            ? '$'+F.delivery.toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2})+' CAD'
            : '<span style="color:#16a34a">Free</span>')) +
    '</span></div>' +
  '</div>' +

  /* Contact */
  '<div class="pm-review-section"><div class="pm-review-shead">Contact</div>' +
    '<div class="pm-review-line"><span>Name</span><span>'+escHtml(p.first)+' '+escHtml(p.last)+'</span></div>' +
    '<div class="pm-review-line"><span>Email</span><span>'+escHtml(p.email)+'</span></div>' +
    '<div class="pm-review-line"><span>Phone</span><span>'+escHtml(p.phone)+'</span></div>' +
  '</div>' +

  /* Delivery */
  '<div class="pm-review-section"><div class="pm-review-shead">'+(d.method==='deliver'?'Home Delivery':'Dealership Pick-Up')+'</div>' +
    '<div class="pm-review-line"><span>Date &amp; Time</span><span>'+escHtml(d.date||'TBD')+' at '+escHtml(d.time)+'</span></div>' +
    (d.method==='deliver' ? '<div class="pm-review-line"><span>Address</span><span>'+escHtml(d.addr)+', '+escHtml(d.city)+' '+escHtml(d.prov)+'</span></div>'
      : '<div class="pm-review-line"><span>Location</span><span>30 Major Mackenzie Dr E, Richmond Hill</span></div>') +
  '</div>' +

  /* Driver's Licence */
  '<div class="pm-dl-box">' +
    '<div class="pm-dl-header">' +
      '<span class="pm-dl-icon">🪪</span>' +
      '<div>' +
        '<div class="pm-dl-title">Driver\'s Licence Confirmation</div>' +
        '<div class="pm-dl-desc">You\'ll be asked to upload a photo of your driver\'s licence when our team contacts you to finalize the deal. Please have it ready.</div>' +
      '</div>' +
    '</div>' +
    '<label style="display:flex;gap:10px;cursor:pointer;align-items:flex-start;margin-top:12px;">' +
      '<input type="checkbox" id="pmDlConfirm" '+(_state.dlConfirm?'checked':'')+' onchange="pmCO.setDlConfirm(this.checked)" style="margin-top:2px;flex-shrink:0" name="dl_confirm">' +
      '<span style="font-size:13px;color:#444;">I confirm I hold a valid driver\'s licence and will provide it when requested.</span>' +
    '</label>' +
  '</div>' +

  /* $250 Deposit */
  '<div class="pm-deposit-card">' +
    '<div class="pm-deposit-header">' +
      '<div>' +
        '<div class="pm-deposit-title">💳 $250 Refundable Reservation Deposit</div>' +
        '<div class="pm-deposit-desc">Reserves this vehicle exclusively for you for <strong>72 hours</strong>. Fully refundable if financing is not approved or you cancel within 48 hours. Applied to your purchase price at signing.</div>' +
      '</div>' +
      '<div class="pm-deposit-amount">$250</div>' +
    '</div>' +
    '<div class="pm-field" style="margin-top:16px;">' +
      '<label class="pm-field-label" for="pmDepCard">Card Number</label>' +
      '<input class="pm-input pm-card-input" id="pmDepCard" type="text" maxlength="19" placeholder="1234 5678 9012 3456" value="'+escHtml(dep.num||'')+'" oninput="pmCO.fmtCard(this)" name="deposit_card" autocomplete="cc-number">' +
    '</div>' +
    '<div class="pm-field-row">' +
      '<div class="pm-field"><label class="pm-field-label" for="pmDepExp">Expiry (MM/YY)</label><input class="pm-input" id="pmDepExp" type="text" maxlength="5" placeholder="MM/YY" value="'+escHtml(dep.exp||'')+'" oninput="pmCO.fmtExp(this)" name="deposit_expiry" autocomplete="cc-exp"></div>' +
      '<div class="pm-field"><label class="pm-field-label" for="pmDepCvv">CVV</label><input class="pm-input" id="pmDepCvv" type="text" maxlength="4" placeholder="•••" value="'+escHtml(dep.cvv||'')+'" name="deposit_cvv" autocomplete="cc-csc"></div>' +
    '</div>' +
    '<div class="pm-deposit-secure">🔒 256-bit encrypted · PCI compliant · Card charged $250 only, billed as "Planet Motors Inc."</div>' +
  '</div>' +

  /* Final consent */
  '<div class="pm-consent-final">' +
    '<label style="display:flex;gap:10px;cursor:pointer;align-items:flex-start">' +
      '<input type="checkbox" id="pmFinalConsent" '+(_state.finalConsent?'checked':'')+' onchange="pmCO.setFinalConsent(this.checked)" style="margin-top:2px;flex-shrink:0" name="final_consent">' +
      '<span class="pm-consent-final-text">I confirm all information is accurate and I authorize a $250 refundable deposit on the card above to reserve this vehicle. I understand this is a purchase request. A Planet Motors representative will contact me to finalize. 🛡️ OMVIC Registered Dealer.</span>' +
    '</label>' +
  '</div>' +

  '<div class="pm-nav-btns">' +
    '<button type="button" class="btn-back" onclick="pmCO.back()" aria-label="Go back to previous step">← Back</button>' +
    '<button type="button" class="btn-submit" onclick="pmCO.submit()" aria-label="Submit reservation and pay deposit">Reserve Vehicle and Pay $250 Deposit</button>' +
  '</div></div>';
}

/* CONFIRMATION */
function renderConfirmation(v, F){
  return '<div class="pm-app" style="display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 100px)">' +
    '<div class="pm-confirm">' +
      '<div class="pm-confirm-icon">🎉</div>' +
      '<h2 style="font-size:28px;font-weight:900;margin:0 0 8px;color:#111;">Vehicle Reserved!</h2>' +
      '<p style="color:#555;margin:0 0 8px;font-size:15px;">Your $250 deposit has been received.</p>' +
      '<p style="color:#888;font-size:13px;margin:0 0 24px;">Our team will call you within <strong>1 business hour</strong> to finalize your purchase.</p>' +
      '<div class="pm-confirm-ref"><div class="pm-confirm-ref-label">Reservation #</div><div class="pm-confirm-ref-val">'+escHtml(_state.refNum)+'</div></div>' +
      '<div style="margin-top:24px;display:flex;flex-direction:column;gap:10px;">' +
        '<div class="pm-confirm-step"><span class="pm-confirm-step-num">1</span><span class="pm-confirm-step-text">Check your email for confirmation &amp; next steps</span></div>' +
        '<div class="pm-confirm-step"><span class="pm-confirm-step-num">2</span><span class="pm-confirm-step-text">Upload driver\'s licence when our team contacts you</span></div>' +
        '<div class="pm-confirm-step"><span class="pm-confirm-step-num">3</span><span class="pm-confirm-step-text">Sign documents digitally. Vehicle delivered or ready for pickup.</span></div>' +
      '</div>' +
      '<div style="background:#f0fdf4;border-radius:10px;padding:14px;margin-top:20px;font-size:13px;color:#166534;">'+
        '💰 Your $250 deposit is fully refundable if financing is not approved or you cancel within 48 hours.'+
      '</div>' +
      '<button type="button" class="btn-back-home" onclick="window.closeCheckout();showPage(\'home\')" style="margin-top:24px;">Back to Home</button>' +
    '</div>' +
  '</div>';
}

/* ─── HELPERS ─── */
function field(label, id, val, type, placeholder){
  return '<div class="pm-field"><div class="pm-field-label">'+label+'</div>' +
    '<input class="pm-input" id="'+id+'" type="'+type+'" value="'+escHtml(val||'')+'" placeholder="'+(placeholder||'')+'"></div>';
}
function opt(vals, selected, labels){
  return vals.map(function(v,i){
    return '<option value="'+v+'"'+(v===selected?' selected':'')+'>'+((labels&&labels[i])||v)+'</option>';
  }).join('');
}
function navBtns(backFn, nextFn){
  return '<div class="pm-nav-btns">' +
    (backFn ? '<button type="button" class="btn-back" onclick="'+backFn+'" aria-label="Go back to previous step">← Back</button>' : '<div></div>') +
    '<button type="button" class="btn-continue" onclick="'+nextFn+'" aria-label="Continue to next step">Continue →</button>' +
  '</div>';
}

/* ─── SAVE INPUTS ─── */
function saveInputs(){
  function val(id){ var el=document.getElementById(id); return el?el.value:''; }
  var s = _state.step;
  if(s===1 && _state.hasTrade && !_state.tradeOffer){
    _state.trade.year=val('pmTYear'); _state.trade.make=val('pmTMake');
    _state.trade.model=val('pmTModel'); _state.trade.km=val('pmTKm'); _state.trade.condition=val('pmTCond');
  }
  if(s===3){
    _state.personal.first=val('pmPFirst'); _state.personal.last=val('pmPLast');
    _state.personal.email=val('pmPEmail'); _state.personal.phone=val('pmPPhone');
    _state.personal.dob=val('pmPDob'); _state.personal.addr=val('pmPAddr');
    _state.personal.city=val('pmPCity'); _state.personal.prov=val('pmPProv'); _state.personal.postal=val('pmPPostal');
  }
  if(s===4){
    _state.credit.employed=val('pmCEmpStatus'); _state.credit.employer=val('pmCEmployer');
    _state.credit.income=val('pmCIncome'); _state.credit.sinLast4=val('pmCSin');
  }
  if(s===5){
    _state.delivery.date=val('pmDDate'); _state.delivery.time=val('pmDTime');
    _state.delivery.addr=val('pmDAddr')||''; _state.delivery.city=val('pmDCity')||'';
    _state.delivery.prov=val('pmDProv')||'ON'; _state.delivery.postal=val('pmDPostal')||'';
  }
  if(s===6){
    _state.depositCard.num=val('pmDepCard'); _state.depositCard.exp=val('pmDepExp'); _state.depositCard.cvv=val('pmDepCvv');
  }
}

/* ─── PUBLIC CONTROLLER ─── */
window.pmCO = {
  setPayment: function(p){ _state.payment=p; render(); },
  setTrade: function(v){ _state.hasTrade=v; render(); },
  setGap: function(v){ saveInputs(); _state.gap=v; render(); },
  setDown: function(v){
    _state.down=parseInt(v)||0;
    var F=getFinancials();
    var dv=document.getElementById('pmDownVal'); if(dv)dv.textContent=fmt(F.down);
    var pv=document.getElementById('pmDealPmt'); if(pv)pv.innerHTML=fmt(F.pmt)+'<span class="pm-label">/biweekly</span>';
  },
  setTerm: function(v){
    _state.term=parseInt(v)||84;
    var F=getFinancials();
    var tv=document.getElementById('pmTermVal'); if(tv)tv.textContent=_state.term+' months';
    var pv=document.getElementById('pmDealPmt'); if(pv)pv.innerHTML=fmt(F.pmt)+'<span class="pm-label">/biweekly</span>';
  },
  setDelivery: function(m){ saveInputs(); _state.delivery.method=m; render(); },
  setConsent1: function(v){ _state.consent1=v; },
  setDlConfirm: function(v){ _state.dlConfirm=v; },
  setFinalConsent: function(v){ _state.finalConsent=v; },
  /* ── Delivery cost integration ─────────────────────────────────
   * Called by global _applyDeliveryCost() when API returns a result.
   * Updates _state.deliveryCost and re-renders the checkout summary. */
  setDeliveryCost: function(cost) {
    _state.deliveryCost = cost || 0;
    render();
  },
  /* Called onblur from the #pmDPostal field in Step 5.
   * Fetches real driving-distance cost and updates the summary. */
  updateDeliveryPostal: function() {
    saveInputs(); // persist current postal value into _state first
    var postal = _normalisePostal(_state.delivery.postal || '');
    if (!postal) return;
    var re = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;
    if (!re.test(postal)) return;
    if (typeof _fetchDeliveryCost === 'function') {
      _fetchDeliveryCost(postal,
        function(cost, distanceKm) {
          window._pmDeliveryCost = cost;
          _state.deliveryCost = cost;
          render();
        },
        function() { /* silent fail; user can re-enter */ }
      );
    }
  },
  fmtCard: function(el){
    var v=el.value.replace(/\D/g,'').substring(0,16);
    el.value=v.replace(/(.{4})/g,'$1 ').trim();
  },
  fmtExp: function(el){
    var v=el.value.replace(/\D/g,'');
    if(v.length>=2) v=v.substring(0,2)+'/'+v.substring(2,4);
    el.value=v;
  },
  getTradeOffer: function(){
    saveInputs();
    var t=_state.trade;
    if(!t.year||!t.make||!t.model){ alert('Please fill in year, make, and model.'); return; }
    var base=8000+(parseInt(t.year)||2015-2015)*1200;
    var km=parseInt(t.km)||80000; base-=Math.round(km*0.05);
    var cond={excellent:1.15,good:1.0,fair:0.82,poor:0.65};
    base=Math.round(base*(cond[t.condition]||1)); base=Math.max(1500,base);
    _state.tradeOffer=base; render();
  },
  back: function(){ saveInputs(); if(_state.step>0){_state.step--; render(); window.scrollTo(0,0);} },
  next: function(){ saveInputs(); if(_state.step<STEPS.length-1){_state.step++; render(); window.scrollTo(0,0);} },
  nextPersonal: function(){
    saveInputs();
    var p=_state.personal;
    if(!p.first||!p.last||!p.email||!p.phone){ alert('Please fill in your name, email, and phone number.'); return; }
    _state.step++; render(); window.scrollTo(0,0);
  },
  nextCredit: function(){
    saveInputs();
    if(_state.payment==='finance'&&!_state.consent1){ alert('Please provide financing consent to continue.'); return; }
    _state.step++; render(); window.scrollTo(0,0);
  },
  submit: function(){
    saveInputs();
    if(!_state.dlConfirm){ alert('Please confirm you hold a valid driver\'s licence.'); return; }
    if(!_state.finalConsent){ alert('Please check the final consent box to submit.'); return; }
    var dep=_state.depositCard;
    if(!dep.num||dep.num.replace(/\s/g,'').length<15){ alert('Please enter a valid card number.'); return; }
    if(!dep.exp||dep.exp.length<5){ alert('Please enter the card expiry date.'); return; }
    if(!dep.cvv||dep.cvv.length<3){ alert('Please enter the CVV.'); return; }
    _state.refNum='PM-'+Date.now().toString(36).toUpperCase().slice(-6);
    _state.submitted=true;
    render(); window.scrollTo(0,0);
    /* Save to Firestore + trigger email notifications */
    if(typeof window.saveReservation==='function'){
      window.saveReservation(_state, window.selectedVehicle);
    }
  }
};

/* ─── MOUNT ─── */
window._openCheckoutReal = window.openCheckout = function(){
  var v=window.selectedVehicle;
  if(!v){ if(typeof showNotification==='function') showNotification('Please select a vehicle first.'); return; }
  _state.step=0; _state.payment='finance'; _state.hasTrade=null;
  _state.trade={year:'',make:'',model:'',trim:'',km:'',condition:'good'};
  _state.tradeOffer=0; _state.down=0; _state.term=84; _state.apr=8.99; _state.gap=false;
  _state.personal={first:'',last:'',email:'',phone:'',dob:'',addr:'',city:'',prov:'ON',postal:''};
  _state.credit={employer:'',income:'',employed:'fulltime',sinLast4:''};
  _state.delivery={method:'deliver',date:'',time:'10:00 AM',addr:'',city:'',prov:'ON',postal:''};
  _state.dlConfirm=false; _state.consent1=false; _state.finalConsent=false;
  _state.depositCard={num:'',exp:'',cvv:''};
  _state.submitted=false; _state.refNum=''; _state.holdSecs=1800;
  /* Pre-fill from logged-in user */
  if(window.currentUser){
    _state.personal.first=window.currentUser.first||'';
    _state.personal.last=window.currentUser.last||'';
    _state.personal.email=window.currentUser.email||'';
    _state.personal.phone=window.currentUser.phone||'';
    /* Pre-fill delivery postal from saved profile + auto-calculate cost */
    if(window.currentUser.postalCode){
      _state.delivery.postal = window.currentUser.postalCode;
      setTimeout(function(){
        if(typeof _fetchDeliveryCost === 'function'){
          _fetchDeliveryCost(window.currentUser.postalCode,
            function(cost){
              window._pmDeliveryCost = cost;
              _state.deliveryCost = cost;
              render();
            },
            function(){}
          );
        }
      }, 400);
    }
  }
  var overlay=document.getElementById('pm-checkout-overlay');
  if(overlay){overlay.classList.add('open'); document.body.style.overflow='hidden'; pmTrapFocus('pm-checkout-overlay');}
  render();
  startHoldTimer();
};

window.closeCheckout=function(){
  var overlay=document.getElementById('pm-checkout-overlay');
  pmReleaseFocus('pm-checkout-overlay'); if(overlay) overlay.classList.remove('open');
  document.body.style.overflow='';
  stopHoldTimer();
};

})();

// ──────────────────────────────────────────────────────────────────

(function(){
  function ppLoadCars(){
    var row = document.getElementById('pp-cars-row');
    if(!row) return;
    if(typeof INVENTORY === 'undefined'){ setTimeout(ppLoadCars, 300); return; }
    var cars = INVENTORY.slice(0,3);
    cars.forEach(function(v){
      var card = document.createElement('div');
      card.className = 'pp-card';
      card.onclick = function(){ openVdp(v.id); };
      var wasHtml = v.was ? '<span class="pp-car-was">was $'+Number(v.was).toLocaleString()+'</span>' : '';
      var saleHtml = v.sale ? '<span class="pp-sale-tag">Sale</span>' : '';
      card.innerHTML = '<img src="'+escHtml(v.img)+'" onerror="this.src=\'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=70\'" alt="'+escHtml(v.year)+' '+escHtml(v.make)+' '+escHtml(v.model)+(v.trim?' '+escHtml(v.trim):'')+' '+escHtml(v.color)+' for sale in Richmond Hill, ON" loading="lazy">'
        +'<div class="pp-card-body">'
        +saleHtml
        +'<div class="pp-car-name">'+escHtml(v.year)+' '+escHtml(v.make)+' '+escHtml(v.model)+'</div>'
        +'<div class="pp-car-sub">'+((escHtml(v.trim||''))+(v.trim?' &bull; ':'')+Number(v.km).toLocaleString()+' km')+'</div>'
        +'<div class="pp-car-price-row"><span class="pp-car-price">$'+Number(v.price).toLocaleString()+'</span>'+wasHtml+'</div>'
        +'<div class="pp-car-bw">$'+escHtml(v.biweekly)+'/biweekly &nbsp; $0 down</div>'
        +'<div class="pp-car-note">Excl. HST &amp; Licensing; Incl. OMVIC Fee</div>'
        +'</div>';
      row.appendChild(card);
    });
  }
  ppLoadCars();
})();

// ──────────────────────────────────────────────────────────────────

// Populate year dropdown for car value calculator
(function() {
  function populateCvcYear() {
    var sel = document.getElementById('cvcYear');
    if (!sel) return;
    for (var y = 2026; y >= 2000; y--) {
      var opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      sel.appendChild(opt);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateCvcYear);
  } else {
    populateCvcYear();
  }
})();

// ──────────────────────────────────────────────────────────────────

/* Inspection drawer — bulletproof class-based open/close */
window.openInspectionDrawer = function() {
  var o = document.getElementById('inspectionDrawerOverlay');
  var d = document.getElementById('inspectionDrawer');
  if (!o || !d) {
    alert('Inspection report is loading. Please try again in a moment.');
    return;
  }
  o.classList.add('drawer-open');
  d.classList.add('drawer-open');
  document.body.style.overflow = 'hidden';
};
window.closeInspectionDrawer = function() {
  var o = document.getElementById('inspectionDrawerOverlay');
  var d = document.getElementById('inspectionDrawer');
  if (d) d.classList.remove('drawer-open');
  if (o) o.classList.remove('drawer-open');
  document.body.style.overflow = '';
};
window.idrToggle = function(el) {
  var s = el.closest ? el.closest('.idr-section') : null;
  if (s) s.classList.toggle('idr-collapsed');
};
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { window.closeInspectionDrawer(); }
});

// ──────────────────────────────────────────────────────────────────

/* ══════════════════════════════════════════════════════════════
   PLANET MOTORS AUTH SYSTEM
   - localStorage-backed accounts (email+hashed pass)
   - Session persists across page refresh
   - Checkout gated: must be signed in to proceed
══════════════════════════════════════════════════════════════ */
(function(){

  var STORE_KEY = 'pm_accounts';
  var SESSION_KEY = 'pm_session';

  /* ── simple hash (not cryptographic — demo only) ── */
  function hashPass(s){
    var h = 0;
    for(var i=0;i<s.length;i++){ h = ((h<<5)-h)+s.charCodeAt(i); h|=0; }
    return h.toString(36);
  }

  function getAccounts(){
    try{ return JSON.parse(localStorage.getItem(STORE_KEY)||'{}'); }catch(e){ return {}; }
  }
  function saveAccounts(a){ localStorage.setItem(STORE_KEY, JSON.stringify(a)); }

  function getSession(){
    try{ return JSON.parse(localStorage.getItem(SESSION_KEY)||'null'); }catch(e){ return null; }
  }
  function saveSession(u){ localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
  function clearSession(){ localStorage.removeItem(SESSION_KEY); }

  /* Restore session on load */
  window.currentUser = getSession();

  function updateNavbar(){
    var btn = document.getElementById('pmNavAccountBtn');
    var loggedArea = document.getElementById('pmNavLoggedIn');
    var signInArea = document.getElementById('pmNavSignIn');
    if(!btn && !loggedArea) return;

    if(window.currentUser){
      var name = window.currentUser.first || window.currentUser.email.split('@')[0];
      if(signInArea) signInArea.style.display='none';
      if(loggedArea){
        loggedArea.style.display='flex';
        var nameEl = document.getElementById('pmNavUserName');
        if(nameEl) nameEl.textContent = 'Hi, ' + name;
      }
    } else {
      if(signInArea) signInArea.style.display='flex';
      if(loggedArea) loggedArea.style.display='none';
    }
  }

  function showErr(msg){
    var el=document.getElementById('pmAuthErr');
    var su=document.getElementById('pmAuthSuccess');
    if(su){su.className='pm-auth-success';}
    if(el){el.textContent=msg;el.className='pm-auth-err show';}
  }
  function showSuccess(msg){
    var el=document.getElementById('pmAuthSuccess');
    var er=document.getElementById('pmAuthErr');
    if(er){er.className='pm-auth-err';}
    if(el){el.textContent=msg;el.className='pm-auth-success show';}
  }
  function clearMessages(){
    var e=document.getElementById('pmAuthErr');
    var s=document.getElementById('pmAuthSuccess');
    if(e)e.className='pm-auth-err';
    if(s)s.className='pm-auth-success';
  }

  /* pending callback — fn to call after login */
  var _afterAuth = null;

  window.pmAuth = {

    open: function(afterFn){
      _afterAuth = afterFn || null;
      clearMessages();
      /* Reset to sign-in tab */
      pmAuth.switchTab('signin');
      var o = document.getElementById('pm-auth-overlay');
      if(o){ o.classList.add('open'); document.body.style.overflow='hidden'; pmTrapFocus('pm-auth-overlay'); }
    },

    close: function(){
      var o = document.getElementById('pm-auth-overlay');
      pmReleaseFocus('pm-auth-overlay'); if(o){ o.classList.remove('open'); }
      document.body.style.overflow='';
      _afterAuth = null;
    },

    overlayClick: function(e){
      if(e.target.id === 'pm-auth-overlay') pmAuth.close();
    },

    switchTab: function(tab){
      clearMessages();
      var signinTab = document.getElementById('pmAuthTabSignin');
      var createTab = document.getElementById('pmAuthTabCreate');
      var signinForm = document.getElementById('pmFormSignin');
      var createForm = document.getElementById('pmFormCreate');
      if (signinTab) { signinTab.className = 'pm-auth-tab' + (tab==='signin'?' active':''); signinTab.setAttribute('aria-selected', tab==='signin' ? 'true' : 'false'); }
      if (createTab) { createTab.className = 'pm-auth-tab' + (tab==='create'?' active':''); createTab.setAttribute('aria-selected', tab==='create' ? 'true' : 'false'); }
      if (signinForm) { signinForm.hidden = tab !== 'signin'; }
      if (createForm) { createForm.hidden = tab !== 'create'; }
    },

    signIn: function(){
      var email = (document.getElementById('pmSiEmail').value||'').trim().toLowerCase();
      var pass  = (document.getElementById('pmSiPass').value||'');
      if(!email||!pass){ showErr('Please enter your email and password.'); return; }
      var accounts = getAccounts();
      var user = accounts[email];
      if(!user){ showErr('No account found with that email. Please create an account.'); return; }
      if(user.hash !== hashPass(pass)){ showErr('Incorrect password. Please try again.'); return; }
      /* Success */
      window.currentUser = {email:email, first:user.first, last:user.last, phone:user.phone};
      saveSession(window.currentUser);
      updateNavbar();
      showSuccess('Welcome back, ' + (user.first||email) + '! ✓');
      setTimeout(function(){
        var _cb = _afterAuth;
        pmAuth.close();
        if(_cb) _cb();
      }, 800);
    },

    createAccount: function(){
      var first = (document.getElementById('pmCaFirst').value||'').trim();
      var last  = (document.getElementById('pmCaLast').value||'').trim();
      var email = (document.getElementById('pmCaEmail').value||'').trim().toLowerCase();
      var phone = (document.getElementById('pmCaPhone').value||'').trim();
      var pass  = (document.getElementById('pmCaPass').value||'');
      if(!first||!last){ showErr('Please enter your first and last name.'); return; }
      if(!email||!email.includes('@')){ showErr('Please enter a valid email address.'); return; }
      if(pass.length < 6){ showErr('Password must be at least 6 characters.'); return; }
      var accounts = getAccounts();
      if(accounts[email]){ showErr('An account with this email already exists. Please sign in.'); return; }
      accounts[email] = {first:first, last:last, phone:phone, hash:hashPass(pass), created:Date.now()};
      saveAccounts(accounts);
      window.currentUser = {email:email, first:first, last:last, phone:phone};
      saveSession(window.currentUser);
      updateNavbar();
      showSuccess('Account created! Welcome, ' + first + ' ✓');
      setTimeout(function(){
        var _cb = _afterAuth;
        pmAuth.close();
        if(_cb) _cb();
      }, 900);
    },

    socialLogin: function(provider){
      /* Simulated OAuth — replace with real OAuth when backend ready */
      clearMessages();
      var name = provider === 'google' ? 'Google' : 'Facebook';
      showSuccess('Connecting to ' + name + '...');
      setTimeout(function(){
        var email = 'user@' + provider + '.com';
        var first = provider === 'google' ? 'Google' : 'Facebook';
        window.currentUser = {email:email, first:first, last:'User', phone:''};
        saveSession(window.currentUser);
        updateNavbar();
        showSuccess('Signed in with ' + name + ' ✓');
        setTimeout(function(){
          var _cb = _afterAuth;
          pmAuth.close();
          if(_cb) _cb();
        }, 700);
      }, 1000);
    },

    signOut: function(){
      window.currentUser = null;
      clearSession();
      updateNavbar();
      if(typeof showNotification==='function') showNotification('Signed out successfully.');
      /* close any open dropdown */
      var dd = document.querySelector('.nav-account-dropdown-menu');
      if(dd) dd.classList.remove('open');
    },

    forgotPass: function(){
      var email = (document.getElementById('pmSiEmail').value||'').trim().toLowerCase();
      if(!email){ showErr('Enter your email above first.'); return; }
      var accounts = getAccounts();
      if(!accounts[email]){ showErr('No account found with that email.'); return; }
      showSuccess('If this email exists, a reset link would be sent. (Demo mode — contact us at 1-866-797-3332)');
    },

    toggleDropdown: function(){
      var dd = document.getElementById('pmNavUserDropdown');
      if(dd) dd.classList.toggle('open');
    }
  };

  /* Gate openCheckout behind auth */
  var _origOpen = window._openCheckoutReal || window.openCheckout;
  window.openCheckout = window._openCheckoutReal = function(){
    if(!window.selectedVehicle){
      if(typeof showNotification==='function') showNotification('Please select a vehicle first.');
      return;
    }
    if(!window.currentUser){
      /* Not logged in — show auth modal, then open checkout after */
      pmAuth.open(function(){
        if(_origOpen) _origOpen();
      });
      return;
    }
    /* Already logged in — go straight to checkout */
    if(_origOpen) _origOpen();
  };

  /* Run navbar update once DOM ready */
  document.addEventListener('DOMContentLoaded', function(){ updateNavbar(); });
  /* Also run now in case DOM already ready */
  if(document.readyState !== 'loading'){ setTimeout(updateNavbar, 50); }

  /* Close dropdown on outside click */
  document.addEventListener('click', function(e){
    if(!e.target.closest('.nav-account-dropdown')){
      var dd = document.querySelector('.nav-account-dropdown-menu');
      if(dd) dd.classList.remove('open');
    }
  });

})();

// ── Focus trap for modals ──
function pmTrapFocus(overlayId) {
  var overlay = document.getElementById(overlayId);
  if (!overlay) return;
  var focusable = overlay.querySelectorAll(
    'button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
    'textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  var first = focusable[0], last = focusable[focusable.length - 1];
  overlay._trapHandler = function(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  overlay.addEventListener('keydown', overlay._trapHandler);
  // Focus first element
  setTimeout(function(){ first.focus(); }, 50);
}
function pmReleaseFocus(overlayId) {
  var overlay = document.getElementById(overlayId);
  if (overlay && overlay._trapHandler) {
    overlay.removeEventListener('keydown', overlay._trapHandler);
    overlay._trapHandler = null;
  }
}

// ── Inline form validation ──
function pmValidateField(inputEl) {
  var errId = 'err-' + inputEl.id;
  var errEl = document.getElementById(errId);
  var valid = inputEl.checkValidity();
  if (!valid) {
    inputEl.setAttribute('aria-invalid', 'true');
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = inputEl.dataset.error || 'This field is required.'; }
  } else {
    inputEl.setAttribute('aria-invalid', 'false');
    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
  }
  return valid;
}
function pmValidateForm(formEl) {
  var inputs = formEl ? formEl.querySelectorAll('input[required],select[required],textarea[required]') 
                       : document.querySelectorAll('input[required],select[required],textarea[required]');
  var allValid = true;
  inputs.forEach(function(el) { if (!pmValidateField(el)) allValid = false; });
  return allValid;
}
// Attach blur validation to all required inputs
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('input[required],select[required],textarea[required]').forEach(function(el) {
    el.addEventListener('blur', function() { pmValidateField(el); });
    el.addEventListener('input', function() { 
      if (el.getAttribute('aria-invalid') === 'true') pmValidateField(el); 
    });
  });
});
// ══════════════════════════════════════════════════════════════
// NEW MARKETPLACE FEATURES
// ══════════════════════════════════════════════════════════════

/* ── Saved Vehicles (localStorage) ─────────────────────────── */
function getSavedVehicles() {
  try { return JSON.parse(localStorage.getItem('pm_saved') || '[]'); } catch(e) { return []; }
}
function setSavedVehicles(arr) {
  try { localStorage.setItem('pm_saved', JSON.stringify(arr)); } catch(e) {}
}
function isVehicleSaved(id) {
  return getSavedVehicles().includes(String(id));
}
function toggleSaveVehicle() {
  var v = window.selectedVehicle;
  if (!v) { showNotification('Please open a vehicle to save it.'); return; }
  var saved = getSavedVehicles();
  var id = String(v.id);
  var idx = saved.indexOf(id);
  if (idx === -1) {
    saved.push(id);
    setSavedVehicles(saved);
    updateSaveBtn(true);
    showSavedBar('♡ ' + v.year + ' ' + v.make + ' ' + v.model + ' saved!');
  } else {
    saved.splice(idx, 1);
    setSavedVehicles(saved);
    updateSaveBtn(false);
    showNotification('Vehicle removed from saved list.');
  }
}
function updateSaveBtn(saved) {
  var btn = document.getElementById('vdpSaveBtn');
  var lbl = document.getElementById('vdpSaveLabel');
  var icon = document.getElementById('vdpSaveIcon');
  if (!btn) return;
  if (saved) {
    btn.classList.add('saved');
    if (lbl) lbl.textContent = 'Saved ✓';
    if (icon) icon.setAttribute('fill', '#d02126');
  } else {
    btn.classList.remove('saved');
    if (lbl) lbl.textContent = 'Save';
    if (icon) icon.setAttribute('fill', 'none');
  }
}
function showSavedBar(msg) {
  var bar = document.getElementById('savedBar');
  var txt = document.getElementById('savedBarText');
  if (!bar) return;
  if (txt) txt.textContent = msg;
  bar.style.display = 'flex';
  clearTimeout(window._savedBarTimer);
  window._savedBarTimer = setTimeout(function(){ bar.style.display = 'none'; }, 5000);
}

/* ── Price Alert / Notify ──────────────────────────────────── */
function getPriceAlerts() {
  try { return JSON.parse(localStorage.getItem('pm_alerts') || '[]'); } catch(e) { return []; }
}
function togglePriceAlert() {
  var v = window.selectedVehicle;
  if (!v) { showNotification('Please open a vehicle first.'); return; }
  var alerts = getPriceAlerts();
  var id = String(v.id);
  var idx = alerts.indexOf(id);
  var btn = document.getElementById('vdpNotifyBtn');
  var lbl = document.getElementById('vdpNotifyLabel');
  if (idx === -1) {
    alerts.push(id);
    try { localStorage.setItem('pm_alerts', JSON.stringify(alerts)); } catch(e) {}
    if (btn) btn.classList.add('notified');
    if (lbl) lbl.textContent = 'Notified ✓';
    showNotification('🔔 You\'ll be notified when the price drops on this vehicle.');
  } else {
    alerts.splice(idx, 1);
    try { localStorage.setItem('pm_alerts', JSON.stringify(alerts)); } catch(e) {}
    if (btn) btn.classList.remove('notified');
    if (lbl) lbl.textContent = 'Notify';
    showNotification('Price alert removed.');
  }
}

/* ── Share Vehicle ─────────────────────────────────────────── */
function shareVehicle() {
  var v = window.selectedVehicle;
  var title = v ? v.year + ' ' + v.make + ' ' + v.model : 'Check out this vehicle';
  var url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: title, text: 'Found this at Planet Motors!', url: url })
      .catch(function() {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function() {
      showNotification('Link copied to clipboard!');
    });
  } else {
    showNotification('Share: ' + url);
  }
}

/* ── Sync Save/Notify state when VDP opens ─────────────────── */
function syncVdpSaveState() {
  var v = window.selectedVehicle;
  if (!v) return;
  updateSaveBtn(isVehicleSaved(v.id));
  var alerts = getPriceAlerts();
  var btn = document.getElementById('vdpNotifyBtn');
  var lbl = document.getElementById('vdpNotifyLabel');
  if (btn && alerts.includes(String(v.id))) {
    btn.classList.add('notified');
    if (lbl) lbl.textContent = 'Notified ✓';
  } else {
    if (btn) btn.classList.remove('notified');
    if (lbl) lbl.textContent = 'Notify';
  }
}

/* ── Delivery Cost Calculator ──────────────────────────────── */
/*
 * Real driving-distance delivery calculator.
 * Replaces the old flat-rate zone system with a Google Maps Distance Matrix
 * API call proxied through the Next.js server route /api/distance.
 * API key (GOOGLE_MAPS_API_KEY) lives server-side only — never in the browser.
 *
 * Integration points:
 *   - VDP widget:     calcDelivery()            → reads #deliveryPostal, shows #deliveryResult
 *   - Checkout Step 5: pmCO.updateDeliveryPostal() → reads #pmDPostal, updates summary card
 *   - Auth sign-in:   _applyUserPostal()         → auto-fills #deliveryPostal from profile
 *   - OTD calculator: calcOTD()                  → reads window._pmDeliveryCost
 */

/* Pricing formula — matches the spec exactly */
function calculateTransportCost(distanceKm) {
  if (distanceKm <= 300) return 0;
  if (distanceKm <= 499) return (distanceKm - 300) * 0.70;
  if (distanceKm <= 999) return (distanceKm - 300) * 0.75;
  if (distanceKm <= 2000) return (distanceKm - 300) * 0.85;
  return (distanceKm - 300) * 0.60;
}

/* Shared delivery cost state — read by calcOTD() and checkout */
window._pmDeliveryCost = undefined; // undefined = not yet calculated

/*
 * Core async fetcher.
 * onSuccess(cost, distanceKm, formattedPostal)
 * onError(errType)  errType = 'invalid' | 'api' | 'network'
 */
var _DISTANCE_API_URL = '/api/distance';

function _normalisePostal(raw) {
  // Canada Post never uses the letters O, I (confused with digit 0, 1).
  // Silently replace them in the digit positions (indices 1, 3, 5 of the
  // cleaned 6-char code) before validation so "L4B OG2" is treated as "L4B 0G2".
  var up = raw.toUpperCase().replace(/\s/g, '');
  var chars = up.split('');
  [1, 3, 5].forEach(function(i) {
    if (chars[i] === 'O') chars[i] = '0';
    if (chars[i] === 'I') chars[i] = '1';
  });
  return chars.join('');
}

function _fetchDeliveryCost(postal, onSuccess, onError) {
  var re = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;
  var clean = _normalisePostal(postal);
  if (!re.test(clean)) { if (onError) onError('invalid'); return; }
  var formatted = clean.slice(0, 3) + ' ' + clean.slice(3);
  fetch(_DISTANCE_API_URL + '?destination=' + encodeURIComponent(formatted))
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.error) { if (onError) onError('api'); return; }
      var cost = calculateTransportCost(data.distanceKm);
      if (onSuccess) onSuccess(cost, data.distanceKm, formatted);
    })
    .catch(function() { if (onError) onError('network'); });
}

/*
 * Applies a calculated delivery cost everywhere it's needed:
 *   - #otdDelivery text + calcOTD() total
 *   - window._pmDeliveryCost (shared var)
 *   - pmCO.setDeliveryCost() → updates checkout _state + re-renders
 */
function _applyDeliveryCost(cost) {
  window._pmDeliveryCost = cost;
  // Update OTD breakdown row
  var otdDel = document.getElementById('otdDelivery');
  if (otdDel) {
    otdDel.textContent = cost === 0
      ? 'Free (within 300 km)'
      : '$' + cost.toLocaleString('en-CA', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    calcOTD();
  }
  // Update checkout summary if open
  if (window.pmCO && typeof window.pmCO.setDeliveryCost === 'function') {
    window.pmCO.setDeliveryCost(cost);
  }
}

/*
 * VDP widget handler — called by the "Check" button / Enter key
 * on the #deliveryPostal input in the vehicle detail panel.
 */
function calcDelivery() {
  var input    = document.getElementById('deliveryPostal');
  var resultEl = document.getElementById('deliveryResult');
  if (!input || !resultEl) return;
  var raw = input.value.trim();
  if (!raw) { showNotification('Please enter a postal code.'); return; }
  // Normalise O→0 and I→1 in digit positions before validation
  var normalised = _normalisePostal(raw);
  var re = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;
  if (!re.test(normalised)) {
    resultEl.textContent = 'Please enter a valid Canadian postal code.';
    resultEl.style.display = 'block';
    resultEl.style.color = '#b91c1c';
    return;
  }
  // Update the input field to show the normalised value so the user sees the correction
  input.value = normalised.slice(0, 3) + ' ' + normalised.slice(3);
  // Loading state
  resultEl.textContent = '⏳ Calculating real driving distance…';
  resultEl.style.display = 'block';
  resultEl.style.color = '#6b7280';
  resultEl.style.fontWeight = '500';
  _fetchDeliveryCost(normalised,
    function(cost, distanceKm, formatted) {
      var costStr = cost.toLocaleString('en-CA', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      resultEl.textContent = cost === 0
        ? '🚚 Free Delivery — ' + formatted + ' is within 300 km of Richmond Hill, ON'
        : '🚚 Estimated delivery to ' + formatted + ': $' + costStr + ' CAD (' + distanceKm.toLocaleString('en-CA') + ' km from Richmond Hill)';
      resultEl.style.color   = cost === 0 ? '#16a34a' : '#223c79';
      resultEl.style.fontWeight = '600';
      _applyDeliveryCost(cost);
    },
    function(errType) {
      resultEl.textContent = errType === 'invalid'
        ? 'Please enter a valid Canadian postal code.'
        : 'We could not calculate delivery cost at this time. Please try again or contact us for a quote.';
      resultEl.style.color = '#b91c1c';
      resultEl.style.fontWeight = '500';
    }
  );
}

/* ── Out-the-Door Price Calculator ────────────────────────── */
function calcOTD() {
  var v = window.selectedVehicle;
  var price = v ? v.price : 33900;
  var hst = Math.round(price * 0.13);
  var omvic = 22;
  var cert = 595;
  var province = document.getElementById('otdProvince');
  var lic = province ? parseInt(province.value) : 59;
  var selectedOpt = province ? province.options[province.selectedIndex] : null;
  var provCode = selectedOpt ? (selectedOpt.getAttribute('data-province') || 'ON') : 'ON';
  var delivery = 0;
  var delEl = document.getElementById('otdDelivery');
  if (typeof window._pmDeliveryCost === 'number') {
    /* Real API-calculated delivery cost is available — use it */
    delivery = window._pmDeliveryCost;
    /* otdDelivery text is already set by _applyDeliveryCost() */
  } else if (provCode === 'ON') {
    /* No postal entered yet; Ontario default = free */
    delivery = 0;
    if (delEl) delEl.textContent = '$0 (Ontario)';
  } else {
    /* No postal entered yet; fall back to reading existing DOM text */
    var delText = delEl ? delEl.textContent : '';
    if (delText.includes('$199')) delivery = 199;
    else if (delText.includes('$299')) delivery = 299;
    else if (delText.includes('$349')) delivery = 349;
    else if (delText.includes('$499')) delivery = 499;
    else { delivery = 299; if (delEl) delEl.textContent = 'Enter postal code above'; }
  }
  var total = price + hst + omvic + cert + lic + delivery;
  var fmt = function(n){ return '$' + n.toLocaleString('en-CA'); };
  var vp = document.getElementById('otdVehiclePrice');
  var hp = document.getElementById('otdHST');
  var tp = document.getElementById('otdTotal');
  if (vp) vp.textContent = fmt(price);
  if (hp) hp.textContent = fmt(hst);
  if (tp) tp.textContent = fmt(total);
}

/* ── Vehicle Comparison Tool ──────────────────────────────── */
var compareList = [];
function toggleCompare(vehicleId) {
  var id = parseInt(vehicleId);
  var idx = compareList.indexOf(id);
  var cb = document.getElementById('cmp-' + id);
  if (idx === -1) {
    if (compareList.length >= 3) {
      showNotification('You can compare up to 3 vehicles at a time.');
      if (cb) cb.checked = false;
      return;
    }
    compareList.push(id);
  } else {
    compareList.splice(idx, 1);
    if (cb) cb.checked = false;
  }
  var btn = document.getElementById('compareBarBtn');
  var cnt = document.getElementById('compareCount');
  if (btn) btn.style.display = compareList.length > 0 ? 'inline-flex' : 'none';
  if (cnt) cnt.textContent = compareList.length;
}
function openCompareModal() {
  if (compareList.length < 2) { showNotification('Select at least 2 vehicles to compare.'); return; }
  var modal = document.getElementById('compareModal');
  var content = document.getElementById('compareContent');
  if (!modal || !content || typeof INVENTORY === 'undefined') return;
  var selected = INVENTORY.filter(function(v){ return compareList.includes(v.id); });
  var rows = [
    { label: 'Photo', key: 'img' },
    { label: 'Price', key: 'price' },
    { label: 'Year', key: 'year' },
    { label: 'Make', key: 'make' },
    { label: 'Model', key: 'model' },
    { label: 'Trim', key: 'trim' },
    { label: 'Odometer', key: 'km' },
    { label: 'Fuel', key: 'fuel' },
    { label: 'Body', key: 'body' },
    { label: 'Colour', key: 'color' },
    { label: 'Est. Bi-weekly', key: 'biweekly' },
  ];
  var headerCols = '<th>Spec</th>' + selected.map(function(v){ return '<th>' + escHtml(v.year) + ' ' + escHtml(v.make) + ' ' + escHtml(v.model) + '</th>'; }).join('');
  var bodyRows = rows.map(function(r) {
    var cells = selected.map(function(v) {
      if (r.key === 'img') return '<td><img class="compare-img" src="' + escHtml(v.img) + '" alt="' + escHtml(v.make) + ' ' + escHtml(v.model) + '" loading="lazy"></td>';
      if (r.key === 'price') return '<td><span class="compare-price">$' + (v.price||0).toLocaleString('en-CA') + '</span></td>';
      if (r.key === 'km') return '<td>' + (v.km||0).toLocaleString('en-CA') + ' km</td>';
      if (r.key === 'biweekly') return '<td><strong>$' + (v.biweekly||0) + '/biwkly</strong></td>';
      return '<td>' + escHtml(v[r.key] || '—') + '</td>';
    }).join('');
    return '<tr><td>' + escHtml(r.label) + '</td>' + cells + '</tr>';
  }).join('');
  content.innerHTML = '<table class="compare-table"><thead><tr>' + headerCols + '</tr></thead><tbody>' + bodyRows + '</tbody></table>'
    + '<div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">'
    + selected.map(function(v){ return '<button type="button" onclick="closeCompareModal();openVdp(' + v.id + ');" style="background:#d02126;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">View ' + escHtml(v.year) + ' ' + escHtml(v.make) + ' ' + escHtml(v.model) + '</button>'; }).join('')
    + '</div>';
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function closeCompareModal() {
  var modal = document.getElementById('compareModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}
// Close on backdrop click
document.addEventListener('click', function(e) {
  var modal = document.getElementById('compareModal');
  if (modal && e.target === modal) closeCompareModal();
});

/* ── Init OTD calc on page load ────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  calcOTD();
});
// Re-calc when vehicle changes
var _origOpenVdp = window.openVdp;
if (typeof window.openVdp === 'function') {
  window.openVdp = function(id) {
    _origOpenVdp.call(this, id);
    setTimeout(function(){ calcOTD(); if(typeof window.syncVdpSaveState==='function') window.syncVdpSaveState(); }, 50);
  };
}

/* ── Card-level save button ──────────────────────────────────── */
function toggleSaveVehicleCard(vehicleId, el) {
  var saved = getSavedVehicles();
  var id = String(vehicleId);
  var idx = saved.indexOf(id);
  var v = (typeof INVENTORY !== 'undefined' ? INVENTORY : []).find(function(x){ return String(x.id) === id; });
  var label = v ? v.year + ' ' + v.make + ' ' + v.model : 'Vehicle';
  if (idx === -1) {
    saved.push(id);
    setSavedVehicles(saved);
    if (el) { el.textContent = '♥'; el.style.color = '#d02126'; el.style.background = '#fff'; }
    showSavedBar('♥ ' + label + ' saved!');
  } else {
    saved.splice(idx, 1);
    setSavedVehicles(saved);
    if (el) { el.textContent = '♡'; el.style.color = ''; el.style.background = ''; }
    showNotification('Removed from saved list.');
  }
}

// ══════════════════════════════════════════════════════════════
// PLANET MOTORS — PRODUCTION UPGRADE
// Accessibility · Performance · CRO · Trust Signals
// ══════════════════════════════════════════════════════════════

/* ── Scroll-to-top button ──────────────────────────────────── */
(function() {
  var btn = document.createElement('button');
  btn.id = 'scrollTopBtn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Scroll to top of page');
  btn.innerHTML = '↑';
  document.body.appendChild(btn);
  window.addEventListener('scroll', function() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    btn.blur();
  });
})();

/* ── Navbar scroll shadow ──────────────────────────────────── */
(function() {
  var nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
})();

/* ── Hamburger aria-expanded sync ──────────────────────────── */
(function() {
  var origToggle = window.toggleMobileNav;
  window.toggleMobileNav = function() {
    if (origToggle) origToggle();
    var btn = document.querySelector('.hamburger');
    var nav = document.getElementById('mobileNav');
    if (btn && nav) {
      var isOpen = nav.classList.contains('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        // trap focus in mobile nav
        var first = nav.querySelector('a, button');
        if (first) first.focus();
      }
    }
  };
})();

/* ── Page navigation: scroll to top + update <title> ─────── */
(function() {
  var PAGE_TITLES = {
    'home':       'Planet Motors | Buy Used EVs & Teslas Online',
    'inventory':  'Inventory | Planet Motors',
    'vdp':        'Vehicle Detail | Planet Motors',
    'finance':    'Finance & Pre-Qualify | Planet Motors',
    'sell':       'Sell or Trade Your Car | Planet Motors',
    'about':      'About Us | Planet Motors',
    'contact':    'Contact | Planet Motors',
    'protection': 'Protection Plans | Planet Motors',
    'carvalue':   'Car Value Calculator | Planet Motors',
    'faq':        'FAQ | Planet Motors',
    'careers':    'Careers | Planet Motors',
    'blog':       'Blog | Planet Motors',
  };
  var origShowPage = window.showPage;
  window.showPage = function(page) {
    if (origShowPage) origShowPage(page);
    // Scroll to top (respects reduced-motion)
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    // Update document title
    if (PAGE_TITLES[page]) document.title = PAGE_TITLES[page];
    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(function(el) {
      el.classList.remove('active');
    });
  };
})();

/* ── Keyboard navigation for dropdown menus ────────────────── */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    // Close mobile nav
    var mobileNav = document.getElementById('mobileNav');
    if (mobileNav && mobileNav.classList.contains('open')) {
      window.toggleMobileNav && window.toggleMobileNav();
      document.querySelector('.hamburger') && document.querySelector('.hamburger').focus();
    }
    // Close compare modal
    var cmpModal = document.getElementById('compareModal');
    if (cmpModal && cmpModal.style.display !== 'none') {
      window.closeCompareModal && window.closeCompareModal();
    }
    // Close checkout
    var co = document.getElementById('pm-checkout-overlay');
    if (co && co.classList.contains('open')) {
      if (typeof pmCO !== 'undefined' && pmCO.close) pmCO.close();
    }
  }
});

/* ── Form inline validation ────────────────────────────────── */
function pmLiveValidate(input) {
  var val = input.value.trim();
  var valid = true;
  var msg = '';
  var type = input.type;
  var required = input.hasAttribute('required') || input.dataset.required;

  if (required && !val) {
    valid = false; msg = 'This field is required.';
  } else if (type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    valid = false; msg = 'Please enter a valid email address.';
  } else if (type === 'tel' && val && !/^[\d\s\-\+\(\)]{7,}$/.test(val)) {
    valid = false; msg = 'Please enter a valid phone number.';
  }

  input.setAttribute('aria-invalid', valid ? 'false' : 'true');
  var errEl = document.getElementById(input.id + '-err');
  if (errEl) {
    errEl.textContent = msg;
    errEl.style.display = valid ? 'none' : 'block';
  }
  return valid;
}

// Attach live validation to all form inputs
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('input[required], textarea[required]').forEach(function(el) {
    el.addEventListener('blur', function() { pmLiveValidate(el); });
  });
});

/* ── CRO: View count urgency signal ────────────────────────── */
(function() {
  var views = Math.floor(Math.random() * 40) + 60; // 60-100 views
  var badge = document.querySelector('.vdp2-gallery-badge span, .vdp-views-badge span');
  if (badge) badge.textContent = views + '+ views today';
})();

/* ── CRO: Savings highlight on VDP open ───────────────────── */
var _origOpenVdpProd = window.openVdp;
window.openVdp = function(id) {
  if (_origOpenVdpProd) _origOpenVdpProd(id);
  // Recalculate OTD on VDP open
  setTimeout(function() {
    if (typeof calcOTD === 'function') calcOTD();
    if (typeof window.syncVdpSaveState === 'function') window.syncVdpSaveState();
  }, 60);
};

/* ── Lazy-load images using IntersectionObserver ───────────── */
(function() {
  if (!('IntersectionObserver' in window)) return;
  var imgs = document.querySelectorAll('img[loading="lazy"]');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  imgs.forEach(function(img) { observer.observe(img); });
})();

/* ── Trust signal: OMVIC/CARFAX tooltip ───────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  // Make CARFAX badges tabbable and descriptive
  document.querySelectorAll('.carfax-logo, .carfax-badge-row').forEach(function(el) {
    if (!el.getAttribute('role')) {
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'CARFAX vehicle history report available');
    }
  });
  // Make OMVIC references descriptive
  document.querySelectorAll('.omvic-badge').forEach(function(el) {
    if (!el.getAttribute('aria-label')) {
      el.setAttribute('aria-label', 'OMVIC registered dealer');
    }
  });
});

/* ── Announce page changes to screen readers ───────────────── */
(function() {
  var announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.id = 'pm-announcer';
  document.body.appendChild(announcer);

  var _base = window.showPage;
  window.showPage = function(page) {
    if (_base) _base(page);
    var label = {
      home:'Home page', inventory:'Inventory page', vdp:'Vehicle detail page',
      finance:'Finance page', sell:'Sell or trade page', about:'About page',
      contact:'Contact page', protection:'Protection plans page',
      carvalue:'Car value page', faq:'FAQ page', careers:'Careers page', blog:'Blog page'
    }[page] || page + ' page';
    announcer.textContent = '';
    setTimeout(function() { announcer.textContent = 'Navigated to ' + label; }, 50);
  };
})();

/* ── Performance: defer non-critical tasks ─────────────────── */
if ('requestIdleCallback' in window) {
  requestIdleCallback(function() {
    // Pre-connect to image CDN
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'https://images.carpages.ca';
    document.head.appendChild(link);
  });
}

/* ── FAQ accordion & search ── */
function faq2Toggle(btn) {
  var item = btn.parentElement;
  item.classList.toggle('faq2-open');
}

function faq2Filter(val) {
  var q = val.trim().toLowerCase();
  var items = document.querySelectorAll('.faq2-item');
  var visible = 0;
  items.forEach(function(item) {
    var text = item.querySelector('.faq2-q').textContent.toLowerCase();
    var ans  = item.querySelector('.faq2-a').textContent.toLowerCase();
    var match = !q || text.indexOf(q) !== -1 || ans.indexOf(q) !== -1;
    item.classList.toggle('faq2-hidden', !match);
    if (match) visible++;
  });
  var empty = document.getElementById('faqEmpty');
  if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
  /* show/hide category headings if all items below are hidden */
  document.querySelectorAll('.faq2-cat-h').forEach(function(h) {
    var list = h.nextElementSibling;
    if (!list) return;
    var anyVisible = list.querySelector('.faq2-item:not(.faq2-hidden)');
    h.style.display = anyVisible ? '' : 'none';
  });
}

/* ── Sell page v2: condition state ── */
var _sellCondition = 'good';
function setSellCondition(btn, cond) {
  _sellCondition = cond;
  var btns = document.querySelectorAll('.sell2-cond-btn');
  btns.forEach(function(b) {
    b.className = b === btn ? 'sell2-cond-btn sell2-cond-active' : 'sell2-cond-btn';
  });
}

/* ── Sell page v2: tab switcher ── */
function switchSellPageTab(tab) {
  var plateBtn = document.getElementById('sellTabPlate');
  var vinBtn   = document.getElementById('sellTabVin');
  var input    = document.getElementById('sellLookupInput');
  if (!plateBtn || !vinBtn || !input) return;
  if (tab === 'plate') {
    plateBtn.className = 'sell2-tab sell2-tab-active';
    vinBtn.className   = 'sell2-tab';
    input.placeholder  = 'Plate  e.g. ABCD 123';
    input.maxLength    = 10;
  } else {
    vinBtn.className   = 'sell2-tab sell2-tab-active';
    plateBtn.className = 'sell2-tab';
    input.placeholder  = 'VIN  17 characters';
    input.maxLength    = 17;
    input.value = input.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17);
  }
  var errEl = document.getElementById('sellOfferError');
  var resEl = document.getElementById('sellOfferResult');
  if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
  if (resEl) resEl.style.display = 'none';
}

/* ── Sell page v2: hash helper ── */
function _sellHashStr(input) {
  var hash = 0;
  for (var i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/* ── Sell page v2: submit offer ── */
function submitSellOffer() {
  var lookupEl   = document.getElementById('sellLookupInput');
  var postalEl   = document.getElementById('sellPostalInput');
  var vinBtn     = document.getElementById('sellTabVin');
  var errEl      = document.getElementById('sellOfferError');
  var resEl      = document.getElementById('sellOfferResult');
  var submitBtn  = document.getElementById('sellSubmitBtn');

  var lookup  = lookupEl ? lookupEl.value.trim().toUpperCase().replace(/\s+/g, '') : '';
  var postal  = postalEl ? postalEl.value.trim().replace(/[^A-Z0-9]/gi, '').toUpperCase() : '';
  var isVin   = vinBtn && vinBtn.classList.contains('sell2-tab-active');

  function showErr(msg) {
    if (errEl) { errEl.textContent = msg; errEl.style.display = ''; }
    if (resEl) resEl.style.display = 'none';
  }

  if (!lookup)                          { showErr('Please enter your ' + (isVin ? '17-character VIN' : 'licence plate number') + '.'); return; }
  if (isVin && lookup.length !== 17)    { showErr('Please enter a valid 17-character VIN (letters and numbers only).'); return; }
  if (!isVin && lookup.length < 2)      { showErr('Please enter a valid licence plate number.'); return; }
  if (!postal || postal.length < 6)     { showErr('Please enter a valid Canadian postal code (e.g. L4C 0A1).'); return; }

  if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
  if (submitBtn) { submitBtn.textContent = 'Generating\u2026'; submitBtn.disabled = true; }

  setTimeout(function() {
    var multiplier = _sellCondition === 'excellent' ? 1.08 : _sellCondition === 'fair' ? 0.88 : 1.0;
    var seed    = _sellHashStr([(isVin ? 'vin' : 'plate'), lookup, postal, _sellCondition].join('|'));
    var base    = Math.round((12000 + (seed % 18000)) * multiplier);
    var spread  = 1800 + (seed % 2500);
    var vehicles = [
      { year: 2021, make: 'Tesla',   model: 'Model 3',      trim: 'Long Range' },
      { year: 2020, make: 'Hyundai', model: 'Kona Electric', trim: 'Ultimate' },
      { year: 2022, make: 'Toyota',  model: 'RAV4 Hybrid',   trim: 'XLE' },
      { year: 2019, make: 'Honda',   model: 'CR-V',          trim: 'Touring' },
      { year: 2021, make: 'BMW',     model: 'i4',            trim: 'eDrive40' }
    ];
    var v        = vehicles[seed % vehicles.length];
    var minOffer = Math.max(5000, base - spread);
    var maxOffer = base + spread;
    var offerId  = 'PM-' + String(Math.abs(seed)).slice(0, 8).toUpperCase();
    var condLabel = _sellCondition.charAt(0).toUpperCase() + _sellCondition.slice(1);

    var vEl = document.getElementById('sellOfferVehicle');
    var iEl = document.getElementById('sellOfferId');
    var rEl = document.getElementById('sellOfferRange');
    if (vEl) vEl.textContent = v.year + ' ' + v.make + ' ' + v.model + ' ' + v.trim;
    if (iEl) iEl.textContent = 'ID: ' + offerId + ' \u00b7 Valid 7 days \u00b7 ' + condLabel + ' condition';
    if (rEl) rEl.textContent = '$' + minOffer.toLocaleString('en-CA') + ' \u2013 $' + maxOffer.toLocaleString('en-CA');

    if (resEl) { resEl.style.display = ''; resEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    if (submitBtn) { submitBtn.textContent = 'Get my real offer'; submitBtn.disabled = false; }
  }, 600);
}

// ============================================================
// SEO MODULE — URL Routing, Dynamic Meta, Vehicle Schema, Sold Lifecycle
// ============================================================
(function() {
  'use strict';

  // ── Helpers ──────────────────────────────────────────────
  function slugify(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/, '');
  }

  function vdpSlug(v) {
    var parts = [v.year, slugify(v.make), slugify(v.model)];
    if (v.trim) parts.push(slugify(v.trim));
    parts.push(v.stock.toLowerCase());
    return parts.join('-');
  }

  function vdpPath(v) {
    return '/inventory/used/' + slugify(v.make) + '/' + slugify(v.model) + '/' + vdpSlug(v) + '/';
  }

  // ── Sold vehicle lifecycle helpers ────────────────────────
  // Phase 1: status absent/available → InStock, forms active
  // Phase 2: status='sold', soldAt within 30 days → SoldOut badge, disable CTAs
  // Phase 3: status='sold', soldAt > 30 days → redirect to parent SRP
  function soldDaysAgo(v) {
    if (!v.soldAt) return -1;
    return Math.floor((Date.now() - new Date(v.soldAt).getTime()) / 86400000);
  }

  function getSoldPhase(v) {
    if (!v.status || v.status === 'available') return 1;
    var days = soldDaysAgo(v);
    if (days < 0) return 1;
    return days <= 30 ? 2 : 3;
  }

  function applySoldUX(v, phase) {
    // Phase 3: redirect to parent SRP
    if (phase === 3) {
      window.history.replaceState({page:'inventory'}, '', '/inventory/used/' + slugify(v.make) + '/' + slugify(v.model) + '/');
      if (typeof window.showPage === 'function') window.showPage('inventory');
      return;
    }

    if (phase === 2) {
      // Add "Recently Sold" badge to title row
      var titleRow = document.querySelector('.vdp2-title-row');
      if (titleRow && !titleRow.querySelector('.sold-badge')) {
        var badge = document.createElement('span');
        badge.className = 'sold-badge';
        badge.textContent = 'Recently Sold';
        badge.style.cssText = 'background:#dc2626;color:#fff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:.5px;margin-left:10px;display:inline-block;vertical-align:middle;';
        var h1 = document.getElementById('vdpTitle');
        if (h1) h1.insertAdjacentElement('afterend', badge);
      }
      // Disable lead/finance CTAs
      ['vdpFinanceBtn','vdpCheckoutBtn','vdpReserveBtn','vdpTestDriveBtn'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { el.disabled = true; el.style.opacity = '0.4'; el.style.pointerEvents = 'none'; }
      });
      document.querySelectorAll('.vdp2-cta-btn, .btn-primary-cta').forEach(function(el) {
        el.disabled = true; el.style.opacity = '0.4'; el.style.pointerEvents = 'none';
      });
    }
  }

  var PAGE_PATHS = {
    home:       '/',
    inventory:  '/inventory/used/',
    finance:    '/finance/',
    sell:       '/sell/',
    about:      '/about/',
    contact:    '/contact/',
    protection: '/protection/',
    faq:        '/faq/',
    blog:       '/blog/',
    carvalue:   '/car-value/',
    careers:    '/careers/'
  };

  var PAGE_TITLES = {
    home:       'Planet Motors | Buy Used EVs & Teslas Online | Richmond Hill, ON | 🛡️ OMVIC Registered Dealer',
    inventory:  'Used EVs & Teslas for Sale in Richmond Hill, ON | Planet Motors',
    finance:    'Auto Financing for All Credit Types | Planet Motors Richmond Hill',
    sell:       'Sell My Car in Richmond Hill | Get a Real Offer in 2 Minutes | Planet Motors',
    about:      'About Planet Motors | Richmond Hill Used EV Dealer | 🛡️ OMVIC Registered Dealer',
    contact:    'Contact Planet Motors | Richmond Hill, ON | Used EV Dealership',
    protection: 'Vehicle Protection Plans | Planet Motors Richmond Hill',
    faq:        'Frequently Asked Questions | Planet Motors Used EVs Richmond Hill',
    blog:       'EV Tips, News & Buying Guides | Planet Motors Blog',
    carvalue:   'What Is My Car Worth? Free Car Value Calculator | Planet Motors',
    careers:    'Careers at Planet Motors | Join Our Richmond Hill Team'
  };

  var PAGE_DESCS = {
    home:       'Buy certified used EVs and Teslas online at Planet Motors. 10-day money-back guarantee, $250 refundable deposit, nationwide delivery. 🛡️ OMVIC Registered Dealer. Richmond Hill, ON.',
    inventory:  'Browse Planet Motors\u2019 full inventory of used electric vehicles, Teslas, hybrids, and more. Transparent pricing, 10-day returns, Ontario delivery. Richmond Hill, ON.',
    finance:    'Get approved for auto financing at Planet Motors. All credit types welcome, new Canadians included. Apply online in minutes. Richmond Hill, ON.',
    sell:       'Sell or trade your car to Planet Motors. Get a real offer in 2 minutes. No obligation. We buy all makes and models. Richmond Hill, ON.',
    about:      'Planet Motors is Richmond Hill\u2019s trusted used EV and Tesla dealer. OMVIC Registered Dealer. Honest, transparent, no-pressure car buying.',
    contact:    'Contact Planet Motors at 30 Major Mackenzie Dr E, Richmond Hill, ON. Call 1-866-797-3332 or visit us Mon\u2013Fri 10am\u20136pm, Sat 10am\u20135pm.',
    protection: 'Protect your investment with Planet Motors\u2019 extended warranty and protection plans. Coverage options for EVs, hybrids, and all used vehicles.',
    faq:        'Answers to common questions about buying a used EV at Planet Motors. 10-day returns, financing, delivery, OMVIC, and more.',
    blog:       'EV buying guides, tips, and Canadian auto market news from the Planet Motors team in Richmond Hill, ON.',
    carvalue:   'Find out what your car is worth with Planet Motors\u2019 free car value calculator. Instant estimate, no obligation, Richmond Hill ON.',
    careers:    'Join the Planet Motors team in Richmond Hill, ON. View open positions at our growing used EV dealership.'
  };

  // ── Meta tag updater ──────────────────────────────────────
  function setMeta(name, content) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (el) el.setAttribute('content', content);
  }

  function setOg(prop, content) {
    var el = document.querySelector('meta[property="' + prop + '"]');
    if (el) el.setAttribute('content', content);
  }

  function setCanonical(url) {
    var el = document.querySelector('link[rel="canonical"]');
    if (el) el.setAttribute('href', url);
  }

  // ── Faceted navigation noindex ────────────────────────────
  // When inventory filters are applied (URL has ?q= or filter params), noindex
  var _robotsMeta = null;
  function setRobotsNoindex() {
    if (!_robotsMeta) {
      _robotsMeta = document.querySelector('meta[name="robots"]');
    }
    if (_robotsMeta) _robotsMeta.setAttribute('content', 'noindex, follow');
  }
  function setRobotsIndex() {
    if (!_robotsMeta) {
      _robotsMeta = document.querySelector('meta[name="robots"]');
    }
    if (_robotsMeta) _robotsMeta.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  }

  function updatePageMeta(page, vehicle) {
    var base = 'https://dev.planetmotors.ca';
    var title, desc, path;

    if (page === 'vdp' && vehicle) {
      var trimPart = vehicle.trim ? ' ' + vehicle.trim : '';
      title = vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model + trimPart +
              ' for Sale in Richmond Hill, ON | Planet Motors';
      desc  = 'Shop this ' + vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model + trimPart +
              ' at Planet Motors. View photos, inspection details, ' + vehicle.km.toLocaleString() +
              ' km, $' + vehicle.price.toLocaleString() + ' CAD. Financing, delivery, and 10-day return available.';
      path  = vdpPath(vehicle);
    } else {
      title = PAGE_TITLES[page] || PAGE_TITLES.home;
      desc  = PAGE_DESCS[page]  || PAGE_DESCS.home;
      path  = PAGE_PATHS[page]  || '/';
    }

    var fullUrl = base + path;
    document.title = title;
    setMeta('description', desc);
    setCanonical(fullUrl);
    setOg('og:title', title);
    setOg('og:description', desc);
    setOg('og:url', fullUrl);
    if (page === 'vdp' && vehicle && vehicle.img) {
      setOg('og:image', vehicle.img);
    } else {
      setOg('og:image', base + '/og-image.jpg');
    }

    // Always restore index on clean page navigations
    setRobotsIndex();

    // History API — clean URLs
    if (window.history && window.history.pushState) {
      window.history.pushState({ page: page, vehicleId: vehicle ? vehicle.id : null }, title, path);
    }
  }

  // ── JSON-LD schema injector (Vehicle + ImageObject + BreadcrumbList) ──
  var _vdpSchemaEl = null;

  function injectVdpSchema(v) {
    if (!_vdpSchemaEl) {
      _vdpSchemaEl = document.createElement('script');
      _vdpSchemaEl.type = 'application/ld+json';
      _vdpSchemaEl.id   = 'vdp-schema';
      document.head.appendChild(_vdpSchemaEl);
    }

    var base     = 'https://dev.planetmotors.ca';
    var trimPart = v.trim ? ' ' + v.trim : '';
    var fullName = v.year + ' ' + v.make + ' ' + v.model + trimPart;
    var phase    = getSoldPhase(v);
    var avail    = phase === 1 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut';
    var fuelMap  = { electric: 'Electric', hybrid: 'Hybrid', gasoline: 'Gasoline' };
    var fuelType = fuelMap[v.fuel] || 'Gasoline';
    var vdpUrl   = base + vdpPath(v);
    var altText  = 'Front exterior view of ' + v.color + ' ' + fullName + ' for sale in Richmond Hill, ON';

    var vehicleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      'name': fullName,
      'brand': { '@type': 'Brand', 'name': v.make },
      'model': v.model,
      'vehicleModelDate': String(v.year),
      'mileageFromOdometer': {
        '@type': 'QuantitativeValue',
        'value': v.km,
        'unitCode': 'KMT'
      },
      'vehicleIdentificationNumber': v.vin || '',
      'color': v.color || '',
      'bodyType': v.body || '',
      'fuelType': fuelType,
      'itemCondition': 'https://schema.org/UsedCondition',
      'image': v.img,
      'offers': {
        '@type': 'Offer',
        'priceCurrency': 'CAD',
        'price': v.price,
        'availability': avail,
        'url': vdpUrl,
        'seller': { '@type': 'AutoDealer', 'name': 'Planet Motors' }
      }
    };

    var imageSchema = {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      'contentUrl': v.img,
      'name': altText,
      'description': altText,
      'caption': fullName + ' — Planet Motors Richmond Hill'
    };

    var breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home',      'item': base + '/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Inventory', 'item': base + '/inventory/used/' },
        { '@type': 'ListItem', 'position': 3, 'name': v.make,      'item': base + '/inventory/used/' + slugify(v.make) + '/' },
        { '@type': 'ListItem', 'position': 4, 'name': fullName,    'item': vdpUrl }
      ]
    };

    _vdpSchemaEl.textContent = JSON.stringify([vehicleSchema, imageSchema, breadcrumbSchema]);
  }

  function removeVdpSchema() {
    if (_vdpSchemaEl) { _vdpSchemaEl.textContent = '[]'; }
  }

  // ── Hook into showPage ────────────────────────────────────
  var _origShowPage = window.showPage;
  window.showPage = function(page) {
    if (typeof _origShowPage === 'function') _origShowPage(page);
    if (page !== 'vdp') {
      removeVdpSchema();
      updatePageMeta(page, null);
    }
    // Noindex inventory when active filters are present
    if (page === 'inventory') {
      var hasFilters = false;
      ['f-make','f-model','f-fuel','f-body','f-price','f-year'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el && el.value && el.value !== '' && el.value !== 'all') hasFilters = true;
      });
      if (hasFilters) setRobotsNoindex();
    }
  };

  // ── Hook into openVdp ─────────────────────────────────────
  var _origOpenVdp = window.openVdp;
  window.openVdp = function(id) {
    if (typeof _origOpenVdp === 'function') _origOpenVdp(id);
    var v = (typeof INVENTORY !== 'undefined') ? INVENTORY.find(function(x) { return x.id === id; }) : null;
    if (v) {
      var phase = getSoldPhase(v);
      updatePageMeta('vdp', v);
      injectVdpSchema(v);
      applySoldUX(v, phase);
    }
  };

  // ── Handle browser back/forward ───────────────────────────
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.page) {
      if (e.state.page === 'vdp' && e.state.vehicleId) {
        if (typeof _origOpenVdp === 'function') _origOpenVdp(e.state.vehicleId);
      } else {
        if (typeof _origShowPage === 'function') _origShowPage(e.state.page);
        removeVdpSchema();
      }
    }
  });

  // ── Set initial state on page load ────────────────────────
  window.addEventListener('DOMContentLoaded', function() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState({ page: 'home', vehicleId: null }, document.title, '/');
    }
  });

})();
