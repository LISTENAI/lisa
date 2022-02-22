set LISA_PREFIX=%USERPROFILE%\.listenai\lisa
set Path=%LISA_PREFIX%;%Path%
set npm_config_prefix=%LISA_PREFIX%
"%LISA_PREFIX%\node" "%LISA_PREFIX%\node_modules\@listenai\lisa\bin\run" %*
