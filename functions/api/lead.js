// POST /api/lead — guarda un lead del formulario en Cloudflare KV (binding LEADS).
// Opcional: si existen las variables TELEGRAM_TOKEN y TELEGRAM_CHAT, avisa al instante por Telegram.
const limpia = (v, n) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, n);

export async function onRequestPost({ request, env }) {
  let d;
  try { d = await request.json(); } catch { return json({ ok: false, error: 'formato' }, 400); }
  if (d.empresa) return json({ ok: true });                          // trampa para bots (campo oculto)
  const tel = String(d.celular || '').replace(/\D/g, '');
  if (!d.nombre || tel.length < 10 || !d.acepta) return json({ ok: false, error: 'datos' }, 422);
  const ahora = new Date();
  const id = `lead:${ahora.getTime()}:${crypto.randomUUID().slice(0, 8)}`;
  const lead = {
    id, fecha: ahora.toISOString(), estado: 'nuevo',
    nombre: limpia(d.nombre, 80), celular: tel.length === 10 ? '57' + tel : tel, correo: limpia(d.correo, 120),
    interes: limpia(d.interes, 60), lote: limpia(d.lote, 4), visita: limpia(d.fecha, 10), mensaje: limpia(d.mensaje, 800),
    origen: limpia(d.origen, 200), campana: limpia(d.campana, 80),
    ciudad: request.cf?.city || '', pais: request.cf?.country || '',
  };
  if (!env.LEADS) return json({ ok: false, error: 'sin_almacen' }, 500);
  await env.LEADS.put(id, JSON.stringify(lead));
  if (env.TELEGRAM_TOKEN && env.TELEGRAM_CHAT) {
    const t = `Nuevo lead RESCAR\n${lead.nombre} · +${lead.celular}\n${lead.interes}${lead.lote ? ' · lote ' + lead.lote : ''}\n${lead.mensaje}\nhttps://wa.me/${lead.celular}`;
    try { await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT, text: t }) }); } catch {}
  }
  return json({ ok: true });
}

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });
