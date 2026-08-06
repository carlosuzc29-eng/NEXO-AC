#!/usr/bin/env python3
"""
Script de optimización de videos escrito en Python para Nexo Agencia Creativa.

Funcionalidades:
- Comprime y optimiza videos (MP4 H.264 / WebM VP9) para la web.
- Aplica `-movflags +faststart` para reproducción fluida en web.
- Escala automáticamente la resolución máxima (ej: 1080p o 720p).
- Genera imágenes poster/miniatura (.jpg) para etiquetas <video poster="...">.
- Si no detecta 'ffmpeg' en el sistema, intenta usar la librería Python 'imageio-ffmpeg' (e incluso puede instalarla automáticamente vía pip si es necesario).
"""

from __future__ import annotations
import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

VIDEO_EXTENSIONS = {'.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'}


def get_ffmpeg_executable() -> str | None:
    """Obtiene la ruta al ejecutable de ffmpeg (del sistema o mediante paquete de Python)."""
    # 1. Intentar ffmpeg instalado en el sistema
    system_ffmpeg = shutil.which('ffmpeg')
    if system_ffmpeg:
        return system_ffmpeg

    # 2. Intentar usar la librería de Python 'imageio_ffmpeg'
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        pass

    return None


def ensure_ffmpeg() -> str:
    """Garantiza la presencia de ffmpeg. Si no existe, intenta instalar 'imageio-ffmpeg' mediante pip."""
    ffmpeg_exe = get_ffmpeg_executable()
    if ffmpeg_exe:
        return ffmpeg_exe

    print("⚠️  No se encontró 'ffmpeg' en el sistema.")
    print("📦 Intentando instalar la librería Python 'imageio-ffmpeg' automáticamente vía pip...")
    
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'imageio-ffmpeg'], check=True)
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        print("✔ Librería 'imageio-ffmpeg' instalada y lista para usar.\n")
        return ffmpeg_exe
    except Exception as e:
        print(f"\n❌ No se pudo instalar automáticamente: {e}")
        print("\nPara ejecutar este script en Python, por favor instala 'imageio-ffmpeg' manualmente:")
        print("    python3 -m pip install imageio-ffmpeg")
        sys.exit(1)


def optimize_video(
    ffmpeg_cmd: str,
    input_path: Path,
    output_dir: Path | None = None,
    max_height: int = 1080,
    crf: int = 24,
    generate_poster: bool = True,
    format_out: str = 'mp4'
) -> bool:
    """Optimiza un video para la web usando Python y FFmpeg."""
    if not input_path.exists():
        print(f"Error: El archivo {input_path} no existe.")
        return False

    if output_dir is None:
        output_dir = input_path.parent
    else:
        output_dir.mkdir(parents=True, exist_ok=True)

    base_name = input_path.stem
    output_path = output_dir / f"{base_name}_opt.{format_out}"
    poster_path = output_dir / f"{base_name}_poster.jpg"

    print(f"Procesando: {input_path.name} ...")

    scale_filter = f"scale=-2:'min(ih\\,{max_height})'"

    if format_out == 'mp4':
        cmd = [
            ffmpeg_cmd, '-y',
            '-i', str(input_path),
            '-vf', scale_filter,
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', str(crf),
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            '-c:a', 'aac',
            '-b:a', '128k',
            str(output_path)
        ]
    elif format_out == 'webm':
        cmd = [
            ffmpeg_cmd, '-y',
            '-i', str(input_path),
            '-vf', scale_filter,
            '-c:v', 'libvpx-vp9',
            '-crf', str(crf + 6),
            '-b:v', '0',
            '-c:a', 'libopus',
            '-b:a', '96k',
            str(output_path)
        ]
    else:
        print(f"Formato de salida '{format_out}' no soportado.")
        return False

    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        orig_size = input_path.stat().st_size / (1024 * 1024)
        new_size = output_path.stat().st_size / (1024 * 1024)
        savings = (1 - (new_size / orig_size)) * 100 if orig_size > 0 else 0
        print(f"  ✔ Video optimizado: {output_path.name}")
        print(f"    Tamaño: {orig_size:.2f} MB ➔ {new_size:.2f} MB ({savings:.1f}% de reducción)")
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Error al procesar video {input_path.name}:")
        print(e.stderr.decode('utf-8', errors='ignore'))
        return False

    # Generar poster/miniatura
    if generate_poster:
        poster_cmd = [
            ffmpeg_cmd, '-y',
            '-ss', '00:00:01',
            '-i', str(input_path),
            '-vframes', '1',
            '-vf', scale_filter,
            '-q:v', '3',
            str(poster_path)
        ]
        try:
            subprocess.run(poster_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
            print(f"  ✔ Poster generado: {poster_path.name}")
        except subprocess.CalledProcessError:
            poster_cmd[2] = '00:00:00'
            try:
                subprocess.run(poster_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
                print(f"  ✔ Poster generado: {poster_path.name}")
            except Exception as ex:
                print(f"  ⚠ No se pudo generar poster: {ex}")

    return True


def main():
    parser = argparse.ArgumentParser(description="Script de Python para optimización de videos web (MP4/WebM + FastStart + Posters)")
    parser.add_argument("path", nargs="?", default="assets/media", help="Ruta al video o carpeta a procesar (por defecto: assets/media)")
    parser.add_argument("--out", "-o", help="Carpeta de destino")
    parser.add_argument("--max-height", type=int, default=1080, help="Altura máxima en px (ej: 1080, 720). Por defecto: 1080")
    parser.add_argument("--crf", type=int, default=24, help="Compresión CRF (18-28). Por defecto: 24")
    parser.add_argument("--no-poster", action="store_true", help="No generar imagen poster (.jpg)")
    parser.add_argument("--format", choices=['mp4', 'webm'], default='mp4', help="Formato de salida ('mp4' o 'webm')")

    args = parser.parse_args()

    ffmpeg_exe = ensure_ffmpeg()

    target_path = Path(args.path).resolve()
    out_dir = Path(args.out).resolve() if args.out else None

    if target_path.is_file():
        files = [target_path]
    elif target_path.is_dir():
        files = [p for p in target_path.rglob('*') if p.suffix.lower() in VIDEO_EXTENSIONS and not p.stem.endswith('_opt')]
    else:
        print(f"Ruta no encontrada: {target_path}")
        sys.exit(1)

    if not files:
        print(f"No se encontraron videos para optimizar en: {target_path}")
        sys.exit(0)

    print(f"=== Optimizador de Videos (Script en Python) ===")
    print(f"Videos encontrados: {len(files)}")
    print(f"Altura máx: {args.max_height}px | CRF: {args.crf} | Formato: {args.format.upper()}\n")

    success_count = 0
    for file_path in files:
        if optimize_video(
            ffmpeg_cmd=ffmpeg_exe,
            input_path=file_path,
            output_dir=out_dir,
            max_height=args.max_height,
            crf=args.crf,
            generate_poster=not args.no_poster,
            format_out=args.format
        ):
            success_count += 1

    print(f"\nProceso finalizado. {success_count}/{len(files)} videos optimizados.")


if __name__ == '__main__':
    main()
