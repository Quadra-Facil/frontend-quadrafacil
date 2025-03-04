import "react-day-picker/style.css"; // Importando o estilo padrão
import "./style.css"; // Importando o arquivo CSS customizado
import { useContext, useEffect, useState } from "react";
import { setHours, setMinutes, setSeconds, differenceInMilliseconds, format, getHours, isBefore } from "date-fns";
import { DayPicker, Locale } from "react-day-picker";
import { pt, ptBR } from "date-fns/locale";
import Toast from "../Toast";
import Loading from "../Loading";
import LoadingReserve from "../../img/loadingreserve.json";
import Modal from "react-modal";
import { FiX } from "react-icons/fi";
import { MdOutlinePushPin } from "react-icons/md";
import { BsEmojiSunglasses } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/axiosApi/apiClient";
import { AuthContext } from "../../services/contexts/AuthContext";
import DatePickerHourReserved from "../DatePickerHourReserved";
import ModalSerchArena from "../ModalSearchArena";
import Lottie from "lottie-react";
import Logo from "../../img/logomarca.svg"


interface Space {
  spaceId: number;
  name: string;
  sports: string;
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

interface WeekDaysResponse {
  $id: string;
  $values: number[];
}

interface Promotion {
  $id: string;
  id: number;
  promotionType: string;
  when: string;
  weekDays: WeekDaysResponse;
  value: number;
  qtdPeople: number;
  arenaId: number;
  startDate?: string;
  endDate?: string;
}

interface PromotionResponse {
  $id: string;
  $values: Promotion[];
}

interface WeekDays {
  $id: string;
  $values: number[];
}

interface ArenaSchedule {
  $id: string;
  id: number;
  arenaId: number;
  weekDays: WeekDays;
  startTime: string;
  endTime: string;
  open: boolean;
}

interface ScheduleResponse {
  $id: string;
  $values: ArenaSchedule[];
}



export function DatePickerReserve() {
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>("00:00:00");
  const [endTime, setEndTime] = useState<string>("00:00:00");
  const [timeDiff, setTimeDiff] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingReserve, setIsLoadingReserve] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [modalIsOpenReserve, setIsOpenReserve] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const [spacesReserved, setSpacesReserved] = useState<Space[]>([]);
  const [selectedSpaceReserved, setSelectedSpaceReserved] = useState<number | null>(null);
  const [reserveSpace, setReserveSpace] = useState<Reserve[]>([]);
  const [loadPromotions, setLoadPromotions] = useState<Promotion[]>([]);

  const [promoTypeResult, setPromoTypeResult] = useState<string>('')
  const [getPromoType, setGetPromoType] = useState<string>('')

  const [valueGetPromo, setValueGetPromo] = useState<any>()

  const [loadExpedient, setLoadExpedient] = useState<ScheduleResponse | undefined>();
  const [startTimeExp, setStartTimeExp] = useState<string>('');
  const [endTimeExp, setEndTimeExp] = useState<string>('');
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [expedientMessage, setExpedientMessage] = useState<string>('');
  const [isOpenInforme, setIsOpenInforme] = useState<boolean>(false);
  const [messageInformeError, setMessageInformeError] = useState<string>('')

  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { user }: any = authContext;
  const location = useLocation();
  const { arenaId, arena, sports, GetvalueHour } = location.state || {};

  function openModalReserve() {
    setIsOpenReserve(true);
  }

  function closeModalReserve() {
    setIsOpenReserve(false);
    navigate("/principal");
  }

  const customStylesModalReserve = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#f8f8f8',
      border: '1px solid #ccc',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '70vw',
      height: '95vh',
      maxWidth: '80%',
      color: '#6c6c6c',
      zIndex: 10000,
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

  useEffect(() => {
    openModalReserve();
  }, []);

  useEffect(() => {
    async function getSpaceSearch() {
      setIsLoading(true);
      try {
        const response = await api.post("/api/newSpace/search/space", {
          arenaId: arenaId,
          sports: String(sports),
        });

        if (Array.isArray(response.data.$values)) {
          setSpaces(response.data.$values);
          setSpacesReserved(response.data.$values);
        } else {
          setSpaces([]);
          setSpacesReserved([]);
        }
      } catch (error: any) {
        setSendTitle('error');
        setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    }

    getSpaceSearch();
  }, [arenaId, sports]);

  const roundMinutes = (minutes: number): number => minutes <= 15 ? 0 : 30;


  // verificação dos inputs timers 
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>, isStart: boolean) => {
    const time = event.target.value;
    const [hour, minute] = time.split(":").map(Number);
    const roundedMinute = roundMinutes(minute);
    const formattedTime = `${String(hour).padStart(2, "0")}:${String(roundedMinute).padStart(2, "0")}:00`;

    // Se é o Start Time
    if (isStart) {
      setStartTime(formattedTime);
      // console.log("Horário de início selecionado:", formattedTime);
      checkTimeValidity(formattedTime, "start");
    }
    // Se é o End Time
    else {
      setEndTime(formattedTime);
      // console.log("Horário de fim selecionado:", formattedTime);
      checkTimeValidity(formattedTime, "end");
    }
  };

  const checkTimeValidity = (selectedTime: string, type: "start" | "end") => {

    if (!loadExpedient) {
      console.log("Expediente não carregado.");
      return;
    }

    // Se não houver data selecionada, define como a data de hoje
    const selectedDate = selected ? new Date(selected) : new Date(); // Usa a data atual se 'selected' não estiver definido

    // Obter o dia da semana baseado na data selecionada
    const selectedDay = selectedDate.getDay(); // Usando a data selecionada ou a data de hoje
    const adjustedSelectedDay = selectedDay === 0 ? 7 : selectedDay; // Se o dia selecionado for domingo, ajusta para 7

    // Encontrar o expediente para o dia selecionado
    const expedientForSelectedDay = loadExpedient.$values.find((expedient) =>
      expedient.weekDays.$values.includes(adjustedSelectedDay)
    );

    if (expedientForSelectedDay) {
      const { startTime: expStartTime, endTime: expEndTime } = expedientForSelectedDay;

      // Converte os horários de expediente e os horários selecionados em objetos Date para facilitar a comparação
      const [expStartHour, expStartMinute] = expStartTime.split(":").map(Number);
      const [expEndHour, expEndMinute] = expEndTime.split(":").map(Number);
      const [selectedStartHour, selectedStartMinute] = selectedTime.split(":").map(Number);

      // Verificar se a hora e minuto são válidos
      if (isNaN(expStartHour) || isNaN(expStartMinute) || isNaN(expEndHour) || isNaN(expEndMinute) || isNaN(selectedStartHour) || isNaN(selectedStartMinute)) {
        setMessageInformeError("Horário inválido.");
        openModalInformeExp();
        return;
      }

      const expStart = new Date();
      expStart.setHours(expStartHour, expStartMinute, 0);

      const expEnd = new Date();
      expEnd.setHours(expEndHour, expEndMinute, 0);

      const selectedTimeObj = new Date();
      selectedTimeObj.setHours(selectedStartHour, selectedStartMinute, 0);

      // Validação para startTime
      if (type === "start") {
        if (selectedTimeObj >= expStart) {
          console.log("Horário de início válido.");
        } else {
          setMessageInformeError(`Arena ainda não estará aberta no horário inicial, selecione a partir das ${format(expStart, "HH'h'")}.`);
          openModalInformeExp();
          setStartTime('00:00');
          return;
        }

        // Validação para verificação de data e hora atual
        const todayDate = format(new Date(), "yyyy-MM-dd");
        const selectedDateFormatted = format(selectedDate, "yyyy-MM-dd"); // Formata para "yyyy-MM-dd"

        if (todayDate === selectedDateFormatted) {
          const currentTime = new Date().getHours(); // Hora atual

          // Comparar hora atual com a hora selecionada
          if (currentTime > selectedTimeObj.getHours()) {
            setMessageInformeError(`Este horário inicial já passou.`);
            openModalInformeExp();
            setStartTime('00:00');
            return;
          }
          if (selectedTimeObj <= expStart) {
            console.log("selectedTimeObj: ", selectedTimeObj)
            console.log("expStart: ", expStart)
            setMessageInformeError(`Horário fora do expediente.`);
            openModalInformeExp();
            setStartTime('00:00');
            return;
          }
        }

      }

      // Validação para endTime
      if (type === "end") {
        const [selectedEndHour, selectedEndMinute] = selectedTime.split(":").map(Number);
        const selectedEndTimeObj = new Date();
        selectedEndTimeObj.setHours(selectedEndHour, selectedEndMinute, 0);

        // Verificar se a hora de término é válida
        if (isNaN(selectedEndHour) || isNaN(selectedEndMinute)) {
          setMessageInformeError("Horário final inválido.");
          openModalInformeExp();
          return;
        }

        // Validação do horário de fim em relação ao expediente
        if (selectedEndTimeObj <= expEnd) {
          console.log("Horário de fim válido.");
        } else {
          setMessageInformeError(`Horário final fora do expediente da arena, selecione a partir até ${format(expEnd, "HH'h'")}.`);
          openModalInformeExp();
          setEndTime('00:00');
          return;
        }

        // Validação adicional para garantir que endTime seja maior ou igual a startTime
        if (selectedEndTimeObj < expStart) {
          setMessageInformeError(`Selecione um horário das ${format(expStart, "HH'h'")} até ${format(expEnd, "HH'h'")} para o dia selecionado.`);
          openModalInformeExp();
          setStartTime('00:00');
          setEndTime('00:00');
          return;
        }
      }
    } else {
      setMessageInformeError("Expediente para o dia selecionado não encontrado.");
      openModalInformeExp();
      setStartTime('00:00');
      setEndTime('00:00');
      return;
    }
  };

  useEffect(() => {
    if (user?.arena) {
      api.post("/api/Promotions/get-promotion", {
        arenaId: user?.arena,
      })
        .then((response) => {
          setLoadPromotions(response?.data?.$values);
        })
        .catch((error: any) => {
          setSendTitle("error");
          setSendMessage(error?.response?.data);
        });
    }
  }, [arenaId]); // Só executa quando o arenaId mudar

  useEffect(() => {
    if (startTime && endTime && loadPromotions.length > 0) {
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      // Converter os horários em minutos
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      // Calcular a diferença em minutos
      let diffInMinutes = endTotalMinutes - startTotalMinutes;

      // Se a diferença for negativa, significa que o horário final é no dia seguinte
      if (diffInMinutes < 0) {
        diffInMinutes += 24 * 60; // Adicionar 24 horas em minutos
      }

      // Calcular as horas
      const hours = Math.floor(diffInMinutes / 60);

      // Atualiza a diferença em horas no estado
      const timeDiff = `${hours}h`;
      setTimeDiff(timeDiff);

      // Filtrar as promoções com base no tipo de promoção igual à diferença de horas
      const filterPromo = loadPromotions.filter(
        (item) => item.promotionType === timeDiff
      );

      const getDay = new Date().getDay();
      const filterDayUse = loadPromotions.filter(
        (item) => item.promotionType === "dayuse"
      );

      // Verifica se o dia atual está presente no array `weekDays` da promoção dayuse
      const dayUseValid = filterDayUse.filter((item) => item.weekDays.$values.includes(getDay));

      //se o dia atual for dayuse
      if (dayUseValid.length > 0) {
        setPromoTypeResult(`Day use - R$ ${dayUseValid[0].value.toString()} por pessoa.`);
        setGetPromoType(filterPromo[0]?.promotionType);
        setValueGetPromo(filterPromo[0]?.value as any);
        return;
        // Se houver promoções no intervalo
      } else if (filterPromo.length > 0) {
        setPromoTypeResult(
          `${filterPromo[0]?.promotionType} pagando menos - R$ ${filterPromo[0]?.value.toFixed(2)}`
        );
        setGetPromoType(filterPromo[0]?.promotionType);
        setValueGetPromo(filterPromo[0]?.value as any);
      } else {
        setPromoTypeResult("Nenhuma promoção encontrada.");
        setGetPromoType("Nenhuma");
        setValueGetPromo(GetvalueHour);
      }


    }
  }, [startTime, endTime, loadPromotions]); // Apenas quando startTime, endTime ou loadPromotions mudarem


  const getReserves = async () => {
    if (!arenaId || !selectedSpace || !selectedDate) return;

    setIsLoadingReserve(true);

    try {
      const response = await api.post("/getReserves/date", {
        arenaId: arenaId,
        spaceId: selectedSpace,
        dataReserve: selectedDate,
      });

      setReserveSpace(response.data);
    } catch (error) {
      console.log("Erro ao buscar reservas:", error);
    } finally {
      setIsLoadingReserve(false);
    }
  };

  useEffect(() => {
    if (arenaId && selectedSpace && selectedDate) {
      getReserves();
    }
  }, [arenaId, selectedSpace, selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      setSelectedDate(formattedDate);
    }
  }, [selectedDate]);

  const calculateDifference = (start: string, end: string, selectedDate: Date) => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    const startDateStart = setSeconds(setMinutes(setHours(selectedDate, startHour), startMinute), 0);
    const startDateEnd = setSeconds(setMinutes(setHours(selectedDate, endHour), endMinute), 0);

    const diffInMilliseconds = differenceInMilliseconds(startDateEnd, startDateStart);
    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

    setTimeDiff(`${hours}h`);
  };

  const calculeHoursAndCreateReserve = async () => {
    const currentTime = new Date();
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [startHourEnd, startMinuteEnd] = endTime.split(":").map(Number);

    const startDateStart = setMinutes(setHours(new Date(), startHour), startMinute);
    const startDateEnd = setMinutes(setHours(new Date(), startHourEnd), startMinuteEnd);

    if (selectedSpace == null) {
      setSendTitle('error');
      setSendMessage(`Selecione um espaço.`);
      return;
    } else if (startTime >= endTime) {
      setSendTitle('error');
      setSendMessage(`Horários incorretos.`);
      return;
    } else if (isBefore(startDateStart, currentTime)) {
      setSendTitle('error');
      setSendMessage(`Horário inicial incorreto.`);
      return;
    } else if (isBefore(startDateEnd, currentTime)) {
      setSendTitle('error');
      setSendMessage(`Horário final incorreto.`);
      return;
    }

    else {
      selected && startTime && endTime && calculateDifference(startTime, endTime, selected);

      try {
        // Fazer a reserva com os dados da promoção selecionada
        const response = await api.post("/api/reserve", {
          userId: user.userId,
          arenaId: arenaId,
          spaceId: selectedSpace,
          dataReserve: selected === undefined ? format(new Date(), "yyyy-MM-dd") : format(selected as Date, "yyyy-MM-dd"),
          timeInitial: startTime,
          timeFinal: endTime,
          typeReserve: "avulsa",
          observation: "",
          promotion: getPromoType !== "Nenhuma" ? true : false,
          promotionType: getPromoType !== "Nenhuma" ? getPromoType : null, // Enviar o tipo da promoção selecionada
          value: valueGetPromo
        });

        // Se a reserva for bem-sucedida
        setSendTitle('success');
        setSendMessage(`${response?.data?.message}`);
      } catch (error: any) {
        // Se ocorrer um erro
        setSendTitle('error');
        setSendMessage(`${error?.response?.data}`);
      }
    }
  };

  //seleciono o primeiro space por padrão
  useEffect(() => {
    if (modalIsOpenReserve && spaces.length > 0) {
      handleSpace(spaces[0]?.spaceId);
    }
  }, [modalIsOpenReserve, spaces]);

  const handleSpace = (id: number) => {
    setSelectedSpace(id);
    setSelectedSpaceReserved(id);
  };

  //expediente

  // Função para obter dados de expediente
  async function GetExpedient() {
    try {
      const response = await api.post("/api/ArenaHours/get", {
        arenaId: arenaId
      });

      // Definindo o estado com os valores recebidos
      const expedientData = response?.data;
      setLoadExpedient(expedientData); // O objeto retornado já é do tipo ScheduleResponse
    } catch (error: any) {
      setSendTitle('error');
      setSendMessage(`${error?.response?.data}`);
    }
  }

  // Função para pegar o "weekDay" da data selecionada ou da data de hoje
  function getWeekDay(date: Date) {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 ? 7 : dayOfWeek; // Ajusta para domingo ser 7, e os outros dias de segunda a sábado como 1 a 6
  }

  // Chama GetExpedient sempre que o modal for aberto
  useEffect(() => {
    if (modalIsOpenReserve) {
      GetExpedient();
    }
  }, [modalIsOpenReserve]);

  useEffect(() => {
    if (loadExpedient && loadExpedient.$values.length > 0) {
      // Verifica a data selecionada ou usa a data atual
      const selectedDate = selected ? selected : new Date(); // Se houver data selecionada, usa ela. Caso contrário, usa a data atual.
      const adjustedGetDay = getWeekDay(selectedDate); // Obtém o dia ajustado da semana para a data selecionada

      // Filtra o expediente com base no weekDay
      const getExpToday = loadExpedient.$values.filter((item: ArenaSchedule) => {
        return item.weekDays?.$values.includes(adjustedGetDay);
      });

      if (getExpToday.length > 0) {
        // Verifica se o expediente está aberto (open === true)
        const currentExpedient = getExpToday[0];

        if (!currentExpedient.open) {
          openModalInformeExp()
          setExpedientMessage('Arena fechada');
          setStartTimeExp('');
          setEndTimeExp('');
        } else {
          // Formatando o horário para mostrar apenas horas e minutos
          const startTimeFormatted = currentExpedient.startTime.substring(0, 5); // Pega "HH:mm"
          const endTimeFormatted = currentExpedient.endTime.substring(0, 5); // Pega "HH:mm"

          setStartTimeExp(startTimeFormatted); // Atualiza o estado com o horário de início
          setEndTimeExp(endTimeFormatted); // Atualiza o estado com o horário de término
          setExpedientMessage(''); // Limpa a mensagem de "Sem expediente"
        }
      } else {
        // Se não encontrar expediente para o dia, limpa os estados e exibe a mensagem
        setStartTimeExp('');
        setEndTimeExp('');
        setExpedientMessage('⏰');
      }
    }
  }, [loadExpedient, selected]); // Executa quando loadExpedient ou selected (data selecionada) mudarem

  // Função para formatar a data
  function formatSelectedDate(selected: Date | undefined) {
    const today = new Date();

    if (!selected) {
      return format(today, "eeee dd/MM", { locale: pt }); // Se não houver data selecionada, retorna a data de hoje
    }

    const isToday = selected.toDateString() === today.toDateString();

    if (isToday) {
      return "Hoje"; // Se for hoje, retorna "Hoje"
    }

    // Se for outro dia, retorna o nome do dia e a data no formato "Dia da Semana dd/MM"
    return format(selected, "eeee dd/MM", { locale: pt });
  }

  useEffect(() => {
    // Verifica se há data selecionada e formata a data
    const formattedDate = formatSelectedDate(selected);

    // Aqui você pode configurar a mensagem ou a data formatada
    setFormattedDate(formattedDate);

  }, [selected]);

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
      color: '#6c6c6c',
      zIndex: 10000,
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };


  function openModalInformeExp() {
    setIsOpenInforme(true);
  }

  function closeModalInformeExp() {
    setIsOpenInforme(false);
    // closeModalReserve();
  }

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {isLoading ? <Loading /> : (
        <>
          <Modal isOpen={modalIsOpenReserve} onRequestClose={closeModalReserve} style={customStylesModalReserve} shouldCloseOnOverlayClick={false}>
            <header className="header-modal">
              <h1><strong>{arena}</strong></h1>
              <p>{formattedDate}</p>

              {/* Exibe a mensagem de expediente ou a mensagem de sem expediente */}
              {expedientMessage ? (
                <p>{expedientMessage}</p>
              ) : (
                <>
                  <p>Aberto: {startTimeExp} às {endTimeExp}</p>
                </>
              )}
              <div className="area-close" onClick={closeModalReserve}><FiX size={24} /></div>
            </header>
            <div className="main-reserve">
              <section className="area-left">
                <div className="title-left">
                  <h5 className="title-reserved">Horários já reservados</h5>
                  <p>Selecione à direita um horário diferente dos listados abaixo.</p>
                </div>
                <div className="area-picker" onMouseUp={() => getReserves()}>
                  <DatePickerHourReserved
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                  />
                </div>
                <section className="area-space">
                  {
                    spacesReserved.length === 0
                      ?
                      <>
                        <h1>Não encontramos espaços para: <strong>{sports}</strong></h1>
                        <h5 onClick={() => navigate("/searchArena")}>Escolha outro esporte</h5>
                      </>
                      :
                      spacesReserved.map((item) => (
                        <div
                          className="space"
                          onClick={() => handleSpace(item.spaceId)}
                          style={{ backgroundColor: selectedSpaceReserved === item.spaceId ? '#f7cebe' : '' }}
                        >
                          <p className="name-space">{item.name}</p>
                        </div>
                      ))
                  }
                </section>

                {
                  isLoadingReserve ?
                    <div className="loadingReserve">
                      <Lottie
                        animationData={LoadingReserve}
                        loop={true}
                        autoplay={true}
                        className="loading"
                      />
                    </div>
                    :
                    reserveSpace.length != 0 ?
                      reserveSpace
                        .sort((a, b) => {
                          const timeA = new Date(`1970-01-01T${a.timeInitial}Z`).getTime();
                          const timeB = new Date(`1970-01-01T${b.timeInitial}Z`).getTime();
                          return timeA - timeB;
                        })
                        .map((item) => (
                          <div
                            key={item.id_reserve}
                            className="card-reserve"
                            onClick={() => {
                              setSendTitle('error');
                              setSendMessage(`Horário já reservado.`);
                            }}
                          >
                            <strong style={{ fontWeight: '450' }}>
                              {format(new Date(`1970-01-01T${item.timeInitial}`), "HH:mm")} {" "}
                              às {" "}
                              {format(new Date(`1970-01-01T${item.timeFinal}`), "HH:mm")}
                            </strong>
                            <div className="type-reserve">
                              <p>{item.typeReserve == 'avulsa' ? "Reservado" : "Fixo"}</p>
                              {item.typeReserve == 'avulsa' ? <BsEmojiSunglasses /> : <MdOutlinePushPin />}
                            </div>
                          </div>
                        ))
                      :
                      <div style={{ borderBottom: '1px solid #FF8A5B' }}>Sem reservas feitas para esta data.</div>
                }

              </section>

              <section className="area-rigth">
                <section className="area-space">
                  {
                    spaces.length === 0
                      ?
                      <>
                        <h1>Não encontramos espaços para: <strong>{sports}</strong></h1>
                        <h5 onClick={() => navigate("/searchArena")}>Escolha outro esporte</h5>
                      </>
                      :
                      spaces.map((item) => (
                        <div
                          className="space"
                          onClick={() => handleSpace(item.spaceId)}
                          style={{ backgroundColor: selectedSpace === item.spaceId ? '#f7cebe' : '' }}
                        >
                          <p className="name-space">{item.name}</p>
                        </div>
                      ))
                  }
                </section>

                <DayPicker
                  mode="single"
                  selected={selected}
                  onSelect={setSelected}
                  locale={ptBR as Locale}
                />

                <form>
                  <label>Início:{" "}
                    <input type="time" value={startTime.slice(0, 5)} onChange={(e) => handleTimeChange(e, true)} />
                  </label>
                  <label>Fim:{" "}
                    <input type="time" value={endTime.slice(0, 5)} onChange={(e) => handleTimeChange(e, false)} />
                  </label>
                </form>

                <h5><strong>Promoção: </strong> {promoTypeResult || 'Nenhuma promoção encontrada'}</h5>

                <button className="btn-reserve" onClick={calculeHoursAndCreateReserve}>Reservar</button>
              </section>
            </div>
          </Modal>


          {/* modal informe */}
          <Modal
            isOpen={isOpenInforme}
            onRequestClose={closeModalInformeExp}
            style={customStylesModalInforme}
            shouldCloseOnOverlayClick={false}
          >
            <header className="header-modal-informe">

              <img src={Logo} alt="logo" />

              <div className="area-close" onClick={closeModalInformeExp}>
                <FiX size={24} />
              </div>
            </header>
            <section className="main-modal-informe">
              <h1>Fora do expediente =(</h1>

              {
                expedientMessage !== '' ?
                  <h5><strong>Informe:</strong> {expedientMessage} para <strong>{formattedDate}</strong></h5>
                  :
                  <h5><strong>Informe:</strong> {messageInformeError}</h5>
              }

              {
                user?.role === "admin" && (
                  <h5>Expediente em: configs/expediente</h5>
                )
              }

              <button onClick={() => closeModalInformeExp()}>Fechar</button>

            </section>

          </Modal>

        </>
      )}
    </>
  );
}
