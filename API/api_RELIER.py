from flask import Flask, request,jsonify
from flask_cors import CORS
import threading,sys,random,socket,time
from recup_ip import generate_key
import msgpack
import requests
import logging
import os,subprocess
import traceback
from multiprocessing import Process
from dht import assign_dht, request_dht,handle_dht, send_dht_local,create_add_file_message, create_looking_file_message, request_list_peer_have_file, send_replica_message,create_delete_file_message
from file_share import request_files,handle_files
from file_emplacement import add_file_to_network
# from sans_global import bootstrap_interaction,attempt_peer_connections,start_peer_server,handle_communication_between_peer,add_neighbor_peer,applatir_données
from variable import create_variable_json, update_or_add_variable, load_variable_json
from conn_bootstrap import bootstrap_interaction,attempt_peer_connections,start_peer_server,handle_communication_between_peer,add_neighbor_peer,applatir_données
from security import verify_pow, request_pow_verification  
from werkzeug.serving import make_server

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
logging.basicConfig(level=logging.INFO)
active_peers = []
dht_local = {}
lock = threading.Lock()
UPLOAD_FOLDER = "uploads"

def is_port_in_use(ip, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((ip, port)) == 0  # Retourne True si le port est occupé

# class FlaskThreadedServer:
#     """Classe qui encapsule le serveur Flask dans un thread"""
#     def __init__(self, ip, port):
#         self.ip = ip
#         self.port = port
#         self.app = Flask(__name__)
#         self.app.add_url_rule('/', 'home', self.home)
#         self.server = make_server(ip, port, self.app)
#         self.thread = threading.Thread(target=self.run, daemon=True)

#     def home(self):
#         return jsonify({"message": "Nouveau serveur actif !"})

#     def run(self):
#         logging.info(f"✅ Serveur Flask en cours d'exécution sur {self.ip}:{self.port}")
#         self.server.serve_forever()

#     def start(self):
#         logging.info(f"🚀 Tentative de démarrage du serveur sur {self.ip}:{self.port}")
#         self.thread.start()
#         time.sleep(2)  # Attendre que le serveur se stabilise
class FlaskThreadedServer:
    """Classe qui encapsule le serveur Flask dans un thread"""
    
    def __init__(self, ip, port):
        self.ip = ip
        self.port = port
        self.app = Flask(__name__)
        self.app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
        CORS(self.app) # 🔥 Active CORS pour toutes les routes
        
        # Création du dossier d'upload s'il n'existe pas
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        # Définition des routes
        self.app.add_url_rule('/', 'home', self.home)
        self.app.add_url_rule('/upload', 'upload_file', self.upload_file, methods=['POST'])

        self.server = make_server(ip, port, self.app)
        self.thread = threading.Thread(target=self.run, daemon=True)

    def home(self):
        return jsonify({"message": "Nouveau serveur actif !"})

    def upload_file(self):
        """Permet d'uploader un fichier sur le serveur"""
        if 'file' not in request.files:
            logging.error("Aucun fichier trouvé dans la requête")
            return jsonify({"error": "Aucun fichier trouvé"}), 400

        file = request.files['file']
        peer_port = request.form.get("peerPort")  # On récupère peerPort

        if file.filename == '':
            logging.error("Nom de fichier vide")
            return jsonify({"error": "Nom de fichier vide"}), 400

        file_path = os.path.join(self.app.config["UPLOAD_FOLDER"], file.filename)
        file.save(file_path)
        logging.info(f"Fichier {file.filename} uploadé avec succès à l'emplacement {file_path}")

        dht_local = load_variable_json(peer_port, "dht" )
        responsability_plage = load_variable_json(peer_port, "responsability_plage" )
        active_peers = load_variable_json(peer_port, "active_peers" )
        my_node = load_variable_json(peer_port, "my_node" )

        fichier_coder,key = create_add_file_message(file_path, my_node)
        print("[DEBUG] Fichier Coder :", fichier_coder)
        print("[DEBUG] KEY", key)

        add_file_to_network(file_path,f'.storage{peer_port}')
        send_replica_message(my_node,active_peers,key)
        data= {"action":"add_file", "data": fichier_coder}
        dht_local=handle_dht(my_node,active_peers,data, dht_local, responsability_plage)
        update_or_add_variable(peer_port, "dht", dht_local)

        save_file_key(file.filename,key=key) #Ecriture dans le fichier file_keys.txt
        response_data = {
        "message": f"Fichier {file.filename} uploadé avec succès en utilisant port {peer_port}",
        "filename": file.filename}
        logging.info(f"Réponse envoyée: {response_data}")
        return jsonify(response_data), 200
        # return jsonify({"message": f"Fichier {file.filename} uploadé avec succès en utilisant port {peer_port}", "filename": file.filename}), 200
    
    def run(self):
        logging.info(f"✅ Serveur Flask en cours d'exécution sur {self.ip}:{self.port}")
        self.server.serve_forever()

    def start(self):
        logging.info(f"🚀 Tentative de démarrage du serveur sur {self.ip}:{self.port}")
        self.thread.start()
        time.sleep(2)  # Attendre que le serveur se stabilise

def start_new_server(ip, port):
    try:
        server = FlaskThreadedServer(ip, port)
        server.start()
        logging.info("✅ Nouveau serveur démarré avec succès")

    except Exception as e:
        logging.error(f"⚠️ Erreur lors du lancement du serveur : {e}")
        logging.error(traceback.format_exc())


@app.route('/api/ip', methods=['GET']) # AutoRemplissage ip
def get_ip():
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    # bootstrap_interaction(action="JOIN", active_peers = active_peers) #rejoindre le réseau
    # if active_peers is None:
    #     return jsonify({"error": "Impossible de récupérer la liste des pairs"}), 500
    return jsonify({"message": "Rejoint avec succès", "active_peers": active_peers,"ip": request.remote_addr})

@app.route("/join", methods=["POST"])
def join_network():
    data = request.json
    ip = data.get("peer_ip")
    port = data.get("peer_port")  # Ne le convertis pas encore en int
    contributor = data.get("contributor", False)

    logging.info(f"🟢 Requête reçue avec IP: {ip}, Port: {port}, Contributor: {contributor}")

    if not ip or not port:
        return jsonify({"error": "IP ou Port manquant"}), 400

    # try:
    #     port = int(port)  # Conversion après la vérification
        
    # except ValueError:
    #     return jsonify({"error": "Le port doit être un nombre"}), 400
    port = int(port)


    if is_port_in_use(ip, port):
        logging.error(f"❌ Le port {port} est déjà utilisé. Choisissez un autre port.")
        return jsonify({"error": f"Le port {port} est déjà utilisé"}), 400
    
    active_peers = bootstrap_interaction(action = "JOIN",peer_port=port)  # Tester l'action JOIN
    print("[DEBUG] Ligne Join est passé")
    server_thread = threading.Thread(target=start_peer_server, args=(port,)) # Création d'un thread pour gérer la connexion entre 2 pairs avec la fonction start_peer_server
    print("[DEBUG] serveur thread fixé")
    server_thread.daemon = True
    print("[DEBUG] serveur thread daemon true")
    server_thread.start()
    print("[DEBUG] serveur thread started")

    dht_local = load_variable_json(port, "dht" )
    responsability_plage = load_variable_json(port, "responsability_plage" )
    active_peers = load_variable_json(port, "active_peers" )
    my_node = load_variable_json(port, "my_node" )


     # Se connecter aux autres pairs du réseau
    attempt_peer_connections(my_node,active_peers=active_peers)
    responsability_plage=assign_dht(my_node, active_peers)
    request_dht(my_node, active_peers, responsability_plage)
    update_or_add_variable(port, "responsability_plage", responsability_plage)
    
    
    if contributor:
        try:
            thread = threading.Thread(target=start_new_server, args=(ip, port), daemon=True)
            thread.start()
            logging.info(f"🔄 Thread démarré pour {ip}:{port}")
            time.sleep(2)

            # Vérifier si le serveur a bien démarré
            response = requests.get(f"http://{ip}:{port}/")
            if response.status_code == 200:
                logging.info("✅ Nouveau serveur démarré avec succès")
                return jsonify({"message": "Nouveau serveur démarré avec succès", "ip": ip, "peerPort": port,"contributor": contributor,"active_peers": active_peers})
        except requests.exceptions.ConnectionError:
            logging.error("❌ Échec du démarrage du nouveau serveur")
            return jsonify({"message": "Échec du démarrage du nouveau serveur", "ip": ip, "peerPort": port,"contributor": contributor,"active_peers": active_peers}), 500
        except Exception as e:
            logging.error(f"⚠️ Erreur inattendue dans le thread: {e}")
            logging.error(traceback.format_exc())
            return jsonify({"error": f"Erreur inattendue: {str(e)}"}), 500

    return jsonify({"message": "Rejoint sans serveur supplémentaire","contributor": contributor,"active_peers": active_peers,"peerPort":port})
  

@app.route("/leave", methods=["POST"]) # Déconnexion noeuds
def leave_network():
    print(f"[DEBUG] Request Data: {request.data}")  # Affiche les données de la requête
    
    data = request.get_json()    
    peer_port = int(data.get("peerPort")) if data else None
    print(f"[DEBUG] peer_port = {peer_port} type : {type(peer_port)}")
    
    if peer_port:
        dht_local = load_variable_json(peer_port, "dht")
        responsability_plage = load_variable_json(peer_port, "responsability_plage")
        active_peers = load_variable_json(peer_port, "active_peers")
        print(f"[DEBUG] active_peers = {active_peers}")
        my_node = load_variable_json(peer_port, "my_node")
        bootstrap_interaction("LEAVE", peer_port, active_peers=active_peers)  
    else:
        print("[DEBUG] No peerPort received.")
    
    return jsonify({"status": "success", "message": "Left network"}), 200

@app.route("/info", methods=["POST"]) #Informations réseau
def get_peers():

    data = request.get_json()
    print("[DEBUG] Requête reçue:", data)  # Vérifier ce qui est reçu

    peer_port = int(data.get("peerPort")) if data else None
    print("[DEBUG] peer_port =", peer_port)

   
    if peer_port :
        dht_local = load_variable_json(peer_port, "dht" )
        responsability_plage = load_variable_json(peer_port, "responsability_plage" )
        active_peers = load_variable_json(peer_port, "active_peers" )
        my_node = load_variable_json(peer_port, "my_node" )


        print("Plage de responsabilité :", load_variable_json(peer_port,"responsability_plage"))
        print("Liste des pairs actifs :", active_peers)
        print("dht local :",dht_local)

        result = []
        for peer in active_peers:
            result.append({"my_node": my_node,
                           "active_peers": peer,
                           "dht_local": dht_local})
            

        return jsonify({"Status": "success","data": result}), 200


    else:
        print("[DEBUG] No peerPort received.")

    return jsonify({"Status": "error", "message": "No peerPort provided"}), 400

UPLOAD_FOLDER = "uploads"  # Dossier où sauvegarder temporairement les fichiers
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Crée le dossier s'il n'existe pas
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def save_file_key(filename,key, output_file="file_keys.txt"):
    with open(output_file, "a", encoding ='utf-8') as f:
        f.write(f"{filename} : {key}\n")
    print(f"[INFO] Enregistrement : {filename} -> {key}")

# Fonction pour envoyer un fichier au serveur P2P
def send_file_to_peer_server(file_path, peer_ip, peer_port):
    url = f'http://{peer_ip}:{peer_port}/upload'  # Route d'upload sur le serveur P2P
    files = {'file': open(file_path, 'rb')}
    response = requests.post(url, files=files)  # Envoie le fichier au serveur P2P
    files.close()
    return response

@app.route("/upload", methods = ["POST"])
def upload_file():

    print("[DEBUG] Requête reçue")
    
    # Vérifie si la requête contient un fichier
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400

    file = request.files['file']

    # Si l'utilisateur ne sélectionne pas de fichier
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400

    # Sauvegarde le fichier localement avant de l'envoyer au serveur P2P
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    file.save(file_path)

    # Obtient l'adresse IP et le port du serveur P2P depuis les données de la requête (ou une autre source)
    peer_ip = "127.0.0.1"  # Adresse IP du serveur P2P
    peer_port = 5001  # Port du serveur P2P

    # Envoie le fichier au serveur P2P
    response = send_file_to_peer_server(file_path, peer_ip, peer_port)

    if response.status_code == 200:
        return jsonify({
            "status": "success", 
            "message": "File uploaded to peer server successfully",
            "file_name": file.filename,
            "file_path": file_path
        }), 200
    else:
        return jsonify({"status": "error", "message": "Failed to upload file to peer server"}), 500

    # if "file" not in request.files:
    #     print("[DEBUG] Aucun fichier reçu")
    #     return jsonify({"status": "error", "message": "Aucun fichier fourni"}), 400

    # file = request.files["file"]  # On récupère le fichier correctement
    # peer_port = request.form.get("peerPort")  # On récupère peerPort
    # print(f"[DEBUG] peer_port = {peer_port}, fichier = {file.filename}")

    # file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    # file.save(file_path)  # ⬅️ Correction : on enregistre le fichier
    # dht_local = load_variable_json(peer_port, "dht" )
    # responsability_plage = load_variable_json(peer_port, "responsability_plage" )
    # active_peers = load_variable_json(peer_port, "active_peers" )
    # my_node = load_variable_json(peer_port, "my_node" )
    # print(my_node)
    # # fichier = "IMG_20170915_173150.jpg"
    # fichier_coder,key = create_add_file_message(file_path, my_node)
    # print("[DEBUG] Fichier Coder :", fichier_coder)
    # print("[DEBUG] KEY", key)

    # add_file_to_network(file_path,f'.storage{peer_port}')
    # send_replica_message(my_node,active_peers,key)
    # data= {"action":"add_file", "data": fichier_coder}
    # dht_local=handle_dht(my_node,active_peers,data, dht_local, responsability_plage)
    # update_or_add_variable(peer_port, "dht", dht_local)

    # #Ecriture dans le fichier file_keys.txt
    # save_file_key(file.filename,key=key)
    # # if request_pow_verification(active_peers, key, my_node, 2):

    # #     print("[DEBUG] PASS request_pow_verify")
    # #     add_file_to_network(file,f'.storage{peer_port}')
    # #     send_replica_message(my_node,active_peers,key)
    # #     data= {"action":"add_file", "data": fichier_coder}
    # #     dht_local=handle_dht(my_node,active_peers,data, dht_local, responsability_plage)
    # #     update_or_add_variable(peer_port, "dht", dht_local)

    # return jsonify({"status": "success", "message": f"Fichier {file.filename} reçu avec peerPort {peer_port}"}), 200

@app.route("/download",methods=["POST"])
def donwload_file():
    print("[DEBUG] requete passée")
    data = request.get_json()
    print("[DEBUG] Requête reçue:", data)  # Vérifier ce qui est reçu
    file_name = data.get("filename")
    peer_port = int(data.get("peerPort")) if data else None
    # print("[DEBUG] peer_port =", peer_port,"file name : ", file_name)
    if peer_port is None:
        return jsonify({"status": "error", "message": "peerPort manquant"}), 400

    dht_local = load_variable_json(peer_port, "dht" )
    responsability_plage = load_variable_json(peer_port, "responsability_plage" )
    active_peers = load_variable_json(peer_port, "active_peers" )
    my_node = load_variable_json(peer_port, "my_node" )
    print(f"my_node : {my_node}\n \n active peers:{active_peers}\n\nresponsability plage : {responsability_plage}\n")
    message=create_looking_file_message(file_name,my_node)
    data= {"action":"looking_file", "data": message}
    print(f"data : {data}")
    list_peer_have_files = request_list_peer_have_file(my_node, active_peers, data, dht_local, responsability_plage)
    print(f"[DEBUG] list peer having file : {list_peer_have_files}")
    # list_peer_have_files = request_files([['127.0.0.1',7002],['127.0.0.1',7001]],"d82976927a30836e3d26fbdc83289539dc65229522676d071b3894e8478af059841e402823a16a394fe1c420483932a9b78ce18dcebe2a582c7fcb7f3faf33a2",my_node)
    request_files(list_peer_have_files, looking_key=file_name,my_node=my_node,save_directory='/download')

    return jsonify({"status": "success", "message": "Téléchargement initié"}), 200

@app.route("/files",methods = ["GET"])
def get_file_content():
    file_path = "file_keys.txt"  # Chemin du fichier

    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
        
        return jsonify({"status": "success", "content": content}), 200

    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Fichier introuvable"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)  

