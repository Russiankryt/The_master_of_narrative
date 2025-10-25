import { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';

interface FormState {
  username: string;
  password: string;
  message: string;
  loading: boolean;
}

interface ApiResponse {
  message?: string;
  error?: string;
  access_token?: string; 
}

function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  const maxRx = 6;
  const maxRy = 8;

  const ry = ((x - cx) / cx) * maxRy;
  const rx = -((y - cy) / cy) * maxRx;

  el.style.setProperty('--rx', `${rx}deg`);
  el.style.setProperty('--ry', `${ry}deg`);
  el.style.setProperty('--ty', `-10px`);
}

function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  el.style.setProperty('--rx', `0deg`);
  el.style.setProperty('--ry', `0deg`);
  el.style.setProperty('--ty', `0px`);
}

const LoginPage = () => {
  const [formState, setFormState] = useState<FormState>({
    username: '',
    password: '',
    message: '',
    loading: false,
  });
  const navigate = useNavigate();

const handleLogin = async () => {
  setFormState((prev) => ({ ...prev, loading: true }));
  try {
    const response = await axios.post<ApiResponse>('http://localhost:5000/login', {
      username: formState.username,
      password: formState.password,
    });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      setFormState((prev) => ({
        ...prev,
        message: '',
        loading: false,
      }));
      navigate('/narrative');
    } else {
      setFormState((prev) => ({
        ...prev,
        message: 'Ошибка: Токен не получен, войдите в учетную запись',
        loading: false,
      }));
    }
  } catch (error) {
    const errorMessage = (error as any)?.response?.data?.error || 'Не удалось войти';
    setFormState((prev) => ({
      ...prev,
      message: `Ошибка: ${errorMessage}`,
      loading: false,
    }));
  }
};

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  const isSuccess = formState.message.startsWith('Успех:');

  return (
    <div className="lilith-engine">
      <div
        className="wrapper login"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <h2 className="lilith-engine__header">Вход</h2>
        <div className="input-field">
          <label htmlFor="username">Имя пользователя</label>
          <input
            id="username"
            placeholder="Введите имя пользователя"
            type="text"
            required
            value={formState.username}
            onChange={(e) => setFormState((prev) => ({ ...prev, username: e.target.value }))}
            className="lilith-engine__input"
          />
        </div>
        <div className="input-field">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            placeholder="Введите пароль"
            type="password"
            required
            value={formState.password}
            onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
            className="lilith-engine__input"
          />
        </div>
        <div className="forget">
          <label htmlFor="remember">
            <input type="checkbox" id="remember" />
            <span>Запомнить меня</span>
          </label>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Забыли пароль?
          </a>
        </div>
        <button
          type="button"
          onClick={handleLogin}
          className={`lilith-engine__button ${formState.loading ? 'lilith-engine__button--loading' : ''}`}
          disabled={formState.loading}
        >
          {formState.loading ? 'Загрузка...' : 'Войти'}
        </button>
        <div className="register">
          <p>
            Нет аккаунта?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); handleRegisterRedirect(); }}>
              Зарегистрироваться
            </a>
          </p>
        </div>
        <p className={`lilith-engine__message ${isSuccess ? 'lilith-engine__message--success' : 'lilith-engine__message--error'}`}>
          {formState.message.split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </p>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const [formState, setFormState] = useState<FormState>({
    username: '',
    password: '',
    message: '',
    loading: false,
  });
  const navigate = useNavigate();

  const handleRegister = async () => {
    setFormState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await axios.post<ApiResponse>('http://localhost:5000/register', {
        username: formState.username,
        password: formState.password,
      });
      setFormState((prev) => ({
        ...prev,
        message: `Успех: ${response.data.message}`,
        loading: false,
      }));
      navigate('/');
    } catch (error) {
      const errorMessage = (error as any)?.response?.data?.error || 'Не удалось';
      setFormState((prev) => ({
        ...prev,
        message: `Ошибка: ${errorMessage}`,
        loading: false,
      }));
    }
  };

  const handleLoginRedirect = () => {
    navigate('/');
  };

  const isSuccess = formState.message.startsWith('Успех:');

  return (
    <div className="lilith-engine">
      <div
        className="wrapper register"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <h2 className="lilith-engine__header">Регистрация</h2>
        <div className="input-field">
          <label htmlFor="reg-username">Имя пользователя</label>
          <input
            id="reg-username"
            placeholder="Введите имя пользователя"
            type="text"
            required
            value={formState.username}
            onChange={(e) => setFormState((prev) => ({ ...prev, username: e.target.value }))}
            className="lilith-engine__input"
          />
        </div>
        <div className="input-field">
          <label htmlFor="reg-password">Пароль</label>
          <input
            id="reg-password"
            placeholder="Введите пароль"
            type="password"
            required
            value={formState.password}
            onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
            className="lilith-engine__input"
          />
        </div>
        <button
          type="button"
          onClick={handleRegister}
          className={`lilith-engine__button ${formState.loading ? 'lilith-engine__button--loading' : ''}`}
          disabled={formState.loading}
        >
          {formState.loading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
        <div className="register">
          <p>
            Уже есть аккаунт?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); handleLoginRedirect(); }}>
              Войти
            </a>
          </p>
        </div>
        <p className={`lilith-engine__message ${isSuccess ? 'lilith-engine__message--success' : 'lilith-engine__message--error'}`}>
          {formState.message.split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </p>
      </div>
    </div>
  );
};

const NarrativePage = () => {
  const [sessions, _setSessions] = useState<string[]>(['Сессия 1', 'Сессия 2']);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState('');

const handleSendMessage = async () => {
  if (!input.trim()) return;

  const token = localStorage.getItem('access_token');
  if (!token) {
    setMessages((prev) => [...prev, { text: 'Ошибка: Вы не авторизованы. Пожалуйста, войдите.', isUser: false }]);
    return;
  }

  setMessages((prev) => [...prev, { text: input, isUser: true }]);
  setInput('');
  try {
    const response = await axios.post(
      'http://localhost:5000/api/chat',
      { message: input },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessages((prev) => [...prev, { text: response.data.response, isUser: false }]);
  } catch (error) {
    const errMsg = (error as any)?.response?.data?.msg || 'Не удалось отправить сообщение';
    setMessages((prev) => [...prev, { text: `Ошибка: ${errMsg}`, isUser: false }]);
  }
};
  return (
    <div className="lilith-engine">
      <div className="narrative-interface">
        <div
          className="sidebar"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <h3>Сессии</h3>
          <ul>
            {sessions.map((session, index) => (
              <li key={index}>{session}</li>
            ))}
          </ul>
        </div>
        <div
          className="chat-wrapper"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.isUser ? 'user-message' : 'lilit-message'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Напишите сообщение..."
            />
            <button onClick={handleSendMessage}>Отправить</button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/narrative" element={<NarrativePage />} />
      </Routes>
    </Router>
  );
}

export default App;