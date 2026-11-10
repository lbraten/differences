import {
  createIcons,
  ArrowLeftRight,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  Columns2,
  Copy,
  FileText,
  GitCompareArrows,
  LoaderCircle,
  LockKeyhole,
  Moon,
  Plus,
  Minus,
  RotateCcw,
  Rows3,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  X,
} from "lucide";
import "./style.css";

const icons = {
  ArrowLeftRight,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  Columns2,
  Copy,
  FileText,
  GitCompareArrows,
  LoaderCircle,
  LockKeyhole,
  Moon,
  Plus,
  Minus,
  RotateCcw,
  Rows3,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  X,
};
const icon = (name, className = "") =>
  `<i data-lucide="${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}" class="${className}" aria-hidden="true"></i>`;
const tool = (id, name, label, extra = "") =>
  `<button id="${id}" class="icon-button" type="button" aria-label="${label}" data-tooltip="${label}" ${extra}>${icon(name)}</button>`;
const sampleOriginal = `# A slower kind of Sunday\n\nSome days are made for doing less.\nAn open window. A good cup of coffee.\nAnd a little room to think.\n\nOur weekend ritual:\n- Leave the phone at home\n- Find a familiar street\n- Stop somewhere for coffee\n\nNot every moment needs a plan.`;
const sampleModified = `# A slower kind of Sunday\n\nSome days are made for noticing more.\nAn open window. A really good cup of coffee.\nAnd a little room to breathe.\n\nOur weekend ritual:\n- Leave the phone at home\n- Take the scenic route\n- Stop somewhere for coffee\n- Stay a little longer\n\nNot every moment needs a plan.\nSometimes, that's the whole point.`;

document.querySelector("#app").innerHTML = `
  <header class="site-header"><div class="header-inner">
    <a class="brand" href="./" aria-label="Differences home"><span class="brand-icon">${icon("GitCompareArrows")}</span>differences<span class="brand-dot">.</span></a>
    <div class="header-actions"><span class="local-label"><span></span> LOCAL WORKSPACE</span><span class="header-divider"></span>${tool("theme", "Moon", "Switch to dark theme")}</div>
  </div></header>
  <main>
    <div class="page-heading"><div><div class="eyebrow">A FRESH LOOK AT THE DETAILS</div><h1>Text comparison<span>.</span></h1></div><button id="example" class="button subtle" type="button">${icon("RotateCcw")}Load example</button></div>
    <section class="editors" aria-label="Text inputs">
      ${["original", "modified"].map((side, index) => `<section class="editor-panel"><div class="editor-heading"><div class="editor-title"><span class="editor-index">0${index + 1}</span><label for="${side}">${index ? "Modified text" : "Original text"}</label><span class="file-name" id="${side}-file"></span></div>${tool(`${side}-import`, "Upload", `Import ${side} .txt file`)}</div><div class="editor-body"><div class="line-gutter" id="${side}-gutter" aria-hidden="true">1</div><textarea id="${side}" aria-label="${index ? "Modified text" : "Original text"}" placeholder="${index ? "Paste your revised text here..." : "Paste your original text here..."}" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off"></textarea></div><div class="editor-footer"><span id="${side}-stats">0 characters <b>·</b> 0 lines</span><span>PLAIN TEXT</span></div><input id="${side}-input" type="file" accept=".txt,text/plain" hidden /></section>`).join("")}
    </section>
    <div class="action-bar"><div class="primary-actions"><button id="compare" class="button primary" type="button">${icon("GitCompareArrows")}Compare texts${icon("ArrowRight", "button-arrow")}</button><button id="swap" class="button subtle" type="button">${icon("ArrowLeftRight")}Swap<span class="desktop-only"> texts</span></button><button id="clear" class="button subtle muted" type="button">${icon("Trash2")}Clear</button></div><label class="live-control"><input type="checkbox" id="live" checked /><span class="switch" aria-hidden="true"></span>Live comparison</label></div>
    <section class="results" aria-labelledby="result-heading">
      <div class="result-toolbar"><div class="result-title"><h2 id="result-heading">The difference</h2><span id="status" class="status-pill">Ready to compare</span></div><div class="result-controls"><div class="segmented" role="group" aria-label="Display mode"><button id="side-mode" class="selected" aria-pressed="true" type="button">${icon("Columns2")}<span>Side by side</span></button><button id="unified-mode" aria-pressed="false" type="button">${icon("Rows3")}<span>Unified</span></button></div><span class="control-divider"></span>${tool("copy", "Copy", "Copy unified diff", "disabled")}</div></div>
      <div class="summary-bar"><div id="summary" class="summary"><span class="stat added">${icon("Plus")}<strong id="added-lines">0</strong> added <span class="character-stat" id="added-chars">0 chars</span></span><span class="stat removed">${icon("Minus")}<strong id="removed-lines">0</strong> removed <span class="character-stat" id="removed-chars">0 chars</span></span><span class="stat changed"><span class="change-symbol">~</span><strong id="changed-lines">0</strong> changed <span class="character-stat" id="changed-chars">0 chars</span></span></div><label class="hide-control"><input type="checkbox" id="hide-unchanged" />Changes only</label></div>
      <div id="diff-output" class="diff-output" tabindex="0" role="region" aria-label="Comparison result" aria-busy="false"></div>
      <div class="result-footer"><span id="result-detail">Line-by-line comparison</span><span class="legend"><span class="legend-mark added">+</span> Added<span class="legend-mark removed">−</span> Removed<span class="legend-mark changed">~</span> Modified</span></div>
    </section>
    <div class="privacy-note">${icon("ShieldCheck")}<span>Your text stays in this browser and is never uploaded.</span><span class="privacy-detail">Private by design.</span></div>
  </main>
  <footer class="site-footer"><span>A little clarity goes a long way.</span><span>Made for the details<span class="footer-dot">.</span></span></footer>
  <div id="announcement" role="status" aria-live="polite" class="sr-only"></div>
  <div id="toast" class="toast" role="status" hidden></div>
`;

const get = (id) => document.getElementById(id);
const refreshIcons = () =>
  createIcons({ icons, attrs: { "stroke-width": 1.7 } });
const format = (number) => number.toLocaleString();
const inputs = { original: get("original"), modified: get("modified") };
let worker;
let generation = 0;
let result = null;
let mode = "side";
let visibleCount = 120;
let debounce;
let toastTimer;
let patchRequest = 0;
let pendingPatch = null;
const editorLineCounts = { original: 0, modified: 0 };

function notify(message) {
  get("toast").textContent = message;
  get("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    get("toast").hidden = true;
  }, 4000);
}

function makeWorker() {
  if (worker) worker.terminate();
  worker = new Worker(new URL("./worker.js", import.meta.url), {
    type: "module",
  });
  worker.onmessage = ({ data }) => {
    if (data.type === "patch") {
      if (pendingPatch && data.id === pendingPatch.id) {
        pendingPatch.resolve(data.patch);
        pendingPatch = null;
      }
      return;
    }
    if (data.type === "error" && pendingPatch && data.id === pendingPatch.id) {
      pendingPatch.reject(new Error(data.message));
      pendingPatch = null;
      return;
    }
    if (data.id !== generation) return;
    get("diff-output").setAttribute("aria-busy", "false");
    get("compare").disabled = false;
    if (data.type === "error") {
      setStatus("Comparison failed", "error");
      notify(data.message);
      return;
    }
    result = data.result;
    visibleCount = 120;
    updateSummary();
    renderResult();
    get("copy").disabled = !inputs.original.value && !inputs.modified.value;
    setStatus(
      result.identical ? "Identical texts" : "Comparison complete",
      result.identical ? "identical" : "complete",
    );
    const changes = Object.values(result.counts.lines).reduce(
      (sum, count) => sum + count,
      0,
    );
    get("announcement").textContent =
      `Comparison complete. ${changes} changed lines.`;
  };
  worker.onerror = () => {
    get("compare").disabled = false;
    get("diff-output").setAttribute("aria-busy", "false");
    setStatus("Comparison failed", "error");
    if (pendingPatch) {
      pendingPatch.reject(new Error("The comparison worker stopped."));
      pendingPatch = null;
    }
    notify("Unable to compare this text. Try a smaller section.");
  };
}

function setStatus(text, state = "") {
  get("status").textContent = text;
  get("status").className = `status-pill ${state}`;
}

function updateEditor(side) {
  const text = inputs[side].value;
  const lineCount = text ? text.split("\n").length : 0;
  editorLineCounts[side] = lineCount;
  get(`${side}-stats`).textContent =
    `${format(Array.from(text).length)} characters · ${format(lineCount)} ${lineCount === 1 ? "line" : "lines"}`;
  updateGutter(side);
}

function updateGutter(side) {
  const lineCount = editorLineCounts[side];
  const firstLine = Math.floor(inputs[side].scrollTop / 23);
  const displayedLines = Math.ceil(inputs[side].clientHeight / 23) + 2;
  get(`${side}-gutter`).textContent = Array.from(
    { length: Math.min(displayedLines, Math.max(lineCount, 1) - firstLine) },
    (_, index) => firstLine + index + 1,
  ).join("\n");
  get(`${side}-gutter`).style.transform =
    `translateY(-${inputs[side].scrollTop % 23}px)`;
}

function markPending() {
  clearTimeout(debounce);
  generation++;
  if (worker) worker.terminate();
  if (pendingPatch) {
    pendingPatch.reject(new Error("Text changed. Compare and copy again."));
    pendingPatch = null;
  }
  get("compare").disabled = false;
  get("diff-output").setAttribute("aria-busy", "false");
  get("copy").disabled = true;
  setStatus("Uncompared changes", "pending");
  if (get("live").checked) debounce = setTimeout(compare, 450);
}

function compare() {
  clearTimeout(debounce);
  if (pendingPatch) {
    pendingPatch.reject(new Error("Comparison changed. Copy the diff again."));
    pendingPatch = null;
  }
  generation++;
  makeWorker();
  get("compare").disabled = true;
  get("copy").disabled = true;
  get("diff-output").setAttribute("aria-busy", "true");
  setStatus("Comparing…", "loading");
  worker.postMessage({
    id: generation,
    original: inputs.original.value,
    modified: inputs.modified.value,
  });
}

function updateSummary() {
  for (const kind of ["added", "removed", "changed"]) {
    get(`${kind}-lines`).textContent = format(result.counts.lines[kind]);
    get(`${kind}-chars`).textContent =
      `${format(result.counts.characters[kind])} chars`;
  }
}

function makeCode(parts) {
  const code = document.createElement("span");
  code.className = "line-content";
  for (const part of parts || []) {
    const segment = document.createElement(
      part.added || part.removed ? "mark" : "span",
    );
    segment.textContent = part.value;
    if (part.added) segment.className = "inline-added";
    if (part.removed) segment.className = "inline-removed";
    code.append(segment);
  }
  return code;
}

function makeCell(row, side, unifiedKind) {
  const cell = document.createElement("div");
  const parts = side === "before" ? row.before : row.after;
  const kind =
    unifiedKind ||
    (row.kind === "changed"
      ? side === "before"
        ? "removed modified"
        : "added modified"
      : row.kind);
  cell.className = `diff-cell ${parts ? kind : "absent"}`;
  cell.setAttribute("role", "cell");
  const number = document.createElement("span");
  number.className = "line-number";
  number.textContent =
    (side === "before" ? row.oldNumber : row.newNumber) ?? "";
  if (mode === "unified") {
    number.textContent =
      unifiedKind === "equal"
        ? `${row.oldNumber}  ${row.newNumber}`
        : side === "before"
          ? `${row.oldNumber}  ·`
          : `·  ${row.newNumber}`;
  }
  const symbol = document.createElement("span");
  symbol.className = "line-symbol";
  symbol.textContent = parts
    ? kind.includes("removed")
      ? "−"
      : kind.includes("added")
        ? "+"
        : ""
    : "";
  symbol.setAttribute(
    "aria-label",
    !parts
      ? "No corresponding line"
      : row.kind === "changed"
        ? `Modified: ${side === "before" ? "original" : "replacement"}`
        : kind.includes("removed")
          ? "Removed"
          : kind.includes("added")
            ? "Added"
            : "Unchanged",
  );
  cell.append(number, symbol, makeCode(parts));
  return cell;
}

function renderResult() {
  const output = get("diff-output");
  output.replaceChildren();
  if (!result || (!inputs.original.value && !inputs.modified.value)) {
    output.innerHTML = `<div class="empty-state"><span class="empty-icon">${icon("GitCompareArrows")}</span><h3>A clean slate.</h3><p>Your next comparison starts here.</p></div>`;
    get("result-detail").textContent = "Nothing to compare yet";
    refreshIcons();
    return;
  }
  const rows = get("hide-unchanged").checked
    ? result.rows.filter((row) => row.kind !== "equal")
    : result.rows;
  if (!rows.length) {
    output.innerHTML = `<div class="empty-state"><span class="empty-icon success">${icon("CheckCheck")}</span><h3>A perfect match.</h3><p>No differences between these two texts.</p></div>`;
    get("result-detail").textContent = "Both versions are identical";
    refreshIcons();
    return;
  }
  const table = document.createElement("div");
  table.className = `diff-table ${mode}`;
  table.setAttribute("role", "table");
  table.setAttribute(
    "aria-label",
    mode === "side"
      ? "Side-by-side text differences"
      : "Unified text differences",
  );
  const heading = document.createElement("div");
  heading.className = "diff-table-heading";
  heading.setAttribute("role", "row");
  for (const label of mode === "side"
    ? ["Original text", "Modified text"]
    : ["Original / Modified"]) {
    const cell = document.createElement("div");
    cell.setAttribute("role", "columnheader");
    cell.innerHTML = `${icon("FileText")}<span>${label}</span>`;
    heading.append(cell);
  }
  table.append(heading);
  const fragment = document.createDocumentFragment();
  for (const row of rows.slice(0, visibleCount)) {
    const line = document.createElement("div");
    line.className = "diff-row";
    line.setAttribute("role", "row");
    if (mode === "side") {
      line.append(makeCell(row, "before"), makeCell(row, "after"));
      fragment.append(line);
    } else if (row.kind === "equal") {
      line.append(makeCell(row, "after", "equal"));
      fragment.append(line);
    } else {
      for (const side of ["before", "after"]) {
        if (!row[side]) continue;
        const unifiedLine = document.createElement("div");
        unifiedLine.className = "diff-row";
        unifiedLine.setAttribute("role", "row");
        unifiedLine.append(
          makeCell(row, side, side === "before" ? "removed" : "added"),
        );
        fragment.append(unifiedLine);
      }
    }
  }
  table.append(fragment);
  output.append(table);
  if (rows.length > visibleCount) {
    const load = document.createElement("button");
    load.type = "button";
    load.className = "load-more button subtle";
    load.innerHTML = `${icon("ChevronDown")}Show next ${Math.min(120, rows.length - visibleCount)} lines`;
    load.onclick = () => {
      const scroll = output.scrollTop;
      visibleCount += 120;
      renderResult();
      output.scrollTop = scroll;
    };
    output.append(load);
  }
  get("result-detail").textContent =
    `${format(Math.min(visibleCount, rows.length))} of ${format(rows.length)} ${get("hide-unchanged").checked ? "changed " : ""}lines`;
  refreshIcons();
}

for (const side of ["original", "modified"]) {
  inputs[side].addEventListener("input", () => {
    get(`${side}-file`).textContent = "";
    updateEditor(side);
    markPending();
  });
  inputs[side].addEventListener("scroll", () => updateGutter(side), {
    passive: true,
  });
  get(`${side}-import`).onclick = () => get(`${side}-input`).click();
  get(`${side}-input`).addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (!file.name.toLowerCase().endsWith(".txt"))
        throw new Error("Please choose a .txt file.");
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Please choose a text file smaller than 5 MB.");
      const text = await file.text();
      if (text.includes("\0"))
        throw new Error(
          "This appears to be a binary file. Please use a UTF-8 text file.",
        );
      inputs[side].value = text;
      get(`${side}-file`).textContent = file.name;
      updateEditor(side);
      markPending();
      notify(`${file.name} imported locally.`);
    } catch (error) {
      notify(error.message || "Could not read the file.");
    }
    event.target.value = "";
  });
}

get("compare").onclick = compare;
get("live").onchange = () => {
  if (get("live").checked) compare();
  else clearTimeout(debounce);
};
get("swap").onclick = () => {
  [inputs.original.value, inputs.modified.value] = [
    inputs.modified.value,
    inputs.original.value,
  ];
  const oldName = get("original-file").textContent;
  get("original-file").textContent = get("modified-file").textContent;
  get("modified-file").textContent = oldName;
  for (const side of ["original", "modified"]) updateEditor(side);
  compare();
};
get("clear").onclick = () => {
  clearTimeout(debounce);
  generation++;
  if (pendingPatch) {
    pendingPatch.reject(new Error("Inputs cleared."));
    pendingPatch = null;
  }
  if (worker) worker.terminate();
  for (const side of ["original", "modified"]) {
    inputs[side].value = "";
    get(`${side}-file`).textContent = "";
    updateEditor(side);
  }
  result = {
    rows: [],
    counts: {
      lines: { added: 0, removed: 0, changed: 0 },
      characters: { added: 0, removed: 0, changed: 0 },
    },
  };
  updateSummary();
  renderResult();
  get("compare").disabled = false;
  get("copy").disabled = true;
  get("diff-output").setAttribute("aria-busy", "false");
  setStatus("Ready to compare");
  inputs.original.focus();
};
get("example").onclick = () => {
  inputs.original.value = sampleOriginal;
  inputs.modified.value = sampleModified;
  for (const side of ["original", "modified"]) {
    get(`${side}-file`).textContent = "";
    updateEditor(side);
  }
  compare();
};
for (const [id, value] of [
  ["side-mode", "side"],
  ["unified-mode", "unified"],
]) {
  get(id).onclick = () => {
    mode = value;
    for (const button of ["side-mode", "unified-mode"]) {
      get(button).classList.toggle("selected", button === id);
      get(button).setAttribute("aria-pressed", String(button === id));
    }
    renderResult();
  };
}
get("hide-unchanged").onchange = () => {
  visibleCount = 120;
  renderResult();
};
get("theme").onclick = () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  const label = `Switch to ${dark ? "light" : "dark"} theme`;
  get("theme").setAttribute("aria-label", label);
  get("theme").dataset.tooltip = label;
  get("theme").innerHTML = icon(dark ? "Sun" : "Moon");
  refreshIcons();
};
get("copy").onclick = async () => {
  get("copy").disabled = true;
  try {
    let resolvePatch;
    let rejectPatch;
    const patchPromise = new Promise((resolve, reject) => {
      resolvePatch = resolve;
      rejectPatch = reject;
    });
    const id = `patch-${++patchRequest}`;
    pendingPatch = { id, resolve: resolvePatch, reject: rejectPatch };
    worker.postMessage({
      type: "patch",
      id,
      original: inputs.original.value,
      modified: inputs.modified.value,
    });
    const patch = await patchPromise;
    await navigator.clipboard.writeText(patch);
    notify("Unified diff copied to clipboard.");
  } catch (error) {
    notify(error.message || "Clipboard access was denied by your browser.");
  }
  get("copy").disabled =
    !result ||
    !["complete", "identical"].some((state) =>
      get("status").classList.contains(state),
    ) ||
    (!inputs.original.value && !inputs.modified.value);
};
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    compare();
  }
});
window.addEventListener("resize", () => {
  for (const side of ["original", "modified"]) updateGutter(side);
});
refreshIcons();
get("example").click();
