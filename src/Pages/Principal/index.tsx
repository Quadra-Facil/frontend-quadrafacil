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

import { FiActivity, FiFilter, FiPlusCircle, FiRefreshCcw, FiSearch, FiX } from "react-icons/fi";
import { api } from "../../services/axiosApi/apiClient";

import { format } from "date-fns";
import Loading from "../../components/Loading";
import { LuFilterX } from "react-icons/lu";

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

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setDate(newDate);

    // Resetar as reservas antes de buscar as novas
    setDataReservesClient([]); // Limpar as reservas do cliente
    setDataReserves(null); // Limpar as reservas gerais (para outras funções de usuário)

    loadReserves(newDate); // Carregar novas reservas para a data alterada
  };


  // const fetchArena = async () => {
  //   try {
  //     const response = await api.post("/api/Arena/getArena", {
  //       arenaId: Number(user?.arena)
  //     });
  //     setArena(response?.data.name);
  //     // setIdArena(response?.data.id);
  //   } catch (error: any) {
  //     console.log("Erro ao buscar arena: ", error);
  //   }
  // };

  // useEffect(() => {
  //   // if (user?.arena) {
  //   fetchArena();
  //   // }
  // }, [user?.arena]);

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
                <button className="search-icon">
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

          <div className="context">
            <h1>horarios disponíveis do dia</h1>
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
                          <section className="area-cards-principal" key={`${index}-${client.$id}`}>
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
                      <section className="area-cards-principal" key={item.id_reserve}>
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
      </main >
    </>
  );
}


























