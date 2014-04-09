@echo off

set returnCode=0

setlocal enabledelayedexpansion
for /F %%x in ('dir /B/D/AD') do (
  echo %%x 
  cd %%x
  call buster-test %*
  IF ERRORLEVEL 1 set returnCode=!errorlevel!
  cd..  
)

echo exit code %returnCode%
exit /B %returnCode%