import React, { useEffect, useState } from 'react';
import './PasswordRecovery.css';
import Logo from "../../img/logomarca.svg"
import { api } from '../../services/axiosApi/apiClient';
import { useNavigate } from 'react-router-dom';

const PasswordRecovery: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [emailGetStorage, setEmailGetStorage] = useState<any>('');

  const navigate = useNavigate();


  useEffect(() => {
    setEmailGetStorage(localStorage.getItem("EmailForgot"));
  }, [])

  useEffect(() => {
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle('');
        setSendMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sendTitle, sendMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email || !password || !confirmPassword) {
      setSendTitle("error");
      setSendMessage("Preencha todos os campos!");
      return;
    }
    if (password !== confirmPassword) {
      setSendTitle("error");
      setSendMessage("Repita a senha corretamente.");
      return;
    }

    try {
      await api.put("/api/user/reset-pass", {
        password
      }, {
        params: { email }
      })

      setSendTitle("success");
      setSendMessage("Senha alterada com sucesso!");
      setTimeout(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('EmailForgot');
        navigate("/");
      }, 2000); // Redireciona após 2 segundos.

      setIsSubmitting(false);
    } catch (error: any) {
      setSendTitle("error");
      setSendMessage("Erro ao carregar as reservas.");
      setIsSubmitting(false);
      setSuccess(false)
    }

  };

  return (
    <>
      <img src={Logo} alt="asdf" className='img-recovery-pass' />

      <div className="recovery-container">
        <div className={`recovery-card ${success ? 'success' : ''}`}>
          <>
            <div className="recovery-header">
              <h2>Redefinir Senha</h2>
            </div>

            <form onSubmit={handleSubmit} className="recovery-form">
              <div className="input-block">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={emailGetStorage}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seuEmail@email.com"
                />
              </div>

              <div className="input-block">
                <label htmlFor="password">Nova Senha</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="input-block">
                <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Digite a senha novamente"
                />
              </div>

              <p>Lembrou da senha? <strong onClick={() => navigate('/')}>Entrar</strong></p>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting || password !== confirmPassword}
              >
                {isSubmitting ? (
                  <span className="spinner"></span>
                ) : (
                  'Redefinir Senha'
                )}
              </button>
            </form>
          </>
        </div>
      </div>
    </>
  );
};

export default PasswordRecovery;