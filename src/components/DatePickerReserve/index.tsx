import "react-day-picker/style.css"; // Importando o estilo padrão
import "./style.css"; // Importando o arquivo CSS customizado
import { useEffect, useState } from "react";
import { setHours, setMinutes, setSeconds, differenceInMilliseconds, format } from "date-fns";
import { DayPicker, Locale } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import Toast from "../Toast";
import Loading from "../Loading";
import Modal from "react-modal";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { MdOutlinePushPin } from "react-icons/md";
import { BsEmojiSunglasses } from "react-icons/bs";

import { useNavigate } from "react-router-dom";
import DatePickerHourReserved from "../DatePickerHourReserved";

export function DatePickerReserve() {
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>("00:00:00");
  const [endTime, setEndTime] = useState<string>("00:00:00");
  const [timeDiff, setTimeDiff] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [selectedSpace, setSelectedSpace] = useState<any>();
  const [modalIsOpenReserve, setIsOpenReserve] = useState(false);

  const navigate = useNavigate();

  function openModalReserve() {
    setIsOpenReserve(true);
  }

  function closeModalReserve() {
    setIsOpenReserve(false);
    navigate("/principal")
  }
  //style modal plan
  const customStylesModalReserve = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#dfdfdf',
      border: '1px solid #ccc',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '90vw',
      height: '90vh',
      maxWidth: '80%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

  useEffect(() => {
    openModalReserve();
  }, [])

  // Função para arredondar minutos
  const roundMinutes = (minutes: number): number => {
    if (minutes <= 15) {
      return 0;
    } else {
      return 30;
    }
  };

  // Função para tratar a mudança de horário de início ou fim
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>, isStart: boolean) => {
    const time = event.target.value;

    const [hour, minute, second] = time.split(":").map(Number);

    // Bloquear o horário específico (ex: 18:00)
    if (hour === 18 && minute === 0) {
      alert("Este horário está bloqueado!");
      return; // Impede que o horário seja configurado
    }

    const roundedMinute = roundMinutes(minute);

    // Formatar o horário com segundos fixos em 00
    const formattedTime = `${String(hour).padStart(2, "0")}:${String(roundedMinute).padStart(2, "0")}:00`;

    // Atualizar o estado do horário de início ou fim
    if (isStart) {
      setStartTime(formattedTime);
    } else {
      setEndTime(formattedTime);
    }
  };


  // Função para calcular a diferença entre os horários
  const calculateDifference = (start: string, end: string, selectedDate: Date) => {
    const [startHour, startMinute, startSecond] = start.split(":").map(Number);
    const [endHour, endMinute, endSecond] = end.split(":").map(Number);

    const startDate = setSeconds(setMinutes(setHours(selectedDate, startHour), startMinute), startSecond);
    const endDate = setSeconds(setMinutes(setHours(selectedDate, endHour), endMinute), endSecond);

    // Calculando a diferença em milissegundos
    const diffInMilliseconds = differenceInMilliseconds(endDate, startDate);

    // Convertendo para horas, minutos e segundos
    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

    setTimeDiff(`${hours}h ${minutes}m`);
  };

  function calculeHours() {
    if (startTime === "00:00:00") {
      alert("Selecione o início da reserva.")
    } else if (endTime === "00:00:00") {
      alert("Selecione o fim da reserva.")
    } else {
      selected && startTime && endTime && calculateDifference(startTime, endTime, selected)
    }
  }

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {/* Condicional de loading */}
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {/* modal plano */}
          <Modal
            isOpen={modalIsOpenReserve}
            onRequestClose={closeModalReserve}
            style={customStylesModalReserve}
            shouldCloseOnOverlayClick={false}
          >
            <header className="header-modal">
              <h1>Faça sua reserva na arena - <strong>Arena Pesquisada</strong></h1>
              <div className="area-close" onClick={closeModalReserve}>
                <FiX size={24} />
              </div>
            </header>

            <div className="main-reserve">
              <section className="area-left">
                <div className="title-left">
                  <h5 className="title-reserved">Horários já reservados</h5>
                  <p>Selecione à direita um horário diferente dos listados abaixo.</p>
                </div>
                <div className="area-picker">
                  <DatePickerHourReserved />
                </div>

                <div className="card-reserve">
                  <strong>18:00 às 18:30</strong>
                  <div className="type-reserve">
                    <MdOutlinePushPin />
                    <p>Fixo</p>
                  </div>
                  <section className="status-reserve">
                    <h5>Reservado</h5>
                  </section>
                </div>

                <div className="card-reserve">
                  <strong>19:00 às 19:30</strong>
                  <div className="type-reserve">
                    <BsEmojiSunglasses />
                    <p>Reserva</p>
                  </div>
                  <section className="status-reserve">
                    <h5>Reservado</h5>
                  </section>
                </div>

              </section>
              <section className="area-rigth">
                <h3>Selecione um espaço:</h3>
                {/* mostrar cards do espaço com seus esportes */}

                <DayPicker
                  mode="single"
                  selected={selected}
                  onSelect={setSelected}
                  locale={ptBR as Locale}
                  footer={`Data selecionada: ${selected ? selected.toLocaleString() : "nenhuma"}`}
                />

                <form>
                  <label>
                    Início:{" "}
                    <input
                      type="time"
                      value={startTime.slice(0, 5)}
                      onChange={(e) => handleTimeChange(e, true)}
                    />
                  </label>
                  <label>
                    Fim:{" "}
                    <input
                      type="time"
                      value={endTime.slice(0, 5)}
                      onChange={(e) => handleTimeChange(e, false)}
                    />
                  </label>
                </form>

                <button onClick={() => calculeHours()}>
                  Reservar
                </button>
              </section>
              {/* {selected && startTime && endTime && timeDiff && (
          <div>
            <p>Horário de início (arredondado): {startTime}</p>
            <p>Horário de fim (arredondado): {endTime}</p>
            <p>Data selecionada: {format(selected, "yyyy-MM-dd")}</p>
            <p>Intervalo: {timeDiff}</p>
          </div>
        )} */}
            </div>
          </Modal>
        </>
      )}
    </>
  );
}
