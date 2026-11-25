document.addEventListener("DOMContentLoaded", () => {
    const infoEl = document.getElementById("info");
    const daftarSesiEl = document.getElementById("daftarSesi");
    const itemsJadwal = document.querySelectorAll(".daftar-jadwal .item-jadwal");

    if (itemsJadwal.length > 0) {
        const daftarNamaSesi = Array.from(itemsJadwal).map((item) => {
            const waktu = item.querySelector(".waktu")?.textContent.trim() || "";
            const judul = item.querySelector(".detail-jadwal h3")?.textContent.trim() || "";
            return `${judul} (${waktu})`;
        });

        if (infoEl) {
            infoEl.textContent = `Total ${itemsJadwal.length} sesi jadwal panggung tersedia.`;
        }

        if (daftarSesiEl) {
            daftarSesiEl.textContent = `Sesi: ${daftarNamaSesi.join(" • ")}`;
        }
    }

  
    const form = document.querySelector(".form-section form");
    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const nama = form.querySelector('[name="nama"]')?.value.trim() || "-";
            const penampilan = form.querySelector('[name="penampilan"]')?.value.trim() || "-";
            const alasan = form.querySelector('[name="alasan"]')?.value.trim() || "-";
            const inputFile = form.querySelector('input[type="file"]');
            const file = inputFile?.files?.[0] || null;

            const simpanDanBuka = (dataUrl = "", fileName = "", fileType = "", fileSize = 0) => {
                const kodeTiket = "SI-" + Math.floor(100000 + Math.random() * 900000);
                const dataTiket = {
                    kodeTiket,
                    nama,
                    penampilan,
                    alasan,
                    fileName,
                    fileType,
                    fileSize,
                    dataUrl,
                    waktuSubmit: new Date().toLocaleString("id-ID")
                };

                sessionStorage.setItem("dataTiketSuaraIndependen", JSON.stringify(dataTiket));
                window.location.href = "hasil.html";
            };

            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    simpanDanBuka(
                        typeof reader.result === "string" ? reader.result : "",
                        file.name,
                        file.type,
                        file.size
                    );
                };
                reader.onerror = () => {
                    simpanDanBuka("", file.name, file.type, file.size);
                };
                reader.readAsDataURL(file);
            } else {
                simpanDanBuka();
            }
        });
    }

    const tiketContainer = document.getElementById("tampilan-tiket");
    if (tiketContainer) {
        const raw = sessionStorage.getItem("dataTiketSuaraIndependen");

        if (!raw) {
            tiketContainer.innerHTML = `
                <h2>Data Tiket Tidak Ditemukan</h2>
                <p class="info-event">Silakan isi formulir pilihan penampilan terlebih dahulu.</p>
                <div class="tiket-aksi">
                    <a href="indexR.html#form-pilihan" class="btn-cetak">Kembali ke Formulir</a>
                </div>
            `;
            return;
        }

        const data = JSON.parse(raw);

        function formatUkuran(bytes) {
            if (!bytes) return "";
            if (bytes < 1024) return `${bytes} B`;
            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
            return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        }

        let lampiranHTML = `<p><strong>File Lampiran:</strong> Tidak ada file dipilih</p>`;
        if (data.fileName) {
            const ukuranText = data.fileSize ? ` (${formatUkuran(data.fileSize)})` : "";
            lampiranHTML = `<p><strong>File Lampiran:</strong> ${data.fileName}${ukuranText}</p>`;

            if (data.dataUrl && data.fileType?.startsWith("image/")) {
                lampiranHTML += `
                    <div class="preview-file">
                        <img src="${data.dataUrl}" alt="Lampiran ${data.fileName}">
                    </div>
                `;
            }
        }

        tiketContainer.innerHTML = `
            <div class="tiket-header">
                <span class="badge-tiket">E-PASS / TIKET PILIHAN</span>
                <span class="kode-tiket">${data.kodeTiket}</span>
            </div>
            <h2>${data.nama}</h2>
            <p class="info-event">Suara Independen • 15 Desember 2026 • Open Air Stage, UIN Mataram</p>
            <div class="tiket-detail">
                <p><strong>Penampilan Favorit:</strong> ${data.penampilan}</p>
                <p><strong>Alasan Memilih:</strong> ${data.alasan}</p>
                ${lampiranHTML}
                <p class="waktu-cetak"><strong>Waktu Pengisian:</strong> ${data.waktuSubmit}</p>
            </div>
            <div class="tiket-aksi">
                <a href="indexR.html#form-pilihan" class="btn-kembali">Isi Ulang / Kembali</a>
                <button type="button" onclick="window.print()" class="btn-cetak">Cetak Tiket</button>
            </div>
        `;
    }
});