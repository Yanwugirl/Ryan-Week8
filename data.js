// data.js
// Every node in the network lives here.
// To change the text, edit this file. You do not need to touch sketch.js.
//
// kind:     what type of node it is (changes its shape and how "heavy" it is)
//           root | part | material | place | rule | residue
// children: the ids of the nodes that appear when you click this one
// source:   where the fact comes from (shown under the text)

const SOURCES = {
  teardown: { label: "My own teardown of a universal charger (Project 0)", url: "" },
  usgsCopper: { label: "USGS Mineral Commodity Summaries 2026: Copper", url: "https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-copper.pdf" },
  usgsTin: { label: "USGS Mineral Commodity Summaries 2026: Tin", url: "https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-tin.pdf" },
  usgsIron: { label: "USGS Mineral Commodity Summaries 2026: Iron Ore", url: "https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-iron-ore.pdf" },
  doeCopper: { label: "US Department of Energy, Energy and Environmental Profile of the U.S. Mining Industry: Copper", url: "https://www.energy.gov/sites/default/files/2013/11/f4/copper.pdf" },
  solder: { label: "Kappalloy: SAC305 solder alloy", url: "https://www.kappalloy.com/solder-alloy/sac-solders/sac305/" },
  tinIndonesia: { label: "Wikipedia: Tin mining in Indonesia (citing WALHI, Kompas and Indonesia's Ministry of Energy)", url: "https://en.wikipedia.org/wiki/Tin_mining_in_Indonesia" },
  euRules: { label: "IEA policy database: EU Regulation 2017/821", url: "https://www.iea.org/policies/15682-eu-regulation-2017821-supply-chain-due-diligence-for-minerals-from-conflict-affected-and-high-risk-areas" },
  brumadinho: { label: "Wikipedia: Brumadinho dam disaster", url: "https://en.wikipedia.org/wiki/Brumadinho_dam_disaster" },
  plastic: { label: "NRDC: Hidden Fossil Fuels", url: "https://www.nrdc.org/bio/renee-sharp/hidden-fossil-fuels-plastic-production-drives-climate-change" },
  ewaste: { label: "UNITAR / ITU: Global E-waste Monitor 2024", url: "https://unitar.org/about/news-stories/press/global-e-waste-monitor-2024-electronic-waste-rising-five-times-faster-documented-e-waste-recycling" }
};

const NODES = {
  // ---------- the object ----------
  charger: {
    kind: "root",
    title: "Universal charger",
    text: "Small and light. Easy to leave in a drawer and forget.",
    source: "teardown",
    children: ["casing", "board", "wires", "contacts", "springs", "afterUse"]
  },

  // ---------- parts (from the Project 0 teardown) ----------
  casing: {
    kind: "part",
    title: "Plastic casing",
    text: "The shell and the clear plastic parts. The first thing you touch and the first thing you throw away.",
    source: "teardown",
    children: ["plastic"]
  },
  board: {
    kind: "part",
    title: "Circuit board",
    text: "Thin copper tracks on a green board, with every component fixed in place by solder.",
    source: "teardown",
    children: ["copper", "tin"]
  },
  wires: {
    kind: "part",
    title: "Wires",
    text: "Copper inside, plastic insulation outside.",
    source: "teardown",
    children: ["copper", "plastic"]
  },
  contacts: {
    kind: "part",
    title: "Metal pins and contacts",
    text: "The parts that touch the battery and carry the current. Usually a copper alloy, often plated.",
    source: "teardown",
    children: ["copper"]
  },
  springs: {
    kind: "part",
    title: "Springs and screws",
    text: "Small pieces of steel that hold the charger together and press the contacts against the battery.",
    source: "teardown",
    children: ["iron"]
  },
  afterUse: {
    kind: "part",
    title: "After use",
    text: "One day the charger stops working, or the phone it fits is replaced.",
    source: "teardown",
    children: ["ewaste"]
  },

  // ---------- materials ----------
  copper: {
    kind: "material",
    title: "Copper",
    text: "It carries the current through the tracks, wires and contacts.",
    source: null,
    children: ["chile"]
  },
  tin: {
    kind: "material",
    title: "Tin",
    text: "The main metal in solder. A common lead-free solder, SAC305, is 96.5% tin.",
    source: "solder",
    children: ["bangka", "euRules"]
  },
  iron: {
    kind: "material",
    title: "Iron (as steel)",
    text: "Steel is mostly iron. The springs and screws start as iron ore.",
    source: "usgsIron",
    children: ["ironOre"]
  },
  plastic: {
    kind: "material",
    title: "Plastic",
    text: "Plastics are made mostly from oil and gas.",
    source: "plastic",
    children: ["oilGas"]
  },

  // ---------- places and systems ----------
  chile: {
    kind: "place",
    title: "Chile",
    text: "The world's largest copper producer: about 5.3 million tonnes in 2025, out of about 23 million tonnes mined worldwide.",
    source: "usgsCopper",
    children: ["tailings"]
  },
  bangka: {
    kind: "place",
    title: "Bangka and Belitung, Indonesia",
    text: "Indonesia mined about 61,000 tonnes of tin in 2025, second only to China. Around 90% of Indonesia's tin comes from these two islands.",
    source: "tinIndonesia",
    children: ["kolong"]
  },
  euRules: {
    kind: "rule",
    title: "EU conflict minerals rules",
    text: "Since 1 January 2021, EU importers of tin, tantalum, tungsten and gold must check their supply chains for conflict and human rights risks.",
    source: "euRules",
    children: []
  },
  ironOre: {
    kind: "place",
    title: "Australia and Brazil",
    text: "The two largest iron ore producers: about 980 and 420 million tonnes of usable ore in 2025.",
    source: "usgsIron",
    children: ["brumadinho"]
  },
  oilGas: {
    kind: "place",
    title: "Oil and gas wells",
    text: "The casing begins underground, as fossil fuel.",
    source: "plastic",
    children: []
  },

  // ---------- what is left behind ----------
  tailings: {
    kind: "residue",
    title: "Tailings",
    text: "Copper ore often contains less than 1% copper. More than 99% of the crushed rock is left behind as tailings, usually stored behind dams.",
    source: "doeCopper",
    children: []
  },
  kolong: {
    kind: "residue",
    title: "Kolong (abandoned pits)",
    text: "More than 12,000 unreclaimed mining pits cover over 15,000 hectares. Between 2019 and 2023, 13 children drowned in them.",
    source: "tinIndonesia",
    children: []
  },
  brumadinho: {
    kind: "residue",
    title: "Brumadinho, 2019",
    text: "On 25 January 2019 an iron ore tailings dam at Vale's Córrego do Feijão mine in Brazil collapsed, releasing about 12 million cubic metres of waste. 270 people died.",
    source: "brumadinho",
    children: []
  },
  ewaste: {
    kind: "residue",
    title: "E-waste",
    text: "In 2022 the world produced 62 million tonnes of e-waste. Only 22.3% was documented as properly collected and recycled.",
    source: "ewaste",
    children: []
  }
};

// How "heavy" each kind of node feels when it appears.
// These numbers are symbolic. They are not real weights.
const WEIGHT = {
  root: 0,
  part: 1,
  material: 2,
  place: 3,
  rule: 1,
  residue: 6
};
