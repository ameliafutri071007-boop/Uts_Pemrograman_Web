// Proses Login
const formLogin = document.getElementById("formLogin");
if (formLogin) {

formLogin.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const pengguna = dataPengguna.find(function(user) {
        return user.email === email && user.password === password;
    });

    if (pengguna) {
        localStorage.setItem("penggunaLogin", JSON.stringify(pengguna));
        window.location.href = "dashboard.html";
    } else {
        alert("email/password yang anda masukkan salah");
    }
});
}

// Membuka Modal
function bukaModal(id) {
    document.getElementById(id).style.display = "flex";
}

// Menutup Modal
function tutupModal(id) {
    document.getElementById(id).style.display = "none";
}

// GREETING DASHBOARD
const greeting = document.getElementById("greeting");
const namaPengguna = document.getElementById("namaPengguna");

if (greeting && namaPengguna) {
    const pengguna = JSON.parse(localStorage.getItem("penggunaLogin"));

    if (pengguna) {
        namaPengguna.textContent = "Halo, " + pengguna.nama;
    }

    const jam = new Date().getHours();

    if (jam >= 5 && jam < 11) {
        greeting.textContent = "Selamat Pagi!";
    } else if (jam >= 11 && jam < 15) {
        greeting.textContent = "Selamat Siang!";
    } else if (jam >= 15 && jam < 18) {
        greeting.textContent = "Selamat Sore!";
    } else {
        greeting.textContent = "Selamat Malam!";
    }
}

// LOGOUT
function logout() {
    localStorage.removeItem("penggunaLogin");
    window.location.href = "login.html";
}

// MENAMPILKAN DATA KATALOG BUKU
const tabelBuku = document.getElementById("tabelBuku");

if (tabelBuku) {

    function tampilkanBuku() {
        tabelBuku.innerHTML = "";

        dataKatalogBuku.forEach(function(buku) {
            const baris = document.createElement("tr");

            baris.innerHTML = `
                <td>${buku.kodeBarang}</td>
                <td><img src="${buku.cover}" alt="${buku.namaBarang}"></td>
                <td>${buku.namaBarang}</td>
                <td>${buku.jenisBarang}</td>
                <td>${buku.edisi}</td>
                <td>${buku.stok}</td>
                <td>${buku.harga}</td>
            `;

            tabelBuku.appendChild(baris);
        });
    }

    tampilkanBuku();

    // MENAMBAHKAN BUKU BARU
    const formStok = document.getElementById("formStok");

    formStok.addEventListener("submit", function(event) {
        event.preventDefault();

        const bukuBaru = {
            kodeBarang: document.getElementById("kodeBarang").value,
            namaBarang: document.getElementById("namaBarang").value,
            jenisBarang: document.getElementById("jenisBarang").value,
            edisi: document.getElementById("edisi").value,
            stok: Number(document.getElementById("jumlahStok").value),
            harga: document.getElementById("harga").value,
            cover: "img/pengantar_komunikasi.jpg"
        };

        dataKatalogBuku.push(bukuBaru);

        tampilkanBuku();

        alert("Buku berhasil ditambahkan!");

        formStok.reset();
    });
}

// HALAMAN CHECKOUT

const formCheckout = document.getElementById("formCheckout");
const pilihBuku = document.getElementById("pilihBuku");
const jumlahBuku = document.getElementById("jumlahBuku");
const totalHarga = document.getElementById("totalHarga");

if (formCheckout) {

    // Menampilkan pilihan buku
    dataKatalogBuku.forEach(function(buku) {
        const option = document.createElement("option");

        option.value = buku.kodeBarang;
        option.textContent = buku.namaBarang + " - " + buku.harga;

        pilihBuku.appendChild(option);
    });

    // Menghitung total harga
    function hitungTotal() {
        const buku = dataKatalogBuku.find(function(item) {
            return item.kodeBarang === pilihBuku.value;
        });

        if (buku) {
            const harga = Number(buku.harga.replace(/\D/g, ""));
            const jumlah = Number(jumlahBuku.value);

            totalHarga.textContent = "Total: " +
                (harga * jumlah).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0
                });
        } else {
            totalHarga.textContent = "Total: Rp 0";
        }
    }

    pilihBuku.addEventListener("change", hitungTotal);
    jumlahBuku.addEventListener("input", hitungTotal);

    // Mengisi nama dan email pengguna yang login
    const penggunaAktif = JSON.parse(
        localStorage.getItem("penggunaLogin")
    );

    if (penggunaAktif) {
        document.getElementById("namaPemesan").value = penggunaAktif.nama;
        document.getElementById("emailPemesan").value = penggunaAktif.email;
    }

    // Menyimpan pesanan
    formCheckout.addEventListener("submit", function(event) {
        event.preventDefault();

        const buku = dataKatalogBuku.find(function(item) {
            return item.kodeBarang === pilihBuku.value;
        });

        const jumlah = Number(jumlahBuku.value);

        if (!buku || jumlah < 1) {
            alert("Silakan pilih buku dan jumlah yang benar!");
            return;
        }

        if (jumlah > buku.stok) {
            alert("Stok buku tidak mencukupi!");
            return;
        }

        const harga = Number(buku.harga.replace(/\D/g, ""));
        const total = harga * jumlah;

        const pesanan = {
            nomor: "ORD" + Date.now(),
            nama: document.getElementById("namaPemesan").value,
            email: document.getElementById("emailPemesan").value,
            alamat: document.getElementById("alamatPemesan").value,
            buku: buku.namaBarang,
            jumlah: jumlah,
            total: total,
            pembayaran: document.getElementById("metodePembayaran").value
        };

        let riwayat = JSON.parse(
            localStorage.getItem("riwayatPemesanan")
        ) || [];

        riwayat.push(pesanan);

        localStorage.setItem(
            "riwayatPemesanan",
            JSON.stringify(riwayat)
        );

        buku.stok -= jumlah;

        alert("Pesanan berhasil dibuat!");

        formCheckout.reset();
        hitungTotal();
        tampilkanRiwayat();
    });

    // Menampilkan laporan dan riwayat transaksi
    function tampilkanRiwayat() {
        const riwayat = JSON.parse(
            localStorage.getItem("riwayatPemesanan")
        ) || [];

        const hasil = document.getElementById("hasilPemesanan");
        const history = document.getElementById("riwayatTransaksi");

        hasil.innerHTML = "";
        history.innerHTML = "";

        if (riwayat.length === 0) {
            hasil.textContent = "Belum ada pesanan.";
            history.textContent = "Belum ada transaksi.";
            return;
        }

        riwayat.forEach(function(pesanan) {
            const detail = document.createElement("div");

            detail.textContent =
                pesanan.nomor + " | " +
                pesanan.nama + " | " +
                pesanan.buku + " | " +
                pesanan.jumlah + " buku | Total: Rp " +
                pesanan.total.toLocaleString("id-ID") +
                " | " + pesanan.pembayaran;

            hasil.appendChild(detail.cloneNode(true));
            history.appendChild(detail);
        });
    }

    tampilkanRiwayat();
}

// HALAMAN TRACKING PENGIRIMAN

const formTracking = document.getElementById("formTracking");

if (formTracking) {

    formTracking.addEventListener("submit", function(event) {
        event.preventDefault();

        const nomorDO = document.getElementById("nomorDO").value;
        const hasilTracking = document.getElementById("hasilTracking");

        const data = dataTracking[nomorDO];

        if (data) {

            hasilTracking.innerHTML = `
                <h2>Informasi Pengiriman</h2>

                <p><strong>Nomor DO:</strong> ${data.nomorDO}</p>

                <div class="tracking-info">
                    <div>
                        <strong>Nama Pemesan</strong>
                        ${data.nama}
                    </div>

                    <div>
                        <strong>Status Pengiriman</strong>
                        <span class="status-pengiriman">${data.status}</span>
                    </div>

                    <div>
                        <strong>Ekspedisi</strong>
                        ${data.ekspedisi}
                    </div>

                    <div>
                        <strong>Tanggal Kirim</strong>
                        ${data.tanggalKirim}
                    </div>

                    <div>
                        <strong>Jenis Paket</strong>
                        ${data.paket}
                    </div>

                    <div>
                        <strong>Total Pembayaran</strong>
                        ${data.total}
                    </div>
                </div>

                <h2>Riwayat Perjalanan Paket</h2>

                <div class="perjalanan">
                    ${data.perjalanan.map(function(item) {
                        return `
                            <div class="perjalanan-item">
                                <strong>${item.waktu}</strong>
                                <p>${item.keterangan}</p>
                            </div>
                        `;
                    }).join("")}
                </div>
            `;

        } else {

            hasilTracking.innerHTML = `
                <p style="color: red; font-weight: bold;">
                    Nomor Delivery Order tidak ditemukan!
                </p>
            `;

        }
    });

}