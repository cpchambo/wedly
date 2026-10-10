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
    // Be forgiving about what people paste: no https, no www, "username/board", a profile, a phone share link.
    let raw = board.trim();
    if (/^@/.test(raw)) raw = raw.slice(1);
    if (!/^https?:\/\//i.test(raw)) raw = /^(www\.)?(pinterest\.|pin\.it)/i.test(raw) ? 'https://' + raw : 'https://www.pinterest.com/' + raw.replace(/^\/+/, '');
    let b;
    try { b = new URL(raw); } catch (e) { return reply({ error: 'That does not look like a link. Paste the board link from Pinterest.' }, 400); }
    if (!/(^|\.)pinterest\.[a-z.]+$/.test(b.hostname) && !/(^|\.)pin\.it$/.test(b.hostname)) return reply({ error: 'Only Pinterest links work here' }, 400);

    // Short pin.it links from the phone app redirect to the real board or pin. Follow them all the way.
    let path = b.pathname;
    if (/pin\.it$/.test(b.hostname)) {
      const r = await fetch(raw, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
      try { path = new URL(r.url).pathname; } catch (e) { return reply({ error: 'Could not follow that short link. Open the board in a browser and copy the address bar instead.' }, 400); }
    }
    path = path.replace(/\/+$/, '').replace(/\.rss$/, '');
    const parts = path.split('/').filter(Boolean);
    if (!parts.length) return reply({ error: 'Paste a link to one of your boards, or to your profile.' }, 400);
    if (parts[0] === 'pin') return reply({ error: 'That link is a single pin. Open the board it is saved to and copy that link instead.' }, 400);
    if (['search', 'ideas', 'today', 'settings', 'business'].includes(parts[0])) return reply({ error: 'Paste a link to one of your boards, or to your profile.' }, 400);
    // A profile link imports the person's most recent pins across all boards.
    const isProfile = parts.length === 1 || ['_saved', '_created', 'pins', 'boards'].includes(parts[1]);
    const rssUrl = isProfile ? `https://www.pinterest.com/${parts[0]}/feed.rss` : `https://www.pinterest.com/${parts[0]}/${parts[1]}.rss`;

    const r = await fetch(rssUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WedlyBot/1.0)' } });
    if (r.status === 404) return reply({ error: isProfile ? 'No public profile at that link. Check the username.' : 'Pinterest could not find that board. Secret boards cannot be imported. Make it public, or paste your profile link to import your recent pins.' }, 404);
    if (!r.ok) return reply({ error: `Pinterest said ${r.status}. Try again in a minute.` }, 502);
    const xml = await r.text();
    if (!xml.includes('<rss')) return reply({ error: 'That page has no public feed. Secret boards cannot be imported. Paste your profile link to import your recent pins instead.' }, 404);

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
    return reply({ title: isProfile ? `${title || parts[0]}: recent pins` : title, board: rssUrl.replace('.rss', ''), profile: isProfile, pins });
  },
};
