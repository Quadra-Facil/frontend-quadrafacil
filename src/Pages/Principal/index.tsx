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
import Teste from './img/Soccer.gif'

import { FiActivity, FiFilter, FiPlusCircle, FiRefreshCcw, FiSearch, FiX } from "react-icons/fi";
import { api } from "../../services/axiosApi/apiClient";

import { format } from "date-fns";
import Loading from "../../components/Loading";
import { LuFilterX } from "react-icons/lu";
import { ptBR } from "date-fns/locale";

import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { TbClockPlay } from "react-icons/tb";
import TimeLinePrincipal from "../../components/Principal/TimeLinePrincipal";
import CarrosselClient from "../../components/Principal/Carrousel-client";

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

// Interface para os detalhes de cada espaço (quadra, campo)
interface Space {
  $id: string;
  spaceId: number;
  name: string;
  status: string;
  sports: string;
  arenaId: number;
}

// Interface para a resposta da API
interface ApiResponseSpaces {
  $id: string;
  $values: Space[];
}

// Interface para a resposta de reservas de um espaço
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

interface WeekDays {
  $id: string;
  $values: number[]; // Array de números que representam os dias da semana
}

// Representa o horário de funcionamento de cada arena
interface Expedient {
  $id: string;
  id: number;          // ID do horário
  arenaId: number;     // ID da arena
  weekDays: WeekDays;  // Objeto contendo os dias da semana
  startTime: string;   // Hora de início (em formato "HH:MM:SS")
  endTime: string;     // Hora de término (em formato "HH:MM:SS")
  open: boolean;       // Se está aberto ou não
}

export default function Principal() {
  const authContext = useContext(AuthContext);
  const { user, logout }: any = authContext;

  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [isloading, setLoading] = useState<boolean>(true);
  const [classAreaUser, setClassAreaUser] = useState(false);
  const [Arena, setArena] = useState<string>('');
  const [IdArena, setIdArena] = useState<number>();

  const [dataDesativeProgrma, setDataDesativeProgrma] = useState<DataProgram[]>();
  const [dataReserves, setDataReserves] = useState<ApiResponseReserve | null>(null);
  const [dataReservesClient, setDataReservesClient] = useState<Reserva[]>([]);

  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today.toString());
  const [spaces, setSpaces] = useState<ApiResponseSpaces | null>(null);
  const [reserveSpace, setReserveSpace] = useState<ReserveSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null); // Variável para armazenar o espaço selecionado
  const [isFilterActive, setIsFilterActive] = useState(false); // Controle do filtro ativo
  const [isOpenInforme, setIsOpenInforme] = useState<boolean>(false);
  const [dataReserveCard, setDataReserveCard] = useState<Reserva>();

  const [getSpaceCard, setGetSpaceCard] = useState<Space[]>([])



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
      width: '35vw',
      height: '55vh',
      maxWidth: '100%',
      color: '#6c6c6c',
      zIndex: 10000,
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };


  function openModalDetails() {
    setIsOpenInforme(true);
  }

  function closeModalDetails() {
    setIsOpenInforme(false);
    // closeModalReserve();
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setDate(newDate);

    // Resetar as reservas antes de buscar as novas
    setDataReservesClient([]); // Limpar as reservas do cliente
    setDataReserves(null); // Limpar as reservas gerais (para outras funções de usuário)

    loadReserves(newDate); // Carregar novas reservas para a data alterada
  };

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

    // Verifica o tipo de usuário (cliente ou não)
    if (user?.role === 'client') {

      try {
        // Faz a solicitação para obter as reservas do cliente
        const response = await api.post<ReserveClient>("/getReserves/client", {
          clientId: Number(user?.userId),
          dataReserve: date,
        });

        // Adiciona a resposta ao array de reservas do cliente
        setDataReservesClient(response.data.$values)
        console.log(response.data.$values)

      } catch (error) {
        setSendTitle("error");
        setSendMessage("Erro ao carregar as reservas.");
      } finally {
        setLoading(false);
      }
    } else {
      // Para outros tipos de usuário, como 'admin' ou 'funcionário'
      try {
        // Faz a solicitação para obter as reservas da arena
        const resp = await api.post<ApiResponseReserve>("/getReserve/arena/data", {
          arenaId: Number(user?.arena),
          dataReserve: date,
        });

        // Verifica se a resposta contém reservas e atualiza o estado da arena
        if (resp?.data?.reservas?.$values?.length > 0) {
          const updatedData: ApiResponseReserve = {
            $id: resp.data.$id,
            arenaName: resp.data.arenaName,
            reservas: {
              $id: resp.data.reservas.$id,
              $values: resp.data.reservas.$values,
            },
          };

          // Atualiza o estado de reservas da arena
          setDataReserves(updatedData);

        } else {
          // Se não houver reservas, define como null
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

  // Atualiza as reservas quando o valor de 'user?.arena' ou 'date' muda
  useEffect(() => {
    loadReserves(date);
  }, [date, user?.arena]); // Certifique-se de que a data e a arena estão sendo observadas

  const refreshReserves = () => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    loadReserves(formattedDate);
  };


  // spaces
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

  // Filtrando reservas por espaço
  async function handleSpace(id: number) {
    setSelectedSpace(id); // Definir o espaço selecionado
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
    // Verifica se 'dataReserveCard' foi atualizado antes de fazer a requisição
    if (!dataReserveCard) return;

    const fetchSpaceData = async () => {
      setLoading(true); // Marque como 'loading' antes de fazer a requisição
      try {
        const getSpace = await api.post('/api/newSpace/search/space/id', {
          arenaId: dataReserveCard?.arenaId,
          spaceId: dataReserveCard?.spaceId
        });
        setGetSpaceCard(getSpace.data.$values);
        console.log("Get: ", getSpace.data.$values);
      } catch (error) {
        console.log("Erro ao buscar spaces: ", error);
      } finally {
        setLoading(false); // Marca como 'loading' false após a requisição
      }
    };

    fetchSpaceData(); // Chama a função de requisição
  }, [dataReserveCard]); // O efeito será disparado sempre que 'dataReserveCard' mudar

  // Função que será chamada ao clicar e atualizar 'dataReserveCard'
  const [getNameSpaceAdmin, setgetNameSpaceAdmin] = useState('')
  const handleDetails = (item: any) => {
    openModalDetails();
    setDataReserveCard(item); // Altera o valor de 'dataReserveCard', o que dispara o useEffect

    setgetNameSpaceAdmin(item.name)

  };

  if (isloading) {
    return <Loading />;
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
                <input type="text" placeholder="Pesquise itens do menu" />
                <button className="search-icon" onClick={() => alert("Estamos tabalhando nisso...")}>
                  <FiSearch size={32} color="#8a8888" />
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

            {
              user?.role !== 'client' && (
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
              )
            }

            {
              user?.role === 'client' && (

                <CarrosselClient />
              )
            }

          </div>

          <div className="area-social">
            <div className="area-img">
              <img src={IconInstagran} alt="icon" width={35} title="Instagram" />
            </div>
            <div className="area-img">
              <img src={IconWatsApp} alt="icon" width={35} title="WhatsApp" />
            </div>
          </div>
        </section>

        <section className="area-reserve">
          <section className="header-reserves">
            {
              user?.role !== 'client' ? <p>Reservas</p> : <p>Suas reservas</p>
            }
            <div className="area-date">
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="date-picker"
              />
              {
                user?.role !== "client" && (

                  <button
                    title="Filtrar"
                    style={{ backgroundColor: '#fff' }}
                    onClick={() => {
                      setIsFilterActive(true); // Ativa o filtro
                      loadReserves(date); // Carrega as reservas filtradas
                    }}
                  >
                    <FiFilter size={24} color={isFilterActive ? "#FF8A5B" : "#8a8888"} />
                  </button>
                )
              }



              {/* Condicionalmente renderiza o ícone de limpar filtro ou refresh */}
              <button
                title={isFilterActive ? "Limpar filtros" : "Atualizar"}
                style={{ backgroundColor: '#fff' }}
                onClick={() => {
                  if (isFilterActive) {
                    // Se o filtro estiver ativo, limpa o filtro
                    setIsFilterActive(false); // Desativa o filtro
                    setDate(today);  // Reseta a data para o valor inicial
                    loadReserves(today);  // Recarrega as reservas sem filtro
                  }
                }}
              >
                {isFilterActive ? (
                  <LuFilterX size={24} color="red" onClick={() => window.location.reload()} />  // Ícone de limpar filtro
                ) : (
                  <FiRefreshCcw size={24} color={isFilterActive ? "#FF8A5B" : "#8a8888"} onClick={() => refreshReserves()} />
                )}
              </button>
            </div>

            {/* Div de filtro */}
            {isFilterActive && (
              <div className="area-filter">
                {spaces?.$values.map((item) => (
                  <h5
                    key={item.$id}
                    onClick={() => handleSpace(item.spaceId)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedSpace === item.spaceId ? '#FF8A5B' : 'transparent', // Cor de fundo se selecionado
                      color: selectedSpace === item.spaceId ? '#fff' : '#000', // Cor do texto se selecionado
                      padding: '5px 10px',  // Adiciona algum espaçamento para o clique
                      borderRadius: '5px',  // Bordas arredondadas para suavizar o visual
                    }}
                  >
                    {item.name}
                  </h5>
                ))}
              </div>
            )}
          </section>

          {/* CARD CLIENT */}
          {
            dataReservesClient.length > 0 && user?.role === 'client' ? (
              <section className="reserves-context">
                <div className="reserves">
                  {
                    dataReservesClient
                      .map((item) => item)
                      .flat() // Achata o array se os dados forem um array de arrays
                      .filter((client, index, self) =>
                        index === self.findIndex((t) => t.$id === client.$id) // Filtra os duplicados com base no id
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
              // Mensagem para o cliente quando não houver reservas
              user?.role === 'client' && (
                <p style={{ color: '#868282', marginTop: 15 }}>
                  Sem reservas para este dia. <strong style={{ color: '#FF8A5B', fontWeight: '300' }}>=(</strong>
                </p>
              )
            )
          }

          {/* CARD ADMIN */}
          <section className="reserves-context">
            <div className="reserves">
              {/* Verifica se existem reservas para o espaço selecionado ou reservas gerais */}
              {
                (selectedSpace !== null ? reserveSpace : dataReserves?.reservas.$values)?.length === 0 ? (
                  <section className="area-cards-principal">
                    <div className="left-card"></div>
                    <div className="rigth-card">
                      <p style={{ color: '#868282' }}>Sem reservas =(.</p>
                    </div>
                  </section>
                ) : (
                  (selectedSpace !== null ? reserveSpace : dataReserves?.reservas.$values)?.map((item) => {
                    // Verificar se o item é do tipo 'ReserveSpace' (pois ele tem a propriedade 'spaceId')
                    const space = 'spaceId' in item
                      ? spaces?.$values.find(space => space.spaceId === item.spaceId)
                      : null;  // Se não for, o item é do tipo 'Reserva', que não tem 'spaceId'

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

        {/* modal informe */}
        <Modal
          isOpen={isOpenInforme}
          onRequestClose={closeModalDetails}
          style={customStylesModalInforme}
          shouldCloseOnOverlayClick={false}
        >
          <header className="header-modal-informe-res">

            <img src={Logo} alt="logo" />

            <div className="area-close" onClick={closeModalDetails}>
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
                {
                  dataReserveCard?.promotion && (
                    <p style={{ textDecoration: 'Underline', textDecorationColor: '#FF8A5B' }}>{
                      dataReserveCard.promotionType === '2h' ? '2 horas pagando menos.' :
                        dataReserveCard.promotionType === '3h' ? '3 horas pagando menos.' :
                          dataReserveCard.promotionType === '4h' ? '4 horas pagando menos.' :
                            dataReserveCard.promotionType === '5h' ? '5 horas pagando menos.' :
                              dataReserveCard.promotionType === 'dayuse' ? 'Day Use.' : ''
                    }</p>
                  )
                }
              </section>
              <section className="obs">
                {
                  dataReserveCard?.observation && (
                    <p><strong>Observação: </strong>{dataReserveCard.observation}</p>
                  )
                }
              </section>
            </main>

            <button onClick={() => closeModalDetails()}>Fechar</button>

          </section>

        </Modal>
      </main >
    </>
  );
}


























