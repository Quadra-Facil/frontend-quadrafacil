import './style.css';
import { useState } from "react";
import { FaCircleArrowLeft } from "react-icons/fa6";
import { FaCircleArrowRight } from "react-icons/fa6";

type DatePickerProps = {
  selectedDate: string | null; // A data selecionada vinda do pai
  setSelectedDate: (date: string | null) => void; // Função para atualizar a data no pai
};

function DatePickerHourReserved({ selectedDate, setSelectedDate }: DatePickerProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date()); // Estado da semana atual
  const [hoveredDate, setHoveredDate] = useState<string | null>(null); // Estado para armazenar a data sobre a qual o mouse passou

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
    setSelectedDate(formattedDate); // Atualiza a data no estado do componente pai
  };

  // Função para lidar com o hover (quando o mouse passa sobre a data)
  const handleMouseEnter = (day: Date) => {
    const formattedDate = `${day.getFullYear().toString()}-${(
      day.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${day.getDate().toString().padStart(2, "0")}`;
    setHoveredDate(formattedDate); // Atualiza a data com o hover
  };

  // Função para lidar com o mouse saindo de um dia
  const handleMouseLeave = () => {
    setHoveredDate(null); // Remove o hover
  };

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
            onMouseEnter={() => handleMouseEnter(day)}
            onMouseLeave={handleMouseLeave}
            style={{
              backgroundColor:
                selectedDate === `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`
                  ? '#f7cebe' // Cor de fundo para o dia selecionado
                  : (hoveredDate === `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`)
                    ? '#f7cebe' // Cor de fundo quando passar o mouse
                    : '#eeeded', // Sem cor de fundo para outros dias
              border:
                selectedDate === `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`
                  ? '2px solid #FF8A5B' // Borda para o dia selecionado
                  : 'none',
              cursor: 'pointer',
            }}
          >
            <div className='day-week'>{weekDayNames[day.getDay()]}</div>
            <div className='number-week'>{day.getDate()}</div>
          </div>
        ))}
      </div>
    </div >
  );
}

export default DatePickerHourReserved;
