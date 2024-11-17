import { Link } from "react-router-dom"
import "./style-signout.css"

export default function SignOut() {
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
          <form>
            <input type="text"
              placeholder='Nome'
              required
            />
            <input type="email"
              placeholder='Email'
              required
            />
            <input type="text"
              placeholder='Telefone'
              required
            />
            <input type="password"
              placeholder='Senha'
              required
            />
            <input type="password"
              placeholder='Repetir Senha'
              required
            />

            <button>Cadastrar</button>
          </form>
        </article>

      </section>
    </>
  )
}
