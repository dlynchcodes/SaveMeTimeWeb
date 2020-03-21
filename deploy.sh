#!/usr/bin/env bash

# Variables
remoteUserName="dlynch"
remoteServer="savemeti.me"
remotePath="/srv/savemetime/Web/"

rsync -arvz -e 'ssh -p 5656' --progress --delete --filter=':- .rsync-filter' ./ ${remoteUserName}@${remoteServer}:${remotePath}
