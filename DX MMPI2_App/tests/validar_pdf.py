"""Verificación independiente de los trazos serializados por el generador JS."""
from pathlib import Path
import hashlib
import json
import sys
import fitz

root = Path(__file__).resolve().parent.parent
qa = Path(sys.argv[1])
meta = json.loads((qa / 'verificacion-dibujos.json').read_text())
source = fitz.open(root / 'assets/formularios/respuestas.pdf')
checked = []

def image_digest(doc, page):
    xref = page.get_images(full=True)[0][0]
    return hashlib.sha256(doc.extract_image(xref)['image']).hexdigest()

for label in ['respuestas-todas-v', 'respuestas-todas-f', 'respuestas-parciales', 'Hoja_Respuestas_Demo']:
    doc = fitz.open(qa / (label + '.pdf'))
    paths = doc[1].get_drawings()
    lines = [p for p in paths if len(p['items']) == 1 and p['items'][0][0] == 'l']
    marks = meta[label]['marks']
    assert len(lines) == len(marks) * 2, label
    for index, mark in enumerate(marks):
        ends = []
        for line in lines[index * 2:index * 2 + 2]:
            assert line['color'] == (0., 0., 0.)
            assert abs(line['width'] - .72) < .01
            ends.extend(line['items'][0][1:])
        x = sum(p.x for p in ends) / 4
        top = sum(p.y for p in ends) / 4
        assert abs(x - mark['x']) < .1 and abs(top - mark['top']) < .1, (label, index)
    for index, page in enumerate(doc):
        assert image_digest(source, source[index]) == image_digest(doc, page)
    checked.append({'pdf': label, 'respuestas_verificadas': len(marks), 'fondo_original': True})

for label in ['Perfil_US_H_Demo', 'Perfil_US_M_Demo', 'Perfil_MX_H_Demo', 'Perfil_MX_M_Demo', 'perfil-pendiente-extremo']:
    doc = fitz.open(qa / (label + '.pdf'))
    page = doc[0]
    lines = [p for p in page.get_drawings() if len(p['items']) == 1 and p['items'][0][0] == 'l']
    joins = [p for p in lines if abs(p['items'][0][1].x - p['items'][0][2].x) > 15]
    previous = None
    expected = []
    points = meta[label]['points']
    for point in points:
        if point['t'] is None:
            previous = None
            continue
        if previous and previous['group'] == point['group']:
            expected.append((previous, point))
        previous = point
    assert len(joins) == len(expected), label
    for actual, (a, b) in zip(joins, expected):
        p1, p2 = actual['items'][0][1:]
        assert max(abs(p1.x - a['x']), abs(p1.y - a['top']), abs(p2.x - b['x']), abs(p2.y - b['top'])) < .01
    template = fitz.open(root / ('assets/formularios/perfil-mx.pdf' if '_MX_' in label else 'assets/formularios/perfil-us.pdf'))
    assert image_digest(template, template[meta[label]['pageIndex']]) == image_digest(doc, page)
    for word in page.get_text('words'):
        assert 0 <= word[0] <= word[2] <= page.rect.width + .1
        assert 0 <= word[1] <= word[3] <= page.rect.height + .1
    checked.append({'pdf': label, 'puntos': sum(p['t'] is not None for p in points), 'uniones_verificadas': len(joins), 'fondo_correcto': True})

print(json.dumps({'resultado': 'APROBADO', 'documentos': checked}, ensure_ascii=False, indent=2))
