# Material Shadow

ARTD6231 Ideas in Art and Technology — Week Eight practice piece (Speculative Design / Planetary Art).

**Live page:** https://yanwugirl.github.io/Ryan-Week8/

A small web piece made with p5.js. It starts with the universal charger from Project 0.
Each click opens one more layer of what the charger depends on:

**charger → parts → materials → places → what is left behind**

The more you open, the heavier your cursor gets. It lags behind your hand and sinks below it,
so even clicking becomes harder. The weight is symbolic; the facts in the text are sourced.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page: title, buttons, text panel, About page. Loads p5.js and the two scripts. |
| `style.css` | Layout and colours. |
| `data.js` | All the text and sources. Edit this to change what the nodes say. |
| `sketch.js` | The p5.js code: network, layout, heavy cursor, text panel. |

## How to run it

- Double-click `index.html` to open it in a browser (you need internet, because p5.js loads from a CDN).
- Or in VS Code, right-click `index.html` → **Open with Live Server**.
- Best on a computer with a mouse. On a phone, tapping works, but there is no heavy cursor.

## How to put it on GitHub Pages

1. Create a new public repository on GitHub, for example `Ryan-Week8`.
2. Upload the four files (`index.html`, `style.css`, `data.js`, `sketch.js`) and this README to the main branch.
3. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
4. After a minute or two, the site appears at `https://<your-username>.github.io/Ryan-Week8/`.

## How the code works (five steps)

1. **Nodes and edges.** `nodes` is the list of things on screen, `edges` the lines between them. Their text comes from `NODES` in `data.js`.
2. **Opening.** Clicking a node calls `openNode()`, which adds its `children`. Copper and plastic appear under several parts, so the tree becomes a network.
3. **Layout.** `simulate()` is a tiny physics simulation. Nodes push each other apart, edges pull connected nodes together, and each kind of node is pulled to its own ring: parts near the charger, waste on the outside.
4. **Load.** Every new node adds weight (`WEIGHT` in `data.js`). In `updateCursor()`, more weight means the cursor follows your mouse more slowly (`follow`) and hangs further below it (`sag`). Clicks use the heavy cursor's position, not the mouse.
5. **Text panel.** `updatePanel()` shows the node under the cursor, with its source link.

To change the text, only edit `data.js`. To make the cursor heavier or lighter, change the numbers in `updateCursor()`.

## Sources

- USGS, *Mineral Commodity Summaries 2026*: [Copper](https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-copper.pdf), [Tin](https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-tin.pdf), [Iron Ore](https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-iron-ore.pdf)
- US Department of Energy, [Energy and Environmental Profile of the U.S. Mining Industry: Copper](https://www.energy.gov/sites/default/files/2013/11/f4/copper.pdf)
- Kappalloy, [SAC305 solder alloy](https://www.kappalloy.com/solder-alloy/sac-solders/sac305/)
- Wikipedia, [Tin mining in Indonesia](https://en.wikipedia.org/wiki/Tin_mining_in_Indonesia) (citing WALHI, Kompas and Indonesia's Ministry of Energy and Mineral Resources)
- IEA policy database, [EU Regulation 2017/821](https://www.iea.org/policies/15682-eu-regulation-2017821-supply-chain-due-diligence-for-minerals-from-conflict-affected-and-high-risk-areas)
- Wikipedia, [Brumadinho dam disaster](https://en.wikipedia.org/wiki/Brumadinho_dam_disaster)
- NRDC, [Hidden Fossil Fuels](https://www.nrdc.org/bio/renee-sharp/hidden-fossil-fuels-plastic-production-drives-climate-change)
- UNITAR / ITU, [Global E-waste Monitor 2024](https://unitar.org/about/news-stories/press/global-e-waste-monitor-2024-electronic-waste-rising-five-times-faster-documented-e-waste-recycling)
- Parts list: my own teardown of a universal charger (Project 0)

Built with [p5.js](https://p5js.org) 1.9.4.
