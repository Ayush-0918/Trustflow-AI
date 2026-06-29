document.addEventListener("DOMContentLoaded", async () => {
    const riskValue = document.getElementById("landingProjectRiskValue");
    if (!riskValue) {
        return;
    }

    function setText(id, value) {
        const node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function setBadge(tone, text) {
        const badge = document.getElementById("landingTrustStabilityBadge");
        if (!badge) {
            return;
        }
        badge.className = `status-pill ${tone || "success"}`;
        badge.textContent = text;
    }

    function getApiPath() {
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get("projectId") || localStorage.getItem("trustflowCurrentProjectId") || "";
        return projectId
            ? `/api/trust/prediction?projectId=${encodeURIComponent(projectId)}`
            : "/api/trust/prediction";
    }

    try {
        const api = window.TrustFlowAPI;
        const prediction = api
            ? await api.request(getApiPath())
            : await fetch(getApiPath()).then((response) => response.json());

        setText("landingProjectRiskValue", `${prediction.projectRisk}%`);
        setText("landingDelayValue", `${prediction.deliveryDelayProbability}%`);
        setText("landingDisputeValue", `${prediction.disputeRisk}%`);
        setText("landingTrustStabilityValue", prediction.trustStability);
        setText("landingPredictionText", prediction.narrative);
        setText("landingPredictionChipA", `Trust Score ${prediction.trustScore}/100`);
        setText("landingPredictionChipB", `Delay Rate ${prediction.delayRate}%`);
        setText("landingPredictionChipC", `Communication ${prediction.communicationFrequency}%`);
        setBadge(prediction.tone, `Trust Stability ${prediction.trustStability}`);

        const bar = document.getElementById("landingProjectRiskBar");
        if (bar) {
            bar.style.width = `${prediction.projectRisk}%`;
        }
    } catch (_error) {
        setBadge("warning", "Trust Stability Monitoring");
    }
});
