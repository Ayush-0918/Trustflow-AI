document.addEventListener("DOMContentLoaded", async () => {
    const api = window.TrustFlowAPI;
    if (!api) {
        return;
    }

    const view = {
        verification: document.getElementById("trustRiskCardValue"),
        liveCall: document.getElementById("liveRiskBadge"),
    };

    if (!view.verification && !view.liveCall) {
        return;
    }

    const fallbackTranscripts = {
        suspicious: [
            { speaker: "Jane Smith", text: "Can you still deliver the revised milestone by Friday?", time: "00:42" },
            { speaker: "Arjun Dev", text: "Yes... I should be able to, if the integration does not shift again.", time: "00:57" },
            { speaker: "TrustFlow AI", text: "Confidence dropped when the deadline commitment was repeated.", time: "01:04" },
        ],
        warning: [
            { speaker: "Jane Smith", text: "Do we need one more review step before the next payout is released?", time: "00:42" },
            { speaker: "Arjun Dev", text: "Probably one quick proof pass. The milestone is mostly done, but I want to confirm the export edge cases.", time: "00:57" },
            { speaker: "TrustFlow AI", text: "Signals are mixed. TrustFlow recommends review rather than a full hold or instant release.", time: "01:04" },
        ],
        healthy: [
            { speaker: "Jane Smith", text: "Can you still deliver the revised milestone by Friday?", time: "00:42" },
            { speaker: "Arjun Dev", text: "Yes. The dashboard is complete, QA proof is uploaded, and export states are already covered.", time: "00:57" },
            { speaker: "TrustFlow AI", text: "Signals remain stable across ownership, scope, and delivery questions.", time: "01:04" },
        ],
    };

    const localScenarios = {
        suspicious: {
            participant_name: "Arjun Dev",
            participant_role: "Freelancer",
            risk_label: "Elevated",
            risk_tone: "danger",
            voice_stress: 71,
            facial_consistency: 54,
            confidence_level: 46,
            commitment_signal: 41,
            pattern_score: 3,
            escrow_action: "Hold",
            summary: "System detected hesitation around timeline commitment and delivery confidence.",
            warning_title: "AI detected uncertainty in project commitment.",
            warning_message: "Recommendation: keep escrow locked and request a milestone-level reaffirmation before the next release.",
            highlights: [
                {
                    title: "Commitment hesitation",
                    body: "Delay increased when the caller was asked if the Friday deadline was realistic.",
                },
                {
                    title: "Facial mismatch",
                    body: "Expression confidence dropped while verbally affirming milestone ownership.",
                },
                {
                    title: "Stress cue",
                    body: "Voice tension rose when payment release terms were repeated.",
                },
            ],
        },
        healthy: {
            participant_name: "Arjun Dev",
            participant_role: "Freelancer",
            risk_label: "Low",
            risk_tone: "success",
            voice_stress: 24,
            facial_consistency: 91,
            confidence_level: 89,
            commitment_signal: 92,
            pattern_score: 0,
            escrow_action: "Proceed",
            summary: "Signals look stable and the caller appears confident about ownership, scope, and delivery.",
            warning_title: "AI confirms stable project commitment.",
            warning_message: "Recommendation: proceed with milestone approval and keep the wallet on normal release settings.",
            highlights: [
                {
                    title: "Clear ownership",
                    body: "The caller answered timeline and deliverable questions without contradiction.",
                },
                {
                    title: "Confidence stability",
                    body: "Facial and vocal signals remained aligned during milestone review.",
                },
                {
                    title: "Release readiness",
                    body: "The AI intermediary found no strong reason to extend the escrow hold.",
                },
            ],
        },
        warning: {
            participant_name: "Arjun Dev",
            participant_role: "Freelancer",
            risk_label: "Watchlist",
            risk_tone: "warning",
            voice_stress: 48,
            facial_consistency: 68,
            confidence_level: 63,
            commitment_signal: 59,
            pattern_score: 1,
            escrow_action: "Review",
            summary: "Signals are mixed and the next release should wait for one more proof checkpoint.",
            warning_title: "AI detected mild delivery uncertainty.",
            warning_message: "Recommendation: request a proof update and keep the next release partially protected until commitment stabilizes.",
            highlights: [
                {
                    title: "Minor hesitation",
                    body: "Response timing slowed when revision scope and final delivery timing were discussed.",
                },
                {
                    title: "Partial confidence mismatch",
                    body: "Facial confidence softened during one answer about deployment sequencing.",
                },
                {
                    title: "Escrow caution",
                    body: "Signals justify an extra review checkpoint before the payout can move.",
                },
            ],
        },
    };

    let projectId = api.getCurrentProjectId();
    let sessionData = null;
    let speakingTimer = null;

    function setScenarioState(scenario) {
        const judgeStatus = document.getElementById("judgeModeStatus");
        const tone = scenario === "healthy" ? "success" : scenario === "warning" ? "warning" : "danger";
        const label = scenario === "healthy" ? "Safe demo" : scenario === "warning" ? "Warning demo" : "Risk demo";
        if (judgeStatus) {
            judgeStatus.className = `status-pill ${tone}`;
            judgeStatus.textContent = label;
        }
        document.querySelectorAll(".scenario-card").forEach((node) => {
            node.classList.toggle("active", node.dataset.scenario === scenario);
        });
    }

    function toneClass(tone) {
        if (tone === "success") return "success";
        if (tone === "danger") return "danger";
        return "warning";
    }

    function trustTier(score) {
        if (score >= 90) return "Elite Freelancer";
        if (score >= 75) return "Verified Operator";
        if (score >= 60) return "Watchlist";
        return "High Risk";
    }

    function setText(id, value) {
        const node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function setBadge(id, className, text) {
        const node = document.getElementById(id);
        if (!node) {
            return;
        }
        node.className = className;
        node.textContent = text;
    }

    function renderTranscript(items) {
        const transcriptRoot = document.getElementById("liveTranscript");
        if (!transcriptRoot) {
            return;
        }

        transcriptRoot.innerHTML = "";
        items.forEach((item) => {
            const row = document.createElement("li");
            row.innerHTML = `<strong>${item.speaker}</strong>${item.text}<span>${item.time}</span>`;
            transcriptRoot.appendChild(row);
        });
    }

    function makeTimelineItem(item) {
        return `
            <div class="trust-timeline-item">
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
            </div>
        `;
    }

    function renderTrustActivity(scan, wallet) {
        const root = document.getElementById("liveTrustActivity");
        if (!root) {
            return;
        }

        const latestSkill = wallet?.latestSkillTest || null;
        const items = [
            {
                tone: latestSkill?.passed ? "success" : latestSkill ? "warning" : "warning",
                icon: latestSkill?.passed ? "✓" : "!",
                status: latestSkill?.passed ? "Passed" : latestSkill ? "Review" : "Pending",
                title: latestSkill?.passed ? "Skill Test Passed" : "Skill Test Pending",
                detail: latestSkill?.passed
                    ? `${latestSkill.badge_label || latestSkill.badgeLabel || "Verified skill badge"} now supports this live call trust score.`
                    : latestSkill
                        ? latestSkill.summary
                        : "Run the skill test to strengthen assignment confidence before release.",
                meta: "Capability signal",
            },
            {
                tone: scan.risk_tone === "success" ? "success" : "danger",
                icon: scan.risk_tone === "success" ? "✓" : "!",
                status: scan.risk_tone === "success" ? "Stable" : "Warning",
                title: scan.risk_tone === "success" ? "AI Behavior Stable" : "Behavior Warning",
                detail: scan.warning_title,
                meta: "Live call behavior",
            },
            {
                tone: scan.risk_tone === "success" ? "success" : "warning",
                icon: scan.risk_tone === "success" ? "✓" : "!",
                status: scan.risk_tone === "success" ? "Released" : "Hold",
                title: scan.risk_tone === "success" ? "Escrow Released" : "Escrow Hold",
                detail: scan.risk_tone === "success"
                    ? "TrustFlow can allow the next payout because the call remained stable."
                    : "TrustFlow keeps the next payout protected until commitment is reconfirmed.",
                meta: "Escrow decision",
            },
            {
                tone: "success",
                icon: "✓",
                status: "Live",
                title: "Client and Freelancer Connected",
                detail: "Both parties remain visible on one screen while the AI intermediary monitors trust.",
                meta: "Dual-camera session",
            },
        ];

        root.innerHTML = items.map(makeTimelineItem).join("");
    }

    function meterTone(score, scanTone) {
        if (scanTone === "danger" || score < 60) return "danger";
        if (scanTone === "warning" || score < 80) return "warning";
        return "safe";
    }

    function updateTrustMeter(score, scanTone) {
        const ring = document.getElementById("liveTrustRing");
        if (!ring) {
            return;
        }

        const tone = meterTone(score, scanTone);
        ring.className = `trust-ring ${tone}`;
        ring.style.setProperty("--progress", String(score));
        setText("liveTrustMeterScore", `${score} / 100`);
        setText("liveTrustTier", trustTier(score));
        setText(
            "liveRiskSystemTitle",
            tone === "safe"
                ? "Trust level is safe and ready for action."
                : tone === "warning"
                    ? "Trust level needs attention before payout."
                    : "High risk detected in the call."
        );
        setText(
            "liveRiskSystemBody",
            tone === "safe"
                ? "Green = Safe. TrustFlow sees stable behavior, strong confidence, and low payout risk."
                : tone === "warning"
                    ? "Yellow = Warning. TrustFlow sees caution signals and may keep escrow partially protected."
                    : "Red = Risk. TrustFlow detected commitment instability and recommends holding the next release."
        );
    }

    function setSpeakingState(activeSpeaker) {
        const clientCard = document.getElementById("clientCameraStage")?.closest(".video-feed-card");
        const freelancerCard = document.getElementById("freelancerCameraStage")?.closest(".video-feed-card");
        const clientState = document.getElementById("clientTalkState");
        const freelancerState = document.getElementById("freelancerTalkState");

        if (clientCard) {
            clientCard.classList.toggle("is-speaking", activeSpeaker === "client");
        }
        if (freelancerCard) {
            freelancerCard.classList.toggle("is-speaking", activeSpeaker === "freelancer");
        }

        if (clientState) {
            clientState.className = `talk-state ${activeSpeaker === "client" ? "live" : ""}`.trim();
            clientState.textContent = activeSpeaker === "client" ? "Talking" : "Listening";
        }
        if (freelancerState) {
            freelancerState.className = `talk-state ${activeSpeaker === "freelancer" ? "live" : ""}`.trim();
            freelancerState.textContent = activeSpeaker === "freelancer" ? "Talking" : "Listening";
        }
    }

    function startSpeakingLoop(scenario) {
        if (speakingTimer) {
            window.clearInterval(speakingTimer);
        }

        const sequence = scenario === "healthy"
            ? ["client", "freelancer", "client", "freelancer"]
            : scenario === "warning"
                ? ["client", "freelancer", "client", "freelancer", "freelancer"]
                : ["client", "freelancer", "freelancer", "client"];

        let index = 0;
        setSpeakingState(sequence[index]);
        speakingTimer = window.setInterval(() => {
            index = (index + 1) % sequence.length;
            setSpeakingState(sequence[index]);
        }, 1700);
    }

    async function startDualCameraFeeds() {
        const clientVideo = document.getElementById("clientCamera");
        const freelancerVideo = document.getElementById("freelancerCamera");
        const clientStage = document.getElementById("clientCameraStage");
        const freelancerStage = document.getElementById("freelancerCameraStage");

        if (!clientVideo || !freelancerVideo || !navigator.mediaDevices?.getUserMedia) {
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false,
            });

            clientVideo.srcObject = stream;
            freelancerVideo.srcObject = stream.clone();
            clientStage?.classList.add("ready");
            freelancerStage?.classList.add("ready");
            setText("clientConnectionState", "Client camera live");
            setText("freelancerConnectionState", "Freelancer camera live");
        } catch (_error) {
            setBadge("clientConnectionState", "camera-badge warning", "Camera unavailable");
            setBadge("freelancerConnectionState", "camera-badge warning", "Demo remote feed");
        }
    }

    function hydrateSession(session) {
        sessionData = session || null;
        if (session?.projectId) {
            projectId = session.projectId;
            api.setCurrentProjectId(projectId);
        }

        if (document.getElementById("callParticipant")) {
            const participant = (session?.participants || [])[1] || {};
            setText("callParticipant", participant.name || "Freelancer");
            setText("callProject", `${participant.role || "Freelancer"} on ${session?.projectTitle || "TrustFlow Demo Call"} milestone review.`);
        }

        if (document.getElementById("liveCallProjectTitle")) {
            const employer = (session?.participants || [])[0] || {};
            const freelancer = (session?.participants || [])[1] || {};
            setText("liveCallProjectTitle", session?.projectTitle || "TrustFlow Live Call");
            setText("employerName", employer.name || "Jane Smith");
            setText("employerRole", employer.role || "Employer");
            setText("freelancerName", freelancer.name || "Arjun Dev");
            setText("freelancerRole", freelancer.role || "Freelancer");
            setText("clientFeedMeta", "Client reviewing delivery proof, milestone clarity, and release readiness.");
            setText("freelancerFeedMeta", "Freelancer responding to deadline, scope, and commitment questions in the live call.");
            renderTranscript(session?.transcript || []);
        }
    }

    function renderVerificationScan(scan) {
        if (!view.verification || !scan) {
            return;
        }

        setText("trustRiskCardValue", scan.risk_label);
        setText("trustRiskSummary", scan.summary);
        setText("callParticipant", scan.participant_name || "Freelancer");
        setText("callProject", `${scan.participant_role || "Freelancer"} on ${(sessionData && sessionData.projectTitle) || "TrustFlow Demo Call"} milestone review.`);

        const callState = document.getElementById("callState");
        if (callState) {
            callState.className = `status-pill ${toneClass(scan.risk_tone)}`;
            callState.textContent = scan.risk_tone === "success" ? "Verification cleared" : "Warning active";
        }

        const warningBanner = document.getElementById("warningBanner");
        if (warningBanner) {
            warningBanner.className = `alert-banner ${toneClass(scan.risk_tone)} spaced`;
        }

        setText("warningTitle", scan.warning_title);
        setText("warningMessage", scan.warning_message);
        setText("callStage", scan.risk_tone === "success" ? "Stable commitment signals confirmed" : "Scanning live trust signals");
        setScenarioState(scan.scenario || (scan.risk_tone === "success" ? "healthy" : scan.risk_tone === "warning" ? "warning" : "suspicious"));

        const metricMap = [
            ["voiceStress", scan.voice_stress],
            ["facial", scan.facial_consistency],
            ["confidence", scan.confidence_level],
            ["commitment", scan.commitment_signal],
        ];

        metricMap.forEach(([prefix, value]) => {
            const valueNode = document.getElementById(`${prefix}Value`);
            const fillNode = document.getElementById(`${prefix}Fill`);
            const cardNode = document.getElementById(`${prefix}CardValue`);
            const fillTone = prefix === "voiceStress"
                ? (value > 65 ? "danger" : "safe")
                : (value >= 75 ? "safe" : value >= 55 ? "warning" : "danger");

            if (valueNode) valueNode.textContent = `${value}%`;
            if (cardNode) cardNode.textContent = `${value}%`;
            if (fillNode) {
                fillNode.className = `bar-fill ${fillTone}`;
                fillNode.style.width = `${value}%`;
            }
        });

        setText("patternScore", String(scan.pattern_score));
        setText(
            "patternSummary",
            scan.pattern_score > 0
                ? `${scan.pattern_score} high-risk inconsistencies appeared during commitment questions.`
                : "No meaningful risk inconsistencies appeared during this review call.",
        );
        setText("escrowAction", scan.escrow_action);
        setText(
            "escrowSummary",
            scan.risk_tone === "success"
                ? "The next micro-payout can proceed because the trust layer remained stable."
                : "The next micro-payout remains locked until the participant reconfirms scope and deadline.",
        );

        const highlights = document.getElementById("callHighlights");
        if (highlights) {
            highlights.innerHTML = "";
            (scan.highlights || []).forEach((item) => {
                const li = document.createElement("li");
                li.innerHTML = `<strong>${item.title}</strong>${item.body}`;
                highlights.appendChild(li);
            });
        }
    }

    function renderLiveScan(scan, wallet) {
        if (!view.liveCall || !scan) {
            return;
        }

        setBadge("liveRiskBadge", `badge-tag ${toneClass(scan.risk_tone)}`, scan.risk_label);
        setText("liveWarningTitle", scan.warning_title);
        setText("liveWarningText", scan.warning_message);

        setText("liveSignalVoice", `${scan.voice_stress}%`);
        setText("liveSignalFace", `${scan.facial_consistency}%`);
        setText("liveSignalConfidence", `${scan.confidence_level}%`);
        setText("liveSignalCommitment", `${scan.commitment_signal}%`);
        setText("liveEscrowAction", scan.escrow_action);

        const trustScore = wallet?.profile?.trustScore ?? (scan.risk_tone === "success" ? 94 : 82);
        const pfi = wallet?.profile?.pfi ?? (scan.risk_tone === "success" ? 91 : 78);
        const hold = wallet?.wallet?.trustHold ?? (scan.risk_tone === "success" ? 900 : 2200);

        setText("liveTrustScore", `${trustScore}/100`);
        setText("livePFI", `${pfi}/100`);
        setText("liveTrustHold", api.formatCurrency(hold));

        updateTrustMeter(trustScore, scan.risk_tone);
        renderTrustActivity(scan, wallet || {});

        const transcript = (
            sessionData?.transcript
            || fallbackTranscripts[scan.risk_tone === "success" ? "healthy" : scan.risk_tone === "warning" ? "warning" : "suspicious"]
        ).slice();
        transcript.push({
            speaker: "TrustFlow AI",
            text: scan.warning_title,
            time: "01:22",
        });
        renderTranscript(transcript);

        startSpeakingLoop(scan.risk_tone === "success" ? "healthy" : scan.risk_tone === "warning" ? "warning" : "suspicious");
    }

    function renderScan(scan, wallet) {
        renderVerificationScan(scan);
        renderLiveScan(scan, wallet);
        localStorage.setItem("trustflowBehaviorAnalysis", JSON.stringify(scan));
    }

    async function loadWalletSummary() {
        if (!projectId) {
            return null;
        }
        try {
            return await api.request(`/api/wallet/summary?projectId=${encodeURIComponent(projectId)}`);
        } catch (_error) {
            return null;
        }
    }

    async function loadSession() {
        const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
        try {
            const response = await api.request(`/api/video/session${query}`);
            hydrateSession(response.session);
            if (response.session?.latestScan) {
                const wallet = await loadWalletSummary();
                renderScan(response.session.latestScan, wallet);
                return true;
            }
            return false;
        } catch (_error) {
            hydrateSession({
                projectId,
                projectTitle: "TrustFlow Demo Call",
                participants: [
                    { name: "Jane Smith", role: "Client" },
                    { name: "Arjun Dev", role: "Freelancer" },
                ],
                transcript: fallbackTranscripts.suspicious,
            });
            return false;
        }
    }

    async function runScan(scenario) {
        try {
            const response = await api.request("/api/video/analyze", {
                method: "POST",
                body: {
                    scenario,
                    projectId,
                },
            });
            renderScan(response.scan, response.wallet);
            return;
        } catch (_error) {
            const fallbackWallet = {
                profile: {
                    trustScore: scenario === "healthy" ? 95 : scenario === "warning" ? 88 : 82,
                    pfi: scenario === "healthy" ? 94 : scenario === "warning" ? 86 : 79,
                },
                wallet: {
                    trustHold: scenario === "healthy" ? 1200 : scenario === "warning" ? 1700 : 2200,
                },
                latestSkillTest: scenario === "healthy"
                    ? { passed: true, badgeLabel: "Verified Frontend Skill" }
                    : null,
            };
            renderScan(localScenarios[scenario] || localScenarios.suspicious, fallbackWallet);
        }
    }

    const suspiciousButtons = [
        document.getElementById("runSuspiciousScan"),
        document.getElementById("callModeSuspicious"),
    ].filter(Boolean);

    const healthyButtons = [
        document.getElementById("runHealthyScan"),
        document.getElementById("callModeHealthy"),
        document.getElementById("judgeScenarioSafe"),
    ].filter(Boolean);
    const warningButtons = [
        document.getElementById("runWarningScan"),
        document.getElementById("callModeWarning"),
        document.getElementById("judgeScenarioWarning"),
    ].filter(Boolean);
    const riskButtons = [
        document.getElementById("judgeScenarioRisk"),
    ].filter(Boolean);

    suspiciousButtons.forEach((button) => {
        button.addEventListener("click", () => {
            runScan("suspicious");
        });
    });

    riskButtons.forEach((button) => {
        button.addEventListener("click", () => {
            runScan("suspicious");
        });
    });

    warningButtons.forEach((button) => {
        button.addEventListener("click", () => {
            runScan("warning");
        });
    });

    healthyButtons.forEach((button) => {
        button.addEventListener("click", () => {
            runScan("healthy");
        });
    });

    await startDualCameraFeeds();
    const hadLatestScan = await loadSession();
    if (!hadLatestScan) {
        setScenarioState("suspicious");
        renderScan(localScenarios.suspicious, {
            profile: {
                trustScore: 84,
                pfi: 81,
            },
            wallet: {
                trustHold: 1650,
            },
            latestSkillTest: null,
        });
    }
});
