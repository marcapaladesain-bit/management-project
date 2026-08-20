let orders =
    JSON.parse(localStorage.getItem("marcapala_orders")) || [];

let selectedOrderId = null;

// ========================================
// LOGO APLIKASI
// ========================================

function openLogoPicker() {
    const input = document.getElementById("logoPicker");
    if (input) input.click();
}

function handleLogoUpload(event) {
    const file = event.target?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
        alert("Silakan pilih file gambar (PNG, JPG, WEBP, atau SVG).");
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran logo maksimal 2 MB.");
        event.target.value = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        localStorage.setItem("marcapala_logo", dataUrl);
        applySavedLogo();
        event.target.value = "";
    };
    reader.readAsDataURL(file);
}

function applySavedLogo() {
    const image = document.getElementById("brandLogoImage");
    const fallback = document.getElementById("brandLogoFallback");
    if (!image || !fallback) return;
    const savedLogo = localStorage.getItem("marcapala_logo");
    if (savedLogo) {
        image.src = savedLogo;
        image.classList.remove("hidden");
        fallback.classList.add("hidden");
    } else {
        image.removeAttribute("src");
        image.classList.add("hidden");
        fallback.classList.remove("hidden");
    }
}


// ========================================
// FORMAT RUPIAH
// ========================================

function rupiah(value) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);

}


// ========================================
// NAVIGASI
// ========================================

function showPage(page, button = null) {

    document
        .querySelectorAll(".page")
        .forEach(section => {
            section.classList.add("hidden");
        });


    const target =
        document.getElementById(page);


    if (target) {
        target.classList.remove("hidden");
        target.style.display = "block";
        if (page === "finance") {
            target.classList.add("finance-active");
        }
    }

    document.querySelectorAll(".finance-page").forEach(section => {
        if (section.id !== page) {
            section.classList.remove("finance-active");
            section.style.display = "";
        }
    });


    document
        .querySelectorAll(".menu")
        .forEach(menu => {
            menu.classList.remove("active");
        });


    if (button) {
        button.classList.add("active");
    }


    const titles = {

        dashboard: "Dashboard",
        orders: "Order",
        production: "Produksi",
        customers: "Pelanggan",
        finance: "Keuangan"

    };


    const pageTitle =
        document.getElementById("pageTitle");


    if (pageTitle) {

        pageTitle.innerText =
            titles[page] || "Dashboard";

    }


    renderAll();

}


// ========================================
// NOMOR ORDER
// ========================================

function generateOrderNumber() {

    const now = new Date();


    const year =
        now.getFullYear();


    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");


    const day =
        String(now.getDate())
            .padStart(2, "0");


    const number =
        String(orders.length + 1)
            .padStart(3, "0");


    return `ORD-${year}${month}${day}-${number}`;

}


// ========================================
// SIMPAN DATABASE
// ========================================

function saveOrders() {

    localStorage.setItem(
        "marcapala_orders",
        JSON.stringify(orders)
    );

}


// ========================================
// SIMPAN ORDER
// ========================================

const orderForm =
    document.getElementById("orderForm");


if (orderForm) {

    orderForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const customer =
                document
                    .getElementById("customerName")
                    .value.trim();


            const phone =
                document
                    .getElementById("customerPhone")
                    .value.trim();


            const product =
                document
                    .getElementById("productName")
                    .value.trim();


            const quantity =
                Number(
                    document
                        .getElementById("quantity")
                        .value
                );


            const price =
                Number(
                    document
                        .getElementById("totalPrice")
                        .value
                );


            const deposit =
                Number(
                    document
                        .getElementById("deposit")
                        .value
                );


            const deadline =
                document
                    .getElementById("deadline")
                    .value;


            const status =
                document
                    .getElementById("orderStatus")
                    .value;


            const notes =
                document
                    .getElementById("notes")
                    .value.trim();


            // -------------------------
            // V3 DATA DESAIN
            // -------------------------

            const designStatusElement =
                document.getElementById(
                    "designStatus"
                );


            const designerElement =
                document.getElementById(
                    "designer"
                );


            const productionPICElement =
                document.getElementById(
                    "productionPIC"
                );


            const productionNotesElement =
                document.getElementById(
                    "productionNotes"
                );


            const designFileElement =
                document.getElementById(
                    "designFile"
                );


            const designStatus =
                designStatusElement
                    ? designStatusElement.value
                    : "BELUM";


            const designer =
                designerElement
                    ? designerElement.value.trim()
                    : "";


            const productionPIC =
                productionPICElement
                    ? productionPICElement.value.trim()
                    : "";


            const productionNotes =
                productionNotesElement
                    ? productionNotesElement.value.trim()
                    : "";


            const designFile =
                designFileElement &&
                designFileElement.files.length > 0

                    ? designFileElement.files[0].name

                    : "";


            // -------------------------
            // VALIDASI
            // -------------------------

            if (!customer) {

                alert(
                    "Nama pelanggan wajib diisi."
                );

                return;

            }


            if (!product) {

                alert(
                    "Produk wajib diisi."
                );

                return;

            }


            if (deposit > price) {

                alert(
                    "DP tidak boleh lebih besar dari total harga."
                );

                return;

            }


            // -------------------------
            // BUAT ORDER
            // -------------------------

            const order = {

                id:
                    generateOrderNumber(),

                customer,

                phone,

                product,

                quantity,

                price,

                deposit,

                remaining:
                    price - deposit,

                deadline,

                status,

                notes,

                designStatus,

                designer,

                productionPIC,

                productionNotes,

                designFile,

                createdAt:
                    new Date().toISOString()

            };


            // -------------------------
            // SIMPAN
            // -------------------------

            orders.unshift(order);


            saveOrders();


            alert(
                `Order ${order.id} berhasil disimpan.`
            );


            // Reset form

            orderForm.reset();


            renderAll();


            showPage("dashboard");

        }
    );

}


// ========================================
// DASHBOARD
// ========================================

function renderDashboard() {

    const totalOrder =
        document.getElementById(
            "totalOrder"
        );


    const totalProduction =
        document.getElementById(
            "totalProduction"
        );


    const totalFinished =
        document.getElementById(
            "totalFinished"
        );


    const totalRevenue =
        document.getElementById(
            "totalRevenue"
        );


    if (totalOrder) {

        totalOrder.innerText =
            orders.length;

    }


    if (totalProduction) {

        totalProduction.innerText =
            orders.filter(
                order =>
                    order.status === "PRODUKSI"
            ).length;

    }


    if (totalFinished) {

        totalFinished.innerText =
            orders.filter(
                order =>
                    order.status === "SELESAI"
            ).length;

    }


    const revenue =
        orders.reduce(
            (total, order) =>
                total + Number(order.price || 0),
            0
        );


    if (totalRevenue) {

        totalRevenue.innerText =
            rupiah(revenue);

    }


    const table =
        document.getElementById(
            "orderTable"
        );


    if (!table) return;


    table.innerHTML = "";


    if (orders.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:35px;
                        color:#999
                    "
                >

                    Belum ada order.

                </td>

            </tr>

        `;

        return;

    }


    orders
        .slice(0, 10)
        .forEach(order => {

            table.innerHTML += `

                <tr>

                    <td>

                        <span
                            class="order-link"
                            onclick="openOrderDetail('${order.id}')"
                        >

                            ${order.id}

                        </span>

                    </td>

                    <td>
                        ${escapeHtml(
                            order.customer
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.product
                        )}
                    </td>

                    <td>
                        ${rupiah(
                            order.price
                        )}
                    </td>

                    <td>
                        ${statusBadge(
                            order.status
                        )}
                    </td>

                </tr>

            `;

        });

}


// ========================================
// SEMUA ORDER
// ========================================

// ========================================
// SEMUA ORDER
// ========================================

function renderOrders() {

    const table =
        document.getElementById(
            "allOrderTable"
        );


    if (!table) return;


    table.innerHTML = "";


    if (orders.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="
                        text-align:center;
                        padding:35px;
                        color:#999
                    "
                >

                    Belum ada order.

                </td>

            </tr>

        `;

        return;

    }


    orders.forEach(order => {

        table.innerHTML += `

            <tr>

                <!-- ORDER -->

                <td>

                    <span
                        class="order-link"
                        onclick="openOrderDetail('${order.id}')"
                    >

                        ${order.id}

                    </span>

                </td>


                <!-- PELANGGAN -->

                <td>

                    ${escapeHtml(
                        order.customer
                    )}

                </td>


                <!-- PRODUK -->

                <td>

                    ${escapeHtml(
                        order.product
                    )}

                </td>


                <!-- JUMLAH -->

                <td>

                    ${order.quantity || 0}

                </td>


                <!-- TOTAL -->

                <td>

                    ${rupiah(
                        order.price
                    )}

                </td>


                <!-- SISA -->

                <td>

                    ${rupiah(
                        order.remaining
                    )}

                </td>


                <!-- STATUS -->

                <td>

                    ${statusBadge(
                        order.status
                    )}

                </td>


                <!-- AKSI -->

                <td class="order-actions-cell">
                    <button type="button" class="order-action-btn payment" onclick="addOrderPayment('${order.id}')" title="Tambah pembayaran">💳 Bayar</button>
                    <button type="button" class="order-action-btn invoice" onclick="printOrderInvoice('${order.id}')" title="Cetak invoice">🧾 Invoice</button>
                    <button type="button" class="delete-order-btn" onclick="deleteOrder('${order.id}')">🗑️ Hapus</button>
                </td>

            </tr>

        `;

    });

}


// ========================================
// STATUS BADGE
// ========================================

function statusBadge(status) {

    if (!status) {

        status = "BARU";

    }


    return `

        <span
            class="status status-${String(status).toLowerCase()}"
        >

            ${status}

        </span>

    `;

}


// ========================================
// PRODUKSI / KANBAN
// ========================================

function renderProduction() {

    const mapping = {

        BARU:
            "kanbanBaru",

        DESAIN:
            "kanbanDesain",

        ACC:
            "kanbanAcc",

        PRODUKSI:
            "kanbanProduksi",

        QC:
            "kanbanQc",

        PACKING:
            "kanbanPacking",

        SELESAI:
            "kanbanSelesai"

    };


    const counts = {

        BARU:
            "countBaru",

        DESAIN:
            "countDesain",

        ACC:
            "countAcc",

        PRODUKSI:
            "countProduksi",

        QC:
            "countQc",

        PACKING:
            "countPacking",

        SELESAI:
            "countSelesai"

    };


    Object.values(mapping)
        .forEach(id => {

            const element =
                document.getElementById(id);


            if (element) {

                element.innerHTML = "";

            }

        });


    Object.values(counts)
        .forEach(id => {

            const element =
                document.getElementById(id);


            if (element) {

                element.innerText = "0";

            }

        });


    orders.forEach(order => {

        const container =
            document.getElementById(
                mapping[order.status]
            );


        if (!container) return;


        container.innerHTML += `

            <div class="kanban-card">

                <strong
                    class="order-link"
                    onclick="openOrderDetail('${order.id}')"
                >

                    ${order.id}

                </strong>

                <p>
                    ${escapeHtml(
                        order.customer
                    )}
                </p>

                <p>
                    ${escapeHtml(
                        order.product
                    )}

                    × ${order.quantity || 0}
                </p>

                <select
                    onchange="
                        changeStatus(
                            '${order.id}',
                            this.value
                        )
                    "
                >

                    ${statusOptions(
                        order.status
                    )}

                </select>

            </div>

        `;


        const countElement =
            document.getElementById(
                counts[order.status]
            );


        if (countElement) {

            countElement.innerText =
                Number(
                    countElement.innerText
                ) + 1;

        }

    });

}


// ========================================
// STATUS OPTIONS
// ========================================

function statusOptions(current) {

    const statuses = [

        "BARU",

        "DESAIN",

        "ACC",

        "PRODUKSI",

        "QC",

        "PACKING",

        "SELESAI"

    ];


    return statuses
        .map(status => `

            <option
                value="${status}"
                ${status === current
                    ? "selected"
                    : ""}
            >

                ${status}

            </option>

        `)
        .join("");

}


// ========================================
// UBAH STATUS
// ========================================

function changeStatus(
    id,
    status
) {

    const order =
        orders.find(
            order =>
                order.id === id
        );


    if (!order) return;


    order.status =
        status;


    saveOrders();


    renderAll();

}



// ========================================
// PEMBAYARAN / PELUNASAN ORDER
// ========================================

function todayInputDate() {
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
}

function openPaymentModal(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const total = Number(order.price || 0);
    const paid = Number(order.deposit || 0);
    const remaining = Math.max(0, Number(order.remaining ?? (total - paid)));
    if (remaining <= 0) {
        alert("Order ini sudah lunas.");
        return;
    }

    const modal = document.getElementById("paymentModal");
    const form = document.getElementById("paymentForm");
    if (!modal || !form) return;

    form.dataset.orderId = id;
    document.getElementById("paymentModalTitle").innerText = `Tambah Pembayaran ${id}`;
    document.getElementById("paymentModalInfo").innerText = `Pelanggan: ${order.customer || "-"}`;
    document.getElementById("paymentTotal").innerText = rupiah(total);
    document.getElementById("paymentPaid").innerText = rupiah(paid);
    document.getElementById("paymentRemaining").innerText = rupiah(remaining);
    document.getElementById("paymentAmount").value = remaining;
    document.getElementById("paymentAmount").max = remaining;
    document.getElementById("paymentDate").value = todayInputDate();
    document.getElementById("paymentNote").value = `Pembayaran ${remaining === total - paid ? "pelunasan" : "angsuran"} ${id}`;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => document.getElementById("paymentAmount")?.focus(), 50);
}

function closePaymentModal() {
    const modal = document.getElementById("paymentModal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
}

function submitOrderPayment(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const id = form.dataset.orderId;
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const total = Number(order.price || 0);
    const currentPaid = Number(order.deposit || 0);
    const remaining = Math.max(0, Number(order.remaining ?? (total - currentPaid)));
    const amount = Number(document.getElementById("paymentAmount").value || 0);
    const date = document.getElementById("paymentDate").value;
    const note = document.getElementById("paymentNote").value.trim();

    if (!amount || amount <= 0) {
        alert("Nominal pembayaran tidak valid.");
        return;
    }
    if (amount > remaining) {
        alert(`Pembayaran tidak boleh lebih dari sisa ${rupiah(remaining)}.`);
        return;
    }
    if (!date) {
        alert("Silakan pilih tanggal pembayaran.");
        document.getElementById("paymentDate")?.focus();
        return;
    }

    if (order.initialDeposit === undefined) {
        order.initialDeposit = currentPaid;
    }
    order.deposit = currentPaid + amount;
    order.remaining = Math.max(0, remaining - amount);
    order.paymentStatus = order.remaining === 0 ? "LUNAS" : "BELUM_LUNAS";

    saveOrders();

    const entries = getFinanceEntries();
    entries.unshift({
        id: "PAY-" + Date.now(),
        date,
        type: "income",
        category: order.remaining === 0 ? "Pelunasan" : "Pembayaran Order",
        reference: order.id,
        description: `${note || "Pembayaran order"} — ${order.customer || "Pelanggan"}`,
        amount,
        orderId: order.id,
        paymentType: order.remaining === 0 ? "pelunasan" : "angsuran",
        createdAt: new Date().toISOString()
    });
    saveFinanceEntries(entries);

    closePaymentModal();
    renderAll();
    if (selectedOrderId === id) openOrderDetail(id);

    alert(`Pembayaran ${rupiah(amount)} berhasil dicatat.\nSisa pembayaran: ${rupiah(order.remaining)}.`);
}

function addOrderPayment(id) {
    openPaymentModal(id);
}

function addOrderPaymentFromModal() {
    if (selectedOrderId) addOrderPayment(selectedOrderId);
}

// ========================================
// INVOICE ORDER
// ========================================

function printOrderInvoice(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const logo = localStorage.getItem("marcapala_logo") || "";
    const logoHtml = logo ? `<img src="${logo}" class="invoice-logo" alt="Logo Marcapala">` : `<div class="invoice-logo-fallback">M</div>`;
    const total = Number(order.price || 0);
    const deposit = Number(order.deposit || 0);
    const remaining = Math.max(0, Number(order.remaining ?? (total - deposit)));
    const status = remaining <= 0 ? "LUNAS" : "BELUM LUNAS";
    const created = order.createdAt ? formatInvoiceDate(order.createdAt) : "-";
    const deadline = order.deadline ? formatInvoiceDate(order.deadline) : "-";

    const win = window.open("", "_blank", "width=900,height=900");
    if (!win) {
        alert("Popup invoice diblokir browser. Izinkan popup untuk aplikasi ini lalu coba lagi.");
        return;
    }

    win.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Invoice ${escapeHtml(order.id)}</title>
    <style>
      *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#f3f4f6;color:#16181d}
      .invoice{width:800px;max-width:calc(100% - 32px);margin:32px auto;background:#fff;padding:42px;box-shadow:0 10px 35px rgba(0,0,0,.08)}
      .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #f3b300;padding-bottom:22px}.brand{display:flex;gap:14px;align-items:center}.invoice-logo,.invoice-logo-fallback{width:64px;height:64px;object-fit:contain;border-radius:12px}.invoice-logo-fallback{background:#f3b300;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800}.brand h1{font-size:23px;margin:0}.brand p{margin:3px 0;color:#777;font-size:12px;letter-spacing:1.2px}.invoice-title{text-align:right}.invoice-title h2{margin:0;font-size:30px}.invoice-title p{margin:6px 0;color:#777}.info{display:grid;grid-template-columns:1fr 1fr;gap:25px;margin:28px 0}.label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.7px}.value{font-weight:700;margin-top:5px}.table{width:100%;border-collapse:collapse;margin-top:12px}.table th{background:#111;color:#fff;text-align:left;padding:12px}.table td{padding:13px 12px;border-bottom:1px solid #e5e7eb}.right{text-align:right}.totals{margin-left:auto;width:330px;margin-top:22px}.total-row{display:flex;justify-content:space-between;padding:8px 0}.grand{font-size:18px;font-weight:800;border-top:2px solid #111;margin-top:5px;padding-top:13px}.status{display:inline-block;padding:8px 14px;border-radius:999px;background:#fff2bf;font-weight:800;font-size:12px}.footer{margin-top:42px;padding-top:18px;border-top:1px solid #ddd;color:#777;font-size:12px;text-align:center}.print{position:fixed;right:20px;top:20px;border:0;background:#f3b300;padding:12px 18px;border-radius:8px;font-weight:700;cursor:pointer}@media print{body{background:#fff}.invoice{width:100%;max-width:none;margin:0;box-shadow:none}.print{display:none}}
    </style></head><body><button class="print" onclick="window.print()">Cetak / Simpan PDF</button>
    <div class="invoice"><div class="head"><div class="brand">${logoHtml}<div><h1>MARCAPALA</h1><p>NEW LIFESTYLE</p></div></div><div class="invoice-title"><h2>INVOICE</h2><p>${escapeHtml(order.id)}</p><span class="status">${status}</span></div></div>
    <div class="info"><div><div class="label">Kepada</div><div class="value">${escapeHtml(order.customer || "-")}</div><div>${escapeHtml(order.phone || "-")}</div></div><div><div class="label">Tanggal Order</div><div class="value">${created}</div><div style="margin-top:10px"><span class="label">Deadline</span><br>${deadline}</div></div></div>
    <table class="table"><thead><tr><th>Produk</th><th>Jumlah</th><th class="right">Harga</th></tr></thead><tbody><tr><td>${escapeHtml(order.product || "-")}</td><td>${Number(order.quantity || 0)} pcs</td><td class="right">${rupiah(total)}</td></tr></tbody></table>
    <div class="totals"><div class="total-row"><span>Total</span><strong>${rupiah(total)}</strong></div><div class="total-row"><span>Sudah Dibayar</span><strong>${rupiah(deposit)}</strong></div><div class="total-row grand"><span>Sisa Pembayaran</span><strong>${rupiah(remaining)}</strong></div></div>
    <div style="margin-top:24px"><div class="label">Catatan</div><div style="margin-top:6px">${escapeHtml(order.notes || "-")}</div></div>
    <div class="footer">Terima kasih telah menggunakan layanan Marcapala New Lifestyle.</div></div></body></html>`);
    win.document.close();
    setTimeout(() => win.focus(), 250);
}

function formatInvoiceDate(value) {
    const d = new Date(String(value).includes("T") ? value : value + "T00:00:00");
    if (Number.isNaN(d.getTime())) return value || "-";
    return new Intl.DateTimeFormat("id-ID", {day:"2-digit", month:"long", year:"numeric"}).format(d);
}

// ========================================
// DETAIL ORDER
// ========================================

function openOrderDetail(id) {

    const order =
        orders.find(
            order =>
                order.id === id
        );


    if (!order) return;


    selectedOrderId =
        id;


    const modalOrderId =
        document.getElementById(
            "modalOrderId"
        );


    if (modalOrderId) {

        modalOrderId.innerText =
            order.id;

    }


    const modalCustomer =
        document.getElementById(
            "modalCustomer"
        );


    if (modalCustomer) {

        modalCustomer.innerText =
            order.customer || "-";

    }


    const modalPhone =
        document.getElementById(
            "modalPhone"
        );


    if (modalPhone) {

        modalPhone.innerText =
            order.phone || "-";

    }


    const modalProduct =
        document.getElementById(
            "modalProduct"
        );


    if (modalProduct) {

        modalProduct.innerText =
            order.product || "-";

    }


    const modalQuantity =
        document.getElementById(
            "modalQuantity"
        );


    if (modalQuantity) {

        modalQuantity.innerText =
            `${order.quantity || 0} pcs`;

    }


    const modalDeadline =
        document.getElementById(
            "modalDeadline"
        );


    if (modalDeadline) {

        modalDeadline.innerText =
            order.deadline || "-";

    }


    const modalStatus =
        document.getElementById(
            "modalStatus"
        );


    if (modalStatus) {

        modalStatus.innerHTML =
            statusBadge(order.status);

    }


    const modalPrice =
        document.getElementById(
            "modalPrice"
        );


    if (modalPrice) {

        modalPrice.innerText =
            rupiah(order.price);

    }


    const modalDeposit =
        document.getElementById(
            "modalDeposit"
        );


    if (modalDeposit) {

        modalDeposit.innerText =
            rupiah(order.deposit);

    }


    const modalRemaining =
        document.getElementById(
            "modalRemaining"
        );


    if (modalRemaining) {

        modalRemaining.innerText =
            rupiah(order.remaining);

    }


    const modalNotes =
        document.getElementById(
            "modalNotes"
        );


    if (modalNotes) {

        modalNotes.innerText =
            order.notes || "-";

    }


    // ====================================
    // V3 DATA DESAIN
    // ====================================

    const modalDesignStatus =
        document.getElementById(
            "modalDesignStatus"
        );


    if (modalDesignStatus) {

        modalDesignStatus.innerText =
            getDesignStatusText(
                order.designStatus
            );

    }


    const modalDesigner =
        document.getElementById(
            "modalDesigner"
        );


    if (modalDesigner) {

        modalDesigner.innerText =
            order.designer || "-";

    }


    const modalProductionPIC =
        document.getElementById(
            "modalProductionPIC"
        );


    if (modalProductionPIC) {

        modalProductionPIC.innerText =
            order.productionPIC || "-";

    }


    const modalProductionNotes =
        document.getElementById(
            "modalProductionNotes"
        );


    if (modalProductionNotes) {

        modalProductionNotes.innerText =
            order.productionNotes || "-";

    }


    const modalDesignFile =
        document.getElementById(
            "modalDesignFile"
        );


    if (modalDesignFile) {

        modalDesignFile.innerText =
            order.designFile ||
            "Belum ada file";

    }


    const modalStatusSelect =
        document.getElementById(
            "modalStatusSelect"
        );


    if (modalStatusSelect) {

        modalStatusSelect.value =
            order.status;

    }


    const orderModal =
        document.getElementById(
            "orderModal"
        );


    if (orderModal) {

        orderModal.classList.remove(
            "hidden"
        );

    }

}


// ========================================
// TUTUP DETAIL
// ========================================

function closeOrderModal() {

    const modal =
        document.getElementById(
            "orderModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }


    selectedOrderId =
        null;

}


// ========================================
// UBAH STATUS DARI MODAL
// ========================================

function changeStatusFromModal() {

    if (!selectedOrderId) return;


    const select =
        document.getElementById(
            "modalStatusSelect"
        );


    if (!select) return;


    const newStatus =
        select.value;


    const order =
        orders.find(
            order =>
                order.id === selectedOrderId
        );


    if (!order) return;


    order.status =
        newStatus;


    saveOrders();


    renderAll();


    openOrderDetail(
        selectedOrderId
    );

}


// ========================================
// PELANGGAN
// ========================================

function renderCustomers() {
    const table = document.getElementById("customerTable");
    if (!table) return;

    const searchInput = document.getElementById("customerSearch");
    const query = (searchInput?.value || "").trim().toLowerCase();
    const customers = {};

    orders.forEach(order => {
        const name = (order.customer || "").trim();
        const phone = (order.phone || "").trim();
        if (!name) return;
        if (!customers[name]) {
            customers[name] = { phone, totalOrders: 0, totalTransaction: 0 };
        }
        if (!customers[name].phone && phone) customers[name].phone = phone;
        customers[name].totalOrders++;
        customers[name].totalTransaction += Number(order.price || 0);
    });

    const filtered = Object.keys(customers).filter(name => {
        if (!query) return true;
        const customer = customers[name];
        return name.toLowerCase().includes(query) || String(customer.phone || "").toLowerCase().includes(query);
    });

    table.innerHTML = "";
    filtered.forEach(name => {
        const customer = customers[name];
        table.innerHTML += `
            <tr>
                <td><strong>${escapeHtml(name)}</strong></td>
                <td>${escapeHtml(customer.phone || "-")}</td>
                <td>${customer.totalOrders}</td>
                <td>${rupiah(customer.totalTransaction)}</td>
            </tr>`;
    });

    if (!filtered.length) {
        table.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:35px;color:#999">${query ? "Pelanggan tidak ditemukan." : "Belum ada pelanggan."}</td></tr>`;
    }

    const note = document.getElementById("customerSearchNote");
    if (note) {
        note.innerText = query
            ? `Menampilkan ${filtered.length} pelanggan untuk pencarian “${searchInput.value}”.`
            : `Menampilkan ${filtered.length} pelanggan.`;
    }
}

function clearCustomerSearch() {
    const input = document.getElementById("customerSearch");
    if (input) input.value = "";
    renderCustomers();
    if (input) input.focus();
}


// ========================================
// REKAP ORDER BULANAN
// ========================================

function getSelectedRecapMonth() {
    const input = document.getElementById("recapMonth");
    if (input?.value) return input.value;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function renderMonthlyRecap() {
    const month = getSelectedRecapMonth();
    const monthlyOrders = orders.filter(order => (order.createdAt || "").slice(0, 7) === month);
    const revenue = monthlyOrders.reduce((n, o) => n + Number(o.price || 0), 0);
    const deposit = monthlyOrders.reduce((n, o) => n + Number(o.deposit || 0), 0);
    const debt = monthlyOrders.reduce((n, o) => n + Number(o.remaining || 0), 0);

    const set = (id, value) => { const el = document.getElementById(id); if (el) el.innerText = value; };
    set("recapOrderCount", monthlyOrders.length);
    set("recapRevenue", rupiah(revenue));
    set("recapDeposit", rupiah(deposit));
    set("recapDebt", rupiah(debt));

    const table = document.getElementById("monthlyRecapTable");
    if (!table) return;
    table.innerHTML = monthlyOrders.length ? monthlyOrders.map(order => `
        <tr>
            <td><strong>${escapeHtml(order.id)}</strong></td>
            <td>${formatFinanceDate((order.createdAt || "").slice(0,10))}</td>
            <td>${escapeHtml(order.customer || "-")}</td>
            <td>${escapeHtml(order.phone || "-")}</td>
            <td>${escapeHtml(order.product || "-")}</td>
            <td>${Number(order.quantity || 0)}</td>
            <td>${rupiah(order.price)}</td>
            <td>${rupiah(order.deposit)}</td>
            <td>${rupiah(order.remaining)}</td>
            <td>${statusBadge(order.status)}</td>
        </tr>`).join("") : `<tr><td colspan="10" style="text-align:center;padding:30px;color:#999">Belum ada order pada bulan ${month}.</td></tr>`;
}

function exportMonthlyOrdersExcel() {
    const month = getSelectedRecapMonth();
    const monthlyOrders = orders.filter(order => (order.createdAt || "").slice(0, 7) === month);
    const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(`${month}-01T00:00:00`));
    const revenue = monthlyOrders.reduce((n, o) => n + Number(o.price || 0), 0);
    const deposit = monthlyOrders.reduce((n, o) => n + Number(o.deposit || 0), 0);
    const debt = monthlyOrders.reduce((n, o) => n + Number(o.remaining || 0), 0);

    const esc = value => escapeHtml(value ?? "").replace(/&amp;/g, "&amp;");
    const rows = monthlyOrders.map(order => `
        <tr>
            <td>${esc(order.id)}</td>
            <td>${esc((order.createdAt || "").slice(0,10))}</td>
            <td>${esc(order.customer)}</td>
            <td>${esc(order.phone || "")}</td>
            <td>${esc(order.product)}</td>
            <td>${Number(order.quantity || 0)}</td>
            <td>${Number(order.price || 0)}</td>
            <td>${Number(order.deposit || 0)}</td>
            <td>${Number(order.remaining || 0)}</td>
            <td>${esc(getStatusLabel(order.status))}</td>
        </tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        body{font-family:Arial,sans-serif}.title{font-size:18px;font-weight:bold}.summary td{font-weight:bold;background:#fff4cf}.data th{background:#111315;color:#fff}.data td,.data th{border:1px solid #ccc;padding:7px}.data{border-collapse:collapse;width:100%}td.num{text-align:right}
    </style></head><body>
    <div class="title">REKAP ORDER MARCAPALA NEW LIFESTYLE</div>
    <p>Periode: ${esc(monthLabel)}</p>
    <table class="summary"><tr><td>Total Order</td><td>${monthlyOrders.length}</td><td>Omzet</td><td>${revenue}</td><td>Total DP</td><td>${deposit}</td><td>Piutang</td><td>${debt}</td></tr></table><br>
    <table class="data"><thead><tr><th>No. Order</th><th>Tanggal</th><th>Pelanggan</th><th>No. HP</th><th>Produk</th><th>Jumlah</th><th>Total Harga</th><th>DP</th><th>Sisa</th><th>Status</th></tr></thead><tbody>${rows || '<tr><td colspan="10">Tidak ada order.</td></tr>'}</tbody></table>
    </body></html>`;

    const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap-order-${month}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getStatusLabel(status) {
    const map = { BARU:"Order Baru", DESAIN:"Desain", ACC:"ACC Desain", PRODUKSI:"Produksi", QC:"QC", PACKING:"Packing", SELESAI:"Selesai" };
    return map[status] || status || "-";
}


// ========================================
// KEUANGAN
// ========================================

function getFinanceEntries() {
    return JSON.parse(localStorage.getItem("marcapala_finance_entries")) || [];
}

function saveFinanceEntries(entries) {
    localStorage.setItem("marcapala_finance_entries", JSON.stringify(entries));
}

function financeDateMatch(date, period) {
    if (period === "all" || !date) return true;
    const d = new Date(date + "T00:00:00");
    const now = new Date();
    if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === "year") return d.getFullYear() === now.getFullYear();
    return true;
}

function financeOrderEntries(period) {
    return orders.filter(order => financeDateMatch((order.createdAt || "").slice(0,10), period)).map(order => ({
        id: "order-" + order.id,
        date: (order.createdAt || new Date().toISOString()).slice(0,10),
        type: "order",
        category: "Order",
        reference: order.id,
        description: `${order.customer || "Pelanggan"} — ${order.product || "Order"}`,
        amount: Number(order.price || 0),
        deposit: Number(order.deposit || 0),
        remaining: Number(order.remaining || 0)
    }));
}

function renderFinance() {
    const period = document.getElementById("financePeriod")?.value || "all";
    const typeFilter = document.getElementById("financeTypeFilter")?.value || "all";
    const cashEntries = getFinanceEntries().filter(e => financeDateMatch(e.date, period));
    const visibleOrders = financeOrderEntries(period);
    const revenue = visibleOrders.reduce((n, o) => n + o.amount, 0);
    const deposit = visibleOrders.reduce((n, o) => n + o.deposit, 0);
    const income = cashEntries.filter(e => e.type === "income" && !e.orderId).reduce((n, e) => n + Number(e.amount || 0), 0);
    const paymentIncome = cashEntries.filter(e => e.type === "income" && e.orderId).reduce((n, e) => n + Number(e.amount || 0), 0);
    const expense = cashEntries.filter(e => e.type === "expense").reduce((n, e) => n + Number(e.amount || 0), 0);
    // Deposit pada order sudah mencakup pembayaran/pelunasan yang tercatat.
    // Jangan menjumlahkan transaksi pembayaran kedua kalinya.
    const cashIn = deposit + income;
    const debt = visibleOrders.reduce((n, o) => n + o.remaining, 0);
    const balance = cashIn - expense;

    const set = (id, value) => { const el = document.getElementById(id); if (el) el.innerText = value; };
    set("financeRevenue", rupiah(revenue));
    set("financeDeposit", rupiah(deposit));
    set("financeCashIn", rupiah(cashIn));
    set("financeCashOut", rupiah(expense));
    set("financeBalance", rupiah(balance));
    set("financeDebt", rupiah(debt));
    set("financeOrderValue", rupiah(revenue));
    set("financeOrderCount", visibleOrders.length);
    set("financeCashCount", cashEntries.length);
    set("financeCashInSub", `${rupiah(deposit)} pembayaran order + ${rupiah(income)} kas lain`);
    set("financeDebtSub", `${visibleOrders.filter(o => o.remaining > 0).length} order belum lunas`);

    const rows = [];
    visibleOrders.forEach(o => {
        if (typeFilter === "all" || typeFilter === "order") rows.push({ date:o.date, type:"order", label:"Order", reference:o.reference, description:o.description, amount:o.amount, id:null });
    });
    cashEntries.forEach(e => {
        if (typeFilter === "all" || typeFilter === e.type) rows.push({ date:e.date, type:e.type, label:e.category || (e.type === "income" ? "Pemasukan" : "Pengeluaran"), reference:e.reference || "-", description:e.description || "-", amount:Number(e.amount||0), id:e.id });
    });
    rows.sort((a,b) => b.date.localeCompare(a.date));
    const table = document.getElementById("financeTable");
    if (table) table.innerHTML = rows.length ? rows.map(r => `
        <tr><td>${formatFinanceDate(r.date)}</td><td><span class="finance-type ${r.type}">${r.label}</span></td><td>${escapeHtml(r.reference)}</td><td>${escapeHtml(r.description)}</td><td class="money ${r.type}">${rupiah(r.amount)}</td><td>${r.id ? `<button class="delete-finance-btn" onclick="deleteFinanceEntry('${r.id}')">Hapus</button>` : `<span class="muted">Order</span>`}</td></tr>`).join("") : `<tr><td colspan="6" class="empty-finance">Belum ada transaksi pada periode ini.</td></tr>`;
    drawFinanceChart();
}

function formatFinanceDate(date) {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {day:"2-digit", month:"short", year:"numeric"}).format(new Date(date + "T00:00:00"));
}

function openFinanceForm(type = "income") {
    const modal = document.getElementById("financeModal");
    const form = document.getElementById("financeForm");
    if (!modal || !form) return;
    form.reset();
    document.getElementById("financeEditId").value = "";
    document.getElementById("financeEntryType").value = type;
    document.getElementById("financeDate").value = new Date().toISOString().slice(0,10);
    document.getElementById("financeModalTitle").innerText = type === "expense" ? "Tambah Pengeluaran" : "Tambah Pemasukan";
    modal.classList.remove("hidden");
}

function closeFinanceForm() { document.getElementById("financeModal")?.classList.add("hidden"); }

const financeForm = document.getElementById("financeForm");
if (financeForm) financeForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const entries = getFinanceEntries();
    const entry = {
        id: "FIN-" + Date.now(),
        date: document.getElementById("financeDate").value,
        type: document.getElementById("financeEntryType").value || "income",
        category: document.getElementById("financeCategory").value,
        reference: document.getElementById("financeReference").value.trim(),
        description: document.getElementById("financeDescription").value.trim(),
        amount: Number(document.getElementById("financeAmount").value || 0),
        createdAt: new Date().toISOString()
    };
    if (!entry.amount || entry.amount <= 0) return alert("Nominal transaksi harus lebih dari 0.");
    entries.unshift(entry);
    saveFinanceEntries(entries);
    closeFinanceForm();
    renderAll();
});

function deleteFinanceEntry(id) {
    const entries = getFinanceEntries();
    const target = entries.find(e => e.id === id);
    if (!target || !confirm("Hapus transaksi ini?")) return;
    saveFinanceEntries(entries.filter(e => e.id !== id));
    renderAll();
}

function drawFinanceChart() {
    const canvas = document.getElementById("financeChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(600, rect.width) * dpr;
    canvas.height = 240 * dpr;
    ctx.scale(dpr, dpr);
    const width = Math.max(600, rect.width), height = 240, pad = {l:50,r:20,t:20,b:38};
    ctx.clearRect(0,0,width,height);
    const now = new Date(), months = [];
    for(let i=5;i>=0;i--){ const d=new Date(now.getFullYear(),now.getMonth()-i,1); months.push({key:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,label:d.toLocaleDateString('id-ID',{month:'short'})}); }
    const entries = getFinanceEntries();
    const data = months.map(m => {
        const manualIncome = entries.filter(e=>e.type==='income' && !e.orderId && e.date.startsWith(m.key)).reduce((n,e)=>n+Number(e.amount||0),0);
        const paymentIncome = entries.filter(e=>e.type==='income' && e.orderId && e.date.startsWith(m.key)).reduce((n,e)=>n+Number(e.amount||0),0);
        const initialOrderCash = orders.filter(o=>(o.createdAt||'').startsWith(m.key)).reduce((n,o)=>n+Number(o.initialDeposit !== undefined ? o.initialDeposit : o.deposit || 0),0);
        const out = entries.filter(e=>e.type==='expense' && e.date.startsWith(m.key)).reduce((n,e)=>n+Number(e.amount||0),0);
        return {label:m.label,in:manualIncome+paymentIncome+initialOrderCash,out};
    });
    const max = Math.max(1,...data.flatMap(d=>[d.in,d.out]));
    const plotW=width-pad.l-pad.r, plotH=height-pad.t-pad.b, step=plotW/data.length;
    ctx.strokeStyle="#e9ebef"; ctx.fillStyle="#7b8088"; ctx.font="11px Arial";
    for(let i=0;i<=4;i++){ const y=pad.t+plotH-(plotH*i/4); ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke(); ctx.fillText(rupiah(max*i/4).replace(/\s?Rp/,'Rp').replace(/\.00$/,''),5,y+4); }
    data.forEach((d,i)=>{ const x=pad.l+i*step+step/2, bw=Math.min(24,step/5); const h1=d.in/max*plotH,h2=d.out/max*plotH; ctx.fillStyle="#f3b300";ctx.fillRect(x-bw-2,pad.t+plotH-h1,bw,h1);ctx.fillStyle="#c8cbd1";ctx.fillRect(x+2,pad.t+plotH-h2,bw,h2);ctx.fillStyle="#7b8088";ctx.fillText(d.label,x-10,height-12); });
    ctx.fillStyle="#f3b300";ctx.fillRect(width-150,12,10,10);ctx.fillStyle="#555";ctx.fillText("Masuk",width-135,21);ctx.fillStyle="#c8cbd1";ctx.fillRect(width-85,12,10,10);ctx.fillStyle="#555";ctx.fillText("Keluar",width-70,21);
}

function exportFinanceCSV() {
    const entries = getFinanceEntries();
    const rows = [["Tanggal","Jenis","Kategori","Referensi","Keterangan","Nominal"]];
    entries.forEach(e => rows.push([e.date,e.type,e.category,e.reference,e.description,e.amount]));
    const csv = rows.map(row => row.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], {type:"text/csv;charset=utf-8;"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`laporan-keuangan-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
}

// ========================================
// STATUS DESAIN
// ========================================

function getDesignStatusText(
    status
) {

    const statusMap = {

        BELUM:
            "Belum Dikerjakan",

        PROSES:
            "Proses Desain",

        REVISI:
            "Revisi",

        ACC:
            "Menunggu ACC",

        DISETUJUI:
            "Desain Disetujui"

    };


    return (
        statusMap[status] ||
        "Belum Dikerjakan"
    );

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(value) {

    if (!value) return "";


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ========================================
// RENDER SEMUA
// ========================================

function renderAll() {

    renderDashboard();
    renderOrders();
    renderProduction();
    renderCustomers();
    renderMonthlyRecap();
    try { renderFinance(); } catch (error) {
        console.error("Finance render error:", error);
        const table = document.getElementById("financeTable");
        if (table) table.innerHTML = `<tr><td colspan="6" class="empty-finance">Dashboard keuangan siap digunakan. Silakan tambahkan transaksi.</td></tr>`;
    }

}


// ========================================
// START
// ========================================
// ========================================
// HAPUS ORDER
// ========================================

function deleteOrder(id) {

    const order =
        orders.find(
            order => order.id === id
        );

    if (!order) return;


    const confirmDelete =
        confirm(
            `Apakah Anda yakin ingin menghapus order ${order.id}?\n\n` +
            `Pelanggan: ${order.customer}\n` +
            `Produk: ${order.product}\n\n` +
            `Data yang dihapus tidak dapat dikembalikan.`
        );


    if (!confirmDelete) {

        return;

    }


    orders =
        orders.filter(
            order => order.id !== id
        );


    saveOrders();


    renderAll();


    alert(
        `Order ${order.id} berhasil dihapus.`
    );

}
applySavedLogo();
const recapMonthInput = document.getElementById("recapMonth");
if (recapMonthInput && !recapMonthInput.value) recapMonthInput.value = getSelectedRecapMonth();
renderAll();