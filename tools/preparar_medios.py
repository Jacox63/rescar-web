# Genera las fotos (WebP 2000 px + miniatura 800 px) y los videos de la web desde los originales 4K del 9-nov-2026.
import os, glob, json, subprocess
from PIL import Image, ImageOps
RES = r'C:\Users\USUARIO\Documents\ResCar'
WEB = os.path.join(RES, 'web', 'rescar-web')
ORIG = [os.path.join(RES, '06_VIDEOS_ORIGINALES', '_RECIBIDOS_PROPIETARIO', d, 'MULTIMEDIA LA VIRGINIA')
        for d in ('2026-11-19_drive_multimedia', '2026-11-19_drive_multimedia_lote2')]
NO_USAR = {'IMG_6404', 'IMG_6406', 'IMG_6410'}   # tierra con carretilla y banca / campamento con moto
fotos = {}
for d in ORIG:
    for f in glob.glob(os.path.join(d, '*.JPG')) + glob.glob(os.path.join(d, '*.jpg')):
        n = os.path.splitext(os.path.basename(f))[0]
        if n in NO_USAR: continue
        im = ImageOps.exif_transpose(Image.open(f)).convert('RGB')
        for suf, lado in (('', 2000), ('_m', 800)):
            c = im.copy(); c.thumbnail((lado, lado), Image.LANCZOS)
            c.save(os.path.join(WEB, 'img', f'{n}{suf}.webp'), 'WEBP', quality=82 if suf == '' else 75, method=6)
        fotos[n] = im.size
json.dump(fotos, open(os.path.join(WEB, 'tools', 'fotos.json'), 'w'), indent=1)
def ff(*a): subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], check=True)
L2 = os.path.join(ORIG[1])
AE = os.path.join(RES, 'RESCAR_LA_VIRGINIA_PRODUCCION', '01_ORIGINALES', 'Aereos', 'lotes_vistos_desde_arriba.mp4')
G = "eq=contrast=1.04:saturation=1.08,colorbalance=rs=0.02:bs=-0.02"
# portada escritorio (horizontal): paneo de lotes y montaña
ff('-ss', '0.3', '-t', '7.3', '-i', os.path.join(L2, 'IMG_6384.MOV'), '-an', '-vf', f'scale=1920:-2,fps=30,{G}',
   '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', os.path.join(WEB, 'vid', 'hero.mp4'))
# portada celular (vertical): aéreo de los lotes, decimado (24 cps reales) y a velocidad real
ff('-i', AE, '-an', '-vf', f'decimate=cycle=5,setpts=N/24/TB,scale=720:-2,{G}', '-r', '24', '-c:v', 'libx264', '-crf', '27',
   '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', os.path.join(WEB, 'vid', 'hero_m.mp4'))
for n, src, ss, t in (('recorrido', 'IMG_6395.MOV', 0, 7.5), ('bosque', 'IMG_6434.MOV', 0.5, 9), ('lote', 'IMG_6423.MOV', 0.5, 10)):
    ff('-ss', str(ss), '-t', str(t), '-i', os.path.join(L2, src), '-an', '-vf', f'scale=720:-2,fps=30,{G}', '-c:v', 'libx264',
       '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', os.path.join(WEB, 'vid', f'{n}.mp4'))
    ff('-ss', '1', '-i', os.path.join(WEB, 'vid', f'{n}.mp4'), '-frames:v', '1', os.path.join(WEB, 'vid', f'{n}.webp'))
ff('-ss', '2', '-i', os.path.join(WEB, 'vid', 'hero.mp4'), '-frames:v', '1', os.path.join(WEB, 'vid', 'hero.webp'))
print(len(fotos), 'fotos')
