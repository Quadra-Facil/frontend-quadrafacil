import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../services/contexts/AuthContext"; // Corrigir importação se necessário
import MenuOption from "../../components/Principal/MenuOption";
import "./style-principal.css"
import UserIcon from "./img/user.svg"
import SettingsIcon from "./img/FiSettings.svg"
import IconInstagran from "./img/FiInstagram.svg"
import IconWatsApp from "./img/FiMessageSquare.svg"
import Modal from "react-modal"
import Logo from "../../img/logomarca.svg"

import { FiActivity, FiPlusCircle, FiSearch, FiX } from "react-icons/fi";
import { api } from "../../services/axiosApi/apiClient";
import { DatePickerReserve } from "../../components/DatePickerReserve";

import { format } from "date-fns";

interface DataProgram {
  id: number;
  startDate: Date | any;
  endDate: Date | any;
  reason: string;
}

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

  const [isOpenInforme, setIsOpenInforme] = useState<boolean>(false)
  const [dataDesativeProgrma, setDataDesativeProgrma] = useState<DataProgram[]>()

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

  const customStylesModalInforme = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      border: '0px solid #ccc',
      borderRadius: '10px',
      padding: '0px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '40vw',
      height: '50vh',
      maxWidth: '100%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

  function openModalInformeArenaDisable() {
    setIsOpenInforme(true);
  }

  function closeModalInformeArenaDisable() {
    setIsOpenInforme(false);
  }

  // dando erro aqui
  useEffect(() => {
    const fetchArena = async () => {
      try {
        const response = await api.post("/api/Arena/getArena", {
          arenaId: user?.arena
        });
        setArena(response?.data?.name)
      } catch (error) {
        console.log("Erro ao buscar arena: ", error);
      }
    };

    fetchArena(); // Agora estamos chamando a função assíncrona
  }, [Arena]);

  useEffect(() => {
    if (user?.role !== "client" && user?.role !== "dev") {

      async function verifyStatusArena() {
        try {
          const response = await api.post("/api/DesativeProgram/get", {
            arenaId: user?.arena
          });

          // Verifique se a resposta contém dados válidos
          if (response?.data?.$values?.length > 0) {

            setDataDesativeProgrma(response?.data?.$values)

            // Extrair as datas brutas
            const startDateRaw = response.data.$values[0]?.startDate;
            const endDateRaw = response.data.$values[0]?.endDate;

            // Garantir que as datas sejam válidas
            const startDate = startDateRaw ? new Date(startDateRaw) : null;
            const endDate = endDateRaw ? new Date(endDateRaw) : null;

            // Verifique se as datas são válidas
            if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
              const currentDate = new Date();
              const formattedCurrentDate = format(currentDate as any, "dd/MM/yyyy");
              const formattedStartDate = format(startDate as any, "dd/MM/yyyy");
              const formattedEndDate = format(endDate as any, "dd/MM/yyyy");

              // verifica se está no periodo
              if (formattedCurrentDate >= formattedStartDate && formattedCurrentDate <= formattedEndDate) {
                await api.put("/api/Arena/status-edit", {
                  realArenaId: user?.arena,
                  newStatus: "inativo"
                })
                openModalInformeArenaDisable()

                return;
              } else {
                await api.put("/api/Arena/status-edit", {
                  realArenaId: user?.arena,
                  newStatus: "ativo"
                })
                return;
              }

            } else {
              console.warn('Datas de início ou fim inválidas:', { startDateRaw, endDateRaw });
            }
          } else {
            console.warn('não temos nenhuma programação de desativação');
          }
        } catch (error) {
          console.error('Erro ao verificar o status da arena:', error);
        }
      }

      verifyStatusArena();
    }
  }, [user]);





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
            <h1>Olá<strong>,</strong> {user ? user?.userName : 'Usuário'} <strong>=)</strong></h1>
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

      <Modal
        isOpen={isOpenInforme}
        onRequestClose={closeModalInformeArenaDisable}
        style={customStylesModalInforme}
        shouldCloseOnOverlayClick={false}
      >
        <header className="header-modal-informe">

          <img src={Logo} alt="logo" />

          <div className="area-close" onClick={closeModalInformeArenaDisable}>
            <FiX size={24} />
          </div>
        </header>
        <section className="main-modal-informe">
          <h1>Arena Desativada =(</h1>

          {
            dataDesativeProgrma && dataDesativeProgrma.length > 0 && dataDesativeProgrma[0]?.startDate && dataDesativeProgrma[0]?.endDate
              ? (
                <>
                  <h5><strong>Período:</strong> {format(new Date(dataDesativeProgrma[0]?.startDate), "dd/MM/yyyy")} até {format(new Date(dataDesativeProgrma[0]?.endDate), "dd/MM/yyyy")}</h5>
                  <h5 style={{ marginTop: '-0.1%' }}>{dataDesativeProgrma[0]?.reason}</h5>
                </>
              ) : (
                <h5><strong>{Arena}</strong> está desativada temporariamente.</h5>
              )
          }

          <button onClick={() => closeModalInformeArenaDisable()}>Fechar</button>

        </section>

      </Modal>

    </>
  );
}
