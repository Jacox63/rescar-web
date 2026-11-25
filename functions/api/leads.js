// GET /api/leads — lista los leads (panel). PATCH /api/leads — cambia estado o notas de un lead.
// Protegido con la clave PANEL_KEY (variable secreta del proyecto en Cloudflare), enviada en el encabezado X-Panel-Key.
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const autorizado = (request, env) => env.PANEL_KEY && request.headers.get('X-Panel-Key') === env.PANEL_KEY;

export async function onRequestGet({ request, env }) {
  if (!autorizado(request, env)) return json({ ok: false, error: 'clave' }, 401);
  const leads = []; let cursor;
  do {
    const r = await env.LEADS.list({ prefix: 'lead:', cursor });
    for (const k of r.keys) { const v = await env.LEADS.get(k.name); if (v) leads.push(JSON.parse(v)); }
    cursor = r.list_complete ? undefined : r.cursor;
  } while (cursor);
  leads.sort((a, b) => b.fecha.localeCompare(a.fecha));
  return json({ ok: true, leads });
}

export async function onRequestPatch({ request, env }) {
  if (!autorizado(request, env)) return json({ ok: false, error: 'clave' }, 401);
  const { id, estado, notas } = await request.json();
  const v = id && await env.LEADS.get(id);
  if (!v) return json({ ok: false, error: 'no_existe' }, 404);
  const lead = JSON.parse(v);
  if (estado) lead.estado = String(estado).slice(0, 20);
  if (notas !== undefined) lead.notas = String(notas).slice(0, 500);
  lead.actualizado = new Date().toISOString();
  await env.LEADS.put(id, JSON.stringify(lead));
  return json({ ok: true, lead });
}
