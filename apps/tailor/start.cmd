@echo off
rem Tailor — double-click to start, then open http://localhost:5177
cd /d "%~dp0"
start "" http://localhost:5177
node server.mjs
