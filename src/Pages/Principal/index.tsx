import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../services/contexts/AuthContext"; // Corrigir importação se necessário
import MenuOption from "../../components/Principal/MenuOption";
import "./style-principal.css"

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
          <h1>Bem-vindo, {user ? user.userName : 'Usuário'}</h1>
        </section>
        <section className="area-reserve"></section>
      </main>

    </>
  );
}
