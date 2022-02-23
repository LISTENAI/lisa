#!/usr/bin/env pwsh
$env:LISA_PREFIX = "$env:USERPROFILE\.listenai\lisa"
& "$env:LISA_PREFIX\node.exe" "$env:LISA_PREFIX\node_modules\@listenai\lisa\bin\run" $args
