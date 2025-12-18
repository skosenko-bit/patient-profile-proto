/* -------------------------------
   Render: Assignments (DCW + Candidates)
-------------------------------- */
const MAX_ASSIGN = 10;
const ICON_TRASH = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M6 6l1 16a2 2 0 002 2h6a2 2 0 002-2l1-16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M10 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
`;

function anyFilledAssignEntry(e){
  return !!e?.dcwId ||
    String(e?.email||"").trim() ||
    String(e?.phone||"").trim() ||
    String(e?.firstName||"").trim() ||
    String(e?.lastName||"").trim();
}

function createAssignSection(cfg){
  const {
    sectionKey,
    bodyId,
    idPrefix,
    entityLabel,
    emptyViewText,
    emptyEditText,
    bannerText,
    addButtonText
  } = cfg;

  function enterEdit(){
    clearSectionErrors(sectionKey);
    const sec = state[sectionKey];
    sec.mode = "edit";
    sec.draft = deepClone(sec.saved);
    if (!Array.isArray(sec.draft.entries)) sec.draft.entries = [];
    sec.snapshot = deepClone(sec.draft);
    renderAll();
  }

  function exitToView(){
    clearSectionErrors(sectionKey);
    const sec = state[sectionKey];
    sec.mode = "view";
    sec.snapshot = null;
    renderAll();
  }

  function validateInternal(d, {requireAll}){
    const errors = [];
    const entries = Array.isArray(d.entries) ? d.entries : [];
    entries.forEach((e, idx)=>{
      if (!requireAll && !anyFilledAssignEntry(e)) return;
      const emailId = `${idPrefix}_${idx}_email`;
      const phoneId = `${idPrefix}_${idx}_phone`;
      const firstId = `${idPrefix}_${idx}_first`;
      const lastId = `${idPrefix}_${idx}_last`;

      const email = String(e.email || "").trim();
      if (!email || !isValidEmail(email)){
        errors.push(emailId);
        return;
      }
      if (!String(e.phone || "").trim()) errors.push(phoneId);
      if (!String(e.firstName || "").trim()) errors.push(firstId);
      if (!String(e.lastName || "").trim()) errors.push(lastId);
    });
    return errors;
  }

  function validateAll(d){
    return validateInternal(d, {requireAll:true});
  }

  function apply(){
    const sec = state[sectionKey];
    const d = sec.draft;
    const errs = validateAll(d);
    if (errs.length){
      setSectionErrors(sectionKey, errs);
      renderAll();
      focusFirstError(errs);
      return;
    }
    clearSectionErrors(sectionKey);
    const trimmed = (Array.isArray(d.entries) ? d.entries : [])
      .filter(e => anyFilledAssignEntry(e))
      .slice(0, MAX_ASSIGN);
    sec.saved = { entries: deepClone(trimmed) };
    exitToView();
  }

  function cancel(){
    if (!isDirty(sectionKey)){
      exitToView();
      return;
    }
    openModal({
      title: "Unsaved changes",
      text: "Do you want to save changes or cancel everything?",
      buttons: [
        {label:"Save Changes", kind:"primary", onClick: ()=>apply()},
        {label:"Cancel Changes", kind:"", onClick: ()=>exitToView()}
      ]
    });
  }

  function render(){
    const root = $(bodyId);
    const sec = state[sectionKey];
    if (!root || !sec) return;

    if (sec.mode === "view"){
      const entries = (sec.saved.entries || []).filter(e => anyFilledAssignEntry(e));
      if (!entries.length){
        root.innerHTML = kvMessage(emptyViewText);
        return;
      }
      const items = [];
      entries.forEach((e, idx)=>{
        const n = idx + 1;
        pushKV(items, `${entityLabel} ${n} Email`, e.email);
        pushKV(items, `${entityLabel} ${n} Phone number`, e.phone);
        pushKV(items, `${entityLabel} ${n} First name`, e.firstName);
        pushKV(items, `${entityLabel} ${n} Last name`, e.lastName);
        padKv(items);
      });
      root.innerHTML = `<div class="kv">${items.join("")}</div>`;
      return;
    }

    const d = sec.draft;
    const entries = Array.isArray(d.entries) ? d.entries : [];
    const applyEnabled = entries.length > 0;
    const invalid = (id)=> (sec.errors || []).includes(id);
    const addDisabled = entries.length >= MAX_ASSIGN;
    const showBanner = entries.length > 0;
    const showEmptyHint = entries.length === 0;

    const addId = `${idPrefix}Add`;
    const applyId = `${idPrefix}Apply`;
    const cancelId = `${idPrefix}Cancel`;

    root.innerHTML = `
      ${showBanner ? `
        <div class="banner">
          <div>
            <div class="v">${escapeHtml(bannerText)}</div>
          </div>
        </div>
      ` : showEmptyHint ? `
        <div class="emptyNote">${escapeHtml(emptyEditText)}</div>
      ` : ``}

      ${entries.length === 0 ? `
        <div class="footer">
          <button class="btn" id="${escapeAttr(addId)}" type="button">${escapeHtml(addButtonText)}</button>
          <button class="btn primary" id="${escapeAttr(applyId)}" type="button" disabled>Apply</button>
          <button class="btn dangerSolid" id="${escapeAttr(cancelId)}" type="button">Cancel</button>
        </div>
      ` : `
        ${entries.map((e, idx)=>{
          const emailId = `${idPrefix}_${idx}_email`;
          const phoneId = `${idPrefix}_${idx}_phone`;
          const firstId = `${idPrefix}_${idx}_first`;
          const lastId = `${idPrefix}_${idx}_last`;
          const emailEntered = String(e.email||"").trim().length > 0;
          const disabled = !emailEntered;
          const n = idx + 1;
          return `
            <div class="dcwEntry" data-idx="${idx}">
              <div class="dcwEntryHead">
                <div class="dcwEntryTitle">${escapeHtml(entityLabel)} ${n}</div>
                <button class="iconBtn" type="button" data-del="${idx}" aria-label="Delete ${escapeAttr(entityLabel)} ${n}">${ICON_TRASH}</button>
              </div>
              <div class="form dcwForm">
                ${fieldTypeahead(emailId, "Email", true, e.email, "", false, {invalid: invalid(emailId), type:"email", autocomplete:"email", filter:"email"})}
                ${fieldInput(phoneId, "Phone number", true, e.phone, disabled, "", {invalid: invalid(phoneId), filter:"digits", inputMode:"numeric"})}
                ${fieldInput(firstId, "First name", true, e.firstName, disabled, "", {invalid: invalid(firstId)})}
                ${fieldInput(lastId, "Last name", true, e.lastName, disabled, "", {invalid: invalid(lastId)})}
              </div>
            </div>
          `;
        }).join("")}

        <div class="footer">
          <button class="btn" id="${escapeAttr(addId)}" type="button" ${addDisabled ? "disabled" : ""}>${escapeHtml(addButtonText)}</button>
          <button class="btn primary" id="${escapeAttr(applyId)}" type="button" ${applyEnabled ? "" : "disabled"}>Apply</button>
          <button class="btn dangerSolid" id="${escapeAttr(cancelId)}" type="button">Cancel</button>
        </div>
      `}
    `;

    const syncButtons = ()=>{
      const applyBtn = $(applyId);
      if (applyBtn) applyBtn.disabled = !(state[sectionKey].draft.entries?.length > 0);
    };

    $(applyId)?.addEventListener("click", apply);
    $(cancelId)?.addEventListener("click", cancel);

    $(addId)?.addEventListener("click", ()=>{
      clearSectionErrors(sectionKey);
      const sec2 = state[sectionKey];
      if (sec2.draft.entries.length === 0){
        sec2.draft.entries = [emptyAssignEntry()];
        renderAll();
        return;
      }
      if (sec2.draft.entries.length >= MAX_ASSIGN) return;
      const errs = validateAll(sec2.draft);
      if (errs.length){
        setSectionErrors(sectionKey, errs);
        renderAll();
        focusFirstError(errs);
        return;
      }
      sec2.draft.entries.push(emptyAssignEntry());
      renderAll();
    });

    // Delete entry
    root.querySelectorAll("[data-del]").forEach((btn)=>{
      btn.addEventListener("click", ()=>{
        const idx = Number(btn.getAttribute("data-del"));
        if (!Number.isFinite(idx)) return;
        clearSectionErrors(sectionKey);
        state[sectionKey].draft.entries.splice(idx, 1);
        renderAll();
      });
    });

    // Wire entry fields
    entries.forEach((e, idx)=>{
      const emailId = `${idPrefix}_${idx}_email`;
      const phoneId = `${idPrefix}_${idx}_phone`;
      const firstId = `${idPrefix}_${idx}_first`;
      const lastId = `${idPrefix}_${idx}_last`;

      function syncEnabled(){
        const email = String(e.email||"").trim();
        const enabled = email.length > 0;
        const phoneEl = $(phoneId);
        const firstEl = $(firstId);
        const lastEl = $(lastId);
        if (phoneEl) phoneEl.disabled = !enabled;
        if (firstEl) firstEl.disabled = !enabled;
        if (lastEl) lastEl.disabled = !enabled;
        syncClearButton(phoneId);
        syncClearButton(firstId);
        syncClearButton(lastId);
        syncButtons();
      }

      setupTypeahead({
        inputId: emailId,
        listId: `${emailId}_list`,
        xId: `${emailId}_x`,
        getValue: ()=>e.email,
        setValue: (v)=>{
          const before = String(e.email||"");
          e.email = v;
          if (!String(v||"").trim()){
            e.dcwId = null;
            e.phone = "";
            e.firstName = "";
            e.lastName = "";
            const phoneEl = $(phoneId); if (phoneEl) phoneEl.value = "";
            const firstEl = $(firstId); if (firstEl) firstEl.value = "";
            const lastEl = $(lastId); if (lastEl) lastEl.value = "";
            clearErrorByFieldId(phoneId);
            clearErrorByFieldId(firstId);
            clearErrorByFieldId(lastId);
            $(phoneId)?.closest?.(".field")?.classList.remove("invalid");
            $(firstId)?.closest?.(".field")?.classList.remove("invalid");
            $(lastId)?.closest?.(".field")?.classList.remove("invalid");
          } else if (e.dcwId && before.trim() !== v.trim()){
            e.dcwId = null;
          }
          syncEnabled();
          renderDocs();
        },
        onPick: (dcw)=>{
          const nm = splitFullName(dcw.fullName);
          e.dcwId = dcw.id;
          e.email = dcw.email;
          e.phone = dcw.cellPhone || dcw.homePhone || dcw.workPhone || "";
          e.firstName = nm.firstName;
          e.lastName = nm.lastName;
          clearErrorByFieldId(emailId);
          clearErrorByFieldId(phoneId);
          clearErrorByFieldId(firstId);
          clearErrorByFieldId(lastId);
          renderAll();
        },
        onEnterNoPick: ()=>{
          e.dcwId = null;
          syncEnabled();
          renderDocs();
        },
        onClear: ()=>{
          e.dcwId = null;
          e.email = "";
          e.phone = "";
          e.firstName = "";
          e.lastName = "";
          clearErrorByFieldId(emailId);
          clearErrorByFieldId(phoneId);
          clearErrorByFieldId(firstId);
          clearErrorByFieldId(lastId);
          renderAll();
        },
        filterFn: (q)=> {
          const s = q.trim().toLowerCase();
          if (!s) return [];
          return DCWS.filter(x => x.email.toLowerCase().includes(s));
        },
        renderOpt: (dcw)=> `
          <div class="opt">
            <div class="n">${escapeHtml(dcw.fullName)}</div>
            <div class="m">${escapeHtml(dcw.email)}</div>
          </div>
        `
      });

      bind(phoneId, (v)=>{ e.phone=v; renderDocs(); syncButtons(); });
      bind(firstId, (v)=>{ e.firstName=v; renderDocs(); syncButtons(); });
      bind(lastId, (v)=>{ e.lastName=v; renderDocs(); syncButtons(); });
    });
  }

  return {enterEdit, exitToView, render};
}

const _dcwAssign = createAssignSection({
  sectionKey: "dcwAssign",
  bodyId: "daBody",
  idPrefix: "da",
  entityLabel: "DCW",
  emptyViewText: "No DCWs",
  emptyEditText: "No DCW's assigned yet",
  bannerText: "Start by entering an email. You can select an existing DCW contact, or enter new information to add a DCW",
  addButtonText: "+ Add DCW"
});

const _candAssign = createAssignSection({
  sectionKey: "candAssign",
  bodyId: "caBody",
  idPrefix: "ca",
  entityLabel: "Candidate",
  emptyViewText: "No Candidates",
  emptyEditText: "No Candidates assigned yet",
  bannerText: "Start by entering an email. You can select an existing contact, or enter new information to add a Candidate",
  addButtonText: "+ Add Candidate"
});

function daEnterEdit(){ _dcwAssign.enterEdit(); }
function daRender(){ _dcwAssign.render(); }

function caEnterEdit(){ _candAssign.enterEdit(); }
function caRender(){ _candAssign.render(); }
