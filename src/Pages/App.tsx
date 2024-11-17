import { Link } from 'react-router-dom'
import './App.css'
import LogoMarca from '../img/logomarca-branca.svg'

export default function App() {

  return (
    <>
      <section className='login-container'>
        <article className="login">
          <img src={LogoMarca} alt="logo" className='logo' />
          <h1>Sign In</h1>
          <form>
            <h3>Entre em sua conta</h3>
            <input type="email"
              placeholder='Email'
              required
            />
            <input type="password"
              placeholder='Senha'
              required
            />
            <div className='area-link-forgot-pass'>
              <a href="#">Esqueci minha senha</a>
            </div>
            <button>Entrar</button>
          </form>
        </article>

        <article className="information">
          <h1>Crie sua conta</h1>
          <h3>Crie sua conta e comece a usar nossas funcionalidades.</h3>
          <Link to="/signout">Criar conta</Link>
        </article>

      </section>
    </>
  )
}
