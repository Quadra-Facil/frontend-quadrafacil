import './App.css';
import { Link, useNavigate } from 'react-router-dom';
import LogoMarca from '../img/logomarca-branca.svg';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../services/contexts/AuthContext';
import { api } from '../services/axiosApi/apiClient';
import Toast from '../components/Toast';
import Loading from '../components/Loading';
import { FiX } from 'react-icons/fi';
import Modal from "react-modal"

export default function App() {

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [emailForgotPass, setEmailForgotPass] = useState<string>('')

  const navigate = useNavigate();

  // Caso esteja usando o AuthContext
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext não foi encontrado! Certifique-se de envolver seu componente com AuthProvider.');
  }

  //style modal
  const customStylesModal = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#f0f0f0',
      border: 'none', // Remove a borda
      borderRadius: '10px',
      padding: '0', // Remove o padding
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '55vw',
      height: '75vh',
      maxWidth: '90%',
      color: '#6c6c6c',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

  const { login } = authContext;

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');

      // Verifica se o token existe e não está vazio
      if (token && token.trim() !== '') {
        navigate("/principal")
        // Aqui você pode validar o token com sua API
      } else {
        console.log('Token não encontrado ou inválido');
      }
    } catch (error) {
      console.error('Erro ao acessar localStorage:', error);
    }
  }, []);


  useEffect(() => {
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle('');
        setSendMessage('');
      }, 3000);

      return () => clearTimeout(timer); // Limpar o timer ao desmontar o componente ou atualizar os estados
    }
  }, [sendTitle, sendMessage]);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  async function sendEmailForgotPass(e: FormEvent) {
    e.preventDefault();

    if (emailForgotPass == "") {
      setSendTitle('error');
      setSendMessage('Preencha o campo Email.');
      return;
    }

    setIsLoading(true);

    await api.post('/api/email-send', {
      toEmail: emailForgotPass,
      nomeUsuario: "teste",
      linkRecuperacao: "https://www.agendamento.appquadrafacil.com.br/recovery-pass"
    })
      .then(() => {
        setIsLoading(false);
        setSendTitle('success');
        setSendMessage(`E-mail enviado para ${emailForgotPass}`);

        localStorage.setItem("EmailForgot", emailForgotPass);

        closeModal();
      })
      .catch(error => {
        setIsLoading(false);
        setSendTitle('error');
        setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
      })
  }

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
        navigate("/principal")
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

      {
        isLoading ?
          <Loading />
          : (

            <>
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStylesModal}
                shouldCloseOnOverlayClick={false}
              >
                <main>

                  <section className="area-message">
                    <h1>Tranquilo,</h1>
                    <h4>Vamos te ajudar. Informe os dados necessários para recuperar sua senha.</h4>
                  </section>

                  <section className="area-dados">
                    <header className="header-modal">
                      <div className="area-close" onClick={closeModal}>
                        <FiX size={24} />
                      </div>
                    </header>

                    <div className='area-title'>
                      <h1>Esqueci minha senha</h1>
                    </div>

                    <p>Digite os dados para receber um e-mail informando como recupera-la. </p>

                    <input
                      type="email"
                      placeholder='Digite seu e-mail'
                      onChange={e => setEmailForgotPass(e.target.value)}
                    />

                    <p>Lembrou da senha? <strong onClick={closeModal}>Entrar</strong></p>

                    <button onClick={sendEmailForgotPass}>Recuperar Senha</button>
                  </section>
                </main>

              </Modal>

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
                      onChange={(e) => setEmail(e.target.value)} />
                    <input
                      type="password"
                      placeholder="Senha"
                      required
                      onChange={(e) => setPassword(e.target.value)} />
                    <div className="area-link-forgot-pass">
                      <a href="#" onClick={openModal}>Esqueci minha senha</a>
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
            </>
          )}
    </>
  );
}
