"""Builds artifact.html: the app's <body> content plus head links, for previewing on claude.ai.
Run from the repo root: python3 tools/make_artifact.py"""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
body = re.search(r'<!--APP-->(.*)<!--/APP-->', html, re.S).group(1)
fonts = re.search(r'<link rel="stylesheet" href="https://fonts[^>]+>', html).group(0)
head = ('<title>KhaoJai</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        + fonts + '\n<link rel="stylesheet" href="src/styles.css">\n')
(root / 'artifact.html').write_text(head + body, encoding='utf-8')
print('wrote artifact.html')
