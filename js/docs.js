/* -------------------------------
   Docs preview mapping
-------------------------------- */
function buildDocs(){
  // When empty -> "None" (or no option selected)
  const pc = state.primary.saved;
  const is = state.informal.saved;
  const ec = state.emergency.saved;
  const dcwA = state.dcwAssign.saved;
  const candA = state.candAssign.saved;

  const doc = {
    "Care Plan": {
      "Primary Caregiver": anyFilled(pc) ? compact({
        name: pc.name,
        email: pc.email,
        relationship: pc.relationship,
        address: pc.address,
        zip: pc.zip,
        city: pc.city,
        county: pc.county,
        state: pc.state,
        homePhone: pc.homePhone,
        workPhone: pc.workPhone,
        cellPhone: pc.cellPhone
      }) : "None",
      "Informal Support": (is.selection)
        ? (is.selection==="add"
            ? compact({
                selection: selectionLabel(is.selection),
                name: is.name,
                address: is.address,
                zip: is.zip,
                city: is.city,
                county: is.county,
                state: is.state,
                homePhone: is.homePhone,
                workPhone: is.workPhone,
                cellPhone: is.cellPhone
              })
            : selectionLabel(is.selection))
        : "None"
    },

    "Patient Emergency and Contact Information": {
      "Relative/Friend Not Living With You (from Emergency Contact)": anyFilled(ec) ? compact({
        name: ec.name,
        relationship: ec.relationship,
        address: ec.address,
        city: ec.city,
        county: ec.county,
        state: ec.state,
        zip: ec.zip,
        homePhone: ec.homePhone,
        workPhone: ec.workPhone,
        cellPhone: ec.cellPhone
      }) : "None"
    },

    "Assignments": {
      "DCWs": (dcwA.entries && dcwA.entries.length)
        ? dcwA.entries.filter(e=>anyFilledAssignEntry(e)).map(e => compact({
            email: e.email,
            phone: e.phone,
            firstName: e.firstName,
            lastName: e.lastName
          }))
        : "None",
      "Candidates": (candA.entries && candA.entries.length)
        ? candA.entries.filter(e=>anyFilledAssignEntry(e)).map(e => compact({
            email: e.email,
            phone: e.phone,
            firstName: e.firstName,
            lastName: e.lastName
          }))
        : "None"
    }
  };

  return doc;
}
function compact(o){
  // remove empty strings so preview matches "hide empties" philosophy
  const out = {};
  Object.entries(o).forEach(([k,v])=>{
    if (String(v||"").trim()) out[k]=v;
  });
  return out;
}

function renderDocs(){
  const out = $("docsOut");
  if (!out) return;
  out.textContent = JSON.stringify(buildDocs(), null, 2);
}
