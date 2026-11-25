document.addEventListener("DOMContentLoaded", () => {

    const inputCari = document.getElementById("cari");
    const daftarBand = document.getElementById("daftar");
    const totalEl = document.getElementById("total");

    if (inputCari && daftarBand) {
        const semuaBand = Array.from(daftarBand.querySelectorAll(".band-item, .kartu-band")).map((el) => {
            const namaBand = el.querySelector("h3")?.textContent.trim() || "";
            const genreBand = el.querySelector("p")?.textContent.trim() || "";
            return { nama: namaBand, genre: genreBand };
        });

        function renderBand(list) {
            daftarBand.innerHTML = "";

            if (totalEl) {
                totalEl.textContent = String(list.length);
            }

            if (list.length === 0) {
                const kosong = document.createElement("p");
                kosong.className = "band-kosong";
                kosong.textContent = "Band atau genre yang dicari tidak ditemukan.";
                daftarBand.appendChild(kosong);
                return;
            }

            list.forEach((item) => {
                const card = document.createElement("div");
                card.className = "band-item";

                const h3 = document.createElement("h3");
                h3.textContent = item.nama;

                const p = document.createElement("p");
                p.textContent = item.genre;

                card.append(h3, p);
                daftarBand.appendChild(card);
            });
        }

        inputCari.addEventListener("input", () => {
            const kataKunci = inputCari.value.trim().toLowerCase();
            if (!kataKunci) {
                renderBand(semuaBand);
                return;
            }

            const hasilFilter = semuaBand.filter(
                (b) =>
                    b.nama.toLowerCase().includes(kataKunci) ||
                    b.genre.toLowerCase().includes(kataKunci)
            );
            renderBand(hasilFilter);
        });
    }

    // 2. Validasi wajib isi & tampilkan hasil langsung di bawah form
    const formSection = document.querySelector(".form-section");
    const form = formSection ? formSection.querySelector("form") : null;
    if (!form) return;

    const namaInput = form.querySelector("[name='nama']");
    const emailInput = form.querySelector("[name='email']");
    const bandSelect = form.querySelector("[name='band']");
    const pesanTextarea = form.querySelector("[name='pesan']");
    const submitBtn = form.querySelector("button[type='submit']");

    let hasilContainer = document.getElementById("hasil-masukan");
    if (!hasilContainer) {
        hasilContainer = document.createElement("div");
        hasilContainer.id = "hasil-masukan";
        hasilContainer.className = "hasil-masukan";
        formSection.appendChild(hasilContainer);
    }

    const statusPesan = document.createElement("p");
    statusPesan.className = "status-form";
    statusPesan.setAttribute("role", "status");
    statusPesan.style.display = "none";
    form.insertBefore(statusPesan, submitBtn);

    function setInvalid(field, isInvalid) {
        if (!field) return;
        field.classList.toggle("input-error", isInvalid);
        field.setAttribute("aria-invalid", isInvalid ? "true" : "false");
    }

    [namaInput, emailInput, bandSelect, pesanTextarea].forEach((el) => {
        el?.addEventListener("input", () => {
            setInvalid(el, false);
            if (statusPesan.style.display === "block") {
                statusPesan.style.display = "none";
            }
        });
        el?.addEventListener("change", () => {
            setInvalid(el, false);
        });
    });

    function tampilkanStatus(teks, tipe = "error") {
        statusPesan.textContent = teks;
        statusPesan.className = `status-form status-${tipe}`;
        statusPesan.style.display = "block";
    }

    function buatKartuHasil(data) {
        const kartu = document.createElement("article");
        kartu.className = "kartu-masukan";

        const header = document.createElement("div");
        header.className = "kartu-masukan-header";

        const namaEl = document.createElement("h3");
        namaEl.textContent = data.nama;

        const bandEl = document.createElement("span");
        bandEl.className = "badge-band";
        bandEl.textContent = data.band;

        header.append(namaEl, bandEl);

        const emailEl = document.createElement("p");
        emailEl.className = "email-pengunjung";
        emailEl.textContent = data.email;

        const pesanEl = document.createElement("p");
        pesanEl.className = "isi-pesan";
        pesanEl.textContent = data.pesan;

        const waktuEl = document.createElement("p");
        waktuEl.className = "waktu-masukan";
        waktuEl.textContent = data.waktu;

        kartu.append(header, emailEl, pesanEl, waktuEl);
        return kartu;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        [namaInput, emailInput, bandSelect, pesanTextarea].forEach((el) => setInvalid(el, false));

        const nama = namaInput?.value.trim() || "";
        const email = emailInput?.value.trim() || "";
        const band = bandSelect?.value.trim() || "";
        const pesan = pesanTextarea?.value.trim() || "";

        if (!nama) {
            setInvalid(namaInput, true);
            tampilkanStatus("Kolom Nama wajib diisi.", "error");
            namaInput.focus();
            return;
        }

        if (!email) {
            setInvalid(emailInput, true);
            tampilkanStatus("Kolom Email wajib diisi.", "error");
            emailInput.focus();
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            setInvalid(emailInput, true);
            tampilkanStatus("Format email tidak valid (contoh: nama@email.com).", "error");
            emailInput.focus();
            return;
        }

        if (!band) {
            setInvalid(bandSelect, true);
            tampilkanStatus("Band Favorit wajib dipilih.", "error");
            bandSelect.focus();
            return;
        }

        if (!pesan) {
            setInvalid(pesanTextarea, true);
            tampilkanStatus("Kolom Pesan dan Kesan wajib diisi.", "error");
            pesanTextarea.focus();
            return;
        }

        if (!hasilContainer.querySelector("h3.judul-hasil")) {
            const judulHasil = document.createElement("h3");
            judulHasil.className = "judul-hasil";
            judulHasil.textContent = "Hasil Masukan";
            hasilContainer.prepend(judulHasil);
        }

        const kartuBaru = buatKartuHasil({
            nama,
            email,
            band,
            pesan,
            waktu: new Date().toLocaleString("id-ID")
        });

        const judulEl = hasilContainer.querySelector("h3.judul-hasil");
        judulEl.insertAdjacentElement("afterend", kartuBaru);

        form.reset();
        tampilkanStatus("Masukan berhasil dikirim.", "sukses");
        kartuBaru.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
});