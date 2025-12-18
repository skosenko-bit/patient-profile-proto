/* -------------------------------
   Render: Emergency Contact
-------------------------------- */
function ecEnterEdit(){
  clearSectionErrors("emergency");
  state.emergency.mode = "edit";
  state.emergency.draft = deepClone(state.emergency.saved);
  state.emergency.snapshot = deepClone(state.emergency.saved);
  renderAll();
}
function ecExitToView(){
  clearSectionErrors("emergency");
  state.emergency.mode = "view";
  state.emergency.snapshot = null;
  renderAll();
}
function ecValidate(d){
  const errors = [];
  const required = (fieldId, val)=>{ if(!String(val||"").trim()) errors.push(fieldId); };

  // Only enforce if existing OR user is trying to save some data
  const must = reqEmergencyRequired() || anyFilled(d);

  if (must){
    required("ec_name", d.name);
    // Relationship optional (per requirement)
    required("ec_address", d.address);
    required("ec_city", d.city);
    // County optional
    required("ec_state", d.state);
    required("ec_zip", d.zip);
    required("ec_cell", d.cellPhone);
  }
  return errors;
}
function ecApply(){
  const d = state.emergency.draft;
  const errs = ecValidate(d);
  if (errs.length){
    setSectionErrors("emergency", errs);
    renderAll();
    focusFirstError(errs);
    return;
  }
  clearSectionErrors("emergency");
  state.emergency.saved = deepClone(d);
  ecExitToView();
}
function ecCancel(){
  if (!isDirty("emergency")){
    ecExitToView();
    return;
  }
  openModal({
    title: "Unsaved changes",
    text: "Do you want to save changes or cancel everything?",
    buttons: [
      {label:"Save Changes", kind:"primary", onClick: ()=>ecApply()},
      {label:"Cancel Changes", kind:"", onClick: ()=>ecExitToView()}
    ]
  });
}

function ecRemove(){
  openModal({
    title: "Delete Emergency Contact",
    text: "Are you sure you want to delete Emergency Contact?",
    buttons: [
      {label:"Delete", kind:"dangerSolid", onClick: ()=>{
        clearSectionErrors("emergency");
        const cleared = emptyEmergency();
        state.emergency.saved = cleared;
        state.emergency.draft = deepClone(cleared);
        ecExitToView();
      }},
      {label:"Cancel", kind:"", onClick: ()=>{}}
    ]
  });
}

function ecRender(){
  const root = $("ecBody");
  const sec = state.emergency;

  if (sec.mode === "view"){
    const s = sec.saved;
    const filled = anyFilled(s);

    let html = "";

    if (state.patientType==="existing" && !filled){
      html += `
        <div class="banner warn">
          <div>
            <div class="k">Required for Existing patient</div>
            <div class="v">Emergency Contact is empty. Click “Edit” to fill it.</div>
          </div>
        </div>
      `;
    }

    if (!filled){
      html += kvMessage("None");
      root.innerHTML = html;
      return;
    }

    const items = [];
    pushKV(items, "Name", s.name, {showEmpty:true});
    pushKV(items, "Relationship", s.relationship, {showEmpty:true});
    pushKV(items, "Address", s.address, {showEmpty:true});
    pushKV(items, "City", s.city, {showEmpty:true});
    pushKV(items, "County", s.county, {showEmpty:true});
    pushKV(items, "State", s.state, {showEmpty:true});
    pushKV(items, "ZIP", s.zip, {showEmpty:true});
    pushKV(items, "Home phone", s.homePhone, {showEmpty:true});
    pushKV(items, "Work phone", s.workPhone, {showEmpty:true});
    pushKV(items, "Cell phone", s.cellPhone, {showEmpty:true});

    padKv(items);
    html += `<div class="kv">${items.join("")}</div>`;
    root.innerHTML = html;
    return;
  }

  const d = sec.draft;
  const must = reqEmergencyRequired() || anyFilled(d);
  const invalid = (id)=> (sec.errors || []).includes(id);
  const showRemove = anyFilled(d);

  root.innerHTML = `
    <div class="form" id="ecForm" data-show-required="${must ? "1" : "0"}">
      ${fieldInput("ec_name", "Name", true, d.name, false, "", {invalid: invalid("ec_name")})}
      ${fieldSelect("ec_rel", "Relationship", false, d.relationship, REL_OPTIONS)}
      ${fieldInput("ec_address", "Address", true, d.address, false, "", {invalid: invalid("ec_address")})}

      ${fieldInput("ec_city", "City", true, d.city, false, "", {invalid: invalid("ec_city")})}
      ${fieldInput("ec_county", "County", false, d.county)}
      ${fieldSelect("ec_state", "State", true, d.state, ["", "Texas", "Pennsylvania", "California", "New York", "Florida"], false, {invalid: invalid("ec_state")})}

      ${fieldInput("ec_zip", "ZIP", true, d.zip, false, "", {invalid: invalid("ec_zip"), filter:"digits", inputMode:"numeric"})}
      ${fieldInput("ec_home", "Home phone", false, d.homePhone, false, "", {filter:"digits", inputMode:"numeric"})}
      ${fieldInput("ec_work", "Work phone", false, d.workPhone, false, "", {filter:"digits", inputMode:"numeric"})}

      ${fieldInput("ec_cell", "Cell phone", true, d.cellPhone, false, "", {invalid: invalid("ec_cell"), filter:"digits", inputMode:"numeric"})}
      <div class="field"></div>
      <div class="field"></div>
    </div>

    <div class="footer">
      <button class="btn primary" id="ecApply" type="button">Apply</button>
      <button class="btn dangerSolid" id="ecCancel" type="button">Cancel</button>
      <button class="btn danger ${showRemove ? "" : "hidden"}" id="ecRemove" type="button">Remove Emergency Contact</button>
    </div>
  `;

  const d2 = state.emergency.draft;
  const syncRequired = ()=>{
    const form = $("ecForm");
    if (!form) return;
    const show = reqEmergencyRequired() || anyFilled(state.emergency.draft);
    form.dataset.showRequired = show ? "1" : "0";
  };

  bind("ec_name",(v)=>{ d2.name=v; renderDocs(); syncRequired(); });
  bind("ec_rel",(v)=>{ d2.relationship=v; renderDocs(); syncRequired(); });
  bind("ec_address",(v)=>{ d2.address=v; renderDocs(); syncRequired(); });
  bind("ec_city",(v)=>{ d2.city=v; renderDocs(); syncRequired(); });
  bind("ec_county",(v)=>{ d2.county=v; renderDocs(); syncRequired(); });
  bind("ec_state",(v)=>{ d2.state=v; renderDocs(); syncRequired(); });
  bind("ec_zip",(v)=>{ d2.zip=v; renderDocs(); syncRequired(); });
  bind("ec_home",(v)=>{ d2.homePhone=v; renderDocs(); syncRequired(); });
  bind("ec_work",(v)=>{ d2.workPhone=v; renderDocs(); syncRequired(); });
  bind("ec_cell",(v)=>{ d2.cellPhone=v; renderDocs(); syncRequired(); });

  $("ecApply").addEventListener("click", ecApply);
  $("ecCancel").addEventListener("click", ecCancel);
  $("ecRemove").addEventListener("click", ecRemove);
}
