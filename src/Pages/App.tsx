import { Link } from 'react-router-dom';
import './App.css';
import LogoMarca from '../img/logomarca-branca.svg';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../services/contexts/AuthContext';
import { api } from '../services/axiosApi/apiClient';
import Toast from '../components/Toast';

export default function App() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Caso esteja usando o AuthContext
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext não foi encontrado! Certifique-se de envolver seu componente com AuthProvider.');
  }

  const { login, logout, isAuthenticated } = authContext;

  useEffect(() => {
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle('');
        setSendMessage('');
      }, 3000);

      return () => clearTimeout(timer); // Limpar o timer ao desmontar o componente ou atualizar os estados
    }
  }, [sendTitle, sendMessage]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await api.post('/api/Auth/login', {
        email,
        password
      });

      const token = response.data.token.token;

      if (token) {
        // Armazenar token no contexto ou localStorage
        // localStorage.setItem("authToken", token);
        login(token); // Se a função login armazenar o token no contexto
        setIsLoading(false);
        setSendTitle('success');
        setSendMessage('Login efetuado!');
      } else {
        setIsLoading(false);
        setSendTitle('error');
        setSendMessage('Erro ao fazer login');
      }

    } catch (error: any) {
      setIsLoading(false);
      setSendTitle('error');
      setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
    }
  }

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {!isLoading && (
        <section className="login-container">
          <article className="login">
            <img src={LogoMarca} alt="logo" className="logo" />
            <h1>Sign In</h1>
            <form onSubmit={handleLogin}>
              <h3>Entre em sua conta</h3>
              <input
                type="email"
                placeholder="Email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Senha"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="area-link-forgot-pass">
                <a href="#">Esqueci minha senha</a>
              </div>
              <button type="submit">Entrar</button>
            </form>
          </article>

          <article className="information">
            <h1>Crie sua conta</h1>
            <h3>Crie sua conta e comece a usar nossas funcionalidades.</h3>
            <Link to="/signout">Criar conta</Link>
          </article>
        </section>
      )}
    </>
  );
}
