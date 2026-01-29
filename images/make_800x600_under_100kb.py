import os
from PIL import Image
import pillow_avif # Ondersteuning voor AVIF
# WebP ondersteuning zit standaard in moderne Pillow

# Instellingen
input_folder = 'images_input'
output_folder = '../public/recepten'

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# We halen alle bestanden op, ongeacht de extensie
all_files = [f for f in os.listdir(input_folder) if os.path.isfile(os.path.join(input_folder, f))]
total_files = len(all_files)
success_count = 0
fail_count = 0

print(f"Totaal aantal bestanden in map: {total_files}")
print("Start universele verwerking (WebP/JPG/PNG herstel)...\n")

for index, filename in enumerate(all_files, 1):
    in_path = os.path.join(input_folder, filename)
    
    # We forceren de uitgang altijd naar .jpg voor de app
    # We halen het nummer uit de bestandsnaam (bijv KV-001)
    base_name = os.path.splitext(filename)[0]
    out_path = os.path.join(output_folder, f"{base_name}.jpg")

    print(f"[{index}/{total_files}] Verwerken: {filename}...", end="\r")

    try:
        # Image.open is slim genoeg om de ECHTE inhoud te zien, 
        # ook al heet het bestand .jpg terwijl het .webp is.
        with Image.open(in_path) as im:
            # 1. Omzetten naar RGB (verwijdert transparantie van WebP/PNG)
            bg = im.convert("RGB")
            
            # 2. Bereken verhoudingen voor 'Cover' effect (800x600)
            target_ratio = 800 / 600
            img_ratio = bg.width / bg.height

            if img_ratio > target_ratio:
                # Foto is te breed
                new_height = 600
                new_width = int(600 * img_ratio)
            else:
                # Foto is te hoog
                new_width = 800
                new_height = int(800 / img_ratio)

            # 3. Formaat aanpassen
            bg = bg.resize((new_width, new_height), Image.Resampling.LANCZOS)

            # 4. Centraal uitsnijden
            left = (new_width - 800) / 2
            top = (new_height - 600) / 2
            right = (new_width + 800) / 2
            bottom = (new_height + 600) / 2
            bg = bg.crop((left, top, right, bottom))

            # 5. Opslaan als ECHTE JPEG
            # We gebruiken een lagere kwaliteit als het bestand te groot is
            quality = 80
            bg.save(out_path, "JPEG", quality=quality, optimize=True)
            
            if os.path.getsize(out_path) > 100 * 1024:
                bg.save(out_path, "JPEG", quality=55, optimize=True)

            success_count += 1

    except Exception as e:
        print(f"\n❌ Fout bij {filename}: {e}")
        fail_count += 1

print(f"\n\n--- KLAAR ---")
print(f"✅ Succesvol omgezet naar echte JPG: {success_count}")
print(f"❌ Mislukt: {fail_count}")
print(f"Check nu de map: {os.path.abspath(output_folder)}")