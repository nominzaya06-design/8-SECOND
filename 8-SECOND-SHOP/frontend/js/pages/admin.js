import { AdminService } from "../admin-service.js";
import { AccountService } from "../account-service.js";
import { ProductService } from "../data.js";
import { mountAdminStats } from "../react/admin-stats.js";
import { getCurrentUser } from "../store.js";
import { escapeHTML, formatDate, formatPrice, showToast } from "../utils.js";

const COLOR_OPTIONS = [
    ["Black", "hsl(0 0% 15%)"],
    ["White", "hsl(0 0% 95%)"],
    ["Gray", "hsl(0 0% 55%)"],
    ["Navy", "hsl(220 45% 25%)"],
    ["Blue", "hsl(215 70% 50%)"],
    ["Brown", "hsl(25 40% 35%)"],
    ["Beige", "hsl(40 35% 80%)"],
    ["Red", "hsl(0 65% 50%)"],
    ["Pink", "hsl(340 65% 70%)"],
    ["Green", "hsl(130 40% 40%)"],
    ["Yellow", "hsl(50 80% 60%)"],
    ["Purple", "hsl(275 45% 50%)"]
];

function accessMessage(user) {
    if (!user) {
        return `<div class="empty-state account-empty"><h1>Admin Panel</h1><p>Sign in with an admin account.</p><a class="primary-button" href="#/login">Sign In</a></div>`;
    }

    return `<div class="empty-state account-empty"><h1>Admin Panel</h1><p>Your account does not have admin permission.</p><a class="secondary-button" href="#/profile">Back to Account</a></div>`;
}

export function renderAdmin(products) {
    const user = getCurrentUser();
    if (user?.role !== "admin") {
        return `<main class="standard-page page-width">${accessMessage(user)}</main>`;
    }

    const colorOptions = COLOR_OPTIONS.map(([label, value], index) => `
        <label class="admin-color-option">
            <input type="checkbox" value="${value}" data-admin-color ${index < 2 ? "checked" : ""}>
            <span style="--swatch:${value}"></span>${label}
        </label>`).join("");

    return `<main class="standard-page page-width">
        <header class="admin-header">
            <div><h1 class="page-title">Admin Panel</h1><p class="page-subtitle">Product and order management.</p></div>
        </header>

        <div id="react-admin-stats-root"></div>

        <div class="admin-layout">
            <section class="admin-form">
                <h2 id="admin-form-title">Add Product</h2>
                <form id="product-form" class="form-grid">
                    <input id="admin-id" type="hidden">
                    <div class="field full"><label for="admin-name">Name</label><input id="admin-name" maxlength="120" required></div>
                    <div class="field"><label for="admin-gender">Gender</label><select id="admin-gender"><option>Women</option><option>Men</option><option>Unisex</option></select></div>
                    <div class="field"><label for="admin-category">Category</label><select id="admin-category"><option>Tops</option><option>Bottoms</option><option>Outerwear</option><option>Dresses</option><option>Accessories</option></select></div>
                    <div class="field"><label for="admin-price">Price (₮)</label><input id="admin-price" type="number" min="1000" step="1000" required></div>
                    <div class="field"><label for="admin-old-price">Old Price (₮)</label><input id="admin-old-price" type="number" min="1000" step="1000" placeholder="Only for sale items"></div>
                    <div class="field"><label for="admin-stock">Stock</label><input id="admin-stock" type="number" min="0" required></div>
                    <fieldset class="admin-colors full">
                        <legend>Colors</legend>
                        <div class="admin-color-grid">${colorOptions}</div>
                    </fieldset>
                    <div class="field full">
                        <label for="admin-image">Product Image</label>
                        <input id="admin-image" type="file" accept="image/jpeg,image/png,image/webp" required>
                        <p class="form-note">JPG, PNG or WebP · maximum 5 MB</p>
                        <img class="admin-image-preview" id="admin-image-preview" alt="Current product" hidden>
                    </div>
                    <fieldset class="admin-flags full">
                        <legend>Product labels</legend>
                        <label><input id="admin-new" type="checkbox" checked> New Arrival</label>
                        <label><input id="admin-best" type="checkbox"> Best Seller</label>
                        <label><input id="admin-sale" type="checkbox"> On Sale</label>
                    </fieldset>
                    <div class="field full"><label for="admin-description">Description</label><textarea id="admin-description" maxlength="800" required></textarea></div>
                    <div class="full inline-actions"><button class="primary-button" type="submit">Save Product</button><button class="secondary-button" id="admin-clear" type="button">Clear</button></div>
                </form>
            </section>

            <section class="admin-list">
                <h2>Products</h2>
                <div class="admin-table-wrap">
                    <table class="admin-table">
                        <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                        <tbody id="admin-table-body"></tbody>
                    </table>
                </div>
            </section>
        </div>

        <section class="admin-orders-section">
            <header class="section-heading"><h2>Order Management</h2></header>
            <div class="admin-table-wrap">
                <table class="admin-table admin-orders-table">
                    <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Details</th><th>Save</th></tr></thead>
                    <tbody id="admin-orders-body"><tr><td colspan="7">Loading orders...</td></tr></tbody>
                </table>
            </div>
        </section>

        <dialog class="order-details-dialog" id="order-details-dialog">
            <header class="order-details-head">
                <h2>Order Details</h2>
                <button type="button" id="order-details-close" aria-label="Close">×</button>
            </header>
            <div id="order-details-content"></div>
        </dialog>
    </main>`;
}

export function mountAdmin(products, rerender) {
    if (getCurrentUser()?.role !== "admin") return;

    mountAdminStats();

    let list = [...products];
    let orderList = [];
    const form = document.querySelector("#product-form");
    const tableBody = document.querySelector("#admin-table-body");
    const ordersBody = document.querySelector("#admin-orders-body");
    const orderDialog = document.querySelector("#order-details-dialog");
    const orderDetails = document.querySelector("#order-details-content");
    const imageInput = document.querySelector("#admin-image");
    const imagePreview = document.querySelector("#admin-image-preview");

    function clearForm() {
        form.reset();
        document.querySelector("#admin-id").value = "";
        document.querySelector("#admin-image").required = true;
        document.querySelector("#admin-image-preview").hidden = true;
        document.querySelector("#admin-form-title").textContent = "Add Product";
    }

    function drawTable() {
        tableBody.innerHTML = list.map(product => `<tr>
            <td>${product.id}</td>
            <td>${escapeHTML(product.name)}</td>
            <td>${escapeHTML(product.category)}</td>
            <td>${formatPrice(product.price)}</td>
            <td>${product.stock}</td>
            <td><button type="button" data-edit="${product.id}">Edit</button> <button class="sale-text" type="button" data-delete="${product.id}">Delete</button></td>
        </tr>`).join("");
    }

    function fillForm(product) {
        document.querySelector("#admin-id").value = product.id;
        document.querySelector("#admin-name").value = product.name;
        document.querySelector("#admin-gender").value = product.gender;
        document.querySelector("#admin-category").value = product.category;
        document.querySelector("#admin-price").value = product.price;
        document.querySelector("#admin-old-price").value = product.oldPrice || "";
        document.querySelector("#admin-stock").value = product.stock;
        document.querySelectorAll("[data-admin-color]").forEach(input => {
            input.checked = product.colors.includes(input.value);
        });
        document.querySelector("#admin-image").value = "";
        document.querySelector("#admin-image").required = false;
        const preview = document.querySelector("#admin-image-preview");
        preview.src = product.image;
        preview.hidden = false;
        document.querySelector("#admin-new").checked = product.newArrival;
        document.querySelector("#admin-best").checked = product.bestSeller;
        document.querySelector("#admin-sale").checked = product.onSale;
        document.querySelector("#admin-description").value = product.description;
        document.querySelector("#admin-form-title").textContent = `Edit Product #${product.id}`;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function loadOrders() {
        try {
            orderList = await AdminService.orders();
            ordersBody.innerHTML = orderList.length ? orderList.map(order => `<tr>
                <td>${escapeHTML(order.orderNumber)}</td>
                <td>${escapeHTML(order.user?.name || order.shipping?.name || "Customer")}</td>
                <td>${escapeHTML(formatDate(order.createdAt))}</td>
                <td>${formatPrice(order.total)}</td>
                <td>
                    <select data-order-status="${order._id}">
                        ${["Processing", "Shipped", "Delivered", "Cancelled"].map(status => `<option ${status === order.status ? "selected" : ""}>${status}</option>`).join("")}
                    </select>
                </td>
                <td><button type="button" data-view-order="${order._id}">View</button></td>
                <td><button type="button" data-save-order="${order._id}">Save</button></td>
            </tr>`).join("") : `<tr><td colspan="7">No orders yet.</td></tr>`;
        } catch (error) {
            ordersBody.innerHTML = `<tr><td colspan="7">${escapeHTML(error.message)}</td></tr>`;
        }
    }

    function showOrderDetails(order) {
        orderDetails.innerHTML = `
            <div class="order-details-summary">
                <strong>${escapeHTML(order.orderNumber)}</strong>
                <span>${escapeHTML(formatDate(order.createdAt))} · ${escapeHTML(order.status)}</span>
            </div>
            <div class="order-details-items">
                ${order.items.map(item => `<div class="admin-order-item">
                    <div>
                        <strong>${escapeHTML(item.name)}</strong>
                        <span>Quantity: ${item.quantity}</span>
                        <span class="order-item-color">Color: <i style="--swatch:${escapeHTML(item.color)}"></i></span>
                    </div>
                    <div>
                        <span>${formatPrice(item.price)} each</span>
                        <strong>${formatPrice(item.price * item.quantity)}</strong>
                    </div>
                </div>`).join("")}
            </div>
            <section class="order-details-shipping">
                <h3>Shipping Information</h3>
                <p>${escapeHTML(order.shipping.name)}</p>
                <p>${escapeHTML(order.shipping.email)}</p>
                <p>${escapeHTML(order.shipping.phone)}</p>
                <p>${escapeHTML(order.shipping.address)}, ${escapeHTML(order.shipping.city)}</p>
            </section>
            <div class="order-details-total"><span>Order Total</span><strong>${formatPrice(order.total)}</strong></div>`;
        orderDialog.showModal();
    }

    tableBody.addEventListener("click", async event => {
        const editButton = event.target.closest("[data-edit]");
        const deleteButton = event.target.closest("[data-delete]");

        if (editButton) {
            const product = list.find(item => item.id === Number(editButton.dataset.edit));
            if (product) fillForm(product);
        }

        if (deleteButton) {
            const id = Number(deleteButton.dataset.delete);
            if (!confirm("Delete this product?")) return;

            try {
                await ProductService.remove(id);
                await AccountService.load(true);
                showToast("Product deleted.");
                rerender();
            } catch (error) {
                showToast(error.message);
            }
        }
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const id = Number(document.querySelector("#admin-id").value);
        const oldProduct = list.find(product => product.id === id);
        const price = Number(document.querySelector("#admin-price").value);
        const oldPrice = Number(document.querySelector("#admin-old-price").value) || null;
        const onSale = document.querySelector("#admin-sale").checked;
        const selectedColors = [...document.querySelectorAll("[data-admin-color]:checked")].map(input => input.value);
        const imageFile = document.querySelector("#admin-image").files[0];

        if (onSale && (!oldPrice || oldPrice <= price)) {
            showToast("Sale old price must be higher than the current price.");
            return;
        }

        if (!selectedColors.length && !oldProduct) {
            showToast("Choose at least one color.");
            return;
        }

        const product = {
            name: document.querySelector("#admin-name").value.trim(),
            description: document.querySelector("#admin-description").value.trim(),
            gender: document.querySelector("#admin-gender").value,
            category: document.querySelector("#admin-category").value,
            price,
            oldPrice: onSale ? oldPrice : null,
            image: oldProduct?.image || "",
            stock: Number(document.querySelector("#admin-stock").value),
            colors: selectedColors.length ? selectedColors : oldProduct.colors,
            newArrival: document.querySelector("#admin-new").checked,
            bestSeller: document.querySelector("#admin-best").checked,
            onSale
        };

        const submitButton = form.querySelector("button[type='submit']");
        submitButton.disabled = true;

        try {
            if (imageFile) product.image = await AdminService.uploadImage(imageFile);
            if (id) await ProductService.update(id, product);
            else await ProductService.create(product);
            showToast(id ? "Product updated." : "Product added.");
            rerender();
        } catch (error) {
            showToast(error.message);
        } finally {
            submitButton.disabled = false;
        }
    });

    ordersBody.addEventListener("click", async event => {
        const viewButton = event.target.closest("[data-view-order]");
        if (viewButton) {
            const order = orderList.find(item => item._id === viewButton.dataset.viewOrder);
            if (order) showOrderDetails(order);
            return;
        }

        const button = event.target.closest("[data-save-order]");
        if (!button) return;

        const orderId = button.dataset.saveOrder;
        const select = ordersBody.querySelector(`[data-order-status="${orderId}"]`);
        button.disabled = true;

        try {
            await AdminService.updateOrderStatus(orderId, select.value);
            showToast("Order status updated.");
            await loadOrders();
            mountAdminStats();
        } catch (error) {
            showToast(error.message);
        } finally {
            button.disabled = false;
        }
    });

    document.querySelector("#admin-clear").addEventListener("click", clearForm);
    document.querySelector("#order-details-close").addEventListener("click", () => orderDialog.close());
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (!file) return;
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.hidden = false;
    });
    drawTable();
    loadOrders();
}
