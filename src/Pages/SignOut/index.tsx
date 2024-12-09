import "./style-signout.css";
import { Link } from "react-router-dom";
import { FormEvent, useState, useEffect } from "react";
import { api } from "../../services/axiosApi/apiClient";
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask"
import Modal from "react-modal"
import { FiMessageCircle, FiX } from "react-icons/fi";
import Lottie from "lottie-react";
import AtentimentoLottie from "../../img/suporte-lottie.json";

export default function SignOut() {
  const [userName, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sendTitle, setSendTitle] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [modalIsOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  // Exibir Toast após mudança de sendTitle e sendMessage
  useEffect(() => {
    if (sendTitle && sendMessage) {
      // Exibe o Toast com os valores atuais
      const timer = setTimeout(() => {
        setSendTitle('');  // Limpa o título para esconder o Toast após 3 segundos
        setSendMessage('');  // Limpa a mensagem
      }, 3000);

      return () => clearTimeout(timer); // Limpar o timer quando o componente for desmontado ou o estado mudar
    }
  }, [sendTitle, sendMessage]);

  async function handleAddUser(e: FormEvent) {
    e.preventDefault();

    if (password !== passwordRepeat) {
      setSendTitle('warning');
      setSendMessage("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/api/user', {
        userName,
        email,
        password,
        phone
      });
      setIsLoading(false);
      setSendTitle('success');
      setSendMessage(`Olá, ${response.data.userName}. Faça seu login.`);
      navigate("/");
    } catch (error: any) {
      setIsLoading(false);
      setSendTitle('error');
      setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
    }
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
      border: '1px solid #ccc',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '80vw',
      height: '90vh',
      maxWidth: '90%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <>
      {/* Renderiza o Toast com uma chave única baseada em sendTitle e sendMessage */}
      < Toast title={sendTitle} message={sendMessage} />

      <section className='signout-container'>
        <article className="information">
          <h1>Faça seu login</h1>
          <h3>Se você já tem uma conta, faça seu login.</h3>
          <Link to="/">Fazer login</Link>
        </article>

        <article className="signout">
          <h1>Sign Out</h1>

          {/* Condicional de loading */}
          {isLoading ? (
            <Loading />
          ) : (

            <>
              <div className="area-modal">
                <Modal
                  isOpen={modalIsOpen}
                  onRequestClose={closeModal}
                  style={customStylesModal}
                  shouldCloseOnOverlayClick={false}
                >
                  <header className="header-modal">
                    <div className="area-close" onClick={closeModal}>
                      <FiX size={24} />
                    </div>
                  </header>

                  <section className="main-modal">

                    <div className="area-teste">
                      <h3>Vamos cadastrar sua arena em instantes, para <strong>utilização
                        dos nossos serviços. ; )</strong>
                      </h3>

                      <button>
                        <p>Teste Grátis</p>
                        <FiMessageCircle size={24} className="icon-teste" />
                      </button>
                    </div>

                    <div className="area-planos">
                      <Lottie
                        animationData={AtentimentoLottie}
                        loop={true}
                        autoplay={true}
                        className="animation"
                      />


                      <a href="#">Ver planos</a>
                    </div>

                  </section>

                </Modal>
              </div>

              <form onSubmit={handleAddUser}>
                <input type="text" placeholder='Nome' required onChange={e => setName(e.target.value)} />
                <input type="email" placeholder='Email' required onChange={e => setEmail(e.target.value)} />
                <IMaskInput
                  mask={"(00)00000-0000"}
                  type="text"
                  placeholder='Telefone' required
                  onChange={e => setPhone((e.target as HTMLInputElement).value)} />
                <input type="password" placeholder='Senha' required onChange={e => setPassword(e.target.value)} />
                <input type="password" placeholder='Repetir Senha' required onChange={e => setPasswordRepeat(e.target.value)} />
                <button type="submit">Cadastrar</button>
                <button onClick={openModal}>Chama modal</button>
              </form></>
          )}
        </article>
      </section>
    </>
  );
}
