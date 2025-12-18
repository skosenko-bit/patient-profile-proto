/* -------------------------------
   Clear-X for non-typeahead fields
-------------------------------- */
function syncClearButton(fieldId){
  const el = $(fieldId);
  const btn = $(fieldId + "_x");
  if (!el || !btn) return;
  if (btn.dataset.kind === "typeahead") return;
  const show = !el.disabled && String(el.value||"").trim().length>0;
  btn.classList.toggle("show", show);
}
function syncClearButtons(){
  document.querySelectorAll(".xbtn").forEach((btn)=>{
    if (btn.dataset.kind === "typeahead") return;
    const id = btn.id || "";
    if (!id.endsWith("_x")) return;
    syncClearButton(id.slice(0, -2));
  });
}

