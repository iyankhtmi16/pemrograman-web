document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".schedule-card");

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const sesi = btn.dataset.sesi;

            buttons.forEach((b) => b.classList.remove("aktif"));
            btn.classList.add("aktif");

            cards.forEach((card) => {
                if (sesi === "Semua" || card.dataset.sesi === sesi) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });


    const STORAGE_KEY = "hasilPendaftaranSuaraIndependen";
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    const form = document.getElementById("formPendaftaran");
    if (form) {
        const namaInput = form.querySelector("[name='nama']");
        const kontakInput = form.querySelector("[name='kontak']");
        const kategoriSelect = form.querySelector("[name='kategori']");
        const sesiSelect = form.querySelector("[name='sesi']");
        const identitasInput = form.querySelector("[name='identitas']");
        const catatanTextarea = form.querySelector("[name='catatan']");

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const nama = namaInput?.value.trim() || "";
            const kontak = kontakInput?.value.trim() || "";
            const kategori = kategoriSelect?.value.trim() || "";
            const sesi = sesiSelect?.value.trim() || "";
            const fileIdentitas = identitasInput?.files?.[0] || null;
            const catatan = catatanTextarea?.value.trim() || "";

            if (!nama) {
                alert("Nama lengkap wajib diisi.");
                namaInput?.focus();
                return;
            }

            if (!kontak) {
                alert("Email atau nomor WhatsApp wajib diisi.");
                kontakInput?.focus();
                return;
            }

            if (!kategori) {
                alert("Silakan pilih jenis partisipasi terlebih dahulu.");
                kategoriSelect?.focus();
                return;
            }

            if (!sesi) {
                alert("Silakan pilih sesi kehadiran terlebih dahulu.");
                sesiSelect?.focus();
                return;
            }

            if (!fileIdentitas) {
                alert("Silakan lampirkan KTM (internal) atau KTP (luar) terlebih dahulu.");
                identitasInput?.focus();
                return;
            }

            if (fileIdentitas.size > MAX_SIZE_BYTES) {
                alert("Ukuran file maksimal 5 MB.");
                identitasInput?.focus();
                return;
            }

            if (!catatan) {
                alert("Catatan atau kebutuhan tambahan wajib diisi.");
                catatanTextarea?.focus();
                return;
            }

            const infoIdentitas = `${fileIdentitas.name} (${(fileIdentitas.size / 1024).toFixed(1)} KB)`;
            const isImage = fileIdentitas.type.startsWith("image/");

            const simpanDanPindah = (previewUrl = "") => {
                try {
                    sessionStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify({
                            nama,
                            kontak,
                            kategori,
                            sesi,
                            identitas: infoIdentitas,
                            previewUrl,
                            catatan
                        })
                    );
                } catch (err) {
                    console.warn("Gagal menyimpan data pendaftaran ke sessionStorage.", err);
                }

                window.location.href = "formulir(hasil).html";
            };

            if (isImage) {
                const reader = new FileReader();
                reader.onload = () => simpanDanPindah(String(reader.result || ""));
                reader.onerror = () => simpanDanPindah("");
                reader.readAsDataURL(fileIdentitas);
            } else {
                simpanDanPindah("");
            }
        });
    }


    const hasilContainer = document.getElementById("hasil-pendaftaran");
    if (hasilContainer) {
        let data = null;
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            data = raw ? JSON.parse(raw) : null;
        } catch {
            data = null;
        }

        hasilContainer.innerHTML = "";

        if (!data) {
            const kosong = document.createElement("p");
            kosong.className = "hasil-kosong-teks";
            kosong.textContent = "Belum ada data pendaftaran yang dikirim.";
            hasilContainer.appendChild(kosong);
            return;
        }

        const previewHtml = data.previewUrl
            ? `<img src="${data.previewUrl}" alt="Lampiran Identitas ${data.identitas || ""}" class="preview-identitas-img">`
            : "";

        const kartu = document.createElement("article");
        kartu.className = "kartu-hasil aktif-daftar";
        kartu.style.display = "flex";
        kartu.innerHTML = `
            <div class="poin-item">
                <span class="poin-label">1. Peserta</span>
                <strong>${data.nama} (${data.kontak})</strong>
            </div>
            <div class="poin-item">
                <span class="poin-label">2. Partisipasi & Sesi</span>
                <span class="badge-daftar">${data.kategori} • ${data.sesi}</span>
            </div>
            <div class="poin-item">
                <span class="poin-label">3. Catatan & Lampiran Identitas</span>
                <p class="isi-catatan-daftar">${data.catatan}</p>
                <p class="isi-catatan-daftar" style="margin-top: 8px;"><strong>Lampiran:</strong> ${data.identitas || "-"}</p>
                ${previewHtml}
            </div>
        `;

        hasilContainer.appendChild(kartu);
    }
});