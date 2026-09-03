export function mountAdminStats() {
    const rootElement = document.querySelector("#react-admin-stats-root");
    if (!rootElement || !window.React || !window.ReactDOM) return;

    const { createElement: h, useEffect, useState } = window.React;
    const { createRoot } = window.ReactDOM;

    function AdminStats() {
        const [stats, setStats] = useState(null);

        useEffect(() => {
            fetch("/api/admin/stats", { credentials: "include" })
                .then(response => response.json())
                .then(data => setStats(data.stats));
        }, []);

        if (!stats) return h("p", null, "Loading...");

        return h("section", { className: "react-stats", "aria-label": "Admin statistics" },
            h("h2", null, "Store Overview"),
            h("div", { className: "react-stat-grid" },
                h(StatBox, { label: "Products", value: stats.products }),
                h(StatBox, { label: "Orders", value: stats.orders }),
                h(StatBox, { label: "Users", value: stats.users })
            )
        );
    }

    function StatBox({ label, value }) {
        return h("article", { className: "react-stat-box" },
            h("strong", null, value),
            h("span", null, label)
        );
    }

    createRoot(rootElement).render(h(AdminStats));
}
