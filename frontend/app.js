const listEl = document.getElementById("item-list");
const form = document.getElementById("add-form");
const addBtn = document.getElementById("add-btn");
const toastEl = document.getElementById("toast");
const skeletonEl = document.getElementById("skeleton");

let toastTimer = null;

function showToast(message, type) {
    toastEl.textContent = message;
    toastEl.className = "toast " + type;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
}

async function api(path, options = {}) {
    const res = await fetch(path, options);
    const body = await res.json().catch(() => ({ message: "Invalid JSON from server" }));
    if (!res.ok) throw new Error(body.message || `Request failed (${res.status})`);
    return body;
}

async function loadItems() {
    skeletonEl.hidden = false;
    listEl.style.display = "none";
    try {
        const body = await api("/api/items");
        render(body.data.items);
    } catch (err) {
        render([]);
        showToast(err.message, "err");
    } finally {
        skeletonEl.hidden = true;
        listEl.style.display = "";
    }
}

function render(items) {
    listEl.innerHTML = "";
    if (!items.length) {
        const li = document.createElement("li");
        li.className = "empty";
        li.textContent = "No items yet. Add one above.";
        listEl.appendChild(li);
        return;
    }
    items.forEach((item, index) => {
        const li = document.createElement("li");
        li.style.animationDelay = `${index * 70}ms`;

        const name = document.createElement("span");
        name.className = "item-name";
        name.textContent = item.name;

        const side = document.createElement("span");
        side.className = "item-side";

        const price = document.createElement("span");
        price.className = "item-price";
        price.textContent = `$${Number(item.price).toFixed(2)}`;

        const del = document.createElement("button");
        del.className = "btn-delete";
        del.dataset.id = item.id;
        del.title = "Delete item";
        del.textContent = "✕";

        side.append(price, del);
        li.append(name, side);
        listEl.appendChild(li);
    });
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const item = { name: form.name.value.trim(), price: Number(form.price.value) };
    if (!item.name) return;

    addBtn.disabled = true;
    addBtn.classList.add("loading");
    try {
        await api("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
        });
        form.reset();
        form.name.focus();
        showToast("Item added", "ok");
        await loadItems();
    } catch (err) {
        showToast(err.message, "err");
    } finally {
        addBtn.disabled = false;
        addBtn.classList.remove("loading");
    }
});

listEl.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;

    const li = button.closest("li");
    li.classList.add("removing");
    await new Promise((resolve) => setTimeout(resolve, 360));

    try {
        await api("/api/items/" + button.dataset.id, { method: "DELETE" });
        showToast("Item deleted", "ok");
        await loadItems();
    } catch (err) {
        li.classList.remove("removing");
        showToast(err.message, "err");
    }
});

loadItems();
