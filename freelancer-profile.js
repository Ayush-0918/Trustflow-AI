document.addEventListener("DOMContentLoaded", async () => {
    const api = window.TrustFlowAPI;
    if (!api || !document.getElementById("profileName")) {
        return;
    }

    function setText(id, value) {
        const node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function setClassTone(node, baseClass, tone) {
        if (!node) {
            return;
        }
        node.className = `${baseClass} ${tone}`.trim();
    }

    function toneFromRisk(scan, score) {
        if (scan?.risk_tone === "danger" || score < 60) return "danger";
        if (scan?.risk_tone === "warning" || score < 80) return "warning";
        return "success";
    }

    function behaviorLabel(scan) {
        if (!scan) return "Pending";
        if (scan.risk_tone === "success") return "Stable";
        if (scan.risk_tone === "warning") return "Watchlist";
        return "Warning";
    }

    function trustTier(score) {
        if (score >= 90) return "Elite Freelancer";
        if (score >= 75) return "Verified Operator";
        if (score >= 60) return "Watchlisted";
        return "High Risk";
    }

    function makeTimelineItem(item) {
        const icon = item.icon || (item.tone === "danger" ? "!" : "✓");
        return `
            <div class="trust-timeline-item">
                <div class="trust-timeline-icon ${item.tone}">${icon}</div>
                <div class="trust-timeline-copy">
                    <div class="row-between">
                        <h4>${item.title}</h4>
                        <span class="status-pill ${item.tone}">${item.status}</span>
                    </div>
                    <p>${item.detail}</p>
                    <div class="trust-timeline-meta">
                        <span>${item.meta || "TrustFlow event"}</span>
                    </div>
                </div>
            </div>
        `;
    }

    function renderTimeline(id, items) {
        const root = document.getElementById(id);
        if (!root) {
            return;
        }
        root.innerHTML = items.map(makeTimelineItem).join("");
    }

    function renderHistory(items) {
        const root = document.getElementById("profileTrustHistory");
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

    try {
        const response = await api.request(`/api/wallet/summary?projectId=${encodeURIComponent(api.getCurrentProjectId())}`);
        const profile = response.profile || {};
        const wallet = response.wallet || {};
        const latestSkill = response.latestSkillTest || null;
        const latestScan = response.latestVideoScan || null;

        const score = profile.trustScore || 0;
        const pfi = profile.pfi || 0;
        const behavior = behaviorLabel(latestScan);
        const tone = toneFromRisk(latestScan, score);
        const escrowState = latestScan?.risk_tone === "success"
            ? "Released"
            : (wallet.trustHold || 0) > 0
                ? "On Hold"
                : "Ready";
        const skillState = latestSkill
            ? latestSkill.passed ? "Passed" : "Review"
            : "Pending";

        setText("profileSidebarTrust", String(score));
        setText("profileName", profile.name || "Freelancer");
        setText("profileTitle", profile.title || "Frontend engineer and product-minded freelancer");
        setText("profileAvatar", api.initials(profile.name || "Freelancer"));

        setText("profileHeroTrustScore", String(score));
        setText("profileHeroProjects", String(profile.projectsCompleted || 0));
        setText("profileHeroSkill", skillState);
        setText("profileHeroBehavior", behavior);

        setText("profileTrustMeterScore", `${score} / 100`);
        setText("profileTrustTier", trustTier(score));
        setText("trustProfileScore", String(score));
        setText("trustProfileProjects", String(profile.projectsCompleted || 0));
        setText("trustProfileSkill", skillState);
        setText("trustProfilePFI", String(pfi));
        setText("trustProfileBehavior", behavior);

        setText("profileSummaryScore", String(score));
        setText("profileSummaryProjects", String(profile.projectsCompleted || 0));
        setText("profileSummarySkill", skillState);
        setText("profileSummaryBehavior", behavior);
        setText("profileSummaryPFI", String(pfi));

        setText("profileTrustHold", api.formatCurrency(wallet.trustHold || 0));
        setText("profileEscrowState", escrowState);

        const riskTitle = latestScan?.warning_title
            || "TrustFlow currently sees a stable freelancer profile.";
        const riskText = latestScan?.warning_message
            || "Escrow can proceed under normal rules because recent behavior and skill signals look healthy.";
        setText("profileRiskTitle", riskTitle);
        setText("profileRiskText", riskText);
        setText("profileAlertTitle", riskTitle);
        setText("profileAlertBody", riskText);

        setText("trustProfileBehavior", behavior);
        setText("profileTrustMeterScore", `${score} / 100`);
        setText("profileTrustTier", trustTier(score));

        const riskBadge = document.getElementById("profileRiskBadge");
        if (riskBadge) {
            riskBadge.className = `badge-tag ${tone}`;
            riskBadge.textContent = tone === "success" ? "Safe" : tone === "warning" ? "Warning" : "Risk";
        }

        const alertBanner = document.getElementById("profileAlertBanner");
        if (alertBanner) {
            alertBanner.className = `alert-banner ${tone}`;
        }

        const ring = document.getElementById("profileTrustRing");
        if (ring) {
            ring.className = `trust-ring ${tone}`;
            ring.style.setProperty("--progress", String(score));
        }

        const primaryBadge = document.getElementById("profilePrimaryBadge");
        if (primaryBadge) {
            primaryBadge.className = `badge-tag ${tone === "danger" ? "danger" : tone === "warning" ? "warning" : "success"}`;
            primaryBadge.textContent = trustTier(score);
        }

        const skillChip = document.getElementById("profileSkillChip");
        if (skillChip) {
            skillChip.className = `badge-tag ${latestSkill?.passed ? "success" : latestSkill ? "warning" : "warning"}`;
            skillChip.textContent = latestSkill?.passed
                ? latestSkill.badge_label || latestSkill.badgeLabel || "Skill Test Passed"
                : latestSkill
                    ? "Skill review required"
                    : "Skill test pending";
        }

        const behaviorChip = document.getElementById("profileBehaviorChip");
        if (behaviorChip) {
            behaviorChip.className = `badge-tag ${tone}`;
            behaviorChip.textContent = latestScan
                ? latestScan.risk_tone === "success"
                    ? "AI behavior stable"
                    : latestScan.risk_tone === "warning"
                        ? "Behavior watchlist"
                        : "Behavior warning"
                : "Behavior scan pending";
        }

        const profileTimeline = [
            {
                tone: latestSkill?.passed ? "success" : "warning",
                status: latestSkill?.passed ? "Passed" : latestSkill ? "Review" : "Pending",
                title: latestSkill?.passed ? "Skill Test Passed" : "Skill Test Pending",
                detail: latestSkill?.passed
                    ? `${latestSkill.badge_label || latestSkill.badgeLabel || "Verified badge"} strengthened assignment confidence.`
                    : latestSkill
                        ? latestSkill.summary
                        : "Run the AI micro-test before project acceptance to verify capability.",
                meta: "Capability validation",
            },
            {
                tone: "success",
                status: "Delivered",
                title: "Milestone Delivered",
                detail: `${profile.projectsCompleted || 0} completed projects and strong milestone consistency support this freelancer profile.`,
                meta: "Delivery history",
            },
            {
                tone: wallet.ready > 0 ? "success" : "warning",
                status: wallet.ready > 0 ? "Approved" : "Waiting",
                title: "Client Approval",
                detail: wallet.ready > 0
                    ? `${api.formatCurrency(wallet.ready)} is ready for release once the trust rules confirm the payout posture.`
                    : "The latest client approval is still pending before the next release can move.",
                meta: "Approval workflow",
            },
            {
                tone,
                status: behavior,
                title: latestScan?.risk_tone === "danger" ? "Behavior Warning" : "AI Behavior Rating",
                detail: latestScan?.summary || "Behavioral trust scan has not been run yet for this freelancer.",
                meta: "Live call analysis",
            },
            {
                tone: escrowState === "Released" ? "success" : escrowState === "On Hold" ? "warning" : "warning",
                status: escrowState,
                title: escrowState === "Released" ? "Escrow Released" : "Escrow Review",
                detail: escrowState === "Released"
                    ? "Escrow can move because skill, behavior, and milestone signals currently look healthy."
                    : `Escrow still keeps ${api.formatCurrency(wallet.trustHold || 0)} protected until the trust posture improves.`,
                meta: "Escrow intelligence",
            },
        ];

        const activityItems = (response.events || []).map((item) => ({
            tone: /flag|risk|warning|hold/i.test(item.title + item.detail)
                ? "warning"
                : /pass|cleared|initialized|awarded/i.test(item.title + item.detail)
                    ? "success"
                    : "warning",
            status: /flag|risk|warning|hold/i.test(item.title + item.detail) ? "Warning" : "Live",
            title: item.title,
            detail: item.detail,
            meta: "Backend wallet event",
        }));

        renderTimeline("profileTrustTimeline", profileTimeline);
        renderTimeline("profileTrustActivity", activityItems.length ? activityItems : profileTimeline.slice(0, 3));
        renderHistory(response.history);
    } catch (error) {
        setText("profileRiskText", error.message);
        setText("profileAlertBody", error.message);
    }
});
