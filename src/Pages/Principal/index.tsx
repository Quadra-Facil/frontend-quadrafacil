import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../services/contexts/AuthContext";
import MenuOption from "../../components/Principal/MenuOption";
import "./style-principal.css";
import UserIcon from "./img/user.svg";
import SettingsIcon from "./img/FiSettings.svg";
import IconInstagran from "./img/FiInstagram.svg";
import IconWatsApp from "./img/FiMessageSquare.svg";
import Modal from "react-modal";
import Logo from "../../img/logomarca.svg";
import Icon1 from "./img/IoTimeOutline.svg";
import Icon2 from "./img/IoFlameOutline.svg";

import { FiActivity, FiFilter, FiRefreshCcw, FiSearch, FiX } from "react-icons/fi";
import { api } from "../../services/axiosApi/apiClient";

import { format, isBefore, parseISO } from "date-fns";
import Loading from "../../components/Loading";
import { LuFilterX } from "react-icons/lu";
import { ptBR } from "date-fns/locale";

import 'react-vertical-timeline-component/style.min.css';
import TimeLinePrincipal from "../../components/Principal/TimeLinePrincipal";
import CarrosselClient from "../../components/Principal/Carrousel-client";
import { useNavigate } from "react-router-dom";
import { BsFilePdf } from "react-icons/bs";
import { Tooltip } from 'react-tooltip'

interface DataProgram {
  id: number;
  startDate: Date | any;
  endDate: Date | any;
  reason: string;
}

interface Arena {
  $id: string;
  id: number;
  name: string;
  phone: string;
  valueHour: number;
  spaceId: number;
}

interface Reserva {
  $id: string;
  id_reserve: number;
  dataReserve: string;
  name: string;
  spaceId: number;
  arenaId: number;
  timeInitial: string;
  timeFinal: string;
  observation: string;
  typeReserve: string;
  promotion: boolean;
  promotionType: string | null;
  userName: string;
  phone: string;
  role: string;
}

interface ApiResponseReserve {
  $id: string;
  arenaName: Arena;
  reservas: {
    $id: string;
    $values: Reserva[]; // Array de reservas
  };
}

interface Space {
  $id: string;
  spaceId: number;
  name: string;
  status: string;
  sports: string;
  arenaId: number;
}

interface ApiResponseSpaces {
  $id: string;
  $values: Space[];
}

interface ReserveSpace {
  $id: string;
  id_reserve: number;
  userId: number;
  arenaId: number;
  spaceId: number;
  dataReserve: string;
  timeInitial: string;
  timeFinal: string;
  status: string;
  typeReserve: string;
  promotion: boolean;
  promotionType: string;
  observation: string;
  value: number;
}

interface ReserveClient {
  $id: string;
  $values: Reserva[];
}

interface PlanData {
  $id: string;
  getPlan: {
    $id: string;
    id: number;
    planSelect: "mensal" | "anual" | string; // string genérico caso hava outros tipos
    planExpiry: string; // ou Date se você converter para objeto Date
    arenaId: number;
    status: "ativo" | "inativo" | string; // string genérico para outros status
  };
  arenaName: string;
}

export default function Principal() {
  const authContext = useContext(AuthContext);
  const { user, logout }: any = authContext;

  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [isloading, setLoading] = useState<boolean>(true);
  const [classAreaUser, setClassAreaUser] = useState(false);
  const [Arena, setArena] = useState<string>('');

  const [dataDesativeProgrma, setDataDesativeProgrma] = useState<DataProgram[]>();
  const [dataReserves, setDataReserves] = useState<ApiResponseReserve | null>(null);
  const [dataReservesClient, setDataReservesClient] = useState<Reserva[]>([]);

  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today.toString());
  const [spaces, setSpaces] = useState<ApiResponseSpaces | null>(null);
  const [reserveSpace, setReserveSpace] = useState<ReserveSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isOpenInforme, setIsOpenInforme] = useState<boolean>(false);
  const [dataReserveCard, setDataReserveCard] = useState<Reserva>();
  const [getSpaceCard, setGetSpaceCard] = useState<Space[]>([]);
  const [getNameSpaceAdmin, setgetNameSpaceAdmin] = useState('');
  const [showReserve, setShowReserve] = useState(false);
  const [isPlanExpired, setIsPlanExpired] = useState(false)
  const [planArena, setPlanArean] = useState("");
  const [dataExpire, setDataExpire] = useState("");

  const navigate = useNavigate();

  const customStylesModalInforme = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fae6e6',
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
  const customStylesModalPlanExpired = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fae6e6',
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

  function openModalDetails() {
    setIsOpenInforme(true);
  }

  function closeModalDetails() {
    setIsOpenInforme(false);
  }
  function openModalExpired() {
    setIsPlanExpired(true);
  }

  function closeModalExpired() {
    setIsPlanExpired(false);
    localStorage.removeItem("authToken");
    window.location.reload();

    // so para não dar erro 
    sendTitle;
    sendMessage;
    setArena("")
    dataDesativeProgrma;
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setDate(newDate);
    setDataReservesClient([]);
    setDataReserves(null);
    loadReserves(newDate);
  };

  useEffect(() => {
    async function GetDatePlan() {
      try {
        const dataEquals = await api.post<PlanData>("/api/Plan/getplan-user", {
          arenaId: user?.arena
        });
        // console.log(dataEquals?.data?.getPlan[0]?.planExpire)
        // console.log(dataEquals?.data?.getPlan.planExpiry)

        const planExpiry = dataEquals?.data?.getPlan?.planExpiry;

        setPlanArean(dataEquals?.data?.getPlan?.planSelect)
        setDataExpire(dataEquals?.data?.getPlan?.planExpiry)

        if (planExpiry) {
          const expiryDate = parseISO(planExpiry); // Converte string ISO para Date
          const today = new Date();

          // Remove a parte de horas, minutos, segundos e milissegundos para comparar apenas as datas
          const expiryDateOnly = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
          const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

          // Verifica se hoje é depois do dia de expiração (ou seja, pelo menos um dia após)
          const isExpired = isBefore(expiryDateOnly, todayOnly);

          if (isExpired) {
            openModalExpired();
          } else {
            console.log("Licença válida.");
            setPlanArean(dataEquals?.data?.getPlan?.planSelect);
            setDataExpire(dataEquals?.data?.getPlan?.planExpiry);
          }
        }

      } catch (error: any) {
        console.log("Erro ao buscar datas: ", error);
      }
    }

    if (user && user.role !== "client" && user.role !== "dev") {
      GetDatePlan();
    }
  }, [user]); // Adicione user como dependência

  useEffect(() => {
    const fetchDesativeProgram = async () => {
      try {
        const response = await api.post("/api/DesativeProgram/get", {
          arenaId: user?.arena
        });

        if (response?.data?.$values?.length > 0) {
          setDataDesativeProgrma(response?.data?.$values);
        }
      } catch (error) {
        console.error('Erro ao verificar o status da arena:', error);
      }
    };

    if (user?.role !== "client" && user?.role !== "dev") {
      fetchDesativeProgram();
    }
  }, [user]);

  const loadReserves = async (date: string) => {
    setLoading(true);

    if (user?.role === 'client') {
      try {
        const response = await api.post<ReserveClient>("/getReserves/client", {
          clientId: Number(user?.userId),
          dataReserve: date,
        });
        setDataReservesClient(response.data.$values);
      } catch (error) {
        setSendTitle("error");
        setSendMessage("Erro ao carregar as reservas.");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const resp = await api.post<ApiResponseReserve>("/getReserve/arena/data", {
          arenaId: Number(user?.arena),
          dataReserve: date,
        });

        if (resp?.data?.reservas?.$values?.length > 0) {
          const updatedData: ApiResponseReserve = {
            $id: resp?.data?.$id,
            arenaName: resp?.data?.arenaName,
            reservas: {
              $id: resp?.data?.reservas?.$id,
              $values: resp?.data?.reservas?.$values,
            },
          };
          setDataReserves(updatedData);
        } else {
          setDataReserves(null);
        }
      } catch (error) {
        setSendTitle("error");
        setSendMessage("Erro ao carregar as reservas.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadReserves(date);
  }, [date, user?.arena]);

  const refreshReserves = () => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    loadReserves(formattedDate);
  };

  async function loadSpaces() {
    if (user?.role !== 'client') {
      try {
        const response = await api.post("/api/newSpace/get-spaces", {
          arenaId: user?.arena
        })
        setSpaces(response.data)
      } catch (error: any) {
        setSendTitle("error")
        setSendMessage(error.response.data)
      }
    }
  }

  useEffect(() => {
    loadSpaces();
  }, [user?.arena])

  async function handleSpace(id: number) {
    setSelectedSpace(id);
    try {
      const response = await api.post<ReserveSpace>("/getReserves/date", {
        arenaId: Number(user?.arena),
        spaceId: Number(id),
        dataReserve: date
      });

      if (Array.isArray(response.data)) {
        setReserveSpace(response.data);
      } else {
        setReserveSpace([response.data]);
      }
    } catch (error: any) {
      setSendTitle('error');
      setSendMessage(error.response.data);
    }
  }

  useEffect(() => {
    if (!dataReserveCard) return;

    const fetchSpaceData = async () => {
      setLoading(true);
      try {
        const getSpace = await api.post('/api/newSpace/search/space/id', {
          arenaId: dataReserveCard?.arenaId,
          spaceId: dataReserveCard?.spaceId
        });
        setGetSpaceCard(getSpace.data.$values);
      } catch (error) {
        console.log("Erro ao buscar spaces: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaceData();
  }, [dataReserveCard]);

  const handleDetails = (item: any) => {
    openModalDetails();
    setDataReserveCard(item);
    setgetNameSpaceAdmin(item.name)
  };

  if (isloading) {
    return <Loading />;
  }

  async function deleteReserve() {
    try {
      setLoading(true)

      await api.delete("/delete-reserve-id", {
        data: {
          reserveId: Number(dataReserveCard?.id_reserve)
        }
      })

      closeModalDetails();
      window.location.reload();
      // chamar a state que popula os cards

      setLoading(false)
    } catch (error) {
      setSendTitle("error");
      setSendMessage("Erro ao cancelar reserva.")
      setLoading(false)
    }
  }

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
              onMouseEnter={() => setClassAreaUser(true)}
            />
          </div>

          <div className="area-secundary">
            <section className="area-btn-input">
              {user?.role !== 'client' && (
                <div className="button-area">
                  <div className="button-area-nova">
                    <button className="button-nova" onClick={() => navigate('/billing')}
                      data-tooltip-id="insta"
                      data-tooltip-content="Relatórios"
                      data-tooltip-place="bottom"
                    >
                      <BsFilePdf size={20} />
                      Relatório
                    </button>
                  </div>
                  <div className="button-area-dashboard">
                    <button className="button-dash" onClick={() => navigate("/dashboard")}
                      data-tooltip-id="insta"
                      data-tooltip-content="Gráficos e métricas"
                      data-tooltip-place="bottom"
                    >
                      <FiActivity size={20} />
                      Dashboard
                    </button>
                  </div>
                </div>
              )}

              <div className="area-search" style={user?.role === 'client' ? { marginTop: 30 } : {}}>
                <input type="text" placeholder="Pesquise itens do menu" />
                <button className="search-icon" onClick={() => alert("Estamos tabalhando nisso...")}>
                  <FiSearch size={32} color="#8a8888"
                  />
                </button>
              </div>
            </section>

            <div className="area-user" onMouseLeave={() => setClassAreaUser(false)}
              style={{
                display: classAreaUser ? 'flex' : 'none',
                opacity: classAreaUser ? 1 : 0,
                visibility: classAreaUser ? 'visible' : 'hidden',
              }}>
              <p>{user?.role !== 'client' ? Arena : user?.userName}</p>
              <div className="area-config" onClick={() => alert("Em desenvolvimento...")}>
                <img src={SettingsIcon} alt="" />
                <p>Configurações</p>
              </div>
              <button onClick={() => logout()}>Sair</button>
            </div>
          </div>

          <div className={user?.role === 'client' ? 'context-client' : 'context'}>
            {user?.role !== 'client' && (
              <>
                <h4
                  style={{
                    fontWeight: '300',
                    marginTop: '10px',
                    textAlign: 'center',
                    textDecoration: 'underline',
                    textDecorationColor: '#f7cebe'
                  }}
                >Sua linha do tempo hoje - {format(new Date(), 'dd/MM/yyyy')}</h4>
                <TimeLinePrincipal />
              </>
            )}

            {user?.role === 'client' && (
              <CarrosselClient />
            )}
          </div>

          <div className="area-social">
            <div className="area-img" data-tooltip-id="insta"
              data-tooltip-content="Instagram"
              data-tooltip-place="top"
              onClick={() => window.location.href = "https://instagram.com/appquadrafacil"}
            >

              <img src={IconInstagran} alt="icon" width={35}
              />
            </div>
            <div className="area-img"
              data-tooltip-id="insta"
              data-tooltip-content="Atendimento"
              data-tooltip-place="top"
              onClick={() => window.location.href = "https://wa.me/5511993536138?text=Olá,%20Quadra%20Fácil"}
            >
              <img src={IconWatsApp} alt="icon" width={35} />
            </div>
          </div>
        </section>

        <section className={`area-reserve ${showReserve ? 'active' : ''}`}>
          <button
            className="close-reserve"
            onClick={() => setShowReserve(false)}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              zIndex: 1001
            }}
          >
            ×
          </button>

          <section className="header-reserves">
            {user?.role !== 'client' ? <p>Reservas</p> : <p>Suas reservas</p>}
            <div className="area-date">
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="date-picker"
                data-tooltip-id="insta"
                data-tooltip-content="Selecionar data"
                data-tooltip-place="bottom"
              />
              {user?.role !== "client" && (
                <button
                  data-tooltip-id="insta"
                  data-tooltip-content="Filtrar"
                  data-tooltip-place="bottom"
                  style={{ backgroundColor: '#fff' }}
                  onClick={() => {
                    setIsFilterActive(true);
                    loadReserves(date);
                  }}
                >
                  <FiFilter size={24} color={isFilterActive ? "#FF8A5B" : "#8a8888"} />
                </button>
              )}

              <button
                style={{ backgroundColor: '#fff' }}
                onClick={() => {
                  if (isFilterActive) {
                    setIsFilterActive(false);
                    setDate(today);
                    loadReserves(today);
                  }
                }}

                data-tooltip-id="insta"
                data-tooltip-content={isFilterActive ? "Limpar filtros" : "Atualizar"}
                data-tooltip-place="bottom"
              >
                {isFilterActive ? (
                  <LuFilterX size={24} color="red" onClick={() => window.location.reload()} />
                ) : (
                  <FiRefreshCcw size={24} color={isFilterActive ? "#FF8A5B" : "#8a8888"} onClick={() => refreshReserves()} />
                )}
              </button>
            </div>

            {isFilterActive && (
              <div className="area-filter">
                {spaces?.$values.map((item) => (
                  <h5
                    key={item.$id}
                    onClick={() => handleSpace(item.spaceId)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedSpace === item.spaceId ? '#FF8A5B' : 'transparent',
                      color: selectedSpace === item.spaceId ? '#fff' : '#000',
                      padding: '5px 10px',
                      borderRadius: '5px',
                    }}
                  >
                    {item.name}
                  </h5>
                ))}
              </div>
            )}
          </section>

          {dataReservesClient.length > 0 && user?.role === 'client' ? (
            <section className="reserves-context">
              <div className="reserves">
                {dataReservesClient
                  .map((item) => item)
                  .flat()
                  .filter((client, index, self) =>
                    index === self.findIndex((t) => t.$id === client.$id)
                  )
                  .map((client, index) => {
                    return (
                      <section className="area-cards-principal" key={`${index}-${client.$id}`} onClick={() => handleDetails(client)}>
                        <div className="left-card"></div>
                        <div className="rigth-card">
                          <section className="hour">
                            <p>
                              <img src={Icon1} alt="icon" />
                              {client.timeInitial.split(":").slice(0, 2).join(":")} -
                              {client.timeFinal.split(":").slice(0, 2).join(":")}
                            </p>
                          </section>
                          <section className="space">
                            <img src={Icon2} alt="icon" />
                            {format(client.dataReserve, 'dd/MM/yyyy')}
                          </section>
                        </div>
                      </section>
                    );
                  })
                }
              </div>
            </section>
          ) : (
            user?.role === 'client' && (
              <p style={{ color: '#868282', marginTop: 15 }} className="sem-reservas-message">
                Sem reservas para este dia. <strong style={{ color: '#FF8A5B', fontWeight: '300' }}>=(</strong>
              </p>
            )
          )}

          <section className="reserves-context">
            <div className="reserves">
              {(selectedSpace !== null ? reserveSpace : dataReserves?.reservas.$values)?.length === 0 ? (
                <section className="area-cards-principal">
                  <div className="left-card"></div>
                  <div className="rigth-card">
                    <p style={{ color: '#868282' }}>Sem reservas =(.</p>
                  </div>
                </section>
              ) : (
                (selectedSpace !== null ? reserveSpace : dataReserves?.reservas.$values)?.map((item) => {
                  const space = 'spaceId' in item
                    ? spaces?.$values.find(space => space.spaceId === item.spaceId)
                    : null;

                  return (
                    <section className="area-cards-principal" key={item.id_reserve} onClick={() => handleDetails(item)}>
                      <div className="left-card"></div>
                      <div className="rigth-card">
                        <section className="hour">
                          {item.timeInitial && item.timeFinal ? (
                            <p>
                              <img src={Icon1} alt="icon" />
                              {item.timeInitial.split(":").slice(0, 2).join(":")} -
                              {item.timeFinal.split(":").slice(0, 2).join(":")}
                            </p>
                          ) : (
                            <p>Horário não disponível</p>
                          )}
                        </section>
                        <section className="space">
                          {space ? (
                            <>
                              <img src={Icon2} alt="icon" />
                              {space.name}
                            </>
                          ) : (
                            <p>Espaço não encontrado</p>
                          )}
                        </section>
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </section>
        </section>

        {showReserve && (
          <div
            className="reserve-overlay"
            onClick={() => setShowReserve(false)}
          />
        )}

        <button
          className="reserve-mobile"
          onClick={() => setShowReserve(!showReserve)}
        >
          <img src={Icon2} alt="icon" />
        </button>

        {/* modal informe */}
        <Modal
          isOpen={isOpenInforme}
          onRequestClose={closeModalDetails}
          style={customStylesModalInforme}
          shouldCloseOnOverlayClick={false}
        >
          <header className="header-modal-informe-res">
            <img src={Logo} alt="logo" />
            <div className="area-close-informe-res" onClick={closeModalDetails}>
              <FiX size={24} />
            </div>
          </header>
          <section className="main-modal-informe-res">
            <h1>Detalhes da reserva</h1>
            <main>
              <section className="one-res">
                <p><strong>Data: </strong>{dataReserveCard ? format(dataReserveCard?.dataReserve as any, 'dd/MM/yyyy') : ''}</p>
                <p><strong>Dia: </strong>{dataReserveCard ? format(dataReserveCard?.dataReserve as any, 'eeee', { locale: ptBR }) : ''}</p>
              </section>
              <section className="one-res">
                <p><strong>Espaço: </strong>{
                  user?.role === 'client' ?
                    getSpaceCard && getSpaceCard.length > 0 ? getSpaceCard[0]?.name : "???" :
                    getNameSpaceAdmin
                }</p>
                <p><strong>De: </strong>{dataReserveCard ? dataReserveCard.timeInitial.split(":").slice(0, 2).join(':') : ''} até {dataReserveCard ? dataReserveCard.timeFinal.split(":").slice(0, 2).join(':') : ''}</p>
              </section>
              <section className="promo">
                <p><strong>Promoção aplicada: </strong>{dataReserveCard?.promotion ? 'Sim' : 'Não'}</p>
                {dataReserveCard?.promotion && (
                  <p style={{ textDecoration: 'Underline', textDecorationColor: '#FF8A5B' }}>{
                    dataReserveCard.promotionType === '2h' ? '2 horas pagando menos.' :
                      dataReserveCard.promotionType === '3h' ? '3 horas pagando menos.' :
                        dataReserveCard.promotionType === '4h' ? '4 horas pagando menos.' :
                          dataReserveCard.promotionType === '5h' ? '5 horas pagando menos.' :
                            dataReserveCard.promotionType === 'dayuse' ? 'Day Use.' : ''
                  }</p>
                )}
              </section>
              <section className="obs">
                {dataReserveCard?.observation && (
                  <p><strong>Observação: </strong>{dataReserveCard.observation}</p>
                )}
              </section>
              {
                user?.role !== "client" && (
                  <a className="calcel-btn" onClick={() => deleteReserve()}>Cancelar Reserva</a>
                )
              }
            </main>
            <button onClick={() => closeModalDetails()}>Fechar</button>
          </section>
        </Modal>

        {/* modal plan expired */}
        <Modal
          isOpen={isPlanExpired}
          onRequestClose={closeModalExpired}
          style={customStylesModalPlanExpired}
          shouldCloseOnOverlayClick={false}
        >
          <header className="header-modal-informe-res">
            <img src={Logo} alt="logo" />
            <div className="area-close-informe-res" onClick={closeModalExpired}>
              <FiX size={24} />
            </div>
          </header>
          <section className="main-modal-informe-res">
            <h1>Seu plano expirou =(</h1>
            <main>

              <section className="one-res">
                <p style={{ textAlign: "center" }}><strong>Data Expiração: </strong>{dataExpire && format(dataExpire, "dd/MM/yyyy")} - {planArena}</p>
              </section>

              <a href="https://api.whatsapp.com/send/?phone=5511993536138&text=Ol%C3%A1%2C%20meu%20plano%20expirou%20%3D(%20&type=phone_number&app_absent=0"
                target="_blank"
                style={{
                  color: "var(--primary-color)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textDecorationLine: "underline",
                  textAlign: "center",

                  marginBottom: 50


                }}
              >Clique aqui para renovar seu plano</a>

            </main>
            <button onClick={() => closeModalExpired()}>Fechar</button>
          </section>
        </Modal>
      </main>


      <Tooltip id="insta" />

    </>
  );
}