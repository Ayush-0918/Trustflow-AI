document.addEventListener("DOMContentLoaded", () => {
    const revealNodes = Array.from(document.querySelectorAll(".landing-reveal"));
    const floatingNodes = Array.from(document.querySelectorAll("[data-float]"));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    floatingNodes.forEach((node) => {
        const amount = Number(node.dataset.float || 12);
        if (!Number.isFinite(amount)) {
            return;
        }
        node.style.animationDuration = `${6 + (amount / 10)}s`;
    });

    if (!revealNodes.length) {
        return;
    }

    revealNodes.forEach((node, index) => {
        node.style.transitionDelay = `${Math.min(index * 55, 260)}ms`;
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealNodes.forEach((node) => {
            node.classList.add("is-visible");
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
    });

    revealNodes.forEach((node) => observer.observe(node));
});
