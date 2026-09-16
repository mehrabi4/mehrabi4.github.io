const Font = Quill.import("formats/font");
Font.whitelist = ["serif", "mono", "grotesk", "typewriter"];
Quill.register(Font, true);

const titleInput = document.querySelector("[data-title]");
const slugInput = document.querySelector("[data-slug]");
const saveState = document.querySelector(".save-state");
const saveStatus = document.querySelector("[data-save-status]");
const importInput = document.querySelector("[data-import-file]");
const previewDialog = document.querySelector("[data-preview-dialog]");
const previewTitle = document.querySelector("[data-preview-title]");
const previewBody = document.querySelector("[data-preview-body]");
const toast = document.querySelector("[data-toast]");

const toolbar = {
  container: "#toolbar",
  handlers: {
    formula() {
      const formula = window.prompt("Enter a LaTeX equation, for example: E = mc^2");
      if (!formula) return;

      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "formula", formula, "user");
      quill.insertText(range.index + 1, " ", "user");
      quill.setSelection(range.index + 2, 0, "silent");
    },
    image() {
      const picker = document.createElement("input");
      picker.type = "file";
      picker.accept = "image/png,image/jpeg,image/webp,image/gif";
      picker.addEventListener("change", () => {
        const file = picker.files?.[0];
        if (!file) return;

        if (file.size > 8 * 1024 * 1024) {
          showToast("That image is larger than 8 MB. Resize it first, then try again.");
          return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, "image", reader.result, "user");
          quill.setSelection(range.index + 1, 0, "silent");
        });
        reader.readAsDataURL(file);
      });
      picker.click();
    },
  },
};

const quill = new Quill("#editor", {
  modules: { toolbar },
  placeholder: "Write what you are trying to understand…",
  theme: "snow",
});

let slugWasEdited = false;
let saveTimer;
let toastTimer;
let currentCreatedAt = new Date().toISOString();

const database = new Promise((resolve, reject) => {
  const request = indexedDB.open("concept-studio", 1);
  request.addEventListener("upgradeneeded", () => {
    if (!request.result.objectStoreNames.contains("drafts")) {
      request.result.createObjectStore("drafts");
    }
  });
  request.addEventListener("success", () => resolve(request.result));
  request.addEventListener("error", () => reject(request.error));
});

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getDraft() {
  const updatedAt = new Date().toISOString();
  return {
    format: "mehrabi4-concept-draft",
    version: 1,
    title: titleInput.value.trim(),
    slug: slugify(slugInput.value),
    createdAt: currentCreatedAt,
    updatedAt,
    delta: quill.getContents(),
    html: quill.getSemanticHTML(),
    plainText: quill.getText().trim(),
  };
}

async function writeDraft(draft) {
  const db = await database;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("drafts", "readwrite");
    transaction.objectStore("drafts").put(draft, "current");
    transaction.addEventListener("complete", resolve);
    transaction.addEventListener("error", () => reject(transaction.error));
  });
}

async function readDraft() {
  const db = await database;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("drafts", "readonly");
    const request = transaction.objectStore("drafts").get("current");
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

function setSaveState(label, className = "") {
  saveStatus.textContent = label;
  saveState.classList.remove("is-saving", "is-error");
  if (className) saveState.classList.add(className);
}

async function saveNow() {
  setSaveState("saving…", "is-saving");
  try {
    await writeDraft(getDraft());
    setSaveState("saved locally");
  } catch (error) {
    console.error(error);
    setSaveState("could not save", "is-error");
    showToast("Autosave failed. Export the draft now so your writing is not lost.");
  }
}

function queueSave() {
  setSaveState("unsaved", "is-saving");
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveNow, 650);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

function applyDraft(draft) {
  if (!draft || draft.format !== "mehrabi4-concept-draft" || !draft.delta) {
    throw new Error("Unsupported draft file");
  }

  titleInput.value = draft.title || "";
  slugInput.value = draft.slug || "";
  currentCreatedAt = draft.createdAt || new Date().toISOString();
  slugWasEdited = Boolean(draft.slug);
  quill.setContents(draft.delta, "silent");
  queueSave();
}

titleInput.addEventListener("input", () => {
  if (!slugWasEdited) slugInput.value = slugify(titleInput.value);
  queueSave();
});

slugInput.addEventListener("input", () => {
  slugWasEdited = true;
  const cursor = slugInput.selectionStart;
  slugInput.value = slugify(slugInput.value);
  slugInput.setSelectionRange(cursor, cursor);
  queueSave();
});

quill.on("text-change", (_delta, _oldDelta, source) => {
  if (source === "user") queueSave();
});

document.querySelector("[data-export]").addEventListener("click", async () => {
  await saveNow();
  const draft = getDraft();
  const fileName = `${draft.slug || "untitled-concept"}.concept-draft.json`;
  const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${fileName}. Attach it in our chat and say “publish this.”`);
});

document.querySelector("[data-import]").addEventListener("click", () => importInput.click());

importInput.addEventListener("change", async () => {
  const file = importInput.files?.[0];
  if (!file) return;

  try {
    applyDraft(JSON.parse(await file.text()));
    showToast(`Imported ${file.name}.`);
  } catch (error) {
    console.error(error);
    showToast("That file is not a valid concept studio draft.");
  } finally {
    importInput.value = "";
  }
});

document.querySelector("[data-new]").addEventListener("click", () => {
  const hasWriting = titleInput.value.trim() || quill.getText().trim().length > 0;
  if (hasWriting && !window.confirm("Start a new draft? Your current draft will remain available only if you exported it.")) {
    return;
  }

  titleInput.value = "";
  slugInput.value = "";
  slugWasEdited = false;
  currentCreatedAt = new Date().toISOString();
  quill.setText("", "silent");
  queueSave();
  titleInput.focus();
});

document.querySelector("[data-preview]").addEventListener("click", () => {
  previewTitle.textContent = titleInput.value.trim() || "untitled concept";
  previewBody.innerHTML = quill.getSemanticHTML();
  previewDialog.showModal();
});

document.querySelector("[data-preview-close]").addEventListener("click", () => previewDialog.close());
previewDialog.addEventListener("click", (event) => {
  if (event.target === previewDialog) previewDialog.close();
});

window.addEventListener("beforeunload", () => {
  window.clearTimeout(saveTimer);
  writeDraft(getDraft()).catch(() => {});
});

async function initialize() {
  try {
    const saved = await readDraft();
    if (saved) {
      applyDraft(saved);
      setSaveState("restored local draft");
    } else {
      await saveNow();
    }
  } catch (error) {
    console.error(error);
    setSaveState("autosave unavailable", "is-error");
  }
}

initialize();
