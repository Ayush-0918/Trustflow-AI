document.addEventListener("DOMContentLoaded", async () => {
    const api = window.TrustFlowAPI;
    if (!api || !document.getElementById("challengeType")) {
        return;
    }

    const elements = {
        challengeType: document.getElementById("challengeType"),
        challengeTypeLabel: document.getElementById("challengeTypeLabel"),
        challengeTypeHint: document.getElementById("challengeTypeHint"),
        challengeIntro: document.getElementById("challengeIntro"),
        challengeList: document.getElementById("challengeList"),
        form: document.getElementById("skillValidationForm"),
        loadDesignDemo: document.getElementById("loadDesignDemo"),
        skillResultBadge: document.getElementById("skillResultBadge"),
        skillResultRole: document.getElementById("skillResultRole"),
        skillResultScore: document.getElementById("skillResultScore"),
        skillResultTitle: document.getElementById("skillResultTitle"),
        skillResultSummary: document.getElementById("skillResultSummary"),
        badgeStatusCard: document.getElementById("badgeStatusCard"),
        badgeStatusHint: document.getElementById("badgeStatusHint"),
        verificationRateCard: document.getElementById("verificationRateCard"),
        skillScoreCard: document.getElementById("skillScoreCard"),
        pfiBoostCard: document.getElementById("pfiBoostCard"),
    };

    let currentChallenge = null;

    function setBadge(node, tone, text) {
        node.className = `badge-tag ${tone}`.trim();
        node.textContent = text;
    }

    function renderChallenge(challenge) {
        currentChallenge = challenge;
        elements.challengeTypeLabel.textContent = challenge.label;
        elements.challengeTypeHint.textContent = `AI micro-test for ${challenge.label.toLowerCase()}.`;
        elements.challengeIntro.textContent = `Passing this micro-test awards ${challenge.badgeLabel.toLowerCase()} and strengthens the Professional Fidelity Index.`;
        elements.challengeList.innerHTML = "";

        challenge.questions.forEach((question, index) => {
            const card = document.createElement("div");
            card.className = "challenge-card";
            card.innerHTML = `<h4>Question ${index + 1}</h4><p>${question.prompt}</p>`;

            const list = document.createElement("div");
            list.className = "choice-list";

            question.options.forEach((option, optionIndex) => {
                const label = document.createElement("label");
                label.className = "choice-item";
                label.innerHTML = `
                    <input type="radio" name="challenge-${index}" value="${optionIndex}">
                    <span class="choice-label">${option}</span>
                `;
                list.appendChild(label);
            });

            card.appendChild(list);
            elements.challengeList.appendChild(card);
        });
    }

    async function loadChallenge(type) {
        const response = await api.request(`/api/skills/challenge?type=${encodeURIComponent(type)}`);
        renderChallenge(response.challenge);
    }

    elements.challengeType.addEventListener("change", () => {
        loadChallenge(elements.challengeType.value).catch((error) => {
            elements.skillResultSummary.textContent = error.message;
        });
    });

    elements.loadDesignDemo.addEventListener("click", () => {
        elements.challengeType.value = "design";
        loadChallenge("design").catch((error) => {
            elements.skillResultSummary.textContent = error.message;
        });
    });

    elements.form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!currentChallenge) {
            return;
        }

        const answers = [];
        for (let index = 0; index < currentChallenge.questions.length; index += 1) {
            const checked = elements.form.querySelector(`input[name="challenge-${index}"]:checked`);
            if (!checked) {
                setBadge(elements.skillResultBadge, "warning", "Need all answers");
                elements.skillResultScore.textContent = "--";
                elements.skillResultTitle.textContent = "Assessment incomplete";
                elements.skillResultSummary.textContent = "Answer all micro-test questions so the AI can validate the freelancer's skill.";
                return;
            }
            answers.push(Number(checked.value));
        }

        try {
            const response = await api.request("/api/skills/evaluate", {
                method: "POST",
                body: {
                    challengeType: elements.challengeType.value,
                    answers,
                    projectId: api.getCurrentProjectId(),
                },
            });

            const result = response.result;
            const passed = !!result.passed;

            setBadge(elements.skillResultBadge, passed ? "success" : "danger", passed ? result.badgeLabel : "Badge withheld");
            elements.skillResultRole.textContent = result.label;
            elements.skillResultScore.textContent = `${result.score}%`;
            elements.skillResultTitle.textContent = passed ? "Verified skill badge awarded" : "Skill validation flagged for review";
            elements.skillResultSummary.textContent = result.summary;
            elements.badgeStatusCard.textContent = passed ? "Verified" : "Review required";
            elements.badgeStatusHint.textContent = passed
                ? `${result.badgeLabel} now contributes to the Trust Wallet credibility profile.`
                : "Manual review is recommended before letting the freelancer accept the project.";
            elements.verificationRateCard.textContent = `${result.score}%`;
            elements.skillScoreCard.textContent = `${result.score}/100`;
            elements.pfiBoostCard.textContent = `${result.pfiBoost >= 0 ? "+" : ""}${result.pfiBoost}`;
        } catch (error) {
            elements.skillResultSummary.textContent = error.message;
        }
    });

    loadChallenge(elements.challengeType.value).catch((error) => {
        elements.skillResultSummary.textContent = error.message;
    });
});
