import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../services/contexts/AuthContext"; // Corrigir importação se necessário
import MenuOption from "../../components/Principal/MenuOption";
import "./style-principal.css"
import UserIcon from "./img/user.svg"
import SettingsIcon from "./img/FiSettings.svg"
import IconInstagran from "./img/FiInstagram.svg"
import IconWatsApp from "./img/FiMessageSquare.svg"

import { FiActivity, FiPlusCircle, FiSearch, FiX } from "react-icons/fi";
import { api } from "../../services/axiosApi/apiClient";
import { DatePickerReserve } from "../../components/DatePickerReserve";

export default function Principal() {
  const authContext = useContext(AuthContext);

  // Verificar se o authContext está disponível
  if (!authContext) {
    return <div>Carregando...</div>; // Pode retornar uma tela de carregamento ou um componente de fallback
  }

  const { logout, user } = authContext; // Agora podemos garantir que authContext não é undefined

  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [classAreaUser, setClassAreaUser] = useState(false);
  const [Arena, setArena] = useState<string>('')


  useEffect(() => {
    // setClassAreaUser(false)
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle('');
        setSendMessage('');
      }, 3000);

      return () => clearTimeout(timer); // Limpar o timer ao desmontar o componente ou atualizar os estados
    }
  }, [sendTitle, sendMessage]);

  // dando erro aqui
  useEffect(() => {
    const fetchArena = async () => {
      try {
        const response = await api.post("/api/Arena/getArena", {
          arenaId: user.arena // 'params' é o correto para enviar parâmetros na URL
        });
        setArena(response.data.name)
      } catch (error) {
        console.log("Erro ao buscar arena: ", error);
      }
    };

    fetchArena(); // Agora estamos chamando a função assíncrona
  }, [Arena]);

  const classUser = () => {
    setClassAreaUser(true); // Mostra a área de usuário
  };

  // Função para lidar com o hover fora
  const hideClassUser = () => {
    setClassAreaUser(false); // Esconde a área de usuário
  };

  return (
    <>
      <main>
        <section className="area-menu">
          <MenuOption />
        </section>
        <section className="area-content">

          <div className="header-principal">
            <h1>Olá<strong>,</strong> {user ? user.userName : 'Usuário'} <strong>=)</strong></h1>
            <img
              src={UserIcon}
              alt="icon"
              width={33}
              onMouseEnter={classUser}
            />
          </div>

          <div className="area-secundary">
            <section className="area-btn-input">
              <div className="button-area">
                <div className="button-area-nova">
                  <button className="button-nova">
                    <FiPlusCircle size={20} />
                    Nova
                  </button>
                </div>
                <div className="button-area-dashboard">
                  <button className="button-dash">
                    <FiActivity size={20} />
                    Dashboard
                  </button>
                </div>
              </div>

              <div className="area-search">
                <input type="text"
                  placeholder="Pesquise itens do menu"
                />
                <button className="search-icon">
                  <FiSearch size={32} color="#8a8888" />
                </button>
              </div>
            </section>


            <div className="area-user" onMouseLeave={hideClassUser} // Quando o mouse sai, esconde
              style={{
                display: classAreaUser ? 'flex' : 'none', // Controla o display para mostrar ou esconder
                transition: 'opacity 0.3s ease, visibility 0.3s ease', // Transição suave
                opacity: classAreaUser ? 1 : 0,  // Controla a opacidade
                visibility: classAreaUser ? 'visible' : 'hidden',  // Controla a visibilidade
              }}>
              <p>{Arena}</p>
              <div className="area-config">
                <img src={SettingsIcon} alt="" />
                <p>Configurações</p>
              </div>

              <button onClick={() => logout()}>
                Sair
              </button>
            </div>
          </div>

          <div className="context">
            <h1>horario disponiveis do dia</h1>
          </div>

          <div className="area-social">
            <div className="area-img">
              <img src={IconInstagran} alt="icon" width={35} title="Instagran" />
            </div>
            <div className="area-img">
              <img src={IconWatsApp} alt="icon" width={35} title="WhatsApp" />
            </div>
          </div>

        </section>

        <section className="area-reserve">
          horarios reservados
        </section>
      </main >

    </>
  );
}
