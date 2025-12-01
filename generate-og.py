#!/usr/bin/env python3
"""Generate OG image for PhishGuard"""

from PIL import Image, ImageDraw, ImageFont
import os

# Image dimensions (1200x630 for Twitter/LinkedIn)
WIDTH = 1200
HEIGHT = 630

# Brand colors (teal/orange)
SLATE_900 = (15, 23, 42)
TEAL_500 = (20, 184, 166)
TEAL_400 = (45, 212, 191)
ORANGE_500 = (249, 115, 22)
SLATE_300 = (203, 213, 225)
WHITE = (255, 255, 255)

# Create image
img = Image.new('RGB', (WIDTH, HEIGHT), SLATE_900)
draw = ImageDraw.Draw(img)

# Gradient background
for i in range(HEIGHT):
    alpha = i / HEIGHT
    r = int(SLATE_900[0] + (30 - SLATE_900[0]) * alpha * 0.3)
    g = int(SLATE_900[1] + (41 - SLATE_900[1]) * alpha * 0.3)
    b = int(SLATE_900[2] + (59 - SLATE_900[2]) * alpha * 0.3)
    draw.line([(0, i), (WIDTH, i)], fill=(r, g, b))

# Load fonts
try:
    font_bold = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 64)
    font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
    font_medium = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
except Exception:
    font_bold = ImageFont.load_default()
    font_large = font_bold
    font_medium = font_bold

# Icon area
center_x = 600
draw.text((center_x, 120), "PHISHGUARD", font=font_large, fill=TEAL_400, anchor="mm")

# Title
draw.text((600, 220), "Email Phishing Detection", font=font_bold, fill=WHITE, anchor="mm")

# Subtitle
draw.text((600, 300), "Machine Learning Security | Pattern Analysis", font=font_large, fill=TEAL_400, anchor="mm")

# Description
draw.text((600, 380), "Analyze sender patterns, urgency language,", font=font_medium, fill=SLATE_300, anchor="mm")
draw.text((600, 420), "and suspicious links to detect phishing", font=font_medium, fill=SLATE_300, anchor="mm")

# Features
features = ["Python", "FastAPI", "ML", "React"]
feature_y = 500
total_width = len(features) * 150 - 30
start_x = (WIDTH - total_width) // 2

for i, feature in enumerate(features):
    x = start_x + i * 150 + 60
    box_width = 120
    draw.rectangle([x - box_width//2, feature_y - 20, x + box_width//2, feature_y + 20],
                   fill=TEAL_500 if i % 2 == 0 else ORANGE_500)
    draw.text((x, feature_y), feature, font=font_medium, fill=WHITE, anchor="mm")

# Corner accents
draw.polygon([(0, 0), (60, 0), (0, 60)], fill=TEAL_500)
draw.polygon([(WIDTH, HEIGHT), (WIDTH - 60, HEIGHT), (WIDTH, HEIGHT - 60)], fill=ORANGE_500)

# Footer
draw.text((600, 580), "phishguard-ui.vercel.app", font=font_medium, fill=(100, 116, 139), anchor="mm")

# Save
os.makedirs('public', exist_ok=True)
output_path = os.path.join(os.path.dirname(__file__), 'public', 'og-image.png')
img.save(output_path, 'PNG', quality=95)
print(f"Generated: {output_path}")
