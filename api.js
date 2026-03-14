(function () {
    const FALLBACK_BASE_URL = "http://127.0.0.1:8000";

    function getBaseUrl() {
        if (window.location.origin && window.location.origin.startsWith("http")) {
            return window.location.origin;
        }
        return FALLBACK_BASE_URL;
    }

    function getToken() {
        return localStorage.getItem("trustflowToken") || "";
    }

    function getSession() {
        const raw = localStorage.getItem("trustflowUser");
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw);
        } catch (_error) {
            return null;
        }
    }

    function setSession(token, user) {
        localStorage.setItem("trustflowToken", token);
        localStorage.setItem("trustflowUser", JSON.stringify(user));
    }

    function clearSession() {
        localStorage.removeItem("trustflowToken");
        localStorage.removeItem("trustflowUser");
    }

    function setCurrentProjectId(projectId) {
        if (projectId) {
            localStorage.setItem("trustflowCurrentProjectId", projectId);
        }
    }

    function getCurrentProjectId() {
        const fromQuery = new URLSearchParams(window.location.search).get("projectId");
        return fromQuery || localStorage.getItem("trustflowCurrentProjectId") || "";
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: value % 1 === 0 ? 0 : 2,
        }).format(Number(value || 0));
    }

    function formatShortTime(value) {
        const date = value ? new Date(value) : null;
        if (!date || Number.isNaN(date.getTime())) {
            return value || "";
        }
        return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    function formatDateHeading() {
        return new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    }

    function initials(name) {
        return String(name || "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((chunk) => chunk[0].toUpperCase())
            .join("");
    }

    async function request(path, options) {
        const config = { ...(options || {}) };
        const headers = { ...(config.headers || {}) };

        if (config.body && !(config.body instanceof FormData) && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        if (getToken() && !headers.Authorization) {
            headers.Authorization = `Bearer ${getToken()}`;
        }

        if (config.body && headers["Content-Type"] === "application/json" && typeof config.body !== "string") {
            config.body = JSON.stringify(config.body);
        }

        config.headers = headers;

        let response;
        try {
            response = await fetch(`${getBaseUrl()}${path}`, config);
        } catch (_error) {
            throw new Error("TrustFlow backend is not reachable. Start `python3 backend/app.py` and open the site from http://127.0.0.1:8000.");
        }

        const text = await response.text();
        let payload = {};
        try {
            payload = text ? JSON.parse(text) : {};
        } catch (_error) {
            payload = { message: text || "Unknown server response." };
        }

        if (!response.ok || payload.status === "error") {
            throw new Error(payload.message || "Request failed.");
        }

        return payload;
    }

    window.TrustFlowAPI = {
        request,
        getBaseUrl,
        getSession,
        setSession,
        clearSession,
        getToken,
        setCurrentProjectId,
        getCurrentProjectId,
        formatCurrency,
        formatShortTime,
        formatDateHeading,
        initials,
    };
})();
