/* -------------------------------
   Utils
-------------------------------- */
const $ = (id)=>document.getElementById(id);
function deepClone(obj){ return JSON.parse(JSON.stringify(obj)); }
function isDirty(sectionKey){
  const sec = state[sectionKey];
  return JSON.stringify(sec.draft) !== JSON.stringify(sec.snapshot);
}
function anyFilled(obj){
  return Object.entries(obj).some(([k,v])=>{
    if (k==="noCaregiver" || k==="lockEmail") return false;
    if (typeof v === "boolean") return false;
    if (k==="dcwId") return !!v;
    return String(v||"").trim().length>0;
  });
}
function valOrNone(v){
  const s = String(v ?? "").trim();
  return s ? s : "None";
}
function normalizePhone(s){ return (s||"").trim(); }
function splitFullName(fullName){
  const parts = String(fullName||"").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return {firstName:"", lastName:""};
  if (parts.length === 1) return {firstName: parts[0], lastName:""};
  return {firstName: parts[0], lastName: parts.slice(1).join(" ")};
}

function reqAddressPrimary(){
  // Referrals: Address optional; Existing: Address required
  return state.patientType === "existing";
}
function reqInformalSelection(){
  // Existing: must pick one of options; Referral: optional
  return state.patientType === "existing";
}
function reqEmergencyRequired(){
  // Existing required; Referral optional
  return state.patientType === "existing";
}

function setPatientType(type){
  state.patientType = type;
  $("btnReferral").classList.toggle("active", type==="referral");
  $("btnExisting").classList.toggle("active", type==="existing");
  $("reqPill").textContent = "Mode: " + (type==="existing" ? "Existing" : "Referral");
  ["primary","informal","emergency","dcwAssign","candAssign"].forEach(clearSectionErrors);
  renderAll();
}

function clearSectionErrors(sectionKey){
  const sec = state[sectionKey];
  if (!sec) return;
  sec.errors = [];
}
function setSectionErrors(sectionKey, ids){
  const sec = state[sectionKey];
  if (!sec) return;
  const unique = [];
  (ids || []).forEach((id)=>{
    if (!id) return;
    if (unique.includes(id)) return;
    unique.push(id);
  });
  sec.errors = unique;
}
function clearErrorByFieldId(fieldId){
  ["primary","informal","emergency","dcwAssign","candAssign"].forEach((k)=>{
    const sec = state[k];
    if (!sec || !Array.isArray(sec.errors)) return;
    const idx = sec.errors.indexOf(fieldId);
    if (idx !== -1) sec.errors.splice(idx, 1);
  });
}
function focusFirstError(ids){
  const errorIds = Array.isArray(ids) ? ids : [];
  const id =
    errorIds.find(x => x && x !== "is_selection") ||
    (errorIds.includes("is_selection") ? "is_selection_field" : "");
  if (!id) return;
  requestAnimationFrame(()=>{
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({behavior:"smooth", block:"center"});
    el.focus?.();
  });
}

function sanitizeByFilter(filter, value){
  const s = String(value ?? "");
  if (filter === "digits") return s.replace(/\D+/g, "");
  if (filter === "email") return s.replace(/\s+/g, "");
  return s;
}

function isValidEmail(value){
  const s = String(value || "").trim();
  if (!s) return false;
  if (s.length > 254) return false;
  // Simple email format (prototype-level)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
