# RESCAR Propiedad Raíz · sitio web

Sitio de la marca RESCAR con su proyecto actual, **La Virginia** (condominio campestre, El Retiro): portada en video, proyectos, plano interactivo de los 16 lotes con precios y fotos, avance de obra, ubicación, galería y formulario de contacto.

## Estructura
```
index.html            Página completa (HTML, CSS y JS)
lotes.json            Lotes: estado, área, precio, fotos, polígono en el plano. Se actualiza aquí, sin tocar el diseño.
img/ vid/             Fotos (WebP desde los originales 4K del 9-nov-2026) y videos reales
functions/api/lead.js  Recibe el formulario y guarda cada lead en Cloudflare KV
functions/api/leads.js Lista y actualiza leads para el panel (protegido con PANEL_KEY)
panel/                 Panel de leads: /panel (botón directo a WhatsApp de cada cliente, estados, notas, CSV)
tools/                 Scripts para regenerar medios y capturas
```

## Publicación (Cloudflare Pages, gratis)
1. Cloudflare → Workers & Pages → Create → Pages → conectar este repositorio. Build command: vacío. Output: `/`.
2. Workers & Pages → KV → crear el espacio `rescar-leads`.
3. En el proyecto Pages → Settings → Bindings → KV namespace: variable `LEADS` → `rescar-leads`.
4. Settings → Variables and secrets → agregar el secreto `PANEL_KEY` (la clave del panel; la escribe el dueño).
5. (Opcional) `TELEGRAM_TOKEN` y `TELEGRAM_CHAT` para aviso instantáneo de cada lead.
La URL queda como `https://rescar.pages.dev` (o similar) hasta conectar un dominio propio.

## Actualizar disponibilidad
En `lotes.json`: `estado` (`disponible`, `reservado`, `vendido`), `precio` en pesos, `actualizado` (AAAA-MM-DD).
