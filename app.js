// Wedding budget site: click-through prototype.
// Everything is sample data computed in the browser. No backend, no API.
// Progress is saved in this browser (localStorage) and can be shared by link.

const APP_NAME = 'Wedly'; // put your site name here

// Where the wedding is. Every price scales by this.
const REGIONS = [
  { id: 'town', name: 'Small town or rural', short: 'small town', m: 0.8 },
  { id: 'city', name: 'Mid-size city', short: 'mid-size city', m: 1 },
  { id: 'metro', name: 'Major metro', short: 'major metro', m: 1.4 },
];

// Each option has a sample real-world price: a fixed part plus a per-guest part (mid-size city numbers).
// "hours" and "helpers" are the time cost of doing it yourself; vendor options are 0.
const opt = (label, fixed, perGuest, hours = 0, helpers = 0) => ({ label, fixed, perGuest, hours, helpers });
const CATS = [
  { id: 'venue', imgs: ['1571268373914-e888c6dafeff','1721677337543-37b07e7e28b5','1670529776286-f426fb7ba42c','1665607437981-973dcd6a22bb'], name: 'Venues', w: 30, tone: '#CFE3D2', opts: [
    opt('Backyard or family property', 600, 8, 20, 4),
    opt('Park pavilion or church hall', 900, 10, 10, 3),
    opt('Community event center', 2500, 15, 4, 1),
    opt('Full-service venue', 5000, 45),
  ] },
  { id: 'food', imgs: ['1576842546422-60562b9242ae','1651964060295-ef9e1ee08667','1555244162-803834f70033','1502635385003-ee1e6a1a742d'], name: 'Catering', w: 25, tone: '#F3DDB5', opts: [
    opt('Family-made buffet', 300, 18, 24, 5),
    opt('Food truck', 1000, 28, 2),
    opt('Drop-off catering', 400, 40, 4, 2),
    opt('Plated catering', 1200, 85),
  ] },
  { id: 'photos', imgs: ['1629756048377-09540f52caa1','1519741196428-6a2175fa2557','1617724975854-70b5d0cedb0a','1622277430358-f4d134452e2e'], name: 'Photographers', w: 12, tone: '#D5DDF2', opts: [
    opt('Friend with a rented camera', 250, 0, 8, 1),
    opt('Student photographer, 4 hours', 900, 0),
    opt('Local pro, 6 hours', 2800, 0),
    opt('Premium studio, full day', 6500, 0),
  ] },
  { id: 'attire', imgs: ['1579583764988-3e08c6132d2a','1550005809-91ad75fb315f','1591604466107-ec97de577aff','1549488497-94b52bddac5d'], name: 'Attire', w: 8, tone: '#E7D3E6', opts: [
    opt('Borrowed or thrifted', 150, 0, 6),
    opt('Rental', 500, 0),
    opt('Off the rack', 1400, 0),
    opt('Custom boutique', 4000, 0),
  ] },
  { id: 'flowers', imgs: ['1485700281629-290c5a704409','1710587385309-f264b4d503cd','1595467959554-9ffcbf37f10f','1561848355-890d054dc55a'], name: 'Florists', w: 8, tone: '#F4D6CC', opts: [
    opt('Grocery-store blooms, arranged by you', 150, 2, 10, 2),
    opt('Wholesale order, you arrange', 350, 4, 14, 3),
    opt('Local florist basics', 900, 9),
    opt('Full floral design', 2500, 25),
  ] },
  { id: 'music', imgs: ['1708569177086-2710ef4b1620','1708569176813-746f00614012','1758810411287-a362740f269e','1617634937372-995ee45d85b6'], name: 'Music', w: 7, tone: '#D3E8EA', opts: [
    opt('Playlist and a rented speaker', 150, 0, 5, 1),
    opt('Friend as MC with a playlist', 300, 0, 4, 1),
    opt('Local DJ', 1200, 0),
    opt('Live band', 4000, 0),
  ] },
];

// Smaller lines that used to hide inside "everything else". Priced at a typical mid level.
const LINES = [
  { id: 'cake', name: 'Cake and dessert', fixed: 100, perGuest: 4.5 },
  { id: 'invites', name: 'Invitations and postage', fixed: 80, perGuest: 3 },
  { id: 'decor', name: 'Decor and rentals', fixed: 300, perGuest: 5 },
  { id: 'rings', name: 'Wedding bands', fixed: 900, perGuest: 0 },
  { id: 'officiant', name: 'Officiant and license', fixed: 350, perGuest: 0 },
];
const LINES_CAP = 0.3; // the small lines never take more than this share of the budget

// Inspiration looks. A look can touch several categories. pro and diy are [fixed, perGuest].
const LOOKS = [
  { img: '1670529776180-60e4132ab90c', title: 'Floral arch', tone: '#CFE3D2', parts: [
    { cat: 'flowers', pro: [1200, 0], diy: [300, 0], hours: 6 },
    { cat: 'decor', pro: [250, 0], diy: [80, 0], hours: 2 } ] },
  { img: '1519225421980-715cb0215aed', title: 'Long-table dinner', tone: '#F3DDB5', parts: [
    { cat: 'food', pro: [800, 70], diy: [200, 22], hours: 24 },
    { cat: 'decor', pro: [150, 6], diy: [60, 3], hours: 5 } ] },
  { img: '1629141731648-0bce61cf4f7e', title: 'Hand-tied bouquets', tone: '#E7D3E6', parts: [
    { cat: 'flowers', pro: [600, 0], diy: [180, 0], hours: 4 } ] },
  { img: '1708569177111-40b155d78801', title: 'First-dance setup', tone: '#D5DDF2', parts: [
    { cat: 'music', pro: [900, 0], diy: [250, 0], hours: 4 },
    { cat: 'decor', pro: [400, 2], diy: [150, 1], hours: 6 } ] },
  { img: '1595467959554-9ffcbf37f10f', title: 'Candlelit tablescape', tone: '#F4D6CC', parts: [
    { cat: 'decor', pro: [200, 9], diy: [80, 4], hours: 8 },
    { cat: 'flowers', pro: [300, 7], diy: [100, 3], hours: 5 } ] },
  { img: '1555244162-803834f70033', title: 'Dessert table instead of cake', tone: '#F3DDB5', parts: [
    { cat: 'cake', pro: [150, 6], diy: [60, 2.5], hours: 8 } ] },
];

const fresh = () => ({
  page: 'home',      // home | budget | vendors | inspo | picks | schedule
  built: false,      // has the couple built a budget yet?
  budget: 15000,
  guests: 75,
  region: 'city',
  picks: ['photos'],
  cat: 'venue',
  chosen: {},        // { venue: { i } } where i is the option index
  date: '2027-06-12', // wedding date (YYYY-MM-DD)
  done: {},           // checklist items ticked by hand
  custom: null,      // amounts set by hand with the sliders, or null for the suggested split
  imported: false,
  flash: '',         // one-off message, cleared on the next click
  share: '',         // share link once the couple asks for it
  view: 'calendar',  // schedule view: calendar | list
  calMonth: new Date().toISOString().slice(0, 7), // month shown on the calendar (YYYY-MM)
  listings: [],      // items the couple listed themselves
  people: [],        // helpers: { id, name, role, cap, covers: [], tasks: [], accepted }
  who: null,         // when set, this device is a helper looking at their own part
  shareWho: null,    // which helper the current share link is for
  open: {},          // budget rows with the options panel open
  step: null,        // which phase walkthrough is open on the dashboard (0-3) or null
  cloudCode: '',     // share code of this plan in the cloud, if synced
  editKey: '',       // private key that lets this device edit the cloud copy
  board: null,       // imported Pinterest board { url, title, looks }
  importing: false,
  importError: '',
  importUrl: '',
  resold: false,     // the couple listed their wedding gear for rent
  showOver: {},      // budget rows showing over-budget options too
  rentals: {},       // { listingId: true } booked from the marketplace
  market: { tab: 'browse', cat: 'all', q: '' },
});
const state = fresh();

// ---------- Saving and sharing ----------

const SAVE_KEY = 'wedding-budget-proto';
const SAVED = ['page', 'built', 'budget', 'guests', 'region', 'picks', 'cat', 'chosen', 'date', 'done', 'custom', 'imported', 'view', 'listings', 'rentals', 'market', 'people', 'who', 'resold', 'step', 'board'];
const snapshot = () => { const o = {}; SAVED.forEach((k) => { o[k] = state[k]; }); return o; };
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...snapshot(), cloudCode: state.cloudCode, editKey: state.editKey })); } catch (e) { /* private window or storage off */ }
  if (typeof cloud !== 'undefined') cloud.schedule();
}
function shareLink(who) {
  if (state.cloudCode) return `${location.origin}${location.pathname}?plan=${state.cloudCode}${who ? `&who=${who}` : ''}`;
  const snap = snapshot();
  snap.who = who || null;
  snap.page = who ? 'helper' : 'home';
  const b = btoa(unescape(encodeURIComponent(JSON.stringify(snap)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return location.origin + location.pathname + '#s=' + b;
}
function load() {
  let data = null;
  let shared = false;
  const h = location.hash.match(/^#s=([A-Za-z0-9_-]+)$/);
  if (h) {
    try {
      data = JSON.parse(decodeURIComponent(escape(atob(h[1].replace(/-/g, '+').replace(/_/g, '/')))));
      shared = true;
      history.replaceState(null, '', location.pathname);
    } catch (e) { data = null; }
  }
  if (!data) { try { data = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { data = null; } }
  if (data && typeof data === 'object') { SAVED.forEach((k) => { if (data[k] !== undefined) state[k] = data[k]; }); if (!shared) { state.cloudCode = data.cloudCode || ''; state.editKey = data.editKey || ''; } }
  if (shared) {
    if (state.who && personById(state.who)) { state.page = 'helper'; state.flash = ''; }
    else { state.who = null; state.page = 'home'; state.flash = 'Opened a shared plan. Changes you make here are saved on this device only.'; }
  } else if (state.who && !personById(state.who)) { state.who = null; }
}


// ---------- Cloud sync, Pinterest import and deposits. All off until config.js is filled in. ----------
const CFG = window.WEDLY_CONFIG || {};
const cloudOn = () => !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY && window.supabase);
const pinsOn = () => !!CFG.PINTEREST_PROXY;
const stripeOn = () => !!CFG.STRIPE_DEPOSIT_LINK;
const randomCode = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n))).map((b) => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');

const cloud = {
  sb: null,
  status: '',      // '', 'saving', 'saved', or an error message
  timer: null,
  poll: null,
  init() { if (cloudOn()) this.sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY); },
  owner() { return !!(state.cloudCode && state.editKey); },
  async publish() {
    if (!state.cloudCode) { state.cloudCode = randomCode(7); state.editKey = randomCode(20); }
    const { error } = await this.sb.rpc('save_plan', { p_code: state.cloudCode, p_key: state.editKey, p_data: snapshot() });
    if (error) throw error;
  },
  // Called after every local save. Waits a moment so slider drags do not spam the server.
  schedule() {
    if (!cloudOn() || !this.owner()) return;
    clearTimeout(this.timer);
    this.setStatus('saving');
    this.timer = setTimeout(() => this.publish().then(() => this.setStatus('saved')).catch((e) => this.setStatus('could not save: ' + e.message)), 900);
  },
  setStatus(s) { this.status = s; app.querySelectorAll('[data-bind=cloudStatus]').forEach((el) => { el.textContent = this.statusText(); el.className = 'cloud-status ' + (s === 'saved' ? 'ok' : s === 'saving' ? '' : 'bad'); }); },
  statusText() { return this.status === 'saved' ? 'Synced' : this.status === 'saving' ? 'Saving…' : this.status || 'Synced'; },
  async fetchPlan(code) { const { data, error } = await this.sb.rpc('get_plan', { p_code: code }); if (error) throw error; return data; },
  async respond(personId) {
    const p = personById(personId);
    if (!p) return;
    const done = {};
    (p.tasks || []).forEach((t) => { if (state.done[t]) done[t] = true; });
    const { error } = await this.sb.rpc('respond', { p_code: state.cloudCode, p_person: personId, p_accepted: p.accepted || null, p_done: done });
    if (error) throw error;
  },
  // The couple pulls every helper's answers and merges them in.
  async pullResponses() {
    const { data, error } = await this.sb.rpc('get_responses', { p_code: state.cloudCode });
    if (error || !data) return false;
    let changed = false;
    data.forEach((r) => {
      const p = personById(r.person_id);
      if (!p) return;
      if (r.accepted && p.accepted !== r.accepted) { p.accepted = r.accepted; changed = true; }
      Object.keys(r.done || {}).forEach((t) => { if (r.done[t] && !state.done[t]) { state.done[t] = true; changed = true; } });
    });
    return changed;
  },
  startPolling() {
    if (!cloudOn() || !this.owner() || this.poll) return;
    this.poll = setInterval(async () => { if (await this.pullResponses()) render(); }, 20000);
  },
  // On page load: a ?plan= link replaces whatever is on this device with the cloud copy.
  async boot() {
    this.init();
    const q = new URLSearchParams(location.search);
    const code = q.get('plan');
    if (code && cloudOn()) {
      try {
        const data = await this.fetchPlan(code);
        if (data) {
          Object.assign(state, fresh());
          SAVED.forEach((k) => { if (data[k] !== undefined) state[k] = data[k]; });
          state.cloudCode = code;
          state.editKey = q.get('key') || '';
          const who = q.get('who');
          if (who && personById(who)) { state.who = who; state.page = 'helper'; }
          else { state.who = null; state.page = 'home'; state.flash = state.editKey ? 'Your plan is synced to this device too.' : 'Viewing a shared plan. Edits stay on this device unless you have the private link.'; }
          if (state.who) {
            const { data: rs } = await this.sb.rpc('get_responses', { p_code: code });
            const mine = (rs || []).find((r) => r.person_id === state.who);
            if (mine) { const p = personById(state.who); if (mine.accepted) p.accepted = mine.accepted; Object.keys(mine.done || {}).forEach((t) => { if (mine.done[t]) state.done[t] = true; }); }
          }
        } else { state.flash = 'That plan link is not valid any more.'; }
      } catch (e) { state.flash = 'Could not load the shared plan: ' + e.message; }
      history.replaceState(null, '', location.pathname);
      render();
    }
    if (this.owner()) { this.status = 'saved'; if (await this.pullResponses()) render(); this.startPolling(); }
  },
};

// Pinterest: turn a board URL into priced looks using keywords in the pin titles.
const PIN_WORDS = [
  { cat: 'flowers', words: ['bouquet', 'floral', 'flower', 'peony', 'peonies', 'rose', 'greenery', 'eucalyptus', 'centerpiece', 'arch', 'boutonniere', 'garland'] },
  { cat: 'decor', words: ['table', 'tablescape', 'candle', 'light', 'sign', 'backdrop', 'arch', 'linen', 'chair', 'rustic', 'boho', 'decor', 'centerpiece', 'garland', 'lantern', 'runner', 'place card', 'seating chart'] },
  { cat: 'cake', words: ['cake', 'dessert', 'donut', 'cupcake', 'macaron', 'sweets'] },
  { cat: 'food', words: ['dinner', 'food', 'buffet', 'catering', 'charcuterie', 'grazing', 'cocktail', 'bar', 'drink', 'taco', 'pizza', 'menu'] },
  { cat: 'attire', words: ['dress', 'gown', 'suit', 'tux', 'veil', 'bridesmaid', 'groom', 'bridal', 'shoes', 'hair', 'makeup'] },
  { cat: 'photos', words: ['photo', 'portrait', 'pose', 'shot', 'photography', 'engagement'] },
  { cat: 'music', words: ['band', 'dj', 'dance', 'first dance', 'playlist', 'song'] },
  { cat: 'venue', words: ['barn', 'venue', 'ceremony', 'outdoor', 'tent', 'backyard', 'garden', 'reception', 'aisle'] },
  { cat: 'invites', words: ['invitation', 'invite', 'stationery', 'save the date', 'calligraphy'] },
];
const PIN_COST = { // pro [fixed, perGuest], diy [fixed, perGuest], hours
  flowers: { pro: [500, 6], diy: [150, 2], hours: 6 },
  decor: { pro: [250, 5], diy: [80, 2], hours: 5 },
  cake: { pro: [150, 5], diy: [60, 2], hours: 6 },
  food: { pro: [400, 40], diy: [150, 15], hours: 12 },
  attire: { pro: [900, 0], diy: [250, 0], hours: 4 },
  photos: { pro: [600, 0], diy: [150, 0], hours: 3 },
  music: { pro: [700, 0], diy: [150, 0], hours: 3 },
  venue: { pro: [1500, 10], diy: [500, 6], hours: 10 },
  invites: { pro: [80, 3], diy: [30, 1], hours: 6 },
};
const TONES = ['#fde2e4', '#fbe7d6', '#f6e6ee', '#e9eef3', '#f4ecd8', '#e6efe9'];
function pinToLook(pin, i, boardTitle) {
  const t = `${pin.title || ''} ${pin.text || ''} ${pin.title || pin.text ? '' : boardTitle || ''}`.toLowerCase();
  let cats = PIN_WORDS.filter((w) => w.words.some((k) => t.includes(k))).map((w) => w.cat);
  cats = [...new Set(cats)].slice(0, 2);
  if (!cats.length) cats = ['decor'];
  const label = (pin.title || pin.text || '').trim().slice(0, 90);
  return { img: pin.img, url: pin.link, title: label || `${boardTitle || 'Pinned'} look ${i + 1}`, tone: TONES[i % TONES.length], parts: cats.map((c) => ({ cat: c, pro: PIN_COST[c].pro, diy: PIN_COST[c].diy, hours: PIN_COST[c].hours })) };
}
async function importBoard(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 30000);
  let r;
  try { r = await fetch(`${CFG.PINTEREST_PROXY.replace(/\/$/, '')}?board=${encodeURIComponent(url)}`, { signal: ctl.signal }); }
  catch (e) { throw new Error(e.name === 'AbortError' ? 'Pinterest took too long to answer. Try again in a minute.' : 'Failed to fetch'); }
  finally { clearTimeout(timer); }
  let j;
  try { j = await r.json(); } catch (e) { throw new Error(`The importer answered with something unexpected (status ${r.status}).`); }
  if (!r.ok || j.error) throw new Error(j.error || `Import failed (status ${r.status})`);
  if (!j.pins.length) throw new Error('No pins found on that board');
  return { url, title: j.title || 'Your board', looks: j.pins.slice(0, 24).map((pin, i) => pinToLook(pin, i, j.title)) };
}
const currentLooks = () => (state.board && state.board.looks && state.board.looks.length ? state.board.looks : LOOKS);


// ---------- Style matching: your board's look, matched to vendors who do that look ----------
const STYLES = {
  boho: ['boho', 'bohemian', 'pampas', 'macrame', 'wild', 'dried', 'desert'],
  rustic: ['rustic', 'barn', 'wood', 'mason', 'burlap', 'farmhouse', 'country'],
  classic: ['classic', 'elegant', 'timeless', 'ballroom', 'formal', 'black tie', 'traditional'],
  romantic: ['romantic', 'blush', 'peony', 'peonies', 'rose', 'soft', 'dreamy', 'whimsical'],
  garden: ['garden', 'greenery', 'eucalyptus', 'wildflower', 'outdoor', 'meadow', 'botanical', 'picnic'],
  modern: ['modern', 'minimal', 'minimalist', 'clean', 'geometric', 'sleek', 'city', 'loft'],
  moody: ['moody', 'dark', 'burgundy', 'candlelit', 'velvet', 'jewel', 'gothic', 'black'],
  vintage: ['vintage', 'antique', 'lace', 'retro', 'old', 'heirloom', '70s', 'disco'],
  coastal: ['beach', 'coastal', 'sea', 'ocean', 'nautical', 'lake'],
};
const STYLE_NAMES = { boho: 'Boho', rustic: 'Rustic', classic: 'Classic', romantic: 'Romantic', garden: 'Garden', modern: 'Modern', moody: 'Moody', vintage: 'Vintage', coastal: 'Coastal' };

// Sample local vendors with the styles they are known for. tier maps to the option prices (1 to 3).
const VENDORS = {
  venue: [
    { name: 'Hollow Oak Barn', tier: 2, styles: ['rustic', 'garden', 'boho'], known: 'string lights, open field ceremonies' },
    { name: 'The Foundry Loft', tier: 2, styles: ['modern', 'moody', 'classic'], known: 'exposed brick, candlelit dinners' },
    { name: 'Rosemont Gardens', tier: 3, styles: ['garden', 'romantic', 'classic'], known: 'rose walk ceremonies, tented receptions' },
    { name: 'Lakeside Pavilion', tier: 1, styles: ['coastal', 'garden', 'rustic'], known: 'sunset photos, bring-your-own catering' },
  ],
  food: [
    { name: 'Hearth & Harvest', tier: 2, styles: ['rustic', 'garden', 'boho'], known: 'family-style platters, grazing tables' },
    { name: 'Lola\'s Taco Truck', tier: 1, styles: ['boho', 'coastal', 'vintage'], known: 'late-night tacos, agua frescas' },
    { name: 'Maison Table', tier: 3, styles: ['classic', 'romantic', 'modern'], known: 'plated courses, champagne towers' },
  ],
  photos: [
    { name: 'Juniper Lane Photo', tier: 2, styles: ['boho', 'garden', 'romantic'], known: 'film-look, golden hour, candid' },
    { name: 'Noir Studio', tier: 3, styles: ['moody', 'modern', 'classic'], known: 'editorial, flash, black and white' },
    { name: 'Em Rivera (student)', tier: 1, styles: ['vintage', 'romantic', 'coastal'], known: 'documentary style, disposable-camera add-on' },
  ],
  attire: [
    { name: 'Thrift Bride Co.', tier: 1, styles: ['vintage', 'boho', 'romantic'], known: 'restored lace, 70s silhouettes' },
    { name: 'Atelier Row', tier: 3, styles: ['classic', 'modern', 'romantic'], known: 'clean lines, custom veils' },
    { name: 'Rent the Aisle', tier: 1, styles: ['classic', 'modern', 'garden'], known: 'designer rentals, suits and gowns' },
  ],
  flowers: [
    { name: 'Wildstem Floral', tier: 2, styles: ['boho', 'garden', 'romantic'], known: 'wildflowers, dried pampas, loose arches' },
    { name: 'Petal & Pine', tier: 2, styles: ['rustic', 'garden', 'classic'], known: 'greenery garlands, mason jar centerpieces' },
    { name: 'Maison Bloom', tier: 3, styles: ['classic', 'romantic', 'modern'], known: 'white roses, peonies, full installs' },
    { name: 'Thistle Studio', tier: 3, styles: ['moody', 'modern', 'vintage'], known: 'burgundy palettes, sculptural stems' },
  ],
  music: [
    { name: 'DJ Marisol', tier: 2, styles: ['modern', 'boho', 'coastal'], known: 'open-format, sunset sets' },
    { name: 'The Oak Street Trio', tier: 3, styles: ['classic', 'romantic', 'garden'], known: 'strings for ceremony, jazz for dinner' },
    { name: 'Retro Hour Band', tier: 3, styles: ['vintage', 'rustic', 'moody'], known: '70s soul, disco closers' },
  ],
};

// The couple's style profile from pin titles, strongest first. Falls back to priorities if no board.
function styleProfile() {
  const counts = {};
  const looks = state.board && state.board.looks ? state.board.looks : [];
  looks.forEach((l) => { const t = (l.title || '').toLowerCase(); Object.keys(STYLES).forEach((s) => { if (STYLES[s].some((w) => t.includes(w))) counts[s] = (counts[s] || 0) + 1; }); });
  if (!looks.length && state.imported) { counts.garden = 3; counts.romantic = 2; counts.boho = 1; } // sample board
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 3);
}

function vendorMatches(catId) {
  const prof = styleProfile();
  const c = CATS.find((x) => x.id === catId);
  return (VENDORS[catId] || []).map((v) => {
    const hits = v.styles.filter((s) => prof.includes(s));
    return { ...v, hits, score: hits.length, price: priceOf(c, v.tier) };
  }).sort((a, b) => b.score - a.score || a.price - b.price);
}

function vendorCards(catId, limit) {
  const prof = styleProfile();
  const alloc = allocations();
  const list = vendorMatches(catId).slice(0, limit || 4);
  const c = CATS.find((x) => x.id === catId);
  const p = pickOf(c);
  return list.map((v) => `
    <div class="card vendor ${v.score && prof.length ? 'match' : ''}">
      <div class="stack">
        <div class="row"><span>${v.name}</span><span class="small">${money(v.price)}</span></div>
        <div class="muted small">Known for ${v.known}</div>
        <div class="chips">${v.styles.map((s) => `<span class="badge ${v.hits.includes(s) ? 'fit' : 'who'}">${STYLE_NAMES[s]}</span>`).join('')}</div>
        <div class="row-actions">
          <span class="small">${prof.length ? (v.score ? `<b>Matches ${v.score} of your ${prof.length} styles</b>` : 'Not your look') : '<span class="muted">Import a board to match by style</span>'}</span>
          <span>${v.price > alloc[catId] ? `<span class="badge over">Over by ${money(v.price - alloc[catId])}</span>` : '<span class="badge fit">In range</span>'} <button class="choice chip ${p && p.i === v.tier ? 'on' : ''}" data-cat="${catId}" data-choose="${v.tier}">${p && p.i === v.tier ? 'Added' : 'Add'}</button></span>
        </div>
      </div>
    </div>`).join('');
}

function styleStrip() {
  const prof = styleProfile();
  if (!prof.length) return '';
  return `<div class="style-strip"><span class="muted small">Your look from your board:</span>${prof.map((s) => `<span class="badge fit">${STYLE_NAMES[s]}</span>`).join('')}</div>`;
}

// ---------- Money helpers ----------

// Free stock photos from Unsplash, loaded by link. If one fails, the tinted block shows instead.
const photo = (id, tone) =>
  `<span class="photo" style="background:${tone}"><img src="${/^https?:/.test(id) ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&q=70`}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"></span>`;

const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
const round = (n, step) => Math.round(n / step) * step;
const isPick = (id) => state.picks.includes(id);
const catName = (id) => (CATS.find((c) => c.id === id) || LINES.find((l) => l.id === id)).name.toLowerCase();
const region = () => REGIONS.find((r) => r.id === state.region) || REGIONS[1];
const cost = (fixed, perGuest) => (fixed + perGuest * state.guests) * region().m;
const priceOf = (c, i) => round(cost(c.opts[i].fixed, c.opts[i].perGuest), 25);
// The option the couple chose in a category, with its live price (updates when guests or region change).
const pickOf = (c) => {
  const ch = state.chosen[c.id];
  if (!ch) return null;
  const o = c.opts[ch.i];
  return { i: ch.i, label: o.label, price: priceOf(c, ch.i), hours: o.hours, helpers: o.helpers, perGuest: o.perGuest };
};

// Split the budget: the small lines get their estimated cost (capped), the rest goes to
// the six main categories, weighting priorities 1.5x.
function allocations() {
  const alloc = { lines: {} };
  let linesTotal = 0;
  LINES.forEach((l) => { alloc.lines[l.id] = round(cost(l.fixed, l.perGuest), 25); linesTotal += alloc.lines[l.id]; });
  const cap = state.budget * LINES_CAP;
  alloc.trimmed = linesTotal > cap;
  if (alloc.trimmed) {
    const s = cap / linesTotal;
    LINES.forEach((l) => { alloc.lines[l.id] = round(alloc.lines[l.id] * s, 25); });
    linesTotal = LINES.reduce((t, l) => t + alloc.lines[l.id], 0);
  }
  const pool = Math.max(0, state.budget - linesTotal);
  if (state.custom) {
    const sum = CATS.reduce((t, c) => t + (state.custom[c.id] || 0), 0) || 1;
    CATS.forEach((c) => { alloc[c.id] = round(((state.custom[c.id] || 0) / sum) * pool, 25); });
  } else {
    const weight = (c) => c.w * (isPick(c.id) ? 1.5 : 1);
    const total = CATS.reduce((t, c) => t + weight(c), 0);
    CATS.forEach((c) => { alloc[c.id] = round((pool * weight(c)) / total, 25); });
  }
  alloc.other = linesTotal;
  alloc.pool = pool;
  return alloc;
}
const allocOf = (alloc, id) => (alloc.lines[id] !== undefined ? alloc.lines[id] : alloc[id]);

// Set one category by hand. The other categories shrink or grow to keep the total the same.
function setAmount(id, value) {
  const cur = allocations();
  const v = Math.max(0, Math.min(value, cur.pool));
  const rest = cur.pool - cur[id];
  const scale = rest > 0 ? (cur.pool - v) / rest : 0;
  const next = {};
  CATS.forEach((c) => { next[c.id] = c.id === id ? v : cur[c.id] * scale; });
  state.custom = next;
}

function totals() {
  const alloc = allocations();
  let planned = 0;
  let saved = 0;
  let hours = 0;
  let helpers = 0;
  CATS.forEach((c) => {
    const p = pickOf(c);
    if (p) { planned += p.price; saved += alloc[c.id] - p.price; hours += p.hours; helpers = Math.max(helpers, p.helpers); }
  });
  const hidden = hiddenCosts();
  const extras = hidden.reduce((t, h) => t + h.amount, 0);
  const rentals = rentalsTotal();
  return { alloc, planned, saved, hours, helpers, hidden, extras, rentals, real: planned + rentals + extras };
}

// The costs couples forget: tax, tips, fees, alterations, vendor meals and overages.
// Based on what has been picked, so DIY routes carry fewer of them.
// Deposits held in escrow for vendor picks, and what vendors pay us on those bookings.
function deposits() {
  let held = 0;
  let booked = 0;
  CATS.forEach((c) => { const p = pickOf(c); if (p && state.chosen[c.id].deposit) { held += p.price * DEPOSIT; booked += p.price; } });
  return { held, booked, fee: booked * VENDOR_FEE };
}

function hiddenCosts() {
  const m = region().m;
  const tier = (id) => (state.chosen[id] ? state.chosen[id].i : -1);
  const price = (id) => { const c = CATS.find((x) => x.id === id); const p = pickOf(c); return p ? p.price : 0; };
  const items = [];
  const taxable = price('food') + price('flowers') + price('attire');
  if (taxable) items.push({ name: 'Sales tax', amount: taxable * 0.07, why: 'about 7% on food, flowers and attire' });
  if (tier('food') >= 2) items.push({ name: 'Gratuity and service charge', amount: price('food') * 0.2, why: '18 to 22% on catered food' });
  else if (tier('food') === 1) items.push({ name: 'Gratuity', amount: price('food') * 0.1, why: 'about 10% for a food truck crew' });
  let fees = 0;
  const why = [];
  if (tier('venue') >= 2) { fees += 300 * m; why.push('venue cleaning deposit'); }
  if (tier('food') >= 2) { fees += 200 * m; why.push('catering delivery and setup'); }
  if (tier('flowers') >= 2) { fees += 150 * m; why.push('floral delivery'); }
  if (fees) items.push({ name: 'Delivery, setup and cleanup fees', amount: fees, why: why.join(', ') });
  if (tier('attire') >= 2) items.push({ name: 'Alterations', amount: 250 * m, why: 'hemming and fitting are rarely included' });
  const crew = (tier('photos') >= 2 ? 2 : 0) + (tier('music') === 3 ? 4 : tier('music') === 2 ? 1 : 0);
  if (crew && tier('food') >= 1) items.push({ name: 'Vendor meals', amount: crew * 45 * m, why: `${crew} working vendors need to eat` });
  const planned = CATS.reduce((t, c) => t + price(c.id), 0);
  if (tier('venue') >= 2) items.push({ name: 'Event liability insurance', amount: 150 * m, why: 'most venues require it' });
  if (planned) items.push({ name: 'Last-minute extras', amount: planned * 0.05, why: 'most couples go 5 to 10% over' });
  items.forEach((i) => { i.amount = round(i.amount, 5); });
  return items;
}

// What one more guest costs, using the chosen option or a mid-tier estimate where nothing is chosen.
function perGuestCost() {
  let pg = 0;
  CATS.forEach((c) => { const p = pickOf(c); pg += p ? p.perGuest : c.opts[2].perGuest; });
  LINES.forEach((l) => { pg += l.perGuest; });
  return pg * region().m;
}

const COLORS = { venue: '#d2407f', food: '#e86aa3', photos: '#f6969d', attire: '#ffc6ca', flowers: '#8e2b5c', music: '#dca3c4', other: '#e8dcd8' };

// Donut chart drawn as SVG. Clicking a slice toggles that category as a priority.
function pie(alloc) {
  const parts = CATS.map((c) => ({ id: c.id, name: c.name })).concat([{ id: 'other', name: 'Smaller lines' }]);
  const R = 100;
  const r = 58;
  const pt = (ang, rad) => `${(110 + rad * Math.cos(ang)).toFixed(2)} ${(110 + rad * Math.sin(ang)).toFixed(2)}`;
  let a = -Math.PI / 2;
  const paths = parts.map((p) => {
    const frac = alloc[p.id] / state.budget;
    if (!(frac > 0)) return '';
    const a0 = a;
    const a1 = a0 + Math.min(frac, 0.9999) * 2 * Math.PI;
    a = a0 + frac * 2 * Math.PI;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const click = p.id === 'other' ? '' : `data-pick="${p.id}" style="cursor:pointer"`;
    return `<path d="M ${pt(a0, R)} A ${R} ${R} 0 ${large} 1 ${pt(a1, R)} L ${pt(a1, r)} A ${r} ${r} 0 ${large} 0 ${pt(a0, r)} Z" fill="${COLORS[p.id]}" stroke="#fff" stroke-width="${isPick(p.id) ? 5 : 2}" ${click}><title>${p.name}: ${money(alloc[p.id])} (${Math.round(frac * 100)}%)</title></path>`;
  }).join('');
  return `<svg viewBox="0 0 220 220" role="img" aria-label="Budget split by category">${paths}
    <text x="110" y="104" text-anchor="middle" font-size="13" fill="#5f6b7a">Total</text>
    <text x="110" y="128" text-anchor="middle" font-size="21" font-weight="700" fill="#13233a">${money(state.budget)}</text></svg>`;
}

function budgetInput() {
  return `<div class="money-input"><span>$</span><input id="budgetInput" type="number" inputmode="numeric" min="500" step="100" value="${state.budget}" data-budget-input aria-label="Total budget in dollars"></div>`;
}

function guestNote() {
  const pg = perGuestCost();
  return `Each guest costs about <b>${money(pg)}</b>. Ten fewer guests saves about <b>${money(pg * 10)}</b>.`;
}

// ---------- Shared pieces ----------

function nav() {
  const link = (id, name) => `<button class="${state.page === id ? 'on' : ''}" data-go="${id}">${name}</button>`;
  return `
  <header class="nav"><div class="wrap">
    <button class="logo" data-go="home">${APP_NAME}</button>
    <nav class="nav-links" aria-label="Main">
      ${state.who ? link('helper', 'My part') : `${link('home', 'Dashboard')}${link('budget', 'Budget')}${link('vendors', 'Vendors')}${link('inspo', 'Inspiration')}${link('market', 'Marketplace')}${link('people', 'Helpers')}${link('picks', 'Picks')}${link('schedule', 'Schedule')}${link('all', 'Everything')}`}
    </nav>
    <div class="nav-cta">${state.who ? '<button class="cta" data-fullview>Whole plan</button>' : state.built ? '' : '<button class="cta" data-go="budget">Set my budget</button>'}</div>
  </div></header>`;
}

function footer() {
  return `<footer><div class="wrap footer-row"><span class="muted small">Class prototype. Prices are sample numbers for a ${region().short}, saved in this browser.</span><span><button class="link small" data-go="about">About and pricing</button> · <button class="link small" data-startover>Start over</button></span></div></footer>`;
}

function flash() {
  return state.flash ? `<div class="note good" role="status">${state.flash}</div>` : '';
}

function catRows(alloc, only) {
  const max = round(alloc.pool, 50);
  return CATS.filter((c) => !only || only.includes(c.id)).map((c) => {
    const p = pickOf(c);
    const open = !!state.open[c.id];
    return `
    <div class="card cat">
      <div class="row"><span><i class="dot" style="background:${COLORS[c.id]}"></i>${c.name}</span><span data-amt="${c.id}">${money(alloc[c.id])}</span></div>
      <input type="range" min="0" max="${max}" step="50" value="${alloc[c.id]}" data-slide="${c.id}" aria-label="${c.name} budget">
      <div class="row-actions">
        <button class="choice chip ${isPick(c.id) ? 'on' : ''}" data-pick="${c.id}">${isPick(c.id) ? 'Priority' : 'Make priority'}</button>
        <button class="dropdown ${open ? 'open' : ''}" data-expand="${c.id}" aria-expanded="${open}"><span>${p ? `${p.label} · ${money(p.price)}` : 'See options in your range'}</span><span class="caret">${open ? '▴' : '▾'}</span></button>
      </div>
      ${open ? inlineOptions(c, alloc) : ''}
    </div>`;
  }).join('');
}

// The options for one category, inside the budget row. Rows over the slider amount are
// hidden and counted; patch() re-sorts them live as the slider moves.
function inlineOptions(c, alloc) {
  const a = alloc[c.id];
  const p = pickOf(c);
  const showOver = !!state.showOver[c.id];
  const rows = c.opts.map((o, i) => {
    const price = priceOf(c, i);
    const out = price > a;
    const on = p && p.i === i;
    return `
    <div class="opt ${out ? 'out' : ''} ${on ? 'on' : ''}" data-opt="${c.id}" data-price="${price}">
      <div class="opt-main"><b>${o.label}</b><span class="muted small">${o.hours ? `${o.hours} hrs DIY${o.helpers ? `, ${o.helpers} helper${o.helpers > 1 ? 's' : ''}` : ''}` : 'vendor handles it'}${o.perGuest ? ` · ${money(o.perGuest * region().m)} per guest` : ''}</span></div>
      <span class="badge" data-opt-badge>${out ? `Over by ${money(price - a)}` : o.hours ? 'DIY' : 'Fits'}</span>
      <span class="opt-price">${money(price)}</span>
      <button class="choice chip ${on ? 'on' : ''}" data-cat="${c.id}" data-choose="${i}">${on ? 'Added' : 'Add'}</button>
    </div>`;
  }).join('');
  const over = c.opts.filter((o, i) => priceOf(c, i) > a).length;
  return `
  <div class="opts ${showOver ? 'show-over' : ''}" data-opts="${c.id}">
    <div class="muted small">For ${state.guests} guests in a ${region().short}. Drag the slider and the list updates.</div>
    ${rows}
    <div class="opt-foot">
      <button class="link small" data-show-over="${c.id}" data-over-count="${c.id}">${over ? `${over} option${over > 1 ? 's' : ''} over ${money(a)} · ${showOver ? 'hide' : 'show'}` : 'Every option fits'}</button>
      <button class="link small" data-cat="${c.id}" data-go="vendors">Open full vendor page</button>
    </div>
  </div>`;
}

function linesCard(alloc) {
  const rows = LINES.map((l) => `<div class="line"><span>${l.name}</span><b data-amt="line-${l.id}">${money(alloc.lines[l.id])}</b></div>`).join('');
  return `
  <div class="card dashed stack">
    <div class="row"><span><i class="dot" style="background:${COLORS.other}"></i>Smaller lines</span><b data-amt="other">${money(alloc.other)}</b></div>
    <div class="lines">${rows}</div>
    <div class="muted small" data-bind="trimmed">${alloc.trimmed ? `These usually cost more than this at ${state.guests} guests. We trimmed them to ${Math.round(LINES_CAP * 100)}% of your budget so the big categories have room.` : `Estimated for ${state.guests} guests in a ${region().short}. Nothing hides in "everything else".`}</div>
  </div>`;
}

// ---------- Pages ----------

function about() {
  const alloc = allocations();
  const previewRows = CATS.slice(0, 4).map((c) =>
    `<div class="stat"><span>${c.name}</span><b>${money(alloc[c.id])}</b></div>`).join('');
  const tiles = CATS.map((c) => `
    <button class="card tile" data-cat="${c.id}" data-go="vendors">
      ${photo(c.imgs[3], c.tone)}
      <span class="body"><b>${c.name}</b><span class="muted small">DIY from ${money(priceOf(c, 0))}</span></span>
    </button>`).join('');
  return `
  <section class="hero"><div class="wrap">
    <div class="copy">
      <div class="eyebrow">DIY wedding planning</div>
      <h1>Plan the wedding you want on the budget you have.</h1>
      <p class="lead">Set your number, pick what matters most, and see real options in your price range, including the DIY route and the costs nobody warns you about.</p>
      <button class="primary gold" data-go="home">Open the dashboard</button>
    </div>
    <div class="preview">
      <div class="muted small">${state.built ? 'Your budget' : 'Sample budget'}</div>
      <div class="big">${money(state.budget)}</div>
      ${previewRows}
      <div class="stat"><span>Days to go</span><b>${Math.max(0, countdown().daysLeft)}</b></div>
      <div class="muted small">${state.guests} guests in a ${region().short}. Updates as you set your own numbers.</div>
    </div>
  </div></section>

  <section class="section"><div class="wrap stack wide">
    <div class="stack"><div class="eyebrow">Planning tools</div><h2>Everything in one place</h2></div>
    <div class="grid3">
      <div class="card tool"><h3>Budget planner</h3><p class="muted">See where every dollar goes, priced for your guest count and your area, weighted toward what you care about most.</p><button class="link" data-go="budget">Build my budget</button></div>
      <div class="card tool"><h3>Vendors with prices up front</h3><p class="muted">Browse options that fit each part of your budget, from DIY to full service. No calling around for quotes.</p><button class="link" data-go="vendors">Browse vendors</button></div>
      <div class="card tool"><h3>Price your inspiration</h3><p class="muted">Import a Pinterest board and see what each look costs, with a DIY version and the hours it takes.</p><button class="link" data-go="inspo">Import a board</button></div>
      <div class="card tool"><h3>Buy, sell or rent it</h3><p class="muted">Arches, tables, lights and dresses from couples who just got married. Sell yours after, or rent them out.</p><button class="link" data-go="market">Browse rentals</button></div>
    </div>
    <p class="muted small">Free to use. ${APP_NAME} earns a small commission only when a rental or service is booked through the site.</p>
  </div></section>

  <section class="section tinted"><div class="wrap stack wide">
    <div class="stack"><div class="eyebrow">Browse by category</div><h2>Find options that fit your number</h2></div>
    <div class="grid-cats">${tiles}</div>
  </div></section>

  <section class="section"><div class="wrap stack wide">
    <h2>How it works</h2>
    <div class="grid3">
      <div class="stack"><div class="step-num">1</div><h3>Set your total budget</h3><p class="muted">Tell us your number, your guest count and where the wedding is.</p></div>
      <div class="stack"><div class="step-num">2</div><h3>Choose your priorities</h3><p class="muted">We put more money where it matters to you and trim the rest.</p></div>
      <div class="stack"><div class="step-num">3</div><h3>Pick options in range</h3><p class="muted">Compare DIY and vendor options with prices shown up front, then see the real total with tax, tips and extras.</p></div>
    </div>
  </div></section>

  ${pitch()}
  <section class="section band"><div class="wrap">
    <h2>Know what your wedding costs before you book anything.</h2>
    <button class="primary gold" data-go="budget">Start my budget</button>
  </div></section>`;
}

function budgetSetup() {
  const budgets = [5000, 10000, 15000, 25000].map((b) =>
    `<button class="choice ${state.budget === b ? 'on' : ''}" data-budget="${b}">${money(b)}</button>`).join('');
  const regions = REGIONS.map((r) =>
    `<button class="choice ${state.region === r.id ? 'on' : ''}" data-region="${r.id}">${r.name}</button>`).join('');
  const guests = [30, 75, 120, 200].map((g) =>
    `<button class="choice ${state.guests === g ? 'on' : ''}" data-guests="${g}">${g}</button>`).join('');
  const picks = CATS.map((c) =>
    `<button class="choice ${isPick(c.id) ? 'on' : ''}" data-pick="${c.id}">${c.name}</button>`).join('');
  return `
  <section class="section"><div class="wrap two-col">
    <div class="main stack wide">
      <div class="stack"><div class="eyebrow">Budget planner</div><h1>Build your wedding budget</h1></div>
      <div class="stack"><h3>1. What is your total budget?</h3>${budgetInput()}<div class="muted small">Type any amount, or pick one:</div><div class="grid-auto">${budgets}</div></div>
      <div class="stack"><h3>2. Where is the wedding?</h3><div class="grid-auto">${regions}</div><div class="muted small">The same wedding costs about 40% more in a major metro than in a mid-size city, and about 20% less in a small town.</div></div>
      <div class="stack"><h3>3. About how many guests?</h3><div class="grid-auto">${guests}</div><div class="money-input guests"><input id="guestsInput" type="number" inputmode="numeric" min="10" max="1000" value="${state.guests}" data-guests-input aria-label="Number of guests"><span>guests</span></div><div class="muted small" data-bind="guestNote">${guestNote()}</div></div>
      <div class="stack"><h3>4. What matters most? Pick up to 3.</h3><div class="grid-auto">${picks}</div><div class="muted small">${state.picks.length} of 3 chosen</div></div>
    </div>
    <div class="side card">
      <div class="muted small">Your budget</div>
      <div class="big" data-bind="budget">${money(state.budget)}</div>
      <div class="stat"><span>Guests</span><b data-bind="guests">${state.guests}</b></div>
      <div class="stat"><span>Where</span><b>${region().name}</b></div>
      <div class="stat"><span>Budget per guest</span><b data-bind="perGuest">${money(state.budget / state.guests)}</b></div>
      <button class="primary block" data-build>Build my budget</button>
    </div>
  </div></section>`;
}

function budgetDashboard() {
  const { alloc, planned, saved, hidden, extras, rentals, real } = totals();
  const hasPicks = Object.keys(state.chosen).length > 0;
  return `
  <section class="section"><div class="wrap two-col">
    <div class="side card">
      <label class="muted small" for="budgetInput">Your wedding budget (type to change)</label>
      ${budgetInput()}
      <div id="pie">${pie(alloc)}</div>
      <p class="muted small">Click a slice to make it a priority. Drag a slider to set an amount yourself.</p>
      <div class="stat"><span>Guests</span><span class="stepper"><button data-guests-delta="-10" aria-label="10 fewer guests">−</button><b data-bind="guests">${state.guests}</b><button data-guests-delta="10" aria-label="10 more guests">+</button></span></div>
      <div class="muted small" data-bind="guestNote">${guestNote()}</div>
      <div class="stat"><span>Where</span><b>${region().name}</b></div>
      <div class="stat"><span>Planned so far</span><b>${money(planned)}</b></div>
      ${rentals ? `<div class="stat"><span>Marketplace</span><b>${money(rentals)}</b></div>` : ''}
      ${hasPicks ? `<div class="stat"><span>Tax, tips and extras</span><b>${money(extras)}</b></div><div class="stat"><span>Real total</span><b>${money(real)}</b></div>` : ''}
      <div class="stat"><span>Left to plan</span><b data-bind="left">${money(state.budget - real)}</b></div>
      <div class="stat"><span>Budget per guest</span><b data-bind="perGuest">${money(state.budget / state.guests)}</b></div>
      ${state.custom ? '<button class="ghost" data-reset>Reset to suggested split</button>' : ''}
      <button class="ghost" data-edit>Edit guests, region and priorities</button>
      <button class="primary block" data-export>Export to Excel</button>
    </div>
    <div class="main">
      ${flash()}
      <h2>Where it goes</h2>
      ${saved > 0 ? `<div class="note gold">You are ${money(saved)} under plan so far. Move it to a priority or keep it.</div>` : ''}
      ${hasPicks && real > state.budget ? `<div class="note warn">Your real total is ${money(real - state.budget)} over budget once tax, tips and extras are counted. See the breakdown on My picks.</div>` : ''}
      ${catRows(alloc)}
      ${linesCard(alloc)}
    </div>
  </div></section>`;
}

function budget() {
  return state.built ? budgetDashboard() : budgetSetup();
}

function vendors() {
  const alloc = allocations();
  const cur = CATS.find((c) => c.id === state.cat) || CATS[0];
  const a = alloc[cur.id];
  const p = pickOf(cur);
  const side = CATS.map((c) =>
    `<button class="choice ${c.id === cur.id ? 'on' : ''}" data-cat="${c.id}"><span>${c.name}</span><span class="small">${money(alloc[c.id])}</span></button>`).join('');
  const cheapest = priceOf(cur, 0);
  const listings = cur.opts.map((o, i) => {
    const price = priceOf(cur, i);
    const on = p && p.i === i;
    const badge = price > a
      ? `<span class="badge over">Over by ${money(price - a)}</span>`
      : o.hours
        ? `<span class="badge diy">DIY · saves ${money(a - price)}</span>`
        : `<span class="badge fit">In your range</span>`;
    const time = o.hours ? `<div class="muted small">About ${o.hours} hours of work${o.helpers ? ` · needs ${o.helpers} helper${o.helpers > 1 ? 's' : ''}` : ''}</div>` : `<div class="muted small">Vendor handles it</div>`;
    const per = o.perGuest ? `<div class="muted small">${money(o.fixed * region().m)} base + ${money(o.perGuest * region().m)} per guest</div>` : '';
    return `
    <div class="card listing ${on ? 'on' : ''}">
      ${photo(cur.imgs[i], cur.tone)}
      <div class="body">
        <div class="stack"><h3>${o.label}</h3><div>${badge}</div>${time}</div>
        <div class="stack"><div class="price">${money(price)}</div>${per}
        <button class="choice ${on ? 'on' : ''}" data-choose="${i}">${on ? 'Added to budget' : 'Add to budget'}</button></div>
      </div>
    </div>`;
  }).join('');
  return `
  <section class="section"><div class="wrap stack wide">
    <div class="stack"><div class="eyebrow">Vendors</div><h1>Options in your range</h1><p class="lead">Prices shown up front for ${state.guests} guests in a ${region().short}, sorted from DIY to full service.</p></div>
    <div class="two-col">
      <div class="side side-list">${side}</div>
      <div class="main">
        <div class="note">Your ${cur.name.toLowerCase()} budget: <b>${money(a)}</b> of ${money(state.budget)}</div>
        ${cheapest > a ? `<div class="note warn">Even the DIY route costs ${money(cheapest)} for ${state.guests} guests here. Move money into ${cur.name.toLowerCase()} on the Budget page, or trim the guest list.</div>` : ''}
        <div class="grid3">${listings}</div>
        <div class="stack" style="margin-top:8px">
          <div class="row"><h2>${cur.name} who match your look</h2></div>
          ${styleStrip() || '<div class="muted small">Import a Pinterest board on the Inspiration page and vendors get ranked by how well their work matches your pins.</div>'}
          <div class="grid3">${vendorCards(cur.id)}</div>
          <div class="muted small">Sample vendors for this prototype. A real version reads each vendor's portfolio and Instagram tags.</div>
        </div>
      </div>
    </div>
  </div></section>`;
}

function inspo() {
  const alloc = allocations();
  const m = region().m;
  const LK = currentLooks();
  const looks = LK.map((l) => {
    let pro = 0;
    let diy = 0;
    let hours = 0;
    const overs = [];
    const parts = l.parts.map((pt) => {
      const pp = round((pt.pro[0] + pt.pro[1] * state.guests) * m, 25);
      const dp = round((pt.diy[0] + pt.diy[1] * state.guests) * m, 25);
      pro += pp; diy += dp; hours += pt.hours;
      const a = allocOf(alloc, pt.cat);
      if (pp > a) overs.push(`${catName(pt.cat)} over by ${money(pp - a)}`);
      return `<span class="line small"><span>${catName(pt.cat)}</span><span>${money(pp)}</span></span>`;
    }).join('');
    return `
    <div class="card listing">
      ${l.img ? photo(l.img, l.tone) : `<span class="photo tone" style="background:${l.tone}"><span>${l.title.charAt(0).toUpperCase()}</span></span>`}
      <div class="body">
        <div class="stack"><h3>${l.title}</h3>
        <div><span class="badge ${overs.length ? 'over' : 'fit'}">${overs.length ? overs.join(', ') : 'Fits your budget'}</span></div>
        <div class="lines">${parts}</div></div>
        <div><div class="price">${money(pro)}</div><div class="muted small">DIY version: about ${money(diy)} and ${hours} hours</div>${l.url ? `<a class="link small" href="${l.url}" target="_blank" rel="noopener">Open pin</a>` : ''}</div>
      </div>
    </div>`;
  }).join('');
  const importer = pinsOn() ? `
    <form class="card stack" data-board-form>
      <h3>${state.board ? 'Import a different board' : 'Import your Pinterest board'}</h3>
      <p class="muted small">Paste a link to one of your boards, or to your profile for your recent pins. Each pin gets priced from the words in its title. Secret boards cannot be read.</p>
      <div class="row-actions"><input class="search" name="url" type="text" inputmode="url" autocomplete="off" required placeholder="pinterest.com/username/board-name" value="${state.importUrl || (state.board ? state.board.url : '')}" style="flex:1 1 320px"><button class="primary" type="submit" ${state.importing ? 'disabled' : ''}>${state.importing ? 'Importing…' : 'Import'}</button></div>
      ${state.importing ? '<div class="note" id="import-status">Reading your board. This takes 5 to 15 seconds.</div>' : ''}
      ${state.importError ? `<div class="note bad" id="import-status"><b>Could not import.</b> ${state.importError}</div>` : ''}
      ${!state.importing && !state.importError && state.board && state.board.url ? `<div class="note good" id="import-status">Imported ${state.board.looks.length} pins from ${state.board.title}. They are priced below.</div>` : ''}
      <details class="small"><summary>How to copy a board link</summary><div class="muted small" style="padding-top:8px">On the phone app: open the board, tap the three dots or share arrow, tap <b>Copy link</b>. On a computer: open the board and copy the address bar. A link to your profile page works too and imports your 25 most recent pins. Single pin links do not work; open the board the pin is saved to.</div></details>
    </form>
    <form class="card stack" data-manual-form>
      <h3>No Pinterest? Describe your looks</h3>
      <p class="muted small">One per line, in plain words. We price each one the same way.</p>
      <textarea class="search" name="lines" rows="4" placeholder="boho floral arch with pampas\nlong farmhouse table dinner with candles\nvintage lace dress"></textarea>
      <button class="ghost" type="submit">Price these looks</button>
    </form>` : `<div class="note">Real Pinterest import turns on once <code>PINTEREST_PROXY</code> is set in config.js (see backend/README.md). Until then this uses a sample board.</div>`;
  const shown = state.board && state.board.looks.length ? `<div class="note good">${state.board.title}: ${LK.length} pins priced for ${state.guests} guests in a ${region().short}. <button class="link" data-clear-board>Remove board</button></div><div class="grid3">${looks}</div>`
    : state.imported ? `<div class="note good">Sample board: ${LOOKS.length} looks priced for ${state.guests} guests in a ${region().short}</div><div class="grid3">${looks}</div>`
    : `<div class="empty"><h3>No board connected yet</h3><button class="primary" data-import>Try the sample board</button></div>`;
  return `
  <section class="section"><div class="wrap stack wide">
    <div class="stack"><div class="eyebrow">Inspiration</div><h1>Price your inspiration</h1><p class="lead">Bring in a Pinterest board and see what each look costs against your budget, split across the categories it touches.</p></div>
    ${flash()}
    ${importer}
    ${styleStrip()}
    ${shown}
    ${styleProfile().length ? `<div class="stack"><div class="row"><h2>Vendors who do your look</h2></div><div class="grid3">${['flowers', 'photos', 'venue'].map((id) => vendorCards(id, 1)).join('')}</div><div class="muted small">Ranked by how many of your board's styles each vendor is known for. See every category on the Vendors page.</div></div>` : ''}
  </section>`;
}

// ---------- Marketplace: peer-to-peer rentals and services ----------
// Anyone can list. Free to browse, free to list. We earn a commission on each booking:
// the owner pays OWNER_CUT of the price and the renter pays RENTER_FEE on top.
const DEPOSIT = 0.2;        // share of a vendor price held as a deposit until the wedding day
const VENDOR_FEE = 0.08;    // referral fee the vendor pays on a booking made here; couples pay nothing extra
const OWNER_CUT = 0.10;
const RENTER_FEE = 0.05;
const MCATS = [
  { id: 'decor', name: 'Decor' },
  { id: 'tables', name: 'Tables and chairs' },
  { id: 'tents', name: 'Tents' },
  { id: 'lighting', name: 'Lighting' },
  { id: 'tableware', name: 'Tableware and linens' },
  { id: 'sound', name: 'Sound and photo' },
  { id: 'attire', name: 'Attire' },
  { id: 'services', name: 'Services' },
];
// unit: "day" rents per day, "sale" is buy-it-outright, "flat" is a one-off service price. Prices are for a mid-size city.
const LISTINGS = [
  { id: 'l1', title: 'Wooden ceremony arch', cat: 'decor', price: 85, unit: 'day', owner: 'Maya R.', rating: 4.9, reviews: 12, miles: 6, tone: '#CFE3D2', img: '1670529776180-60e4132ab90c' },
  { id: 'l2', title: 'Ten farmhouse tables and 80 chairs', cat: 'tables', price: 420, unit: 'day', owner: 'Oak & Pine Rentals', rating: 4.8, reviews: 31, miles: 11, tone: '#F3DDB5', img: '1519225421980-715cb0215aed' },
  { id: 'l3', title: '20 x 40 party tent, set up included', cat: 'tents', price: 350, unit: 'day', owner: 'Dan K.', rating: 4.7, reviews: 9, miles: 14, tone: '#D3E8EA', img: '1721677337543-37b07e7e28b5' },
  { id: 'l4', title: 'String lights, 300 feet with poles', cat: 'lighting', price: 60, unit: 'day', owner: 'Priya S.', rating: 5, reviews: 22, miles: 3, tone: '#E7D3E6', img: '1708569177111-40b155d78801' },
  { id: 'l5', title: 'Linens for ten tables, ivory', cat: 'tableware', price: 120, unit: 'sale', owner: 'Jess and Tom', rating: 4.6, reviews: 7, miles: 8, tone: '#F4D6CC', img: '1595467959554-9ffcbf37f10f' },
  { id: 'l6', title: 'Gold charger plates, set of 100', cat: 'tableware', price: 140, unit: 'sale', owner: 'Lena M.', rating: 4.9, reviews: 15, miles: 5, tone: '#F3DDB5' },
  { id: 'l7', title: 'Vintage lounge set, sofa and two chairs', cat: 'decor', price: 150, unit: 'day', owner: 'The Found Room', rating: 4.8, reviews: 18, miles: 9, tone: '#CFE3D2' },
  { id: 'l8', title: 'PA speaker and two wireless mics', cat: 'sound', price: 70, unit: 'day', owner: 'Marcus T.', rating: 4.7, reviews: 26, miles: 4, tone: '#D5DDF2', img: '1708569176813-746f00614012' },
  { id: 'l9', title: 'Photo booth kit with props and backdrop', cat: 'sound', price: 120, unit: 'day', owner: 'Nina P.', rating: 4.9, reviews: 11, miles: 12, tone: '#E7D3E6', img: '1617724975854-70b5d0cedb0a' },
  { id: 'l10', title: 'Lace wedding dress, size 8, worn once', cat: 'attire', price: 450, unit: 'sale', owner: 'Sofia A.', rating: 5, reviews: 4, miles: 7, tone: '#F4D6CC', img: '1550005809-91ad75fb315f' },
  { id: 'l11', title: 'Bud vases, set of 60', cat: 'decor', price: 55, unit: 'sale', owner: 'Maya R.', rating: 4.9, reviews: 12, miles: 6, tone: '#CFE3D2', img: '1629141731648-0bce61cf4f7e' },
  { id: 'l12', title: 'Chiavari chairs, set of 100', cat: 'tables', price: 300, unit: 'day', owner: 'Oak & Pine Rentals', rating: 4.8, reviews: 31, miles: 11, tone: '#F3DDB5' },
  { id: 'l13', title: 'Donut wall and cake stand set', cat: 'decor', price: 60, unit: 'sale', owner: 'Kai W.', rating: 4.5, reviews: 6, miles: 10, tone: '#F3DDB5', img: '1555244162-803834f70033' },
  { id: 'l14', title: 'Student photographer, 4 hours', cat: 'services', price: 350, unit: 'flat', owner: 'Elliot B.', rating: 4.8, reviews: 9, miles: 5, tone: '#D5DDF2', img: '1519741196428-6a2175fa2557' },
  { id: 'l15', title: 'DJ with own gear, 5 hours', cat: 'services', price: 400, unit: 'flat', owner: 'Andre L.', rating: 4.7, reviews: 14, miles: 9, tone: '#D3E8EA', img: '1708569177086-2710ef4b1620' },
  { id: 'l16', title: 'Home baker: three-tier cake, serves 80', cat: 'services', price: 280, unit: 'flat', owner: 'Rosa G.', rating: 5, reviews: 21, miles: 6, tone: '#F3DDB5' },
  { id: 'l17', title: 'Day-of coordinator, student', cat: 'services', price: 300, unit: 'flat', owner: 'Hannah O.', rating: 4.9, reviews: 8, miles: 3, tone: '#E7D3E6' },
];

// What the couple will own after the wedding, guessed from their picks. One tap lists it all.
function resaleItems() {
  const tier = (id) => (state.chosen[id] ? state.chosen[id].i : -1);
  const items = [{ title: 'Decor bundle: signs, candles, table numbers', cat: 'decor', price: 70, unit: 'sale' }];
  if (tier('flowers') >= 0 && tier('flowers') <= 1) items.push({ title: 'Bud vases and arrangement supplies', cat: 'decor', price: 55, unit: 'sale' });
  if (tier('venue') === 0) items.push({ title: 'String lights and tent poles', cat: 'lighting', price: 60, unit: 'day' });
  if (tier('venue') <= 1 && tier('venue') >= 0) items.push({ title: 'Wooden ceremony arch', cat: 'decor', price: 85, unit: 'day' });
  if (tier('attire') >= 2) items.push({ title: 'Wedding dress, worn once', cat: 'attire', price: 450, unit: 'sale' });
  if (tier('music') <= 1 && tier('music') >= 0) items.push({ title: 'Bluetooth speaker and mic', cat: 'sound', price: 50, unit: 'day' });
  return items;
}

const cents = (n) => '$' + n.toFixed(2);
const allListings = () => LISTINGS.concat(state.listings);
const listingPrice = (l) => round(l.price * (l.mine ? 1 : region().m), 5); // what the owner asks, scaled by region for sample listings
const renterPays = (l) => listingPrice(l) * (1 + RENTER_FEE);
const ownerGets = (l) => listingPrice(l) * (1 - OWNER_CUT);
const platformKeeps = (l) => renterPays(l) - ownerGets(l);
const mcatName = (id) => (MCATS.find((m) => m.id === id) || MCATS[0]).name;

function rentalsTotal() {
  return allListings().filter((l) => state.rentals[l.id]).reduce((t, l) => t + renterPays(l), 0);
}

function listingPhoto(l) {
  return l.img ? photo(l.img, l.tone) : `<span class="photo tone" style="background:${l.tone}"><span>${l.title.charAt(0)}</span></span>`;
}

function listingCard(l) {
  const on = !!state.rentals[l.id];
  const stars = l.rating ? `★ ${l.rating} <span class="muted">(${l.reviews})</span>` : '<span class="badge fit">New</span>';
  return `
  <div class="card listing market-card ${on ? 'on' : ''}" data-listing="${l.id}" data-title="${(l.title + ' ' + mcatName(l.cat) + ' ' + l.owner).toLowerCase()}">
    ${listingPhoto(l)}
    <div class="body">
      <div class="stack">
        <div class="muted small">${mcatName(l.cat)} · ${l.miles === 0 ? 'your listing' : `${l.miles} mi away`}</div>
        <h3>${l.title}</h3>
        <div class="small">${stars} · ${l.owner}</div>
      </div>
      <div class="stack">
        <div><span class="price">${money(renterPays(l))}</span><span class="muted small"> ${(l.unit === 'day' ? 'per day' : l.unit === 'sale' ? 'to buy' : 'flat')}</span></div>
        <div class="muted small">${money(listingPrice(l))} asked + ${Math.round(RENTER_FEE * 100)}% service fee</div>
        ${l.mine ? `<button class="link" data-unlist="${l.id}">Remove my listing</button>` : `<button class="choice ${on ? 'on' : ''}" data-rent="${l.id}">${on ? 'Added to budget' : l.unit === 'sale' ? 'Buy, add to budget' : l.unit === 'day' ? 'Rent, add to budget' : 'Book, add to budget'}</button>`}
      </div>
    </div>
  </div>`;
}

function commissionCard() {
  const ex = LISTINGS[0];
  return `
  <div class="card stack">
    <h3>How ${APP_NAME} makes money</h3>
    <p class="muted small">Free to browse, free to list. We only earn when a booking happens.</p>
    <div class="lines">
      <div class="line"><span>Owner pays</span><b>${Math.round(OWNER_CUT * 100)}% commission</b></div>
      <div class="line"><span>Renter pays</span><b>${Math.round(RENTER_FEE * 100)}% service fee</b></div>
    </div>
    <div class="muted small">Example: the ${ex.title.toLowerCase()} listed at ${money(listingPrice(ex))}.</div>
    <div class="lines">
      <div class="line"><span>Renter pays</span><b>${cents(renterPays(ex))}</b></div>
      <div class="line"><span>Owner receives</span><b>${cents(ownerGets(ex))}</b></div>
      <div class="line"><span>${APP_NAME} keeps</span><b>${cents(platformKeeps(ex))}</b></div>
    </div>
    <p class="muted small">Payment is held until the item is picked up, which covers damage claims and no-shows.</p>
  </div>`;
}

function listForm() {
  const cats = MCATS.map((m) => `<option value="${m.id}">${m.name}</option>`).join('');
  const mine = state.listings.filter((l) => l.mine);
  const earn = (l) => ownerGets(l);
  const mineRows = mine.map((l) => `
    <div class="line"><span>${l.title}<span class="muted small"> · ${money(listingPrice(l))} ${(l.unit === 'day' ? 'per day' : l.unit === 'sale' ? 'to buy' : 'flat')}</span></span><b>${money(earn(l))} per booking</b></div>`).join('');
  const yearly = mine.reduce((t, l) => t + earn(l) * 8, 0);
  return `
  <div class="two-col">
    <div class="main">
      <form class="card stack" data-list-form>
        <h3>Sell it, rent it out, or offer a service</h3>
        <p class="muted small">Takes a minute. You set the price, we handle payment and pickup, and you keep ${Math.round((1 - OWNER_CUT) * 100)}%.</p>
        <label class="field"><span>What is it?</span><input name="title" required maxlength="70" placeholder="Wooden ceremony arch"></label>
        <div class="grid-auto">
          <label class="field"><span>Category</span><select name="cat">${cats}</select></label>
          <label class="field"><span>Price</span><div class="money-input"><span>$</span><input name="price" type="number" min="5" max="5000" step="5" required inputmode="numeric" placeholder="85"></div></label>
          <label class="field"><span>Priced</span><select name="unit"><option value="sale">for sale</option><option value="day">for rent, per day</option><option value="flat">a service, flat price</option></select></label>
        </div>
        <label class="field"><span>Your name or business</span><input name="owner" maxlength="40" placeholder="Maya R."></label>
        <div class="muted small" data-bind="earnNote">Type a price to see what you would earn.</div>
        <button class="primary" type="submit">Post my listing</button>
      </form>
    </div>
    <div class="side">
      ${mine.length ? `
      <div class="card stack">
        <h3>Your listings</h3>
        <div class="lines">${mineRows}</div>
        <div class="stat"><span>If each books 8 times a year</span><b>${money(yearly)}</b></div>
        <p class="muted small">Most wedding items rent 6 to 10 weekends a season.</p>
      </div>` : `<div class="note">Nothing listed yet. The arch in someone's garage is worth about ${money(ownerGets(LISTINGS[0]) * 8)} a year.</div>`}
      ${commissionCard()}
    </div>
  </div>`;
}

function market() {
  const tab = state.market.tab === 'list' ? 'list' : 'browse';
  const cat = state.market.cat || 'all';
  const kind = state.market.kind || 'all';
  const items = allListings().filter((l) => (cat === 'all' || l.cat === cat) && (kind === 'all' || l.unit === kind));
  const kinds = [['all', 'Everything'], ['sale', 'For sale'], ['day', 'For rent'], ['flat', 'Services']].map(([k, n]) => `<button class="choice chip ${kind === k ? 'on' : ''}" data-mkind="${k}">${n}</button>`).join('');
  const chips = [{ id: 'all', name: 'All' }].concat(MCATS).map((m) =>
    `<button class="choice chip ${cat === m.id ? 'on' : ''}" data-mcat="${m.id}">${m.name}</button>`).join('');
  const booked = allListings().filter((l) => state.rentals[l.id]);
  return `
  <section class="section"><div class="wrap stack wide">
    <div class="stack"><div class="eyebrow">Marketplace</div><h1>Buy it, sell it, or rent it from a couple nearby</h1><p class="lead">Arches, tables, lights, dresses and helpers, listed by couples who just got married and small businesses near you. Buy it secondhand, rent it for the day, and sell it all back when you are done.</p></div>
    ${flash()}
    <div class="toggle" role="tablist"><button class="${tab === 'browse' ? 'on' : ''}" data-mtab="browse">Find something</button><button class="${tab === 'list' ? 'on' : ''}" data-mtab="list">List something</button></div>
    ${tab === 'list' ? listForm() : `
    <div class="two-col">
      <div class="main">
        <input class="search" type="search" placeholder="Search arches, chairs, lights, DJ..." value="${state.market.q || ''}" data-market-q aria-label="Search listings">
        <div class="chips">${kinds}</div>
        <div class="chips">${chips}</div>
        <div class="muted small" data-bind="marketCount">${items.length} listing${items.length === 1 ? '' : 's'} within 15 miles</div>
        <div class="grid3" data-market-grid>${items.map(listingCard).join('')}</div>
        <div class="muted small">Sample listings for this prototype. Real listings would come from people in your area.</div>
      </div>
      <div class="side">
        <div class="card stack">
          <div class="muted small">${booked.length} booked</div>
          <div class="big">${money(rentalsTotal())}</div>
          <div class="muted small">counts against your decor and rentals line (${money(allocations().lines.decor)})</div>
          ${booked.map((l) => `<div class="line"><span>${l.title}</span><b>${money(renterPays(l))}</b></div>`).join('')}
          ${booked.length ? '<button class="ghost" data-go="picks">See it in My picks</button>' : ''}
        </div>
        ${commissionCard()}
      </div>
    </div>`}
  </div></section>`;
}

// Filter listing cards in place while typing, so the search box keeps focus.
function filterMarket() {
  const q = (state.market.q || '').trim().toLowerCase();
  let n = 0;
  app.querySelectorAll('[data-listing]').forEach((el) => { const hit = !q || el.dataset.title.includes(q); el.hidden = !hit; if (hit) n += 1; });
  const c = app.querySelector('[data-bind=marketCount]');
  if (c) c.textContent = `${n} listing${n === 1 ? '' : 's'} within 15 miles`;
}


// ---------- Helpers: who is paying for what, with a cap, and who is doing what ----------
// Each person has an agreement: the items they cover, a cap (or none), and the tasks they own.
// "Mom covers catering up to $4,000 and no more." Anything over the cap falls back to the couple.
const ROLES = ['Mom', 'Dad', "Partner's mom", "Partner's dad", 'Sibling', 'Grandparent', 'Friend', 'Other'];
const COVERABLE = () => CATS.map((c) => ({ id: c.id, name: c.name })).concat(LINES.map((l) => ({ id: l.id, name: l.name })), [{ id: 'rentals', name: 'Marketplace' }]);
const personById = (id) => state.people.find((p) => p.id === id);
const initials = (name) => name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

// What one covered item costs right now: the pick if there is one, otherwise the budgeted amount.
function itemCost(id, alloc) {
  if (id === 'rentals') return { cost: rentalsTotal(), est: false, name: 'Marketplace' };
  const c = CATS.find((x) => x.id === id);
  if (c) { const p = pickOf(c); return p ? { cost: p.price, est: false, name: c.name, detail: p.label } : { cost: alloc[c.id], est: true, name: c.name, detail: 'nothing picked yet' }; }
  const l = LINES.find((x) => x.id === id);
  return { cost: alloc.lines[l.id], est: true, name: l.name, detail: 'estimate' };
}

function personTotals(p, alloc) {
  const items = (p.covers || []).map((id) => ({ id, ...itemCost(id, alloc) }));
  const committed = items.reduce((t, i) => t + i.cost, 0);
  const cap = p.cap > 0 ? p.cap : null;
  const pays = cap ? Math.min(committed, cap) : committed;
  const over = cap ? Math.max(0, committed - cap) : 0;
  const tasks = TASKS.filter((t) => (p.tasks || []).includes(t.id));
  return { items, committed, cap, pays, over, remaining: cap ? Math.max(0, cap - committed) : null, tasks };
}

// Who pays what overall: each helper's share and what is left for the couple.
function coverage() {
  const { alloc, real } = totals();
  const rows = state.people.map((p) => ({ p, ...personTotals(p, alloc) }));
  const helpers = rows.reduce((t, r) => t + r.pays, 0);
  return { rows, helpers, couple: Math.max(0, real - helpers), real, alloc };
}

const ownerOf = (taskId) => state.people.find((p) => (p.tasks || []).includes(taskId));

function personCard(p, alloc, full) {
  const t = personTotals(p, alloc);
  const coverChips = COVERABLE().map((c) => `<button class="choice chip ${(p.covers || []).includes(c.id) ? 'on' : ''}" data-cover="${c.id}" data-person="${p.id}">${c.name}</button>`).join('');
  const taskChips = TASKS.map((k) => { const o = ownerOf(k.id); return `<button class="choice chip ${o && o.id === p.id ? 'on' : ''}" data-assign="${k.id}" data-person="${p.id}" title="${k.text}${o && o.id !== p.id ? ` (now ${o.name})` : ''}">${k.short}</button>`; }).join('');
  const itemRows = t.items.map((i) => `<div class="line"><span>${i.name}<span class="muted small"> · ${i.detail || ''}</span></span><b>${money(i.cost)}${i.est ? '<span class="muted small"> est.</span>' : ''}</b></div>`).join('');
  const bar = t.cap ? `<div class="bar"><i class="${t.over ? 'over' : ''}" style="width:${Math.min(100, Math.round((t.committed / t.cap) * 100))}%"></i></div>` : '';
  const status = t.cap
    ? (t.over ? `<div class="note warn">${p.name}'s items come to ${money(t.committed)}, which is ${money(t.over)} over the ${money(t.cap)} cap. ${p.name} pays ${money(t.cap)}. The extra ${money(t.over)} is on you two.</div>`
      : `<div class="note good">${money(t.committed)} of a ${money(t.cap)} cap. ${money(t.remaining)} of room left.</div>`)
    : `<div class="note">No cap set. ${p.name} covers whatever these items cost: ${money(t.committed)} right now.</div>`;
  return `
  <div class="card stack person" id="person-${p.id}">
    <div class="row"><span><span class="avatar">${initials(p.name)}</span>${p.name}<span class="muted small"> · ${p.role}</span></span><span>${money(t.pays)}</span></div>
    <div class="grid-auto">
      <label class="field"><span>Cap (leave blank for none)</span><div class="money-input small"><span>$</span><input type="number" min="0" step="100" value="${p.cap || ''}" placeholder="no cap" data-cap="${p.id}" aria-label="Cap for ${p.name}"></div></label>
      <div class="field"><span>Status</span><div class="small">${p.accepted ? `<span class="badge fit">Agreed ${p.accepted}</span>` : '<span class="badge diy">Not confirmed yet</span>'}</div></div>
    </div>
    ${bar}${status}
    ${full ? `
    <div class="field"><span>Covers</span><div class="chips">${coverChips}</div></div>
    ${t.items.length ? `<div class="lines">${itemRows}</div>` : ''}
    <div class="field"><span>Owns these tasks</span><div class="chips">${taskChips}</div></div>
    <div class="row-actions">
      <button class="ghost" data-share-who="${p.id}">Copy ${p.name}'s link</button>
      <button class="link" data-remove-person="${p.id}">Remove</button>
    </div>
    ${state.share && state.shareWho === p.id ? `<input class="share-url" type="text" readonly value="${state.share}" aria-label="Share link for ${p.name}" onfocus="this.select()">` : ''}` : `
    <div class="muted small">${t.items.map((i) => i.name).join(', ') || 'Covers nothing yet'}${t.tasks.length ? ` · ${t.tasks.length} task${t.tasks.length > 1 ? 's' : ''}` : ''}</div>`}
  </div>`;
}

function peopleForm() {
  const roles = ROLES.map((r) => `<option>${r}</option>`).join('');
  return `
  <form class="card stack" data-person-form>
    <h3>Add someone who is helping</h3>
    <p class="muted small">Pick what they cover, set a cap, and send them their link. They see only their part and can say yes.</p>
    <div class="grid-auto">
      <label class="field"><span>Name</span><input name="name" required maxlength="40" placeholder="Linda"></label>
      <label class="field"><span>Role</span><select name="role">${roles}</select></label>
      <label class="field"><span>Cap, optional</span><div class="money-input small"><span>$</span><input name="cap" type="number" min="0" step="100" inputmode="numeric" placeholder="4000"></div></label>
    </div>
    <button class="primary" type="submit">Add them</button>
  </form>`;
}

function people() {
  const cov = coverage();
  const cards = state.people.map((p) => personCard(p, cov.alloc, true)).join('');
  const unclaimed = COVERABLE().filter((c) => !state.people.some((p) => (p.covers || []).includes(c.id)));
  return `
  <section class="section"><div class="wrap stack wide">
    <div class="stack"><div class="eyebrow">Helpers</div><h1>Who is paying for what, and who is doing what</h1><p class="lead">Clear agreements up front. Mom covers catering up to $4,000 and not a dollar more. Dad handles the music. Everyone gets their own link.</p></div>
    ${flash()}
    <div class="two-col">
      <div class="main">
        ${cards || '<div class="empty"><h3>Nobody added yet</h3><p class="muted">Add a parent, partner or friend and decide what they cover.</p></div>'}
        ${peopleForm()}
      </div>
      <div class="side">
        <div class="card stack">
          <div class="muted small">Real total</div>
          <div class="big">${money(cov.real)}</div>
          <div class="lines">
            ${cov.rows.map((r) => `<div class="line"><span>${r.p.name}</span><b>${money(r.pays)}</b></div>`).join('')}
            <div class="line"><span><b>You two</b></span><b>${money(cov.couple)}</b></div>
          </div>
          <div class="muted small">Helpers cover ${cov.real ? Math.round((cov.helpers / cov.real) * 100) : 0}% so far.</div>
        </div>
        <div class="card stack">
          <h3>Nobody covers yet</h3>
          <div class="muted small">${unclaimed.length ? unclaimed.map((c) => c.name).join(', ') : 'Everything is assigned.'}</div>
        </div>
      </div>
    </div>
  </div></section>`;
}

// What a helper sees when they open their link: just their part, in plain words.
function helper() {
  const p = personById(state.who);
  if (!p) return `<section class="section"><div class="wrap stack"><h1>That link is out of date</h1><button class="primary" data-fullview>See the whole plan</button></div></section>`;
  const { alloc } = totals();
  const t = personTotals(p, alloc);
  const c = countdown();
  const items = t.items.map((i) => `<div class="line"><span>${i.name}<span class="muted small"> · ${i.detail || ''}</span></span><b>${money(i.cost)}${i.est ? '<span class="muted small"> est.</span>' : ''}</b></div>`).join('');
  const tasks = t.tasks.map((k) => {
    const done = isDone(k);
    return `<div class="task ${done ? 'done' : ''}"><button class="check" data-task="${k.id}" aria-pressed="${done}" aria-label="Mark ${k.text}">${done ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>' : ''}</button><span class="text">${k.text}</span></div>`;
  }).join('');
  const capLine = t.cap
    ? `You are covering <b>${t.items.map((i) => i.name.toLowerCase()).join(', ') || 'nothing yet'}</b> up to <b>${money(t.cap)}</b> and no more. ${t.over ? `Right now those come to ${money(t.committed)}, so you pay ${money(t.cap)} and the couple covers the extra ${money(t.over)}.` : `Right now those come to ${money(t.committed)}, so there is ${money(t.remaining)} of room.`}`
    : `You are covering <b>${t.items.map((i) => i.name.toLowerCase()).join(', ') || 'nothing yet'}</b> with no cap. Right now that comes to <b>${money(t.committed)}</b>.`;
  return `
  <section class="hero"><div class="wrap"><div class="copy">
    <div class="eyebrow">Your part of the wedding</div>
    <h1>Hi ${p.name}, here is what you are covering.</h1>
    <p class="lead">${c.daysLeft > 0 ? `${c.daysLeft} days until the wedding on ${fmtDate(c.wedding)}.` : ''} Nothing here changes without the couple updating it.</p>
  </div></div></section>
  <section class="section"><div class="wrap two-col">
    <div class="main">
      ${flash()}
      <div class="card stack">
        <h3>The agreement</h3>
        <p>${capLine}</p>
        ${items ? `<div class="lines">${items}</div>` : ''}
        <div class="stat"><span>You pay</span><b>${money(t.pays)}</b></div>
        ${p.accepted ? `<div class="note good">You said yes on ${p.accepted}. Thank you.</div>` : `<button class="primary" data-accept="${p.id}">Yes, I am good with this</button>`}
        <p class="muted small">Estimates update as the couple makes picks. Your cap does not.</p>
      </div>
      ${t.tasks.length ? `<div class="card group"><div class="row"><span>Your tasks</span><span class="muted small">${t.tasks.filter(isDone).length} of ${t.tasks.length} done</span></div>${tasks}</div>` : ''}
    </div>
    <div class="side">
      <div class="card stack">
        <div class="muted small">Whole wedding</div>
        <div class="big">${money(totals().real)}</div>
        <div class="muted small">${state.guests} guests · ${fmtDate(c.wedding)}</div>
        <button class="ghost" data-fullview>See the whole plan</button>
      </div>
      <div class="card stack">
        <h3>Planning something yourself?</h3>
        <p class="muted small">An anniversary, a graduation party, your own wedding. Same tool, free, starts in a minute.</p>
        <button class="primary" data-ownplan>Start my own plan</button>
      </div>
      <p class="muted small">Prototype note: your yes and your task ticks are saved on this device. A real version would sync them back to the couple.</p>
    </div>
  </div></section>`;
}

// ---------- The dashboard: everything in one place, all connected ----------
// Sliders here move the pie, the money card, who pays and the option dropdowns at the same time.
function dash() {
  const { alloc, planned, rentals, extras, real, hours, helpers, hidden } = totals();
  const cov = coverage();
  const c = countdown();
  const p = plan();
  const nextTasks = p.tasks.filter((t) => !t.done).slice(0, 5);
  const have = CATS.filter((x) => state.chosen[x.id]);
  const need = CATS.filter((x) => !state.chosen[x.id]);
  const booked = allListings().filter((l) => state.rentals[l.id]);
  const pct = Math.min(100, Math.round((real / state.budget) * 100));
  const over = real > state.budget;
  const dep = deposits();
  return `
  <section class="section dash-page"><div class="wrap stack wide">
    <div class="dash-top">
      <div class="stack">
        <div class="eyebrow">Dashboard</div>
        <h1>${c.daysLeft > 0 ? `${c.daysLeft} days to go` : 'Wedding day'}</h1>
        <p class="lead">${fmtDate(c.wedding)} · <b data-bind="guests">${state.guests}</b> guests · ${region().name} · <b data-bind="budget">${money(state.budget)}</b> budget</p>
      </div>
      <div class="row-actions"><button class="ghost" data-share>Share dashboard</button><button class="ghost" data-export>Export to Excel</button><button class="primary" data-go="people">Add a helper</button></div>
    </div>
    ${cloudOn() ? (cloud.owner() ? `<div class="cloud-bar"><span class="cloud-status ok" data-bind="cloudStatus">${cloud.statusText()}</span><span class="muted small">Plan code <b>${state.cloudCode}</b>. Helpers' answers show up here automatically.</span><button class="link small" data-private-link>Copy my private link for another device</button></div>`
      : `<div class="cloud-bar"><span class="muted small">Saved on this device only.</span><button class="ghost" data-sync>Sync to the cloud</button><span class="muted small">Short share links, helpers' answers come back, works on your phone too.</span></div>`) : ''}
    ${flash()}
    ${state.built ? '' : `<div class="note gold">This is a sample ${money(state.budget)} wedding for ${state.guests} guests so you can see how it works. <button class="link" data-go="budget">Set your own budget, guests and priorities</button> or <button class="link" data-sample>fill it with sample picks</button>.</div>`}
    ${state.share && !state.shareWho ? `<input class="share-url" type="text" readonly value="${state.share}" aria-label="Share link" onfocus="this.select()">` : ''}
    ${steps(p.tasks)}
    ${walkthrough(p.tasks, alloc)}

    <div class="dash dash-3">
      <div class="card stack">
        <div class="row"><span>Money</span><span class="muted small">${real ? 'real total so far' : 'your budget'}</span></div>
        <div class="big ${over ? 'bad' : ''}" data-bind="real">${money(real || state.budget)}</div>
        <div class="bar"><i class="${over ? 'over' : ''}" data-bind="realBar" style="width:${pct}%"></i></div>
        <div class="lines">
          <div class="line"><span>Budget</span><b data-bind="budget">${money(state.budget)}</b></div>
          <div class="line"><span>Picks</span><b>${money(planned)}</b></div>
          <div class="line"><span>Marketplace</span><b>${money(rentals)}</b></div>
          <div class="line"><span>Tax, tips and extras</span><b>${money(extras)}</b></div>
          <div class="line"><span>${over ? 'Over budget' : 'Left to plan'}</span><b class="${over ? 'bad' : ''}" data-bind="left">${money(Math.abs(state.budget - real))}</b></div>
          ${dep.held ? `<div class="line"><span>Deposits held safely</span><b>${money(dep.held)}</b></div>` : ''}
        </div>
        <div id="pie">${pie(alloc)}</div>
        <div class="muted small">Click a slice to make it a priority. Drag a slider below to move money.</div>
      </div>
      <div class="card stack">
        <div class="row"><span>Who pays</span><button class="link small" data-go="people">Edit helpers</button></div>
        ${cov.rows.length ? cov.rows.map((r) => `
          <div class="payer"><div class="row small"><span><span class="avatar">${initials(r.p.name)}</span>${r.p.name}<span class="muted"> · ${r.p.role}</span></span><span>${money(r.pays)}${r.cap ? `<span class="muted"> / ${money(r.cap)}</span>` : ''}</span></div>
          ${r.cap ? `<div class="bar"><i class="${r.over ? 'over' : ''}" style="width:${Math.min(100, Math.round((r.committed / r.cap) * 100))}%"></i></div>` : ''}
          <div class="muted small">${r.items.map((i) => i.name).join(', ') || 'nothing yet'}${r.over ? ` · ${money(r.over)} over cap, on you` : ''} · ${r.p.accepted ? 'agreed' : 'not confirmed'}${r.tasks.length ? ` · ${r.tasks.length} task${r.tasks.length > 1 ? 's' : ''}` : ''}</div></div>`).join('') : '<p class="muted small">Nobody is helping yet. Add a parent, say what they cover and cap it, and send them their link.</p>'}
        <div class="stat"><span>You two</span><b>${money(cov.couple)}</b></div>
        <div class="muted small">Helpers cover ${cov.real ? Math.round((cov.helpers / cov.real) * 100) : 0}% of the real total.</div>
        <div class="stat"><span>Guests</span><span class="stepper"><button data-guests-delta="-10" aria-label="10 fewer guests">−</button><b data-bind="guests">${state.guests}</b><button data-guests-delta="10" aria-label="10 more guests">+</button></span></div>
        <div class="muted small" data-bind="guestNote">${guestNote()}</div>
      </div>
      <div class="card stack">
        <div class="row"><span>Up next</span><button class="link small" data-go="schedule">Full calendar</button></div>
        ${countdownCard(c)}
        ${nextTasks.length ? nextTasks.map((t) => { const o = ownerOf(t.id); return `<div class="task"><button class="check" data-task="${t.id}" aria-label="Mark done: ${t.text}" ${t.auto ? 'disabled' : ''}></button><span class="text">${t.text}<span class="muted small"> · by ${fmtDate(t.due)}${o ? ` · ${o.name}` : ''}</span></span>${t.late ? '<span class="badge over">Late</span>' : ''}</div>`; }).join('') : '<div class="note good">Everything is done.</div>'}
        <div class="muted small">${p.tasks.filter((t) => t.done).length} of ${TASKS.length} tasks done</div>
      </div>
    </div>

    <div class="stack">
      <div class="row"><h2>Budget by category</h2><span class="muted small">Drag a slider. The options under it filter as you go.</span></div>
      <div class="dash-cats">${catRows(alloc)}</div>
      ${linesCard(alloc)}
    </div>

    <div class="dash dash-3">
      <div class="card stack">
        <div class="row"><span>Picks</span><button class="link small" data-go="picks">Details</button></div>
        <div class="muted small">${have.length} of ${CATS.length} categories chosen</div>
        <div class="lines">${have.map((x) => { const pk = pickOf(x); return `<div class="line"><span>${x.name}<span class="muted small"> · ${pk.label}${state.chosen[x.id].deposit ? ' · deposit held' : ''}</span></span><b>${money(pk.price)}</b></div>`; }).join('')}</div>
        ${need.length ? `<div class="chips">${need.map((x) => `<button class="choice chip" data-expand-only="${x.id}">${x.name} · ${money(alloc[x.id])}</button>`).join('')}</div>` : ''}
        ${hours ? `<div class="muted small">${hours} hours of DIY, ${helpers} helper${helpers === 1 ? '' : 's'} needed on the day</div>` : ''}
        ${hidden.length ? `<div class="line"><span>Reality check</span><b>${money(extras)}</b></div><div class="muted small">${hidden.map((h) => `${h.name} ${money(h.amount)}`).join(' · ')}</div>` : ''}
      </div>
      <div class="card stack">
        <div class="row"><span>Marketplace</span><button class="link small" data-go="market">Browse</button></div>
        ${booked.length ? `<div class="lines">${booked.map((l) => `<div class="line"><span>${l.title}</span><span><b>${money(renterPays(l))}</b> <button class="link small" data-rent="${l.id}">Remove</button></span></div>`).join('')}</div>` : '<p class="muted small">Nothing booked. Rent the arch instead of buying it.</p>'}
        <div class="stat"><span>Booked</span><b>${money(rentals)}</b></div>
        ${state.listings.length ? `<div class="muted small">You have ${state.listings.length} listing${state.listings.length > 1 ? 's' : ''} earning after the wedding.</div>` : ''}
        <div class="row small" style="margin-top:6px"><span>After the wedding</span></div>
        ${state.resold ? `<p class="muted small">Your wedding gear is listed. Each booking pays you ${Math.round((1 - OWNER_CUT) * 100)}% of the price.</p>` : `<p class="muted small">${resaleItems().length} item${resaleItems().length === 1 ? '' : 's'} you will own. Sell the small stuff, rent out the big stuff: about ${money(resaleItems().reduce((t, r) => t + r.price * (1 - OWNER_CUT) * (r.unit === 'day' ? 8 : 1), 0))} back.</p><button class="ghost" data-resale>List what I bought</button>`}
      </div>
      <div class="card stack">
        <div class="row"><span>Inspiration</span><button class="link small" data-go="inspo">Board</button></div>
        ${styleStrip()}
        ${state.imported || state.board ? `<div class="lines">${currentLooks().slice(0, 4).map((l) => { const m = region().m; const pro = l.parts.reduce((t, pt) => t + round((pt.pro[0] + pt.pro[1] * state.guests) * m, 25), 0); const diy = l.parts.reduce((t, pt) => t + round((pt.diy[0] + pt.diy[1] * state.guests) * m, 25), 0); return `<div class="line"><span>${l.title}<span class="muted small"> · DIY ${money(diy)}</span></span><b>${money(pro)}</b></div>`; }).join('')}</div>` : `<p class="muted small">No board connected. Import a Pinterest board and every look gets a price.</p><button class="ghost" ${pinsOn() ? 'data-go="inspo"' : 'data-import'}>Import a Pinterest board</button>`}
      </div>
    </div>

    <div class="stack">
      <div class="row"><h2>This month</h2><button class="link small" data-go="schedule">Open the full schedule</button></div>
      ${calendar(p)}
    </div>
  </div></section>`;
}

// Landing page extras: why this instead of the big sites, and how the business makes money.
function pitch() {
  const ex = LISTINGS[0];
  return `
  <section class="section tinted"><div class="wrap stack wide">
    <div class="stack"><div class="eyebrow">Why not the big planning sites</div><h2>One page, not forty tabs</h2></div>
    <div class="grid3">
      <div class="card tool"><h3>The big sites</h3><p class="muted">Vendor directories first, planning second. Quotes by request. Checklists with 200 items. Your parents cannot see the plan without an account and a tour.</p></div>
      <div class="card tool"><h3>${APP_NAME}</h3><p class="muted">One dashboard with the money, the people and the calendar. Prices up front. Sixteen tasks that matter. A link for Mom that shows only her part.</p></div>
      <div class="card tool"><h3>Built for DIY budgets</h3><p class="muted">Every category has a do-it-yourself option with hours and helpers, a rental instead of a purchase, and the hidden costs counted.</p></div>
    </div>
  </div></section>
  <section class="section"><div class="wrap stack wide">
    <div class="stack"><div class="eyebrow">How we make money</div><h2>Free for couples. We earn when things get booked.</h2></div>
    <div class="grid3">
      <div class="card tool"><div class="eyebrow">Rentals</div><h3>${Math.round(OWNER_CUT * 100)}% + ${Math.round(RENTER_FEE * 100)}%</h3><p class="muted">Owner pays a ${Math.round(OWNER_CUT * 100)}% commission, renter pays a ${Math.round(RENTER_FEE * 100)}% service fee. On the ${money(listingPrice(ex))} arch we keep ${cents(platformKeeps(ex))}.</p></div>
      <div class="card tool"><div class="eyebrow">Vendor bookings</div><h3>8% from vendors</h3><p class="muted">Vendors pay a referral fee on bookings made through the site. Couples pay the same price they see. On a $9,000 booked wedding that is $720.</p></div>
      <div class="card tool"><div class="eyebrow">Plus</div><h3>$39 once</h3><p class="muted">Free covers two helpers. Plus adds unlimited helpers, text reminders for their tasks, printable agreements and a second event. No subscription.</p></div>
    </div>
    <div class="note">A typical $15,000 wedding that books $9,000 of vendors and rents $450 of gear through the site earns about <b>$790</b>, plus $39 if they go Plus. Nothing is charged to the couple for planning.</div>
    <div class="grid3">
      <div class="card tool"><div class="eyebrow">Deposits in escrow</div><h3>Why vendors pay us</h3><p class="muted">Couples reserve with a ${Math.round(DEPOSIT * 100)}% deposit we hold until the day. Vendors get a guaranteed booking and pay ${Math.round(VENDOR_FEE * 100)}% only on jobs that happen, not a monthly listing fee.</p></div>
      <div class="card tool"><div class="eyebrow">Resale loop</div><h3>Supply from our own couples</h3><p class="muted">The day after, one tap lists the arch, vases and dress to sell or rent, priced from their picks. The next couple buys secondhand, and we earn commission a second time on the same goods.</p></div>
      <div class="card tool"><div class="eyebrow">Helper links</div><h3>Every helper is a new user</h3><p class="muted">Mom opens her link, sees the plan works, and starts her anniversary party from the same page. Zero-cost acquisition nobody else has.</p></div>
    </div>
  </div></section>`;
}

// ---------- All features on one page, for showing the prototype without clicking through ----------
const TOUR = [
  { id: 'dash', name: 'The dashboard', blurb: 'Everything in one place: money, who pays, what is next, picks, rentals and guests. This is the home screen once the budget is built.', render: dash },
  { id: 'budget', name: 'Budget planner', blurb: 'Set a total, guests and region. Priorities get 1.5x. Sliders rebalance the rest. Smaller lines are named, not hidden.', render: () => (state.built ? budgetDashboard() : budgetSetup()) },
  { id: 'vendors', name: 'Vendors with prices up front', blurb: 'Real sample prices per guest and per region, DIY to full service, with hours and helpers for the DIY route.', render: vendors },
  { id: 'inspo', name: 'Price your inspiration', blurb: 'A Pinterest board priced across the categories each look touches, with a DIY cost and hours.', render: inspo },
  { id: 'market', name: 'Marketplace: buy, sell, rent', blurb: 'Couples sell or rent out what they bought, the next couple buys or rents it. Free to list and browse. We earn a 10% commission plus a 5% service fee per sale or booking.', render: market },
  { id: 'people', name: 'Helpers and agreements', blurb: 'Add Mom, pick what she covers, cap it, assign tasks, and send her a link that shows only her part with a yes button.', render: people },
  { id: 'picks', name: 'My picks and the reality check', blurb: 'Everything chosen, plus tax, tips, fees, alterations, vendor meals and overage. Share by link or Excel.', render: picks },
  { id: 'schedule', name: 'Schedule, calendar and countdown', blurb: 'Countdown, four planning phases, and a month calendar with every task on its due date. Compresses for short timelines.', render: schedule },
  { id: 'home', name: 'Positioning and business model', blurb: 'Why this beats the big planning sites for DIY couples, and the three ways it earns: rental commission, vendor referral fees and a one-time Plus plan.', render: pitch },
];

// Fill the plan with sample choices so every feature has something to show.
function loadSample() {
  state.built = true;
  state.imported = true;
  state.picks = ['photos', 'venue'];
  state.chosen = { venue: { i: 1 }, food: { i: 1 }, photos: { i: 2 }, attire: { i: 1 }, flowers: { i: 0 }, music: { i: 2 } };
  state.rentals = { l1: true, l4: true, l16: true };
  state.done = { guests: true };
  state.custom = null;
  if (!state.listings.length) state.listings.push({ id: 'u-sample', title: 'Macrame backdrop, 8 feet', cat: 'decor', price: 60, unit: 'day', owner: 'You', rating: 0, reviews: 0, miles: 0, tone: '#E7D3E6', mine: true });
  state.market = { tab: 'browse', cat: 'all', q: '' };
  state.view = 'calendar';
  state.open = { venue: true };
  state.step = 1;
  state.chosen.photos.deposit = true;
  state.people = [
    { id: 'p-mom', name: 'Linda', role: 'Mom', cap: 4000, covers: ['food', 'cake'], tasks: ['headcount'], accepted: 'Oct 3' },
    { id: 'p-dad', name: 'Ray', role: "Partner's dad", cap: 0, covers: ['music', 'rentals'], tasks: ['diy', 'finish'], accepted: '' },
  ];
}

function all() {
  const empty = !state.built && !Object.keys(state.chosen).length;
  const toc = TOUR.map((t, i) => `<a class="choice chip" href="#tour-${t.id}">${i + 1}. ${t.name}</a>`).join('');
  const sections = TOUR.map((t, i) => `
    <div class="tour-head" id="tour-${t.id}"><div class="wrap">
      <div class="eyebrow">Feature ${i + 1} of ${TOUR.length}</div>
      <h2>${t.name}</h2>
      <p class="lead">${t.blurb}</p>
      <button class="link small" data-go="${t.id}">Open this page on its own</button>
    </div></div>
    ${t.render()}`).join('');
  return `
  <section class="section tinted"><div class="wrap stack wide">
    <div class="stack"><div class="eyebrow">All features</div><h1>Everything on one page</h1><p class="lead">Every screen of the prototype, top to bottom, so you can see the whole thing without clicking around. Everything still works here.</p></div>
    ${flash()}
    <div class="chips">${toc}</div>
    <div class="row-actions">
      <button class="primary" data-sample>${empty ? 'Fill with sample picks' : 'Reset to sample picks'}</button>
      <span class="muted small">Puts a sample wedding in every section: $15,000, 75 guests, picks in every category, three rentals and a listing. Your own picks are replaced.</span>
    </div>
  </div></section>
  ${sections}`;
}

// "My picks": everything the couple has already added to their budget, plus the reality check.
function picks() {
  const { alloc, planned, hours, helpers, hidden, extras, rentals, real } = totals();
  const booked = allListings().filter((l) => state.rentals[l.id]);
  const have = CATS.filter((c) => state.chosen[c.id]);
  const need = CATS.filter((c) => !state.chosen[c.id]);
  const rows = have.map((c) => {
    const p = pickOf(c);
    const diff = alloc[c.id] - p.price;
    return `
    <div class="card pick">
      ${photo(c.imgs[p.i] || c.imgs[0], c.tone)}
      <div class="info">
        <div class="muted small">${c.name}</div>
        <h3>${p.label}</h3>
        <div><span class="badge ${diff >= 0 ? 'fit' : 'over'}">${diff >= 0 ? `${money(diff)} under your ${money(alloc[c.id])} budget` : `${money(-diff)} over your ${money(alloc[c.id])} budget`}</span></div>
        ${p.hours ? `<div class="muted small">About ${p.hours} hours of DIY${p.helpers ? ` · ${p.helpers} helper${p.helpers > 1 ? 's' : ''}` : ''}</div>` : ''}
      </div>
      <div class="side-actions">
        <div class="price">${money(p.price)}</div>
        ${p.i === 0 ? '' : `<button class="choice chip ${state.chosen[c.id].deposit ? 'on' : ''}" data-deposit="${c.id}">${state.chosen[c.id].deposit ? `Deposit ${money(p.price * DEPOSIT)} held` : `Reserve with ${Math.round(DEPOSIT * 100)}% deposit`}</button>`}
        ${p.i !== 0 && state.chosen[c.id].deposit && stripeOn() ? `<a class="link small" href="${CFG.STRIPE_DEPOSIT_LINK}" target="_blank" rel="noopener">Pay the ${money(p.price * DEPOSIT)} deposit (test card 4242…)</a>` : ''}
        <button class="ghost" data-cat="${c.id}" data-go="vendors">Change</button>
        <button class="link" data-remove="${c.id}">Remove</button>
      </div>
    </div>`;
  }).join('');
  const todo = need.map((c) =>
    `<button class="choice" data-cat="${c.id}" data-go="vendors"><span>${c.name}</span><span class="small">${money(alloc[c.id])} to spend</span></button>`).join('');
  const hiddenRows = hidden.map((h) => `<div class="line"><span>${h.name}<span class="muted small"> · ${h.why}</span></span><b>${money(h.amount)}</b></div>`).join('');
  return `
  <section class="section"><div class="wrap stack wide">
    <div class="stack"><div class="eyebrow">My picks</div><h1>What you are using so far</h1><p class="lead">Everything you have added to your budget, plus the costs that usually surprise people.</p></div>
    ${flash()}
    <div class="two-col">
      <div class="main">
        ${have.length ? rows : `<div class="empty"><h3>Nothing added yet</h3><p class="muted">Add options from the Vendors page and they show up here.</p><button class="primary" data-go="vendors">Browse vendors</button></div>`}
        ${booked.length ? `
        <div class="card stack">
          <div class="row"><span>Marketplace</span><span>${money(rentals)}</span></div>
          <p class="muted small">Booked from people nearby. Service fee included. Counts against your decor and rentals line of ${money(alloc.lines.decor)}.</p>
          <div class="lines">${booked.map((l) => `<div class="line"><span>${l.title}<span class="muted small"> · ${l.owner}</span></span><span><b>${money(renterPays(l))}</b> <button class="link small" data-rent="${l.id}">Remove</button></span></div>`).join('')}</div>
        </div>` : ''}
        ${have.length ? `
        <div class="card stack">
          <div class="row"><span>Reality check</span><span>${money(extras)}</span></div>
          <p class="muted small">Tax, tips, fees and extras that vendors quote late or not at all. Based on the picks above.</p>
          <div class="lines">${hiddenRows}</div>
        </div>
        ${hours ? `<div class="note">Your DIY picks add up to about <b>${hours} hours</b> of work and need <b>${helpers} helper${helpers === 1 ? '' : 's'}</b> on the day. Line them up early. The schedule has a task for it.</div>` : ''}` : ''}
      </div>
      <div class="side">
        <div class="card stack">
          <div class="muted small">${have.length} of ${CATS.length} categories chosen</div>
          <div class="big">${money(real)}</div>
          <div class="muted small">real total with tax, tips and extras</div>
          <div class="stat"><span>Picks</span><b>${money(planned)}</b></div>
          ${rentals ? `<div class="stat"><span>Marketplace</span><b>${money(rentals)}</b></div>` : ''}
          <div class="stat"><span>Tax, tips and extras</span><b>${money(extras)}</b></div>
          <div class="stat"><span>Total budget</span><b>${money(state.budget)}</b></div>
          <div class="stat"><span>Left to plan</span><b class="${state.budget - real < 0 ? 'bad' : ''}">${money(state.budget - real)}</b></div>
          ${deposits().held ? `<div class="stat"><span>Deposits held safely</span><b>${money(deposits().held)}</b></div><div class="muted small">Released to vendors after the wedding. Covers no-shows.</div>` : ''}
          <button class="primary block" data-export>Export to Excel</button>
        </div>
        <div class="card stack">
          <h3>Share with whoever is helping</h3>
          <p class="muted small">Send a link so a partner or parent sees the same plan. The Excel file works too.</p>
          <button class="ghost" data-share>Copy share link</button>
          ${state.share ? `<input class="share-url" type="text" readonly value="${state.share}" aria-label="Share link" onfocus="this.select()">` : ''}
        </div>
        ${need.length ? `<h3>Still to choose</h3><div class="side-list">${todo}</div>` : `<div class="note good">Every category has a pick.</div>`}
      </div>
    </div>
  </div></section>`;
}

// Checklist of what to do before the wedding. "m" is months before the date on a 12-month plan, "d" is days before.
// A task with "cat" ticks itself when that category has a pick; "built" ticks when the budget is built.
// "short" is the label that fits in a calendar cell.
const TASKS = [
  { id: 'budget', m: 12, text: 'Set your total budget and priorities', short: 'Budget', built: true },
  { id: 'guests', m: 12, text: 'Draft your guest list', short: 'Guest list' },
  { id: 'venue', m: 10, text: 'Book your venue', short: 'Venue', cat: 'venue' },
  { id: 'photos', m: 9, text: 'Book your photographer', short: 'Photographer', cat: 'photos' },
  { id: 'food', m: 9, text: 'Book catering', short: 'Catering', cat: 'food' },
  { id: 'attire', m: 8, text: 'Choose your attire', short: 'Attire', cat: 'attire' },
  { id: 'music', m: 6, text: 'Book music', short: 'Music', cat: 'music' },
  { id: 'flowers', m: 6, text: 'Plan flowers', short: 'Flowers', cat: 'flowers' },
  { id: 'savedate', m: 6, text: 'Send save-the-dates', short: 'Save-the-dates' },
  { id: 'diy', m: 4, text: 'Plan DIY projects and line up helpers', short: 'DIY plan' },
  { id: 'invites', m: 4, text: 'Order or make invitations', short: 'Invitations' },
  { id: 'send', m: 2, text: 'Send invitations', short: 'Send invites' },
  { id: 'insurance', m: 2, text: 'Get event liability insurance', short: 'Insurance', affiliate: true },
  { id: 'license', m: 1, text: 'Get your marriage license', short: 'License' },
  { id: 'headcount', m: 1, text: 'Give the final headcount to your caterer', short: 'Headcount' },
  { id: 'confirm', d: 7, text: 'Confirm every vendor and the day-of timeline', short: 'Confirm vendors' },
  { id: 'finish', d: 7, text: 'Finish DIY projects', short: 'Finish DIY' },
];

// The big steps of planning, in order. The current phase is the first one with something left to do.
const PHASES = [
  { name: 'Set the budget', tasks: ['budget', 'guests'], guide: 'Everything else depends on three numbers: your total, your guest count and where the wedding is. Pick up to three priorities and we weight the split toward them.' },
  { name: 'Book the big three', tasks: ['venue', 'photos', 'food'], guide: 'Venue, photographer and catering take two thirds of most budgets and book up first. Drag each slider, open the options, and add one. Each pick ticks its task.' },
  { name: 'Fill in the details', tasks: ['attire', 'music', 'flowers', 'savedate', 'diy', 'invites', 'send'], guide: 'The smaller picks, plus the paper trail. DIY options show the hours they take so you can line up helpers early.' },
  { name: 'Final stretch', tasks: ['license', 'headcount', 'insurance', 'confirm', 'finish'], guide: 'The last month is confirmations. Give the caterer the final number, get the license, confirm every vendor, finish anything you are making yourself.' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const isDone = (t) => !!(state.done[t.id] || (t.cat && state.chosen[t.cat]) || (t.built && state.built));
const fmtDate = (dt) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const dayKey = (dt) => `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;

// Days, weeks and months until the wedding, from today.
function countdown() {
  const [y, mo, da] = state.date.split('-').map(Number);
  const wedding = new Date(y, mo - 1, da);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((wedding - today) / 86400000);
  let months = (wedding.getFullYear() - today.getFullYear()) * 12 + (wedding.getMonth() - today.getMonth());
  if (wedding.getDate() < today.getDate()) months -= 1;
  const afterMonths = new Date(today.getFullYear(), today.getMonth() + months, today.getDate());
  const days = Math.round((wedding - afterMonths) / 86400000);
  return { wedding, today, daysLeft, months: Math.max(0, months), days: Math.max(0, days), weeks: Math.floor(Math.max(0, daysLeft) / 7) };
}

// Every task with its due date. On a short timeline the 12-month plan is squeezed to fit.
function plan() {
  const { wedding, today, daysLeft } = countdown();
  const monthsLeft = daysLeft / 30.4;
  const span = Math.max(0.5, Math.min(12, monthsLeft));
  const daysBefore = (t) => (t.d ? t.d : Math.round((t.m / 12) * span * 30.4));
  const label = (t) => {
    const n = daysBefore(t);
    if (n >= 28) { const k = Math.max(1, Math.round(n / 30.4)); return `${k} month${k > 1 ? 's' : ''} before`; }
    if (n >= 7) { const k = Math.round(n / 7); return `${k} week${k > 1 ? 's' : ''} before`; }
    return n > 0 ? `${n} days before` : 'Now';
  };
  const tasks = TASKS.map((t) => {
    const due = new Date(wedding.getFullYear(), wedding.getMonth(), wedding.getDate() - daysBefore(t));
    const done = isDone(t);
    return { ...t, due, label: label(t), done, auto: done && !state.done[t.id], late: !done && due < today };
  });
  return { tasks, wedding, today, daysLeft, monthsLeft, compressed: daysLeft > 0 && monthsLeft < 12 };
}

function countdownCard(c) {
  if (c.daysLeft <= 0) return `<div class="countdown"><div class="big">0</div><div class="muted">That date has passed. Pick a new one.</div></div>`;
  return `
  <div class="countdown">
    <div class="big" data-bind="days">${c.daysLeft}</div>
    <div class="muted">day${c.daysLeft === 1 ? '' : 's'} until ${fmtDate(c.wedding)}</div>
    <div class="count-row">
      <div><b>${c.months}</b><span>month${c.months === 1 ? '' : 's'}</span></div>
      <div><b>${c.days}</b><span>day${c.days === 1 ? '' : 's'}</span></div>
      <div><b>${c.weeks}</b><span>week${c.weeks === 1 ? '' : 's'} total</span></div>
    </div>
  </div>`;
}

// The phase strip: done, current, upcoming.
function steps(tasks) {
  const byId = (id) => tasks.find((t) => t.id === id);
  let currentSeen = false;
  const items = PHASES.map((p, i) => {
    const list = p.tasks.map(byId);
    const done = list.filter((t) => t.done).length;
    const all = done === list.length;
    let status = 'upcoming';
    if (all) status = 'done';
    else if (!currentSeen) { status = 'current'; currentSeen = true; }
    const open = state.step === i;
    return `
    <button class="step ${status} ${open ? 'open' : ''}" data-step="${i}" aria-expanded="${open}">
      <div class="step-num">${all ? '✓' : i + 1}</div>
      <div class="step-body"><b>${p.name}</b><span class="muted small">${all ? 'Done' : `${done} of ${list.length} done`}${status === 'current' ? ' · you are here' : ''}</span></div>
      <span class="step-caret">${open ? '▴' : '▾'}</span>
    </button>`;
  }).join('');
  return `<div class="steps">${items}</div>${state.step === null || state.step === undefined ? '<div class="muted small steps-hint">Click a step to walk through it.</div>' : ''}`;
}

// The walkthrough panel for one phase: its tasks, with the real controls inline, and Back / Next.
function walkthrough(tasks, alloc) {
  const i = state.step;
  if (i === null || i === undefined || !PHASES[i]) return '';
  const ph = PHASES[i];
  const list = ph.tasks.map((id) => tasks.find((t) => t.id === id));
  const done = list.filter((t) => t.done).length;
  const { hours, helpers } = totals();
  const check = (t) => `<button class="check" data-task="${t.id}" aria-pressed="${t.done}" aria-label="${t.done ? 'Mark not done' : 'Mark done'}: ${t.text}" ${t.auto ? 'disabled' : ''}>${t.done ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>' : ''}</button>`;
  const taskRow = (t, extra) => `<div class="task walk-task ${t.done ? 'done' : ''}">${check(t)}<span class="text">${t.text}<span class="muted small"> · by ${fmtDate(t.due)}${ownerOf(t.id) ? ` · ${ownerOf(t.id).name}` : ''}</span></span>${t.late ? '<span class="badge over">Late</span>' : ''}${extra || ''}</div>`;
  let body = '';
  if (i === 0) {
    const regions = REGIONS.map((r) => `<button class="choice chip ${state.region === r.id ? 'on' : ''}" data-region="${r.id}">${r.name}</button>`).join('');
    const picks = CATS.map((c) => `<button class="choice chip ${isPick(c.id) ? 'on' : ''}" data-pick="${c.id}">${c.name}</button>`).join('');
    body = `
      ${taskRow(list[0])}
      <div class="walk-controls">
        <div class="field"><span>Total budget</span>${budgetInput()}</div>
        <div class="field"><span>Where</span><div class="chips">${regions}</div></div>
        <div class="field"><span>Priorities, up to 3</span><div class="chips">${picks}</div></div>
        ${state.built ? '' : '<button class="primary" data-build>Lock in my budget</button>'}
      </div>
      ${taskRow(list[1], `<span class="stepper"><button data-guests-delta="-10" aria-label="10 fewer guests">−</button><b data-bind="guests">${state.guests}</b><button data-guests-delta="10" aria-label="10 more guests">+</button></span>`)}
      <div class="muted small" data-bind="guestNote">${guestNote()}</div>`;
  } else if (i === 1) {
    body = list.map((t) => `${taskRow(t)}<div class="walk-cat">${catRows(alloc, [t.cat])}</div>`).join('');
  } else if (i === 2) {
    body = list.map((t) => t.cat
      ? `${taskRow(t)}<div class="walk-cat">${catRows(alloc, [t.cat])}</div>`
      : taskRow(t, t.id === 'diy' && hours ? `<span class="muted small">${hours} hours of DIY so far · ${helpers} helper${helpers === 1 ? '' : 's'}</span>` : t.id === 'diy' ? '<span class="muted small">Pick DIY options above and the hours add up here</span>' : '')).join('');
  } else {
    body = list.map((t) => taskRow(t,
      t.id === 'headcount' ? `<span class="muted small">Current count: <b>${state.guests}</b></span>`
      : t.id === 'insurance' ? `<span class="muted small">From about ${money(150 * region().m)}</span>`
      : t.id === 'finish' && hours ? `<span class="muted small">${hours} hours planned</span>`
      : t.id === 'confirm' ? `<span class="muted small">${CATS.filter((c) => state.chosen[c.id]).length} vendor${CATS.filter((c) => state.chosen[c.id]).length === 1 ? "" : "s"} to confirm</span>` : '')).join('');
  }
  return `
  <div class="card stack walk" id="walk">
    <div class="row"><span>Step ${i + 1} of ${PHASES.length}: ${ph.name}</span><span class="muted small">${done} of ${list.length} done</span></div>
    <div class="bar"><i style="width:${Math.round((done / list.length) * 100)}%"></i></div>
    <p class="muted">${ph.guide}</p>
    ${body}
    <div class="row-actions walk-nav">
      <span>${i > 0 ? `<button class="ghost" data-step="${i - 1}">Back</button>` : ''}</span>
      <span class="row-actions">
        <button class="link" data-step="${i}">Close</button>
        ${i < PHASES.length - 1 ? `<button class="primary" data-step="${i + 1}">Next: ${PHASES[i + 1].name}</button>` : '<button class="primary" data-step="3">All done, enjoy the day</button>'}
      </span>
    </div>
  </div>`;
}

function taskChip(t) {
  const o = ownerOf(t.id);
  const label = (o ? `${initials(o.name)} · ` : '') + (t.auto ? `${t.short} · ${t.cat ? pickOf(CATS.find((c) => c.id === t.cat)).label : 'done in planner'}` : t.short);
  return `<button class="chip-task ${t.done ? 'done' : ''} ${t.late ? 'late' : ''}" data-task="${t.id}" title="${t.text}${t.auto ? ' (ticks itself)' : ''}" ${t.auto ? 'disabled' : ''}>${label}</button>`;
}

// Month grid with tasks on their due dates.
function calendar(p) {
  const [cy, cm] = state.calMonth.split('-').map(Number);
  const first = new Date(cy, cm - 1, 1);
  const daysIn = new Date(cy, cm, 0).getDate();
  const byDay = {};
  p.tasks.forEach((t) => { const k = dayKey(t.due); (byDay[k] = byDay[k] || []).push(t); });
  const wk = dayKey(p.wedding);
  const tk = dayKey(p.today);
  const cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push('<div class="cal-cell blank"></div>');
  for (let d = 1; d <= daysIn; d++) {
    const dt = new Date(cy, cm - 1, d);
    const k = dayKey(dt);
    const list = byDay[k] || [];
    const cls = ['cal-cell', k === tk ? 'today' : '', k === wk ? 'wedding' : '', dt < p.today ? 'past' : ''].join(' ');
    cells.push(`<div class="${cls}"><div class="cal-day">${d}${k === tk ? '<span class="small"> today</span>' : ''}</div>${k === wk ? '<div class="cal-wedding">Wedding day</div>' : ''}${list.map(taskChip).join('')}</div>`);
  }
  const monthTasks = p.tasks.filter((t) => t.due.getFullYear() === cy && t.due.getMonth() === cm - 1);
  const left = monthTasks.filter((t) => !t.done).length;
  const wkM = `${p.wedding.getFullYear()}-${String(p.wedding.getMonth() + 1).padStart(2, '0')}`;
  const tM = `${p.today.getFullYear()}-${String(p.today.getMonth() + 1).padStart(2, '0')}`;
  return `
  <div class="card cal">
    <div class="cal-head">
      <div class="cal-title"><button class="ghost round" data-cal="-1" aria-label="Previous month">‹</button><h3>${MONTHS[cm - 1]} ${cy}</h3><button class="ghost round" data-cal="1" aria-label="Next month">›</button></div>
      <div class="cal-jump"><button class="link small" data-cal-jump="${tM}">Today</button><button class="link small" data-cal-jump="${wkM}">Wedding month</button></div>
    </div>
    <div class="muted small">${monthTasks.length ? `${monthTasks.length} task${monthTasks.length === 1 ? '' : 's'} due this month, ${left} left` : 'Nothing due this month'}</div>
    <div class="cal-dow">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<span>${d}</span>`).join('')}</div>
    <div class="cal-grid">${cells.join('')}</div>
  </div>`;
}

function taskList(p) {
  const groups = [];
  p.tasks.forEach((t) => {
    let g = groups.find((x) => x.label === t.label);
    if (!g) { g = { label: t.label, due: t.due, tasks: [] }; groups.push(g); }
    g.tasks.push(t);
  });
  const { hours, helpers } = totals();
  return groups.map((g) => {
    const late = g.tasks.some((t) => t.late);
    const items = g.tasks.map((t) => {
      const pick = t.cat && pickOf(CATS.find((c) => c.id === t.cat));
      const extra = t.auto
        ? `<span class="muted small">${pick ? `${pick.label} · ${money(pick.price)}` : 'Done in the budget planner'}</span>`
        : t.cat && !t.done ? `<button class="link" data-cat="${t.cat}" data-go="vendors">See options</button>`
        : t.built && !t.done ? `<button class="link" data-go="budget">Build my budget</button>`
        : t.id === 'diy' && hours ? `<span class="muted small">${hours} hours so far · ${helpers} helper${helpers === 1 ? '' : 's'}</span>`
        : t.affiliate && !t.done ? `<span class="muted small">From about ${money(150 * region().m)} through a partner insurer · <span class="badge who">we earn a referral</span></span>` : '';
      return `
      <div class="task ${t.done ? 'done' : ''}">
        <button class="check" data-task="${t.id}" aria-pressed="${t.done}" aria-label="${t.done ? 'Mark not done' : 'Mark done'}: ${t.text}" ${t.auto ? 'disabled' : ''}>
          ${t.done ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>' : ''}
        </button>
        <span class="text">${t.text}</span>${(() => { const o = ownerOf(t.id); return o ? `<span class="badge who">${o.name}</span>` : ''; })()}${extra}
      </div>`;
    }).join('');
    return `
    <div class="card group">
      <div class="row"><span>${g.label}</span><span class="small ${late ? '' : 'muted'}">${late ? '<span class="badge over">Catch up</span> ' : ''}by ${fmtDate(g.due)}</span></div>
      ${items}
    </div>`;
  }).join('') + `<div class="card group wedding-day"><div class="row"><span>Wedding day</span><span>${fmtDate(p.wedding)}</span></div></div>`;
}

function schedule() {
  const p = plan();
  const c = countdown();
  const doneCount = p.tasks.filter((t) => t.done).length;
  const lateCount = p.tasks.filter((t) => t.late).length;
  const next = p.tasks.find((t) => !t.done);
  const view = state.view === 'list' ? 'list' : 'calendar';
  return `
  <section class="section"><div class="wrap stack wide">
    <div class="stack"><div class="eyebrow">Schedule</div><h1>Your wedding timeline</h1><p class="lead">Pick your date and see what needs to happen before then, step by step.</p></div>
    ${steps(p.tasks)}
    <div class="two-col">
      <div class="side card">
        <label class="muted small" for="dateInput">Wedding date</label>
        <input id="dateInput" class="date-input" type="date" value="${state.date}" data-date>
        ${countdownCard(c)}
        <div class="stat"><span>Done</span><b>${doneCount} of ${TASKS.length}</b></div>
        <div class="bar"><i style="width:${Math.round((doneCount / TASKS.length) * 100)}%"></i></div>
        ${lateCount ? `<div class="note warn">${lateCount} task${lateCount === 1 ? ' is' : 's are'} past due. Tick them off or catch up this week.</div>` : ''}
        ${next ? `<div class="stat"><span>Up next</span><b>${next.short}</b></div><div class="muted small">${next.text}, by ${fmtDate(next.due)}</div>` : '<div class="note good">Everything is done. Enjoy the day.</div>'}
        <p class="muted small">Booking tasks tick themselves when you add a pick on the Vendors page. Click any other task to tick it.</p>
      </div>
      <div class="main">
        ${p.compressed ? `<div class="note warn">Your date is about ${Math.max(1, Math.round(p.monthsLeft))} month${Math.round(p.monthsLeft) === 1 ? '' : 's'} out, so we squeezed the usual 12-month plan to fit. Venue, catering and photographer come first.</div>` : ''}
        <div class="toggle" role="tablist"><button class="${view === 'calendar' ? 'on' : ''}" data-view="calendar">Calendar</button><button class="${view === 'list' ? 'on' : ''}" data-view="list">Checklist</button></div>
        ${view === 'calendar' ? calendar(p) : taskList(p)}
      </div>
    </div>
  </div></section>`;
}

// Download the finances as a real Excel file (wedding-budget.xlsx).
// Uses the SheetJS library in xlsx.full.min.js, which sits in this folder, so it works offline.
function exportExcel() {
  const { alloc, planned, hidden, extras, rentals } = totals();
  const usd = '"$"#,##0';
  const rows = [['Category', 'Priority', 'Budgeted', 'Chosen option', 'Planned cost', 'Left in category', 'DIY hours']];
  CATS.forEach((c) => {
    const p = pickOf(c);
    rows.push([c.name, isPick(c.id) ? 'Yes' : '', alloc[c.id], p ? p.label : '', p ? p.price : null, null, p && p.hours ? p.hours : null]);
  });
  LINES.forEach((l) => { rows.push([l.name, '', alloc.lines[l.id], '', null, null, null]); });
  const last = rows.length; // spreadsheet row number of the last category
  rows.push(['Total', '', null, '', null, null, null]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  for (let r = 2; r <= last; r++) {
    ws['C' + r].z = usd;
    if (ws['E' + r]) ws['E' + r].z = usd;
    ws['F' + r] = { t: 'n', f: `C${r}-E${r}`, z: usd };
  }
  const t = last + 1;
  ['C', 'E', 'F', 'G'].forEach((col) => { ws[col + t] = { t: 'n', f: `SUM(${col}2:${col}${last})`, z: col === 'G' ? '0' : usd }; });
  ws['!cols'] = [{ wch: 38 }, { wch: 10 }, { wch: 12 }, { wch: 38 }, { wch: 14 }, { wch: 16 }, { wch: 10 }];

  const hiddenRows = [['Hidden cost', 'Amount', 'Why']].concat(hidden.map((h) => [h.name, h.amount, h.why]));
  const hl = hiddenRows.length;
  hiddenRows.push(['Total', null, '']);
  const hs = XLSX.utils.aoa_to_sheet(hiddenRows);
  for (let r = 2; r <= hl; r++) hs['B' + r].z = usd;
  hs['B' + (hl + 1)] = { t: 'n', f: hl >= 2 ? `SUM(B2:B${hl})` : '0', z: usd };
  hs['!cols'] = [{ wch: 34 }, { wch: 12 }, { wch: 44 }];

  const summary = XLSX.utils.aoa_to_sheet([
    ['Wedding budget summary'],
    ['Wedding date', state.date],
    ['Guests', state.guests],
    ['Where', region().name],
    ['Total budget', state.budget],
    ['Planned so far', planned],
    ['Marketplace', rentals],
    ['Tax, tips and extras', extras],
    ['Real total', null],
    ['Left to plan', null],
    ['Budget per guest', null],
  ]);
  ['B5', 'B6', 'B7', 'B8'].forEach((k) => { summary[k].z = usd; });
  summary.B9 = { t: 'n', f: 'B6+B7+B8', z: usd };
  summary.B10 = { t: 'n', f: 'B5-B9', z: usd };
  summary.B11 = { t: 'n', f: 'B5/B3', z: usd };
  const booked = allListings().filter((l) => state.rentals[l.id]);
  const rentRows = [['Item', 'Listed by', 'Asked', 'Service fee', 'You pay']].concat(booked.map((l) => [l.title, l.owner, listingPrice(l), renterPays(l) - listingPrice(l), renterPays(l)]));
  const rs = XLSX.utils.aoa_to_sheet(rentRows);
  for (let r = 2; r <= rentRows.length; r++) ['C', 'D', 'E'].forEach((col) => { rs[col + r].z = usd; });
  rs['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 10 }];
  summary['!cols'] = [{ wch: 24 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Budget');
  XLSX.utils.book_append_sheet(wb, hs, 'Hidden costs');
  const cov = coverage();
  const peopleRows = [['Helper', 'Role', 'Covers', 'Cap', 'Items come to', 'They pay', 'Tasks', 'Confirmed']].concat(cov.rows.map((r) => [r.p.name, r.p.role, r.items.map((i) => i.name).join(', '), r.cap, r.committed, r.pays, r.tasks.map((t) => t.short).join(', '), r.p.accepted ? 'Yes' : 'No']));
  peopleRows.push(['You two', '', 'Everything else', null, null, cov.couple, '', '']);
  const ps = XLSX.utils.aoa_to_sheet(peopleRows);
  for (let r = 2; r <= peopleRows.length; r++) ['D', 'E', 'F'].forEach((col) => { if (ps[col + r]) ps[col + r].z = usd; });
  ps['!cols'] = [{ wch: 16 }, { wch: 14 }, { wch: 40 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 30 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, rs, 'Marketplace');
  XLSX.utils.book_append_sheet(wb, ps, 'Who pays');
  XLSX.utils.book_append_sheet(wb, summary, 'Summary');
  XLSX.writeFile(wb, 'wedding-budget.xlsx');
}

// ---------- Render and clicks ----------

function home() {
  return dash();
}

const PAGES = { home, about, budget, vendors, inspo, market, people, picks, schedule, all, dash, helper };
const app = document.getElementById('app');

function render() {
  app.innerHTML = nav() + PAGES[state.page]() + footer();
  save();
}

app.addEventListener('click', (e) => {
  const el = e.target.closest('button, [data-pick]');
  if (!el) return;
  if (el.tagName === 'BUTTON' && el.type === 'submit' && el.closest('form')) return; // let the form's submit handler run
  const d = el.dataset;
  const before = state.page;
  state.flash = '';

  if (d.budget) { state.budget = Number(d.budget); }
  if (d.guests) { state.guests = Number(d.guests); }
  if (d.guestsDelta) { state.guests = Math.max(10, Math.min(1000, state.guests + Number(d.guestsDelta))); }
  if (d.region) { state.region = d.region; }
  if (d.pick) {
    if (isPick(d.pick)) state.picks = state.picks.filter((id) => id !== d.pick);
    else if (state.picks.length < 3) state.picks.push(d.pick);
    state.custom = null; // back to the suggested split for the new priorities
  }
  if (d.build !== undefined) { state.built = true; state.page = 'home'; if (state.step === 0) state.step = 1; }
  if (d.edit !== undefined) { state.built = false; }
  if (d.reset !== undefined) { state.custom = null; }
  if (d.resale !== undefined) {
    const items = resaleItems();
    items.forEach((r, i) => state.listings.push({ id: 'r' + Date.now() + i, title: r.title, cat: r.cat, price: r.price, unit: r.unit, owner: 'You', rating: 0, reviews: 0, miles: 0, tone: '#E7D3E6', mine: true }));
    state.resold = true;
    state.flash = `${items.length} item${items.length === 1 ? '' : 's'} listed on the marketplace. Sold once and rented 8 times a year, that is about ${money(items.reduce((t, r) => t + r.price * (1 - OWNER_CUT) * (r.unit === 'day' ? 8 : 1), 0))} back.`;
  }
  if (d.deposit) { const ch = state.chosen[d.deposit]; if (ch) { ch.deposit = !ch.deposit; state.flash = ch.deposit ? `Deposit held by ${APP_NAME} until the day. The vendor pays our ${Math.round(VENDOR_FEE * 100)}% fee. You pay nothing extra.` : ''; } }
  if (d.cat) { state.cat = d.cat; }
  if (d.step !== undefined) { const n = Number(d.step); state.step = (state.step === n && state.page === 'home' && !el.classList.contains('primary') && !el.classList.contains('ghost')) ? null : n; if (state.page !== 'home') state.page = 'home'; }
  if (d.sync !== undefined) {
    cloud.publish().then(() => { cloud.status = 'saved'; state.flash = 'Synced. Your share links are short now, and helpers\' answers will come back to you.'; save(); cloud.startPolling(); render(); })
      .catch((e) => { state.flash = 'Could not sync: ' + e.message + '. Did you run backend/supabase.sql?'; render(); });
    return;
  }
  if (d.privateLink !== undefined) {
    state.share = `${location.origin}${location.pathname}?plan=${state.cloudCode}&key=${state.editKey}`; state.shareWho = null;
    state.flash = 'Private link copied. Anyone with it can edit, so only send it to your partner.';
    const copy = navigator.clipboard ? navigator.clipboard.writeText(state.share) : Promise.reject();
    copy.catch(() => { state.flash = 'Copy the private link below. Anyone with it can edit.'; render(); });
  }
  if (d.clearBoard !== undefined) { state.board = null; }
  if (d.expand) { state.open[d.expand] = !state.open[d.expand]; }
  if (d.expandOnly) { state.open[d.expandOnly] = true; }
  if (d.showOver) { state.showOver[d.showOver] = !state.showOver[d.showOver]; }
  if (d.choose !== undefined) {
    const cur = CATS.find((c) => c.id === state.cat);
    const i = Number(d.choose);
    if (state.chosen[cur.id] && state.chosen[cur.id].i === i) delete state.chosen[cur.id];
    else state.chosen[cur.id] = { i };
  }
  if (d.import !== undefined) { state.imported = true; }
  if (d.export !== undefined) { exportExcel(); return; }
  if (d.remove) { delete state.chosen[d.remove]; }
  if (d.task) { state.done[d.task] = !state.done[d.task]; }
  if ((d.task || d.accept) && state.who && cloudOn() && state.cloudCode) { cloud.respond(state.who).catch((e) => { state.flash = 'Could not send: ' + e.message; render(); }); }
  if (d.share !== undefined) {
    state.share = shareLink(); state.shareWho = null;
    state.flash = 'Link copied. Send it to anyone who is helping pay.';
    const copy = navigator.clipboard ? navigator.clipboard.writeText(state.share) : Promise.reject();
    copy.catch(() => { state.flash = 'Copy the link below and send it to anyone who is helping pay.'; render(); });
  }
  if (d.startover !== undefined) {
    try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ }
    Object.assign(state, fresh());
    state.flash = '';
  }
  if (d.view) { state.view = d.view; }
  if (d.cover && d.person) { const p = personById(d.person); if (p) { p.covers = p.covers || []; p.covers = p.covers.includes(d.cover) ? p.covers.filter((x) => x !== d.cover) : p.covers.concat(d.cover); } }
  if (d.assign && d.person) { const p = personById(d.person); if (p) { const had = (p.tasks || []).includes(d.assign); state.people.forEach((q) => { q.tasks = (q.tasks || []).filter((x) => x !== d.assign); }); if (!had) p.tasks.push(d.assign); } }
  if (d.removePerson) { state.people = state.people.filter((p) => p.id !== d.removePerson); }
  if (d.shareWho) {
    const p = personById(d.shareWho);
    state.share = shareLink(d.shareWho); state.shareWho = d.shareWho;
    state.flash = `${p.name}'s link copied. They will see only their part.`;
    const copy = navigator.clipboard ? navigator.clipboard.writeText(state.share) : Promise.reject();
    copy.catch(() => { state.flash = `Copy the link under ${p.name}'s card and send it to them.`; render(); });
  }
  if (d.accept) { const p = personById(d.accept); if (p) p.accepted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); state.flash = cloudOn() && state.cloudCode ? 'Sent to the couple. Thank you.' : 'Saved on this device. The couple will see it when this syncs in the real version.'; }
  if (d.ownplan !== undefined) { Object.assign(state, fresh()); state.flash = 'Fresh plan. Set your number to start.'; state.page = 'budget'; }
  if (d.fullview !== undefined) { state.who = null; state.page = 'home'; }
  if (d.sample !== undefined) { loadSample(); state.flash = 'Sample wedding loaded. Scroll down to see every feature filled in.'; }
  if (d.mtab) { state.market.tab = d.mtab; }
  if (d.mcat) { state.market.cat = d.mcat; }
  if (d.mkind) { state.market.kind = d.mkind; }
  if (d.rent) { if (state.rentals[d.rent]) delete state.rentals[d.rent]; else state.rentals[d.rent] = true; }
  if (d.unlist) { state.listings = state.listings.filter((l) => l.id !== d.unlist); delete state.rentals[d.unlist]; }
  if (d.cal) { const [y, m] = state.calMonth.split('-').map(Number); const dt = new Date(y, m - 1 + Number(d.cal), 1); state.calMonth = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`; }
  if (d.calJump) { state.calMonth = d.calJump; }
  if (d.go) { state.page = d.go; }

  render();
  if (d.expandOnly) { const el = app.querySelector(`[data-opts=${d.expandOnly}]`); if (el) el.scrollIntoView({ block: 'center' }); }
  if (d.step !== undefined && state.step !== null) { const el = document.getElementById('walk'); if (el && (el.classList.contains('primary') || before !== 'home' || el.getBoundingClientRect().top < 0)) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  if (state.page !== before || d.build !== undefined || d.edit !== undefined || d.startover !== undefined) window.scrollTo(0, 0);
});

// Update numbers, sliders and the pie in place, so typing and dragging are not interrupted.
function patch(skip) {
  const alloc = allocations();
  const set = (sel, html) => app.querySelectorAll(sel).forEach((el) => { el.innerHTML = html; });
  set('[data-bind=budget]', money(state.budget));
  set('[data-bind=guests]', state.guests);
  set('[data-bind=perGuest]', money(state.budget / state.guests));
  set('[data-bind=guestNote]', guestNote());
  const tt = totals();
  set('[data-bind=left]', money(Math.abs(state.budget - tt.real)));
  set('[data-bind=real]', money(tt.real || state.budget));
  app.querySelectorAll('[data-bind=realBar]').forEach((el) => { el.style.width = Math.min(100, Math.round((tt.real / state.budget) * 100)) + '%'; el.classList.toggle('over', tt.real > state.budget); });
  CATS.forEach((c) => set(`[data-amt=${c.id}]`, money(alloc[c.id])));
  LINES.forEach((l) => set(`[data-amt=line-${l.id}]`, money(alloc.lines[l.id])));
  set('[data-amt=other]', money(alloc.other));
  app.querySelectorAll('[data-slide]').forEach((el) => {
    if (el === skip) return;
    el.max = round(alloc.pool, 50);
    el.value = alloc[el.dataset.slide];
  });
  app.querySelectorAll('[data-budget]').forEach((el) => el.classList.toggle('on', Number(el.dataset.budget) === state.budget));
  app.querySelectorAll('[data-guests]').forEach((el) => el.classList.toggle('on', Number(el.dataset.guests) === state.guests));
  const chart = document.getElementById('pie');
  if (chart) chart.innerHTML = pie(alloc);
  app.querySelectorAll('[data-opt]').forEach((el) => {
    const c = CATS.find((x) => x.id === el.dataset.opt);
    const a = alloc[c.id];
    const price = Number(el.dataset.price);
    const out = price > a;
    el.classList.toggle('out', out);
    const i = [...el.parentNode.querySelectorAll('[data-opt]')].indexOf(el);
    el.querySelector('[data-opt-badge]').textContent = out ? `Over by ${money(price - a)}` : c.opts[i].hours ? 'DIY' : 'Fits';
  });
  app.querySelectorAll('[data-over-count]').forEach((el) => {
    const c = CATS.find((x) => x.id === el.dataset.overCount);
    const a = alloc[c.id];
    const over = c.opts.filter((o, i) => priceOf(c, i) > a).length;
    el.textContent = over ? `${over} option${over > 1 ? 's' : ''} over ${money(a)} · ${state.showOver[c.id] ? 'hide' : 'show'}` : 'Every option fits';
  });
  save();
}

app.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.budgetInput !== undefined) {
    const v = Math.round(Number(el.value));
    if (v >= 500 && v <= 1000000) { state.budget = v; patch(); }
  }
  if (el.dataset.guestsInput !== undefined) {
    const v = Math.round(Number(el.value));
    if (v >= 10 && v <= 1000) { state.guests = v; patch(); }
  }
  if (el.dataset.slide) { setAmount(el.dataset.slide, Number(el.value)); patch(el); }
  if (el.dataset.marketQ !== undefined) { state.market.q = el.value; filterMarket(); }
  if (el.dataset.cap) { const p = personById(el.dataset.cap); if (p) { p.cap = Math.max(0, Math.round(Number(el.value)) || 0); save(); } }
  if (el.name === 'price' && el.closest('[data-list-form]')) {
    const v = Number(el.value);
    const note = app.querySelector('[data-bind=earnNote]');
    if (note) note.innerHTML = v >= 5 ? `You keep <b>${money(v * (1 - OWNER_CUT))}</b> per booking. Renters see ${money(v * (1 + RENTER_FEE))}. About <b>${money(v * (1 - OWNER_CUT) * 8)}</b> a year at 8 bookings.` : 'Type a price to see what you would earn.';
  }
});

app.addEventListener('submit', (e) => {
  const mf = e.target.closest('[data-manual-form]');
  if (mf) {
    e.preventDefault();
    const lines = String(new FormData(mf).get('lines') || '').split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    state.board = { url: '', title: 'Your looks', looks: lines.slice(0, 24).map((t, i) => pinToLook({ title: t, img: '', link: '' }, i)) };
    state.imported = true; state.importError = '';
    state.flash = `${lines.length} look${lines.length === 1 ? '' : 's'} priced.`;
    render();
    return;
  }
  const bf = e.target.closest('[data-board-form]');
  if (bf) {
    e.preventDefault();
    const url = String(new FormData(bf).get('url') || '').trim();
    if (!url) { state.importError = 'Paste a link first.'; render(); return; }
    state.importUrl = url; state.importing = true; state.importError = ''; render();
    const focus = () => { const el = document.getElementById('import-status'); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
    focus();
    importBoard(url).then((board) => { state.board = board; state.imported = true; state.importing = false; state.flash = `${board.looks.length} pins imported from ${board.title}.`; render(); focus(); })
      .catch((err) => { state.importing = false; state.importError = err.message === 'Failed to fetch' ? 'Could not reach the importer. Check your connection and try again.' : err.message; render(); focus(); });
    return;
  }
  const pf = e.target.closest('[data-person-form]');
  if (pf) {
    e.preventDefault();
    const f = new FormData(pf);
    const name = String(f.get('name') || '').trim();
    if (!name) return;
    const cap = Math.round(Number(f.get('cap'))) || 0;
    const id = 'p' + Date.now();
    state.people.push({ id, name, role: String(f.get('role')), cap, covers: [], tasks: [], accepted: '' });
    state.flash = `${name} added. Tap what they cover and which tasks they own, then copy their link.`;
    render();
    const el = document.getElementById('person-' + id);
    if (el) el.scrollIntoView({ block: 'start' });
    return;
  }
  const form = e.target.closest('[data-list-form]');
  if (!form) return;
  e.preventDefault();
  const f = new FormData(form);
  const price = Math.round(Number(f.get('price')));
  const title = String(f.get('title') || '').trim();
  if (!title || !(price >= 5)) return;
  state.listings.push({ id: 'u' + Date.now(), title, cat: String(f.get('cat')), price, unit: String(f.get('unit')), owner: String(f.get('owner') || '').trim() || 'You', rating: 0, reviews: 0, miles: 0, tone: '#E7D3E6', mine: true });
  state.flash = `Listed. You would earn ${money(price * (1 - OWNER_CUT))} each time it books.`;
  render();
});

app.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.budgetInput !== undefined) el.value = state.budget; // snap back if the typed value was not usable
  if (el.dataset.guestsInput !== undefined) el.value = state.guests;
  if (el.dataset.slide) render();
  if (el.dataset.cap) render();
  if (el.dataset.date !== undefined && el.value) { state.date = el.value; render(); }
});

load();
render();
cloud.boot();
