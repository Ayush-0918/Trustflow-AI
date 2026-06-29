(function () {
    const THEME_KEY = "trustflowTheme";
    const FALLBACK_BASE_URL = "http://127.0.0.1:8000";

    function getStoredTheme() {
        const stored = localStorage.getItem(THEME_KEY);
        return stored === "dark" ? "dark" : "light";
    }

    function applyTheme(theme) {
        const resolvedTheme = theme === "dark" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", resolvedTheme);
        localStorage.setItem(THEME_KEY, resolvedTheme);
        document.querySelectorAll(".shell-toggle").forEach((button) => {
            button.dataset.mode = resolvedTheme;
            button.setAttribute("aria-pressed", String(resolvedTheme === "dark"));
        });
    }

    function getBaseUrl() {
        if (window.TrustFlowAPI && typeof window.TrustFlowAPI.getBaseUrl === "function") {
            return window.TrustFlowAPI.getBaseUrl();
        }

        if (window.location.origin && window.location.origin.startsWith("http")) {
            return window.location.origin;
        }

        return FALLBACK_BASE_URL;
    }

    async function requestJson(path) {
        if (window.TrustFlowAPI && typeof window.TrustFlowAPI.request === "function") {
            return window.TrustFlowAPI.request(path);
        }

        const response = await fetch(`${getBaseUrl()}${path}`);
        const payload = await response.json();
        if (!response.ok || payload.status === "error") {
            throw new Error(payload.message || "Request failed.");
        }
        return payload;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#39;");
    }

    function buildNotificationItems(summary, walletSummary) {
        const wallet = walletSummary?.wallet || {};
        const profile = walletSummary?.profile || {};
        const latestScan = walletSummary?.latestVideoScan || null;
        const latestProject = (summary?.liveProjects || [])[0] || null;

        return [
            {
                tone: "success",
                title: "Milestone approved",
                detail: latestProject
                    ? `${latestProject.title} is ${latestProject.progress}% complete and moving toward the next release.`
                    : "The latest milestone cleared review and is ready for the next workflow step.",
            },
            {
                tone: wallet.ready > 0 ? "success" : "warning",
                title: "Escrow released",
                detail: wallet.ready > 0
                    ? `${formatCurrency(wallet.ready)} is now available for payout after the latest approval.`
                    : "Escrow remains protected until the next milestone and trust checks pass.",
            },
            {
                tone: "info",
                title: "Trust score updated",
                detail: profile.trustScore
                    ? `Trust Score is ${profile.trustScore}/100 and PFI is ${profile.pfi}/100 after recent platform signals.`
                    : "Trust scoring has been recalculated from delivery, wallet, and verification activity.",
            },
            {
                tone: latestScan?.risk_tone === "danger" ? "danger" : latestScan ? "success" : "warning",
                title: "AI behavior warning",
                detail: latestScan?.warning_title
                    || (latestScan ? "Behavior looks stable and the latest call did not raise concern." : "Run a live call to generate a behavior signal."),
            },
        ];
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: value % 1 === 0 ? 0 : 2,
        }).format(Number(value || 0));
    }

    function createControls(target) {
        if (!target || target.querySelector(".shell-controls")) {
            return null;
        }

        const wrap = document.createElement("div");
        wrap.className = "shell-controls";
        wrap.innerHTML = `
            <button class="shell-toggle" type="button" aria-label="Toggle color mode" aria-pressed="false">
                <span class="theme-option theme-option-light">☀ Light</span>
                <span class="theme-divider">/</span>
                <span class="theme-option theme-option-dark">🌙 Dark</span>
            </button>
            <div class="notification-center">
                <button class="notification-button" type="button" aria-expanded="false" aria-label="Open notifications">
                    <span class="notification-button-text">🔔 Notifications</span>
                    <span class="notification-count">0</span>
                </button>
                <div class="notification-panel" hidden>
                    <div class="notification-panel-head">
                        <strong>Notifications</strong>
                        <span class="pill-muted">Live</span>
                    </div>
                    <div class="notification-list">
                        <div class="notification-item loading">
                            <strong>Loading</strong>
                            <p>Fetching trust activity...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        target.appendChild(wrap);
        return wrap;
    }

    function bindControls(root) {
        if (!root) {
            return;
        }

        const toggle = root.querySelector(".shell-toggle");
        const trigger = root.querySelector(".notification-button");
        const panel = root.querySelector(".notification-panel");

        applyTheme(getStoredTheme());

        toggle?.addEventListener("click", () => {
            const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
            applyTheme(next);
        });

        trigger?.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = !panel.hidden;
            panel.hidden = isOpen;
            trigger.setAttribute("aria-expanded", String(!isOpen));
        });

        panel?.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

    async function populateNotifications(root) {
        if (!root) {
            return;
        }

        const list = root.querySelector(".notification-list");
        const count = root.querySelector(".notification-count");
        if (!list || !count) {
            return;
        }

        try {
            const [summary, walletSummary] = await Promise.all([
                requestJson("/api/dashboard/summary"),
                requestJson("/api/wallet/summary"),
            ]);

            const items = buildNotificationItems(summary, walletSummary);
            count.textContent = String(items.length);
            list.innerHTML = items.map((item) => `
                <article class="notification-item ${item.tone}">
                    <div class="notification-tone ${item.tone}"></div>
                    <div>
                        <strong>${escapeHtml(item.title)}</strong>
                        <p>${escapeHtml(item.detail)}</p>
                    </div>
                </article>
            `).join("");
        } catch (_error) {
            const fallbackItems = [
                {
                    tone: "success",
                    title: "Milestone approved",
                    detail: "The latest milestone moved forward and is now visible inside the project room.",
                },
                {
                    tone: "success",
                    title: "Escrow released",
                    detail: "Protected payout logic has unlocked the next amount after verification.",
                },
                {
                    tone: "info",
                    title: "Trust score updated",
                    detail: "Capability, wallet history, and video analysis refreshed the trust graph.",
                },
                {
                    tone: "warning",
                    title: "AI behavior warning",
                    detail: "The platform can flag hesitation or commitment risk before funds move.",
                },
            ];

            count.textContent = String(fallbackItems.length);
            list.innerHTML = fallbackItems.map((item) => `
                <article class="notification-item ${item.tone}">
                    <div class="notification-tone ${item.tone}"></div>
                    <div>
                        <strong>${escapeHtml(item.title)}</strong>
                        <p>${escapeHtml(item.detail)}</p>
                    </div>
                </article>
            `).join("");
        }
    }

    function initShellControls() {
        const target = document.querySelector(".site-header-utility")
            || document.querySelector(".header-actions")
            || document.querySelector(".app-topbar .toolbar")
            || document.querySelector(".site-header")
            || document.querySelector(".app-topbar");

        const controls = createControls(target);
        bindControls(controls);
        populateNotifications(controls);

        document.addEventListener("click", () => {
            document.querySelectorAll(".notification-panel").forEach((panel) => {
                const button = panel.parentElement?.querySelector(".notification-button");
                panel.hidden = true;
                button?.setAttribute("aria-expanded", "false");
            });
        });
    }

    applyTheme(getStoredTheme());
    document.addEventListener("DOMContentLoaded", initShellControls);

    window.TrustFlowUIShell = {
        applyTheme,
    };
})();
