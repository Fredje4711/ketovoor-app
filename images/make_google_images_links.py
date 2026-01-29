from pathlib import Path
import urllib.parse

INPUT_TSV = "recipes_master.tsv"
OUTPUT_HTML = "search_links_google_images.html"

# Google Images query template
# - tbm=isch => image search
# - safe=active => SafeSearch
# - adds "food photography" for better results
def google_images_url(query: str) -> str:
    q = f'{query} food photography'
    return "https://www.google.com/search?tbm=isch&safe=active&q=" + urllib.parse.quote(q)

rows = []

with open(INPUT_TSV, "r", encoding="utf-8") as f:
    lines = f.read().splitlines()

header = lines[0].split("\t")
id_idx = header.index("id")
en_idx = header.index("en")

for line in lines[1:]:
    parts = line.split("\t")
    kv_id = parts[id_idx].strip()
    en = parts[en_idx].strip()
    rows.append((kv_id, en, google_images_url(en)))

html_rows = []
for kv_id, en, url in rows:
    html_rows.append(f"""
    <tr>
        <td><strong>{kv_id}</strong></td>
        <td>{en}</td>
        <td><a href="{url}" target="_blank" rel="noopener">Google Afbeeldingen</a></td>
        <td><code>{kv_id}.jpg</code></td>
    </tr>
    """)

html = f"""<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Google Afbeeldingen zoeklinks (KV)</title>
<style>
  body {{ font-family: Arial, sans-serif; padding: 20px; }}
  table {{ border-collapse: collapse; width: 100%; }}
  th, td {{ border: 1px solid #ccc; padding: 10px; vertical-align: top; }}
  th {{ background: #f4f4f4; text-align: left; }}
  tr:hover {{ background: #fafafa; }}
  code {{ background: #f2f2f2; padding: 2px 6px; border-radius: 6px; }}
</style>
</head>
<body>

<h2>Zoeklinks via Google Afbeeldingen</h2>
<p>
Klik per rij op <strong>Google Afbeeldingen</strong>, kies de beste foto en sla die op als
<code>KV-xxx.jpg</code> (bijv. <code>KV-001.jpg</code>).
</p>

<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>English description</th>
      <th>Zoeklink</th>
      <th>Bestandsnaam</th>
    </tr>
  </thead>
  <tbody>
    {''.join(html_rows)}
  </tbody>
</table>

</body>
</html>
"""

Path(OUTPUT_HTML).write_text(html, encoding="utf-8")
print(f"Klaar: {OUTPUT_HTML}")
