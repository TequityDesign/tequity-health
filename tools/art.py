"""Line drawings on a 24-unit grid, after the Design Labs tiles. Each stroke is its own path
(pathLength=1) so the green trace draws every stroke at once on hover."""

GRID = ('<path class="gd" d="M0 0V24M4 0V24M8 0V24M12 0V24M16 0V24M20 0V24M24 0V24M0 0H24M0 4H24M0 8H24M0 12H24M0 16H24M0 20H24M0 24H24"/>'
        '<path class="gd" d="M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0M3 3h18v18H3z"/>')

def circle(cx, cy, r):
    return f"M{cx - r} {cy}a{r} {r} 0 1 0 {2 * r} 0a{r} {r} 0 1 0 {-2 * r} 0"

ICONS = {
  'strategy': ["M3 17.5C6.5 17.5 6.5 7 12 7s5.5 10.5 9 10.5", circle(3, 17.5, 1.6), circle(12, 7, 1.6), circle(21, 17.5, 1.6), "M9 21.5h6"],
  'apps': ["M7 2.5h10a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2z", "M10.5 5h3", "M8 8.5h8v5H8z", "M8 16h8", "M8 18.5h5"],
  'integrations': ["M2.5 9h5v6h-5z", "M16.5 9h5v6h-5z", "M9.5 2.5h5v4h-5z", "M9.5 17.5h5v4h-5z", "M7.5 12h9", "M12 6.5v11"],
  'data': ["M5 6c0-1.4 3.1-2.5 7-2.5s7 1.1 7 2.5-3.1 2.5-7 2.5S5 7.4 5 6z", "M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6", "M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"],
  'ai': ["M12 2.5l1.9 4.8 4.8 1.9-4.8 1.9L12 16l-1.9-4.9-4.8-1.9 4.8-1.9z", "M3 20.5h3l1.5-2.5 2 4 2-5 2 5 2-3.5 1.5 2H21"],
  'quality': ["M12 2.5l7.5 3v6c0 4.6-3.2 8.5-7.5 10-4.3-1.5-7.5-5.4-7.5-10v-6z", "M8.5 12l2.5 2.5 4.5-5"],
  'idea': ["M12 3a6 6 0 0 0-3.6 10.8c.9.7 1.6 1.7 1.6 2.8V17h4v-.4c0-1.1.7-2.1 1.6-2.8A6 6 0 0 0 12 3z", "M10 19.5h4", "M10.8 21.5h2.4"],
  'seed': ["M12 21v-9", "M12 12C12 8 9.5 5.5 5 5.5c0 4 2.5 6.5 7 6.5z", "M12 14.5c0-3.2 2.2-5.4 6-5.4 0 3.2-2.2 5.4-6 5.4z", "M7 21h10"],
  'pmf': [circle(12, 12, 8.5), circle(12, 12, 5), circle(12, 12, 1.5), "M12 12l8.5-8.5", "M17 3.5h3.5V7"],
  'scale': [circle(7.5, 16.5, 4), "M10.4 13.6l9.6-9.6", "M16.5 7.5l2.5 2.5", "M19 5l2 2"],
}

def strokes(name):
    return ''.join(f'<path pathLength="1" d="{d}"/>' for d in ICONS[name])

def art(name, cls='tile-art', aspect='xMaxYMax meet'):
    s = strokes(name)
    return (f'<svg class="{cls}" viewBox="-0.5 -0.5 25 25" preserveAspectRatio="{aspect}" aria-hidden="true">'
            f'{GRID}<g class="ic0">{s}</g><g class="ic1">{s}</g></svg>')

def chip(name):
    s = ''.join(f'<path d="{d}"/>' for d in ICONS[name])
    return (f'<span class="tile-chip" aria-hidden="true"><svg class="i0" viewBox="0 0 24 24">{s}</svg>'
            '<svg class="go" viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span>')
