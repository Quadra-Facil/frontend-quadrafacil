import "./style-signout.css";
import { Link } from "react-router-dom";
import { FormEvent, useState, useEffect } from "react";
import { api } from "../../services/axiosApi/apiClient";
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask";
import Modal from "react-modal";

Modal.setAppElement('#root'); // This line is important for accessibility

export default function SignOut() {
  const [userName, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sendTitle, setSendTitle] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  // const [modalIsOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  // Exibir Toast após mudança de sendTitle e sendMessage
  useEffect(() => {
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle('');
        setSendMessage('');
      }, 3000);

      return () => clearTimeout(timer);
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
      // openModal();
      navigate("/")
    } catch (error: any) {
      setIsLoading(false);
      setSendTitle('error');
      setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
    }
  }

  // Style modal
  // const customStylesModal = {
  //   content: {
  //     top: '50%',
  //     left: '50%',
  //     right: 'auto',
  //     bottom: 'auto',
  //     marginRight: '-50%',
  //     transform: 'translate(-50%, -50%)',
  //     backgroundColor: '#f0f0f0',
  //     border: '1px solid #ccc',
  //     borderRadius: '10px',
  //     padding: '20px',
  //     boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  //     width: '80vw',
  //     height: '90vh',
  //     maxWidth: '90%',
  //     color: '#6c6c6c'
  //   },
  //   overlay: {
  //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
  //   },
  // };

  // function openModal() {
  //   setIsOpen(true);
  // }

  // function closeModal() {
  //   setIsOpen(false);
  // }

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />

      <section className='signout-container'>
        <article className="information">
          <h1>Faça seu login</h1>
          <h3>Se você já tem uma conta, faça seu login.</h3>
          <Link to="/">Fazer login</Link>
        </article>

        <article className="signout">
          <h1>Criar conta</h1>

          {isLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleAddUser}>
              <input
                type="text"
                placeholder='Nome'
                required
                onChange={e => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder='Email'
                required
                onChange={e => setEmail(e.target.value)}
              />
              <IMaskInput
                mask={"(00)00000-0000"}
                type="text"
                placeholder='Telefone'
                required
                onChange={e => setPhone((e.target as HTMLInputElement).value)}
              />
              <input
                type="password"
                placeholder='Senha'
                required
                onChange={e => setPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder='Repetir Senha'
                required
                onChange={e => setPasswordRepeat(e.target.value)}
              />
              <button type="submit">Cadastrar</button>
            </form>
          )}
        </article>
      </section>

      {/* <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStylesModal}
        shouldCloseOnOverlayClick={false}
        contentLabel="Cadastro realizado com sucesso"
      >
        <header className="header-modal">
          <div className="area-close" onClick={closeModal}>
            <FiX size={24} />
          </div>
        </header>

        <section className="main-modal-plans">
          <div className="area-teste">
            <h3>
              Vamos cadastrar sua arena em instantes, para <strong>utilização
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
      </Modal> */}
    </>
  );
}