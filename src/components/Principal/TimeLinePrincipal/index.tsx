import "./style.css"
import { useContext, useEffect, useState } from "react";
import { TbClockPlay } from "react-icons/tb";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import { api } from "../../../services/axiosApi/apiClient";
import { AuthContext } from "../../../services/contexts/AuthContext";
import { format } from "date-fns";

// Definição dos tipos de dados
interface WeekDays {
  $id: string;
  $values: number[];
}

// Representa o horário de funcionamento de cada arena
interface Expedient {
  $id: string;
  id: number;
  arenaId: number;
  weekDays: WeekDays;
  startTime: string;
  endTime: string;
  open: boolean;
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
  dataReserve: string; // Pode ser uma string ou Date, dependendo do formato utilizado
  name: string;
  spaceId: number;
  timeInitial: string; // Pode ser formatado como string "HH:MM:SS"
  timeFinal: string;   // Pode ser formatado como string "HH:MM:SS"
  observation: string;
  typeReserve: string;
  promotion: boolean;
  promotionType: string;
  userName: string;
  phone: string;
  role: string;
}

interface ReservaResponse {
  $id: string;
  arenaName: Arena;
  reservas: {
    $id: string;
    $values: Reserva[];
  };
}

export default function TimeLinePrincipal() {
  const [getExpedient, setGetExpedient] = useState<Expedient[]>([]);

  // Usando o contexto de autenticação
  const authContext = useContext(AuthContext);
  const { user, logout }: any = authContext;
  const [hourExp, setHourExp] = useState<any[]>([]);
  const [dataReserves, setDataReserves] = useState<ReservaResponse | null>(null);

  // Função para carregar os horários da arena
  async function loadHoursArena() {
    try {
      const response = await api.post("/api/ArenaHours/get", { arenaId: user?.arena });

      const getHourDay = response.data.$values.filter((item: any) => item.weekDays?.$values?.[0] === new Date().getDay());

      if (getHourDay.length === 0) {
        console.log("Nenhum horário encontrado para o dia de hoje.");
        return;
      }

      const startTime = getHourDay[0]?.startTime;
      const endTime = getHourDay[0]?.endTime;

      if (startTime && endTime) {
        // Converte os horários para Date, se necessário
        const initial = new Date(`1970-01-01T${startTime}Z`);
        const final = new Date(`1970-01-01T${endTime}Z`);

        let current = initial;
        const hoursArray = [];

        while (current <= final) {
          hoursArray.push(current.toISOString().substr(11, 8)); // Formato HH:MM:SS
          current.setHours(current.getHours() + 1); // Avançar uma hora
        }

        // Armazena as horas no estado
        setHourExp(hoursArray as any);
        return;
      } else {
        console.log("Horário de início ou fim não encontrado.");
      }
    } catch (error: any) {
      console.error(error.response?.data || error.message);
    }
  }

  // Carrega os horários quando o componente é montado ou o `user?.arena` é alterado
  useEffect(() => {
    loadHoursArena();
  }, [user?.arena]);

  // Carrega as reservas do dia
  async function loadReserves() {
    try {
      const response = await api.post("/getReserve/arena/data", {
        arenaId: user?.arena,
        dataReserve: format(new Date(), "yyyy-MM-dd")
      });

      setDataReserves(response.data);
    } catch (error) {
      console.log("Erro ao buscar reservas.");
    }
  }

  useEffect(() => {
    loadReserves();
  }, []);

  return (
    <>
      <VerticalTimeline>
        {
          // Mapeia as horas para exibir na linha do tempo
          hourExp.map((item, index) => {
            // Encontrar reservas que se aplicam ao horário atual
            const reservasNoHorario: any = dataReserves?.reservas.$values.filter((reserva: Reserva) => {
              const reservaStart = reserva.timeInitial;
              const reservaEnd = reserva.timeFinal;

              // Verificar se o horário do item está entre o timeInitial e timeFinal da reserva
              return item >= reservaStart && item <= reservaEnd;
            });

            // Definir o estilo de fundo dependendo se há reservas
            const isAvailable = reservasNoHorario?.length === 0;
            const contentStyle = {
              background: isAvailable ? '#69f0af65' : '#f7cebe', // Fundo verde se disponível, outro caso
              color: '#868384',
              padding: '10px',
              fontSize: '20px',
              cursor: isAvailable ? 'pointer' : 'no-drop'
            };

            const contentArrowStyle = {
              borderRight: `7px solid ${isAvailable ? '#69f0af65' : '#f7cebe'}`,
            };

            const iconStyle = {
              background: isAvailable ? '#69f0af' : '#f7cebe',
              color: '#868488',
              fontSize: '18px',
              padding: '5px',
            };

            return (
              <VerticalTimelineElement
                key={index}
                className="vertical-timeline-element--work"
                contentStyle={contentStyle}
                contentArrowStyle={contentArrowStyle}
                iconStyle={iconStyle}
                date={item.split(":").slice(0, 2).join(":")}
                icon={<TbClockPlay />}
              >
                <h3 className="vertical-timeline-element-title" style={{ fontSize: '14px' }}>
                  {
                    reservasNoHorario?.length > 0 ?
                      reservasNoHorario.map((reserva: Reserva, idx: number) => (
                        <div key={idx}>
                          {reserva.timeInitial.split(":").slice(0, 2).join(":")} - {reserva.timeFinal.split(":").slice(0, 2).join(":")}
                        </div>
                      ))
                      : "Disponível"
                  }
                </h3>
                <h4 className="vertical-timeline-element-subtitle" style={{ fontSize: '14px', fontWeight: '300' }}>
                  {reservasNoHorario?.length > 0
                    ? reservasNoHorario.map((reserva: Reserva, idx: number) => (
                      <div key={idx}>
                        {reserva.name} - {reserva.observation} - {reserva.typeReserve}
                      </div>
                    ))
                    : "Horário disponível"}
                </h4>
              </VerticalTimelineElement>
            );
          })
        }
      </VerticalTimeline>


    </>
  );
}
