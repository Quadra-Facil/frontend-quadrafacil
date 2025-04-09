import "./style.css";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../services/contexts/AuthContext";
import Toast from "../Toast";
import Loading from "../Loading";
import Modal from "react-modal";
import { FiTrash2, FiX } from "react-icons/fi";
import { api } from "../../services/axiosApi/apiClient";
import { addDays, isBefore, format, addMonths, parse, differenceInHours } from 'date-fns';
import Logo from "../../img/logomarca.svg"
import { CiCalendar, CiGrid42, CiStopwatch } from "react-icons/ci";
import { ptBR } from 'date-fns/locale/pt-BR';

interface Space {
  spaceId: number;
  name: string;
  sports: string;
}

interface Arena {
  $id: string;
  id: number;
  name: string;
  phone: string;
  status: string;
  valueHour: number;
  adressArenas: AdressArenas;
}

interface AdressArenas {
  $id: string;
  $values: Address[];
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
  arena: ArenaReference;
}

interface ArenaReference {
  $ref: string;
}

interface Promotion {
  $id: string;
  id: number;
  promotionType: string;
  when: string;
  startDate: string;
  endDate: string;
  weekDays: {
    $id: string;
    $values: number[];
  };
  value: number;
  qtdPeople: number;
  arenaId: number;
}

interface WeekDays {
  $id: string;
  $values: number[]; // Array de números representando os dias da semana (1 = Segunda, 2 = Terça, etc.)
}

interface Schedule {
  $id: string;
  id: number;
  arenaId: number;
  weekDays: WeekDays; // Relacionando "weekDays" com a interface WeekDays
  startTime: string;
  endTime: string;
  open: boolean; // Se a arena está aberta ou não
}

interface Reserve {
  id_reserve: number;
  userId: number;
  arenaId: number;
  spaceId: number;
  dataReserve: string;
  timeInitial: string;
  timeFinal: string;
  status: string;
  typeReserve: string;
  observation: string;
}

export default function ModalReserveFixed() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [modalIsOpen, setIsOpen] = useState(false);
  const [arenaData, setArenaData] = useState<Arena | null>(null);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const location = useLocation();
  const { sports } = location.state || {};
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { user }: any = authContext;
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filterPromo, setFilterPromo] = useState<Promotion[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | string>('');
  const [weekDaySigla, setWeekDaySigla] = useState<string | null>(null);
  const [dates, setDates] = useState<string[]>([]);

  const [expedientData, setExpedientData] = useState<Schedule[]>([])

  const [startTimeSelect, setStartTimeSelect] = useState<string>('')
  const [endTimeSelect, setEndTimeSelect] = useState<string>('')
  const [isOpenInforme, setIsOpenInforme] = useState<boolean>(false)

  const [weekSelect, setWeekSelect] = useState<string>('')
  const [validationType, setValidationType] = useState<boolean>(true)

  const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false)


  const WeekDay = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

  const customStylesModalReservFixed = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff9f7',
      border: '1px solid #ccc',
      borderRadius: '10px',
      padding: '0px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '60vw',
      height: '95vh',
      maxWidth: '80%',
      color: '#6c6c6c',
      zIndex: 10000,
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

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
  const customStylesModalDetails = {
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
      height: '60vh',
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

  useEffect(() => {
    navigate("/reserve-fixed");
  }, []);

  useEffect(() => {
    openModal();
  }, []);

  useEffect(() => {
    async function getArena() {
      setIsLoading(true);
      try {
        const response = await api.post("/api/Arena/getArena", {
          arenaId: Number(user?.arena),
        });
        setArenaData(response.data);
        setIsLoading(false);
      } catch (error: any) {
        setSendTitle('error');
        setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
        setIsLoading(false);
      }
    }
    getArena();
  }, [user?.arena]);

  useEffect(() => {
    if (!user?.arena || !sports) {
      setIsLoading(true)
      return;
    }

    async function getSpaceSearch() {
      setIsLoading(true);
      try {
        const response = await api.post("/api/newSpace/search/space", {
          arenaId: user?.arena,
          sports: String(sports),
        });

        if (response.data && Array.isArray(response.data.$values)) {
          setSpaces(response.data.$values);
        } else {
          setSpaces([]);
        }
      } catch (error: any) {
        setSendTitle('error');
        setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
        navigate("/principal")
      } finally {
        setIsLoading(false);
      }
    }

    getSpaceSearch();
  }, [user?.arena, sports]);

  useEffect(() => {
    setIsLoading(true)
    async function loadPromotions() {
      await api.post("/api/Promotions/get-promotion", {
        arenaId: user?.arena
      }).then((response) => {
        setPromotions(response?.data?.$values);
        setIsLoading(false);
      }).catch((error: any) => {
        setSendTitle('error');
        setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
        setIsLoading(false);
      }).finally(() => {
        setIsLoading(false);
      })
    }
    loadPromotions();
  }, [user?.arena]);


  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    navigate("/principal");
  }


  const [uniqueReserves, setUniqueReserves] = useState<Reserve[]>([]); // Estado para armazenar as reservas únicas


  const handleSpace = async (id: number) => {
    setSelectedSpace(id);
  };

  const fetchReserves = async () => {
    try {
      const response = await api.post("/getReservesfixed", {
        arenaId: Number(user?.arena),
        spaceId: Number(selectedSpace),
        typeReserve: 'fixa',
      });

      // Cria um Set para obter as observações únicas
      const uniqueObservations = [...new Set(response.data.map((reserve: any) => reserve.observation))];

      // Filtra os dados para pegar o primeiro de cada observação
      const uniqueReserveData = uniqueObservations.map((observation) => {
        return response.data.find((reserve: any) => reserve.observation === observation);
      });

      // Atualiza o estado com as reservas únicas
      setUniqueReserves(uniqueReserveData);

      // Exibe as reservas únicas no console
      console.log("Reservas com observações únicas:", uniqueReserveData);
    } catch (error) {
      console.log("Erro ao buscar reservas:", error);
    }
  };
  useEffect(() => {

    fetchReserves();
    // Se selectedSpace foi atualizado, fazer a requisição
    if (selectedSpace) {
      fetchReserves();
    }
  }, [selectedSpace]); // Este effect é executado toda vez que selectedSpace mudar



  const handlePeriodChange = (event: any) => {
    const period = event.target.value;
    setSelectedPeriod(period);
  };

  async function getExpedientArena() {
    try {
      const response = await api.post("/api/ArenaHours/get", {
        arenaId: Number(user?.arena)
      });
      setExpedientData(response?.data?.$values);
      setIsLoading(false);
    } catch (error: any) {
      setSendTitle('error');
      setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
      setIsLoading(false);
    }
  }


  useEffect(() => {
    getExpedientArena()
  }, [])


  const handleWeekDayClick = async (sigla: typeof WeekDay[number]) => {
    setWeekDaySigla(sigla);
    setIsLoading(true);

    let weekDayGet = 0;

    // Mapeamento de sigla para valor numérico
    if (sigla === "Seg") {
      weekDayGet = 1;
      setWeekSelect("Segunda-feira");

    } else if (sigla === "Ter") {
      weekDayGet = 2;
      setWeekSelect("Terça-feira");

    } else if (sigla === "Qua") {
      weekDayGet = 3;
      setWeekSelect("Quarta-feira");

    } else if (sigla === "Qui") {
      weekDayGet = 4;
      setWeekSelect("Quinta-feira");

    } else if (sigla === "Sex") {
      weekDayGet = 5;
      setWeekSelect("Sexta-feira");

    } else if (sigla === "Sáb") {
      weekDayGet = 6;
      setWeekSelect("Sábado");

    } else if (sigla === "Dom") {
      weekDayGet = 7;
      setWeekSelect("Domingo");

    }

    const filterSelectDay = expedientData.filter((item) => Number(item.weekDays.$values) === weekDayGet)


    //se estiver fechado abre o modal
    if (!filterSelectDay[0]?.open) {
      openModalInformeArenaDisable();
      setWeekDaySigla('')
      setIsLoading(false);
      return;
    } else {
      console.log(filterSelectDay)
      setStartTimeSelect(filterSelectDay[0]?.startTime.split(':').slice(0, 2).join(':'));
      setEndTimeSelect(filterSelectDay[0]?.endTime.split(':').slice(0, 2).join(':'));

    }

    setIsLoading(false);
  };


  useEffect(() => {
    if (weekDaySigla && selectedPeriod) {
      getWeekDay(weekDaySigla as any);
    }
  }, [weekDaySigla, selectedPeriod]);

  function getWeekDay(sigla: typeof WeekDay[number]) {
    const dayMapping: Record<typeof WeekDay[number], number> = {
      'Seg': 1,
      'Ter': 2,
      'Qua': 3,
      'Qui': 4,
      'Sex': 5,
      'Sáb': 6,
      'Dom': 7,
    };

    const selectedDay = dayMapping[sigla];

    // alert(selectedDay)
    if (selectedDay !== undefined) {
      const today = new Date();
      const currentDay = today.getDay() === 0 ? 7 : today.getDay();

      let daysToAdd = selectedDay - currentDay;
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }

      let nextDate = addDays(today, daysToAdd);
      const periodLimit = addMonths(today, Number(selectedPeriod));

      const newDates: string[] = [];

      while (isBefore(nextDate, periodLimit)) {
        newDates.push(format(nextDate, 'yyyy-MM-dd'));
        nextDate = addDays(nextDate, 7);
      }

      setDates(newDates);
    }
  }

  function correctMinutes(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const correctedMinutes = minutes < 30 ? 0 : 30;
    return `${hours.toString().padStart(2, "0")}:${correctedMinutes.toString().padStart(2, "0")}`;
  }

  // Função para controlar a mudança de horário inicial
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    const correctedTime = correctMinutes(time);  // Garantir que a mudança de minutos esteja certa
    setStartTime(correctedTime);
  };

  // Função para controlar a mudança de horário final
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    const correctedTime = correctMinutes(time);  // Garantir que a mudança de minutos esteja certa
    setEndTime(correctedTime);
  };


  useEffect(() => {
    if (startTime && endTime) {
      const parseTime = (timeStr: string) => parse(timeStr, 'HH:mm', new Date());
      const start = parseTime(startTime);
      const end = parseTime(endTime);

      validationTimers();

      // Verifica se a diferença é válida
      const horas = differenceInHours(end, start);

      if (isNaN(horas) || horas <= 0) {
        setSendTitle('error');
        setSendMessage("A diferença de horários é inválida.");
        setStartTime('')
        setEndTime('')
        return;
      }

      const result = `${horas}h`;

      const promoFilter = promotions.filter((item) => item.promotionType === result);

      if (promoFilter.length > 0) {
        const promotion = promoFilter[0]; // Acessando com segurança, pois o array não está vazio

        if (promotion.when === "todo-dia") {
          setFilterPromo(promoFilter);
          return;
        } else if (promotion.when === "por-periodo") {
          const currentDate = new Date(); // Data atual como objeto Date
          const initialPeriod = new Date(promotion.startDate); // StartDate convertido para objeto Date
          const endPeriod = new Date(promotion.endDate); // EndDate convertido para objeto Date

          // Comparação direta de objetos Date
          if (currentDate >= initialPeriod && currentDate <= endPeriod) {
            setFilterPromo(promoFilter)
            return;
          }

        } else {
          // Se o tipo de promoção não for reconhecido, retorne ou faça algo aqui
          return;
        }
      } else {
        setFilterPromo([])
      }
    }
  }, [startTime, endTime, promotions]);

  // Função para validação dos horários
  function validationTimers() {
    if (dates.length === 0) {
      setSendTitle('error');
      setSendMessage("Selecione o dia e período");
      setValidationType(false);
      return;
    }

    // Validação para verificar se o horário inicial está correto
    if (startTime < startTimeSelect) {
      setSendTitle('error');
      setSendMessage(`Horário inicial incorreto - a partir das ${startTimeSelect}`);
      setStartTime('')
      setEndTime('')
      setValidationType(false);
      return;
    }

    // Validação para verificar se o horário final está correto
    if (endTime > endTimeSelect) {
      setSendTitle('error');
      setSendMessage(`Horário final incorreto - até as ${endTimeSelect}`);
      setValidationType(false);
      setStartTime('')
      setEndTime('')
      return;
    }

    // Verificar se o horário de início é menor que o de fim
    if (startTime >= endTime) {
      setSendTitle('error');
      setSendMessage("Horário inicial não pode ser maior ou igual ao horário final.");
      setValidationType(false);
      setStartTime('')
      setEndTime('')
      return;
    }

    // Se a validação estiver ok
    setValidationType(true);
  }



  async function ReserveFixed() {
    validationTimers();

    if (!selectedSpace) {
      setSendTitle('error');
      setSendMessage("Selecione um espaço, quadra...");
      return;
    } else if (dates.length === 0) {
      setSendTitle('error');
      setSendMessage("Selecione o dia e período");
      return;
    } else if (startTime === '' || endTime === '') {
      setSendTitle('error');
      setSendMessage("Horário incorreto.");
      setStartTime('')
      setEndTime('')
      return;
    } else if (startTime >= endTime) {
      setSendTitle('error');
      setSendMessage("Horário incorreto.");
      setStartTime('')
      setEndTime('')
      return;
    } else if (observations === '') {
      setSendTitle('error');
      setSendMessage("Informe uma observação.");
      return;
    } else {
      setIsLoading(true);
      for (let i = 0; i < dates.length; i++) {
        const currentDate = dates[i];
        try {
          await api.post("/api/reserve", {
            userId: user?.userId,
            arenaId: user?.arena,
            spaceId: selectedSpace,
            dataReserve: currentDate,
            timeInitial: `${startTime}:00`,
            timeFinal: `${endTime}:00`,
            typeReserve: "fixa",
            observation: observations,
            promotion: filterPromo.length !== 0 ? true : false,
            promotionType: filterPromo.length !== 0 ? filterPromo[0]?.promotionType : "",
            value: filterPromo.length !== 0 ? filterPromo[0]?.value : arenaData?.valueHour
          }).then((response) => {
            setSendTitle('success');
            setSendMessage(`${response?.data?.message}`);

            // Atualiza as reservas locais após 
            fetchReserves();

            setStartTime('')
            setEndTime('')
            setObservations('')
            setFilterPromo([])

          }).catch((error: any) => {
            setSendTitle('error');
            setSendMessage(`${error?.response?.data}`);
          });
        } catch (error) {
          setSendTitle('error');
          setSendMessage('Erro desconhecido');
        }
      }
      setIsLoading(false);
    }
  }

  function openModalDetails() {
    setIsOpenDetails(true)
  }

  function closeModalDetails() {
    setIsOpenDetails(false)
  }

  const [resultCard, setResultCard] = useState<Reserve[]>([]);

  function handleDataCardReserveFixed(item: Reserve) {
    openModalDetails();

    //guarda os dados do card
    setResultCard([item]);
  }

  async function handleDeleteReserves(observation: string) {
    setIsLoading(true);
    try {
      const response = await api.delete("/DeleteReserve-id", {
        data: { observation: observation }
      });

      setSendTitle('success');
      setSendMessage(response?.data?.message || 'Reserva deletada com sucesso');

      // Remover a reserva deletada do estado
      setUniqueReserves((prevReserves) =>
        prevReserves.filter((reserve) => reserve.observation !== observation)
      );
    } catch (error: any) {
      setSendTitle('error');
      setSendMessage(error?.response?.data?.message || 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }

  }

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {isLoading ? (
        <Loading />
      ) : (
        <><Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStylesModalReservFixed} shouldCloseOnOverlayClick={false}>
          <header className="header-modal-reserve-fixed">
            <h1><strong>{arenaData?.name} - {arenaData?.adressArenas?.$values[0]?.city} - {arenaData?.adressArenas?.$values[0]?.state}</strong></h1>
            <div className="area-close-reserve-fixed" onClick={closeModal}><FiX size={24} /></div>
          </header>
          <div className="main-reserve-fixed">
            <section className="area-space-fixed">
              {spaces.length === 0 ? (
                <h1>Não encontramos espaços</h1>
              ) : (
                spaces.map((item) => (
                  <div
                    className="space-fixed"
                    onClick={() => handleSpace(item.spaceId)}
                    style={{ backgroundColor: selectedSpace === item.spaceId ? '#f7cebe' : '' }}
                  >
                    <p className="name-space">{item.name}</p>
                  </div>
                ))
              )}
            </section>
            <section className="area-weekday">
              {WeekDay.map((item) => (
                <div
                  key={item}
                  style={{
                    backgroundColor: weekDaySigla === item ? '#f7cebe' : '#fff',
                  }}
                  className="btn-week"
                  onClick={() => handleWeekDayClick(item)}
                >
                  {item}
                </div>
              ))}
            </section>
            <section className="main-fixed">
              <div className="area-cards">
                {
                  // Ordena as reservas pela dataReserve em ordem crescente
                  uniqueReserves
                    .sort((a, b) => new Date(a.dataReserve).getTime() - new Date(b.dataReserve).getTime())
                    .map(item => (
                      <div className="card-reserve" key={item.observation} title={item.observation}>
                        {/* continuar populando */}
                        <p>{item.timeInitial.split(":").slice(0, 2).join(":")} às {item.timeFinal.split(":").slice(0, 2).join(":")}</p>
                        <p onClick={() => handleDataCardReserveFixed(item)} style={{ backgroundColor: '#FF8A5B', paddingInline: 10, borderRadius: 10, cursor: 'pointer' }}>
                          {format(new Date(item.dataReserve), 'eee', { locale: ptBR })}
                        </p>
                        <FiTrash2 style={{ cursor: 'pointer', color: '#FF8A5B' }} onClick={() => handleDeleteReserves(item.observation)} />
                      </div>
                    ))
                }
              </div>

              <section className="area-timers">
                <div className="area-radio">
                  <div className="area-title-period">
                    <h2>Pelos próximos:</h2>
                  </div>
                  <div className="area-radio-options">
                    <div className="area-inputs">
                      <input
                        type="radio"
                        name="period"
                        id="period-1"
                        value="1"
                        checked={selectedPeriod === '1'}
                        onChange={handlePeriodChange} />
                      <label htmlFor="period-1">01 mês</label>
                    </div>
                    <div className="area-inputs">
                      <input
                        type="radio"
                        name="period"
                        id="period-3"
                        value="3"
                        checked={selectedPeriod === '3'}
                        onChange={handlePeriodChange} />
                      <label htmlFor="period-3">03 meses</label>
                    </div>
                    <div className="area-inputs">
                      <input
                        type="radio"
                        name="period"
                        id="period-6"
                        value="6"
                        checked={selectedPeriod === '6'}
                        onChange={handlePeriodChange} />
                      <label htmlFor="period-6">06 meses</label>
                    </div>
                    <div className="area-inputs">
                      <input
                        type="radio"
                        name="period"
                        id="period-12"
                        value="12"
                        checked={selectedPeriod === '12'}
                        onChange={handlePeriodChange} />
                      <label htmlFor="period-12">12 meses</label>
                    </div>
                  </div>
                </div>
                <div className="area-timers-div">
                  <div className="area-initial-time">
                    <label htmlFor="initial">Hr. Inicial:</label>
                    <input
                      type="time"
                      id="initial"
                      value={startTime}
                      onChange={handleStartTimeChange}
                      min={startTimeSelect}  // Limitar para o horário inicial permitido pela arena
                      max={endTimeSelect}    // Limitar para o horário final permitido pela arena
                    />
                  </div>
                  <div className="area-end-time">
                    <label htmlFor="end">Hr. Final:</label>
                    <input
                      type="time"
                      id="end"
                      value={endTime}
                      onChange={handleEndTimeChange}
                      min={startTimeSelect}  // Limitar para o horário inicial permitido pela arena
                      max={endTimeSelect}    // Limitar para o horário final permitido pela arena
                    />
                  </div>
                </div>
                {filterPromo.length !== 0 && validationType && (
                  <h5>Promoção:
                    <strong>{filterPromo[0]?.promotionType === '2h' ? `2h pagando menos - R$ ${filterPromo[0]?.value.toFixed(2)}(hora).` :
                      filterPromo[0]?.promotionType === '3h' ? `3h pagando menos - R$ ${filterPromo[0]?.value.toFixed(2)}(hora).` :
                        filterPromo[0]?.promotionType === '4h' ? `4h pagando menos - R$ ${filterPromo[0]?.value.toFixed(2)}(hora).` :
                          filterPromo[0]?.promotionType === '5h' ? `5h pagando menos - R$ ${filterPromo[0]?.value.toFixed(2)}(hora).` : 'Nenhuma promoção.'}</strong>
                  </h5>
                )}
                <textarea placeholder="Turma do zé..." value={observations} onChange={(e) => setObservations(e.target.value)}></textarea>
              </section>

            </section>

            <button className="btn-reserve-fixed" onClick={() => ReserveFixed()}>Criar reserva fixa</button>
          </div>
        </Modal>

          {/* modal informe */}
          <Modal
            isOpen={isOpenInforme}
            onRequestClose={closeModalInformeArenaDisable}
            style={customStylesModalInforme}
            shouldCloseOnOverlayClick={false}
          >
            <header className="header-modal-informe">

              <img src={Logo} alt="logo" />

              <div className="area-close-informe-fixed" onClick={closeModalInformeArenaDisable}>
                <FiX size={24} />
              </div>
            </header>
            <section className="main-modal-informe">
              <h1>Arena Desativada =(</h1>

              <h5> Arena desativada nesta {weekSelect}</h5>

              <button onClick={() => closeModalInformeArenaDisable()}>Fechar</button>

            </section>
          </Modal>

          {/* modal detalhes da reserva */}
          <Modal
            isOpen={isOpenDetails}
            onRequestClose={closeModalDetails}
            style={customStylesModalDetails}
            shouldCloseOnOverlayClick={false}
          >
            <header className="header-modal-informe">

              <img src={Logo} alt="logo" />

              <div className="area-close" onClick={closeModalDetails}>
                <FiX size={24} />
              </div>
            </header>
            <section className="main-modal-details">

              <h1>{resultCard[0]?.observation}</h1>

              <div className="area-data-details">
                <p><CiStopwatch size={22} color="#FF8A5B" />


                  Fixo: {
                    resultCard[0]?.dataReserve
                      ? format(new Date(resultCard[0]?.dataReserve), 'eee', { locale: ptBR })
                      : 'Data inválida'
                  }
                  {' '}das{' '}
                  {resultCard[0]?.timeInitial.split(":").slice(0, 2).join(":")}
                  {' '}às{' '}
                  {resultCard[0]?.timeFinal.split(":").slice(0, 2).join(":")}
                </p>


                <strong><CiGrid42 size={22} color="#FF8A5B" />Quadra 1</strong>
              </div>

              <h5>
                <CiCalendar size={22} color="#FF8A5B" />
                Fixo a partir de: {
                  resultCard[0]?.dataReserve
                    ? format(new Date(resultCard[0]?.dataReserve), 'dd/MM/yyyy')
                    : 'Data inválida'
                }
              </h5>

              <button onClick={() => closeModalDetails()}>Fechar</button>

            </section>

          </Modal>
        </>


      )}
    </>
  );
}
