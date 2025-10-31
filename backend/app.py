import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes import auth_bp, chat_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt = JWTManager(app)

    allowed_origins = ["http://localhost:5173", "http://localhost:3000"]
    CORS(app,
         origins=allowed_origins,
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"])

    app.register_blueprint(auth_bp)  
    app.register_blueprint(chat_bp)

    with app.app_context():
        db.create_all()

    @app.route('/', methods=['GET'])
    def health_check():
        return jsonify({'message': 'Lilith Engine API is running!'}), 200

    @app.route('/<path:path>', methods=['OPTIONS'])
    def options_handler(path):
        return '', 200

    return app

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() in ('1', 'true', 'yes')
    app = create_app()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=debug_mode)
