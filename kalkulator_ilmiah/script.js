
const layar = document.getElementById("layar");
const daftarRiwayat = document.getElementById("daftar-riwayat");

let riwayat = [];

// Memasukkan angka atau operator ke layar
function masukkanNilai(nilai) {
    if (layar.value === "Error") {
        layar.value = "";
    }

    layar.value += nilai;
}

// Menghapus semua isi layar
function bersihkanLayar() {
    layar.value = "";
}

// Menghapus satu karakter terakhir
function hapusSatu() {
    layar.value = layar.value.slice(0, -1);
}

// Membuat daftar token dari ekspresi
function buatToken(teks) {
    const pola = /\s*(sin|cos|tan|sqrt|\d+(?:\.\d*)?|\.\d+|[()+\-*/])/gy;
    const token = [];
    let posisi = 0;

    teks = teks.trim();

    while (posisi < teks.length) {
        pola.lastIndex = posisi;
        const cocok = pola.exec(teks);

        if (!cocok) {
            throw new Error("Karakter tidak valid");
        }

        token.push(cocok[1]);
        posisi = pola.lastIndex;
    }

    return token;
}

// Membaca dan menghitung ekspresi matematika
function hitungEkspresi(teks) {
    const token = buatToken(teks);
    let posisi = 0;

    function lihat() {
        return token[posisi];
    }

    function ambil() {
        return token[posisi++];
    }

    // Penjumlahan dan pengurangan
    function ekspresi() {
        let hasil = perkalian();

        while (lihat() === "+" || lihat() === "-") {
            const operator = ambil();
            const angka = perkalian();

            if (operator === "+") {
                hasil += angka;
            } else {
                hasil -= angka;
            }
        }

        return hasil;
    }

    // Perkalian dan pembagian
    function perkalian() {
        let hasil = unary();

        while (lihat() === "*" || lihat() === "/") {
            const operator = ambil();
            const angka = unary();

            if (operator === "*") {
                hasil *= angka;
            } else {
                if (angka === 0) {
                    throw new Error("Tidak bisa dibagi nol");
                }

                hasil /= angka;
            }
        }

        return hasil;
    }

    // Bilangan positif dan negatif
    function unary() {
        if (lihat() === "+") {
            ambil();
            return unary();
        }

        if (lihat() === "-") {
            ambil();
            return -unary();
        }

        return utama();
    }

    // Angka, kurung, dan fungsi ilmiah
    function utama() {
        const nilai = lihat();

        // Menghitung isi tanda kurung
        if (nilai === "(") {
            ambil();

            const hasil = ekspresi();

            if (ambil() !== ")") {
                throw new Error("Kurung tidak lengkap");
            }

            return hasil;
        }

        // Menghitung fungsi ilmiah
        if (["sin", "cos", "tan", "sqrt"].includes(nilai)) {
            const fungsi = ambil();

            if (ambil() !== "(") {
                throw new Error("Format fungsi salah");
            }

            const angka = ekspresi();

            if (ambil() !== ")") {
                throw new Error("Kurung fungsi tidak lengkap");
            }

            if (fungsi === "sin") {
                return Math.sin(angka * Math.PI / 180);
            }

            if (fungsi === "cos") {
                return Math.cos(angka * Math.PI / 180);
            }

            if (fungsi === "tan") {
                const sudut = angka % 180;

                if (Math.abs(sudut) === 90) {
                    throw new Error("Tan tidak terdefinisi");
                }

                return Math.tan(angka * Math.PI / 180);
            }

            if (fungsi === "sqrt") {
                if (angka < 0) {
                    throw new Error("Akar bilangan negatif");
                }

                return Math.sqrt(angka);
            }
        }

        // Membaca angka
        if (
            nilai !== undefined &&
            (/^\d+(\.\d*)?$/.test(nilai) ||
             /^\.\d+$/.test(nilai))
        ) {
            ambil();
            return Number(nilai);
        }

        throw new Error("Ekspresi tidak valid");
    }

    const hasil = ekspresi();

    // Memastikan semua token sudah dibaca
    if (posisi !== token.length) {
        throw new Error("Ekspresi belum lengkap");
    }

    if (!Number.isFinite(hasil)) {
        throw new Error("Hasil tidak valid");
    }

    return Number(hasil.toFixed(5));
}

// Menampilkan dan menyimpan riwayat
function catatRiwayat(operasi, hasil) {
    riwayat.unshift(operasi + " = " + hasil);

    if (riwayat.length > 5) {
        riwayat.pop();
    }

    daftarRiwayat.innerHTML = "";

    riwayat.forEach(function(item) {
        const li = document.createElement("li");
        li.textContent = item;
        daftarRiwayat.appendChild(li);
    });
}

// Tombol sama dengan
function hitungHasil() {
    const operasi = layar.value.trim();

    if (operasi === "") {
        return;
    }

    try {
        const hasil = hitungEkspresi(operasi);

        layar.value = hasil;
        catatRiwayat(operasi, hasil);
    } catch (error) {
        console.error(error);
        layar.value = "Error";
    }
}

// Mengatur klik tombol kalkulator
document.querySelector(".buttons").addEventListener("click", function(event) {
    const tombol = event.target.closest("button");

    if (!tombol) {
        return;
    }

    if (tombol.dataset.value !== undefined) {
        masukkanNilai(tombol.dataset.value);
    }

    if (tombol.dataset.action === "clear") {
        bersihkanLayar();
    }

    if (tombol.dataset.action === "delete") {
        hapusSatu();
    }

    if (tombol.dataset.action === "calculate") {
        hitungHasil();
    }
});

// Mengatur penggunaan keyboard
document.addEventListener("keydown", function(event) {
    const tombol = event.key;

    if (/^[0-9+\-*/().]$/.test(tombol)) {
        masukkanNilai(tombol);
    } else if (tombol === "Enter" || tombol === "=") {
        event.preventDefault();
        hitungHasil();
    } else if (tombol === "Backspace") {
        hapusSatu();
    } else if (tombol === "Escape") {
        bersihkanLayar();
    }
});
