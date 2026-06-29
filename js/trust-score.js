document.addEventListener("DOMContentLoaded", async () => {
    const api = window.TrustFlowAPI;
    if (!api || !document.getElementById("trustScoreValue")) {
        return;
    }

    function setText(id, value) {
        const node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function setBadge(id, tone, text) {
        const node = document.getElementById(id);
        if (!node) {
            return;
        }
        node.className = `badge-tag ${tone || ""}`.trim();
        node.textContent = text;
    }

    function setFill(id, value) {
        const node = document.getElementById(id);
        if (!node) {
            return;
        }
        const tone = value >= 80 ? "safe" : value >= 60 ? "warning" : "danger";
        node.className = `bar-fill ${tone}`;
        node.style.width = `${value}%`;
    }

    function setBar(id, value) {
        const node = document.getElementById(id);
        if (node) {
            node.style.width = `${Math.max(6, Math.min(100, value))}%`;
        }
    }

    function renderEvents(items) {
        const root = document.getElementById("walletEvents");
        if (!root) {
            return;
        }

        root.innerHTML = "";
        (items || []).forEach((item) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${item.title}</strong>${item.detail}`;
            root.appendChild(li);
        });
    }

    function renderHistory(items) {
        const root = document.getElementById("walletTrustHistory");
        if (!root) {
            return;
        }
        root.innerHTML = (items || []).map((item) => `
            <div class="trend-point ${item.tone || "warning"}">
                <div class="trend-point-head">
                    <strong>${item.label}</strong>
                    <span class="status-pill ${item.tone || "warning"}">${item.status}</span>
                </div>
                <p>${item.detail}</p>
                <div class="trend-metrics">
                    <span class="trend-pill">Trust ${item.trustScore}</span>
                    <span class="trend-pill">PFI ${item.pfi}</span>
                </div>
            </div>
        `).join("");
    }

    function renderFactors(items) {
        const root = document.getElementById("walletPredictionFactors");
        if (!root) {
            return;
        }
        root.innerHTML = (items || []).map((factor) => `
            <div class="factor-item">
                <div class="factor-item-head">
                    <strong>${factor.label}</strong>
                    <span class="status-pill ${factor.tone || "warning"}">${factor.input}%</span>
                </div>
                <p>${factor.detail}</p>
                <div class="factor-metadata">
                    <span class="factor-chip">Weight ${(factor.weight * 100).toFixed(0)}%</span>
                    <span class="factor-chip">Contribution ${factor.contribution}</span>
                </div>
            </div>
        `).join("");
    }

    function renderAudit(items) {
        const root = document.getElementById("walletAuditLog");
        if (!root) {
            return;
        }
        root.innerHTML = (items || []).map((item) => `
            <div class="audit-log-item">
                <div class="audit-log-tone ${item.tone || "warning"}"></div>
                <div>
                    <strong>${item.title}</strong>
                    <p>${item.detail}</p>
                </div>
            </div>
        `).join("");
    }

    try {
        const projectId = api.getCurrentProjectId();
        const [response, prediction] = await Promise.all([
            api.request(`/api/wallet/summary?projectId=${encodeURIComponent(projectId)}`),
            api.request(`/api/trust/prediction?projectId=${encodeURIComponent(projectId)}`),
        ]);
        const profile = response.profile || {};
        const breakdown = response.breakdown || {};
        const wallet = response.wallet || {};
        const availableBalance = wallet.ready || 1200;
        const heldByAi = wallet.trustHold || 450;
        const releasedAmount = Math.max((wallet.protected || 0) - (wallet.awaiting || 0), 750);
        const escrowTotal = availableBalance + heldByAi + releasedAmount || 2400;

        setText("trustScoreValue", `${profile.trustScore}/100`);
        setText("trustScoreNarrative", profile.badgeText || "Trust data is being calculated from live platform signals.");
        setText("pfiValue", `${profile.pfi}/100`);
        setText("pfiNarrative", "Professional Fidelity Index is live and reflects recent skill and behavior signals.");
        setText("projectsCompletedValue", String(profile.projectsCompleted || 0));
        setText("reliabilityIndexValue", `${profile.reliabilityIndex || 0}%`);
        setText("escrowProtectedValue", api.formatCurrency(wallet.protected || 0));
        setText("badgeStatusValue", profile.badgeStatus || "Pending");
        setText("badgeStatusText", profile.badgeText || "Run the skill validation test to issue a verified skill badge.");

        setText("profileTrustScore", String(profile.trustScore || 0));
        setText("profileProjectsCompleted", String(profile.projectsCompleted || 0));
        setText("profileReliabilityIndex", `${profile.reliabilityIndex || 0}%`);

        setBadge("skillBadgeChip", profile.skillChip?.tone || "warning", profile.skillChip?.text || "Skill badge pending");
        setBadge("behaviorBadgeChip", profile.behaviorChip?.tone || "warning", profile.behaviorChip?.text || "Behavior scan pending");

        setText("milestoneAccuracyValue", `${breakdown.milestoneAccuracy || 0}%`);
        setText("deadlineAdherenceValue", `${breakdown.deadlineAdherence || 0}%`);
        setText("aqaConsistencyValue", `${breakdown.aqaConsistency || 0}%`);
        setText("skillValidationValue", `${breakdown.skillValidation || 0}%`);
        setText("behavioralTrustValue", `${breakdown.behavioralTrust || 0}%`);

        setFill("milestoneAccuracyFill", breakdown.milestoneAccuracy || 0);
        setFill("deadlineAdherenceFill", breakdown.deadlineAdherence || 0);
        setFill("aqaConsistencyFill", breakdown.aqaConsistency || 0);
        setFill("skillValidationFill", breakdown.skillValidation || 0);
        setFill("behavioralTrustFill", breakdown.behavioralTrust || 0);

        setText("trustHoldValue", api.formatCurrency(wallet.trustHold || 0));
        setText("trustHoldSummary", "Trust hold adjusts automatically after skill validation and behavioral analysis.");

        setText("escrowWalletTotal", api.formatCurrency(escrowTotal));
        setText("escrowAvailableValue", api.formatCurrency(availableBalance));
        setText("escrowHeldValue", api.formatCurrency(heldByAi));
        setText("escrowReleasedValue", api.formatCurrency(releasedAmount));
        setText("escrowReleaseReadiness", availableBalance > heldByAi ? "High" : "Guarded");
        setText(
            "escrowReleaseReadinessText",
            availableBalance > heldByAi
                ? `${api.formatCurrency(availableBalance)} is currently clear for payout when milestone approval lands.`
                : "A larger share of funds is still held until the trust engine sees safer signals.",
        );
        setText("escrowHoldState", heldByAi > 0 ? "Watching" : "Clear");
        setText(
            "escrowHoldStateText",
            heldByAi > 0
                ? `${api.formatCurrency(heldByAi)} is currently being held by AI to prevent unsafe or premature release.`
                : "No current AI hold is blocking the next escrow movement.",
        );

        setBar("escrowAvailableBar", (availableBalance / escrowTotal) * 100);
        setBar("escrowHeldBar", (heldByAi / escrowTotal) * 100);
        setBar("escrowReleasedBar", (releasedAmount / escrowTotal) * 100);

        const ring = document.getElementById("escrowWalletRing");
        if (ring) {
            ring.style.background = `conic-gradient(
                var(--success) 0 ${(availableBalance / escrowTotal) * 100}%,
                var(--warning) ${(availableBalance / escrowTotal) * 100}% ${((availableBalance + heldByAi) / escrowTotal) * 100}%,
                rgba(17, 17, 17, 0.55) ${((availableBalance + heldByAi) / escrowTotal) * 100}% 100%
            )`;
        }

        renderEvents(response.events);
        renderHistory(response.history);
        renderFactors(prediction.factors);
        renderAudit(prediction.auditLog);
    } catch (error) {
        setText("trustScoreNarrative", error.message);
    }
});
