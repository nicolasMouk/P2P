from flask import Flask, request
import subprocess

app = Flask(__name__)


@app.route("/join", methods=["POST"])
def join_network():
    data = request.json
    ip = data.get("peer_ip")
    port = data.get("peer_port")
    contributor = data.get("contributor", False)

    if not ip or not port:
        return "IP et Port requis", 400

    if contributor:
        # script_path = r"start_server.bat"
        # # command = ["python", "peer_server.py", "--ip", ip, "--port", str(port)]
        # command = f'start cmd /k "{script_path} {ip} {port}"'
        # subprocess.Popen(command, shell=True)  # Démarre le serveur en arrière-plan
        script_path = "start_peer.py"
        # Commande pour lancer le nouveau serveur Flask
        command = f"start cmd /k python {script_path} {ip} {port}"
        # Lancer le nouveau processus
        subprocess.Popen(command, shell=True)
        print(f"✅ Serveur lancé avec : {command}")
    
    return "Serveur en cours de lancement...", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

