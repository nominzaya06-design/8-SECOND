import { createElement as h, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

export function mountAdminStats() {
    const rootElement = document.querySelector("#react-admin-stats-root");
    if (!rootElement) return;

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

window.mountAdminStats = mountAdminStats;
