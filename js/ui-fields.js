/* -------------------------------
   Common UI helpers
-------------------------------- */
function pushKV(arr, k, v, {showEmpty=false} = {}){
  const val = String(v ?? "").trim();
  if (!val && !showEmpty) return;
  const display = val || "–";
  const muted = val ? "" : "muted";
  arr.push(`
    <div class="item">
      <div class="k">${escapeHtml(k)}</div>
      <div class="v ${muted}">${escapeHtml(display)}</div>
    </div>
  `);
}
function kvColumns(){
  if (window.matchMedia?.("(max-width: 620px)")?.matches) return 1;
  if (window.matchMedia?.("(max-width: 900px)")?.matches) return 2;
  return 3;
}
function padKv(items){
  const cols = kvColumns();
  const mod = items.length % cols;
  if (!mod) return;
  const missing = cols - mod;
  for (let i = 0; i < missing; i++){
    items.push(`<div class="item blank" aria-hidden="true"></div>`);
  }
}

function kvMessage(message){
  return `
    <div class="kv kv1 kvMsg">
      <div class="item">
        <div class="k"></div>
        <div class="v muted">${escapeHtml(message)}</div>
      </div>
    </div>
  `;
}
function fieldInput(id, label, required, value, disabled=false, help="", opts={}){
  const {
    fieldClass="",
    controlClass="",
    invalid=false,
    type="",
    inputMode="",
    autocomplete="",
    placeholder="",
    filter="",
    maxlength=""
  } = opts || {};
  const req = required ? `<span class="req">*</span>` : "";
  const h = help ? `<div class="help">${escapeHtml(help)}</div>` : "";
  const extraAttrs = [
    type ? `type="${escapeAttr(type)}"` : "",
    inputMode ? `inputmode="${escapeAttr(inputMode)}"` : "",
    autocomplete ? `autocomplete="${escapeAttr(autocomplete)}"` : "",
    placeholder ? `placeholder="${escapeAttr(placeholder)}"` : "",
    filter ? `data-filter="${escapeAttr(filter)}"` : "",
    maxlength !== "" ? `maxlength="${escapeAttr(String(maxlength))}"` : ""
  ].filter(Boolean).join(" ");
  return `
    <div class="field ${escapeAttr(fieldClass)} ${invalid ? "invalid" : ""}">
      <div class="label">${escapeHtml(label)} ${req}</div>
      <div class="control ${escapeAttr(controlClass)}">
        <input class="withX" id="${id}" value="${escapeAttr(value||"")}" ${extraAttrs} ${disabled ? "disabled":""} ${invalid ? "aria-invalid=\"true\"" : ""} />
        <button class="xbtn" id="${id}_x" type="button" aria-label="Clear">×</button>
        <div class="typeahead" id="${id}_list"></div>
      </div>
      ${h}
    </div>
  `;
}
function fieldTypeahead(id, label, required, value, helpLine="", showHelp=true, opts={}){
  const {
    fieldClass="",
    controlClass="",
    invalid=false,
    type="",
    inputMode="",
    autocomplete="",
    placeholder="",
    filter="",
    maxlength=""
  } = opts || {};
  const req = required ? `<span class="req">*</span>` : "";
  const help = showHelp ? `<div class="help">${escapeHtml(helpLine || "*To create a new record press Enter")}</div>` : "";
  const extraAttrs = [
    type ? `type="${escapeAttr(type)}"` : "",
    inputMode ? `inputmode="${escapeAttr(inputMode)}"` : "",
    autocomplete ? `autocomplete="${escapeAttr(autocomplete)}"` : "",
    placeholder ? `placeholder="${escapeAttr(placeholder)}"` : "",
    filter ? `data-filter="${escapeAttr(filter)}"` : "",
    maxlength !== "" ? `maxlength="${escapeAttr(String(maxlength))}"` : ""
  ].filter(Boolean).join(" ");
  return `
    <div class="field ${escapeAttr(fieldClass)} ${invalid ? "invalid" : ""}">
      <div class="label">${escapeHtml(label)} ${req}</div>
      <div class="control ${escapeAttr(controlClass)}">
        <input class="withX" id="${id}" value="${escapeAttr(value||"")}" ${extraAttrs} ${invalid ? "aria-invalid=\"true\"" : ""} />
        <button class="xbtn" id="${id}_x" type="button" aria-label="Clear">×</button>
        <div class="typeahead" id="${id}_list"></div>
      </div>
      ${help}
    </div>
  `;
}
function fieldSelect(id, label, required, value, options, disabled=false, opts={}){
  const {fieldClass="", controlClass="", invalid=false} = opts || {};
  const req = required ? `<span class="req">*</span>` : "";
  const optionHtml = options.map(o => `<option value="${escapeAttr(o)}" ${o===value?"selected":""}>${escapeHtml(o||"Select")}</option>`).join("");
  return `
    <div class="field ${escapeAttr(fieldClass)} ${invalid ? "invalid" : ""}">
      <div class="label">${escapeHtml(label)} ${req}</div>
      <div class="control ${escapeAttr(controlClass)}">
        <select class="withX" id="${id}" ${disabled ? "disabled":""} ${invalid ? "aria-invalid=\"true\"" : ""}>${optionHtml}</select>
        <button class="xbtn selectX" id="${id}_x" type="button" aria-label="Clear">×</button>
        <div class="typeahead" id="${id}_list"></div>
      </div>
    </div>
  `;
}
function radio(id, name, value, current, label){
  const active = value === current ? "active" : "";
  const checked = value === current ? "checked" : "";
  // star shown once near hint; keep label clean
  return `
    <label class="radio ${active}">
      <input type="radio" id="${id}" name="${name}" value="${value}" ${checked} />
      ${escapeHtml(label)}
    </label>
  `;
}
function bind(id, onChange){
  const el = $(id);
  if (!el) return;
  const handler = ()=>{
    let v = el.value;
    const filter = el.dataset.filter || "";
    if (filter){
      const sanitized = sanitizeByFilter(filter, v);
      if (sanitized !== v){
        v = sanitized;
        el.value = sanitized;
      }
    }
    onChange(v);
  };
  el.addEventListener("input", handler);
  el.addEventListener("change", handler);
}
