import sys, asyncio
from playwright.async_api import async_playwright
OUT = sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='chrome')
        for nombre, vp, mobile in (('escritorio', {'width': 1440, 'height': 900}, False), ('celular', {'width': 390, 'height': 844}, True)):
            pg = await b.new_page(viewport=vp, device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('http://localhost:8765/', wait_until='networkidle')
            h = await pg.evaluate('document.body.scrollHeight')
            for y in range(0, h, 500):
                await pg.evaluate(f'window.scrollTo(0,{y})'); await pg.wait_for_timeout(120)
            await pg.evaluate("document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))"); await pg.wait_for_timeout(1500); await pg.evaluate('window.scrollTo(0,0)'); await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'{OUT}/web_{nombre}.png', full_page=True)
            print(nombre, h, 'errores:', errs)
        await b.close()
asyncio.run(main())
