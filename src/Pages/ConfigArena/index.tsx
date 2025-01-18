import "./style-config.css"
import { FiActivity, FiArrowDownRight, FiChevronRight, FiLogOut, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { AuthContext } from "../../services/contexts/AuthContext";
import Toast from "../../components/Toast";
import Loading from "../../components/Loading";
import { api } from "../../services/axiosApi/apiClient";
import { CiUser, CiPower, CiStar, CiClock2 } from "react-icons/ci";

// Tipagem de AddressArena conforme a estrutura fornecida
type AddressArena = {
  $id: string;
  state: string;
  city: string;
  street: string;
  neighborhood: string;
  number: number;
  reference: string;
  arenaId: number;
  arena: {
    $ref: string;
  };
};

// Tipagem de Plan conforme a estrutura fornecida
type Plan = {
  $id: string;
  id: number;
  planSelect: string; // Tipo de plano (ex: mensal, teste)
  planExpiry: string; // Data de expiração do plano
  arenaId: number;
  status: string; // Status do plano (ativo, inativo, etc)
  arena: {
    $ref: string;
  };
};

// Tipagem de Arena, ajustada para refletir o objeto retornado
type Arena = {
  $id: string;
  id: number;
  name: string;
  phone: string;
  status: string;
  valueHour: number;
  adressArenas: {
    $id: string;
    $values: AddressArena[]; // Lista de endereços da arena
  };
  plans: {
    $id: string;
    $values: Plan[]; // Lista de planos da arena
  };
};

// Tipagem ajustada para refletir a estrutura retornada pela API
type GetAllArenasResponse = Arena; // Agora é um único objeto Arena, não uma lista


export default function ConfigArena() {
  const navigate = useNavigate();
  const [modalIsOpenPrincipal, setModalIsOpenPrincipal] = useState<boolean>(false);
  const [modalIsOpenOpeningHours, setModalIsOpenOpeningHours] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [getAllArenas, setGetAllArenas] = useState<GetAllArenasResponse | null>(null);
  const [selectedMenu, setSelectedMenu] = useState('')

  const authContext = useContext(AuthContext);
  const { user }: any = authContext;

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


  // style modal opening Hours
  const customStylesModalPrincipal = {
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
      padding: '0px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '70vw',
      height: '80vh',
      maxWidth: '90%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

  // style modal opening Hours
  const customStylesModalOpeningHours = {
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
      width: '40vw',
      height: '50vh',
      maxWidth: '90%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };


  function openModalPrincipal() {
    setModalIsOpenPrincipal(true);   // Abre o modal
  }

  function closeModalPrincipal() {
    setModalIsOpenPrincipal(false);
    navigate("/principal")
  }
  function openModalOpeningHours() {
    setModalIsOpenOpeningHours(true);   // Abre o modal
  }

  function closeModalOpeningHours() {
    setModalIsOpenOpeningHours(false);
    openModalPrincipal();
  }

  useEffect(() => {
    openModalPrincipal();
  }, [])

  useEffect(() => {
    async function getArena() {
      setIsLoading(true)
      await api.post<GetAllArenasResponse>("/api/Arena/getArena", {
        arenaId: user.arena
      }).then((response) => {
        setIsLoading(false)
        setGetAllArenas(response.data);
        setIsLoading(false);
        return;
      }).catch((error: any) => {
        setIsLoading(false);
        setSendTitle('error');
        setSendMessage('Erro ao buscar arena.');
      })
    }
    getArena();
  }, [])

  function handleClickMenu(click: string) {
    if (selectedMenu === "") {
      setSelectedMenu('perfil')
      return;
    } else if (click === "perfil") {
      setSelectedMenu("perfil")
      return;
    } else if (click === "expediente") {
      setSelectedMenu("expediente")
      return;
    } else if (click === "desativar") {
      setSelectedMenu("desativar")
      return;
    }
  }

  useEffect(() => {
    handleClickMenu("perfil")
  }, [])

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {
        isLoading ?
          <Loading />
          : (
            <>
              {/* Modal principal */}
              <Modal
                isOpen={modalIsOpenPrincipal}
                onRequestClose={closeModalPrincipal}
                style={customStylesModalPrincipal}
                shouldCloseOnOverlayClick={false}
              >
                <main className="main-modal-config">
                  <section className="left-config">
                    <h1>{getAllArenas?.name}</h1>
                    <div className="item-menu-config"
                      onClick={() => handleClickMenu("perfil")}
                      title="Visualize ou edite os dados da sua arena."
                    >
                      <div className="first">
                        <CiUser size={20} />
                        <p>Perfil</p>
                      </div>
                      <FiChevronRight size={20} />
                    </div>

                    <div className="item-menu-config"
                      onClick={() => handleClickMenu("expediente")}
                      title="Registre o horário de funcionamento da sua arena."
                    >
                      <div className="first">
                        <CiClock2 size={20} />
                        <p>Expediente</p>
                      </div>
                      <FiChevronRight size={20} />
                    </div>

                    <div className="item-menu-config"
                      onClick={() => handleClickMenu("desativar")}
                      title="Desative temporariamente sua arena."
                    >
                      <div className="first">
                        <CiPower size={20} />
                        <p>Dasativar</p>
                      </div>
                      <FiChevronRight size={20} />
                    </div>

                    <footer className="btn-logout">
                      <button>
                        <FiLogOut size={20} />
                        Log out
                      </button>
                    </footer>
                  </section>

                  <section className="rigth-config">
                    <header>
                      <h3>{
                        selectedMenu === "perfil" ? `Dados da arena` :
                          selectedMenu === "expediente" ? "Registre o horário de funcionamento" :
                            selectedMenu === "desativar" ? "Desative temporariamente sua arena" : ""

                      }</h3>
                      <div className="area-close-modal" onClick={() => closeModalPrincipal()}>
                        <FiX size={24} />
                      </div>
                    </header>

                    {/* perfil */}
                    {
                      selectedMenu === "perfil" && (
                        <section className="perfil">
                          <div className="area-input">
                            <label>Arena</label>
                            <input type="text" />
                          </div>
                        </section>
                      )
                    }
                    {
                      selectedMenu === "expediente" && (
                        /* expediente */
                        <section className="expediente">
                          <h1>section expediente</h1>
                        </section>
                      )
                    }
                    {
                      selectedMenu === "desativar" && (
                        /* desativar */
                        < section className="desativar">
                          <h1>section desativar</h1>
                        </section>
                      )
                    }





                  </section>
                </main>

              </Modal>

              {/* Modal opening Hours */}
              <Modal
                isOpen={modalIsOpenOpeningHours}
                onRequestClose={closeModalOpeningHours}
                style={customStylesModalOpeningHours}
                shouldCloseOnOverlayClick={false}
              >
                <header className="header-modal">
                  <div className="header-arena-licence">
                    <h5>Horário de funcionamento</h5>
                  </div>
                  <div className="area-close" onClick={closeModalOpeningHours}>
                    <FiX size={24} />
                  </div>
                </header>
                <main className="main-modal-opening-hours">
                  <h1>Horários</h1>
                  <div className="timers">
                    <h5>Início:</h5>
                    <input type="time" />
                    <h5>às</h5>
                    <h5>Final:</h5>
                    <input type="time" />
                  </div>
                  <div className="days-week">
                    seg,ter,qua
                  </div>
                </main>
                <div className="area-btn">
                  <button>Editar</button>
                  <button>Confirmar</button>
                </div>
              </Modal>
            </>
          )
      }
    </>
  )
}