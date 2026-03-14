document.addEventListener("DOMContentLoaded", () => {
    const api = window.TrustFlowAPI;
    if (!api) {
        return;
    }

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    if (loginForm) {
        const status = document.getElementById("loginStatus");
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            status.textContent = "Signing in...";

            try {
                const payload = await api.request("/api/auth/login", {
                    method: "POST",
                    body: {
                        email: document.getElementById("login-email").value.trim(),
                        password: document.getElementById("login-password").value,
                    },
                });

                api.setSession(payload.token, payload.user);
                window.location.href = "dashboard.html";
            } catch (error) {
                status.textContent = error.message;
            }
        });
    }

    if (signupForm) {
        const status = document.getElementById("signupStatus");
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            status.textContent = "Creating your TrustFlow account...";

            const roleField = signupForm.querySelector('input[name="role"]:checked');
            const termsChecked = document.getElementById("terms").checked;
            if (!termsChecked) {
                status.textContent = "Accept the secure platform terms before continuing.";
                return;
            }

            try {
                const payload = await api.request("/api/auth/signup", {
                    method: "POST",
                    body: {
                        firstName: document.getElementById("first-name").value.trim(),
                        lastName: document.getElementById("last-name").value.trim(),
                        email: document.getElementById("signup-email").value.trim(),
                        password: document.getElementById("signup-password").value,
                        confirmPassword: document.getElementById("signup-confirm").value,
                        role: roleField ? roleField.value : "freelancer",
                    },
                });

                api.setSession(payload.token, payload.user);
                window.location.href = "dashboard.html";
            } catch (error) {
                status.textContent = error.message;
            }
        });
    }
});
