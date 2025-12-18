/* -------------------------------
   Render: Informal Support
-------------------------------- */
function isEnterEdit(){
  clearSectionErrors("informal");
  state.informal.mode = "edit";
  state.informal.draft = deepClone(state.informal.saved);
  state.informal.snapshot = deepClone(state.informal.saved);
  renderAll();
}
function isExitToView(){
  clearSectionErrors("informal");
  state.informal.mode = "view";
  state.informal.snapshot = null;
  renderAll();
}
function isValidate(d){
  const errors = [];
  const required = (fieldId, val)=>{ if(!String(val||"").trim()) errors.push(fieldId); };

  if (reqInformalSelection()){
    required("is_selection", d.selection);
  }
  if (d.selection === "add"){
    required("is_name", d.name);
    required("is_address", d.address);
    required("is_zip", d.zip);
    required("is_city", d.city);
    // County optional (per requirement)
    required("is_state", d.state);
    required("is_cell", d.cellPhone);
  }
  return errors;
}
function isApply(){
  const d = state.informal.draft;
  const errs = isValidate(d);
  if (errs.length){
    setSectionErrors("informal", errs);
    renderAll();
    focusFirstError(errs);
    return;
  }
  clearSectionErrors("informal");
  state.informal.saved = deepClone(d);
  isExitToView();
}
function isCancel(){
  if (!isDirty("informal")){
    isExitToView();
    return;
  }
  openModal({
    title: "Unsaved changes",
    text: "Do you want to save changes or cancel everything?",
    buttons: [
      {label:"Save Changes", kind:"primary", onClick: ()=>isApply()},
      {label:"Cancel Changes", kind:"", onClick: ()=>isExitToView()}
    ]
  });
}

function isRender(){
  const root = $("isBody");
  const sec = state.informal;

  if (sec.mode === "view"){
    const s = sec.saved;
    const hasSelection = !!s.selection;
    const hasAny = hasSelection || anyFilled(s);

    let html = "";

    if (state.patientType==="existing" && !hasSelection){
      html += `
        <div class="banner warn">
          <div>
            <div class="k">Required for Existing patient</div>
            <div class="v">You must select one option (Add Informal Support / Refuse Agency Staffing / Agency Staffing).</div>
          </div>
        </div>
      `;
    }

    if (!hasAny){
      html += kvMessage("None");
      root.innerHTML = html;
      return;
    }

    const items = [];
    pushKV(items, "Selection", selectionLabel(s.selection));
    if (s.selection === "add"){
      pushKV(items, "Name", s.name, {showEmpty:true});
      pushKV(items, "Address", s.address, {showEmpty:true});
      pushKV(items, "ZIP", s.zip, {showEmpty:true});
      pushKV(items, "City", s.city, {showEmpty:true});
      pushKV(items, "County", s.county, {showEmpty:true});
      pushKV(items, "State", s.state, {showEmpty:true});
      pushKV(items, "Home phone", s.homePhone, {showEmpty:true});
      pushKV(items, "Work phone", s.workPhone, {showEmpty:true});
      pushKV(items, "Cell phone", s.cellPhone, {showEmpty:true});
      padKv(items);
      html += `<div class="kv">${items.join("")}</div>`;
      root.innerHTML = html;
      return;
    }
    // One-wide for non-person selections
    html += `<div class="kv kv1">${items.join("")}</div>`;
    root.innerHTML = html;
    return;
  }

  // Edit
  const d = sec.draft;
  const invalid = (id)=> (sec.errors || []).includes(id);
  const selInvalid = invalid("is_selection");

  root.innerHTML = `
    <div class="banner">
      <div>
        <div class="v">Select whether a patient has Informal Support person, agrees or refuses agency staffing. If you choose ‘Person’, enter their contact info.</div>
      </div>
    </div>

    <div class="field ${selInvalid ? "invalid" : ""}" id="is_selection_field" tabindex="-1" style="margin-bottom:12px">
      <div class="label">Selection ${reqInformalSelection() ? `<span class="req">*</span>` : ``}</div>
      <div class="radios" role="radiogroup" aria-label="Informal Support selection">
        ${radio("is_sel_add", "Selection", "add", d.selection, "Add Informal Support")}
        ${radio("is_sel_refuse", "Selection", "refuse", d.selection, "Refuse Agency Staffing")}
        ${radio("is_sel_agency", "Selection", "agency", d.selection, "Agency Staffing")}
      </div>
    </div>

    ${d.selection === "add" ? `
      <div class="form">
        ${fieldInput("is_name", "Name", true, d.name, false, "", {invalid: invalid("is_name")})}
        ${fieldInput("is_address", "Address", true, d.address, false, "", {invalid: invalid("is_address")})}
        ${fieldInput("is_zip", "ZIP", true, d.zip, false, "", {invalid: invalid("is_zip"), filter:"digits", inputMode:"numeric"})}

        ${fieldInput("is_city", "City", true, d.city, false, "", {invalid: invalid("is_city")})}
        ${fieldInput("is_county", "County", false, d.county)}
        ${fieldSelect("is_state", "State", true, d.state, ["", "Texas", "Pennsylvania", "California", "New York", "Florida"], false, {invalid: invalid("is_state")})}

        ${fieldInput("is_home", "Home phone", false, d.homePhone, false, "", {filter:"digits", inputMode:"numeric"})}
        ${fieldInput("is_work", "Work phone", false, d.workPhone, false, "", {filter:"digits", inputMode:"numeric"})}
        ${fieldInput("is_cell", "Cell phone", true, d.cellPhone, false, "", {invalid: invalid("is_cell"), filter:"digits", inputMode:"numeric"})}
      </div>
    ` : ``}

    <div class="footer">
      <button class="btn primary" id="isApply" type="button">Apply</button>
      <button class="btn dangerSolid" id="isCancel" type="button">Cancel</button>
    </div>
  `;

  const hasAddFields = ()=>{
    const d3 = state.informal.draft;
    return [
      "name","address","zip","city","county","state","homePhone","workPhone","cellPhone"
    ].some((k)=> String(d3[k] || "").trim());
  };

  function setSelection(sel){
    clearSectionErrors("informal");
    const d3 = state.informal.draft;
    const from = d3.selection;
    const leavingAdd = from === "add" && sel !== "add";
    if (leavingAdd && hasAddFields()){
      // Re-render to restore the previous checked state before showing the modal
      renderAll();
      openModal({
        title: "Change selection",
        text: `Are you sure you want to change to ${selectionLabel(sel)}? This action will clear all the fields`,
        buttons: [
          {label:"Accept", kind:"dangerSolid", onClick: ()=>{
            clearSectionErrors("informal");
            d3.selection = sel;
            d3.name = "";
            d3.address = "";
            d3.zip = "";
            d3.city = "";
            d3.county = "";
            d3.state = "";
            d3.homePhone = "";
            d3.workPhone = "";
            d3.cellPhone = "";
            renderAll();
          }},
          {label:"Cancel", kind:"", onClick: ()=>{}}
        ]
      });
      return;
    }

    d3.selection = sel;
    if (sel !== "add"){
      d3.name = "";
      d3.address = "";
      d3.zip = "";
      d3.city = "";
      d3.county = "";
      d3.state = "";
      d3.homePhone = "";
      d3.workPhone = "";
      d3.cellPhone = "";
    }
    renderAll();
  }

  // Wire radios
  $("is_sel_add").addEventListener("change", ()=> setSelection("add"));
  $("is_sel_refuse").addEventListener("change", ()=> setSelection("refuse"));
  $("is_sel_agency").addEventListener("change", ()=> setSelection("agency"));

  // Wire fields
  const d2 = state.informal.draft;
  bind("is_name",(v)=>{ d2.name=v; renderDocs(); });
  bind("is_address",(v)=>{ d2.address=v; renderDocs(); });
  bind("is_zip",(v)=>{ d2.zip=v; renderDocs(); });
  bind("is_city",(v)=>{ d2.city=v; renderDocs(); });
  bind("is_county",(v)=>{ d2.county=v; renderDocs(); });
  bind("is_state",(v)=>{ d2.state=v; renderDocs(); });
  bind("is_home",(v)=>{ d2.homePhone=v; renderDocs(); });
  bind("is_work",(v)=>{ d2.workPhone=v; renderDocs(); });
  bind("is_cell",(v)=>{ d2.cellPhone=v; renderDocs(); });

  $("isApply").addEventListener("click", isApply);
  $("isCancel").addEventListener("click", isCancel);
}

function selectionLabel(sel){
  if (sel==="add") return "Add Informal Support";
  if (sel==="refuse") return "Refuse Agency Staffing";
  if (sel==="agency") return "Agency Staffing";
  return "";
}
