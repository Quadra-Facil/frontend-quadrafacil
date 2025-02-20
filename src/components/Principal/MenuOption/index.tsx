import "./style-menuOption.css"
import LogoQuadra from "../../../img/logomarca.svg"
import { FiMenu, FiX } from "react-icons/fi";
import ReserveIcon from "./img/reserveIcon.svg"
import LicencaIcon from "./img/licencaIcon.svg"
import ArenaIcon from "./img/arenaIcon.svg"
import ClientsIcon from "./img/icon-clients.svg"
import DashIcon from "./img/icon-dashboard.svg"
import RelatorioIcon from "./img/icon-relatorio.svg"
import SpaceIcon from "./img/icon-space.svg"
import FiSettings from "./img/FiSettings.svg"
import { useNavigate } from "react-router-dom";
import { FormEvent, useContext, useEffect, useState } from "react";
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
    planExpiry: string; // Use 'Date' se você transformar essa string em um objeto de data posteriormente
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

interface Space {
  $id: string;
  spaceId: number;
  name: string;
  status: string;
  sports: string; // A chave 'sports' contém uma string com esportes separados por vírgula
  arenaId: number;
}

// Definindo a interface para o formato da resposta da API
interface ApiResponse {
  $id: string;
  $values: Space[];
}


export default function MenuOption() {
  const navigate = useNavigate();
  const [modalIsOpenLicence, setIsOpenLicence] = useState<boolean>(false);
  const [modalIsOpenSpace, setIsOpenSpace] = useState<boolean>(false);
  const [modalIsOpenSpaceStatus, setIsOpenSpaceStatus] = useState<boolean>(false);
  const [dataPlan, setDataPlan] = useState<GetPlanResponse | null>(null)
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [space, setSpace] = useState<string>('');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [spacesData, seTSpacesData] = useState<SpaceResponse | null>(null);
  const [isChecked, setIsChecked] = useState<string>('')

  const [arenaData, setArenaData] = useState<ArenaData | null>(null);
  const [esportes, setEsportes] = useState<String[]>([]);


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
  }, [modalIsOpenSpaceStatus])

  //get value checkbox arena
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;

    setSelectedSports((prevSelectedSports) => {
      const updatedSports = checked
        ? [...prevSelectedSports, value] // Adiciona ao array se marcado
        : prevSelectedSports.filter((sport) => sport !== value); // Remove do array se desmarcado

      return updatedSports;
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
      const checksConvert = selectedSports.join(", ",)

      await api.post("/api/newSpace", {
        name: space,
        sports: checksConvert,
        arenaId: user?.arena
      }).then(() => {
        setSendTitle('success');
        setSendMessage(`Quadra inserida.`);
        setIsLoading(false);
        setSelectedSports([])
      }).catch((error) => {
        setSendTitle('error');
        setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
        setIsLoading(false);
      })
    }
  }

  // style modal licence
  const customStylesModalLicence = {
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
  // style modal licence
  const customStylesModalSpace = {
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
      height: '55vh',
      maxWidth: '90%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };
  // style modal licence
  const customStylesModalSpaceStatus = {
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
      width: '55vw',
      height: '60vh',
      maxWidth: '90%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

  function openModalLicence() {
    setIsOpenLicence(true);   // Abre o modal
  }
  function openModalSpace() {
    setIsOpenSpace(true);   // Abre o modal
  }
  function openModalSpaceStatus() {
    setIsOpenSpaceStatus(true);   // Abre o modal
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

  //função para carpturar o status do botão 
  const handleToggleStatus = async (spaceId: number, status: string) => {

    setIsLoading(true)

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
    })
  }

  //dados de arena para o admin carregar para reservas
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
  }, [])

  useEffect(() => {
    async function getSports() {
      try {
        const response = await api.post("/api/newSpace/get-spaces", {
          arenaId: user?.arena // Aqui você deve garantir que o valor de `user?.arena` está correto
        });

        // Verifique se a resposta possui os dados esperados
        const dados = response?.data?.$values;

        // Pegando todos os esportes, dividindo e removendo repetições
        const esportesArray: string[] = [];

        dados?.forEach((item: { sports: string }) => {
          // Dividindo a string 'sports' em um array de esportes
          const esportesSeparados = item.sports.split(',').map((sport: string) => sport.trim());

          // Adicionando esportes ao array, garantindo que não haja repetições
          esportesArray.push(...esportesSeparados);
        });

        // Remover duplicatas usando Set
        const esportesUnicos = [...new Set(esportesArray)];

        // Atualizando o estado com os esportes únicos
        setEsportes(esportesUnicos);
      } catch (error: any) {
        console.error(error?.response?.data);
      }
    }

    getSports();
  }, []); // Recarrega quando o componente for montado


  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {
        isLoading ?
          <Loading />
          : (
            <>
              <nav className="menu">
                <section className="area-logo-btnMenu">
                  <img src={LogoQuadra} alt="Logo" />
                  <FiMenu size={35} color="#868682" style={{ cursor: "pointer" }} />
                </section>

                <section className="menu-item-reserve" onClick={user?.role === "client" ? () => navigate("/searchArena") : () => { }}>
                  <section className="menu-item">
                    <img src={ReserveIcon} alt="Icon" width={28} height={28} />
                    <strong>Reservas</strong>
                  </section>
                  {
                    user?.role !== "client" && (
                      <div className="type-reserve">
                        <div className="area-btn">
                          <p title="Cria uma reserva sem recorrência"
                            onClick={() => navigate('/reserve', {
                              state: {
                                arenaId: user?.arena,
                                arena: `${arenaData?.name} - ${arenaData?.adressArenas.$values[0].state}-${arenaData?.adressArenas.$values[0].city}`,
                                sports: esportes,
                                GetvalueHour: arenaData?.valueHour
                              }
                            })
                            }
                          >
                            Avulsa
                            <BsEmojiSunglasses />
                          </p>
                          <p title="Cria uma reserva para um dia em toda semana" onClick={
                            () => navigate("/reserve-fixed", {
                              state: {
                                sports: esportes,
                              }
                            })
                          }>
                            Fixa
                            <MdOutlinePushPin />
                          </p>
                        </div>
                      </div>
                    )
                  }
                </section>


                {
                  user?.role === "dev" && (
                    <>
                      <section className="menu-item" onClick={() => { navigate("/arena") }}>
                        <div className="divider-item"></div>
                        <img src={ArenaIcon} alt="Icon" width={28} height={28} />
                        <strong>Arena</strong>
                      </section>
                    </>
                  )
                }

                {
                  user?.role !== "client" && (
                    <>
                      <section className="menu-item" onClick={() => openModalSpace()}>
                        <div className="divider-item"></div>
                        <img src={SpaceIcon} alt="Icon" width={28} height={28} />
                        <strong>Espaço</strong>
                      </section>
                    </>
                  )
                }

                {
                  user?.role !== "client" && (
                    <>
                      <section className="menu-item" onClick={() => openModalLicence()}>
                        <div className="divider-item"></div>
                        <img src={LicencaIcon} alt="Icon" width={28} height={28} />
                        <strong>Licença</strong>
                      </section>
                    </>
                  )
                }

                {
                  user?.role === "dev" && (
                    <>
                      <section className="menu-item" onClick={() => navigate("/client")}>
                        <div className="divider-item"></div>
                        <img src={ClientsIcon} alt="Icon" width={28} height={28} />
                        <strong>Clientes</strong>
                      </section>
                    </>
                  )
                }

                {
                  user?.role !== "client" && (
                    <>
                      <section className="menu-item">
                        <div className="divider-item"></div>
                        <img src={DashIcon} alt="Icon" width={28} height={28} />
                        <strong>Dashboard</strong>
                      </section>
                    </>
                  )
                }

                {
                  user?.role !== "client" && (
                    <>
                      <section className="menu-item" onClick={() => navigate("/reserved")}>
                        <div className="divider-item"></div>
                        <img src={RelatorioIcon} alt="Icon" width={28} height={28} />
                        <strong>Relatórios</strong>
                      </section>
                    </>
                  )
                }

                {
                  user?.role !== "client" && (
                    <>
                      <section className="menu-item" onClick={() => navigate("/configArena")}>
                        <div className="divider-item"></div>
                        <img src={FiSettings} alt="Icon" width={28} height={28} />
                        <strong>Configurações</strong>
                      </section>
                    </>
                  )
                }

              </nav>

              {/* Modal licence */}
              <Modal
                isOpen={modalIsOpenLicence}
                onRequestClose={closeModalLicence}
                style={customStylesModalLicence}
                shouldCloseOnOverlayClick={false}
              >
                <header className="header-modal">
                  <div className="header-arena-licence">
                    <h5>Licença de uso</h5>
                  </div>
                  <div className="area-close" onClick={closeModalLicence}>
                    <FiX size={24} />
                  </div>
                </header>
                <main className="main-modal-licence">
                  <div className="area-first">
                    <h5><strong>Arena:</strong> {dataPlan?.arenaName} </h5>
                    <h5><strong>Plano Atual:  </strong>{dataPlan?.getPlan.planSelect}</h5>
                  </div>
                  <div className="area-second">
                    <h5><strong>Vencimento:  </strong>
                      {
                        dataPlan?.getPlan.planExpiry ?
                          new Date(dataPlan?.getPlan.planExpiry).toLocaleDateString("pt-br")
                          : "sem data"
                      }
                    </h5>
                    <h5><strong>Status plano: </strong> {dataPlan?.getPlan.status}</h5>
                  </div>
                </main>
                <div className="area-btn">
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
                <header className="header-modal">
                  <div className="header-arena-space">
                    <h5>Espaços, Quadras, Campo...</h5>
                  </div>
                  <div className="area-close" onClick={closeModalSpace}>
                    <FiX size={24} />
                  </div>
                </header>
                <main className="main-modal-space">
                  <div className="area-first">
                    <h5>Novo Espaço:</h5>
                    <input
                      type="text"
                      placeholder="Quadra 1"
                      onChange={e => setSpace(e.target.value)}
                    />
                  </div>
                  <div className="area-second">
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
                <div className="area-btn">
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
                <header className="header-modal">
                  <div className="header-arena-space">
                    <h5>Seus Espaços</h5>
                  </div>
                  <div className="area-close" onClick={closeModalSpaceStatus}>
                    <FiX size={24} />
                  </div>
                </header>
                <main className="main-modal-space-status">
                  <table style={{ width: '100%', fontWeight: 300 }}>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Espaços</th>
                        <th>Esportes</th>
                        <th>Ativar/Desativar</th>
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
                                padding: "1% 10%",
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
          )
      }
    </>
  )
}