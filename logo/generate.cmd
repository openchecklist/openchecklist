setlocal enabledelayedexpansion
@echo off

rem generate png from svg using inkscape

rem svg
set name=logo

set THISDIR=%~dp0
set THISDIR=%THISDIR:~,-1%

rem inkscape program path
set inkscape="%tools%\Programs\inkscape\inkscape.exe"

if not exist %inkscape% (
    echo ERROR: inkscape not found
    exit /b 1
)

rem output directory
set out=%THISDIR%/png

for %%s in (300) do (
    set size=%%s
    
    set command=%inkscape% -z "%THISDIR%/%name%.svg" -w !size! -h !size! -e "%out%/%name%-!size!.png"
    echo !command!
    call !command!
)
