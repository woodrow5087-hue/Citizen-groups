"""Import the pinned public-domain WEBP verse-per-line export.

Download with curl -fL https://ebible.org/Scriptures/engwebp_vpl.zip -o /tmp/engwebp_vpl.zip
Run: python scripts/import-web.py /tmp/engwebp_vpl.zip /tmp/engwebp_usfm.zip
The USFM archive is used ONLY for publisher-supplied book display names.
No network access is used by the app build or tests.
"""
import collections
import hashlib
import json
from pathlib import Path
import re
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1]).read_bytes()
# Updated only through an explicit source review, never through the app build.
EXPECTED_ARCHIVE_SHA = '65793d2d56b0ba4cf54021fde3acfc4cfbd85bef25482727bcf9c55b4ec68924'
EXPECTED_TEXT_SHA = '2d22ee66db074c801210dcd7091c8345e900faea52862c0022f2eff63b32bdda'
assert hashlib.sha256(source).hexdigest() == EXPECTED_ARCHIVE_SHA, 'Unreviewed source archive'
with zipfile.ZipFile(sys.argv[1]) as archive:
    text = archive.read('engwebp_vpl.txt')
    assert hashlib.sha256(text).hexdigest() == EXPECTED_TEXT_SHA, 'Text checksum mismatch'
    (ROOT/'docs/licenses/WEB-PUBLIC-DOMAIN.html').write_bytes(archive.read('engwebp_about.htm'))
    (ROOT/'docs/licenses/WEB-SOURCE-SIGNATURE.txt').write_bytes(archive.read('signature.txt.asc'))
books = collections.OrderedDict()
for line in text.decode('utf-8-sig').splitlines():
    if not line.strip():
        continue
    match = re.fullmatch(r'([A-Z0-9]{3}) (\d+):(\d+) (.*)', line)
    assert match, f'Unexpected source line: {line[:60]}'
    book, chapter, number, verse = match.groups()
    book = {'SOL':'SNG','EZE':'EZK','JOE':'JOL','NAH':'NAM','MAR':'MRK','JOH':'JHN','PHI':'PHP','JAM':'JAS','1JO':'1JN','2JO':'2JN','3JO':'3JN'}.get(book, book)
    # Only remove transport whitespace; punctuation/wording is not edited.
    if not verse.strip():
        continue  # Publisher placeholders with no main text: do not fabricate a verse.
    books.setdefault(book, {}).setdefault(chapter, []).append({'number': int(number), 'text': verse.strip()})
names = {}
assert hashlib.sha256(Path(sys.argv[2]).read_bytes()).hexdigest() == '707aea4a010c535af87c6d919f43674f076590d343137eb9f3e264c2b782a424', 'Unreviewed book metadata archive'
with zipfile.ZipFile(sys.argv[2]) as usfm:
    for path in usfm.namelist():
        if not path.endswith('.usfm'):
            continue
        content = usfm.read(path).decode('utf-8-sig')
        ident = re.search(r'\\id (\w+)', content)
        name = re.search(r'\\toc2 (.+)', content)
        if ident and name:
            names[ident[1]] = name[1].strip()
assert len(books) == 66
assert sum(len(b) for b in books.values()) == 1189
catalog = []
for old in (ROOT/'src/data/web/books').glob('*.json'):
    old.unlink()
for code, chapters in books.items():
    assert list(map(int, chapters)) == list(range(1, len(chapters)+1))
    for verses in chapters.values():
        numbers = [v['number'] for v in verses]
        assert numbers == sorted(set(numbers)), f'Duplicate/unsorted verse in {code}'
    book_data = json.dumps(chapters, ensure_ascii=False, separators=(',', ':')) + '\n'
    (ROOT/f'src/data/web/books/{code}.json').write_text(book_data, encoding='utf-8')
    catalog.append({'id': code, 'name': names[code], 'chapters': [[v['number'] for v in verses] for verses in chapters.values()], 'sha256': hashlib.sha256(book_data.encode()).hexdigest()})
(ROOT/'src/data/web/catalog.json').write_text(json.dumps(catalog, ensure_ascii=False, separators=(',', ':'))+'\n', encoding='utf-8')
print(f'Imported {len(books)} books, 1189 chapters, {sum(len(v) for b in books.values() for v in b.values())} verse records.')
print('Source archive SHA-256:', hashlib.sha256(source).hexdigest())
