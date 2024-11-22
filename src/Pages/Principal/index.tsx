import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../services/contexts/AuthContext"; // Corrigir importação se necessário
import MenuOption from "../../components/Principal/MenuOption";
import "./style-principal.css"
import UserIcon from "./img/user.svg"

export default function Principal() {
  const authContext = useContext(AuthContext);

  // Verificar se o authContext está disponível
  if (!authContext) {
    return <div>Carregando...</div>; // Pode retornar uma tela de carregamento ou um componente de fallback
  }

  const { logout, user } = authContext; // Agora podemos garantir que authContext não é undefined

  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');

  useEffect(() => {
    console.log(user ? user : 'Usuário')
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle('');
        setSendMessage('');
      }, 3000);

      return () => clearTimeout(timer); // Limpar o timer ao desmontar o componente ou atualizar os estados
    }
  }, [sendTitle, sendMessage]);

  return (
    <>
      <main>
        <section className="area-menu">
          <MenuOption />
        </section>
        <section className="area-content">

          <div className="header-principal">
            <h1>Bem-vindo<strong>,</strong> {user ? user.userName : 'Usuário'} <strong>=)</strong></h1>
            <img src={UserIcon} alt="icon" width={33} />
          </div>

          <div className="area-secundary">
            <div className="button-area">
              <button>Nova</button>
              <button>Dashboard</button>
            </div>

            <div className="area-user">
              <p>Alvorada beach</p>
              <p>icone</p>
              <p>Configurações</p>

              <button>Sair</button>
            </div>
          </div>

          <div className="context">

          </div>

        </section>

        <section className="area-reserve"></section>
      </main>

    </>
  );
}
