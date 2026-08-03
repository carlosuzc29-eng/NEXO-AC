#!/usr/bin/env python3
from __future__ import annotations

from bs4 import BeautifulSoup
from pathlib import Path
import json
import os
import shutil

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / '_site'
SITE_URL = os.environ.get('SITE_URL', 'http://localhost:8000').rstrip('/')
CONFIG = json.loads((ROOT / 'site.config.json').read_text(encoding='utf-8'))

if DEST.exists():
    shutil.rmtree(DEST)
DEST.mkdir(parents=True)

for name in ['assets', 'proyectos']:
    shutil.copytree(ROOT / name, DEST / name)
for path in ROOT.glob('*.html'):
    shutil.copy2(path, DEST / path.name)
for name in ['site.webmanifest', '.nojekyll']:
    source = ROOT / name
    if source.exists():
        shutil.copy2(source, DEST / name)

# Inject the final public URL into social metadata.
for path in DEST.rglob('*.html'):
    text = path.read_text(encoding='utf-8').replace('__SITE_URL__', SITE_URL)
    path.write_text(text, encoding='utf-8')

# The custom 404 can be served at arbitrary nested routes. Make its internal
# assets and navigation absolute to the project URL.
error_page = DEST / '404.html'
if error_page.exists():
    soup = BeautifulSoup(error_page.read_text(encoding='utf-8'), 'html.parser')
    for tag in soup.find_all(['a', 'link', 'script', 'img']):
        attr = 'href' if tag.name in ('a', 'link') else 'src'
        value = tag.get(attr)
        if not value or value.startswith(('#', 'http://', 'https://', 'mailto:', 'tel:', 'data:')):
            continue
        clean = value.lstrip('./')
        tag[attr] = f'{SITE_URL}/{clean}'
    error_page.write_text(str(soup), encoding='utf-8')

# Generate deployment-specific robots and sitemap.
pages = []
for path in sorted(DEST.rglob('*.html')):
    if path.name == '404.html':
        continue
    rel = path.relative_to(DEST).as_posix()
    if rel == 'index.html':
        url = f'{SITE_URL}/'
    elif rel.endswith('/index.html'):
        url = f"{SITE_URL}/{rel[:-10]}"
    else:
        url = f'{SITE_URL}/{rel}'
    pages.append(url)

sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for url in pages:
    sitemap.append(f'  <url><loc>{url}</loc></url>')
sitemap.append('</urlset>')
(DEST / 'sitemap.xml').write_text('\n'.join(sitemap) + '\n', encoding='utf-8')
(DEST / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n', encoding='utf-8')

# Manifest can use relative scope safely on repository and custom-domain Pages.
manifest_path = DEST / 'site.webmanifest'
if manifest_path.exists():
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
else:
    manifest = {}
manifest.update({
    'name': CONFIG['site_name'],
    'short_name': 'Nexo',
    'description': CONFIG['site_description'],
    'lang': CONFIG['language'],
    'start_url': './',
    'scope': './',
    'display': 'standalone',
    'background_color': '#07131D',
    'theme_color': '#07131D',
    'icons': [
        {'src': 'assets/img/apple-touch-icon.png', 'sizes': '180x180', 'type': 'image/png'},
        {'src': 'assets/img/favicon-32.png', 'sizes': '32x32', 'type': 'image/png'}
    ]
})
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

print(f'Sitio preparado en {DEST}')
print(f'URL pública: {SITE_URL}')
print(f'Páginas: {len(pages)}')
