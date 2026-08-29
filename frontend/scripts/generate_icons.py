import os
import math
from PIL import Image, ImageDraw, ImageFont

def generate_nutrivedic_icons():
    """
    Generates high-resolution PWA and APK icons for NutriVedic.
    Renders with the exact brand typography matching the provided image:
    Nutri (Regular/Bold #0A0A0A) + Vedic (Italic #6B6B6B).
    No other elements (logo, subtitle) are included.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.dirname(script_dir)
    fonts_dir = os.path.join(frontend_dir, 'public', 'fonts')
    icons_dir = os.path.join(frontend_dir, 'public', 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    # 4x Supersampling at 2048x2048 for sharp rendering
    SIZE = 2048
    # Solid white background
    img = Image.new('RGBA', (SIZE, SIZE), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    cx, cy = SIZE // 2, SIZE // 2

    # Wordmark Typography: 'Nutri' + 'Vedic'
    font_nutri_path = os.path.join(fonts_dir, 'DMSerifDisplay-Regular.ttf')
    font_vedic_path = os.path.join(fonts_dir, 'DMSerifDisplay-Italic.ttf')

    # Calculate optimal font size to fit within 60% of canvas (adaptive icon safe zone)
    safe_width = int(SIZE * 0.60)
    font_size = int(SIZE * 0.20) # Start guess
    while True:
        font_nutri = ImageFont.truetype(font_nutri_path, font_size)
        font_vedic = ImageFont.truetype(font_vedic_path, font_size)
        bbox_n = draw.textbbox((0, 0), 'Nutri', font=font_nutri)
        bbox_v = draw.textbbox((0, 0), 'Vedic', font=font_vedic)
        total_w = (bbox_n[2] - bbox_n[0]) + (bbox_v[2] - bbox_v[0])
        if total_w <= safe_width or font_size <= 10:
            break
        font_size -= 5

    w_n = bbox_n[2] - bbox_n[0]
    w_v = bbox_v[2] - bbox_v[0]
    total_w = w_n + w_v
    
    # Calculate height to center vertically
    h_n = bbox_n[3] - bbox_n[1]
    h_v = bbox_v[3] - bbox_v[1]
    max_h = max(h_n, h_v)

    start_x = int(cx - total_w / 2)
    # The text rendering starts from the top line, so we offset by half the height
    text_y = int(cy - max_h / 2 - bbox_n[1]) # offset bbox[1]

    # 'Nutri' in bold black (#0A0A0A)
    draw.text((start_x, text_y), 'Nutri', font=font_nutri, fill=(10, 10, 10, 255))
    
    # 'Vedic' in italic muted gray (#6B6B6B)
    draw.text((start_x + w_n, text_y), 'Vedic', font=font_vedic, fill=(107, 107, 107, 255))

    # Export all target sizes
    sizes = [512, 192, 152, 144, 128, 96, 72]
    for s in sizes:
        resized = img.resize((s, s), Image.Resampling.LANCZOS)
        out_path = os.path.join(icons_dir, f'icon-{s}.png')
        resized.save(out_path, 'PNG')
        print(f'Generated: {out_path}')

    # Generate multi-resolution Favicon
    fav_path = os.path.join(frontend_dir, 'public', 'favicon.ico')
    fav_16 = img.resize((16, 16), Image.Resampling.LANCZOS)
    fav_16.save(fav_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print(f'Generated: {fav_path}')

if __name__ == '__main__':
    generate_nutrivedic_icons()
