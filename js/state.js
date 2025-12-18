/* -------------------------------
   State
-------------------------------- */
const state = {
  patientType: "referral", // "referral" | "existing"

  primary: {
    mode: "view",
    saved: emptyPrimary(),
    draft: emptyPrimary(),
    snapshot: null,
    errors: []
  },

  informal: {
    mode: "view",
    saved: emptyInformal(),
    draft: emptyInformal(),
    snapshot: null,
    errors: []
  },

  emergency: {
    mode: "view",
    saved: emptyEmergency(),
    draft: emptyEmergency(),
    snapshot: null,
    errors: []
  },

  dcwAssign: {
    mode: "view",
    saved: emptyAssign(),
    draft: emptyAssign(),
    snapshot: null,
    errors: []
  },

  candAssign: {
    mode: "view",
    saved: emptyAssign(),
    draft: emptyAssign(),
    snapshot: null,
    errors: []
  }
};

function emptyPrimary(){
  return {
    dcwId: null,
    lockEmail: false,
    noCaregiver: false,
    name: "",
    email: "",
    relationship: "",
    address: "",
    zip: "",
    city: "",
    county: "",
    state: "",
    homePhone: "",
    workPhone: "",
    cellPhone: ""
  };
}
function emptyInformal(){
  return {
    selection: "", // "" | "add" | "refuse" | "agency"
    name: "",
    address: "",
    zip: "",
    city: "",
    county: "",
    state: "",
    homePhone: "",
    workPhone: "",
    cellPhone: ""
  };
}
function emptyEmergency(){
  return {
    name: "",
    relationship: "",
    address: "",
    city: "",
    county: "",
    state: "",
    zip: "",
    homePhone: "",
    workPhone: "",
    cellPhone: ""
  };
}
function emptyAssignEntry(){
  return {
    dcwId: null,
    email: "",
    phone: "",
    firstName: "",
    lastName: ""
  };
}
function emptyAssign(){
  return {
    entries: []
  };
}
