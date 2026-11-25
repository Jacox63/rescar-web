# RESCAR Propiedad Raíz · sitio web

Sitio de la marca RESCAR con su proyecto actual, **La Virginia** (condominio campestre, El Retiro): portada en video, proyectos, plano interactivo de los 16 lotes con precios y fotos, avance de obra, ubicación, galería y formulario de contacto.

## Estructura
```
index.html            Página completa (HTML, CSS y JS)
lotes.json            Lotes: estado, área, precio, fotos, polígono en el plano. Se actualiza aquí, sin tocar el diseño.
img/ vid/             Fotos (WebP desde los originales 4K del 9-nov-2026) y videos reales
panel/                 /panel abre la hoja de Google con los leads
tools/apps_script_leads.gs  Recepción de leads (Google Apps Script)
tools/                 Scripts para regenerar medios y capturas
```

## Publicación (GitHub Pages)
Settings → Pages → Deploy from a branch → `main` / `/ (root)`. Queda en `https://jacox63.github.io/rescar-web/` hasta conectar un dominio propio (Settings → Pages → Custom domain).

## Leads
El formulario envía cada lead a un Google Apps Script (`tools/apps_script_leads.gs`) ligado a la hoja **RESCAR · Leads web** del dueño:
fila nueva con enlace directo a WhatsApp + correo de aviso. `/panel` abre esa hoja (solo con la cuenta de Google del dueño).
La URL de la implementación va en `LEADS_URL` dentro de `index.html`.

## Actualizar disponibilidad
En `lotes.json`: `estado` (`disponible`, `reservado`, `vendido`), `precio` en pesos, `actualizado` (AAAA-MM-DD).
