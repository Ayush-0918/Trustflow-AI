(function () {
    const STORAGE_KEY = "trustflowLanguage";
    const WIDGET_HOST_ID = "google_translate_element";
    const GOOGLE_SCRIPT_ID = "trustflow-google-translate";
    const LANGUAGES = [
        { code: "en", label: "English (US)" },
        { code: "es", label: "Español" },
        { code: "de", label: "Deutsch" },
        { code: "hi", label: "हिन्दी" },
        { code: "fr", label: "Français" },
        { code: "it", label: "Italiano" },
        { code: "pt", label: "Português" },
        { code: "nl", label: "Nederlands" },
        { code: "pl", label: "Polski" },
        { code: "tr", label: "Türkçe" },
        { code: "ar", label: "العربية" },
        { code: "ja", label: "日本語" },
        { code: "ko", label: "한국어" },
        { code: "zh-CN", label: "中文(简体)" },
        { code: "ru", label: "Русский" },
        { code: "uk", label: "Українська" },
        { code: "sv", label: "Svenska" },
        { code: "no", label: "Norsk" },
        { code: "da", label: "Dansk" },
        { code: "fi", label: "Suomi" },
        { code: "el", label: "Ελληνικά" },
        { code: "cs", label: "Čeština" },
        { code: "ro", label: "Română" },
    ];

    function isSupportedLanguage(code) {
        return LANGUAGES.some((language) => language.code === code);
    }

    function getSavedLanguage() {
        const saved = localStorage.getItem(STORAGE_KEY) || "en";
        return isSupportedLanguage(saved) ? saved : "en";
    }

    function applyCookieValue(value) {
        const host = window.location.hostname;
        const baseCookie = `googtrans=${value}; path=/`;
        document.cookie = baseCookie;

        if (host.includes(".") && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
            document.cookie = `${baseCookie}; domain=.${host}`;
        }
    }

    function setTranslateCookie(language) {
        applyCookieValue(`/en/${language}`);
    }

    function clearTranslateCookie() {
        const host = window.location.hostname;
        document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        if (host.includes(".") && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
            document.cookie = `googtrans=; path=/; domain=.${host}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
    }

    function setLanguage(language) {
        localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language === "en" ? "en" : language;

        if (language === "en") {
            clearTranslateCookie();
            window.location.reload();
            return;
        }

        setTranslateCookie(language);
        const combo = document.querySelector(".goog-te-combo");
        if (combo) {
            combo.value = language;
            combo.dispatchEvent(new Event("change"));
            return;
        }

        window.location.reload();
    }

    function ensureWidgetHost() {
        if (document.getElementById(WIDGET_HOST_ID)) {
            return;
        }

        const host = document.createElement("div");
        host.id = WIDGET_HOST_ID;
        host.className = "google-translate-host";
        document.body.appendChild(host);
    }

    function createSwitcher() {
        if (document.querySelector(".language-switcher")) {
            return;
        }

        const target = document.querySelector(".site-header-utility")
            || document.querySelector(".header-actions")
            || document.querySelector(".app-topbar .toolbar")
            || document.querySelector(".site-header")
            || document.querySelector(".app-topbar")
            || document.body;

        if (!target) {
            return;
        }

        const switcher = document.createElement("div");
        switcher.className = "language-switcher";
        switcher.innerHTML = `
            <span class="language-switcher-label">Language</span>
            <select class="language-select" aria-label="Select language">
                ${LANGUAGES.map((language) => `<option value="${language.code}">${language.label}</option>`).join("")}
            </select>
        `;

        const select = switcher.querySelector(".language-select");
        select.value = getSavedLanguage();
        select.addEventListener("change", (event) => {
            setLanguage(event.target.value);
        });

        if (target === document.body) {
            switcher.classList.add("floating-language-switcher");
        }

        target.appendChild(switcher);
    }

    function markBrandAsNotTranslatable() {
        document.querySelectorAll(".brand-wordmark").forEach((node) => {
            node.classList.add("notranslate");
            node.setAttribute("translate", "no");
        });
    }

    function syncSelectWithSavedLanguage() {
        const select = document.querySelector(".language-select");
        if (select) {
            select.value = getSavedLanguage();
        }
    }

    function syncWidgetWithSavedLanguage() {
        const savedLanguage = getSavedLanguage();
        if (savedLanguage === "en") {
            return;
        }

        const combo = document.querySelector(".goog-te-combo");
        if (!combo) {
            return;
        }

        if (combo.value !== savedLanguage) {
            combo.value = savedLanguage;
            combo.dispatchEvent(new Event("change"));
        }
    }

    function waitForTranslateCombo(attempt = 0) {
        const combo = document.querySelector(".goog-te-combo");
        if (combo) {
            syncWidgetWithSavedLanguage();
            return;
        }

        if (attempt > 40) {
            return;
        }

        window.setTimeout(() => {
            waitForTranslateCombo(attempt + 1);
        }, 250);
    }

    function loadGoogleTranslate() {
        if (document.getElementById(GOOGLE_SCRIPT_ID)) {
            waitForTranslateCombo();
            return;
        }

        const savedLanguage = getSavedLanguage();
        if (savedLanguage !== "en") {
            setTranslateCookie(savedLanguage);
        }

        window.googleTranslateElementInit = function googleTranslateElementInit() {
            if (!(window.google && window.google.translate && window.google.translate.TranslateElement)) {
                return;
            }

            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    includedLanguages: LANGUAGES.map((language) => language.code).join(","),
                    autoDisplay: false,
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                },
                WIDGET_HOST_ID,
            );

            waitForTranslateCombo();
        };

        const script = document.createElement("script");
        script.id = GOOGLE_SCRIPT_ID;
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
    }

    document.addEventListener("DOMContentLoaded", () => {
        markBrandAsNotTranslatable();
        createSwitcher();
        ensureWidgetHost();
        syncSelectWithSavedLanguage();
        loadGoogleTranslate();
    });

    window.TrustFlowI18n = {
        getLanguage: getSavedLanguage,
        setLanguage,
    };
})();
