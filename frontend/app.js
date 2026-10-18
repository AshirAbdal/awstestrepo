const listEl = document.getElementById("item-list");
const statusEl = document.getElementById("status");
const form = document.getElementById("add-form");

function setStatus(message, type) {
    statusEl.textContent = message || "";
    statusEl.className = "status " + (type || "");
}

async function api(path, options = {}) {
    const res = await fetch(path, options);
    const body = await res.json().catch(() => ({ message: "Invalid JSON from server" }));
    if (!res.ok) throw new Error(body.message || `Request failed (${res.status})`);
    return body;
}

async function loadItems() {
    const body = await api("/api/items");
    render(body.data.items);
}

function render(items) {
    listEl.innerHTML = "";
    if (!items.length) {
        listEl.innerHTML = '<li class="empty">No items yet. Add one above.</li>';
        return;
    }
    items.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML =
            `<span>${escapeHtml(item.name)}</span>` +
            `<span><span class="price">$${Number(item.price).toFixed(2)}</span>` +
            `<button data-id="${item.id}">Delete</button></span>`;
        listEl.appendChild(li);
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const item = { name: form.name.value.trim(), price: Number(form.price.value) };
    if (!item.name) return;
    try {
        await api("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
        });
        form.reset();
        setStatus("Item added", "ok");
        await loadItems();
    } catch (err) {
        setStatus(err.message, "error");
    }
});

listEl.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    try {
        await api("/api/items/" + button.dataset.id, { method: "DELETE" });
        setStatus("Item deleted", "ok");
        await loadItems();
    } catch (err) {
        setStatus(err.message, "error");
    }
});

loadItems().catch((err) => setStatus(err.message, "error"));
