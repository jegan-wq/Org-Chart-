// ============================================================================
// DEFAULT ORG CHART DATA
// ----------------------------------------------------------------------------
// This is the "factory" data for the chart. Whatever people edit in the
// browser is saved to their own localStorage, NOT to this file. If you want
// to change what everyone sees by default (a real, permanent update), edit
// the values below and redeploy (push to GitHub -> Vercel auto-deploys).
//
// You can also use the "Export data.js" button in the app: it downloads a
// ready-to-use replacement for this exact file with whatever is currently
// on screen, so you never have to hand-edit this structure yourself.
// ============================================================================

function person(name = "", title = "") {
  return { name, title };
}

function makeCluster() {
  return {
    clusterLead: person(),
    accountManagers: "",
    designLead: person(),
    designers: "",
    contentLead: person(),
    contentWriters: "",
  };
}

function makeAccountRow() {
  return { account: "", manager: "", designer: "", writer: "" };
}

function makeBusinessUnit(id, label, color) {
  return {
    id,
    label, // fixed slot label, e.g. "BU1"
    customName: "", // editable, e.g. "Retail & E-commerce"
    color,
    leads: {
      buLead: person(),
      cdDesign: person(),
      cdContent: person(),
    },
    clusters: [makeCluster(), makeCluster(), makeCluster(), makeCluster()],
    accountCoverage: [
      makeAccountRow(),
      makeAccountRow(),
      makeAccountRow(),
      makeAccountRow(),
      makeAccountRow(),
    ],
  };
}

const DEFAULT_DATA = {
  meta: {
    orgName: "Zensciences",
    title: "Organization Map",
    subtitle: "People. Accounts. Progress.",
    tagline: "Create. Communicate. Convert.",
    footer: "An organized tomorrow, a brighter today.",
  },
  founders: [person("", "Founder 1 designation"), person("", "Founder 2 designation")],
  finance: {
    label: "Finance",
    icon: "finance",
    people: [person(), person(), person()],
  },
  cbo: person("Mahima", "Chief Business Officer (CBO)"),
  businessUnits: [
    makeBusinessUnit("bu1", "BU1", "purple"),
    makeBusinessUnit("bu2", "BU2", "green"),
    makeBusinessUnit("bu3", "BU3", "blue"),
    makeBusinessUnit("bu4", "BU4", "orange"),
  ],
  martech: {
    label: "MarTech",
    customName: "",
    roles: [
      { title: "SEO Lead", lead: person(), teamMembers: "" },
      { title: "Performance Lead", lead: person(), teamMembers: "" },
    ],
  },
  simpleDepts: [
    { id: "hr", label: "HR", customName: "", people: [person(), person(), person(), person()] },
    { id: "operations", label: "Operations", customName: "", people: [person(), person(), person(), person()] },
    { id: "strategy", label: "Strategy & Alliances", customName: "", people: [person(), person(), person(), person()] },
    { id: "advisory", label: "Advisory", customName: "", people: [person(), person(), person(), person()] },
  ],
};

if (typeof module !== "undefined") {
  module.exports = { DEFAULT_DATA };
}
