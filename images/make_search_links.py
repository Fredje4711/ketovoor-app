from pathlib import Path
import urllib.parse

INPUT_TSV = "recipes_master.tsv"
OUTPUT_HTML = "search_links.html"

rows = []

with open(INPUT_TSV, "r", encoding="utf-8") as f:
    lines = f.read().splitlines()

header = lines[0].split("\t")
id_idx = header.index("id")
en_idx = header.index("en")

for line in lines[1:]:
    parts = line.split("\t")
    kv_id = parts[id_idx]
    en = parts[en_idx]

    q = urllib.parse.quote(en)

    links = {
        "Pexels":   f"https://www.pexels.com/search/{q}/",
        "Unsplash": f"https://unsplash.com/s/photos/{q}",
        "Pixabay":  f"https://pixabay.com/images/search/{q}/",
    }

    rows.append((kv_id, en, links))

html_rows = []
for kv_id, en, links in rows:
    links_html = " | ".join(
        f'<a href="{url}" target="_blank" rel="noopener">{name}</a>'
        for name, url in links.items()
    )

    html_rows.append(f"""
    <tr>
        <td><strong>{kv_id}</strong></td>
        <td>{en}</td>
        <td>{links_html}</td>
    </tr>
    """)

html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Recipe Image Search Links</title>
<style>
body {{
    font-family: Arial, sans-serif;
    padding: 20px;
}}
table {{
    border-collapse: collapse;
    width: 100%;
}}
th, td {{
    border: 1px solid #ccc;
    padding: 10px;
    vertical-align: top;
}}
th {{
    background: #f4f4f4;
}}
tr:hover {{
    background: #fafafa;
}}
</style>
</head>
<body>

<h2>Search links for recipe images</h2>
<p>
Klik per rij op een site, kies de beste foto en download deze als
<code>KV-xxx.jpg</code>.
</p>

<table>
<thead>
<tr>
    <th>ID</th>
    <th>English description</th>
    <th>Search</th>
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
