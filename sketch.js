// sketch.js — Material Shadow
//
// How it works, in five steps:
// 1. Nodes and edges: the network you see is a list of nodes (from data.js)
//    and a list of edges (lines between a node and what it opens).
// 2. Opening: clicking a node adds its children to the network.
// 3. Layout: a small physics simulation pushes nodes apart and pulls
//    connected nodes together, so the network arranges itself.
// 4. Load: every new node adds "weight". The heavier the load,
//    the more the cursor lags behind your hand and sinks below it.
// 5. Panel: the text box shows the node you are pointing at, with its source.

// ---------- colours ----------
const PAPER = "#f3f0e8";
const INK = "#1d1c1a";
const GREY = "#8a867d";
const LINE = "#aaa59a";

// ---------- state ----------
let nodes = [];     // nodes that are visible now
let edges = [];     // lines between visible nodes
let byId = {};      // quick lookup: id -> node
let load = 0;       // how much weight you carry now
let maxLoad = 0;    // weight when everything is open
let cur = { x: 0, y: 0 };  // position of the heavy cursor
let selected = null;       // last node you clicked
let isTouch = false;       // phones and tablets: no heavy cursor
let finished = false;      // has the "everything is open" message been shown?
let lastPanelKey = "";     // so we only update the text panel when it changes

// ---------- p5 setup ----------
function setup() {
  createCanvas(windowWidth, windowHeight);
  describe("A network diagram that grows from a small charger into its parts, materials, mining places and waste. The cursor gets heavier as more of it is opened.");
  // use the same font as the page; if it cannot load (offline), use Courier New
  textFont("IBM Plex Mono");
  document.fonts.load('12px "IBM Plex Mono"').then((found) => {
    if (found.length === 0) textFont("Courier New");
  }).catch(() => textFont("Courier New"));

  isTouch = window.matchMedia("(pointer: coarse)").matches;
  cur = { x: width / 2, y: height / 2 };

  // add up the weight of every node, so we know what "full" means
  for (const id in NODES) maxLoad += WEIGHT[NODES[id].kind];

  setupInterface();
  reset();
}

// ---------- p5 draw loop ----------
function draw() {
  background(PAPER);

  simulate();       // step 3: move nodes
  updateCursor();   // step 4: move the heavy cursor

  const hover = nodeAt(cur.x, cur.y);

  drawEdges();
  for (const n of nodes) drawNode(n, n === hover || n === selected);
  drawCursor();

  updatePanel(hover || selected || byId.charger);
  updateLoadBar();
  checkFinished();
}

// =========================================================
// 1 + 2. Nodes, edges and opening
// =========================================================

function reset() {
  nodes = [];
  edges = [];
  byId = {};
  load = 0;
  selected = null;
  finished = false;
  addNode("charger", width / 2, height / 2);
}

function addNode(id, x, y) {
  if (byId[id]) return byId[id];          // already on screen
  const data = NODES[id];
  const n = {
    id: id,
    data: data,
    x: x, y: y,
    vx: 0, vy: 0,
    r: radiusFor(data.kind),
    born: millis(),          // used for the grow-in animation
    opened: false,
    seed: random(1000)       // makes each waste blob a different shape
  };
  nodes.push(n);
  byId[id] = n;
  load += WEIGHT[data.kind];
  return n;
}

function addEdge(a, b) {
  for (const e of edges) {
    if ((e.a === a && e.b === b) || (e.a === b && e.b === a)) return;
  }
  edges.push({ a: a, b: b, born: millis() });
}

function openNode(n) {
  if (n.opened) return;
  n.opened = true;
  for (const childId of n.data.children) {
    const child = addNode(childId, n.x + random(-30, 30), n.y + random(-30, 30));
    addEdge(n, child);   // shared materials (copper, plastic) get several lines
  }
}

function hasMoreToOpen(n) {
  return !n.opened && n.data.children.length > 0;
}

function radiusFor(kind) {
  if (kind === "root") return 22;
  if (kind === "residue") return 15;
  if (kind === "place") return 10;
  return 8;
}

// =========================================================
// 3. Layout: a very small physics simulation
// =========================================================

// Each kind of node lives on its own ring around the charger:
// parts close by, waste on the outside. The further out, the heavier.
const RING = { root: 0, part: 1, material: 2, place: 3, rule: 3, residue: 4 };

function layoutArea() {
  const phone = width < 640;
  const top = phone ? 140 : 100;
  const bottom = phone ? height - panelHeight() - 30 : height - 50;
  const side = phone ? 30 : 150;   // leave room for labels
  return {
    cx: width / 2,
    cy: (top + bottom) / 2,
    rx: width / 2 - side,
    ry: (bottom - top) / 2,
    top, bottom
  };
}

function simulate() {
  const A = layoutArea();
  const size = min(A.rx, A.ry);
  const push = size * size * 0.08;   // how strongly nodes repel each other

  // every pair of nodes pushes apart
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      let dx = a.x - b.x, dy = a.y - b.y;
      let d2 = dx * dx + dy * dy;
      if (d2 < 1) { dx = random(-1, 1); dy = random(-1, 1); d2 = 1; }
      const d = sqrt(d2);
      const f = min(push / d2, 3);
      a.vx += (dx / d) * f;  a.vy += (dy / d) * f;
      b.vx -= (dx / d) * f;  b.vy -= (dy / d) * f;
    }
  }

  // every edge acts like a soft spring, so connected things stay near each other
  for (const e of edges) {
    const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y;
    const d = max(sqrt(dx * dx + dy * dy), 1);
    const f = d * 0.004;
    e.a.vx += (dx / d) * f;  e.a.vy += (dy / d) * f;
    e.b.vx -= (dx / d) * f;  e.b.vy -= (dy / d) * f;
  }

  const panel = panelRect();

  for (const n of nodes) {
    // pull each node towards its ring (an ellipse that fits the screen)
    const ring = RING[n.data.kind] / 4;
    let ux = (n.x - A.cx) / A.rx, uy = (n.y - A.cy) / A.ry;
    let len = sqrt(ux * ux + uy * uy);
    if (len < 0.001) { ux = random(-1, 1); uy = random(-1, 1); len = sqrt(ux * ux + uy * uy); }
    const tx = A.cx + (ux / len) * ring * A.rx;
    const ty = A.cy + (uy / len) * ring * A.ry;
    const pull = n.id === "charger" ? 0.2 : 0.06;
    n.vx += (tx - n.x) * pull;
    n.vy += (ty - n.y) * pull;

    // move out from under the text panel
    // (the extra 160px on the right leaves room for the node's label)
    if (panel && n.x > panel.left - 30 && n.x < panel.right + 160 && n.y > panel.top - 30) {
      n.vx += 1.5;
      n.vy -= 1.5;
    }

    n.vx *= 0.75;  n.vy *= 0.75;              // friction
    n.vx = constrain(n.vx, -10, 10);
    n.vy = constrain(n.vy, -10, 10);
    n.x += n.vx;   n.y += n.vy;

    n.x = constrain(n.x, 30, width - 30);
    n.y = constrain(n.y, A.top, max(A.top + 50, A.bottom));
  }
}

function panelHeight() {
  const p = document.getElementById("panel");
  return p ? p.offsetHeight : 120;
}

// is this point inside the text panel? (desktop only)
function overPanel(x, y) {
  const p = panelRect();
  return p !== null && x > p.left - 10 && x < p.right + 10 && y > p.top - 20;
}

function panelRect() {
  if (width < 640) return null;   // on phones the layout already stops above the panel
  const p = document.getElementById("panel");
  return p ? p.getBoundingClientRect() : null;
}

// =========================================================
// 4. The heavy cursor
// =========================================================

function weightRatio() {
  return maxLoad > 0 ? load / maxLoad : 0;   // 0 = empty, 1 = everything open
}

function updateCursor() {
  if (isTouch) return;                        // on touch screens we use the tap point
  const w = pow(weightRatio(), 0.7);
  const follow = lerp(0.45, 0.035, w);        // how quickly it catches up
  const sag = lerp(0, 70, w);                 // how far it hangs below your hand
  cur.x += (mouseX - cur.x) * follow;
  cur.y += (mouseY + sag - cur.y) * follow;
}

function drawCursor() {
  if (isTouch) return;
  const w = weightRatio();

  // your hand: a small ring at the real mouse position
  noFill();
  stroke(INK);
  strokeWeight(1);
  circle(mouseX, mouseY, 10);

  // the string between your hand and the load
  if (dist(mouseX, mouseY, cur.x, cur.y) > 6) {
    stroke(29, 28, 26, 110);
    line(mouseX, mouseY, cur.x, cur.y);
  }

  // the shadow under the load
  noStroke();
  fill(29, 28, 26, 20 + 90 * w);
  ellipse(cur.x, cur.y + 10 + 24 * w, 10 + 54 * w, 4 + 10 * w);

  // the load itself
  fill(INK);
  circle(cur.x, cur.y, 5 + 17 * w);
}

// =========================================================
// Drawing nodes and edges
// =========================================================

function grow(born) {
  const t = constrain((millis() - born) / 600, 0, 1);
  return 1 - pow(1 - t, 3);   // ease-out
}

function drawEdges() {
  for (const e of edges) {
    const t = grow(e.born);
    const heavy = e.a.data.kind === "residue" || e.b.data.kind === "residue";
    stroke(heavy ? INK : LINE);
    strokeWeight(heavy ? 1.3 : 1);
    line(e.a.x, e.a.y, lerp(e.a.x, e.b.x, t), lerp(e.a.y, e.b.y, t));
  }
}

function drawNode(n, highlight) {
  const s = grow(n.born);
  const r = n.r * s;
  const kind = n.data.kind;

  push();
  translate(n.x, n.y);

  // invitation ring: pulses while there is something left to open
  if (hasMoreToOpen(n)) {
    const pulse = (sin(millis() / 400 + n.seed) + 1) / 2;
    noFill();
    stroke(29, 28, 26, 40 + 50 * pulse);
    strokeWeight(1);
    circle(0, 0, r * 2 + 10 + 6 * pulse);
  }

  if (highlight) {
    noFill();
    stroke(INK);
    strokeWeight(1);
    circle(0, 0, r * 2 + 18);
  }

  strokeWeight(1.2);
  if (kind === "root") {
    // a simple plug: body and two pins
    stroke(INK); fill(PAPER);
    rect(-6 * s, -r * 0.65 - 9 * s, 3 * s, 10 * s);
    rect(3 * s, -r * 0.65 - 9 * s, 3 * s, 10 * s);
    rectMode(CENTER);
    rect(0, 0, r * 1.7, r * 1.3, 5 * s);
  } else if (kind === "part") {
    stroke(INK); fill(PAPER);
    rectMode(CENTER);
    rect(0, 0, r * 2, r * 2);
  } else if (kind === "material") {
    noStroke(); fill(GREY);
    circle(0, 0, r * 2);
  } else if (kind === "place") {
    stroke(INK); noFill();
    circle(0, 0, r * 2);
    fill(INK); noStroke();
    circle(0, 0, 4 * s);
  } else if (kind === "rule") {
    stroke(INK); fill(PAPER);
    quad(0, -r, r, 0, 0, r, -r, 0);
  } else if (kind === "residue") {
    // an uneven dark blob, like mud
    noStroke(); fill(INK);
    beginShape();
    for (let i = 0; i < 24; i++) {
      const a = (TWO_PI * i) / 24;
      const k = noise(n.seed + cos(a), n.seed + sin(a), millis() * 0.0002);
      const rr = r * (0.75 + 0.5 * k);
      vertex(cos(a) * rr, sin(a) * rr);
    }
    endShape(CLOSE);
  }
  pop();

  // label (with a thin paper-coloured outline so lines behind it stay readable)
  if (s > 0.6) {
    const small = width < 640;
    stroke(PAPER);
    strokeWeight(4);
    strokeJoin(ROUND);
    fill(INK);
    textSize(kind === "root" ? (small ? 12 : 13) : (small ? 10 : 12));
    textStyle(kind === "residue" ? BOLD : NORMAL);
    const label = n.data.title;
    // labels point away from the centre; if there is no room (screen edge
    // or text panel), try the other side; if neither fits, put it underneath
    const w = textWidth(label);
    const fitsLeft = n.x - n.r - 8 - w > 8 && !overPanel(n.x - n.r - 8 - w, n.y - 8);
    const fitsRight = n.x + n.r + 8 + w < width - 8 && !overPanel(n.x + n.r + 8 + w, n.y - 8);
    const preferLeft = n.x < width / 2;
    if (kind === "root") {
      textAlign(CENTER, TOP);
      text(label, n.x, n.y + n.r + 10);
    } else if ((preferLeft && fitsLeft) || (!fitsRight && fitsLeft)) {
      textAlign(RIGHT, CENTER);
      text(label, n.x - n.r - 8, n.y);
    } else if (fitsRight) {
      textAlign(LEFT, CENTER);
      text(label, n.x + n.r + 8, n.y);
    } else {
      textAlign(CENTER, TOP);
      text(label, constrain(n.x, w / 2 + 8, width - w / 2 - 8), n.y + n.r + 6);
    }
    textStyle(NORMAL);
  }
}

// which node is under a point? (uses the heavy cursor, not your hand)
function nodeAt(x, y) {
  const extra = isTouch ? 18 : 8;
  let best = null, bestD = Infinity;
  for (const n of nodes) {
    const d = dist(x, y, n.x, n.y);
    if (d < n.r + extra && d < bestD) { best = n; bestD = d; }
  }
  return best;
}

// =========================================================
// Input
// =========================================================

function mousePressed(event) {
  // ignore clicks on buttons, links and the About page
  if (event && event.target && event.target.tagName !== "CANVAS") return;

  if (isTouch) { cur.x = mouseX; cur.y = mouseY; }

  const n = nodeAt(cur.x, cur.y);
  if (n) {
    selected = n;
    openNode(n);
  } else {
    selected = null;
  }
  return false;
}

function keyPressed() {
  if (keyCode === ESCAPE) document.getElementById("about").hidden = true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// =========================================================
// 5. Text panel, load bar, messages, About
// =========================================================

const KIND_LABEL = {
  root: "object",
  part: "part",
  material: "material",
  place: "place",
  rule: "rule",
  residue: "left behind"
};

function updatePanel(n) {
  if (!n) return;
  const state = n.id + (n.opened ? "-open" : "");
  if (state === lastPanelKey) return;   // nothing changed
  lastPanelKey = state;

  const d = n.data;
  document.getElementById("panelKind").textContent = KIND_LABEL[d.kind];
  document.getElementById("panelTitle").textContent = d.title;
  document.getElementById("panelText").textContent = d.text;

  const src = document.getElementById("panelSource");
  src.innerHTML = "";
  const s = d.source ? SOURCES[d.source] : null;
  if (s) {
    src.append("Source: ");
    if (s.url) {
      const a = document.createElement("a");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = s.label;
      src.append(a);
    } else {
      src.append(s.label);
    }
  }

  let hint = "";
  if (hasMoreToOpen(n)) hint = isTouch ? "Tap to open." : "Click to open.";
  else if (d.kind === "residue") hint = "Nothing more to open. This stays.";
  document.getElementById("panelHint").textContent = hint;
}

function updateLoadBar() {
  document.getElementById("loadFill").style.width = (weightRatio() * 100).toFixed(1) + "%";
}

function checkFinished() {
  if (!finished && nodes.length === Object.keys(NODES).length) {
    finished = true;
    showMessage("Everything is open. This is the shadow of one small charger.");
  }
}

let messageTimer = null;
function showMessage(text) {
  const m = document.getElementById("message");
  m.textContent = text;
  m.classList.add("show");
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => m.classList.remove("show"), 4000);
}

function setupInterface() {
  document.getElementById("putDown").addEventListener("click", () => {
    const wasCarrying = load > 0;
    reset();
    lastPanelKey = "";
    if (wasCarrying) showMessage("The charger is light again. The tailings are still there.");
  });

  const about = document.getElementById("about");
  document.getElementById("aboutBtn").addEventListener("click", () => { about.hidden = false; });
  document.getElementById("closeAbout").addEventListener("click", () => { about.hidden = true; });

  // build the source list on the About page from data.js
  const list = document.getElementById("sourceList");
  for (const key in SOURCES) {
    const s = SOURCES[key];
    const li = document.createElement("li");
    if (s.url) {
      const a = document.createElement("a");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = s.label;
      li.append(a);
    } else {
      li.textContent = s.label;
    }
    list.append(li);
  }
}
