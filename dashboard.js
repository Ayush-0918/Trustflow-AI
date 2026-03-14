document.addEventListener("DOMContentLoaded", async () => {
    const api = window.TrustFlowAPI;
    if (!api) {
        return;
    }

    function setText(id, value) {
        const node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function renderProjects(projects) {
        const container = document.getElementById("dashboardProjectsList");
        if (!container) {
            return;
        }

        container.innerHTML = "";
        projects.forEach((project) => {
            const card = document.createElement("a");
            card.className = "project-card";
            card.href = `project-room.html?projectId=${encodeURIComponent(project.id)}`;
            card.innerHTML = `
                <div class="row-between">
                    <div>
                        <h4>${project.title}</h4>
                        <p>${project.clientName} &middot; ${project.subtitle}</p>
                    </div>
                    <span class="status-pill ${project.statusTone}">${project.statusLabel}</span>
                </div>
                <div class="progress-track compact"><span style="width:${project.progress}%"></span></div>
                <div class="detail-line">
                    <span>${project.progress}% complete</span>
                    <span>${api.formatCurrency(project.nextRelease)} next release</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function buildTrustTimeline(summary, wallet) {
        const latestSkill = wallet.latestSkillTest;
        const latestScan = wallet.latestVideoScan;
        const topProject = (summary.liveProjects || [])[0];

        return [
            {
                tone: latestSkill?.passed ? "success" : latestSkill ? "warning" : "warning",
                status: latestSkill?.passed ? "Passed" : latestSkill ? "Review" : "Pending",
                icon: latestSkill?.passed ? "✓" : "!",
                title: latestSkill?.passed ? "Skill Test Passed" : "Skill Test Pending",
                detail: latestSkill?.passed
                    ? `${latestSkill.badge_label || latestSkill.badgeLabel || "Verified skill badge"} is now supporting the trust system.`
                    : latestSkill
                        ? latestSkill.summary
                        : "Run the AI micro-test to validate freelancer capability before assignment.",
                meta: "Capability confidence",
            },
            {
                tone: topProject?.progress >= 50 ? "success" : "warning",
                status: topProject?.progress >= 50 ? "Delivered" : "In progress",
                icon: "✓",
                title: "Milestone Delivered",
                detail: topProject
                    ? `${topProject.title} is ${topProject.progress}% complete with ${api.formatCurrency(topProject.nextRelease)} queued next.`
                    : "A live project will appear here once TrustFlow starts tracking active milestones.",
                meta: "Project room proof",
            },
            {
                tone: (wallet.wallet?.ready || 0) > 0 ? "success" : "warning",
                status: (wallet.wallet?.ready || 0) > 0 ? "Approved" : "Waiting",
                icon: "✓",
                title: "Client Approval",
                detail: (wallet.wallet?.ready || 0) > 0
                    ? `${api.formatCurrency(wallet.wallet.ready)} is ready for release after approval and trust checks.`
                    : "The next client approval is still pending before a payout can move.",
                meta: "Approval and release",
            },
            {
                tone: latestScan?.risk_tone === "danger" ? "danger" : latestScan?.risk_tone === "success" ? "success" : "warning",
                status: latestScan?.risk_tone === "danger" ? "Warning" : latestScan?.risk_tone === "success" ? "Stable" : "Pending",
                icon: latestScan?.risk_tone === "danger" ? "!" : "✓",
                title: latestScan?.risk_tone === "danger" ? "Behavior Warning" : "AI Behavior Rating",
                detail: latestScan?.warning_title || "Run a live call scan to convert behavior into a trust signal.",
                meta: "Behavioral analysis",
            },
            {
                tone: latestScan?.risk_tone === "success" ? "success" : (wallet.wallet?.trustHold || 0) > 0 ? "warning" : "success",
                status: latestScan?.risk_tone === "success" ? "Released" : (wallet.wallet?.trustHold || 0) > 0 ? "Held" : "Ready",
                icon: latestScan?.risk_tone === "success" ? "✓" : "!",
                title: latestScan?.risk_tone === "success" ? "Escrow Released" : "Escrow Review",
                detail: latestScan?.risk_tone === "success"
                    ? "Escrow can proceed because skill, behavior, and milestone quality look healthy."
                    : `${api.formatCurrency(wallet.wallet?.trustHold || 0)} remains protected while TrustFlow reviews risk and proof signals.`,
                meta: "Escrow intelligence",
            },
        ];
    }

    function renderTimeline(items) {
        const container = document.getElementById("dashboardTimelineList");
        if (!container) {
            return;
        }

        container.innerHTML = "";
        items.forEach((item) => {
            const node = document.createElement("div");
            node.className = "trust-timeline-item";
            node.innerHTML = `
                <div class="trust-timeline-icon ${item.tone}">${item.icon}</div>
                <div class="trust-timeline-copy">
                    <div class="row-between">
                        <h4>${item.title}</h4>
                        <span class="status-pill ${item.tone}">${item.status}</span>
                    </div>
                    <p>${item.detail}</p>
                    <div class="trust-timeline-meta">
                        <span>${item.meta}</span>
                    </div>
                </div>
            `;
            container.appendChild(node);
        });
    }

    function renderWallet(wallet) {
        const container = document.getElementById("dashboardWalletList");
        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="transaction-row">
                <div>
                    <h4>Available for release</h4>
                    <p>Approved milestones ready for payout</p>
                </div>
                <span class="status-pill success">${api.formatCurrency(wallet.ready || 0)}</span>
            </div>
            <div class="transaction-row">
                <div>
                    <h4>Awaiting verification</h4>
                    <p>Needs evidence review or client confirmation</p>
                </div>
                <span class="status-pill warning">${api.formatCurrency(wallet.awaiting || 0)}</span>
            </div>
            <div class="transaction-row">
                <div>
                    <h4>Held for trust review</h4>
                    <p>Paused until behavioral and delivery signals become safer</p>
                </div>
                <span class="status-pill danger">${api.formatCurrency(wallet.trustHold || 0)}</span>
            </div>
        `;
    }

    function renderActivities(items) {
        const container = document.getElementById("dashboardActivityList");
        if (!container) {
            return;
        }

        container.innerHTML = "";
        items.forEach((item) => {
            const node = document.createElement("div");
            node.className = "event-row";
            node.innerHTML = `
                <div>
                    <h4>${item.title}</h4>
                    <p>${item.detail}</p>
                </div>
                <span class="pill-muted">${api.formatShortTime(item.time)}</span>
            `;
            container.appendChild(node);
        });
    }

    function renderPredictionFactors(prediction) {
        const factorRoot = document.getElementById("predictionFactorList");
        const auditRoot = document.getElementById("predictionAuditList");
        if (factorRoot) {
            factorRoot.innerHTML = (prediction.factors || []).map((factor) => `
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

        if (auditRoot) {
            auditRoot.innerHTML = (prediction.auditLog || []).map((item) => `
                <div class="audit-log-item">
                    <div class="audit-log-tone ${item.tone || "warning"}"></div>
                    <div>
                        <strong>${item.title}</strong>
                        <p>${item.detail}</p>
                    </div>
                </div>
            `).join("");
        }

        setText("predictionFormulaBadge", prediction.formula || "Formula live");
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function buildPrediction(summary, walletSummary) {
        const profile = walletSummary.profile || {};
        const breakdown = walletSummary.breakdown || {};
        const wallet = walletSummary.wallet || {};
        const latestScan = walletSummary.latestVideoScan || null;
        const latestProject = (summary.liveProjects || [])[0] || {};
        const projectProgress = latestProject.progress || 0;

        const behaviorGap = 100 - (breakdown.behavioralTrust || 72);
        const riskScore = clamp(Math.round(
            ((100 - (profile.trustScore || 80)) * 0.35)
            + ((100 - (profile.pfi || walletSummary.professionalFidelityIndex || 84)) * 0.2)
            + (behaviorGap * 0.08)
            + ((100 - projectProgress) * 0.04)
            + ((wallet.trustHold || 0) > 0 ? 4 : 0)
            + (latestScan?.risk_tone === "danger" ? 8 : latestScan?.risk_tone === "warning" ? 4 : 0)
        ), 8, 92);

        let delayProbability = "Very Low";
        if (riskScore >= 52) {
            delayProbability = "Medium";
        } else if (riskScore >= 28 || projectProgress < 18) {
            delayProbability = "Low";
        }

        let disputeProbability = "Very Low";
        if ((wallet.trustHold || 0) > 0 && riskScore >= 44) {
            disputeProbability = "Low";
        } else if (riskScore >= 62) {
            disputeProbability = "Moderate";
        }

        const trustSignal = latestScan?.risk_tone === "danger"
            ? "Guarded"
            : latestScan?.risk_tone === "success"
                ? "Stable"
                : "Watch";

        const recommendedAction = latestScan?.risk_tone === "danger"
            ? "Monitor"
            : wallet.ready > 0
                ? "Release Ready"
                : "Observe";

        return {
            projectRisk: riskScore,
            deliveryDelayProbability: riskScore >= 52 ? 48 : riskScore >= 28 ? 24 : 18,
            disputeRisk: riskScore >= 52 ? 34 : riskScore >= 28 ? 18 : 12,
            trustStability: latestScan?.risk_tone === "danger" ? "MODERATE" : "HIGH",
            recommendedAction,
            narrative: latestScan?.warning_title
                ? `${latestScan.warning_title} TrustFlow is watching behavior and milestone readiness together.`
                : "System predicts risk before project failure by combining escrow, skill, delivery, and behavior signals.",
            delayNarrative: latestProject.title
                ? `${latestProject.title} is being scored for delivery delay using progress, review load, and current trust signals.`
                : "Milestone proof and response speed indicate how likely delivery delays are to happen.",
            disputeNarrative: disputeProbability === "Very Low"
                ? "Escrow control and visible proof trails are keeping payment dispute probability very low."
                : "TrustFlow sees some payout friction risk and will keep proof-first escrow controls active.",
            stabilityNarrative: latestScan?.summary
                || "Recent wallet, skill, and verification data are feeding the trust prediction engine live.",
            tone: latestScan?.risk_tone === "danger" ? "warning" : "success",
            actionText: latestScan?.risk_tone === "danger"
                ? "Continue milestone verification, ask for reaffirmation, and keep the trust hold logic active."
                : "Continue milestone verification and let the escrow engine release funds when evidence is complete.",
        };
    }

    function renderPrediction(prediction, walletSummary) {
        setText("predictionRiskValue", `${prediction.projectRisk}%`);
        setText("predictionDelayValue", `${prediction.deliveryDelayProbability}%`);
        setText("predictionDisputeValue", `${prediction.disputeRisk}%`);
        setText("predictionTrustSignal", prediction.trustStability);
        setText("predictionAction", prediction.recommendedAction);
        setText("predictionNarrative", prediction.narrative);
        setText("predictionDelayText", prediction.delayNarrative);
        setText("predictionDisputeText", prediction.disputeNarrative);
        setText("predictionTrustSignalText", prediction.stabilityNarrative);
        setText("predictionActionText", prediction.actionText);

        const fill = document.getElementById("predictionRiskFill");
        if (fill) {
            fill.style.width = `${prediction.projectRisk}%`;
        }

        setText(
            "predictionMonitorChip",
            walletSummary.latestVideoScan?.risk_tone === "danger" ? "Behavior warning live" : "Behavior monitored",
        );
        setText("predictionEscrowChip", (walletSummary.wallet?.trustHold || 0) > 0 ? "Escrow protected" : "Escrow clear");
        setText(
            "predictionPFIChip",
            prediction.formula ? "Future risk formula live" : `PFI ${walletSummary.profile?.pfi || walletSummary.professionalFidelityIndex || 0}/100`,
        );
        renderPredictionFactors(prediction);
    }

    const dateNode = document.getElementById("dashboardDate");
    const headingNode = document.getElementById("dashboardHeading");
    if (dateNode) {
        dateNode.textContent = api.formatDateHeading();
    }

    const session = api.getSession();
    if (session && headingNode) {
        headingNode.textContent = `${session.name.split(" ")[0]}'s Dashboard`;
    }

    try {
        const [summary, wallet] = await Promise.all([
            api.request("/api/dashboard/summary"),
            api.request(`/api/wallet/summary?projectId=${encodeURIComponent(api.getCurrentProjectId())}`),
        ]);

        const metrics = summary.metrics || {};
        setText("metricActiveProjects", String(metrics.activeProjects || 0));
        setText("metricMilestonesWeek", String(metrics.milestonesThisWeek || 0));
        setText("metricEscrowProtected", api.formatCurrency(metrics.escrowProtected || 0));
        setText("metricRiskAlerts", String(metrics.riskAlerts || 0));

        setText("dashboardTrustScore", `${wallet.profile.trustScore}`);
        setText("dashboardMilestoneAcceptance", `${wallet.breakdown.milestoneAccuracy}%`);
        setText("dashboardResponseTime", wallet.latestVideoScan ? "Live" : "2.1h");
        setText("dashboardTrustScoreText", wallet.profile.badgeText);
        setText("dashboardMilestoneAcceptanceText", "Autonomous QA and skill checks are feeding the trust system.");
        setText(
            "dashboardResponseTimeText",
            wallet.latestVideoScan
                ? "Behavioral verification has already contributed to the live trust graph."
                : "Launch a video verification to push live behavior analysis into the wallet.",
        );

        setText("walletProtectedTotal", api.formatCurrency(wallet.wallet.protected));
        setText("walletProtectedText", `PFI currently stands at ${wallet.profile.pfi}/100 with live escrow protection.`);

        renderProjects(summary.liveProjects || []);
        renderTimeline(buildTrustTimeline(summary, wallet));
        renderWallet(wallet.wallet || {});
        renderActivities(summary.activities || []);

        if (summary.currentProjectId) {
            api.setCurrentProjectId(summary.currentProjectId);
        }

        let prediction;
        try {
            prediction = await api.request(`/api/trust/prediction?projectId=${encodeURIComponent(summary.currentProjectId || api.getCurrentProjectId())}`);
        } catch (_error) {
            prediction = buildPrediction(summary, wallet);
        }
        renderPrediction(prediction, wallet);
    } catch (error) {
        const container = document.getElementById("dashboardProjectsList");
        if (container) {
            container.innerHTML = `<div class="project-card"><p>${error.message}</p></div>`;
        }
    }
});
