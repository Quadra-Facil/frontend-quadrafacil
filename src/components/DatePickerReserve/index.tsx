import "react-day-picker/style.css";
import "./style.css";
import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { setHours, setMinutes, setSeconds, differenceInMilliseconds, format, isBefore, isSameDay, isToday, isAfter, isEqual } from "date-fns";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
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

// Tipos melhorados
type Space = {
  spaceId: number;
  name: string;
  sports: string;
};

type Reserve = {
  id_reserve: number;
  userId: number;
  arenaId: number;
  spaceId: number;
  dataReserve: string;
  timeInitial: string;
  timeFinal: string;
  status: string;
  typeReserve: "avulsa" | "fixo";
  observation: string;
};

type WeekDaysResponse = {
  $id: string;
  $values: number[];
};

type Promotion = {
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
};

type ArenaSchedule = {
  $id: string;
  id: number;
  arenaId: number;
  weekDays: WeekDaysResponse;
  startTime: string;
  endTime: string;
  open: boolean;
};

type ScheduleResponse = {
  $id: string;
  $values: ArenaSchedule[];
};

// Estilos modais
const customStylesModalReserve = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#f8f8f8',
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
    width: '60vw',
    height: '70vh',
    maxWidth: '100%',
    color: '#6c6c6c',
    zIndex: 10000,
    overflow: "none"
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

export function DatePickerReserve() {
  // Contextos e navegação
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};
  const location = useLocation();
  const { arenaId, arena, sports, GetvalueHour } = location.state || {};

  // Estados principais
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:00");
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const [selectedSpaceReserved, setSelectedSpaceReserved] = useState<number | null>(null);
  const [modalIsOpenReserve, setIsOpenReserve] = useState(false);
  const [isOpenInforme, setIsOpenInforme] = useState(false);

  // Estados de loading
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReserve, setIsLoadingReserve] = useState(false);

  // Estados de dados
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesReserved, setSpacesReserved] = useState<Space[]>([]);
  const [reserveSpace, setReserveSpace] = useState<Reserve[]>([]);
  const [loadPromotions, setLoadPromotions] = useState<Promotion[]>([]);
  const [loadExpedient, setLoadExpedient] = useState<ScheduleResponse | undefined>();

  // Estados de UI
  const [sendTitle, setSendTitle] = useState<'success' | 'error' | ''>('');
  const [sendMessage, setSendMessage] = useState('');
  const [expedientMessage, setExpedientMessage] = useState('');
  const [messageInformeError, setMessageInformeError] = useState('');
  const [showReservations, setShowReservations] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1014);

  // Estados derivados
  const selectedDate = useMemo(() => {
    return selected ? format(selected, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
  }, [selected]);

  const formattedDate = useMemo(() => {
    if (!selected) return format(new Date(), "eeee dd/MM", { locale: ptBR });
    return isSameDay(selected, new Date()) ? "Hoje" : format(selected, "eeee dd/MM", { locale: ptBR });
  }, [selected]);

  const expedientInfo = useMemo(() => {
    if (!loadExpedient?.$values?.length) return { start: '', end: '', message: '' };

    const selectedDateObj = selected || new Date();
    const dayOfWeek = selectedDateObj.getDay();
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;

    const expedientForDay = loadExpedient.$values.find(exp =>
      exp.weekDays.$values.includes(adjustedDay)
    );

    if (!expedientForDay) return { start: '', end: '', message: '⏰' };

    if (!expedientForDay.open) {
      return { start: '', end: '', message: 'Arena fechada' };
    }

    return {
      start: expedientForDay.startTime.substring(0, 5),
      end: expedientForDay.endTime.substring(0, 5),
      message: ''
    };
  }, [loadExpedient, selected]);

  // Promoções calculadas
  const { promoTypeResult, getPromoType, valueGetPromo } = useMemo(() => {
    if (!startTime || !endTime || loadPromotions.length === 0) {
      return { promoTypeResult: '', getPromoType: 'Nenhuma', valueGetPromo: GetvalueHour };
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    let diffMinutes = endTotal - startTotal;
    if (diffMinutes < 0) diffMinutes += 24 * 60;

    const hours = Math.floor(diffMinutes / 60);
    const timeDiff = `${hours}h`;

    // Filtra promoções
    const dayUsePromos = loadPromotions.filter(p =>
      p.promotionType === "dayuse" &&
      p.weekDays.$values.includes(new Date().getDay() || 7)
    );

    const timeDiffPromos = loadPromotions.filter(p =>
      p.promotionType === timeDiff
    );

    if (dayUsePromos.length > 0) {
      return {
        promoTypeResult: `Day use - R$ ${dayUsePromos[0].value.toString()} por pessoa.`,
        getPromoType: dayUsePromos[0].promotionType,
        valueGetPromo: dayUsePromos[0].value
      };
    }

    if (timeDiffPromos.length > 0) {
      return {
        promoTypeResult: `${timeDiffPromos[0].promotionType} pagando menos - R$ ${timeDiffPromos[0].value.toFixed(2)}`,
        getPromoType: timeDiffPromos[0].promotionType,
        valueGetPromo: timeDiffPromos[0].value
      };
    }

    return {
      promoTypeResult: "Nenhuma promoção encontrada.",
      getPromoType: "Nenhuma",
      valueGetPromo: GetvalueHour
    };
  }, [startTime, endTime, loadPromotions, GetvalueHour]);

  // Handlers e funções auxiliares
  const openModalReserve = useCallback(() => setIsOpenReserve(true), []);
  const closeModalReserve = useCallback(() => {
    setIsOpenReserve(false);
    navigate("/principal");
  }, [navigate]);

  const openModalInformeExp = useCallback(() => setIsOpenInforme(true), []);
  const closeModalInformeExp = useCallback(() => setIsOpenInforme(false), []);

  const roundMinutes = (minutes: number): number => minutes <= 15 ? 0 : 30;

  const validateTimeInput = useCallback((time: string, type: "start" | "end"): boolean => {
    if (!time || time === "00:00:00") {
      setSendTitle('error');
      setSendMessage(`Preencha o horário ${type === "start" ? "inicial" : "final"}`);
      return false;
    }
    return true;
  }, []);

  const validateReservation = useCallback((): boolean => {
    // 1. Verificar se há espaço selecionado
    if (!selectedSpace) {
      setSendTitle('error');
      setSendMessage('Selecione um espaço');
      return false;
    }

    // 2. Verificar se os campos de horário estão preenchidos
    if (!validateTimeInput(startTime, "start") || !validateTimeInput(endTime, "end")) {
      return false;
    }

    const currentDate = new Date();
    const selectedDateObj = selected || currentDate;
    const isToday = isSameDay(selectedDateObj, currentDate);

    // 3. Converter horários para objetos Date
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startDateTime = setMinutes(setHours(selectedDateObj, startHour), startMinute);
    const endDateTime = setMinutes(setHours(selectedDateObj, endHour), endMinute);

    // 4. Verificar se horário final é antes do inicial
    if (isBefore(endDateTime, startDateTime) || isEqual(endDateTime, startDateTime)) {
      setSendTitle('error');
      setSendMessage('O horário final deve ser após o horário inicial');
      return false;
    }

    // 5. Verificar expediente
    const dayOfWeek = selectedDateObj.getDay();
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    const expedientForDay = loadExpedient?.$values?.find(exp =>
      exp.weekDays.$values.includes(adjustedDay)
    );

    if (!expedientForDay || !expedientForDay.open) {
      setSendTitle('error');
      setSendMessage('A arena está fechada nesta data');
      return false;
    }

    // Converter horários do expediente para comparação
    const [expStartHour, expStartMinute] = expedientForDay.startTime.split(':').map(Number);
    const [expEndHour, expEndMinute] = expedientForDay.endTime.split(':').map(Number);

    const expStartDateTime = setMinutes(setHours(selectedDateObj, expStartHour), expStartMinute);
    const expEndDateTime = setMinutes(setHours(selectedDateObj, expEndHour), expEndMinute);

    // Verificar se está dentro do expediente
    if (isBefore(startDateTime, expStartDateTime)) {
      setSendTitle('error');
      setSendMessage(`O horário inicial deve ser após ${format(expStartDateTime, 'HH:mm')}`);
      return false;
    }

    if (isAfter(endDateTime, expEndDateTime)) {
      setSendTitle('error');
      setSendMessage(`O horário final deve ser antes de ${format(expEndDateTime, 'HH:mm')}`);
      return false;
    }

    // 6. Verificar se é hoje e se o horário já passou
    if (isToday) {
      if (isBefore(startDateTime, currentDate)) {
        setSendTitle('error');
        setSendMessage(`O horário inicial já passou. Selecione após ${format(currentDate, 'HH:mm')}`);
        return false;
      }

      if (isBefore(endDateTime, currentDate)) {
        setSendTitle('error');
        setSendMessage('O horário final já passou');
        return false;
      }
    }

    // 7. Verificar conflito com reservas existentes
    if (reserveSpace.some(reserve => {
      const reserveStart = new Date(`${reserve.dataReserve}T${reserve.timeInitial}`);
      const reserveEnd = new Date(`${reserve.dataReserve}T${reserve.timeFinal}`);

      return (
        (isBefore(startDateTime, reserveEnd) && isAfter(endDateTime, reserveStart)) ||
        isEqual(startDateTime, reserveStart) ||
        isEqual(endDateTime, reserveEnd)
      );
    })) {
      setSendTitle('error');
      setSendMessage('Já existe uma reserva para este horário');
      return false;
    }

    return true;
  }, [selectedSpace, startTime, endTime, selected, loadExpedient, reserveSpace, validateTimeInput]);

  const handleTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, isStart: boolean) => {
    const time = event.target.value;
    const [hour, minute] = time.split(":").map(Number);
    const roundedMinute = roundMinutes(minute);
    const formattedTime = `${String(hour).padStart(2, "0")}:${String(roundedMinute).padStart(2, "0")}:00`;

    if (isStart) {
      setStartTime(formattedTime);
    } else {
      setEndTime(formattedTime);
    }
  }, []);

  const handleSpace = useCallback((id: number) => {
    setSelectedSpace(id);
    setSelectedSpaceReserved(id);
  }, []);

  // Funções de API
  const getSpaceSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/newSpace/search/space", {
        arenaId: arenaId,
        sports: String(sports),
      });

      const spacesData = Array.isArray(response.data.$values) ? response.data.$values : [];
      setSpaces(spacesData);
      setSpacesReserved(spacesData);

      console.log("Spaces: ", spaces)
      console.log("SpacesReserved: ", spacesReserved)

      if (spacesData.length > 0) {
        handleSpace(spacesData[0].spaceId);
      }
    } catch (error: any) {
      setSendTitle('error');
      setSendMessage(error.response?.data?.erro || 'Erro ao carregar espaços');
    } finally {
      setIsLoading(false);
    }
  }, [arenaId, sports, handleSpace]);

  const getReserves = useCallback(async () => {
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
      console.error("Erro ao buscar reservas:", error);
      setSendTitle('error');
      setSendMessage('Erro ao carregar reservas');
    } finally {
      setIsLoadingReserve(false);
    }
  }, [arenaId, selectedSpace, selectedDate]);
  const getExpedient = useCallback(async () => {
    try {
      const response = await api.post("/api/ArenaHours/get", { arenaId });
      setLoadExpedient(response?.data);
    } catch (error: any) {
      setSendTitle('error');
      setSendMessage(error?.response?.data || 'Erro ao carregar expediente');
    }
  }, [arenaId]);

  const getPromotions = useCallback(async () => {
    if (!user?.arena) return;

    try {
      const response = await api.post("/api/Promotions/get-promotion", {
        arenaId: user.arena,
      });
      setLoadPromotions(response?.data?.$values || []);
    } catch (error: any) {
      setSendTitle("error");
      setSendMessage(error?.response?.data || 'Erro ao carregar promoções');
    }
  }, [user?.arena]);

  const handleCreateReservation = useCallback(async () => {
    if (!validateReservation()) return;

    setIsLoadingReserve(true);
    try {
      const response = await api.post("/api/reserve", {
        userId: user?.userId,
        arenaId: arenaId,
        spaceId: selectedSpace,
        dataReserve: selectedDate,
        timeInitial: startTime,
        timeFinal: endTime,
        typeReserve: "avulsa",
        observation: "",
        promotion: getPromoType !== "Nenhuma",
        promotionType: getPromoType !== "Nenhuma" ? getPromoType : null,
        value: valueGetPromo
      });

      setSendTitle('success');
      setSendMessage(response?.data?.message || 'Reserva criada com sucesso');
      getReserves();
    } catch (error: any) {
      setSendTitle('error');
      setSendMessage(error?.response?.data || 'Erro ao criar reserva');
    } finally {
      setIsLoadingReserve(false);
    }
  }, [validateReservation, user, arenaId, selectedSpace, selectedDate, startTime, endTime, getPromoType, valueGetPromo, getReserves]);

  // Efeitos
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
    openModalReserve();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1014);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (arenaId && sports) {
      getSpaceSearch();
    }
  }, [arenaId, sports, getSpaceSearch]);

  useEffect(() => {
    if (modalIsOpenReserve) {
      getExpedient();
      getPromotions();
    }
  }, [modalIsOpenReserve, getExpedient, getPromotions]);

  useEffect(() => {
    if (arenaId && selectedSpace && selectedDate) {
      getReserves();
    }
  }, [arenaId, selectedSpace, selectedDate, getReserves]);

  // Renderização
  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Modal
            isOpen={modalIsOpenReserve}
            onRequestClose={closeModalReserve}
            style={customStylesModalReserve}
            shouldCloseOnOverlayClick={false}
          >
            <header className="header-modal-reserve">
              <h1><strong>{arena}</strong></h1>
              <p>{formattedDate}</p>
              {expedientInfo.message ? (
                <p>{expedientInfo.message}</p>
              ) : (
                <p>Aberto: {expedientInfo.start} às {expedientInfo.end}</p>
              )}
              <div className="area-close" onClick={closeModalReserve}>
                <FiX size={24} />
              </div>
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

                <div className="area-picker" onMouseUp={getReserves}>
                  <DatePickerHourReserved
                    selectedDate={selectedDate}
                    setSelectedDate={(date: any) => setSelected(new Date(date))}
                  />
                </div>

                <section className="area-space-left">
                  {spacesReserved.length === 0 ? (
                    <>
                      <h1>Não encontramos espaços para: <strong>{sports}</strong></h1>
                      <h5 onClick={() => navigate("/searchArena")}>Escolher outro esporte</h5>
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
                ) : reserveSpace.length > 0 ? (
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
                          setSendMessage('Horário já reservado');
                        }}
                      >
                        <strong style={{ fontWeight: '450' }}>
                          {format(new Date(`1970-01-01T${item.timeInitial}`), "HH:mm")} às {" "}
                          {format(new Date(`1970-01-01T${item.timeFinal}`), "HH:mm")}
                        </strong>
                        <div className="type-reserve">
                          <p>{item.typeReserve === 'avulsa' ? "Avulsa" : "Fixo"}</p>
                          {item.typeReserve === 'avulsa' ? <BsEmojiSunglasses /> : <MdOutlinePushPin />}
                        </div>
                      </div>
                    ))
                ) : (
                  <div style={{ borderBottom: '1px solid #FF8A5B', textAlign: 'center' }}>
                    Sem reservas feitas para esta data
                  </div>
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
                  locale={ptBR}
                />

                <form>
                  <label>
                    Início:{" "}
                    <input
                      type="time"
                      value={startTime.slice(0, 5)}
                      onChange={(e) => handleTimeChange(e, true)}
                      min={expedientInfo.start}
                      max={expedientInfo.end}
                    />
                  </label>
                  <label>
                    Fim:{" "}
                    <input
                      type="time"
                      value={endTime.slice(0, 5)}
                      onChange={(e) => handleTimeChange(e, false)}
                      min={startTime.slice(0, 5) || expedientInfo.start}
                      max={expedientInfo.end}
                    />
                  </label>
                </form>

                <h5>
                  <strong>Promoção: </strong>
                  {promoTypeResult || 'Nenhuma promoção encontrada'}
                </h5>

                <button
                  className="btn-reserve"
                  onClick={handleCreateReservation}
                  disabled={isLoadingReserve}
                >
                  {isLoadingReserve ? 'Processando...' : 'Reservar'}
                </button>
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
              {expedientInfo.message ? (
                <h5><strong>Informe:</strong> {expedientInfo.message} para <strong>{formattedDate}</strong></h5>
              ) : (
                <h5><strong>Informe:</strong> {messageInformeError}</h5>
              )}
              {user?.role === "admin" && (
                <h5>Expediente em: configs/expediente</h5>
              )}
              <button onClick={closeModalInformeExp}>Fechar</button>
            </section>
          </Modal>
        </>
      )}
    </>
  );
}