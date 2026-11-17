# World English Bible source and attribution

This app uses the **World English Bible, Protestant edition (WEBP)**: U.S. spelling, “LORD”, 66-book protocanon. Publisher: eBible.org / World English Bible translators. The publisher identifies it as the 2020 stable text edition; this snapshot was retrieved on 17 November 2026.

The translation is dedicated to the **public domain**, not used under a proprietary translation license. “World English Bible” is an eBible.org trademark; the name identifies a faithful reproduction and does not imply endorsement of Citizen Groups.

Publisher sources:

- [Official translation website](https://worldenglish.bible/)
- [Edition and downloads](https://ebible.org/engwebp/)
- [Public-domain notice](https://ebible.org/engwebp/copyright.htm)
- [Verse-per-line archive](https://ebible.org/Scriptures/engwebp_vpl.zip)
- [USFM archive, used only for book display names](https://ebible.org/Scriptures/engwebp_usfm.zip)

The original publisher notice is preserved in [WEB-PUBLIC-DOMAIN.html](WEB-PUBLIC-DOMAIN.html). It states:

> The World English Bible is in the Public Domain. That means that it is not copyrighted. However, "World English Bible" is a Trademark of eBible.org.

> All we ask is that if you CHANGE the actual text of the World English Bible in any way, you not call the result the World English Bible any more. This is to avoid confusion, not to limit your freedom.

## Provenance and integrity

The application uses the publisher's text-only, verse-per-line export. It already excludes formatting, paragraph breaks, footnotes, introductions and noncanonical section headings. The import removes transport whitespace only; it does not paraphrase, modernize or substitute wording from other translations. BibleWorks book codes in the text file are mapped to SIL/UBS IDs for navigation, and display names come from the publisher's USFM metadata.

Pinned SHA-256 values:

| Input | SHA-256 |
| --- | --- |
| `engwebp_vpl.zip` | `65793d2d56b0ba4cf54021fde3acfc4cfbd85bef25482727bcf9c55b4ec68924` |
| `engwebp_vpl.txt` | `2d22ee66db074c801210dcd7091c8345e900faea52862c0022f2eff63b32bdda` |
| `engwebp_usfm.zip` | `707aea4a010c535af87c6d919f43674f076590d343137eb9f3e264c2b782a424` |

The text checksum matches the publisher's checksum manifest in [WEB-SOURCE-SIGNATURE.txt](WEB-SOURCE-SIGNATURE.txt). The PGP signature is preserved for audit; independent PGP key verification was not performed. Transport used HTTPS.

The source has 31,103 numbered records. Five are empty placeholders: Luke 17:36, Acts 8:37, Acts 15:34, Acts 24:7 and Romans 16:25. The app does not fabricate text for these, render empty selectable verses, or renumber the surrounding records. It includes **31,098 non-empty verses across 1,189 chapters and 66 books**. These differences are translation/source conventions, not missing download data. Source verse numbering is preserved, including the Romans doxology placement.

`src/data/web/catalog.json` records a SHA-256 for each generated book. Automated tests validate every book checksum and chapter/verse inventory, as well as representative exact wording and numbering gaps.

## Re-importing a reviewed snapshot

Normal builds and tests never fetch a Bible API or update the text. To reproduce this snapshot:

```sh
curl -fL https://ebible.org/Scriptures/engwebp_vpl.zip -o /tmp/engwebp_vpl.zip
curl -fL https://ebible.org/Scriptures/engwebp_usfm.zip -o /tmp/engwebp_usfm.zip
python scripts/import-web.py /tmp/engwebp_vpl.zip /tmp/engwebp_usfm.zip
npm test
```

The importer rejects inputs that do not match the pinned hashes. If upstream publishes a different archive, obtain the reviewed snapshot or explicitly review the new source, legal notice and text differences before updating pins. Generated book JSON is committed, so routine development does not require upstream availability. Do not format the generated JSON: its exact bytes are checksummed.
