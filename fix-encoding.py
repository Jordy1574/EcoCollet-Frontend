#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import codecs

file_path = r'src\app\adapters\ui\pages\usuario\dashboard\usuario-dashboard.component.html'

# Leer el archivo con encoding UTF-8
with codecs.open(file_path, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Mapeo de reemplazos
replacements = {
    # Tildes
    'Sesiᅢᆳn': 'Sesión',
    'Direcciᅢᆳn': 'Dirección',
    'Informaciᅢᆳn': 'Información',
    'recolecciᅢᆳn': 'recolección',
    'Telᅢᄄfono': 'Teléfono',
    'Electrᅢᆳnico': 'Electrónico',
    'Canceᅢᆳn': 'Cancelar',
    'Ediciᅢᆳn': 'Edición',
    'Catᅢᄀlogo': 'Catálogo',
    'Tᅢᄄ': 'Tú',
    'mᅢᄀs': 'más',
    'portᅢᆳn': 'portón',
    'dᅢᄃa': 'día',
    # Símbolos
    'ᅢᄂ¡': '¡',
    'ᅢᄀ­': '⭐',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Guardar el archivo
with codecs.open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Archivo corregido exitosamente")
