/* -------------------------------
   Render: Primary Caregiver
-------------------------------- */
const REL_OPTIONS = [
  "", "Recipient self", "Spouse", "Significant other", "Child", "Grandchild",
  "Sister / Brother", "Friend", "Parent", "DCW", "Next of Kin",
  "Power of attorney", "Court-appointed Guardian"
];

function pcEnterEdit(){
  clearSectionErrors("primary");
  state.primary.mode = "edit";
  state.primary.draft = deepClone(state.primary.saved);
  state.primary.snapshot = deepClone(state.primary.saved);
  renderAll();
}
function pcExitToView(){
  clearSectionErrors("primary");
  state.primary.mode = "view";
  state.primary.snapshot = null;
  renderAll();
}
function pcValidate(d){
  const errors = [];
  const required = (fieldId, val)=>{ if(!String(val||"").trim()) errors.push(fieldId); };

  required("pc_name", d.name);
  required("pc_rel", d.relationship);

  if (reqAddressPrimary()) required("pc_address", d.address);

  const email = String(d.email || "").trim();
  if (email && !isValidEmail(email)) errors.push("pc_email");

  required("pc_zip", d.zip);
  required("pc_city", d.city);
  required("pc_county", d.county);
  required("pc_state", d.state);
  required("pc_cell", d.cellPhone);

  return errors;
}
function pcApply(){
  const d = state.primary.draft;

  const errs = pcValidate(d);
  if (errs.length){
    setSectionErrors("primary", errs);
    renderAll();
    focusFirstError(errs);
    return;
  }

  clearSectionErrors("primary");
  const toSave = deepClone(d);
  toSave.noCaregiver = false;
  state.primary.saved = toSave;

  pcExitToView();
}
function pcCancel(){
  if (!isDirty("primary")){
    pcExitToView();
    return;
  }
  openModal({
    title: "Unsaved changes",
    text: "Do you want to save changes or cancel everything?",
    buttons: [
      {label:"Save Changes", kind:"primary", onClick: ()=>pcApply()},
      {label:"Cancel Changes", kind:"", onClick: ()=>pcExitToView()}
    ]
  });
}
function pcRemove(){
  openModal({
    title: "Remove Primary Caregiver",
    text: "Do you want to remove Primary Caregiver?",
    buttons: [
      {label:"Remove", kind:"dangerSolid", onClick: ()=>{
        clearSectionErrors("primary");
        const cleared = emptyPrimary();
        cleared.noCaregiver = true;
        state.primary.saved = cleared;
        state.primary.draft = deepClone(cleared);
        pcExitToView();
      }},
      {label:"Cancel", kind:"", onClick: ()=>{}}
    ]
  });
}

function pcRender(){
  const root = $("pcBody");
  const sec = state.primary;

  if (sec.mode === "view"){
    const saved = sec.saved;
    const filled = anyFilled(saved);
    const noneSaved = saved.noCaregiver && !filled;
    let html = "";

    if (state.patientType==="existing" && !filled && !noneSaved){
      html += `
        <div class="banner warn">
          <div>
            <div class="k">Required for Existing patient</div>
            <div class="v">Primary Caregiver is empty. Click “Edit” to fill it.</div>
          </div>
        </div>
      `;
    }

    if (!filled){
      html += kvMessage("None");
      root.innerHTML = html;
      return;
    }

    // View mode hides empty fields
    const items = [];
    pushKV(items, "Name", saved.name, {showEmpty:true});
    pushKV(items, "Email", saved.email, {showEmpty:true});
    pushKV(items, "Relationship", saved.relationship, {showEmpty:true});
    pushKV(items, "Address", saved.address, {showEmpty:true});
    pushKV(items, "ZIP", saved.zip, {showEmpty:true});
    pushKV(items, "City", saved.city, {showEmpty:true});
    pushKV(items, "County", saved.county, {showEmpty:true});
    pushKV(items, "State", saved.state, {showEmpty:true});
    pushKV(items, "Home phone", saved.homePhone, {showEmpty:true});
    pushKV(items, "Work phone", saved.workPhone, {showEmpty:true});
    pushKV(items, "Cell phone", saved.cellPhone, {showEmpty:true});

    padKv(items);
    html += `<div class="kv">${items.join("")}</div>`;
    root.innerHTML = html;
    return;
  }

  // Edit mode
  const d = sec.draft;
  const showRemove = anyFilled(d);
  const invalid = (id)=> (sec.errors || []).includes(id);

  root.innerHTML = `
    <div class="banner">
      <div>
      <div class="v">Start by entering a name or email. You can select an existing DCW contact, or enter new information to add a Primary Caregiver</div>
      </div>
    </div>

    <div class="form">
      ${fieldTypeahead("pc_name", "Name", true, d.name, "", false, {invalid: invalid("pc_name")})}
      ${fieldInput("pc_email", "Email", false, d.email, d.lockEmail ? true : false, "", {invalid: invalid("pc_email"), type:"email", autocomplete:"email", filter:"email"})}
      ${fieldSelect("pc_rel", "Relationship", true, d.relationship, REL_OPTIONS, false, {invalid: invalid("pc_rel")})}

      ${fieldInput("pc_address", "Address", reqAddressPrimary(), d.address, false, "", {invalid: invalid("pc_address")})}
      ${fieldInput("pc_zip", "ZIP", true, d.zip, false, "", {invalid: invalid("pc_zip"), filter:"digits", inputMode:"numeric"})}
      ${fieldInput("pc_city", "City", true, d.city, false, "", {invalid: invalid("pc_city")})}

      ${fieldInput("pc_county", "County", true, d.county, false, "", {invalid: invalid("pc_county")})}
      ${fieldSelect("pc_state", "State", true, d.state, ["", "Texas", "Pennsylvania", "California", "New York", "Florida"], false, {invalid: invalid("pc_state")})}
      ${fieldInput("pc_home", "Home phone", false, d.homePhone, false, "", {filter:"digits", inputMode:"numeric"})}

      ${fieldInput("pc_work", "Work phone", false, d.workPhone, false, "", {filter:"digits", inputMode:"numeric"})}
      ${fieldInput("pc_cell", "Cell phone", true, d.cellPhone, false, "", {invalid: invalid("pc_cell"), filter:"digits", inputMode:"numeric"})}
      <div class="field"></div>
    </div>

    <div class="footer">
      <button class="btn primary" id="pcApply" type="button">Apply</button>
      <button class="btn dangerSolid" id="pcCancel" type="button">Cancel</button>
      <button class="btn danger ${showRemove ? "" : "hidden"}" id="pcRemove" type="button">Remove Primary Caregiver</button>
    </div>
  `;

  // Wire inputs
  bindPCInputs();
  $("pcApply").addEventListener("click", pcApply);
  $("pcCancel").addEventListener("click", pcCancel);
  $("pcRemove").addEventListener("click", pcRemove);

  // Typeahead setup for Name (DCW attach)
  setupTypeahead({
    inputId: "pc_name",
    listId: "pc_name_list",
    xId: "pc_name_x",
    getValue: ()=>state.primary.draft.name,
    setValue: (v)=>{
      state.primary.draft.name = v;
      if (anyFilled(state.primary.draft)) state.primary.draft.noCaregiver = false;
      renderDocs();
    },
    onPick: (dcw)=>{
      // Attach DCW and auto-fill fields
      clearSectionErrors("primary");
      state.primary.draft.noCaregiver = false;
      state.primary.draft.lockEmail = true;
      state.primary.draft.dcwId = dcw.id;
      state.primary.draft.name = dcw.fullName;
      state.primary.draft.email = dcw.email;
      state.primary.draft.address = dcw.address;
      state.primary.draft.zip = dcw.zip;
      state.primary.draft.city = dcw.city;
      state.primary.draft.county = dcw.county;
      state.primary.draft.state = dcw.state;
      state.primary.draft.homePhone = dcw.homePhone;
      state.primary.draft.workPhone = dcw.workPhone;
      state.primary.draft.cellPhone = dcw.cellPhone;
      renderAll();
    },
    onEnterNoPick: ()=>{
      // create new record: keep typed name; dcwId null
      clearSectionErrors("primary");
      if (String(state.primary.draft.name||"").trim()) state.primary.draft.noCaregiver = false;
      state.primary.draft.dcwId = null;
      state.primary.draft.lockEmail = false;
      renderAll();
    },
    onClear: ()=>{
      // If DCW selected -> confirm modal clears all fields
      const hasDCW = !!state.primary.draft.dcwId;
      const doClear = ()=>{
        clearSectionErrors("primary");
        state.primary.draft = emptyPrimary();
        renderAll();
      };
      if (hasDCW){
        openModal({
          title: "Clear selected DCW",
          text: "Are you sure you want to clear selected DCW? This action will clear all the fields",
          buttons: [
            {label:"Proceed", kind:"dangerSolid", onClick: doClear},
            {label:"Cancel", kind:"", onClick: ()=>{}}
          ]
        });
      } else {
        state.primary.draft.name = "";
        renderAll();
      }
    },
    filterFn: (q)=> {
      const s = q.trim().toLowerCase();
      if (!s) return [];
      return DCWS.filter(x =>
        x.fullName.toLowerCase().includes(s) ||
        x.email.toLowerCase().includes(s)
      );
    },
    renderOpt: (dcw)=> `
      <div class="opt">
        <div class="n">${escapeHtml(dcw.email)}</div>
        <div class="m">${escapeHtml(dcw.fullName)}</div>
      </div>
    `
  });

  // Email typeahead (disabled only when DCW selected from Name)
  if (!state.primary.draft.lockEmail){
    setupTypeahead({
      inputId: "pc_email",
      listId: "pc_email_list",
      xId: "pc_email_x",
      getValue: ()=>state.primary.draft.email,
      setValue: (v)=>{ state.primary.draft.email = v; renderDocs(); },
      onPick: (dcw)=>{
        // Hydrate all fields from DCW match (without locking Email search)
        clearSectionErrors("primary");
        state.primary.draft.noCaregiver = false;
        state.primary.draft.lockEmail = false;
        state.primary.draft.dcwId = dcw.id;
        state.primary.draft.name = dcw.fullName;
        state.primary.draft.email = dcw.email;
        state.primary.draft.address = dcw.address;
        state.primary.draft.zip = dcw.zip;
        state.primary.draft.city = dcw.city;
        state.primary.draft.county = dcw.county;
        state.primary.draft.state = dcw.state;
        state.primary.draft.homePhone = dcw.homePhone;
        state.primary.draft.workPhone = dcw.workPhone;
        state.primary.draft.cellPhone = dcw.cellPhone;
        renderAll();
      },
      onEnterNoPick: ()=>{
        clearSectionErrors("primary");
        state.primary.draft.dcwId = null;
        state.primary.draft.lockEmail = false;
        renderAll();
      },
      onClear: ()=>{
        // If DCW selected -> confirm modal clears all fields (same as Name X)
        const hasDCW = !!state.primary.draft.dcwId;
        const doClear = ()=>{
          clearSectionErrors("primary");
          state.primary.draft = emptyPrimary();
          renderAll();
        };
        if (hasDCW){
          openModal({
            title: "Clear selected DCW",
            text: "Are you sure you want to clear selected DCW? This action will clear all the fields",
            buttons: [
              {label:"Proceed", kind:"dangerSolid", onClick: doClear},
              {label:"Cancel", kind:"", onClick: ()=>{}}
            ]
          });
          return;
        }
        clearSectionErrors("primary");
        state.primary.draft.email = "";
        state.primary.draft.dcwId = null;
        state.primary.draft.lockEmail = false;
        renderAll();
      },
      filterFn: (q)=> {
        const s = q.trim().toLowerCase();
        if (!s) return [];
        return DCWS.filter(x => x.email.toLowerCase().includes(s));
      },
      renderOpt: (dcw)=> `
        <div class="opt">
          <div class="n">${escapeHtml(dcw.email)}</div>
          <div class="m">${escapeHtml(dcw.fullName)}</div>
        </div>
      `
    });
  }
}

function bindPCInputs(){
  const d = state.primary.draft;
  const set = (key, v)=>{
    d[key] = v;
    if (anyFilled(d)) d.noCaregiver = false;
    renderDocs();
  };
  bind("pc_email", (v)=> set("email", v));
  bind("pc_rel",  (v)=> set("relationship", v));
  bind("pc_address",(v)=> set("address", v));
  bind("pc_zip",  (v)=> set("zip", v));
  bind("pc_city", (v)=> set("city", v));
  bind("pc_county",(v)=> set("county", v));
  bind("pc_state",(v)=> set("state", v));
  bind("pc_home",(v)=> set("homePhone", v));
  bind("pc_work",(v)=> set("workPhone", v));
  bind("pc_cell",(v)=> set("cellPhone", v));
}
