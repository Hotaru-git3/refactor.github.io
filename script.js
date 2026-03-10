var menuData = {
  mercon: { nama: 'Bakso Mercon', deskripsi: 'Bakso pedas dengan kuah gurih.', harga: 20000, image: 'img/BAKSOMERCON.jpg' },
  biasa: { nama: 'Bakso Biasa', deskripsi: 'Bakso kuah gurih hangat.', harga: 20000, image: 'img/BAKSOBIASA.jpg' },
  mieayam: { nama: 'Mie Ayam', deskripsi: 'Mie ayam gurih.', harga: 10000, image: 'img/MIEAYAM.jpg' },
  telor: { nama: 'Bakso Telor', deskripsi: 'Bakso isi telur.', harga: 10000, image: 'img/BAKSOTELOR.jpg' },
  pangsit: { nama: 'Pangsit', deskripsi: 'Pangsit goreng renyah.', harga: 10000, image: 'img/PANGSIT.jpg' },
  esteh: { nama: 'Es Teh', deskripsi: 'Minuman segar.', harga: 5000, image: 'img/ESTEH.jpg' }
};

function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}
function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

// Logic buat efek loading pas Login
function actionLogin() {
  showLoading();
  setTimeout(function() {
    hideLoading();
    goPage('homePage'); // Pindah ke home setelah 1 detik
  }, 1000);
}

// Logic buat efek loading pas Bayar
function actionPay() {
  showLoading();
  setTimeout(function() {
    hideLoading();
    completeOrder(); // Jalanin fungsi ngosongin keranjang & pindah halaman
  }, 1500); // Agak lamaan dikit (1.5 detik) biar kerasa lagi "verifikasi"
}

var cart = [];
var currentDetailKey = 'mercon';
var selectedPayment = '';

// NAVIGASI
function goPage(id){
  var pages = document.querySelectorAll('.page');
  pages.forEach(function(p){
    p.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
  updateNavState(id);
}

function updateNavState(id){
  var navMap = {
    homePage: 'Beranda',
    addressPage: 'Alamat',
    cartPage: 'Pesanan',
    paymentPage: 'Pesanan',
    instructionPage: 'Pesanan',
    successPage: 'Pesanan',
    statusPage: 'Pesanan',
    profilePage: 'Akun'
  };

  var activeLabel = navMap[id];
  var navButtons = document.querySelectorAll('.nav-btn');

  navButtons.forEach(function(btn){
    btn.classList.remove('active');
    if(btn.textContent.trim() === activeLabel){
      btn.classList.add('active');
    }
  });
}

function formatRupiah(angka){
  return 'Rp ' + angka.toLocaleString('id-ID');
}

function showDetail(key){
  currentDetailKey = key;
  var item = menuData[key];

  document.getElementById('detailTitle').innerText = item.nama;
  document.getElementById('detailDesc').innerText = item.deskripsi;
  document.getElementById('detailPrice').innerText = formatRupiah(item.harga);
  document.getElementById('detailImage').src = item.image;
  document.getElementById('detailImage').alt = item.nama;

  goPage('detailPage');
}

// LOGIC CART DENGAN QUANTITY
function addToCart(nama, harga, image){
  var existingItem = cart.find(function(item) {
    return item.nama === nama;
  });

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      nama: nama,
      harga: harga,
      image: image,
      quantity: 1
    });
  }

  renderCart();
  goPage('cartPage');
}

function addCurrentDetailToCart(){
  var item = menuData[currentDetailKey];
  addToCart(item.nama, item.harga, item.image);
}

function removeCartItem(index){
  cart.splice(index, 1);
  renderCart();
}

function renderCart(){
  var cartBox = document.getElementById('cartItemsBox');
  var subtotal = 0;
  var shipping = cart.length > 0 ? 7500 : 0;
  var html = '';

  if(cart.length === 0){
    html = '<div class="summary-line"><span>Belum ada pesanan.</span><span>-</span></div>';
  } else {
    cart.forEach(function(item, index){
      var totalHargaItem = item.harga * item.quantity;
      subtotal += totalHargaItem;
      html += `
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #eee;">
          <img src="${item.image}" alt="${item.nama}" style="width:70px;height:70px;object-fit:cover;border-radius:10px;">
          <div style="flex:1;">
            <div style="font-weight:bold;color:var(--red);">${item.nama} <span style="font-size:12px; color:#555;">(x${item.quantity})</span></div>
            <div style="font-size:13px;margin-top:4px;">${formatRupiah(totalHargaItem)}</div>
          </div>
          <button onclick="removeCartItem(${index})" style="border:none;background:#eee;padding:8px 10px;border-radius:8px;cursor:pointer; font-size:12px;">Hapus</button>
        </div>
      `;
    });
  }

  cartBox.innerHTML = html;
  document.getElementById('subtotalText').innerText = formatRupiah(subtotal);
  document.getElementById('shippingText').innerText = formatRupiah(shipping);
  document.getElementById('totalText').innerText = formatRupiah(subtotal + shipping);
}

// LOGIC PEMBAYARAN
function goToPayment() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong, bro! Pilih menu dulu yuk.");
    return;
  }
  goPage('paymentPage');
}

function selectPayment(method, btnElement) {
  selectedPayment = method;
  
  var buttons = document.querySelectorAll('.pay-btn');
  buttons.forEach(function(btn) {
    btn.classList.remove('active-pay');
  });
  
  btnElement.classList.add('active-pay');
}

function processPayment() {
  if (selectedPayment === '') {
    alert('Pilih metode pembayaran dulu, bro!');
    return;
  }

  if (selectedPayment === 'COD') {
    completeOrder();
  } else {
    document.getElementById('instTitle').innerText = 'Pembayaran ' + selectedPayment;
    
    var subtotal = 0;
    cart.forEach(function(item) {
      subtotal += (item.harga * item.quantity);
    });
    var shipping = 7500;
    
    document.getElementById('instTotal').innerText = formatRupiah(subtotal + shipping);
    var mediaBox = document.getElementById('instMedia');
    
    if (selectedPayment === 'QRIS' || selectedPayment === 'E-Wallet') {
      if (selectedPayment === 'QRIS' || selectedPayment === 'E-Wallet') {
  // Panggil gambar asli dari folder img/
  mediaBox.innerHTML = `
    <img src="img/qris_asli.jpg" alt="QRIS Bakso Barokah" style="width:100%; max-width:200px; border-radius:12px;">
    <p style="margin-top:10px; font-size:12px; font-weight:bold; color:var(--brown);">Scan & Bayar di Sini</p>
  `;
}
      
    } else if (selectedPayment === 'Transfer Bank') {
      mediaBox.innerHTML = '<div style="margin-top:10px;">Gunakan Virtual Account:<br><br><span style="font-size:22px; font-weight:bold; letter-spacing:1px; color:var(--red);">8273 1928 3341</span><br><br><span style="font-size:12px;">BCA a.n Bakso Barokah</span></div>';
    }

    goPage('instructionPage');
  }
}

function completeOrder() {
  cart = []; 
  renderCart(); 
  selectedPayment = ''; 
  
  // Reset tombol bayar
  var buttons = document.querySelectorAll('.pay-btn');
  buttons.forEach(function(btn) {
    btn.classList.remove('active-pay');
  });

  goPage('successPage'); 
}

// INISIALISASI AWAL
renderCart();
updateNavState('splashPage');

// LOGIC SEARCH MENU
function searchMenu() {
  // Ambil teks yang diketik user, ubah ke huruf kecil semua biar gampang dicocokin
  var input = document.getElementById('searchInput').value.toLowerCase();
  
  // Ambil semua elemen menu yang ada di grid
  var menuItems = document.querySelectorAll('.menu-item');

  // Looping buat ngecek satu-satu
  menuItems.forEach(function(item) {
    // Ambil nama menu dari tag <h4> di dalem masing-masing item
    var title = item.querySelector('h4').innerText.toLowerCase();
    
    // Kalo nama menunya ngandung huruf/kata yang diketik, tampilin. Kalo ngga, sembunyiin.
    if (title.includes(input)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// --- LOGIC SIMPAN ALAMAT ---
function saveAddress() {
  var jalan = document.getElementById('inputJalan').value;
  var kecamatan = document.getElementById('inputKecamatan').value;
  var patokan = document.getElementById('inputPatokan').value;

  // Validasi simpel: Kalo kosong, suruh isi dulu
  if (jalan.trim() === '' || kecamatan.trim() === '') {
    alert('Jalan sama Kecamatannya wajib diisi ya, Bro!');
    return;
  }

  showLoading(); // Munculin animasi loading lu

  // Proses nyimpen (simulasi)
  setTimeout(function() {
    hideLoading();
    
    // Gabungin teksnya biar cakep (Misal: Jl Sudirman, Menteng (Pagar Hitam))
    currentAddress = jalan + ", " + kecamatan;
    if (patokan.trim() !== '') {
      currentAddress += " (" + patokan + ")";
    }
    
    // 1. Update teks alamat di Topbar Halaman Home
    var homeTopbar = document.querySelector('#homePage .topbar-inner');
    if(homeTopbar) {
      homeTopbar.innerHTML = "📍 " + currentAddress;
    }

    // 2. Update teks alamat di Halaman Status Pesanan
    var statusAddrEl = document.getElementById('statusAddress');
    if(statusAddrEl) {
      statusAddrEl.innerText = currentAddress;
    }

    alert('Mantap! Alamat berhasil diupdate.');
    
    // Kosongin formnya lagi biar bersih
    document.getElementById('inputJalan').value = '';
    document.getElementById('inputKecamatan').value = '';
    document.getElementById('inputKota').value = '';
    document.getElementById('inputPatokan').value = '';
    
    // Balik ke home
    goPage('homePage');
  }, 1000);
}