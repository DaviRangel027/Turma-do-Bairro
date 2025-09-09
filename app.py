import os
from flask import Flask, jsonify, request, send_from_directory
from firebase_admin import credentials, firestore, auth as firebase_auth
import firebase_admin

# Substitua com o caminho para o seu arquivo de credenciais do Firebase
FIREBASE_CREDENTIALS_PATH = 'firebase-adminsdk.json'
PROJECT_ID = 'turma-do-bairro-e916b'

# Inicializa o Firebase Admin SDK
try:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
except FileNotFoundError:
    print(f"Erro: O arquivo de credenciais '{FIREBASE_CREDENTIALS_PATH}' não foi encontrado.")
    print("Por favor, baixe o arquivo JSON do Firebase Console e atualize o caminho.")
    exit()

db = firestore.client()
app = Flask(__name__, static_url_path='', static_folder='.')

# Configurações de CORS para permitir requisições do frontend
@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# Rota principal para servir o index.html
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Rota para obter todos os serviços
@app.route('/api/services', methods=['GET'])
def get_services():
    services_ref = db.collection('artifacts').document(PROJECT_ID).collection('public').document('data').collection('services')
    services = services_ref.stream()
    service_list = []
    for service in services:
        service_data = service.to_dict()
        service_data['id'] = service.id
        service_list.append(service_data)
    return jsonify(service_list)

# Rota para obter um serviço específico e o nome do seu autor
@app.route('/api/services/<string:service_id>', methods=['GET'])
def get_service_details(service_id):
    service_doc_ref = db.collection('artifacts').document(PROJECT_ID).collection('public').document('data').collection('services').document(service_id)
    service_doc = service_doc_ref.get()

    if not service_doc.exists:
        return jsonify({"error": "Serviço não encontrado."}), 404

    service_data = service_doc.to_dict()
    service_data['id'] = service_doc.id
    user_id = service_data.get('userId')

    user_profile_ref = db.collection('artifacts').document(PROJECT_ID).collection('users').document(user_id).collection('user_profile').document('profile')
    user_profile_doc = user_profile_ref.get()
    
    provider_name = user_profile_doc.to_dict().get('name') if user_profile_doc.exists else 'Usuário Desconhecido'
    service_data['providerName'] = provider_name
    
    return jsonify(service_data), 200

# Rota para adicionar um novo serviço
@app.route('/api/services', methods=['POST'])
def add_service():
    data = request.json
    try:
        doc_ref = db.collection('artifacts').document(PROJECT_ID).collection('public').document('data').collection('services').add(data)
        return jsonify({"message": "Serviço adicionado com sucesso!", "id": doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para registrar um novo usuário
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password or not name:
        return jsonify({"error": "Dados de registro incompletos."}), 400

    try:
        user = firebase_auth.create_user(email=email, password=password)
        
        user_profile_ref = db.collection('artifacts').document(PROJECT_ID).collection('users').document(user.uid).collection('user_profile').document('profile')
        user_profile_ref.set({'name': name, 'email': email})

        return jsonify({"message": "Usuário cadastrado com sucesso!", "uid": user.uid, "name": name}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para login de usuário
@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "E-mail ou senha não fornecidos."}), 400

    try:
        user_record = firebase_auth.get_user_by_email(email)
        return jsonify({"message": "Login bem-sucedido!", "uid": user_record.uid, "email": user_record.email, "name": "Usuário"}), 200
    except firebase_auth.AuthError as e:
        return jsonify({"error": f"Autenticação falhou: {e.code}"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para buscar os serviços de um usuário específico
@app.route('/api/my-services', methods=['GET'])
def get_my_services():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "userId não fornecido."}), 400

    services_ref = db.collection('artifacts').document(PROJECT_ID).collection('public').document('data').collection('services').where('userId', '==', user_id)
    services = services_ref.stream()
    service_list = []
    for service in services:
        service_data = service.to_dict()
        service_data['id'] = service.id
        service_list.append(service_data)
    
    return jsonify(service_list)

if __name__ == '__main__':
    app.run(debug=False)