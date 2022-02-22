#!/usr/bin/env pwsh
$env:LISA_PREFIX = "$env:USERPROFILE\.listenai\lisa"
$env:Path = "$env:LISA_PREFIX;$env:Path"
$env:npm_config_prefix = "$env:LISA_PREFIX"
& "$env:LISA_PREFIX\node.exe" "$env:LISA_PREFIX\node_modules\@listenai\lisa\bin\run" $args
