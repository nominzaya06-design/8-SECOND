export function getRoute() {
    const raw = location.hash.replace(/^#/, "") || "/home";
    const [pathText, queryText = ""] = raw.split("?");
    const path = pathText.startsWith("/") ? pathText : `/${pathText}`;
    const parts = path.split("/").filter(Boolean);
    const query = new URLSearchParams(queryText);

    const simpleRoutes = {
        "/": "home",
        "/home": "home",
        "/women": "women",
        "/men": "men",
        "/new-arrivals": "new",
        "/best": "best",
        "/sale": "sale",
        "/search": "search",
        "/wishlist": "wishlist",
        "/cart": "cart",
        "/checkout": "checkout",
        "/login": "login",
        "/register": "register",
        "/profile": "profile",
        "/orders": "orders",
        "/admin": "admin"
    };

    if (simpleRoutes[path]) {
        return { name: simpleRoutes[path], path, query, params: {} };
    }

    if (parts[0] === "product" && parts[1]) {
        return { name: "product", path, query, params: { id: Number(parts[1]) } };
    }

    return { name: "notFound", path, query, params: {} };
}
