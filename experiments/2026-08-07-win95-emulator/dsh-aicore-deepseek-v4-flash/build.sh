#!/bin/bash
set -e
cd "$(dirname "$0")"
python3 - << 'PYEOF'
template='template.html'
parts=['parts/01-icons.js','parts/02-core.js','parts/03-apps-simple.js','parts/04-games.js','parts/05-sysapps.js','parts/06-more.js']
html=open(template,encoding='utf-8').read()
js=''
for p in parts:
    js += '\n/* ==== SOURCE: '+p+' ==== */\n' + open(p,encoding='utf-8').read() + '\n'
script='<script>\n'+js+'\n</script>\n'
out=html.replace('</body>', script+'</body>')
open('win95.html','w',encoding='utf-8').write(out)
print('win95.html rebuilt, size=%d, script tags=%d'%(len(out), out.count('<script>')))
PYEOF
