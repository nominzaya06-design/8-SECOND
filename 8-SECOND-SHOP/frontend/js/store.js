let currentUser = null;
let cart = [];
let wishlist = [];
let orderCount = 0;

function notifyStateChange() {
    document.dispatchEvent(new CustomEvent("shop:statechange"));
}

export function getCart() {
    return cart;
}

export function getWishlist() {
    return wishlist;
}

export function isWishlisted(id) {
    return wishlist.includes(Number(id));
}

export function getCartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

export function getOrderCount() {
    return orderCount;
}

export function setAccountData(data = {}) {
    cart = Array.isArray(data.cart) ? data.cart : [];
    wishlist = Array.isArray(data.wishlist) ? data.wishlist : [];
    if (Number.isInteger(data.orderCount)) orderCount = data.orderCount;
    notifyStateChange();
}

function clearAccountData() {
    cart = [];
    wishlist = [];
    orderCount = 0;
    notifyStateChange();
}

export function getCurrentUser() {
    return currentUser;
}

export function setCurrentUser(user) {
    currentUser = user || null;
    if (!currentUser) clearAccountData();
    else notifyStateChange();
}

export function clearCurrentUser() {
    currentUser = null;
    clearAccountData();
}
