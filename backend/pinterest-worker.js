// Wedly Pinterest importer. Paste this into a Cloudflare Worker (Workers & Pages > Create > Worker).
// Pinterest publishes an RSS feed for every public board, but browsers are not allowed to read it
// directly. This worker fetches the feed and returns the pins as JSON that the site can use.
// Call it as: https://<your-worker>.workers.dev/pins?board=https://www.pinterest.com/user/board-name/
// (any path works; /pins is used so a static index.html can never shadow it)

export default {
  async fetch(request) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    const reply = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: cors });

    const board = new URL(request.url).searchParams.get('board');
    if (!board) return reply({ ok: true, usage: 'GET /pins?board=<public pinterest board url>' });
    let b;
    try { b = new URL(board); } catch (e) { return reply({ error: 'That is not a URL' }, 400); }
    if (!/(^|\.)pinterest\.[a-z.]+$/.test(b.hostname) && !/(^|\.)pin\.it$/.test(b.hostname)) return reply({ error: 'Only Pinterest links work here' }, 400);

    // Short pin.it links redirect to the real board.
    let path = b.pathname;
    if (/pin\.it$/.test(b.hostname)) {
      const r = await fetch(board, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0' } });
      const loc = r.headers.get('location');
      if (!loc) return reply({ error: 'Could not follow the short link' }, 400);
      path = new URL(loc).pathname;
    }
    path = path.replace(/\/+$/, '').replace(/\.rss$/, '');
    const parts = path.split('/').filter(Boolean);
    if (parts.length < 2) return reply({ error: 'Use a board link like pinterest.com/username/board-name' }, 400);
    const rssUrl = `https://www.pinterest.com/${parts[0]}/${parts[1]}.rss`;

    const r = await fetch(rssUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WedlyBot/1.0)' } });
    if (!r.ok) return reply({ error: `Pinterest said ${r.status}. Is the board public?` }, 502);
    const xml = await r.text();
    if (!xml.includes('<rss')) return reply({ error: 'That board has no public feed. Secret boards cannot be imported.' }, 404);

    const clean = (s) => (s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
    const title = clean((xml.match(/<channel>[\s\S]*?<title>([\s\S]*?)<\/title>/) || [])[1]);
    const pins = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
      const it = m[1];
      const desc = clean((it.match(/<description>([\s\S]*?)<\/description>/) || [])[1]);
      const img = (desc.match(/src="([^"]+)"/) || [])[1] || '';
      return {
        title: clean((it.match(/<title>([\s\S]*?)<\/title>/) || [])[1]),
        link: clean((it.match(/<link>([\s\S]*?)<\/link>/) || [])[1]),
        img: img.replace('/236x/', '/564x/'),
      };
    }).filter((p) => p.img);
    return reply({ title, board: rssUrl.replace('.rss', ''), pins });
  },
};
