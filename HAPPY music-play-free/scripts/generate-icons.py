#!/usr/bin/env python3
"""Generate PWA icons and favicon for MUSIC-PLAY-FREE."""

import os
import struct
import zlib

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
FAVICON_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'favicon.svg')

os.makedirs(OUT_DIR, exist_ok=True)


def create_png(width, height, rgba_data):
    """Create a minimal PNG from RGBA pixel data."""
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))

    raw = b''
    for y in range(height):
        raw += b'\x00'  # filter none
        for x in range(width):
            idx = (y * width + x) * 4
            raw += bytes(rgba_data[idx:idx+4])

    idat = chunk(b'IDAT', zlib.compress(raw))
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend


def generate_icon(size, maskable=False):
    """Generate an icon with a music note on a colored background."""
    pixels = [0] * (size * size * 4)
    cx, cy = size / 2, size / 2

    # Colors
    bg_r, bg_g, bg_b = 232, 93, 58  # #e85d3a accent
    if maskable:
        # Use same color for maskable - full bleed
        pass

    pad = size * 0.0 if maskable else size * 0.08

    for y in range(size):
        for x in range(size):
            idx = (y * size + x) * 4
            nx = (x - cx) / (size / 2)
            ny = (y - cy) / (size / 2)

            if maskable:
                # Full square background
                pixels[idx] = bg_r
                pixels[idx+1] = bg_g
                pixels[idx+2] = bg_b
                pixels[idx+3] = 255
            else:
                # Rounded rect background
                corner_r = 0.22
                in_rect = True
                for c_x, c_y in [(-1+corner_r, -1+corner_r), (1-corner_r, -1+corner_r),
                                   (-1+corner_r, 1-corner_r), (1-corner_r, 1-corner_r)]:
                    if (nx < c_x and ny < c_y) or (nx > -c_x and ny < c_y) or \
                       (nx < c_x and ny > -c_y) or (nx > -c_x and ny > -c_y):
                        if ((nx - c_x)**2 + (ny - c_y)**2) > corner_r**2:
                            in_rect = False

                # Also check if within square bounds
                if abs(nx) <= 1 and abs(ny) <= 1:
                    # Check rounded corners
                    r = corner_r
                    corners = [
                        (nx > (1-r) and ny < (-(1-r))),
                        (nx < (-(1-r)) and ny < (-(1-r))),
                        (nx > (1-r) and ny > (1-r)),
                        (nx < (-(1-r)) and ny > (1-r)),
                    ]
                    skip = False
                    for corner_check_x, corner_check_y in [((1-r), -(1-r)), (-(1-r), -(1-r)),
                                                               ((1-r), (1-r)), (-(1-r), (1-r))]:
                        if nx > corner_check_x and ny < corner_check_y:
                            if (nx - corner_check_x)**2 + (ny - corner_check_y)**2 > r**2:
                                skip = True
                        elif nx < corner_check_x and ny < corner_check_y:
                            if (nx - corner_check_x)**2 + (ny - corner_check_y)**2 > r**2:
                                skip = True
                        elif nx > corner_check_x and ny > corner_check_y:
                            if (nx - corner_check_x)**2 + (ny - corner_check_y)**2 > r**2:
                                skip = True
                        elif nx < corner_check_x and ny > corner_check_y:
                            if (nx - corner_check_x)**2 + (ny - corner_check_y)**2 > r**2:
                                skip = True

                    if not skip:
                        pixels[idx] = bg_r
                        pixels[idx+1] = bg_g
                        pixels[idx+2] = bg_b
                        pixels[idx+3] = 255

    # Draw play triangle (white)
    s = size * 0.3  # triangle size
    tx = cx - size * 0.06  # offset for visual center
    ty = cy
    
    # Triangle vertices: left-top, left-bottom, right-center
    p1x, p1y = tx - s*0.45, ty - s*0.55
    p2x, p2y = tx - s*0.45, ty + s*0.55
    p3x, p3y = tx + s*0.55, ty

    for y in range(size):
        for x in range(size):
            # Check if point is inside triangle using barycentric coordinates
            d1 = (x - p3x) * (p1y - p3y) - (p1x - p3x) * (y - p3y)
            d2 = (x - p1x) * (p2y - p1y) - (p2x - p1x) * (y - p1y)
            d3 = (x - p2x) * (p3y - p2y) - (p3x - p2x) * (y - p2y)
            
            has_neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
            has_pos = (d1 > 0) or (d2 > 0) or (d3 > 0)
            
            if not (has_neg and has_pos):
                idx = (y * size + x) * 4
                pixels[idx] = 255
                pixels[idx+1] = 255
                pixels[idx+2] = 255
                pixels[idx+3] = 255

    return create_png(size, size, pixels)


# Generate all required icon sizes
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for size in sizes:
    print(f"Generating {size}x{size} icon...")
    png_data = generate_icon(size, maskable=False)
    path = os.path.join(OUT_DIR, f'icon-{size}.png')
    with open(path, 'wb') as f:
        f.write(png_data)
    print(f"  Saved: {path} ({len(png_data)} bytes)")

# Maskable icons
for size in [192, 512]:
    print(f"Generating maskable {size}x{size} icon...")
    png_data = generate_icon(size, maskable=True)
    path = os.path.join(OUT_DIR, f'maskable-{size}.png')
    with open(path, 'wb') as f:
        f.write(png_data)
    print(f"  Saved: {path} ({len(png_data)} bytes)")

# Generate favicon SVG
svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="16" fill="#e85d3a"/>
  <path d="M12 9v14l13-7-13-7z" fill="white"/>
</svg>'''

with open(FAVICON_PATH, 'w') as f:
    f.write(svg)
print(f"Saved favicon: {FAVICON_PATH}")

print("\nAll icons generated!")
