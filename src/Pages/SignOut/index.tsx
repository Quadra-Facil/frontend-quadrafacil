import { Link } from "react-router-dom";
import "./style-signout.css";
import { FormEvent, useState } from "react";
import { api } from "../../services/apiClient";
import Loading from "../../components/Loading";

export default function SignOut() {
  const [userName, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Inicializando como false (não está carregando no início)

  async function handleAddUser(e: FormEvent) {
    e.preventDefault();

    if (password !== passwordRepeat) {
      alert("As senhas não coincidem! Por favor, repita a senha corretamente.");
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
      console.log(response.data);
      setIsLoading(false);
    } catch (error: any) {
      console.log(error.response?.data?.erro || 'Erro desconhecido');
      setIsLoading(false);
    }
  }

  return (
    <>
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
              <input
                type="text"
                placeholder='Telefone'
                required
                onChange={e => setPhone(e.target.value)}
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
    </>
  );
}
