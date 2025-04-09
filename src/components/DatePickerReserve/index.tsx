import "react-day-picker/style.css";
import "./style.css";
import { useContext, useEffect, useState } from "react";
import { setHours, setMinutes, setSeconds, differenceInMilliseconds, format, getHours, isBefore } from "date-fns";
import { DayPicker, Locale } from "react-day-picker";
import { pt, ptBR } from "date-fns/locale";
import Toast from "../Toast";
import Loading from "../Loading";
import LoadingReserve from "../../img/loadingreserve.json";
import Modal from "react-modal";
import { FiX, FiCalendar } from "react-icons/fi";
import { MdOutlinePushPin } from "react-icons/md";
import { BsEmojiSunglasses } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/axiosApi/apiClient";
import { AuthContext } from "../../services/contexts/AuthContext";
import DatePickerHourReserved from "../DatePickerHourReserved";
import Lottie from "lottie-react";
import Logo from "../../img/logomarca.svg";

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
  const [showReservations, setShowReservations] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1014);

  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { user }: any = authContext;
  const location = useLocation();
  const { arenaId, arena, sports, GetvalueHour } = location.state || {};

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1014);
      if (window.innerWidth > 1014) {
        setShowReservations(true);
      } else {
        setShowReservations(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      // border: '1px solid #ccc',
      borderRadius: '12px',
      padding: '0px',
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

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>, isStart: boolean) => {
    const time = event.target.value;
    const [hour, minute] = time.split(":").map(Number);
    const roundedMinute = roundMinutes(minute);
    const formattedTime = `${String(hour).padStart(2, "0")}:${String(roundedMinute).padStart(2, "0")}:00`;

    if (isStart) {
      setStartTime(formattedTime);
      checkTimeValidity(formattedTime, "start");
    } else {
      setEndTime(formattedTime);
      checkTimeValidity(formattedTime, "end");
    }
  };

  const checkTimeValidity = (selectedTime: string, type: "start" | "end") => {
    if (!loadExpedient) {
      console.log("Expediente não carregado.");
      return;
    }

    const selectedDate = selected ? new Date(selected) : new Date();
    const selectedDay = selectedDate.getDay();
    const adjustedSelectedDay = selectedDay === 0 ? 7 : selectedDay;

    const expedientForSelectedDay = loadExpedient.$values.find((expedient) =>
      expedient.weekDays.$values.includes(adjustedSelectedDay)
    );

    if (expedientForSelectedDay) {
      const { startTime: expStartTime, endTime: expEndTime } = expedientForSelectedDay;
      const [expStartHour, expStartMinute] = expStartTime.split(":").map(Number);
      const [expEndHour, expEndMinute] = expEndTime.split(":").map(Number);
      const [selectedStartHour, selectedStartMinute] = selectedTime.split(":").map(Number);

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

      if (type === "start") {
        if (selectedTimeObj >= expStart) {
          console.log("Horário de início válido.");
        } else {
          setMessageInformeError(`Arena ainda não estará aberta no horário inicial, selecione a partir das ${format(expStart, "HH'h'")}.`);
          openModalInformeExp();
          setStartTime('00:00');
          return;
        }

        const todayDate = format(new Date(), "yyyy-MM-dd");
        const selectedDateFormatted = format(selectedDate, "yyyy-MM-dd");

        if (todayDate === selectedDateFormatted) {
          const currentTime = new Date().getHours();

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

      if (type === "end") {
        const [selectedEndHour, selectedEndMinute] = selectedTime.split(":").map(Number);
        const selectedEndTimeObj = new Date();
        selectedEndTimeObj.setHours(selectedEndHour, selectedEndMinute, 0);

        if (isNaN(selectedEndHour) || isNaN(selectedEndMinute)) {
          setMessageInformeError("Horário final inválido.");
          openModalInformeExp();
          return;
        }

        if (selectedEndTimeObj <= expEnd) {
          console.log("Horário de fim válido.");
        } else {
          setMessageInformeError(`Horário final fora do expediente da arena, selecione a partir até ${format(expEnd, "HH'h'")}.`);
          openModalInformeExp();
          setEndTime('00:00');
          return;
        }

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
  }, [arenaId]);

  useEffect(() => {
    if (startTime && endTime && loadPromotions.length > 0) {
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      let diffInMinutes = endTotalMinutes - startTotalMinutes;

      if (diffInMinutes < 0) {
        diffInMinutes += 24 * 60;
      }

      const hours = Math.floor(diffInMinutes / 60);
      const timeDiff = `${hours}h`;
      setTimeDiff(timeDiff);

      const filterPromo = loadPromotions.filter(
        (item) => item.promotionType === timeDiff
      );

      const getDay = new Date().getDay();
      const filterDayUse = loadPromotions.filter(
        (item) => item.promotionType === "dayuse"
      );

      const dayUseValid = filterDayUse.filter((item) => item.weekDays.$values.includes(getDay));

      if (dayUseValid.length > 0) {
        setPromoTypeResult(`Day use - R$ ${dayUseValid[0].value.toString()} por pessoa.`);
        setGetPromoType(filterPromo[0]?.promotionType);
        setValueGetPromo(filterPromo[0]?.value as any);
        return;
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
  }, [startTime, endTime, loadPromotions]);

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
          promotionType: getPromoType !== "Nenhuma" ? getPromoType : null,
          value: valueGetPromo
        });

        setSendTitle('success');
        setSendMessage(`${response?.data?.message}`);
      } catch (error: any) {
        setSendTitle('error');
        setSendMessage(`${error?.response?.data}`);
      }
    }
  };

  useEffect(() => {
    if (modalIsOpenReserve && spaces.length > 0) {
      handleSpace(spaces[0]?.spaceId);
    }
  }, [modalIsOpenReserve, spaces]);

  const handleSpace = (id: number) => {
    setSelectedSpace(id);
    setSelectedSpaceReserved(id);
  };

  async function GetExpedient() {
    try {
      const response = await api.post("/api/ArenaHours/get", {
        arenaId: arenaId
      });

      const expedientData = response?.data;
      setLoadExpedient(expedientData);
    } catch (error: any) {
      setSendTitle('error');
      setSendMessage(`${error?.response?.data}`);
    }
  }

  function getWeekDay(date: Date) {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 ? 7 : dayOfWeek;
  }

  useEffect(() => {
    if (modalIsOpenReserve) {
      GetExpedient();
    }
  }, [modalIsOpenReserve]);

  useEffect(() => {
    if (loadExpedient && loadExpedient.$values.length > 0) {
      const selectedDate = selected ? selected : new Date();
      const adjustedGetDay = getWeekDay(selectedDate);

      const getExpToday = loadExpedient.$values.filter((item: ArenaSchedule) => {
        return item.weekDays?.$values.includes(adjustedGetDay);
      });

      if (getExpToday.length > 0) {
        const currentExpedient = getExpToday[0];

        if (!currentExpedient.open) {
          openModalInformeExp()
          setExpedientMessage('Arena fechada');
          setStartTimeExp('');
          setEndTimeExp('');
        } else {
          const startTimeFormatted = currentExpedient.startTime.substring(0, 5);
          const endTimeFormatted = currentExpedient.endTime.substring(0, 5);

          setStartTimeExp(startTimeFormatted);
          setEndTimeExp(endTimeFormatted);
          setExpedientMessage('');
        }
      } else {
        setStartTimeExp('');
        setEndTimeExp('');
        setExpedientMessage('⏰');
      }
    }
  }, [loadExpedient, selected]);

  function formatSelectedDate(selected: Date | undefined) {
    const today = new Date();

    if (!selected) {
      return format(today, "eeee dd/MM", { locale: pt });
    }

    const isToday = selected.toDateString() === today.toDateString();

    if (isToday) {
      return "Hoje";
    }

    return format(selected, "eeee dd/MM", { locale: pt });
  }

  useEffect(() => {
    const formattedDate = formatSelectedDate(selected);
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
  }

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {isLoading ? <Loading /> : (
        <>
          <Modal isOpen={modalIsOpenReserve} onRequestClose={closeModalReserve} style={customStylesModalReserve} shouldCloseOnOverlayClick={false}>
            <header className="header-modal-reserve">
              <h1><strong>{arena}</strong></h1>
              <p>{formattedDate}</p>
              {expedientMessage ? (
                <p>{expedientMessage}</p>
              ) : (
                <>
                  <p>Aberto: {startTimeExp} às {endTimeExp}</p>
                </>
              )}
              <div className="area-close" onClick={closeModalReserve}><FiX size={24} /></div>
            </header>

            {isMobile && (
              <button
                className={!showReservations ? "floating-reservations-button" : "floating-reservations-button-close"}
                onClick={() => setShowReservations(!showReservations)}
              >
                <FiCalendar size={20} />
                <span>{showReservations ? 'Ocultar reservas' : 'Mostrar reservas'}</span>
              </button>
            )}

            <div className="main-reserve">
              <section className={`area-left ${showReservations ? 'show' : ''}`}>
                <div className="title-left">
                  <h5 className="title-reserved">Horários já reservados</h5>
                  <p>Selecione<strong> à direita</strong> um horário diferente dos listados abaixo.</p>
                </div>
                <div className="area-picker" onMouseUp={() => getReserves()}>
                  <DatePickerHourReserved
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                  />
                </div>
                <section className="area-space-left">
                  {spacesReserved.length === 0 ? (
                    <>
                      <h1>Não encontramos espaços para: <strong>{sports}</strong></h1>
                      <h5 onClick={() => navigate("/searchArena")}>Escolha outro esporte</h5>
                    </>
                  ) : (
                    spacesReserved.map((item) => (
                      <div
                        className="space-left"
                        onClick={() => handleSpace(item.spaceId)}
                        style={{ backgroundColor: selectedSpaceReserved === item.spaceId ? '#f7cebe' : '' }}
                        key={item.spaceId}
                      >
                        <p className="name-space">{item.name}</p>
                      </div>
                    ))
                  )}
                </section>

                {isLoadingReserve ? (
                  <div className="loadingReserve">
                    <Lottie
                      animationData={LoadingReserve}
                      loop={true}
                      autoplay={true}
                      className="loading"
                    />
                  </div>
                ) : reserveSpace.length !== 0 ? (
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
                          <p>{item.typeReserve == 'avulsa' ? "Avulsa" : "Fixo"}</p>
                          {item.typeReserve == 'avulsa' ? <BsEmojiSunglasses /> : <MdOutlinePushPin />}
                        </div>
                      </div>
                    ))
                ) : (
                  <div style={{ borderBottom: '1px solid #FF8A5B', textAlign: 'center' }}>Sem reservas feitas para esta data.</div>
                )}
              </section>

              <section className="area-rigth">
                <section className="area-space-reserve">
                  {spaces.length === 0 ? (
                    <>
                      <h1>Não encontramos espaços para: <strong>{sports}</strong></h1>
                      <h5 onClick={() => navigate("/searchArena")}>Escolha outro esporte</h5>
                    </>
                  ) : (
                    spaces.map((item) => (
                      <div
                        className="space-reserve"
                        onClick={() => handleSpace(item.spaceId)}
                        style={{ backgroundColor: selectedSpace === item.spaceId ? '#f7cebe' : '' }}
                        key={item.spaceId}
                      >
                        <p className="name-space">{item.name}</p>
                      </div>
                    ))
                  )}
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

          <Modal
            isOpen={isOpenInforme}
            onRequestClose={closeModalInformeExp}
            style={customStylesModalInforme}
            shouldCloseOnOverlayClick={false}
          >
            <header className="header-modal-informe">
              <img src={Logo} alt="logo" />
              <div className="area-close" onClick={closeModalInformeExp} style={{ marginTop: 15 }}>
                <FiX size={24} />
              </div>
            </header>
            <section className="main-modal-informe">
              <h1>Fora do expediente =(</h1>
              {expedientMessage !== '' ? (
                <h5><strong>Informe:</strong> {expedientMessage} para <strong>{formattedDate}</strong></h5>
              ) : (
                <h5><strong>Informe:</strong> {messageInformeError}</h5>
              )}
              {user?.role === "admin" && (
                <h5>Expediente em: configs/expediente</h5>
              )}
              <button onClick={() => closeModalInformeExp()}>Fechar</button>
            </section>
          </Modal>
        </>
      )}
    </>
  );
}