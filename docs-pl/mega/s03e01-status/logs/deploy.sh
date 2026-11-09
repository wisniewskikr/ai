#!/bin/sh
# Deploy agent.mjs to Heroku via Builds API source tarball
cd "$(dirname "$0")/.."
APP=status-for-the-night-s03e01
tar czf logs/src.tgz server.mjs src package.json Procfile
H="Accept: application/vnd.heroku+json; version=3"
TOKEN=$(heroku auth:token 2>/dev/null)
SRC=$(curl -s -X POST https://api.heroku.com/apps/$APP/sources -H "Authorization: Bearer $TOKEN" -H "$H")
PUT=$(echo "$SRC" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.source_blob.put_url);console.log(j.source_blob.get_url)})")
curl -s -X PUT "$(echo "$PUT"|sed -n 1p)" -H "Content-Type:" --data-binary @logs/src.tgz
BID=$(curl -s -X POST https://api.heroku.com/apps/$APP/builds -H "Authorization: Bearer $TOKEN" -H "$H" -H "Content-Type: application/json" -d "{\"source_blob\":{\"url\":\"$(echo "$PUT"|sed -n 2p)\",\"version\":\"$(date +%s)\"}}" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).id))")
for i in $(seq 1 30); do S=$(curl -s https://api.heroku.com/apps/$APP/builds/$BID -H "Authorization: Bearer $TOKEN" -H "$H" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).status))"); [ "$S" != pending ] && break; sleep 5; done
echo "build $BID $S"
