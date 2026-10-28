/* Humanitarian Hub — /alerts — Cloudflare Pages Function
   Current disaster alerts from GDACS (Global Disaster Alert and Coordination System, UN & European Commission).
   Orange and red alerts from the last 21 days, newest first. Cached for 30 minutes.
   Optional: set RELIEFWEB_APPNAME (a ReliefWeb-approved appname) to add ReliefWeb's latest disasters. */
const TYPES = { EQ: 'Earthquake', TC: 'Tropical cyclone', FL: 'Flood', VO: 'Volcano', DR: 'Drought', WF: 'Wildfire', TS: 'Tsunami' };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=900', 'access-control-allow-origin': '*' } });

async function gdacs() {
  const to = new Date(), from = new Date(Date.now() - 21 * 864e5);
  const d = (x) => x.toISOString().slice(0, 10);
  const out = [];
  for (const lvl of ['red', 'orange']) {
    const u = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=EQ;TC;FL;VO;DR;WF&alertlevel=' + lvl + '&fromDate=' + d(from) + '&toDate=' + d(to) + '&pageSize=20';
    const r = await fetch(u, { headers: { accept: 'application/json' }, cf: { cacheTtl: 1800 } });
    if (!r.ok) continue;
    const j = await r.json().catch(() => null);
    for (const f of (j && j.features) || []) {
      const p = f.properties || {};
      const type = TYPES[p.eventtype] || 'Disaster';
      out.push({
        lv: String(p.alertlevel || lvl).toLowerCase() === 'red' ? 'red' : 'orange',
        type, title: p.name || p.eventname || type,
        country: p.country || '',
        severity: (p.severitydata && p.severitydata.severitytext) || '',
        date: p.todate || p.fromdate || null,
        link: 'https://www.gdacs.org/report.aspx?eventid=' + encodeURIComponent(p.eventid) + '&eventtype=' + encodeURIComponent(p.eventtype || ''),
        source: 'GDACS'
      });
    }
  }
  return out;
}

async function reliefweb(app) {
  const r = await fetch('https://api.reliefweb.int/v2/disasters?appname=' + encodeURIComponent(app) + '&preset=latest&limit=6&profile=list', { cf: { cacheTtl: 1800 } });
  if (!r.ok) return [];
  const j = await r.json().catch(() => null);
  return ((j && j.data) || []).map((it) => {
    const f = it.fields || {};
    const types = (f.type || []).map((t) => t.name).join(', ') || 'Emergency';
    return { lv: /Conflict|Violence|War/i.test(types) ? 'red' : 'orange', type: types, title: f.name || 'Humanitarian emergency',
      country: (f.country || []).map((c) => c.name).join(', '), severity: '', date: f.date && f.date.created, link: f.url_alias || f.url || 'https://reliefweb.int/disasters', source: 'ReliefWeb' };
  });
}

export async function onRequestGet({ env }) {
  try {
    const parts = await Promise.allSettled([gdacs(), env.RELIEFWEB_APPNAME ? reliefweb(env.RELIEFWEB_APPNAME) : Promise.resolve([])]);
    let list = parts.flatMap((p) => (p.status === 'fulfilled' ? p.value : []));
    const seen = new Set();
    list = list.filter((a) => { const k = a.title + a.country; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => (a.lv === b.lv ? 0 : a.lv === 'red' ? -1 : 1) || (new Date(b.date || 0) - new Date(a.date || 0)))
      .slice(0, 12);
    return json({ ok: true, updated: new Date().toISOString(), alerts: list });
  } catch (e) {
    return json({ ok: false, alerts: [] });
  }
}
