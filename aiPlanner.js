document.addEventListener("DOMContentLoaded", () => {
    const api = window.TrustFlowAPI;
    if (!api || !document.getElementById("projectCreateForm")) {
        return;
    }

    const form = document.getElementById("projectCreateForm");
    const status = document.getElementById("projectCreateStatus");
    const generateButton = document.getElementById("generateProjectPlanButton");

    function payloadFromForm() {
        return {
            title: document.getElementById("project-title").value.trim(),
            clientName: document.getElementById("client-name").value.trim(),
            category: document.getElementById("project-category").value,
            description: document.getElementById("project-desc").value.trim(),
            budget: document.getElementById("budget").value.trim(),
            deadline: document.getElementById("deadline").value,
            reviewStyle: document.getElementById("review-style").value,
            riskLevel: document.getElementById("risk-level").value,
        };
    }

    async function generatePlan() {
        status.textContent = "Generating AI milestone plan...";
        const response = await api.request("/api/projects/plan", {
            method: "POST",
            body: payloadFromForm(),
        });
        renderPlan(response);
        status.textContent = "AI plan ready. Create the project room when you are satisfied with the milestone map.";
        return response;
    }

    function renderPlan(response) {
        const milestoneRoot = document.getElementById("projectPlanMilestones");
        const recommendationRoot = document.getElementById("projectRecommendations");
        const preview = response.fundingPreview || {};

        milestoneRoot.innerHTML = "";
        (response.milestones || []).forEach((milestone) => {
            const row = document.createElement("div");
            row.className = "table-row";
            row.innerHTML = `
                <div>
                    <strong>${milestone.title}</strong>
                    <p>${milestone.deliverable}</p>
                </div>
                <div>${milestone.owner}</div>
                <div>${api.formatCurrency(milestone.amount)}</div>
                <div>${milestone.timing}</div>
            `;
            milestoneRoot.appendChild(row);
        });

        recommendationRoot.innerHTML = "";
        (response.recommendations || []).forEach((item) => {
            const node = document.createElement("li");
            node.textContent = item;
            recommendationRoot.appendChild(node);
        });

        document.getElementById("fundingInitial").textContent = api.formatCurrency(preview.initialDeposit || 0);
        document.getElementById("fundingMid").textContent = api.formatCurrency(preview.midProjectLocked || 0);
        document.getElementById("fundingFinal").textContent = api.formatCurrency(preview.finalReserve || 0);
    }

    generateButton.addEventListener("click", async () => {
        try {
            await generatePlan();
        } catch (error) {
            status.textContent = error.message;
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        status.textContent = "Creating project room...";

        try {
            const response = await api.request("/api/projects", {
                method: "POST",
                body: payloadFromForm(),
            });

            api.setCurrentProjectId(response.projectId);
            status.textContent = "Project room created. Redirecting...";
            window.location.href = `project-room.html?projectId=${encodeURIComponent(response.projectId)}`;
        } catch (error) {
            status.textContent = error.message;
        }
    });

    generatePlan().catch((error) => {
        status.textContent = error.message;
    });
});
