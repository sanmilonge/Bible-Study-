
import struct

def create_favicon():
    """Create a simple Bible-themed favicon.ico file"""
    width, height = 16, 16
    
    # ICO header
    ico_header = struct.pack('<HHH', 0, 1, 1)  # Reserved, Type, Count
    
    # ICO directory entry
    ico_dir = struct.pack('<BBBBHHLL', 
        width, height, 0, 0,  # Width, Height, Colors, Reserved
        1, 32,  # Planes, BitCount
        40 + (width * height * 4),  # ImageSize (header + data)
        22  # ImageOffset
    )
    
    # Bitmap header
    bmp_header = struct.pack('<LLLHHLLLLLL',
        40,  # HeaderSize
        width, height * 2,  # Width, Height (doubled for ICO)
        1, 32,  # Planes, BitCount
        0,  # Compression
        width * height * 4,  # ImageSize
        0, 0, 0, 0  # XPelsPerMeter, YPelsPerMeter, ClrUsed, ClrImportant
    )
    
    # Create pixel data (BGRA format) - Simple Bible icon
    pixels = []
    for y in range(height):
        for x in range(width):
            if (3 <= x <= 12 and 2 <= y <= 13):
                if (x == 3 or x == 12 or y == 2 or y == 13):
                    pixels.extend([255, 255, 255, 255])  # White border
                elif (6 <= x <= 9 and 5 <= y <= 10):
                    if (x == 7 or x == 8 or y == 7 or y == 8):
                        pixels.extend([36, 130, 243, 255])  # Blue cross
                    else:
                        pixels.extend([246, 130, 59, 255])  # Blue book
                else:
                    pixels.extend([59, 130, 246, 255])  # Blue interior
            else:
                pixels.extend([59, 130, 246, 255])  # Blue background
    
    # AND mask (transparency)
    and_mask = [0] * ((width + 7) // 8 * height)
    
    # Combine all parts
    ico_data = ico_header + ico_dir + bmp_header + bytes(pixels) + bytes(and_mask)
    
    with open('favicon.ico', 'wb') as f:
        f.write(ico_data)
    
    print("favicon.ico created successfully!")

if __name__ == "__main__":
    create_favicon()