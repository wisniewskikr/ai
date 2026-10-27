#!/bin/bash
# usage: post.sh URL BODYFILE  -> appends masked request/reply to s01e02-log.md
url=$1; body=$2; log=s01e02-log.md
reply=$(curl -sS -X POST -H "Content-Type: application/json" --data-binary @"$body" -w "\n%{http_code}" "$url")
code=${reply##*$'\n'}; reply=${reply%$'\n'*}
mask() { sed -E 's/v1\.[A-Za-z0-9_.-]{20,}/v1.***MASKED***/g'; }
{ echo "## $(date -u +%FT%TZ) POST $url"; echo; echo '### Request body'; echo; echo '```'; mask < "$body"; echo; echo '```'; echo; echo "### Reply $code"; echo; echo '```'; echo "$reply" | mask; echo '```'; echo; } >> $log
echo "$reply" > "${body%.json}.reply.json"
echo "$code"; echo "$reply" | mask
