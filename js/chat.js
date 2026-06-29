document.addEventListener("DOMContentLoaded", async () => {
    const api = window.TrustFlowAPI;
    if (!api || !document.getElementById("projectMessages")) {
        return;
    }

    const status = document.getElementById("projectMessageStatus");
    const form = document.getElementById("projectMessageForm");
    const input = document.getElementById("projectMessageInput");

    let projectId = api.getCurrentProjectId();

    async function loadRoom() {
        const endpoint = projectId
            ? `/api/projects/${encodeURIComponent(projectId)}`
            : "/api/projects/current";

        const response = await api.request(endpoint);
        const room = response.project;
        projectId = room.id;
        api.setCurrentProjectId(projectId);
        renderRoom(room);
    }

    function renderRoom(room) {
        document.getElementById("projectRoomTitle").textContent = room.title;
        document.getElementById("projectRoomBudget").textContent = api.formatCurrency(room.budget);
        document.getElementById("projectRoomBudgetText").textContent = `${room.clientName} has committed the full project value into TrustFlow's protected workflow.`;
        document.getElementById("projectRoomNextRelease").textContent = api.formatCurrency(room.nextRelease);
        document.getElementById("projectRoomNextReleaseText").textContent = "The next release is controlled by approval, proof, and trust signals.";
        document.getElementById("projectRoomMilestoneCount").textContent = `${room.milestonesComplete} / ${room.milestonesTotal}`;
        document.getElementById("projectRoomMilestoneText").textContent = "Released milestones have already cleared review and payout conditions.";
        document.getElementById("projectRoomAssetsShared").textContent = String(room.assetsShared);
        document.getElementById("projectRoomAssetsText").textContent = "Assets and proof files are attached directly to the room.";
        document.getElementById("projectRoomApprovalsPending").textContent = String(room.approvalsPending);
        document.getElementById("projectRoomApprovalsText").textContent = "Pending approvals are the only blockers before the next payout.";
        document.getElementById("projectRoomConfidence").textContent = `${room.roomConfidence}%`;
        document.getElementById("projectRoomConfidenceText").textContent = "Room confidence combines delivery progress, proof quality, and trust data.";

        renderBoard("projectBoardPlanned", room.board.planned);
        renderBoard("projectBoardReview", room.board.in_review);
        renderBoard("projectBoardReleased", room.board.released);
        renderAssets(room.assets || []);
        renderPeople(room.people || []);
        renderMessages(room.messages || []);
        renderEvents(room.events || []);
    }

    function renderBoard(containerId, items) {
        const container = document.getElementById(containerId);
        container.innerHTML = "";

        items.forEach((item) => {
            const card = document.createElement("div");
            card.className = "task-card";
            card.innerHTML = `
                <h4>${item.title}</h4>
                <p>${item.detail}</p>
                <div class="detail-line spaced">
                    <span>${item.owner}</span>
                    <span>${api.formatCurrency(item.amount)}</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function renderAssets(items) {
        const container = document.getElementById("projectAssets");
        container.innerHTML = "";
        items.forEach((item) => {
            const row = document.createElement("div");
            row.className = "file-row";
            row.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                </div>
                <span class="pill-muted">${item.kind}</span>
            `;
            container.appendChild(row);
        });
    }

    function renderPeople(items) {
        const container = document.getElementById("projectPeople");
        container.innerHTML = "";
        items.forEach((item) => {
            const row = document.createElement("div");
            row.className = "member-row";
            row.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <p>${item.role}</p>
                </div>
                <span class="status-pill ${item.tone}">${item.status}</span>
            `;
            container.appendChild(row);
        });
    }

    function renderMessages(items) {
        const container = document.getElementById("projectMessages");
        container.innerHTML = "";
        items.forEach((item) => {
            const node = document.createElement("div");
            node.className = "message";
            node.innerHTML = `
                <div class="avatar">${api.initials(item.sender_name)}</div>
                <div>
                    <div class="message-meta">
                        <strong>${item.sender_name}</strong>
                        <span class="muted">${item.sender_role}</span>
                        <span class="muted">${api.formatShortTime(item.created_at)}</span>
                    </div>
                    <p>${item.body}</p>
                </div>
            `;
            container.appendChild(node);
        });
    }

    function renderEvents(items) {
        const container = document.getElementById("projectEvents");
        container.innerHTML = "";
        items.forEach((item) => {
            const node = document.createElement("div");
            node.className = "event-row";
            node.innerHTML = `
                <div>
                    <h4>${item.title}</h4>
                    <p>${item.detail}</p>
                </div>
                <span class="pill-muted">${api.formatShortTime(item.created_at)}</span>
            `;
            container.appendChild(node);
        });
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const body = input.value.trim();
        if (!body) {
            status.textContent = "Write a room update before sending.";
            return;
        }

        const session = api.getSession();
        status.textContent = "Sending message...";

        try {
            await api.request(`/api/projects/${encodeURIComponent(projectId)}/messages`, {
                method: "POST",
                body: {
                    senderName: session ? session.name : "TrustFlow Reviewer",
                    senderRole: session ? session.role : "Member",
                    message: body,
                },
            });
            input.value = "";
            status.textContent = "Message sent to the project room.";
            await loadRoom();
        } catch (error) {
            status.textContent = error.message;
        }
    });

    loadRoom().catch((error) => {
        status.textContent = error.message;
    });
});
