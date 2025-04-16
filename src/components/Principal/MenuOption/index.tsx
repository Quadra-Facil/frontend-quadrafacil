import "./style-menuOption.css";
import LogoQuadra from "../../../img/logomarca.svg";
import { FiMenu, FiX } from "react-icons/fi";
import ReserveIcon from "./img/reserveIcon.svg";
import LicencaIcon from "./img/licencaIcon.svg";
import ArenaIcon from "./img/arenaIcon.svg";
import ClientsIcon from "./img/icon-clients.svg";
import DashIcon from "./img/icon-dashboard.svg";
import RelatorioIcon from "./img/icon-relatorio.svg";
import SpaceIcon from "./img/icon-space.svg";
import FiSettings from "./img/FiSettings.svg";
import { useNavigate } from "react-router-dom";
import { FormEvent, useContext, useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { api } from "../../../services/axiosApi/apiClient";
import { AuthContext } from "../../../services/contexts/AuthContext";
import { DatePickerReserve } from "../../DatePickerReserve";
import DatePickerHourReserved from "../../DatePickerHourReserved";
import { MdOutlinePushPin } from "react-icons/md";
import { BsEmojiSunglasses } from "react-icons/bs";
import ModalReserveFixed from "../../ModalReserveFixed";

interface GetPlanResponse {
  id: string;
  getPlan: {
    id: number;
    planSelect: string;
    planExpiry: string;
    arenaId: number;
    status: string;
  };
  arenaName: string;
}

interface Space {
  spaceId: number;
  name: string;
  sports: string;
  status: string;
  arenaId: number;
}

interface SpaceResponse {
  $id: string;
  $values: Space[];
}

interface Arena {
  $ref: string;
}

interface Address {
  $id: string;
  id: number;
  state: string;
  city: string;
  street: string;
  neighborhood: string;
  number: number;
  reference: string;
  arenaId: number;
  arena: Arena;
}

interface AddressArenas {
  $id: string;
  $values: Address[];
}

interface ArenaData {
  $id: string;
  id: number;
  name: string;
  phone: string;
  status: string;
  valueHour: number;
  adressArenas: AddressArenas;
}

export default function MenuOption() {
  const navigate = useNavigate();
  const [modalIsOpenLicence, setIsOpenLicence] = useState<boolean>(false);
  const [modalIsOpenSpace, setIsOpenSpace] = useState<boolean>(false);
  const [modalIsOpenSpaceStatus, setIsOpenSpaceStatus] = useState<boolean>(false);
  const [dataPlan, setDataPlan] = useState<GetPlanResponse | null>(null);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [space, setSpace] = useState<string>('');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [spacesData, seTSpacesData] = useState<SpaceResponse | null>(null);
  const [arenaData, setArenaData] = useState<ArenaData | null>(null);
  const [esportes, setEsportes] = useState<String[]>([]);
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const reserveRef = useRef<HTMLDivElement>(null);

  const reserveTimeoutRef = useRef<any>();

  const authContext = useContext(AuthContext);
  const { user }: any = authContext;

  useEffect(() => {
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle('');
        setSendMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sendTitle, sendMessage]);

  useEffect(() => {
    localStorage.removeItem('EmailForgot');
  }, [])

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.post<GetPlanResponse>("/api/Plan/getplan-user", {
          arenaId: 1
        });
        setDataPlan(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPlan();
  }, []);

  useEffect(() => {
    async function getSpaces() {
      await api.post<SpaceResponse>("/api/newSpace/get-spaces", {
        arenaId: user?.arena
      }).then((response) => {
        seTSpacesData(response.data);
      }).catch((error) => {
        setSendTitle('error');
        setSendMessage(error.response?.data?.erro || 'Erro ao buscar espaços');
        setIsLoading(false);
      })
    }
    getSpaces();
  }, [modalIsOpenSpaceStatus]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reserveRef.current && !reserveRef.current.contains(event.target as Node)) {
        setIsReserveOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function getDataArena() {
      await api.post('/api/Arena/getArena', {
        arenaId: user?.arena
      }).then((response) => {
        setArenaData(response?.data)
      }).catch((error: any) => {
        console.error(error?.response?.data)
      })
    }
    getDataArena();
  }, []);

  useEffect(() => {
    async function getSports() {
      try {
        const response = await api.post("/api/newSpace/get-spaces", {
          arenaId: user?.arena
        });
        const dados = response?.data?.$values;
        const esportesArray: string[] = [];

        dados?.forEach((item: { sports: string }) => {
          const esportesSeparados = item.sports.split(',').map((sport: string) => sport.trim());
          esportesArray.push(...esportesSeparados);
        });

        const esportesUnicos = [...new Set(esportesArray)];
        setEsportes(esportesUnicos);
      } catch (error: any) {
        console.error(error?.response?.data);
      }
    }
    getSports();
  }, []);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setSelectedSports((prevSelectedSports) => {
      return checked
        ? [...prevSelectedSports, value]
        : prevSelectedSports.filter((sport) => sport !== value);
    });
  };

  async function handleNewSpace(e: FormEvent) {
    e.preventDefault();
    if (selectedSports.length === 0) {
      setSendTitle('error');
      setSendMessage(`Selecione os esportes.`);
      return;
    } else if (space == "") {
      setSendTitle('error');
      setSendMessage(`Preencha o espaço.`);
      return;
    } else if (space.length < 5) {
      setSendTitle('error');
      setSendMessage(`Nome do espaço muito curto`);
      return;
    } else {
      setIsLoading(true);
      const checksConvert = selectedSports.join(", ");

      await api.post("/api/newSpace", {
        name: space,
        sports: checksConvert,
        arenaId: user?.arena
      }).then(() => {
        setSendTitle('success');
        setSendMessage(`Quadra inserida.`);
        setIsLoading(false);
        setSelectedSports([]);
      }).catch((error) => {
        setSendTitle('error');
        setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
        setIsLoading(false);
      });
    }
  }

  const handleToggleStatus = async (spaceId: number, status: string) => {
    setIsLoading(true);
    await api.put("/api/newSpace/edit-space", {
      spaceId: Number(spaceId),
      status: status === "Disponível" ? "Indisponível" : "Disponível"
    }).then(() => {
      setSendTitle('success');
      setSendMessage(`Status alterado.`);
      setIsLoading(false);
      closeModalSpaceStatus();
    }).catch((error) => {
      setSendTitle('error');
      setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
      setIsLoading(false);
    });
  };

  const customStylesModalLicence = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#ff0',
      borderRadius: '10px',
      padding: '0',
      width: '97%',
      maxWidth: '600px',
      border: 'none',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000
    }
  };

  const customStylesModalSpace = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff9f7',
      borderRadius: '10px',
      padding: '0',
      width: '100%',
      maxWidth: '600px',
      border: 'none',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000
    }
  };

  const customStylesModalSpaceStatus = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      borderRadius: '30px',
      padding: '0',
      width: '95%',
      maxWidth: '800px',
      border: 'none',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      overflow: 'hidden'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000
    }
  };

  function openModalLicence() {
    setIsOpenLicence(true);
  }
  function openModalSpace() {
    setIsOpenSpace(true);
  }
  function openModalSpaceStatus() {
    setIsOpenSpaceStatus(true);
  }
  function closeModalLicence() {
    setIsOpenLicence(false);
  }
  function closeModalSpace() {
    setIsOpenSpace(false);
  }
  function closeModalSpaceStatus() {
    setIsOpenSpaceStatus(false);
  }

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {isLoading ? <Loading /> : (
        <>
          <nav className="menu">
            <section className="area-logo-btnMenu">
              <img src={LogoQuadra} alt="Logo" onClick={() => navigate('/principal')} style={{ cursor: 'pointer' }} />
            </section>

            <section
              className={`menu-item-reserve ${isReserveOpen ? 'active' : ''}`}
              onMouseEnter={() => {
                clearTimeout(reserveTimeoutRef.current);
                setIsReserveOpen(true);
              }}
              onMouseLeave={() => {
                reserveTimeoutRef.current = setTimeout(() => {
                  setIsReserveOpen(false);
                }, 300);
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (user?.role === "client") {
                  navigate("/searchArena");
                } else {
                  setIsReserveOpen(!isReserveOpen);
                }
              }}
            >
              <section className="menu-item">
                <img src={ReserveIcon} alt="Icon" width={28} height={28} />
                <strong>Reservas</strong>
              </section>
              {user?.role !== "client" && (
                <div className="type-reserve" onClick={(e) => e.stopPropagation()}>
                  <div className="area-btn">
                    <p title="Cria uma reserva sem recorrência"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/reserve', {
                          state: {
                            arenaId: user?.arena,
                            arena: `${arenaData?.name} - ${arenaData?.adressArenas.$values[0].state}-${arenaData?.adressArenas.$values[0].city}`,
                            sports: esportes,
                            GetvalueHour: arenaData?.valueHour
                          }
                        });
                        setIsReserveOpen(false);
                      }}
                    >
                      Avulsa
                      <BsEmojiSunglasses />
                    </p>
                    <p title="Cria uma reserva para um dia em toda semana"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/reserve-fixed", {
                          state: { sports: esportes }
                        });
                        setIsReserveOpen(false);
                      }}
                    >
                      Fixa
                      <MdOutlinePushPin />
                    </p>
                  </div>
                </div>
              )}
            </section>



            {user?.role === "dev" && (
              <section className="menu-item" onClick={() => { navigate("/arena") }}>
                <div className="divider-item"></div>
                <img src={ArenaIcon} alt="Icon" width={28} height={28} />
                <strong>Arena</strong>
              </section>
            )}

            {user?.role !== "client" && (
              <section className="menu-item" onClick={() => openModalSpace()}>
                <div className="divider-item"></div>
                <img src={SpaceIcon} alt="Icon" width={28} height={28} />
                <strong>Espaço</strong>
              </section>
            )}

            {user?.role !== "client" && (
              <section className="menu-item" onClick={() => openModalLicence()}>
                <div className="divider-item"></div>
                <img src={LicencaIcon} alt="Icon" width={28} height={28} />
                <strong>Licença</strong>
              </section>
            )}

            {user?.role === "dev" && (
              <section className="menu-item" onClick={() => navigate("/client")}>
                <div className="divider-item"></div>
                <img src={ClientsIcon} alt="Icon" width={28} height={28} />
                <strong>Clientes</strong>
              </section>
            )}

            {user?.role !== "client" && (
              <section className="menu-item" onClick={() => navigate('/dashboard')}>
                <div className="divider-item"></div>
                <img src={DashIcon} alt="Icon" width={28} height={28} />
                <strong>Dashboard</strong>
              </section>
            )}

            {user?.role !== "client" && (
              <section className="menu-item" onClick={() => navigate("/billing")}>
                <div className="divider-item"></div>
                <img src={RelatorioIcon} alt="Icon" width={28} height={28} />
                <strong>Relatórios</strong>
              </section>
            )}

            {user?.role !== "client" && (
              <section className="menu-item" onClick={() => navigate("/configArena")}>
                <div className="divider-item"></div>
                <img src={FiSettings} alt="Icon" width={28} height={28} />
                <strong>Configurações</strong>
              </section>
            )}
          </nav>

          {/* Modal licence */}
          <Modal
            isOpen={modalIsOpenLicence}
            onRequestClose={closeModalLicence}
            style={customStylesModalLicence}
            shouldCloseOnOverlayClick={false}
          >
            <header className="header-modal-licence">
              <div className="header-arena-licence">
                <h5>Licença de uso</h5>
              </div>
              <div className="area-close-licence" onClick={closeModalLicence}>
                <FiX size={24} />
              </div>
            </header>
            <main className="main-modal-licence">
              <div className="area-first-licence">
                <h5><strong>Arena:</strong> {dataPlan?.arenaName} </h5>
                <h5><strong>Plano Atual:  </strong>{dataPlan?.getPlan.planSelect}</h5>
              </div>
              <div className="area-second-licence">
                <h5><strong>Vencimento:  </strong>
                  {dataPlan?.getPlan.planExpiry ?
                    new Date(dataPlan?.getPlan.planExpiry).toLocaleDateString("pt-br")
                    : "sem data"}
                </h5>
                <h5><strong>Status plano: </strong> {dataPlan?.getPlan.status}</h5>
              </div>
            </main>
            <div className="area-btn-licence">
              <button>Mudar Plano</button>
            </div>
          </Modal>

          {/* Modal space*/}
          <Modal
            isOpen={modalIsOpenSpace}
            onRequestClose={closeModalSpace}
            style={customStylesModalSpace}
            shouldCloseOnOverlayClick={false}
          >
            <header className="header-modal-space">
              <div className="header-arena-space">
                <h5>Espaços, Quadras, Campo...</h5>
              </div>
              <div className="area-close-space" onClick={closeModalSpace}>
                <FiX size={24} />
              </div>
            </header>
            <main className="main-modal-space">
              <div className="area-first-space">
                <h5>Novo Espaço:</h5>
                <input
                  type="text"
                  placeholder="Quadra 1"
                  onChange={e => setSpace(e.target.value)}
                />
              </div>
              <div className="area-second-space">
                <h5>Selecione os esportes para esta quadra:</h5>
                <div>
                  <input type="checkbox" name="Futevôlei" id="futevolei" value="Futevôlei" onChange={handleCheckboxChange} />
                  <label htmlFor="futevolei">Futevôlei</label>
                </div>
                <div>
                  <input type="checkbox" name="Beach Tênis" id="beachtenis" value="Beach Tênis" onChange={handleCheckboxChange} />
                  <label htmlFor="beachtenis">Beach Tênis</label>
                </div>
                <div>
                  <input type="checkbox" name="Vôlei de areia" id="voleiDeAreia" value="Vôlei de areia" onChange={handleCheckboxChange} />
                  <label htmlFor="voleiDeAreia">Vôlei de areia</label>
                </div>
                <div>
                  <input type="checkbox" name="Futebol" id="futebol" value="Futebol" onChange={handleCheckboxChange} />
                  <label htmlFor="futebol">Futebol</label>
                </div>
                <div>
                  <input type="checkbox" name="Basquete" id="basquete" value="Basquete" onChange={handleCheckboxChange} />
                  <label htmlFor="basquete">Basquete</label>
                </div>
                <div>
                  <input type="checkbox" name="Futsal" id="futsal" value="Futsal" onChange={handleCheckboxChange} />
                  <label htmlFor="futsal">Futsal</label>
                </div>
                <div>
                  <input type="checkbox" name="Vôlei de Quadra" id="voleidequadra" value="Vôlei de Quadra" onChange={handleCheckboxChange} />
                  <label htmlFor="Vôlei de Quadra">Vôlei de Quadra</label>
                </div>
              </div>
            </main>
            <div className="area-btn-space">
              <button onClick={handleNewSpace}>Adicionar</button>
              <button onClick={openModalSpaceStatus}>Mostrar Espaços</button>
            </div>
          </Modal>

          {/* Modal mostrar space*/}
          <Modal
            isOpen={modalIsOpenSpaceStatus}
            onRequestClose={closeModalSpaceStatus}
            style={customStylesModalSpaceStatus}
            shouldCloseOnOverlayClick={false}
          >
            <header className="header-modal-show-spaces">
              <div className="header-arena-show-spaces">
                <h5>Seus Espaços</h5>
              </div>
              <div className="area-close-show-spaces" onClick={closeModalSpaceStatus}>
                <FiX size={24} />
              </div>
            </header>
            <main className="main-modal-show-spaces">
              <table style={{ width: '100%', fontWeight: 300 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>Id</th>
                    <th style={{ textAlign: 'center' }}>Espaços</th>
                    <th style={{ textAlign: 'center' }}>Esportes</th>
                    <th style={{ textAlign: 'center' }}>Ativar/Desativar</th>
                  </tr>
                </thead>
                <tbody>
                  {spacesData?.$values.map((item) => (
                    <tr key={item.spaceId}>
                      <td style={{ textAlign: 'center' }}>{item.spaceId}</td>
                      <td style={{ textAlign: 'center' }}>{item.name}</td>
                      <td>{item.sports}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() =>
                            handleToggleStatus(
                              item.spaceId,
                              item.status === "Disponível" ? "Disponível" : "Indisponível"
                            )
                          }
                          style={{
                            backgroundColor: item.status === "Disponível" ? "#e49e9e" : "#8ce49c",
                            padding: "5% 10%",
                            borderRadius: "10px",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {item.status === "Disponível" ? "Desativar" : "Ativar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </main>
          </Modal>
        </>
      )}
    </>
  );
}