const taskForm = document.getElementById("taskForm");
const inputNama = document.getElementById("namaTugas");
const inputMataKuliah = document.getElementById("mataKuliah");
const inputKesulitan = document.getElementById("kesulitan");
const inputDeadline = document.getElementById("deadline");
const totalTugas = document.getElementById("totalTugas");
const tugasSelesai = document.getElementById("tugasSelesai");
const tugasBelumSelesai = document.getElementById("tugasBelumSelesai");
const listTugas = document.getElementById("listTugas");
const listPrioritas = document.getElementById("listPrioritas");
const confirmModal = document.getElementById("confirmModal");
const batalHapus = document.getElementById("batalHapus");
const konfirmasiHapus = document.getElementById("konfirmasiHapus");
const pesanHapus = document.getElementById("pesanHapus");
const namaTugasKonfirmasi = document.getElementById("namaTugasKonfirmasi");
const inputSearch = document.getElementById("searchTugas");
const filterKesulitan = document.getElementById("filterKesulitan");

let indexTugasDihapus = null;
let daftarTugas = [];

inputSearch.addEventListener("input", function() {
    tampilkanTugas();
});

filterKesulitan.addEventListener("change", function() {
    tampilkanTugas();
});

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const nama = inputNama.value;
    const mataKuliah = inputMataKuliah.value;
    const kesulitan = inputKesulitan.value;
    const deadline = inputDeadline.value;
    const tugasBaru = {
        nama: nama,
        mataKuliah: mataKuliah,
        kesulitan: kesulitan,
        deadline: deadline,
        selesai: false
    };

    daftarTugas.push(tugasBaru);
    simpanData();

    taskForm.reset();
    tampilkanTugas();
    updateDashboard();
    tampilkanPrioritas();
});

function tampilkanTugas() {
    listTugas.innerHTML = "";
    const kataKunci = inputSearch.value.toLowerCase();
    const pilihanKesulitan = filterKesulitan.value;
    for (let i = 0; i < daftarTugas.length; i++) {
        const tugas = daftarTugas[i];
        const tanggal = new Date(tugas.deadline + "T00:00:00");
        const deadlineFormat = new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(tanggal);
        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0);

        const terlambat = tanggal < hariIni && tugas.selesai === false;
        const selisihHari = Math.ceil(
            (tanggal - hariIni) / (1000 * 60 * 60 * 24)
        );

        const deadlineDekat = selisihHari >= 0 &&
                              selisihHari <= 3 &&
                              tugas.selesai === false;

        if (
            (
                !tugas.nama.toLowerCase().includes(kataKunci) &&
                !tugas.mataKuliah.toLowerCase().includes(kataKunci)
            ) ||
            (
                pilihanKesulitan !== "semua" &&
                tugas.kesulitan !== pilihanKesulitan
            )
) {
    continue;
}

         const kartuTugas = document.createElement("div");
         kartuTugas.classList.add("task-card");

        kartuTugas.innerHTML = `
            <h3>${tugas.nama}</h3>
            <p>Mata Kuliah: ${tugas.mataKuliah}</p>
            <p>Kesulitan: ${tugas.kesulitan}</p>
            <p>Deadline: ${deadlineFormat}</p>
             
            ${terlambat
                ? '<p class="status-terlambat">Terlambat!</p>'
                : ''
            }
            ${deadlineDekat
                ? '<p class="status-dekat">Segera Dikerjakan!</p>'
                : ''
            }

            ${tugas.selesai
                ? '<button class="btn-sudah-selesai" disabled>Sudah Selesai</button>'
                : `<button class="btn-selesai" onclick="tandaiSelesai(${i})">Tandai Selesai</button>`
            }
            
            <button class="btn-hapus" onclick="hapusTugas(${i})">Hapus Tugas</button>
        `;
        listTugas.appendChild(kartuTugas);
    }
}

function tandaiSelesai(index) {
    daftarTugas[index].selesai = true;
    console.log(daftarTugas[index]);

    simpanData();

    tampilkanTugas();
    updateDashboard();
    tampilkanPrioritas();
}

function updateDashboard() {
    let jumlahSelesai = 0;

    for (let i = 0; i < daftarTugas.length; i++) {
        if (daftarTugas[i].selesai === true) {
            jumlahSelesai++;
        }
    }

    totalTugas.textContent = daftarTugas.length;
    tugasSelesai.textContent = jumlahSelesai;
    tugasBelumSelesai.textContent = daftarTugas.length - jumlahSelesai;
}

function tampilkanPrioritas() {
    listPrioritas.innerHTML = "";

    for (let i = 0; i < daftarTugas.length; i++) {
        const tugas = daftarTugas[i];

        let skor = 0;

        if (tugas.kesulitan === "mudah") {
            skor += 1;
        } else if (tugas.kesulitan === "sedang") {
            skor += 2;
        } else if (tugas.kesulitan === "sulit") {
            skor += 3;
        }

        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0);

        const tanggalDeadline = new Date(tugas.deadline + "T00:00:00");

        const selisihWaktu = tanggalDeadline - hariIni;
        const selisihHari = Math.ceil(selisihWaktu / (1000 * 60 * 60 * 24));

        if (selisihHari <= 3) {
            skor += 3;
        } else if (selisihHari <= 7) {
            skor += 2;
        } else if (selisihHari <= 14) {
            skor += 1;
        }

        tugas.skor = skor;
    }

        let tugasPrioritas = [];

        for (let i = 0; i < daftarTugas.length; i++) {
            if (daftarTugas[i].selesai === false) {
            tugasPrioritas.push(daftarTugas[i]);
            }
        }

        for (let i = 0; i < tugasPrioritas.length; i++) {
            let indeksTertinggi = i;
            for (let j = i + 1; j < tugasPrioritas.length; j++) {
                if (tugasPrioritas[j].skor > tugasPrioritas[indeksTertinggi].skor) {
                    indeksTertinggi = j;
                }
            } 
            let sementara = tugasPrioritas[i];
            tugasPrioritas[i] = tugasPrioritas[indeksTertinggi];
            tugasPrioritas[indeksTertinggi] = sementara;
        }
        listPrioritas.innerHTML = "";

        if (tugasPrioritas.length === 0) {
            listPrioritas.innerHTML = "<p>Belum ada tugas yang perlu diprioritaskan.</p>";
            return;
        }

            for (let i = 0; i < tugasPrioritas.length; i++) {
            const tugas = tugasPrioritas[i];
            const kartuPrioritas = document.createElement("div");
            kartuPrioritas.classList.add("task-card");

            kartuPrioritas.innerHTML = `
                <h3>${tugas.nama}</h3>
                <p>Mata Kuliah: ${tugas.mataKuliah}</p>
                <p>Kesulitan: ${tugas.kesulitan}</p>
                <p>Deadline: ${tugas.deadline}</p>
                <p>Skor Prioritas: ${tugas.skor}</p>
            `;
            listPrioritas.appendChild(kartuPrioritas);
    }

            if (listTugas.children.length === 0) {
            listTugas.innerHTML = "<p>Tugas tidak ditemukan.</p>";
        }
            
}

function simpanData() {
    localStorage.setItem("daftarTugas", JSON.stringify(daftarTugas));
}
function ambilData() {
    const dataTersimpan = localStorage.getItem("daftarTugas");

    if (dataTersimpan !== null) {
        daftarTugas = JSON.parse(dataTersimpan);
    }
}

function hapusTugas(index) {
    indexTugasDihapus = index;

    namaTugasKonfirmasi.textContent = daftarTugas[index].nama;

    confirmModal.classList.add("show");
}

batalHapus.addEventListener("click", function() {
    confirmModal.classList.remove("show");

    indexTugasDihapus = null;
});

konfirmasiHapus.addEventListener("click", function() {
    if (indexTugasDihapus !== null) {
        daftarTugas.splice(indexTugasDihapus, 1);

        simpanData();
        tampilkanTugas();
        updateDashboard();
        tampilkanPrioritas();
    }

    confirmModal.classList.remove("show");
    indexTugasDihapus = null;
});

confirmModal.addEventListener("click", function(event) {
    if (event.target === confirmModal) {
        confirmModal.style.display = "none";
        indexTugasDihapus = null;
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && confirmModal.classList.contains("show")) {
        confirmModal.classList.remove("show");
        indexTugasDihapus = null;
    }
});

ambilData();
tampilkanTugas();
updateDashboard();
tampilkanPrioritas();


