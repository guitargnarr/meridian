#!/usr/bin/env python3
"""Generate professional OG image for PhishGuard - Elite design"""

from PIL import Image, ImageDraw, ImageFont
import os

# Image dimensions (1200x630 for Twitter/LinkedIn)
WIDTH = 1200
HEIGHT = 630

# Brand colors
SLATE_900 = (15, 23, 42)
SLATE_800 = (30, 41, 59)
TEAL_500 = (20, 184, 166)
TEAL_400 = (45, 212, 191)
ORANGE_500 = (249, 115, 22)
ORANGE_400 = (251, 146, 60)
SLATE_400 = (148, 163, 184)
WHITE = (255, 255, 255)

# Create base image
img = Image.new('RGB', (WIDTH, HEIGHT), SLATE_900)
draw = ImageDraw.Draw(img)

# Gradient background (top to bottom)
for i in range(HEIGHT):
    alpha = i / HEIGHT
    r = int(SLATE_900[0] + (SLATE_800[0] - SLATE_900[0]) * alpha * 0.5)
    g = int(SLATE_900[1] + (SLATE_800[1] - SLATE_900[1]) * alpha * 0.5)
    b = int(SLATE_900[2] + (SLATE_800[2] - SLATE_900[2]) * alpha * 0.5)
    draw.line([(0, i), (WIDTH, i)], fill=(r, g, b))

# Load fonts (macOS paths)
try:
    font_bold = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
    font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 42)
    font_medium = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
    font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
except Exception:
    font_bold = ImageFont.load_default()
    font_large = font_bold
    font_medium = font_bold
    font_small = font_bold

# Draw shield icon area (simple geometric)
shield_x, shield_y = 100, 180
draw.polygon([
    (shield_x, shield_y),
    (shield_x + 60, shield_y),
    (shield_x + 60, shield_y + 50),
    (shield_x + 30, shield_y + 80),
    (shield_x, shield_y + 50)
], fill=TEAL_500, outline=TEAL_400)

# Title - PHISHGUARD with gradient effect
draw.text((180, 180), "PHISHGUARD", font=font_bold, fill=WHITE)

# Subtitle
draw.text((180, 270), "ML-Powered Email Security", font=font_large, fill=TEAL_400)

# Stats row - horizontal layout
stats = [
    ("87%", "Accuracy", TEAL_400),
    ("2,039", "Features", ORANGE_400),
    ("<15ms", "Response", TEAL_400),
]

stats_y = 370
stats_x_start = 100
for i, (value, label, color) in enumerate(stats):
    x = stats_x_start + i * 320
    # Value
    draw.text((x, stats_y), value, font=font_large, fill=color)
    # Label
    bbox = draw.textbbox((x, stats_y), value, font=font_large)
    draw.text((x, stats_y + 50), label, font=font_medium, fill=SLATE_400)

# Tech badges
tech_badges = [
    ("Python", TEAL_500),
    ("FastAPI", TEAL_400),
    ("ML", ORANGE_500),
    ("React", ORANGE_400),
]

badge_y = 500
badge_x_start = 100
badge_width = 110
badge_height = 40
badge_spacing = 130

for i, (tech, color) in enumerate(tech_badges):
    x = badge_x_start + i * badge_spacing
    # Rounded rectangle badge
    draw.rounded_rectangle(
        [x, badge_y, x + badge_width, badge_y + badge_height],
        radius=8,
        fill=color
    )
    # Center text in badge
    bbox = draw.textbbox((0, 0), tech, font=font_small)
    text_width = bbox[2] - bbox[0]
    text_x = x + (badge_width - text_width) // 2
    draw.text((text_x, badge_y + 8), tech, font=font_small, fill=WHITE)

# Corner accents
# Top left - teal triangle
draw.polygon([(0, 0), (80, 0), (0, 80)], fill=TEAL_500)
# Bottom right - orange triangle
draw.polygon([(WIDTH, HEIGHT), (WIDTH - 80, HEIGHT), (WIDTH, HEIGHT - 80)], fill=ORANGE_500)

# URL footer
url = "phishguard.projectlavos.com"
bbox = draw.textbbox((0, 0), url, font=font_medium)
url_width = bbox[2] - bbox[0]
draw.text(((WIDTH - url_width) // 2, 570), url, font=font_medium, fill=SLATE_400)

# Subtle border glow effect on right side
for i in range(5):
    alpha = 0.3 - (i * 0.05)
    glow_color = (int(TEAL_400[0] * alpha), int(TEAL_400[1] * alpha), int(TEAL_400[2] * alpha))
    draw.line([(WIDTH - 5 + i, 0), (WIDTH - 5 + i, HEIGHT)], fill=glow_color)

# Save
os.makedirs('public', exist_ok=True)
output_path = os.path.join(os.path.dirname(__file__), 'public', 'og-image.png')
img.save(output_path, 'PNG', quality=95)
print(f"Generated: {output_path}")
