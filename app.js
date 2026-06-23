// ── GLOBAL TOOLTIP ──
const gTip = document.getElementById('g-tooltip');
let tipTimer;
document.addEventListener('mouseover', e => {
  const btn = e.target.closest('[data-tip]');
  if (!btn) return;
  clearTimeout(tipTimer);
  const rect = btn.getBoundingClientRect();
  gTip.textContent = btn.dataset.tip;
  gTip.style.opacity = '0';
  gTip.style.display = 'block';
  // Posisi: bawah tombol, tengah horizontal
  let left = rect.left + rect.width / 2;
  let top = rect.bottom + 8;
  // Clamp agar tidak keluar layar kanan/kiri
  const tw = gTip.offsetWidth;
  if (left - tw/2 < 8) left = tw/2 + 8;
  if (left + tw/2 > window.innerWidth - 8) left = window.innerWidth - tw/2 - 8;
  gTip.style.left = left + 'px';
  gTip.style.top = top + 'px';
  tipTimer = setTimeout(() => { gTip.style.opacity = '1'; }, 80);
});
document.addEventListener('mouseout', e => {
  const btn = e.target.closest('[data-tip]');
  if (!btn) return;
  clearTimeout(tipTimer);
  gTip.style.opacity = '0';
});
// ══════════════════════════════════════════
//  DATA STORE
// ══════════════════════════════════════════
let barang = JSON.parse(localStorage.getItem('sg2_brg') || '[]');
let transMasuk = JSON.parse(localStorage.getItem('sg2_msk') || '[]');
let transKeluar = JSON.parse(localStorage.getItem('sg2_klr') || '[]');
let activities = JSON.parse(localStorage.getItem('sg2_act') || '[]');
let users = JSON.parse(localStorage.getItem('sg2_usr') || '[]');
let kategoriList = JSON.parse(localStorage.getItem('sg2_kat') || '[]');
let curUser = null;

// ──────────────────────────────────────────
// SEED DATA
// ──────────────────────────────────────────
function seedData() {
  // Hanya seed SEKALI saat pertama kali aplikasi dijalankan (belum pernah ada install).
  // Sebelumnya kode ini cek "if (!barang.length)" / "if (!kategoriList.length)" yang
  // menyebabkan data demo muncul lagi setiap kali semua barang/kategori dihapus habis,
  // bahkan saat refresh biasa. Sekarang dipakai flag terpisah agar array kosong
  // (karena memang sengaja dihapus semua oleh user) tidak ditimpa ulang.
  const alreadySeeded = localStorage.getItem('sg2_seeded') === '1';
  if (alreadySeeded) return;

  if (!barang.length) {
    barang = [
      {kode:'BRG-001',nama:'ONT Huawei HG8245H5',kategori:'Ont/Modem',satuan:'Pcs',stok:20,min:5,harga:350000,lokasi:'Rak A-1',ket:'GPON'},
      {kode:'BRG-002',nama:'Adaptor 12V 1A',kategori:'Adaptor',satuan:'Pcs',stok:30,min:10,harga:35000,lokasi:'Rak A-2',ket:''},
      {kode:'BRG-003',nama:'SFP GPON Class B+',kategori:'SFP',satuan:'Pcs',stok:15,min:5,harga:120000,lokasi:'Rak B-1',ket:''},
      {kode:'BRG-004',nama:'Kabel Fiber 4 Core',kategori:'Kabel fiber 4 core',satuan:'Meter',stok:500,min:100,harga:8000,lokasi:'Rak C-1',ket:''},
      {kode:'BRG-005',nama:'Pasif Splitter 1:8',kategori:'Pasif box 1:8',satuan:'Pcs',stok:10,min:5,harga:85000,lokasi:'Rak D-1',ket:''},
      {kode:'BRG-006',nama:'Box ODP 1:16',kategori:'Box odp 1:16',satuan:'Pcs',stok:5,min:3,harga:250000,lokasi:'Rak D-2',ket:''},
      {kode:'BRG-007',nama:'Klem Kabel / Pax 50pcs',kategori:'Klem kabel / pax isi 50pcs',satuan:'Pcs',stok:20,min:5,harga:15000,lokasi:'Rak E-1',ket:''},
      {kode:'BRG-008',nama:'Kabel LAN 1m',kategori:'Kabel lan 1m',satuan:'Pcs',stok:50,min:10,harga:12000,lokasi:'Rak E-2',ket:'Cat6'},
    ];
  }
  if (!users.length) {
    users = [
      { id:'u1', nama:'Super Admin', username:'admin', password:'admin123', email:'admin@gudang.id', role:'admin', aktif:true,
        perms:{view:true,add:true,edit:true,delete:true,masuk:true,keluar:true,laporan:true,export:true}, tgl: now() },
      { id:'u2', nama:'Budi Santoso', username:'operator1', password:'op123', email:'budi@gudang.id', role:'operator', aktif:true,
        perms:{view:true,add:false,edit:false,delete:false,masuk:false,keluar:false,laporan:false,export:false}, tgl: now() },
      { id:'u3', nama:'Sari Dewi', username:'supervisor1', password:'spv123', email:'sari@gudang.id', role:'supervisor', aktif:true,
        perms:{view:true,add:true,edit:true,delete:false,masuk:true,keluar:true,laporan:true,export:true}, tgl: now() },
    ];
  }
  if (!kategoriList.length) {
    kategoriList = [
      'Ont/Modem','Adaptor','OLT','STB','CCTV','SFP','Pathcore',
      'Pasif box 1:4','Pasif box 1:8','Pasif box 1:16',
      'Pasif spliter 1:2','Box odp 1:16','Box odp 1:8',
      'Join closure','Pigtal',
      'Klem kabel / pax isi 50pcs','Protector','Lakban','Pin konektor',
      'Tali ties kecil','Tali ties besar',
      'Kabel lan 1m','Kabel fiber 1 core','Kabel fiber 4 core','Kabel precon'
    ];
  }
  localStorage.setItem('sg2_seeded', '1');
  save();
  addAct('Sistem','Data awal dimuat','init');
}

function save() {
  localStorage.setItem('sg2_brg', JSON.stringify(barang));
  localStorage.setItem('sg2_msk', JSON.stringify(transMasuk));
  localStorage.setItem('sg2_klr', JSON.stringify(transKeluar));
  localStorage.setItem('sg2_act', JSON.stringify(activities));
  localStorage.setItem('sg2_usr', JSON.stringify(users));
  localStorage.setItem('sg2_kat', JSON.stringify(kategoriList));
}

function now() { return new Date().toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
function today() { return new Date().toISOString().split('T')[0]; }

function addAct(nama, aksi, type) {
  activities.unshift({nama,aksi,type,waktu:now()});
  if (activities.length > 30) activities.pop();
}

// ══════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════
function getStatus(b) { return b.stok<=0?'habis':b.stok<=b.min?'menipis':'aman'; }
function statusBadge(b) {
  const s=getStatus(b);
  if(s==='habis') return '<span class="badge b-red">Habis</span>';
  if(s==='menipis') return '<span class="badge b-amber">Menipis</span>';
  return '<span class="badge b-green">Aman</span>';
}
function roleBadge(r) {
  if(r==='admin') return '<span class="badge b-red">Superadmin</span>';
  if(r==='supervisor') return '<span class="badge b-blue">Supervisor</span>';
  if(r==='custom') return '<span class="badge b-purple">Custom</span>';
  return '<span class="badge b-green">Operator</span>';
}
function initials(nama) { return nama.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase(); }
const avatarColors = ['#185FA5','#0F6E56','#854F0B','#534AB7','#A32D2D','#3B6D11'];
function avatarColor(str) { let h=0; for(let c of str) h=(h*31+c.charCodeAt(0))%avatarColors.length; return avatarColors[h]; }

function normalizePerms(u) {
  if (u.role === 'admin') {
    u.perms = {view:true,add:true,edit:true,delete:true,masuk:true,keluar:true,laporan:true,export:true};
  } else if (u.role === 'operator') {
    u.perms = {view:true,add:false,edit:false,delete:false,masuk:false,keluar:false,laporan:false,export:false};
  } else if (u.role === 'supervisor') {
    u.perms = u.perms || {};
    u.perms.view   = true;   // wajib true
    u.perms.delete = false;  // wajib false
    u.perms.edit   = false;  // supervisor tidak bisa edit barang
    ['add','masuk','keluar','laporan','export'].forEach(k => { if(u.perms[k]===undefined) u.perms[k]=true; });
  }
  return u;
}

function canDo(perm) {
  if(!curUser) return false;
  if(curUser.role==='admin') return true;
  return curUser.perms && curUser.perms[perm];
}

// ══════════════════════════════════════════
// DARK MODE
// ══════════════════════════════════════════
const SUN_ICON = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.02 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.02.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.02.39 1.41 0l1.06-1.06z"/>';
const MOON_ICON = '<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>';

let isDark = localStorage.getItem('sg2_theme') === 'dark';

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const icon = isDark ? SUN_ICON : MOON_ICON;
  document.getElementById('theme-icon').innerHTML = icon;
  document.getElementById('theme-icon-sb').innerHTML = icon;
}

function toggleTheme() {
  isDark = !isDark;
  localStorage.setItem('sg2_theme', isDark ? 'dark' : 'light');
  applyTheme();
}

// ══════════════════════════════════════════
// LOGIN / LOGOUT
// ══════════════════════════════════════════
function doLogin() {
  const u = document.getElementById('l-user').value.trim();
  const p = document.getElementById('l-pass').value;
  const found = users.find(x => x.username===u && x.password===p && x.aktif);
  if (found) {
    curUser = normalizePerms(found);
    localStorage.setItem('sg2_session', curUser.id); // simpan sesi agar tidak logout saat refresh
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    applyUserUI();
    renderAll();
    addAct(found.nama, 'Login ke sistem', 'login');
    save();
  } else {
    const e = document.getElementById('login-err');
    e.textContent = 'Username/password salah atau akun tidak aktif.';
    e.style.display = 'block';
  }
}

function doLogout() {
  addAct(curUser.nama, 'Logout dari sistem', 'logout');
  save();
  curUser = null;
  localStorage.removeItem('sg2_session'); // hapus sesi agar refresh kembali ke login
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('l-user').value = '';
  document.getElementById('l-pass').value = '';
  document.getElementById('login-err').style.display = 'none';
}

// Coba pulihkan sesi login yang tersimpan (dipanggil saat aplikasi pertama dimuat)
function restoreSession() {
  const savedId = localStorage.getItem('sg2_session');
  if (!savedId) return false;
  const found = users.find(x => x.id === savedId && x.aktif);
  if (!found) { localStorage.removeItem('sg2_session'); return false; }
  curUser = normalizePerms(found);
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  applyUserUI();
  renderAll();
  return true;
}

document.getElementById('l-pass').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
document.getElementById('l-user').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });

function applyUserUI() {
  const u = curUser;
  const col = avatarColor(u.username);
  // Sidebar user info
  document.getElementById('sb-avatar').textContent = initials(u.nama);
  document.getElementById('sb-avatar').style.background = col;
  document.getElementById('sb-uname').textContent = u.nama;
  const roleLabel = u.role==='admin'?'Superadmin':u.role==='supervisor'?'Supervisor':u.role==='custom'?'Custom':'Operator';
  document.getElementById('sb-urole').textContent = roleLabel;
  // Profile page
  document.getElementById('profile-avatar').textContent = initials(u.nama);
  document.getElementById('profile-avatar').style.background = col;
  document.getElementById('profile-name').textContent = u.nama;
  document.getElementById('profile-role').textContent = roleLabel;
  document.getElementById('profile-username').textContent = '@'+u.username;
  document.getElementById('pf-nama').value = u.nama;
  document.getElementById('pf-email').value = u.email||'';

  // Show admin-only elements
  const isAdmin = u.role==='admin';
  document.querySelectorAll('.admin-only').forEach(el => {
    if (!isAdmin) {
      el.style.display = 'none';
    } else {
      if (el.classList.contains('sb-item')) el.style.display = 'flex';
      else if (el.classList.contains('sb-section')) el.style.display = 'block';
      else el.style.display = 'block';
    }
  });

  // Helper: show/hide element by id
  const showEl = (id, visible, displayType) => {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? (displayType||'') : 'none';
  };
  // Tombol tambah barang
  showEl('btn-add-barang', canDo('add'), 'inline-flex');
  // Tombol select/bulk delete barang (butuh delete)
  showEl('btn-brg-select', canDo('delete'), 'inline-flex');
  // Tombol kategori (butuh add atau edit)
  showEl('btn-kategori', canDo('add') || canDo('edit'));
  // Tombol tambah barang masuk
  showEl('btn-add-masuk', canDo('masuk'), 'inline-flex');
  // Tombol tambah barang keluar
  showEl('btn-add-keluar', canDo('keluar'), 'inline-flex');
  // Tombol export Excel (topbar)
  showEl('btn-export-excel', canDo('export'), 'inline-flex');
  // Tombol export laporan
  showEl('btn-lap-export', canDo('export'));
}

// ══════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════
const pageTitles = {dashboard:'Dashboard',barang:'Data Barang',masuk:'Barang Masuk',keluar:'Barang Keluar',laporan:'Laporan Stok',users:'Manajemen Pengguna',profile:'Profil Saya'};

function showPage(id, el) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.querySelectorAll('.sb-item').forEach(n=>n.classList.remove('active'));
  if(el) el.classList.add('active');
  document.getElementById('page-title').textContent = pageTitles[id]||id;
  closeSb();
  if(id==='barang') renderBarang();
  if(id==='masuk') renderMasuk();
  if(id==='keluar') renderKeluar();
  if(id==='laporan') renderLaporan();
  if(id==='users') renderUsers();
}

function toggleSb() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('overlay').classList.toggle('show'); }
function closeSb() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); }

// ══════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════
function renderAll() { renderDashboard(); renderBarang(); renderMasuk(); renderKeluar(); renderLaporan(); updateBrgOpts(); renderUsers(); }

function renderDashboard() {
  document.getElementById('s-total').textContent = barang.length;
  document.getElementById('s-aman').textContent = barang.filter(b=>getStatus(b)==='aman').length;
  document.getElementById('s-menipis').textContent = barang.filter(b=>getStatus(b)==='menipis').length;
  document.getElementById('s-habis').textContent = barang.filter(b=>getStatus(b)==='habis').length;

  const low = barang.filter(b=>getStatus(b)!=='aman');
  const lt = document.getElementById('low-tbl');
  if(!low.length) lt.innerHTML='<tr><td colspan="5"><div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;color:var(--green-text);margin-bottom:.5rem"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><p>Semua stok dalam kondisi aman</p></div></td></tr>';
  else lt.innerHTML=low.map(b=>`<tr><td><span class="chip">${b.kode}</span></td><td>${b.nama}</td><td>${b.stok} ${b.satuan}</td><td>${b.min}</td><td>${statusBadge(b)}</td></tr>`).join('');

  const al = document.getElementById('act-list');
  const actColors = {masuk:'#222',keluar:'#555',edit:'#333',hapus:'#111',login:'#444',logout:'#888',init:'#999'};
  const actIcons = {
    masuk:'<path d="M12 3v12m0 0l-4-4m4 4l4-4"/>',
    keluar:'<path d="M12 21V9m0 0l-4 4m4-4l4 4"/>',
    edit:'<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    hapus:'<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>',
    login:'<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>',
    logout:'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    init:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  };
  if(!activities.length) al.innerHTML='<div class="empty"><p>Belum ada aktivitas</p></div>';
  else al.innerHTML=activities.slice(0,10).map(a=>`
    <div class="act-item">
      <div class="act-icon" style="background:var(--surface3)">
        <svg viewBox="0 0 24 24" fill="none" stroke="${actColors[a.type]||'var(--text3)'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${actIcons[a.type]||actIcons.init}</svg>
      </div>
      <div class="act-body"><strong>${a.nama}</strong><p>${a.aksi}</p></div>
      <div class="act-time">${a.waktu}</div>
    </div>`).join('');
}

// BARANG TABLE
let pg = 1; const PP = 10;
let brgSelectMode = false;
let selectedBrg = new Set();

function toggleBrgSelect() {
  brgSelectMode = !brgSelectMode;
  selectedBrg.clear();
  document.getElementById('brg-toolbar-normal').style.display = brgSelectMode ? 'none' : 'flex';
  document.getElementById('brg-toolbar-select').style.display = brgSelectMode ? 'flex' : 'none';
  document.getElementById('chk-brg-all').checked = false;
  updateBrgSelectCount();
  renderBarang();
}

function toggleBrgSelectAll(chk) {
  selectedBrg.clear();
  if (chk.checked) {
    document.querySelectorAll('.brg-chk').forEach(el => selectedBrg.add(el.dataset.kode));
  }
  updateBrgSelectCount();
  renderBarang();
  // Setelah render ulang, sync state checkbox all yang baru
  const newChk = document.getElementById('chk-brg-all');
  if (newChk) newChk.checked = chk.checked;
}

function toggleBrgRow(kode) {
  if (selectedBrg.has(kode)) selectedBrg.delete(kode);
  else selectedBrg.add(kode);
  // Update visual baris
  const row = document.querySelector(`tr[data-kode="${kode}"]`);
  if (row) {
    const sel = selectedBrg.has(kode);
    const chk = row.querySelector('.brg-chk');
    if (chk) chk.checked = sel;
    row.style.background = sel ? 'var(--blue-bg)' : '';
  }
  updateBrgSelectCount();
}

function updateBrgSelectCount() {
  const n = selectedBrg.size;
  const label = document.getElementById('brg-select-label');
  if (label) label.textContent = n === 0 ? '0 barang dipilih' : `${n} barang dipilih`;
  const btn = document.getElementById('btn-brg-hapus');
  if (btn) { btn.disabled = n === 0; btn.style.opacity = n === 0 ? '.45' : '1'; }
  // Sync checkbox "Pilih Semua" di toolbar
  const allChks = document.querySelectorAll('.brg-chk');
  const chkAll = document.getElementById('chk-brg-all');
  if (chkAll && allChks.length > 0) {
    chkAll.checked = n >= allChks.length;
    chkAll.indeterminate = n > 0 && n < allChks.length;
  } else if (chkAll) {
    chkAll.checked = false;
    chkAll.indeterminate = false;
  }
}

function hapusBrgSelected() {
  if (!canDo('delete')) { showToast('Anda tidak punya izin hapus', 'error'); return; }
  if (selectedBrg.size === 0) return;
  const names = [...selectedBrg].map(k => barang.find(b=>b.kode===k)?.nama).filter(Boolean);
  if (!confirm(`Hapus ${selectedBrg.size} barang berikut?\n\n${names.join('\n')}\n\nTindakan ini tidak bisa dibatalkan.`)) return;
  [...selectedBrg].forEach(k => {
    const b = barang.find(x=>x.kode===k);
    if (b) addAct(b.nama, 'Barang dihapus', 'hapus');
  });
  barang = barang.filter(b => !selectedBrg.has(b.kode));
  save();
  selectedBrg.clear();
  toggleBrgSelect();
  renderAll();
  showToast(`${names.length} barang berhasil dihapus`, 'info');
}

function filterBarang() { pg=1; renderBarang(); }

function renderBarang() {
  const srch = (document.getElementById('s-barang').value||'').toLowerCase();
  const kat = document.getElementById('f-kat').value;
  const stat = document.getElementById('f-stat').value;

  const kats = [...new Set(barang.map(b=>b.kategori))].filter(Boolean);
  const fk = document.getElementById('f-kat'), cur = fk.value;
  fk.innerHTML = '<option value="">Semua Kategori</option>'+kats.map(k=>`<option${k===cur?' selected':''}>${k}</option>`).join('');

  let fil = barang.filter(b => {
    const ms = !srch||b.kode.toLowerCase().includes(srch)||b.nama.toLowerCase().includes(srch);
    const mk = !kat||b.kategori===kat;
    const ms2 = !stat||getStatus(b)===stat;
    return ms&&mk&&ms2;
  });

  // Update thead - TANPA checkbox di header kolom
  document.getElementById('thead-barang').innerHTML = `<tr>
    ${brgSelectMode ? `<th style="width:36px"></th>` : ''}
    <th>Kode</th><th>Nama Barang</th><th>Kategori</th><th>Satuan</th><th>Stok</th><th>Min</th><th>Lokasi</th><th>Status</th>
    ${!brgSelectMode ? '<th>Aksi</th>' : ''}
  </tr>`;

  const total=fil.length, start=(pg-1)*PP;
  const sliced = fil.slice(start, start+PP);
  const tb = document.getElementById('tbl-barang');
  if(!sliced.length) {
    const cols = brgSelectMode ? 9 : 9;
    tb.innerHTML=`<tr><td colspan="${cols}"><div class="empty"><p>Tidak ada data</p></div></td></tr>`;
  } else {
    const canEdit = canDo('edit'), canDel = canDo('delete');
    tb.innerHTML = sliced.map(b => {
      const ri = barang.indexOf(b);
      const isSel = selectedBrg.has(b.kode);
      return `<tr data-kode="${b.kode}" style="${isSel?'background:var(--blue-bg)':''}">
        ${brgSelectMode ? `<td onclick="toggleBrgRow('${b.kode}')" style="cursor:pointer;text-align:center">
          <input type="checkbox" class="brg-chk" data-kode="${b.kode}" ${isSel?'checked':''} onclick="event.stopPropagation();toggleBrgRow('${b.kode}')"
            style="width:15px;height:15px;accent-color:var(--primary);cursor:pointer">
        </td>` : ''}
        <td onclick="${brgSelectMode?`toggleBrgRow('${b.kode}')`:''}" style="${brgSelectMode?'cursor:pointer':''}"><span class="chip">${b.kode}</span></td>
        <td onclick="${brgSelectMode?`toggleBrgRow('${b.kode}')`:''}" style="${brgSelectMode?'cursor:pointer':''}">
          <div style="font-weight:600">${b.nama}</div>${b.ket?`<div style="font-size:.72rem;color:var(--text3)">${b.ket}</div>`:''}
        </td>
        <td>${b.kategori}</td><td>${b.satuan}</td>
        <td><strong>${b.stok}</strong></td><td>${b.min}</td>
        <td><span style="font-size:.75rem;color:var(--text2)">${b.lokasi||'—'}</span></td>
        <td>${statusBadge(b)}</td>
        ${!brgSelectMode ? `<td><div class="act-btns">
          ${canEdit ? `<button class="icon-btn" onclick="editBarang(${ri})" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>` : ''}
          ${canDel ? `<button class="icon-btn danger" onclick="hapusBarang(${ri})" title="Hapus">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>` : ''}
        </div></td>` : ''}
      </tr>`;
    }).join('');
  }

  const tp = Math.ceil(total/PP);
  const pg_el = document.getElementById('pagi-barang');
  if(tp<=1) { pg_el.innerHTML=`<span class="pagi-info">Total ${total} barang</span>`; return; }
  let btns='';
  for(let i=1;i<=tp;i++) btns+=`<button class="pg-btn${i===pg?' active':''}" onclick="gotoPage(${i})">${i}</button>`;
  pg_el.innerHTML=`<span class="pagi-info">${start+1}–${Math.min(start+PP,total)} dari ${total}</span><div class="pagi-btns">${btns}</div>`;
}
function gotoPage(n) { pg=n; renderBarang(); }

function renderMasuk() {
  const tb = document.getElementById('tbl-masuk');
  if(!transMasuk.length) { tb.innerHTML='<tr><td colspan="9"><div class="empty"><p>Belum ada data barang masuk</p></div></td></tr>'; return; }
  const canEdit = canDo('masuk'), canDel = canDo('delete');
  tb.innerHTML=[...transMasuk].map((t,origIdx)=>({...t,_origIdx:transMasuk.length-1-origIdx})).reverse().map((t,i)=>{
    const realIdx = transMasuk.length - 1 - i;
    return `<tr>
      <td>${t.tgl}</td><td><span class="chip">${t.kode}</span></td>
      <td><div style="font-weight:500">${t.nama}</div></td>
      <td><span class="badge b-blue" style="font-size:.68rem">${t.kategori||'—'}</span></td>
      <td><span style="font-size:.76rem;color:var(--text2)">${formatDetailText(t.kategori, t.detail)}</span></td>
      <td><span class="badge b-green" style="font-weight:700">+${t.jml}</span></td>
      <td style="font-size:.82rem">${t.src||'—'}</td>
      <td style="font-size:.75rem;color:var(--text2)">${t.oleh||'—'}</td>
      <td><div class="act-btns">
        ${canEdit ? `<button class="icon-btn" onclick="editTrans('masuk',${realIdx})" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>` : ''}
        ${canDel ? `<button class="icon-btn danger" onclick="hapusTrans('masuk',${realIdx})" title="Hapus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>` : ''}
      </div></td>
    </tr>`;
  }).join('');
}

function renderKeluar() {
  const tb = document.getElementById('tbl-keluar');
  if(!transKeluar.length) { tb.innerHTML='<tr><td colspan="9"><div class="empty"><p>Belum ada data barang keluar</p></div></td></tr>'; return; }
  const canEdit = canDo('keluar'), canDel = canDo('delete');
  tb.innerHTML=[...transKeluar].map((t,i)=>i).reverse().map(i=>{
    const t = transKeluar[i];
    return `<tr>
      <td>${t.tgl}</td><td><span class="chip">${t.kode}</span></td>
      <td><div style="font-weight:500">${t.nama}</div></td>
      <td><span class="badge b-blue" style="font-size:.68rem">${t.kategori||'—'}</span></td>
      <td><span style="font-size:.76rem;color:var(--text2)">${formatDetailText(t.kategori, t.detail)}</span></td>
      <td><span class="badge b-amber" style="font-weight:700">-${t.jml}</span></td>
      <td style="font-size:.82rem">${t.tuj||'—'}</td>
      <td style="font-size:.75rem;color:var(--text2)">${t.oleh||'—'}</td>
      <td><div class="act-btns">
        ${canEdit ? `<button class="icon-btn" onclick="editTrans('keluar',${i})" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>` : ''}
        ${canDel ? `<button class="icon-btn danger" onclick="hapusTrans('keluar',${i})" title="Hapus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>` : ''}
      </div></td>
    </tr>`;
  }).join('');
}

// ══════════════════════════════════════════
// LAPORAN
// ══════════════════════════════════════════
let lapTab = 1;

function switchLapTab(n) {
  lapTab = n;
  [1,2,3].forEach(i => {
    document.getElementById(`lap-content-${i}`).style.display = i===n ? 'block' : 'none';
    const btn = document.getElementById(`lap-tab-${i}`);
    btn.classList.toggle('active-tab', i===n);
  });
  // Tampil/sembunyikan filter relevan
  document.getElementById('lap-f-stat').style.display = n===1 ? 'block' : 'none';
  document.getElementById('lap-tgl-wrap').style.display = n!==1 ? 'flex' : 'none';
  filterLaporan();
}

function getLapFilters() {
  return {
    kat: document.getElementById('lap-f-kat').value,
    stat: document.getElementById('lap-f-stat').value,
    search: (document.getElementById('lap-f-search').value||'').toLowerCase(),
    tgl1: document.getElementById('lap-f-tgl1').value,
    tgl2: document.getElementById('lap-f-tgl2').value,
  };
}

function filterLaporan() {
  // Update kategori options
  const kats = [...new Set(barang.map(b=>b.kategori))].filter(Boolean);
  const fk = document.getElementById('lap-f-kat'), cur = fk.value;
  fk.innerHTML = '<option value="">Semua Kategori</option>' + kats.map(k=>`<option${k===cur?' selected':''}>${k}</option>`).join('');

  const f = getLapFilters();
  const hasFilter = f.kat||f.stat||f.search||f.tgl1||f.tgl2;

  // Filter info bar
  const info = document.getElementById('lap-filter-info');
  if (hasFilter) {
    const parts = [];
    if (f.kat) parts.push(`Kategori: <b>${f.kat}</b>`);
    if (f.stat) parts.push(`Status: <b>${f.stat}</b>`);
    if (f.search) parts.push(`Cari: <b>"${f.search}"</b>`);
    if (f.tgl1) parts.push(`Dari: <b>${f.tgl1}</b>`);
    if (f.tgl2) parts.push(`s/d: <b>${f.tgl2}</b>`);
    info.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;flex-shrink:0"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> Filter aktif: ` + parts.join(' · ');
    info.style.display = 'block';
  } else {
    info.style.display = 'none';
  }

  if (lapTab===1) renderLapStok(f);
  if (lapTab===2) renderLapMasuk(f);
  if (lapTab===3) renderLapKeluar(f);
}

function resetLapFilter() {
  ['lap-f-kat','lap-f-stat','lap-f-search','lap-f-tgl1','lap-f-tgl2'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  filterLaporan();
}

function renderLapStok(f) {
  let data = barang.filter(b => {
    if (f.kat && b.kategori!==f.kat) return false;
    if (f.search && !b.kode.toLowerCase().includes(f.search) && !b.nama.toLowerCase().includes(f.search)) return false;
    if (f.stat && getStatus(b)!==f.stat) return false;
    return true;
  });
  const count = document.getElementById('lap-stok-count');
  if (count) count.textContent = `${data.length} barang`;
  const tb = document.getElementById('tbl-laporan');
  tb.innerHTML = data.map(b=>{
    const tm=transMasuk.filter(t=>t.kode===b.kode).reduce((s,t)=>s+Number(t.jml),0);
    const tk=transKeluar.filter(t=>t.kode===b.kode).reduce((s,t)=>s+Number(t.jml),0);
    return `<tr>
      <td><span class="chip">${b.kode}</span></td><td>${b.nama}</td><td>${b.kategori}</td>
      <td><span style="color:var(--green-text);font-weight:600">+${tm}</span></td>
      <td><span style="color:var(--amber-text);font-weight:600">-${tk}</span></td>
      <td><strong>${b.stok}</strong> ${b.satuan}</td>
      <td>${statusBadge(b)}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="7"><div class="empty"><p>Tidak ada data</p></div></td></tr>';
}

function renderLapMasuk(f) {
  let data = transMasuk.map((t,i)=>({...t,_idx:i})).filter(t => {
    if (f.kat && t.kategori!==f.kat) return false;
    if (f.search && !t.kode.toLowerCase().includes(f.search) && !t.nama.toLowerCase().includes(f.search)) return false;
    if (f.tgl1 && t.tgl < f.tgl1) return false;
    if (f.tgl2 && t.tgl > f.tgl2) return false;
    return true;
  });
  const count = document.getElementById('lap-masuk-count');
  if (count) count.textContent = `${data.length} transaksi`;
  const tb = document.getElementById('tbl-lap-masuk');
  const canEdit = canDo('masuk'), canDel = canDo('delete');
  tb.innerHTML = [...data].reverse().map(t => {
    const detailHtml = t.detail ? Object.entries(t.detail).filter(([,v])=>v).map(([k,v])=>`<span style="font-size:.7rem;display:inline-block;margin:.1rem .2rem .1rem 0;background:var(--surface3,var(--surface2));padding:.1rem .35rem;border-radius:4px">${k}: <b>${v}</b></span>`).join('') : '—';
    return `<tr>
      <td>${t.tgl}</td><td><span class="chip">${t.kode}</span></td>
      <td><div style="font-weight:500">${t.nama}</div><div style="font-size:.7rem;color:var(--text3)">${t.kategori||''}</div></td>
      <td><span class="badge b-green" style="font-size:.78rem;font-weight:700">+${t.jml}</span></td>
      <td style="max-width:200px">${detailHtml}</td>
      <td style="font-size:.8rem">${t.src||'—'}</td>
      <td style="font-size:.75rem;color:var(--text2)">${t.oleh||'—'}</td>
      <td><div class="act-btns">
        ${canEdit ? `<button class="icon-btn" onclick="editTrans('masuk',${t._idx})" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>` : ''}
        ${canDel ? `<button class="icon-btn danger" onclick="hapusTrans('masuk',${t._idx})" title="Hapus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>` : ''}
      </div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="9"><div class="empty"><p>Tidak ada data</p></div></td></tr>';
}

function renderLapKeluar(f) {
  let data = transKeluar.map((t,i)=>({...t,_idx:i})).filter(t => {
    if (f.kat && t.kategori!==f.kat) return false;
    if (f.search && !t.kode.toLowerCase().includes(f.search) && !t.nama.toLowerCase().includes(f.search)) return false;
    if (f.tgl1 && t.tgl < f.tgl1) return false;
    if (f.tgl2 && t.tgl > f.tgl2) return false;
    return true;
  });
  const count = document.getElementById('lap-keluar-count');
  if (count) count.textContent = `${data.length} transaksi`;
  const tb = document.getElementById('tbl-lap-keluar');
  const canEdit = canDo('keluar'), canDel = canDo('delete');
  tb.innerHTML = [...data].reverse().map(t => {
    const detailHtml = t.detail ? Object.entries(t.detail).filter(([,v])=>v).map(([k,v])=>`<span style="font-size:.7rem;display:inline-block;margin:.1rem .2rem .1rem 0;background:var(--surface3,var(--surface2));padding:.1rem .35rem;border-radius:4px">${k}: <b>${v}</b></span>`).join('') : '—';
    return `<tr>
      <td>${t.tgl}</td><td><span class="chip">${t.kode}</span></td>
      <td><div style="font-weight:500">${t.nama}</div><div style="font-size:.7rem;color:var(--text3)">${t.kategori||''}</div></td>
      <td><span class="badge b-amber" style="font-size:.78rem;font-weight:700">-${t.jml}</span></td>
      <td style="max-width:200px">${detailHtml}</td>
      <td style="font-size:.8rem">${t.tuj||'—'}</td>
      <td style="font-size:.75rem;color:var(--text2)">${t.oleh||'—'}</td>
      <td><div class="act-btns">
        ${canEdit ? `<button class="icon-btn" onclick="editTrans('keluar',${t._idx})" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>` : ''}
        ${canDel ? `<button class="icon-btn danger" onclick="hapusTrans('keluar',${t._idx})" title="Hapus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>` : ''}
      </div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="9"><div class="empty"><p>Tidak ada data</p></div></td></tr>';
}

function renderLaporan() {
  filterLaporan();
}

// Export sesuai filter aktif
function exportLaporanFiltered() {
  if(!canDo('export')) { showToast('Tidak ada izin export','error'); return; }
  const f = getLapFilters();
  const wb = XLSX.utils.book_new();
  const tgl = today();
  const filterDesc = [f.kat,f.stat,f.search,f.tgl1?`${f.tgl1} s/d ${f.tgl2||tgl}`:''].filter(Boolean).join('_') || 'Semua';

  if (lapTab===1) {
    let data = barang.filter(b => {
      if (f.kat && b.kategori!==f.kat) return false;
      if (f.search && !b.kode.toLowerCase().includes(f.search) && !b.nama.toLowerCase().includes(f.search)) return false;
      if (f.stat && getStatus(b)!==f.stat) return false;
      return true;
    });
    const rows = [['Kode','Nama Barang','Kategori','Total Masuk','Total Keluar','Stok Akhir','Satuan','Status']];
    data.forEach(b=>{
      const tm=transMasuk.filter(t=>t.kode===b.kode).reduce((s,t)=>s+Number(t.jml),0);
      const tk=transKeluar.filter(t=>t.kode===b.kode).reduce((s,t)=>s+Number(t.jml),0);
      rows.push([b.kode,b.nama,b.kategori,tm,tk,b.stok,b.satuan,getStatus(b).toUpperCase()]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Rekap Stok');
    XLSX.writeFile(wb, `Rekap_Stok_${filterDesc}_${tgl}.xlsx`);
  } else if (lapTab===2) {
    let data = transMasuk.filter(t => {
      if (f.kat && t.kategori!==f.kat) return false;
      if (f.search && !t.kode.toLowerCase().includes(f.search) && !t.nama.toLowerCase().includes(f.search)) return false;
      if (f.tgl1 && t.tgl < f.tgl1) return false;
      if (f.tgl2 && t.tgl > f.tgl2) return false;
      return true;
    });
    // Kumpulkan semua key atribut yang ada
    const allAttrKeys = [...new Set(data.flatMap(t=>Object.keys(t.attr||{})))];
    const rows = [['Tanggal','Kode','Nama Barang','Kategori','Jumlah',...allAttrKeys,'Sumber','Dicatat Oleh','Catatan']];
    data.forEach(t=>rows.push([t.tgl,t.kode,t.nama,t.kategori||'',t.jml,...allAttrKeys.map(k=>(t.attr&&t.attr[k])||''),t.src||'',t.oleh||'',t.cat||'']));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Barang Masuk');
    XLSX.writeFile(wb, `Barang_Masuk_${filterDesc}_${tgl}.xlsx`);
  } else {
    let data = transKeluar.filter(t => {
      if (f.kat && t.kategori!==f.kat) return false;
      if (f.search && !t.kode.toLowerCase().includes(f.search) && !t.nama.toLowerCase().includes(f.search)) return false;
      if (f.tgl1 && t.tgl < f.tgl1) return false;
      if (f.tgl2 && t.tgl > f.tgl2) return false;
      return true;
    });
    const allAttrKeys = [...new Set(data.flatMap(t=>Object.keys(t.attr||{})))];
    const rows = [['Tanggal','Kode','Nama Barang','Kategori','Jumlah',...allAttrKeys,'Tujuan','Dicatat Oleh','Catatan']];
    data.forEach(t=>rows.push([t.tgl,t.kode,t.nama,t.kategori||'',t.jml,...allAttrKeys.map(k=>(t.attr&&t.attr[k])||''),t.tuj||'',t.oleh||'',t.cat||'']));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Barang Keluar');
    XLSX.writeFile(wb, `Barang_Keluar_${filterDesc}_${tgl}.xlsx`);
  }
  showToast('Export berhasil!','success');
}

// ══════════════════════════════════════════
// USER MANAGEMENT
// ══════════════════════════════════════════
let selectMode = false;
let selectedIds = new Set();

function toggleSelectMode() {
  selectMode = !selectMode;
  selectedIds.clear();
  document.getElementById('user-toolbar-normal').style.display = selectMode ? 'none' : 'flex';
  document.getElementById('user-toolbar-select').style.display = selectMode ? 'flex' : 'none';
  document.getElementById('chk-all').checked = false;
  updateSelectCount();
  renderUsers();
}

function toggleSelectAll(chk) {
  selectedIds.clear();
  if (chk.checked) {
    users.forEach((u, i) => {
      if (u.id !== curUser.id) selectedIds.add(u.id);
    });
  }
  updateSelectCount();
  renderUsers();
}

function toggleSelectUser(uid) {
  if (selectedIds.has(uid)) selectedIds.delete(uid);
  else selectedIds.add(uid);
  updateSelectCount();
  const selectableCount = users.filter(u => u.id !== curUser.id).length;
  document.getElementById('chk-all').checked = selectedIds.size === selectableCount && selectableCount > 0;
  renderUsers(); // re-render penuh agar checkbox & highlight update benar
}

function updateSelectCount() {
  const n = selectedIds.size;
  document.getElementById('select-count-label').textContent = n === 0 ? '0 user dipilih' : `${n} user dipilih`;
  const btn = document.getElementById('btn-hapus-selected');
  btn.disabled = n === 0;
  btn.style.opacity = n === 0 ? '.45' : '1';
}

function hapusSelected() {
  if (selectedIds.size === 0) return;
  // Cek admin protection
  const willDeleteAdmins = [...selectedIds].filter(id => users.find(u=>u.id===id)?.role==='admin').length;
  const totalAdmins = users.filter(u=>u.role==='admin').length;
  if (willDeleteAdmins >= totalAdmins) {
    showToast('Tidak bisa hapus semua admin — harus ada minimal 1 admin!', 'error'); return;
  }
  const names = [...selectedIds].map(id => users.find(u=>u.id===id)?.nama).filter(Boolean);
  if (!confirm(`Hapus ${selectedIds.size} pengguna berikut?\n\n${names.join(', ')}\n\nTindakan ini tidak bisa dibatalkan.`)) return;
  [...selectedIds].forEach(id => {
    const u = users.find(x=>x.id===id);
    if (u) addAct(curUser.nama, `Hapus user: ${u.username}`, 'hapus');
  });
  users = users.filter(u => !selectedIds.has(u.id));
  save();
  selectedIds.clear();
  toggleSelectMode(); // kembali ke mode normal
  showToast(`${names.length} user berhasil dihapus`, 'info');
}

function renderUsers() {
  document.getElementById('sb-user-count').textContent = users.length;
  const grid = document.getElementById('user-grid');
  if(!users.length) { grid.innerHTML='<p style="color:var(--text2)">Belum ada pengguna terdaftar.</p>'; return; }
  grid.innerHTML = users.map((u,i) => {
    const col = avatarColor(u.username);
    const isSelf = curUser && u.id===curUser.id;
    const isSelected = selectedIds.has(u.id);
    const canSelect = selectMode && !isSelf;
    const permList = Object.entries(u.perms||{}).filter(([k,v])=>v).map(([k])=>permLabel(k)).join(', ');

    // Tombol nonaktifkan/aktifkan — icon only dengan tooltip
    const nonaktifBtn = !isSelf ? `
      <button class="uc-btn icon-only" onclick="toggleAktif(${i})"
        title="${u.aktif?'Nonaktifkan user ini':'Aktifkan user ini'}"
        style="${u.aktif?'color:var(--amber-text)':'color:var(--green-text)'}">
        ${u.aktif
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`
        }
      </button>` : '';

    return `
    <div class="user-card" data-uid="${u.id}"
      style="${isSelected ? 'border-color:var(--primary);background:var(--blue-bg)' : ''}">

      <div class="user-card-head">
        ${canSelect ? `
          <div class="user-checkbox ${isSelected?'checked':''}" onclick="toggleSelectUser('${u.id}')">
            ${isSelected ? `<svg viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>` : ''}
          </div>` : ''}
        ${isSelf && selectMode ? `<div style="width:18px;flex-shrink:0"></div>` : ''}
        <div class="u-avatar" style="background:${col};color:white">${initials(u.nama)}</div>
        <div style="flex:1;min-width:0">
          <div class="u-name">${u.nama} ${isSelf?'<span style="font-size:.65rem;color:var(--text3)">(Anda)</span>':''}</div>
          <div class="u-username">@${u.username}</div>
        </div>
      </div>

      <div class="user-card-meta">
        ${roleBadge(u.role)}
        ${u.aktif ? '<span class="badge b-green">Aktif</span>' : '<span class="badge b-red">Nonaktif</span>'}
        ${u.email?`<span style="font-size:.7rem;color:var(--text2);margin-left:.1rem">${u.email}</span>`:''}
      </div>

      <div style="font-size:.72rem;color:var(--text3);line-height:1.55">
        <strong style="color:var(--text2)">Akses:</strong> ${u.role==='admin'?'Semua akses penuh (Superadmin)':u.role==='operator'?'Lihat data saja':u.role==='supervisor'?'Tambah & kelola (tanpa hapus)':permList||'—'}
      </div>

      ${!selectMode ? `
      <div class="user-card-footer">
        <button class="uc-btn" onclick="editUser(${i})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit
        </button>
        <button class="uc-btn" onclick="openResetPass(${i})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>Reset Pass
        </button>
        ${nonaktifBtn}
      </div>` : ''}
    </div>`;
  }).join('');
}

function permLabel(k) {
  const map = {view:'Lihat',add:'Tambah',edit:'Edit',delete:'Hapus',masuk:'Catat Masuk',keluar:'Catat Keluar',laporan:'Laporan',export:'Export'};
  return map[k]||k;
}

function openAddUser() {
  resetUserForm();
  document.getElementById('au-title').textContent = 'Tambah Pengguna Baru';
  document.getElementById('au-pass-wrap').style.display = 'grid';
  openModal('m-adduser');
}

function editUser(idx) {
  const u = users[idx];
  document.getElementById('au-title').textContent = 'Edit Pengguna';
  document.getElementById('au-idx').value = idx;
  document.getElementById('au-nama').value = u.nama;
  document.getElementById('au-user').value = u.username;
  document.getElementById('au-email').value = u.email||'';
  document.getElementById('au-role').value = u.role;
  document.getElementById('au-pass-wrap').style.display = 'none';
  // Set perms — normalize dulu berdasarkan role agar data lama di localStorage ikut terkoreksi
  const raw = u.role==='admin'
    ? {view:true,add:true,edit:true,delete:true,masuk:true,keluar:true,laporan:true,export:true}
    : (u.perms||{});
  // Terapkan aturan wajib per role
  if (u.role==='operator') { Object.keys(raw).forEach(k=>raw[k]=false); raw.view=true; }
  if (u.role==='supervisor') { raw.view=true; raw.edit=false; raw.delete=false; }
  ['view','add','edit','delete','masuk','keluar','laporan','export'].forEach(k => { const el=document.getElementById('p-'+k); if(el) el.checked=!!raw[k]; });
  updatePermUI(true);
  openModal('m-adduser');
}

function updatePermUI(keepCustom) {
  const role = document.getElementById('au-role').value;
  const grid = document.getElementById('perm-grid');
  const infoText = document.getElementById('perm-info-text');
  const infoBox = document.getElementById('perm-info-box');
  const allKeys = ['view','add','edit','delete','masuk','keluar','laporan','export'];

  // Helper: set checkbox state
  function setPerms(map, disabledKeys) {
    allKeys.forEach(k => {
      const el = document.getElementById('p-'+k);
      if (!el) return;
      if (map[k] !== undefined) el.checked = !!map[k];
      el.disabled = disabledKeys.includes(k);
    });
  }

  if (role === 'admin') {
    setPerms({view:true,add:true,edit:true,delete:true,masuk:true,keluar:true,laporan:true,export:true}, allKeys);
    grid.style.opacity = '.55';
    infoText.textContent = '! Superadmin memiliki semua akses penuh dan tidak dapat diubah.';
    infoBox.style.background = 'var(--red-bg)';
    infoBox.style.color = 'var(--red-text)';

  } else if (role === 'operator') {
    setPerms({view:true,add:false,edit:false,delete:false,masuk:false,keluar:false,laporan:false,export:false}, allKeys);
    grid.style.opacity = '.55';
    infoText.textContent = '! Operator hanya dapat melihat data. Hak akses dikunci otomatis.';
    infoBox.style.background = 'var(--amber-bg)';
    infoBox.style.color = 'var(--amber-text)';

  } else if (role === 'supervisor') {
    // view & delete dikunci, edit BEBAS (default true), sisanya bebas
    setPerms({view:true,add:true,edit:false,delete:false,masuk:true,keluar:true,laporan:true,export:true}, ['view','edit','delete']);
    grid.style.opacity = '1';
    infoText.textContent = '! Supervisor tidak dapat menghapus data. Akses lain dapat disesuaikan.';
    infoBox.style.background = 'var(--blue-bg)';
    infoBox.style.color = 'var(--blue-text)';

  } else if (role === 'custom') {
    if (!keepCustom) {
      setPerms({view:true,add:false,edit:false,delete:false,masuk:false,keluar:false,laporan:false,export:false}, []);
    } else {
      allKeys.forEach(k => { const el = document.getElementById('p-'+k); if(el) el.disabled = false; });
    }
    grid.style.opacity = '1';
    infoText.textContent = '! Custom: centang hak akses sesuai kebutuhan secara bebas.';
    infoBox.style.background = 'var(--green-bg)';
    infoBox.style.color = 'var(--green-text)';
  }
}

function saveUser() {
  const idx = document.getElementById('au-idx').value;
  const nama = document.getElementById('au-nama').value.trim();
  const username = document.getElementById('au-user').value.trim();
  const email = document.getElementById('au-email').value.trim();
  const role = document.getElementById('au-role').value;
  if(!nama||!username) { showToast('Nama dan username wajib diisi!','error'); return; }

  const isNew = idx==='';
  if(isNew) {
    const pass = document.getElementById('au-pass').value;
    const cpass = document.getElementById('au-cpass').value;
    if(!pass||pass.length<4) { showToast('Password min. 4 karakter','error'); return; }
    if(pass!==cpass) { showToast('Konfirmasi password tidak cocok','error'); return; }
    if(users.find(u=>u.username===username)) { showToast('Username sudah digunakan!','error'); return; }
    const rawPerms = {};
    ['view','add','edit','delete','masuk','keluar','laporan','export'].forEach(k => rawPerms[k]=document.getElementById('p-'+k).checked);
    const perms = role==='admin'
      ? {view:true,add:true,edit:true,delete:true,masuk:true,keluar:true,laporan:true,export:true}
      : role==='operator'
        ? {view:true,add:false,edit:false,delete:false,masuk:false,keluar:false,laporan:false,export:false}
        : role==='supervisor'
          ? {...rawPerms, view:true, edit:false, delete:false}
          : rawPerms; // custom
    users.push({id:'u'+Date.now(),nama,username,email,role,password:pass,aktif:true,perms,tgl:now()});
    addAct(curUser.nama,`Tambah user: ${username}`,'edit');
  } else {
    const u = users[idx];
    if(users.find((x,i)=>x.username===username&&i!=idx)) { showToast('Username sudah digunakan!','error'); return; }
    u.nama=nama; u.username=username; u.email=email; u.role=role;
    const perms = {};
    ['view','add','edit','delete','masuk','keluar','laporan','export'].forEach(k => perms[k]=document.getElementById('p-'+k).checked);
    u.perms = role==='admin'
      ? {view:true,add:true,edit:true,delete:true,masuk:true,keluar:true,laporan:true,export:true}
      : role==='operator'
        ? {view:true,add:false,edit:false,delete:false,masuk:false,keluar:false,laporan:false,export:false}
        : role==='supervisor'
          ? {...perms, view:true, edit:false, delete:false}  // view wajib true, edit & delete wajib false
          : perms; // custom: ambil apa adanya dari checkbox
    addAct(curUser.nama,`Edit user: ${username}`,'edit');
    if(curUser&&curUser.id===u.id) { curUser=u; applyUserUI(); }
  }
  save(); renderUsers();
  closeModal('m-adduser');
  showToast(isNew?'Pengguna berhasil ditambahkan':'Data pengguna berhasil diperbarui','success');
  resetUserForm();
}

function toggleAktif(idx) {
  const u = users[idx];
  u.aktif = !u.aktif;
  addAct(curUser.nama,`${u.aktif?'Aktifkan':'Nonaktifkan'} user: ${u.username}`,'edit');
  save(); renderUsers();
  showToast(`User ${u.username} ${u.aktif?'diaktifkan':'dinonaktifkan'}`,'info');
}

function openResetPass(idx) {
  document.getElementById('rp-idx').value=idx;
  document.getElementById('rp-uname').textContent=users[idx].nama+' (@'+users[idx].username+')';
  document.getElementById('rp-pass').value='';
  document.getElementById('rp-cpass').value='';
  openModal('m-resetpass');
}

function doResetPass() {
  const idx = document.getElementById('rp-idx').value;
  const p = document.getElementById('rp-pass').value;
  const c = document.getElementById('rp-cpass').value;
  if(!p||p.length<4) { showToast('Password min. 4 karakter','error'); return; }
  if(p!==c) { showToast('Konfirmasi tidak cocok','error'); return; }
  users[idx].password=p;
  addAct(curUser.nama,`Reset password: ${users[idx].username}`,'edit');
  save();
  closeModal('m-resetpass');
  showToast('Password berhasil direset','success');
}

function resetUserForm() {
  document.getElementById('au-idx').value='';
  ['au-nama','au-user','au-email','au-pass','au-cpass'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('au-role').value='operator';
  updatePermUI(); // Terapkan tampilan permission sesuai role default (operator)
}

// ══════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════
function saveProfile() {
  const nama = document.getElementById('pf-nama').value.trim();
  const email = document.getElementById('pf-email').value.trim();
  const oldp = document.getElementById('pf-oldpass').value;
  const newp = document.getElementById('pf-newpass').value;
  const confp = document.getElementById('pf-confpass').value;
  if(!nama) { showToast('Nama tidak boleh kosong','error'); return; }
  const idx = users.findIndex(u=>u.id===curUser.id);
  if(idx<0) return;
  if(oldp||newp||confp) {
    if(users[idx].password!==oldp) { showToast('Password lama salah','error'); return; }
    if(newp.length<4) { showToast('Password baru min. 4 karakter','error'); return; }
    if(newp!==confp) { showToast('Konfirmasi password tidak cocok','error'); return; }
    users[idx].password=newp;
  }
  users[idx].nama=nama; users[idx].email=email;
  curUser=users[idx];
  addAct(nama,'Perbarui profil','edit');
  save(); applyUserUI();
  document.getElementById('pf-oldpass').value='';
  document.getElementById('pf-newpass').value='';
  document.getElementById('pf-confpass').value='';
  showToast('Profil berhasil diperbarui','success');
}

// ══════════════════════════════════════════
// KELOLA KATEGORI
// ══════════════════════════════════════════

// Simpan atribut custom per kategori di localStorage
let katAttr = JSON.parse(localStorage.getItem('sg2_katattr') || '{}');
function saveKatAttr() { localStorage.setItem('sg2_katattr', JSON.stringify(katAttr)); }

// Gabungkan KATEGORI_FIELDS default + overrides dari katAttr
function getFields(kat) {
  if (katAttr[kat]) return katAttr[kat]; // pakai custom jika ada
  return KATEGORI_FIELDS[kat] || [];
}

// ── TAB SWITCHING ──
function switchKatTab(n) {
  [1,2].forEach(i => {
    document.getElementById(`kat-tab-content-${i}`).style.display = i===n ? 'block' : 'none';
    const btn = document.getElementById(`kat-tab-${i}`);
    btn.style.borderBottomColor = i===n ? 'var(--primary)' : 'transparent';
    btn.style.color = i===n ? 'var(--primary)' : 'var(--text2)';
  });
  if (n===2) {
    // Populate dropdown kategori di tab atribut
    const sel = document.getElementById('attr-kat-sel');
    sel.innerHTML = '<option value="">-- Pilih Kategori --</option>' + kategoriList.map(k=>`<option value="${k}">${k}</option>`).join('');
    document.getElementById('attr-editor').innerHTML = '<div class="empty" style="padding:2rem"><p>Pilih kategori untuk mengedit atributnya</p></div>';
  }
}

// ── EDITOR ATRIBUT ──
function renderAttrEditor() {
  const kat = document.getElementById('attr-kat-sel').value;
  const container = document.getElementById('attr-editor');
  if (!kat) { container.innerHTML = '<div class="empty" style="padding:2rem"><p>Pilih kategori untuk mengedit atributnya</p></div>'; return; }

  const fields = JSON.parse(JSON.stringify(getFields(kat))); // deep copy
  // Simpan sementara ke window untuk editing
  window._editFields = fields;
  window._editKat = kat;
  renderFieldRows();
}

function renderFieldRows() {
  const fields = window._editFields || [];
  const kat = window._editKat || '';
  const container = document.getElementById('attr-editor');

  container.innerHTML = `
    <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text2);margin-bottom:.6rem">
      Field untuk kategori: <span style="color:var(--primary)">${kat}</span>
    </div>
    <div id="field-rows">
      ${fields.length === 0 ? `<div style="text-align:center;padding:1rem;color:var(--text3);font-size:.84rem">Belum ada field — klik "+ Tambah Field" untuk menambah</div>` : ''}
      ${fields.map((f,i) => `
        <div style="display:flex;gap:.5rem;align-items:center;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.55rem .75rem;margin-bottom:.4rem" id="frow-${i}">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:.4rem;flex:1;align-items:center">
            <input type="text" value="${f.label||''}" placeholder="Nama Field" onchange="updateField(${i},'label',this.value)"
              style="padding:.35rem .6rem;border:1.5px solid var(--input-border);border-radius:6px;font-size:.8rem;background:var(--input-bg);color:var(--text);outline:none">
            <select onchange="updateField(${i},'type',this.value)"
              style="padding:.35rem .6rem;border:1.5px solid var(--input-border);border-radius:6px;font-size:.8rem;background:var(--input-bg);color:var(--text);outline:none">
              <option value="text" ${f.type==='text'?'selected':''}>Teks</option>
              <option value="number" ${f.type==='number'?'selected':''}>Angka</option>
              <option value="select" ${f.type==='select'?'selected':''}>Pilihan</option>
            </select>
            <input type="text" value="${f.placeholder||''}" placeholder="Placeholder..." onchange="updateField(${i},'placeholder',this.value)"
              style="padding:.35rem .6rem;border:1.5px solid var(--input-border);border-radius:6px;font-size:.8rem;background:var(--input-bg);color:var(--text);outline:none">
            <label style="display:flex;align-items:center;gap:.3rem;font-size:.75rem;color:var(--text2);white-space:nowrap;cursor:pointer">
              <input type="checkbox" ${f.required?'checked':''} onchange="updateField(${i},'required',this.checked)" style="accent-color:var(--primary)"> Wajib
            </label>
          </div>
          ${f.type==='select' ? `
            <div style="flex:1;margin-top:.35rem">
              <input type="text" value="${(f.options||[]).join(', ')}" placeholder="Opsi1, Opsi2, Opsi3"
                onchange="updateField(${i},'options',this.value.split(',').map(s=>s.trim()).filter(Boolean))"
                style="width:100%;padding:.3rem .6rem;border:1.5px solid var(--input-border);border-radius:6px;font-size:.75rem;background:var(--input-bg);color:var(--text);outline:none">
              <span style="font-size:.68rem;color:var(--text3)">Pisahkan dengan koma</span>
            </div>` : ''}
          <button onclick="removeField(${i})" class="icon-btn danger" style="flex-shrink:0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:.5rem;margin-top:.75rem;align-items:center">
      <button class="btn-sm" onclick="addField()" style="display:flex;align-items:center;gap:.3rem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Tambah Field
      </button>
      <div style="flex:1"></div>
      <button class="btn-cancel" onclick="resetAttrFields()">Reset ke Default</button>
      <button class="btn-save" onclick="saveAttrFields()" style="display:flex;align-items:center;gap:.4rem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Simpan Atribut
      </button>
    </div>`;
}

function updateField(idx, key, val) {
  if (!window._editFields) return;
  window._editFields[idx][key] = val;
  if (key === 'type' && val !== 'select') delete window._editFields[idx].options;
  renderFieldRows();
}

function addField() {
  if (!window._editFields) window._editFields = [];
  window._editFields.push({id:'field_'+Date.now(),label:'',type:'text',placeholder:''});
  renderFieldRows();
}

function removeField(idx) {
  window._editFields.splice(idx,1);
  renderFieldRows();
}

function saveAttrFields() {
  const kat = window._editKat;
  if (!kat) return;
  // Validasi label tidak boleh kosong
  const empty = window._editFields.find(f=>!f.label.trim());
  if (empty) { showToast('Nama field tidak boleh kosong!','error'); return; }
  // Auto-set id dari label jika belum ada
  window._editFields.forEach(f => { if(!f.id||f.id.startsWith('field_')) f.id = f.label.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,''); });
  katAttr[kat] = JSON.parse(JSON.stringify(window._editFields));
  saveKatAttr();
  showToast(`Atribut kategori "${kat}" berhasil disimpan!`,'success');
  renderFieldRows();
}

function resetAttrFields() {
  const kat = window._editKat;
  if (!kat) return;
  if (!confirm(`Reset atribut "${kat}" ke default?`)) return;
  delete katAttr[kat];
  saveKatAttr();
  window._editFields = JSON.parse(JSON.stringify(KATEGORI_FIELDS[kat] || []));
  renderFieldRows();
  showToast(`Atribut direset ke default`,'info');
}

function renderKatList() {
  // Juga populate dropdown tab atribut jika sudah dibuka
  const sel = document.getElementById('attr-kat-sel');
  if (sel) sel.innerHTML = '<option value="">-- Pilih Kategori --</option>' + kategoriList.map(k=>`<option value="${k}">${k}</option>`).join('');

  const el = document.getElementById('kat-list');
  if (!el) return;
  if (!kategoriList.length) { el.innerHTML='<div class="empty" style="padding:1rem"><p>Belum ada kategori</p></div>'; return; }
  el.innerHTML = kategoriList.map((k,i) => {
    const used = barang.some(b=>b.kategori===k);
    const fieldCount = getFields(k).length;
    return `<div style="display:flex;align-items:center;gap:.5rem;padding:.5rem .6rem;border-radius:8px;border:1px solid var(--border);margin-bottom:.4rem;background:var(--surface2)">
      <span style="flex:1;font-size:.875rem;color:var(--text);font-weight:500">${k}</span>
      <span style="font-size:.68rem;color:var(--text3)">${fieldCount} field</span>
      ${used ? '<span class="badge b-blue" style="font-size:.65rem">Dipakai</span>' : ''}
      <button class="icon-btn" onclick="editKat(${i})" title="Edit nama">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="icon-btn" onclick="switchKatTab(2);setTimeout(()=>{document.getElementById('attr-kat-sel').value='${k}';renderAttrEditor();},50)" title="Edit atribut" style="color:var(--blue-text);border-color:var(--primary)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      </button>
      <button class="icon-btn danger" onclick="hapusKat(${i})" ${used?'disabled title="Sedang dipakai"':''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
      </button>
    </div>`;
  }).join('');
}

function updateKatPreview() {
  const val = document.getElementById('kat-input').value.trim();
  const prev = document.getElementById('kat-preview');
  const badge = document.getElementById('kat-preview-badge');
  if (val) { prev.style.display='block'; badge.textContent=val; }
  else { prev.style.display='none'; }
}

function saveKategori() {
  const val = document.getElementById('kat-input').value.trim();
  if (!val) { showToast('Nama kategori tidak boleh kosong','error'); return; }
  const idx = document.getElementById('kat-edit-idx').value;
  if (idx === '') {
    if (kategoriList.includes(val)) { showToast('Kategori sudah ada!','error'); return; }
    kategoriList.push(val);
    showToast(`Kategori "${val}" berhasil ditambahkan`,'success');
  } else {
    const old = kategoriList[idx];
    barang.forEach(b => { if (b.kategori===old) b.kategori=val; });
    if (katAttr[old]) { katAttr[val]=katAttr[old]; delete katAttr[old]; saveKatAttr(); }
    kategoriList[idx] = val;
    save();
    showToast(`Kategori diubah: "${old}" → "${val}"`,'success');
  }
  saveKat(); resetKatForm(); renderKatList(); updateKatSelect();
}

function editKat(idx) {
  document.getElementById('kat-input').value = kategoriList[idx];
  document.getElementById('kat-edit-idx').value = idx;
  document.getElementById('kat-form-label').textContent = 'Edit Nama Kategori';
  document.getElementById('kat-cancel-btn').style.display = 'inline-flex';
  updateKatPreview();
  document.getElementById('kat-input').focus();
}

function hapusKat(idx) {
  const k = kategoriList[idx];
  if (barang.some(b=>b.kategori===k)) { showToast('Kategori sedang dipakai!','error'); return; }
  if (!confirm(`Hapus kategori "${k}"?`)) return;
  kategoriList.splice(idx,1);
  delete katAttr[k]; saveKatAttr();
  saveKat(); renderKatList(); updateKatSelect();
  showToast(`Kategori "${k}" dihapus`,'info');
}

function resetKatForm() {
  document.getElementById('kat-input').value = '';
  document.getElementById('kat-edit-idx').value = '';
  document.getElementById('kat-form-label').textContent = 'Nama Kategori Baru';
  document.getElementById('kat-cancel-btn').style.display = 'none';
  document.getElementById('kat-preview').style.display = 'none';
}

function updateKatSelect() {
  const el = document.getElementById('b-kat');
  if (el) { const cur=el.value; el.innerHTML='<option value="">Pilih Kategori</option>'+kategoriList.map(k=>`<option>${k}</option>`).join(''); el.value=cur; }
  renderBarang();
}
function saveKat() { localStorage.setItem('sg2_kat', JSON.stringify(kategoriList)); }


function saveBarang() {
  if(!canDo('add')&&document.getElementById('b-idx').value==='') { showToast('Anda tidak punya izin menambah barang','error'); return; }
  const kode=document.getElementById('b-kode').value.trim();
  const nama=document.getElementById('b-nama').value.trim();
  const kat=document.getElementById('b-kat').value;
  if(!kode||!nama||!kat) { showToast('Harap isi field wajib (*)','error'); return; }
  const idx = document.getElementById('b-idx').value;
  const obj={kode,nama,kategori:kat,satuan:document.getElementById('b-sat').value,
    stok:Number(document.getElementById('b-stok').value)||0,min:Number(document.getElementById('b-min').value)||0,
    harga:Number(document.getElementById('b-harga').value)||0,lokasi:document.getElementById('b-lokasi').value,
    ket:document.getElementById('b-ket').value};
  if(idx==='') {
    if(barang.find(b=>b.kode===kode)) { showToast('Kode sudah ada!','error'); return; }
    barang.push(obj);
    addAct(nama,'Barang baru ditambahkan','masuk');
  } else {
    barang[idx]=obj;
    addAct(nama,'Data barang diperbarui','edit');
  }
  save(); renderAll();
  closeModal('m-barang'); resetBrg();
  showToast(idx===''?'Barang berhasil ditambahkan':'Barang berhasil diperbarui','success');
}

function editBarang(idx) {
  if(!canDo('edit')) { showToast('Anda tidak punya izin edit','error'); return; }
  const b=barang[idx];
  document.getElementById('mb-title').textContent='Edit Barang';
  document.getElementById('b-idx').value=idx;
  document.getElementById('b-kode').value=b.kode;
  document.getElementById('b-nama').value=b.nama;
  document.getElementById('b-kat').value=b.kategori;
  document.getElementById('b-sat').value=b.satuan;
  document.getElementById('b-stok').value=b.stok;
  document.getElementById('b-min').value=b.min;
  document.getElementById('b-harga').value=b.harga||0;
  document.getElementById('b-lokasi').value=b.lokasi||'';
  document.getElementById('b-ket').value=b.ket||'';
  openModal('m-barang');
}

function hapusBarang(idx) {
  if(!canDo('delete')) { showToast('Anda tidak punya izin hapus','error'); return; }
  if(!confirm(`Hapus barang "${barang[idx].nama}"?`)) return;
  addAct(barang[idx].nama,'Barang dihapus','hapus');
  barang.splice(idx,1); save(); renderAll();
  showToast('Barang berhasil dihapus','info');
}

function resetBrg() {
  document.getElementById('mb-title').textContent='Tambah Barang';
  document.getElementById('b-idx').value='';
  ['b-kode','b-nama','b-stok','b-min','b-harga','b-lokasi','b-ket'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('b-kat').value='';
  document.getElementById('b-sat').value='Pcs';
}

// ══════════════════════════════════════════
// TRANSAKSI
// ══════════════════════════════════════════
function updateBrgOpts() {
  // Populate kategori dropdowns in masuk/keluar forms
  const katOpts = '<option value="">-- Pilih Kategori --</option>' + kategoriList.map(k=>`<option value="${k}">${k}</option>`).join('');
  const miKat = document.getElementById('mi-kat');
  const kiKat = document.getElementById('ki-kat');
  if (miKat) miKat.innerHTML = katOpts;
  if (kiKat) kiKat.innerHTML = katOpts;
  // Reset barang dropdowns
  document.getElementById('mi-brg').innerHTML = '<option value="">-- Pilih Barang --</option>';
  document.getElementById('ki-brg').innerHTML = '<option value="">-- Pilih Barang --</option>';
}

function filterBrgByKat(kat, brgSelectId) {
  const filtered = kat ? barang.filter(b => b.kategori === kat) : [];
  const opts = '<option value="">-- Pilih Barang --</option>' + filtered.map(b=>`<option value="${b.kode}">${b.kode} — ${b.nama}</option>`).join('');
  document.getElementById(brgSelectId).innerHTML = opts;
}

function onMasukKatChange() {
  const kat = document.getElementById('mi-kat').value;
  filterBrgByKat(kat, 'mi-brg');
  renderDynamicFields(kat, 'mi-dynamic-fields', 'mi');
}

function onKeluarKatChange() {
  const kat = document.getElementById('ki-kat').value;
  filterBrgByKat(kat, 'ki-brg');
  renderDynamicFields(kat, 'ki-dynamic-fields', 'ki');
}

// ══════════════════════════════════════════
// DYNAMIC FIELDS BERDASARKAN KATEGORI
// ══════════════════════════════════════════

// Definisi field per kategori
const KATEGORI_FIELDS = {
  'Ont/Modem': [
    {id:'sn', label:'Serial Number', type:'text', placeholder:'SN Perangkat'},
    {id:'mac', label:'MAC Address', type:'text', placeholder:'AA:BB:CC:DD:EE:FF'},
    {id:'tipe', label:'Tipe/Model', type:'text', placeholder:'Tipe perangkat'},
  ],
  'OLT': [
    {id:'sn', label:'Serial Number', type:'text', placeholder:'SN OLT'},
    {id:'port', label:'Jumlah Port', type:'number', placeholder:'24'},
    {id:'teknologi', label:'Teknologi', type:'text', placeholder:'GPON/EPON'},
  ],
  'STB': [
    {id:'sn', label:'Serial Number', type:'text', placeholder:'SN STB'},
    {id:'mac', label:'MAC Address', type:'text', placeholder:'AA:BB:CC:DD:EE:FF'},
    {id:'tipe', label:'Tipe', type:'text', placeholder:'HD/4K'},
  ],
  'Adaptor': [
    {id:'tegangan', label:'Tegangan (V)', type:'number', placeholder:'12'},
    {id:'arus', label:'Arus (A)', type:'number', placeholder:'2'},
    {id:'konektor', label:'Konektor', type:'text', placeholder:'DC Jack'},
  ],
  'CCTV': [
    {id:'resolusi', label:'Resolusi', type:'text', placeholder:'1080p/4K'},
    {id:'lensa', label:'Lensa (mm)', type:'number', placeholder:'3.6'},
    {id:'penglihatan', label:'Jenis', type:'select', options:['Fixed','Varifocal','PTZ']},
  ],
  'SFP': [
    {id:'wavelength', label:'Wavelength (nm)', type:'number', placeholder:'1310'},
    {id:'distance', label:'Distance (km)', type:'number', placeholder:'10'},
    {id:'konektor', label:'Connector', type:'select', options:['LC','SC','FC','ST','MPO']},
  ],
  'Kabel lan 1m': [
    {id:'panjang', label:'Panjang (m)', type:'number', placeholder:'1'},
    {id:'jenis', label:'Jenis Kabel', type:'select', options:['UTP Cat 5e','UTP Cat 6','UTP Cat 6a','UTP Cat 7','STP']},
    {id:'warna', label:'Warna', type:'text', placeholder:'Biru/Kuning'},
  ],
  'Kabel fiber 1 core': [
    {id:'panjang', label:'Panjang (m)', type:'number', placeholder:'100'},
    {id:'konektor', label:'Connector', type:'select', options:['LC','SC','FC','ST','LC/UPC','LC/APC','SC/APC']},
  ],
  'Kabel fiber 4 core': [
    {id:'panjang', label:'Panjang (m)', type:'number', placeholder:'100'},
    {id:'konektor', label:'Connector', type:'select', options:['LC','SC','FC','ST','LC/UPC','LC/APC','SC/APC']},
  ],
  'Kabel precon': [
    {id:'panjang', label:'Panjang (m)', type:'number', placeholder:'20'},
    {id:'konektor', label:'Connector', type:'select', options:['LC','SC','FC','ST','LC/UPC','LC/APC','SC/APC']},
  ],
  'Pasif box 1:4': [
    {id:'tipeport', label:'Tipe Port', type:'select', options:['SC','LC','FC','ST']},
    {id:'jenis', label:'Jenis Splitter', type:'text', placeholder:'PLC/FBT'},
  ],
  'Pasif box 1:8': [
    {id:'tipeport', label:'Tipe Port', type:'select', options:['SC','LC','FC','ST']},
    {id:'jenis', label:'Jenis Splitter', type:'text', placeholder:'PLC/FBT'},
  ],
  'Pasif box 1:16': [
    {id:'tipeport', label:'Tipe Port', type:'select', options:['SC','LC','FC','ST']},
    {id:'jenis', label:'Jenis Splitter', type:'text', placeholder:'PLC/FBT'},
  ],
  'Box odp 1:16': [
    {id:'tipeport', label:'Tipe Port', type:'select', options:['SC','LC','FC','ST']},
    {id:'jenis', label:'Jenis', type:'text', placeholder:'PLC/FBT'},
  ],
  'Box odp 1:8': [
    {id:'tipeport', label:'Tipe Port', type:'select', options:['SC','LC','FC','ST']},
    {id:'jenis', label:'Jenis', type:'text', placeholder:'PLC/FBT'},
  ],
  'Pasif spliter 1:2': [
    {id:'jenis', label:'Jenis Splitter', type:'text', placeholder:'PLC/FBT'},
    {id:'bandwidth', label:'Bandwidth (nm)', type:'text', placeholder:'1260-1650'},
  ],
  'Join closure': [
    {id:'splicetray', label:'Kapasitas Splice Tray', type:'number', placeholder:'12'},
    {id:'portklem', label:'Jumlah Port Klemp', type:'number', placeholder:'6'},
    {id:'diamkabel', label:'Diameter Kabel (mm)', type:'number', placeholder:'20'},
  ],
  'Pigtal': [
    {id:'panjang', label:'Panjang (m)', type:'number', placeholder:'1'},
    {id:'konektor', label:'Connector', type:'select', options:['LC','SC','FC','ST','LC/UPC','LC/APC']},
  ],
};

// Kategori tanpa field tambahan - hanya ket opsional
const KAT_NO_FIELDS = ['Pathcore','Klem kabel / pax isi 50pcs','Protector','Lakban','Pin konektor','Tali ties kecil','Tali ties besar'];

function renderDynamicFields(kat, containerId, prefix) {
  const container = document.getElementById(containerId);
  if (!kat) { container.innerHTML = ''; return; }

  const fields = getFields(kat); // pakai getFields() agar merge custom + default
  if (!fields || fields.length === 0) {
    container.innerHTML = `<div class="form-row">
      <div class="field"><label>Keterangan Spesifik</label><input type="text" id="${prefix}-ket-spesifik" placeholder="Spesifikasi tambahan"></div>
    </div>`;
    return;
  }

  // Render field sesuai definisi - 2 kolom
  const pairs = [];
  for (let i=0; i<fields.length; i+=2) pairs.push(fields.slice(i,i+2));
  let html = `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:.85rem .9rem;margin-bottom:.75rem">
    <div style="display:flex;align-items:center;gap:.4rem;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--blue-text);margin-bottom:.65rem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg> Detail ${kat}</div>`;
  pairs.forEach(pair => {
    html += `<div class="form-row" style="margin-bottom:0">`;
    pair.forEach(f => {
      html += `<div class="field" style="margin-bottom:.6rem"><label>${f.label}${f.required?'<span style="color:var(--red-text)"> *</span>':''}</label>`;
      if (f.type === 'select') {
        html += `<select id="${prefix}-${f.id}"><option value="">-- Pilih --</option>${(f.options||[]).map(o=>`<option value="${o}">${o}</option>`).join('')}</select>`;
      } else {
        html += `<input type="${f.type||'text'}" id="${prefix}-${f.id}" placeholder="${f.placeholder||''}"${f.type==='number'?' min="0" step="any"':''}>`;
      }
      html += `</div>`;
    });
    if (pair.length===1) html += `<div class="field" style="margin-bottom:.6rem"></div>`;
    html += `</div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function getDynamicValues(kat, prefix) {
  const fields = KATEGORI_FIELDS[kat];
  const result = {};
  if (!fields) {
    const el = document.getElementById(`${prefix}-ket-spesifik`);
    if (el) result.ket_spesifik = el.value;
    return result;
  }
  fields.forEach(f => {
    const el = document.getElementById(`${prefix}-${f.id}`);
    if (el) result[f.id] = el.value;
  });
  return result;
}

function formatDetailText(kat, detail) {
  if (!detail || !Object.keys(detail).length) return '—';
  const fields = KATEGORI_FIELDS[kat];
  if (!fields) {
    return detail.ket_spesifik || '—';
  }
  const parts = [];
  fields.forEach(f => {
    const v = detail[f.id];
    if (v) parts.push(`${f.label}: ${v}`);
  });
  return parts.length ? parts.join(' | ') : '—';
}

// Legacy stubs (tidak dipakai lagi, tapi aman)
function updateMasukDynamicFields() { onMasukKatChange(); }
function updateKeluarDynamicFields() { onKeluarKatChange(); }
// ══════════════════════════════════════════
// TRANSAKSI SAVE
// ══════════════════════════════════════════
function saveMasuk() {
  if(!canDo('masuk')) { showToast('Anda tidak punya izin catat masuk','error'); return; }
  const kat=document.getElementById('mi-kat').value;
  const kode=document.getElementById('mi-brg').value;
  const jml=Number(document.getElementById('mi-jml').value);
  const tgl=document.getElementById('mi-tgl').value;
  if(!kat||!kode||!jml||jml<=0||!tgl) { showToast('Harap lengkapi data (Kategori, Barang, Jumlah, Tanggal)!','error'); return; }
  const b=barang.find(x=>x.kode===kode);
  const detail = getDynamicValues(kat, 'mi');
  b.stok+=jml;
  transMasuk.push({tgl,kode,nama:b.nama,kategori:kat,detail,jml,src:document.getElementById('mi-src').value,cat:document.getElementById('mi-cat').value,oleh:curUser?.nama});
  addAct(b.nama,`Masuk ${jml} ${b.satuan} oleh ${curUser?.nama}`,'masuk');
  save(); renderAll();
  closeModal('m-masuk');
  document.getElementById('mi-kat').value='';
  document.getElementById('mi-brg').innerHTML='<option value="">-- Pilih Barang --</option>';
  document.getElementById('mi-dynamic-fields').innerHTML='';
  ['mi-jml','mi-src','mi-cat'].forEach(id=>document.getElementById(id).value='');
  showToast(`+${jml} ${b.satuan} ${b.nama} berhasil dicatat`,'success');
}

function saveKeluar() {
  if(!canDo('keluar')) { showToast('Anda tidak punya izin catat keluar','error'); return; }
  const kat=document.getElementById('ki-kat').value;
  const kode=document.getElementById('ki-brg').value;
  const jml=Number(document.getElementById('ki-jml').value);
  const tgl=document.getElementById('ki-tgl').value;
  if(!kat||!kode||!jml||jml<=0||!tgl) { showToast('Harap lengkapi data (Kategori, Barang, Jumlah, Tanggal)!','error'); return; }
  const b=barang.find(x=>x.kode===kode);
  if(jml>b.stok) { showToast(`Stok tidak cukup! Tersedia: ${b.stok} ${b.satuan}`,'error'); return; }
  const detail = getDynamicValues(kat, 'ki');
  b.stok-=jml;
  transKeluar.push({tgl,kode,nama:b.nama,kategori:kat,detail,jml,tuj:document.getElementById('ki-tuj').value,cat:document.getElementById('ki-cat').value,oleh:curUser?.nama});
  addAct(b.nama,`Keluar ${jml} ${b.satuan} oleh ${curUser?.nama}`,'keluar');
  save(); renderAll();
  closeModal('m-keluar');
  document.getElementById('ki-kat').value='';
  document.getElementById('ki-brg').innerHTML='<option value="">-- Pilih Barang --</option>';
  document.getElementById('ki-dynamic-fields').innerHTML='';
  ['ki-jml','ki-tuj','ki-cat'].forEach(id=>document.getElementById(id).value='');
  showToast(`-${jml} ${b.satuan} ${b.nama} berhasil dicatat`,'success');
}

// ══════════════════════════════════════════
// MODAL HELPERS
// ══════════════════════════════════════════
function openModal(id) {
  document.getElementById(id).classList.add('open');
  if(id==='m-masuk') {
    document.getElementById('mi-tgl').value=today();
    updateBrgOpts();
    document.getElementById('mi-dynamic-fields').innerHTML='';
  }
  if(id==='m-keluar') {
    document.getElementById('ki-tgl').value=today();
    updateBrgOpts();
    document.getElementById('ki-dynamic-fields').innerHTML='';
  }
  if(id==='m-adduser') updatePermUI();
  if(id==='m-barang') { updateKatSelect(); }
  if(id==='m-kategori') { resetKatForm(); renderKatList(); }
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.mbd').forEach(bd=>bd.addEventListener('click',e=>{if(e.target===bd)bd.classList.remove('open');}));

// ══════════════════════════════════════════
// EXPORT EXCEL
// ══════════════════════════════════════════
function exportExcel() {
  if(!canDo('export')) { showToast('Anda tidak punya izin export','error'); return; }
  const wb=XLSX.utils.book_new();
  const h1=[['Kode','Nama Barang','Kategori','Satuan','Stok','Min Stok','Harga','Lokasi','Status','Keterangan']];
  barang.forEach(b=>h1.push([b.kode,b.nama,b.kategori,b.satuan,b.stok,b.min,b.harga||0,b.lokasi||'',getStatus(b).toUpperCase(),b.ket||'']));
  const ws1=XLSX.utils.aoa_to_sheet(h1); ws1['!cols']=[{wch:12},{wch:25},{wch:15},{wch:8},{wch:8},{wch:10},{wch:12},{wch:12},{wch:10},{wch:25}];
  XLSX.utils.book_append_sheet(wb,ws1,'Data Barang');
  const h2=[['Tanggal','Kode','Nama Barang','Jumlah','Sumber','Dicatat Oleh','Catatan']];
  transMasuk.forEach(t=>h2.push([t.tgl,t.kode,t.nama,t.jml,t.src||'',t.oleh||'',t.cat||'']));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(h2),'Barang Masuk');
  const h3=[['Tanggal','Kode','Nama Barang','Jumlah','Tujuan','Dicatat Oleh','Catatan']];
  transKeluar.forEach(t=>h3.push([t.tgl,t.kode,t.nama,t.jml,t.tuj||'',t.oleh||'',t.cat||'']));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(h3),'Barang Keluar');
  XLSX.writeFile(wb,`Laporan_Gudang_${today()}.xlsx`);
  showToast('File Excel berhasil diunduh!','success');
}
function exportStok() { if(!canDo('export')){showToast('Tidak ada izin','error');return;} const wb=XLSX.utils.book_new(),h=[['Kode','Nama','Kategori','Satuan','Stok','Min','Harga','Lokasi','Status']]; barang.forEach(b=>h.push([b.kode,b.nama,b.kategori,b.satuan,b.stok,b.min,b.harga||0,b.lokasi||'',getStatus(b).toUpperCase()])); XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(h),'Stok'); XLSX.writeFile(wb,`Stok_${today()}.xlsx`); showToast('Export Stok berhasil!','success'); }
function exportMasuk() { if(!canDo('export')){showToast('Tidak ada izin','error');return;} const wb=XLSX.utils.book_new(),h=[['Tanggal','Kode','Nama','Jumlah','Sumber','Oleh','Catatan']]; transMasuk.forEach(t=>h.push([t.tgl,t.kode,t.nama,t.jml,t.src||'',t.oleh||'',t.cat||''])); XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(h),'Masuk'); XLSX.writeFile(wb,`Barang_Masuk_${today()}.xlsx`); showToast('Export Masuk berhasil!','success'); }
function exportKeluar() { if(!canDo('export')){showToast('Tidak ada izin','error');return;} const wb=XLSX.utils.book_new(),h=[['Tanggal','Kode','Nama','Jumlah','Tujuan','Oleh','Catatan']]; transKeluar.forEach(t=>h.push([t.tgl,t.kode,t.nama,t.jml,t.tuj||'',t.oleh||'',t.cat||''])); XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(h),'Keluar'); XLSX.writeFile(wb,`Barang_Keluar_${today()}.xlsx`); showToast('Export Keluar berhasil!','success'); }

// ══════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════
let toastTimer=null;
function showToast(msg, type='success') {
  const t=document.getElementById('toast');
  const icons = {
    success:'<polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
    error:'<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    info:'<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
  };
  t.querySelector('svg').innerHTML=icons[type]||icons.success;
  t.className='toast '+type;
  document.getElementById('toast-msg').textContent=msg;
  t.classList.add('show');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),3000);
}

// ══════════════════════════════════════════
// KELOLA KATEGORI
// ══════════════════════════════════════════
function saveKat() { localStorage.setItem('sg2_kat', JSON.stringify(kategoriList)); }

function renderKatList() {
  const el = document.getElementById('kat-list');
  if (!kategoriList.length) { el.innerHTML='<div class="empty" style="padding:1rem"><p>Belum ada kategori</p></div>'; return; }
  el.innerHTML = kategoriList.map((k,i) => {
    const used = barang.some(b => b.kategori === k);
    return `<div style="display:flex;align-items:center;gap:.5rem;padding:.5rem .6rem;border-radius:8px;border:1px solid var(--border);margin-bottom:.4rem;background:var(--surface2)">
      <span style="flex:1;font-size:.875rem;color:var(--text);font-weight:500">${k}</span>
      ${used ? '<span class="badge b-blue" style="font-size:.65rem">Dipakai</span>' : ''}
      <button class="icon-btn" onclick="editKat(${i})" data-tip="Edit Kategori">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="icon-btn danger" onclick="hapusKat(${i})" ${used?'disabled title="Sedang dipakai"':''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
      </button>
    </div>`;
  }).join('');
}

function updateKatPreview() {
  const val = document.getElementById('kat-input').value.trim();
  const prev = document.getElementById('kat-preview');
  const badge = document.getElementById('kat-preview-badge');
  if (val) { prev.style.display='block'; badge.textContent=val; }
  else { prev.style.display='none'; }
}

function saveKategori() {
  const val = document.getElementById('kat-input').value.trim();
  if (!val) { showToast('Nama kategori tidak boleh kosong','error'); return; }
  const idx = document.getElementById('kat-edit-idx').value;
  if (idx === '') {
    if (kategoriList.includes(val)) { showToast('Kategori sudah ada!','error'); return; }
    kategoriList.push(val);
    showToast(`Kategori "${val}" berhasil ditambahkan`,'success');
  } else {
    const old = kategoriList[idx];
    // Update barang yang pakai kategori lama
    barang.forEach(b => { if (b.kategori === old) b.kategori = val; });
    kategoriList[idx] = val;
    save();
    showToast(`Kategori diubah: "${old}" → "${val}"`,'success');
  }
  saveKat(); resetKatForm(); renderKatList(); updateKatSelect();
}

function editKat(idx) {
  document.getElementById('kat-input').value = kategoriList[idx];
  document.getElementById('kat-edit-idx').value = idx;
  document.getElementById('kat-form-label').textContent = 'Edit Nama Kategori';
  document.getElementById('kat-cancel-btn').style.display = 'inline-flex';
  updateKatPreview();
  document.getElementById('kat-input').focus();
}

function hapusKat(idx) {
  const k = kategoriList[idx];
  if (barang.some(b=>b.kategori===k)) { showToast('Kategori sedang dipakai!','error'); return; }
  if (!confirm(`Hapus kategori "${k}"?`)) return;
  kategoriList.splice(idx,1);
  saveKat(); renderKatList(); updateKatSelect();
  showToast(`Kategori "${k}" dihapus`,'info');
}

function resetKatForm() {
  document.getElementById('kat-input').value = '';
  document.getElementById('kat-edit-idx').value = '';
  document.getElementById('kat-form-label').textContent = 'Nama Kategori Baru';
  document.getElementById('kat-cancel-btn').style.display = 'none';
  document.getElementById('kat-preview').style.display = 'none';
}

function updateKatSelect() {
  // Update dropdown kategori di modal tambah barang dan filter
  const opts = kategoriList.map(k=>`<option>${k}</option>`).join('');
  const bKat = document.getElementById('b-kat');
  if (bKat) { const cur=bKat.value; bKat.innerHTML='<option value="">Pilih Kategori</option>'+opts; bKat.value=cur; }
  // Also refresh masuk/keluar kategori dropdowns
  updateBrgOpts();
  renderBarang(); // refresh filter kategori
}

// ══════════════════════════════════════════
// EDIT & HAPUS TRANSAKSI
// ══════════════════════════════════════════
function editTrans(type, idx) {
  if(!canDo(type)) { showToast('Anda tidak punya izin edit transaksi ini','error'); return; }
  const t = type==='masuk' ? transMasuk[idx] : transKeluar[idx];
  document.getElementById('et-title').textContent = type==='masuk' ? 'Edit Barang Masuk' : 'Edit Barang Keluar';
  document.getElementById('et-type').value = type;
  document.getElementById('et-idx').value = idx;
  document.getElementById('et-tgl').value = t.tgl;
  document.getElementById('et-jml').value = t.jml;
  document.getElementById('et-extra-label').textContent = type==='masuk' ? 'Sumber/Supplier' : 'Tujuan/Penerima';
  document.getElementById('et-extra').value = type==='masuk' ? (t.src||'') : (t.tuj||'');
  document.getElementById('et-cat').value = t.cat||'';
  openModal('m-edit-trans');
}

function hapusTrans(type, idx) {
  if(!canDo('delete')) { showToast('Anda tidak punya izin hapus','error'); return; }
  const arr = type==='masuk' ? transMasuk : transKeluar;
  const t = arr[idx];
  if(!confirm(`Hapus transaksi "${t.nama}" ${type==='masuk'?'+':'−'}${t.jml} pada ${t.tgl}?\n\nStok barang akan disesuaikan kembali.`)) return;
  // Kembalikan stok
  const b = barang.find(x=>x.kode===t.kode);
  if(b) { if(type==='masuk') b.stok-=t.jml; else b.stok+=t.jml; }
  arr.splice(idx,1);
  addAct(t.nama,`Transaksi ${type} dihapus`,'hapus');
  save(); renderAll();
  showToast('Transaksi berhasil dihapus','info');
}

function saveTrans() {
  const type = document.getElementById('et-type').value;
  const idx = Number(document.getElementById('et-idx').value);
  const tgl = document.getElementById('et-tgl').value;
  const jml = Number(document.getElementById('et-jml').value);
  if(!tgl||!jml||jml<=0) { showToast('Tanggal dan jumlah wajib diisi!','error'); return; }
  const arr = type==='masuk' ? transMasuk : transKeluar;
  const t = arr[idx];
  const b = barang.find(x=>x.kode===t.kode);
  // Koreksi stok: kembalikan dulu stok lama, terapkan stok baru
  if(b) {
    if(type==='masuk') b.stok = b.stok - t.jml + jml;
    else {
      const newStok = b.stok + t.jml - jml;
      if(newStok<0){showToast('Stok tidak cukup untuk perubahan ini!','error');return;}
      b.stok=newStok;
    }
  }
  t.tgl=tgl; t.jml=jml;
  if(type==='masuk') t.src=document.getElementById('et-extra').value;
  else t.tuj=document.getElementById('et-extra').value;
  t.cat=document.getElementById('et-cat').value;
  addAct(t.nama,`Edit transaksi ${type}`,'edit');
  save(); renderAll();
  closeModal('m-edit-trans');
  showToast('Transaksi berhasil diperbarui','success');
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
applyTheme();
seedData();
katAttr = JSON.parse(localStorage.getItem('sg2_katattr') || '{}');
document.getElementById('login-year').textContent = new Date().getFullYear();
restoreSession(); // pulihkan sesi login jika ada, agar tidak selalu kembali ke halaman login saat refresh
window.addEventListener('resize',()=>{ if(document.getElementById('app').style.display!=='none') renderDashboard(); });
document.querySelector('[onclick="openModal(\'m-adduser\')"]').setAttribute('onclick','openAddUser()');
