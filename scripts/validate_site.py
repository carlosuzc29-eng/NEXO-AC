#!/usr/bin/env python3
from __future__ import annotations

from bs4 import BeautifulSoup
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_DIRS = {'.git', '_site', 'node_modules'}
HTML_FILES = [p for p in ROOT.rglob('*.html') if not any(part in EXCLUDED_DIRS for part in p.parts)]
errors: list[str] = []
warnings: list[str] = []

EXTERNAL_PREFIXES = ('http://', 'https://', 'mailto:', 'tel:', 'javascript:', 'data:')
PRICE_PATTERNS = [
    re.compile(r'\b220\s*ref\b', re.I),
    re.compile(r'\b260\s*ref\b', re.I),
    re.compile(r'\b300\s*ref\b', re.I),
    re.compile(r'\b(?:precio|precios|usdt|binance)\b', re.I),
]
UNFINISHED_PATTERNS = [re.compile(r'\b(?:prototipo|provisional|pendiente:)\b', re.I)]


def local_target(source: Path, value: str) -> tuple[Path | None, str | None]:
    value = value.strip()
    if not value or value.startswith(EXTERNAL_PREFIXES) or value.startswith('__SITE_URL__'):
        return None, None
    if value.startswith('#'):
        return source, unquote(value[1:])
    parts = urlsplit(value)
    raw_path = unquote(parts.path)
    if not raw_path:
        return source, unquote(parts.fragment) if parts.fragment else None
    target = (source.parent / raw_path).resolve()
    if raw_path.endswith('/'):
        target = target / 'index.html'
    elif target.is_dir():
        target = target / 'index.html'
    return target, unquote(parts.fragment) if parts.fragment else None


for html_path in HTML_FILES:
    rel = html_path.relative_to(ROOT)
    text = html_path.read_text(encoding='utf-8')
    soup = BeautifulSoup(text, 'html.parser')

    if not soup.title or not soup.title.get_text(strip=True):
        errors.append(f'{rel}: falta <title>.')
    if not soup.find('meta', attrs={'name': 'description'}):
        errors.append(f'{rel}: falta meta description.')
    if not soup.find('meta', attrs={'name': 'viewport'}):
        errors.append(f'{rel}: falta viewport.')
    if not soup.find('main'):
        errors.append(f'{rel}: falta <main>.')
    if not soup.find('link', attrs={'rel': lambda v: v and 'stylesheet' in v}):
        errors.append(f'{rel}: falta hoja de estilos.')

    ids = [tag.get('id') for tag in soup.find_all(attrs={'id': True})]
    duplicates = sorted({item for item in ids if ids.count(item) > 1})
    if duplicates:
        errors.append(f'{rel}: IDs duplicados: {", ".join(duplicates)}.')

    visible_text = soup.get_text(' ', strip=True)
    for pattern in PRICE_PATTERNS:
        if pattern.search(visible_text):
            errors.append(f'{rel}: se detectó contenido económico no permitido: {pattern.pattern}.')
    for pattern in UNFINISHED_PATTERNS:
        if pattern.search(visible_text):
            warnings.append(f'{rel}: queda lenguaje de borrador: {pattern.pattern}.')

    for tag in soup.find_all(['a', 'link', 'script', 'img', 'source']):
        attr = 'href' if tag.name in ('a', 'link') else 'src'
        value = tag.get(attr)
        if not value:
            continue
        target, fragment = local_target(html_path, value)
        if target is None:
            continue
        try:
            target.relative_to(ROOT)
        except ValueError:
            errors.append(f'{rel}: referencia fuera del proyecto: {value}.')
            continue
        if not target.exists():
            errors.append(f'{rel}: recurso o enlace inexistente: {value}.')
            continue
        if fragment and target.suffix.lower() == '.html':
            target_soup = BeautifulSoup(target.read_text(encoding='utf-8'), 'html.parser')
            if not target_soup.find(id=fragment):
                errors.append(f'{rel}: ancla inexistente {value}.')

# Validate CSS url() references.
for css_path in ROOT.rglob('*.css'):
    if any(part in EXCLUDED_DIRS for part in css_path.parts):
        continue
    css = css_path.read_text(encoding='utf-8')
    for raw in re.findall(r'url\(([^)]+)\)', css):
        value = raw.strip(' "\'')
        if not value or value.startswith(EXTERNAL_PREFIXES) or value.startswith('data:'):
            continue
        target = (css_path.parent / urlsplit(value).path).resolve()
        if not target.exists():
            errors.append(f'{css_path.relative_to(ROOT)}: recurso CSS inexistente: {value}.')

# JS syntax.
js_file = ROOT / 'assets' / 'main.js'
try:
    result = subprocess.run(['node', '--check', str(js_file)], capture_output=True, text=True, check=False)
    if result.returncode:
        errors.append(f'assets/main.js: error de sintaxis:\n{result.stderr.strip()}')
except FileNotFoundError:
    warnings.append('Node no está disponible; no se validó la sintaxis JavaScript.')

print(f'HTML revisados: {len(HTML_FILES)}')
for warning in warnings:
    print(f'ADVERTENCIA: {warning}')
if errors:
    print('\nERRORES:')
    for error in errors:
        print(f'- {error}')
    sys.exit(1)
print('Validación completada sin errores.')
