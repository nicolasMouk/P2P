@echo on

:: Changer le répertoire de travail vers l'emplacement du fichier batch
cd /d "%~dp0"

echo Vérification de l'installation de Flask et Flask-CORS...
python -c "import flask" 2>NUL
if %errorlevel% neq 0 (
    echo Flask non trouvé. Installation en cours...
    pip install flask
)

python -c "import flask_cors" 2>NUL
if %errorlevel% neq 0 (
    echo Flask-CORS non trouvé. Installation en cours...
    pip install flask_cors
)

python -c "import requests" 2>NUL
if %errorlevel% neq 0 (
    echo Requests non trouvé. Installation en cours...
    pip install requests
)

echo Démarrage du serveur sur %IP%:%PORT%...
python "%~dp0peer_server.py"

pause
