from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from models import db, User, Session, Message 

auth_bp = Blueprint('auth', __name__)
chat_bp = Blueprint('chat', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Отсутствуют учетные данные (логин или пароль)'}), 400

    if len(username) < 3:
        return jsonify({'error': 'Логин должен быть не короче 3 символов'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Пароль должен быть не короче 6 символов'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Пользователь с таким логином уже существует'}), 400

    try:
        new_user = User(username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Регистрация прошла успешно! Теперь вы можете войти в аккаунт.'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Ошибка при создании аккаунта. Попробуйте позже.'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Отсутствуют учетные данные (логин или пароль)'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Неверный логин или пароль'}), 401

    access_token = create_access_token(identity=username)
    return jsonify({'access_token': access_token, 'message': ''})

@auth_bp.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    """
    Возвращает минимальную информацию о текущем пользователе.
    Это безопаснее, чем декодировать токен на фронте.
    """
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404
    return jsonify({'username': user.username, 'id': user.id})

@chat_bp.route('/api/sessions/current', methods=['GET'])
@jwt_required()
def get_current_session():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 401

    session = Session.query.filter_by(user_id=user.id).order_by(Session.created_at.desc()).first()
    if not session:
        session = Session(user_id=user.id, name='Текущая сессия')
        db.session.add(session)
        db.session.commit()

    messages = Message.query.filter_by(session_id=session.id).order_by(Message.created_at.asc()).all()
    msg_list = [{'text': msg.text, 'isUser': msg.is_user, 'timestamp': msg.created_at.isoformat()} for msg in messages]

    return jsonify({
        'sessionId': session.id,
        'sessionName': session.name,
        'messages': msg_list
    })

@chat_bp.route('/api/chat', methods=['POST'])
@jwt_required()
def chat():
    current_user = get_jwt_identity()
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    session_id_raw = data.get('sessionId')  

    if not message:
        return jsonify({'error': 'Сообщение пустое'}), 400

    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 401

    session = None
    if session_id_raw is not None:
        try:
            session_id = int(session_id_raw)
            session = Session.query.get(session_id)
            if session is None or session.user_id != user.id:
                return jsonify({'error': 'Сессия не найдена или доступ запрещён'}), 404
        except (ValueError, TypeError):
            return jsonify({'error': 'Неверный формат sessionId'}), 400

    if not session:
        session = Session.query.filter_by(user_id=user.id).order_by(Session.created_at.desc()).first()
        if not session:
            session = Session(user_id=user.id, name='Текущая сессия')
            db.session.add(session)
            db.session.commit()

    user_msg = Message(session_id=session.id, text=message, is_user=True)
    db.session.add(user_msg)
    db.session.commit()

    greetings = ['привет', 'здравствуй', 'хай', 'hello']
    if any(g in message.lower() for g in greetings):
        response_text = f"Лилит: Привет, {current_user}! Что привело тебя ко мне сегодня?"
    elif '?' in message:
        response_text = f"Лилит: Хм, интересный вопрос, {current_user}. Давай разберёмся вместе..."
    else:
        response_text = f"Лилит: {current_user}, твои слова эхом отдаются в моей тьме. Продолжай, я слушаю..."

    bot_msg = Message(session_id=session.id, text=response_text, is_user=False)
    db.session.add(bot_msg)
    db.session.commit()

    return jsonify({'response': response_text, 'sessionId': session.id})
