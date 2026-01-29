from docx import Document

INPUT_DOCX = "Namen gerechten.docx"

OUT_DESCRIPTIONS = "descriptions.txt"   # alleen Engels
OUT_MAPPING = "mapping.tsv"             # KV-xxx <tab> Engels

def main():
    doc = Document(INPUT_DOCX)

    english_lines = []
    mapping_lines = []

    for p in doc.paragraphs:
        line = p.text.strip()
        if not line:
            continue

        # Verwacht vorm: "KV-001 ... | English description"
        if "|" not in line:
            continue  # of raise, als je liever strikt bent

        left, right = line.split("|", 1)
        english = right.strip()

        # ID is eerste token links (bv. "KV-001")
        kv_id = left.strip().split()[0]

        english_lines.append(english)
        mapping_lines.append(f"{kv_id}\t{english}")

    # Schrijf outputs
    with open(OUT_DESCRIPTIONS, "w", encoding="utf-8") as f:
        f.write("\n".join(english_lines) + "\n")

    with open(OUT_MAPPING, "w", encoding="utf-8") as f:
        f.write("\n".join(mapping_lines) + "\n")

    print(f"Klaar: {OUT_DESCRIPTIONS} ({len(english_lines)} regels)")
    print(f"Klaar: {OUT_MAPPING} ({len(mapping_lines)} regels)")

if __name__ == "__main__":
    main()
