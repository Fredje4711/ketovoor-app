import json
import os

# Pad naar je receptenbestand
file_path = 'src/data/recipes.json'

if not os.path.exists(file_path):
    print("Fout: Kan src/data/recipes.json niet vinden!")
else:
    with open(file_path, 'r', encoding='utf-8') as f:
        recipes = json.load(f)

    for r in recipes:
        macros = r.get('macros', {})
        kcal = macros.get('kcal', 0)
        eiwit = macros.get('eiwit', 0)

        # Bereken vet (ongeveer): (Kcal - (Eiwit * 4)) / 9
        if 'vet' not in macros or macros['vet'] == 0:
            berekend_vet = round((kcal - (eiwit * 4)) / 9)
            macros['vet'] = max(0, berekend_vet) # Nooit lager dan 0

        # Voeg carbs toe (KetoVoor is laag, we zetten een realistische gok van 2-5g)
        if 'carbs' not in macros:
            macros['carbs'] = 3

        # Voeg Micro-nutriënten info toe op basis van vlees_type
        vlees = r.get('vlees_type', '').lower()
        if 'rund' in vlees or 'lever' in vlees:
            r['micros_info'] = "Rijk aan IJzer, Zink en Vitamine B12"
        elif 'vis' in vlees:
            r['micros_info'] = "Rijk aan Omega-3 vetzuren en Vitamine D"
        elif 'kip' in vlees or 'gevogelte' in vlees:
            r['micros_info'] = "Rijk aan Magnesium en Vitamine B6"
        elif 'varken' in vlees:
            r['micros_info'] = "Rijk aan Vitamine B1 en Selenium"
        else:
            r['micros_info'] = "Bevat essentiële mineralen en vetoplosbare vitamines"

    # Opslaan van het verbeterde bestand
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, indent=2, ensure_ascii=False)

    print("Succes! Alle 100 recepten zijn nu voorzien van extra macro's en micro-info.")