/* -------------------------------
   Render all + events
-------------------------------- */
function renderAll(){
  // Edit buttons disabled while in edit? (keep simple: allow switching sections, but it can be confusing)
  $("pcEditBtn").textContent = state.primary.mode==="edit" ? "Editing…" : "Edit";
  $("isEditBtn").textContent = state.informal.mode==="edit" ? "Editing…" : "Edit";
  $("caEditBtn").textContent = state.candAssign.mode==="edit" ? "Editing…" : "Edit";
  $("daEditBtn").textContent = state.dcwAssign.mode==="edit" ? "Editing…" : "Edit";
  $("ecEditBtn").textContent = state.emergency.mode==="edit" ? "Editing…" : "Edit";

  $("pcEditBtn").disabled = state.primary.mode==="edit";
  $("isEditBtn").disabled = state.informal.mode==="edit";
  $("caEditBtn").disabled = state.candAssign.mode==="edit";
  $("daEditBtn").disabled = state.dcwAssign.mode==="edit";
  $("ecEditBtn").disabled = state.emergency.mode==="edit";

  pcRender();
  isRender();
  ecRender();
  caRender();
  daRender();
  renderDocs();

  syncClearButtons();
  syncPrimaryRemoveButton();
  syncEmergencyRemoveButton();
}

function syncPrimaryRemoveButton(){
  const btn = $("pcRemove");
  if (!btn) return;
  btn.classList.toggle("hidden", !anyFilled(state.primary.draft));
}

function syncEmergencyRemoveButton(){
  const btn = $("ecRemove");
  if (!btn) return;
  btn.classList.toggle("hidden", !anyFilled(state.emergency.draft));
}

function syncFromTarget(target){
  if (!(target instanceof HTMLElement)) return;
  if (target.matches("input[type=radio]") && target.getAttribute("name")==="Selection"){
    clearErrorByFieldId("is_selection");
    target.closest(".field")?.classList.remove("invalid");
  }
  if (target.matches("input, select") && target.id){
    syncClearButton(target.id);
    syncPrimaryRemoveButton();
    syncEmergencyRemoveButton();
    clearErrorByFieldId(target.id);
    target.closest(".field")?.classList.remove("invalid");
  }
}

document.addEventListener("input", (e)=> syncFromTarget(e.target));
document.addEventListener("change", (e)=> syncFromTarget(e.target));
document.addEventListener("click", (e)=>{
  const btn = e.target.closest?.(".xbtn");
  if (!btn) return;
  if (btn.dataset.kind === "typeahead") return;
  const id = btn.id || "";
  if (!id.endsWith("_x")) return;
  const fieldId = id.slice(0, -2);
  const el = $(fieldId);
  if (!el || el.disabled) return;
  el.value = "";
  el.dispatchEvent(new Event("input", {bubbles:true}));
  el.dispatchEvent(new Event("change", {bubbles:true}));
  el.focus?.();
});

function setSpecsCollapsed(collapsed){
  document.body.classList.toggle("specsCollapsed", !!collapsed);
  const btn = $("specToggleBtn");
  if (btn){
    btn.textContent = collapsed ? "Show Specs" : "Hide Specs";
    btn.setAttribute("aria-pressed", collapsed ? "true" : "false");
  }
  try{
    localStorage.setItem("specsCollapsed", collapsed ? "1" : "0");
  } catch {}
}

let suppressSpecsAccordion = false;
function setupSpecsAccordion(){
  const items = Array.from(document.querySelectorAll(".specs details.spec"));
  if (!items.length) return;
  items.forEach((d)=>{
    d.addEventListener("toggle", ()=>{
      if (suppressSpecsAccordion || !d.open) return;
      items.forEach((other)=>{
        if (other !== d) other.open = false;
      });
    });
  });
}

$("btnReferral").addEventListener("click", ()=>setPatientType("referral"));
$("btnExisting").addEventListener("click", ()=>setPatientType("existing"));

$("pcEditBtn").addEventListener("click", pcEnterEdit);
$("isEditBtn").addEventListener("click", isEnterEdit);
$("daEditBtn").addEventListener("click", daEnterEdit);
$("caEditBtn").addEventListener("click", caEnterEdit);
$("ecEditBtn").addEventListener("click", ecEnterEdit);

$("specToggleBtn").addEventListener("click", ()=>{
  setSpecsCollapsed(!document.body.classList.contains("specsCollapsed"));
});

function setAllSpecsOpen(open){
  suppressSpecsAccordion = true;
  document.querySelectorAll(".specs details.spec").forEach((d)=>{ d.open = !!open; });
  suppressSpecsAccordion = false;
}

$("specCollapseAllBtn")?.addEventListener("click", ()=> setAllSpecsOpen(false));

let initialSpecsCollapsed = false;
try{
  initialSpecsCollapsed = localStorage.getItem("specsCollapsed") === "1";
} catch {}
setSpecsCollapsed(initialSpecsCollapsed);
setupSpecsAccordion();

// initial render
renderAll();

// Keep view-mode borders consistent when viewport changes columns
let resizeRaf = null;
window.addEventListener("resize", ()=>{
  if (resizeRaf) return;
  resizeRaf = requestAnimationFrame(()=>{
    resizeRaf = null;
    renderAll();
  });
});
