import "./style.css";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../services/contexts/AuthContext";
import Toast from "../Toast";
import Loading from "../Loading";
import Modal from "react-modal";
import { FiX } from "react-icons/fi";
import { api } from "../../services/axiosApi/apiClient";
import { addDays, isBefore, format, addMonths } from 'date-fns';

interface Space {
  spaceId: number;
  name: string;
  sports: string;
}

export default function ModalReserveFixed() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [modalIsOpen, setIsOpen] = useState(false);
  const [getAllArenas, setGetAllArenas] = useState<{ value: string; label: string }[]>([]);
  const [selectedArena, setSelectedArena] = useState<any>();
  const [selectedArenaAdress, setSelectedArenaAdress] = useState<any>();
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const [spacesReserved, setSpacesReserved] = useState<Space[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const location = useLocation();
  const { sports } = location.state || {};

  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { user }: any = authContext;

  const customStylesModalReservFixed = {
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
    navigate("/reserve-fixed");
  }, []);

  useEffect(() => {
    openModal();
  }, []);

  useEffect(() => {
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle('');
        setSendMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sendTitle, sendMessage]);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    navigate("/principal");
  }

  useEffect(() => {
    async function getSpaceSearch() {
      setIsLoading(true);
      try {
        const response = await api.post("/api/newSpace/search/space", {
          arenaId: user?.arena,
          sports: String(sports),
        });

        if (Array.isArray(response.data.$values)) {
          setSpaces(response.data.$values);
        } else {
          setSpaces([]);
        }
      } catch (error: any) {
        setSendTitle('error');
        setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    }

    getSpaceSearch();
  }, [user?.arena, sports]);

  const handleSpace = (id: number) => {
    setSelectedSpace(id);
  };

  const [selectedPeriod, setSelectedPeriod] = useState<number | string>('');
  const [weekDaySigla, setWeekDaySigla] = useState<string | null>(null);
  const [dates, setDates] = useState<string[]>([]);

  const WeekDay = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

  const handlePeriodChange = (event: any) => {
    const period = event.target.value;
    setSelectedPeriod(period);
  };

  const handleWeekDayClick = (sigla: typeof WeekDay[number]) => {
    setWeekDaySigla(sigla);
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

  // Função para fazer a reserva
  async function ReserveFixed() {
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
          promotion: true,
          promotionType: "2h",
          value: 80
        }).then((response) => {
          setSendTitle('success');
          setSendMessage(`${response?.data?.message}`);
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

  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [observations, setObservations] = useState<string>('');

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {isLoading ? (
        <Loading />
      ) : (
        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStylesModalReservFixed} shouldCloseOnOverlayClick={false}>
          <header className="header-modal-reserve-fixed">
            <h1><strong>Nome arena</strong></h1>
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
              <section className="area-period-fixed">
                <h2>Pelos próximos:</h2>
                <div className="area-inputs">
                  <input
                    type="radio"
                    name="period"
                    id="period-1"
                    value="1"
                    checked={selectedPeriod === '1'}
                    onChange={handlePeriodChange}
                  />
                  <label htmlFor="period-1">01 mês</label>
                </div>
                <div className="area-inputs">
                  <input
                    type="radio"
                    name="period"
                    id="period-3"
                    value="3"
                    checked={selectedPeriod === '3'}
                    onChange={handlePeriodChange}
                  />
                  <label htmlFor="period-3">03 meses</label>
                </div>
                <div className="area-inputs">
                  <input
                    type="radio"
                    name="period"
                    id="period-6"
                    value="6"
                    checked={selectedPeriod === '6'}
                    onChange={handlePeriodChange}
                  />
                  <label htmlFor="period-6">06 meses</label>
                </div>
                <div className="area-inputs">
                  <input
                    type="radio"
                    name="period"
                    id="period-12"
                    value="12"
                    checked={selectedPeriod === '12'}
                    onChange={handlePeriodChange}
                  />
                  <label htmlFor="period-12">12 meses</label>
                </div>
              </section>
              <section className="area-timers">

                <div className="area-timers-div">
                  <div className="area-initial-time">
                    <label htmlFor="initial">Hr. Inicial:</label>
                    <input type="time" name="" id="initial" onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div className="area-end-time">
                    <label htmlFor="end">Hr. Final:</label>
                    <input type="time" name="" id="end" onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>
                <h5>Promoção: 2h por menos.</h5>
                <textarea name="" id=""
                  placeholder="Ex: Turma do José."
                  onChange={(e) => setObservations(e.target.value)}
                ></textarea>
              </section>
            </section>

            <button className="btn-reserve-fixed" onClick={() => ReserveFixed()}>Criar reserva fixa</button>
          </div>
        </Modal>
      )}
    </>
  );
}
