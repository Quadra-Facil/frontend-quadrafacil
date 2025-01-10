import './style.css';
import { useState } from "react";
import { FaCircleArrowLeft } from "react-icons/fa6";
import { FaCircleArrowRight } from "react-icons/fa6";

function DatePickerHourReserved() {
  const [currentWeek, setCurrentWeek] = useState(new Date()); // Estado da semana atual
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // Estado para armazenar a data selecionada

  // Calcula o início da semana a partir da data atual
  const getFirstDayOfWeek = (date: Date) => {
    const firstDay = new Date(date);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay());
    return firstDay;
  };

  const firstDayOfWeek = getFirstDayOfWeek(currentWeek);

  // Gera os dias da semana atual
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(firstDayOfWeek);
    day.setDate(day.getDate() + i);
    return day;
  });

  // Navegação para a próxima semana
  const handleNextWeek = () => {
    setCurrentWeek((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  // Navegação para a semana anterior
  const handlePrevWeek = () => {
    setCurrentWeek((prev) => {
      const previous = new Date(prev);
      previous.setDate(previous.getDate() - 7);
      return previous;
    });
  };

  // Nomes dos dias da semana
  const weekDayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Nomes dos meses
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  // Função para lidar com o clique em um dia
  const handleDayClick = (day: Date) => {
    const formattedDate = `${day.getFullYear().toString()}-${(
      day.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${day.getDate().toString().padStart(2, "0")}`;
    setSelectedDate(formattedDate); // Armazenar a data no estado
  };

  // Define o dia de hoje como selecionado por padrão
  const today = new Date();
  const defaultSelectedDate = `${today.getFullYear().toString().slice(2)}-${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  // Se a data selecionada ainda não foi definida, usa o dia de hoje como padrão
  if (!selectedDate) {
    setSelectedDate(defaultSelectedDate);
  }

  return (
    <div className='main-picker'>

      {/* Exibição do Mês e Ano */}
      <div className='header-picker'>
        <div className="left">
          {monthNames[firstDayOfWeek.getMonth()]}
        </div>
        <div className="rigth">
          <FaCircleArrowLeft color='#FF8A5B' style={{ cursor: 'pointer' }} onClick={handlePrevWeek} />
          <FaCircleArrowRight size={25} color='#FF8A5B' style={{ cursor: 'pointer' }} onClick={handleNextWeek} />
        </div>
      </div>

      {/* Calendário Inline (Apenas a Semana Atual) */}
      <div className='area-day'>
        {daysOfWeek.map((day) => (
          <div
            className='area-day-week'
            key={day.toDateString()}
            onClick={() => handleDayClick(day)} // Ao clicar no dia
            style={{
              backgroundColor: selectedDate === `${day.getFullYear().toString().slice(2)}-${(day.getMonth() + 1).toString().padStart(2, "0")}-${day.getDate().toString().padStart(2, "0")}` ? "#f7cebe" : "#fff", // Destaque para o dia selecionado
              border: `1px solid ${selectedDate === `${day.getFullYear().toString().slice(2)}-${(day.getMonth() + 1).toString().padStart(2, "0")}-${day.getDate().toString().padStart(2, "0")}` ? "#FF8A5B" : "#fff"}`,
            }}
          >
            <div className='day-week'>{weekDayNames[day.getDay()]}</div>
            <div className='number-week'>{day.getDate()}</div>
          </div>
        ))}
      </div>

      {/* Exibe a data selecionada */}
      {selectedDate && (
        <div style={{ marginTop: "20px", fontSize: "16px", fontWeight: "bold" }}>
          Data Selecionada: {selectedDate}
        </div>
      )}
    </div>
  );
}

export default DatePickerHourReserved;
