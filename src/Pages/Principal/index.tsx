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

import { format, startOfDay } from "date-fns";
import Loading from "../../components/Loading";

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
}

interface Reserva {
  $id: string;
  id_reserve: number;
  dataReserve: string;
  name: string;
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

export default function Principal() {
  const authContext = useContext(AuthContext);
  const { user, logout }: any = authContext;

  if (!authContext) {
    return <div>Carregando...</div>;
  }

  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [isloading, setLoading] = useState<boolean>(true); // Começa como true para mostrar o carregamento até ter resposta
  const [classAreaUser, setClassAreaUser] = useState(false);
  const [Arena, setArena] = useState<string>('');
  const [IdArena, setIdArena] = useState<number>()

  const [isOpenInforme, setIsOpenInforme] = useState<boolean>(false)
  const [dataDesativeProgrma, setDataDesativeProgrma] = useState<DataProgram[]>();

  const [dataReserves, setDataReserves] = useState<ApiResponseReserve | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today.toString());

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setDate(newDate);
    loadReserves(newDate);
  };

  useEffect(() => {
    if (user?.arena) {
      const fetchArena = async () => {
        try {
          const response = await api.post("/api/Arena/getArena", {
            arenaId: Number(user?.arena)
          });
          setArena(response?.data.name);
          setIdArena(response?.data.id);
        } catch (error) {
          console.log("Erro ao buscar arena: ", error);
        }
      };
      fetchArena();
    } else {
    }
  }, [user?.arena]);


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
    setLoading(true); // Começa o carregamento
    try {
      const response = await api.post<ApiResponseReserve>("/getReserve/arena/data", {
        arenaId: Number(user?.arena),
        dataReserve: date,
      });

      if (response?.data?.reservas?.$values?.length > 0) {
        const updatedData: ApiResponseReserve = {
          $id: response.data.$id,
          arenaName: response.data.arenaName,
          reservas: {
            $id: response.data.reservas.$id,
            $values: response.data.reservas.$values,
          },
        };

        setDataReserves(updatedData);
      } else {
        setDataReserves(null); // Se não houver reservas, limpa os dados
      }
    } catch (error) {
      setSendTitle("error");
      setSendMessage("Erro ao carregar as reservas.");
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  useEffect(() => {
    loadReserves(date); // Carrega as reservas quando o componente for montado
  }, [user?.arena]); // Este useEffect é chamado apenas uma vez ao montar o componente

  const refreshReserves = () => {
    const today = new Date(); // Cria a data atual
    const formattedDate = format(today, "yyyy-MM-dd"); // Formata para 'yyyy-MM-dd'
    loadReserves(formattedDate); // Chama a função de carregar reservas com a data formatada
  };

  if (isloading) {
    return <Loading />; // Exibe uma mensagem de carregamento até que os dados sejam carregados
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
              <p>{Arena}</p>
              <div className="area-config">
                <img src={SettingsIcon} alt="" />
                <p>Configurações</p>
              </div>

              <button onClick={() => logout()}>Sair</button>
            </div>
          </div>

          <div className="context">
            <h1>horario disponiveis do dia</h1>
            <h1>{date}</h1>
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
            <p>Reservas</p>
            <div className="area-date">
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="date-picker"
              />
              <FiFilter title="Filtrar" />
              <FiRefreshCcw title="Atualizar" onClick={refreshReserves} />
            </div>
          </section>

          <div className="area-cards-rolagem">
            {dataReserves?.reservas?.$values?.length ? (
              dataReserves.reservas.$values.map((item) => (
                item.timeInitial && item.timeFinal ? (
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
                        {item.name ? (
                          <p>
                            <img src={Icon2} alt="icon" /> {item.name}
                          </p>
                        ) : (
                          <p>Nome não disponível</p>
                        )}
                      </section>
                    </div>
                  </section>
                ) : (
                  <section className="area-cards-principal" key={item.id_reserve}>
                    <div className="left-card"></div>
                    <div className="rigth-card">
                      <p>Sem reservas =(.</p>
                    </div>
                  </section>
                )
              ))
            ) : (
              <p>Sem reservas =(.</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
