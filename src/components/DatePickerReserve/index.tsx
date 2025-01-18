import "react-day-picker/style.css"; // Importando o estilo padrão
import "./style.css"; // Importando o arquivo CSS customizado
import { useContext, useEffect, useState } from "react";
import { setHours, setMinutes, setSeconds, differenceInMilliseconds, format, getHours, isBefore } from "date-fns";
import { DayPicker, Locale } from "react-day-picker";
import { ptBR } from "date-fns/locale";
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

  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { user }: any = authContext;
  const location = useLocation();
  const { arenaId, arena, sports } = location.state || {};

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
      color: '#6c6c6c'
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
    } else {
      setEndTime(formattedTime);
    }
  };

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

    setTimeDiff(`${hours}h ${minutes}m`);
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
    } else {
      selected && startTime && endTime && calculateDifference(startTime, endTime, selected);

      await api.post("/api/reserve", {
        userId: user.userId,
        arenaId: arenaId,
        spaceId: selectedSpace,
        dataReserve: selected == undefined ? format(new Date(), "yyyy-MM-dd") : format(selected as Date, "yyyy-MM-dd"),
        timeInitial: startTime,
        timeFinal: endTime,
        typeReserve: "reserva",
        observation: ""
      }).then((response) => {
        setSendTitle('success');
        setSendMessage(`${response.data.message} `);
      }).catch((error: any) => {
        setSendTitle('error');
        setSendMessage(`${error.response.data} `);
      });
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

  // const handleSpaceReserved = (id: number) => {
  //   setSelectedSpaceReserved(id);
  // };

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {isLoading ? <Loading /> : (
        <>
          <Modal isOpen={modalIsOpenReserve} onRequestClose={closeModalReserve} style={customStylesModalReserve} shouldCloseOnOverlayClick={false}>
            <header className="header-modal">
              <h1><strong>{arena}</strong></h1>
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
                              <p>{item.typeReserve == 'reserva' ? "Reservado" : "Fixo"}</p>
                              {item.typeReserve == 'reserva' ? <BsEmojiSunglasses /> : <MdOutlinePushPin />}
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

                <button className="btn-reserve" onClick={calculeHoursAndCreateReserve}>Reservar</button>
              </section>
            </div>
          </Modal>
        </>
      )}
    </>
  );
}
