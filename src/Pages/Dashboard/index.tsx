import './styles.css';
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../services/contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import MenuOption from "../../components/Principal/MenuOption";
import ApexCharts from 'react-apexcharts';
import { api } from '../../services/axiosApi/apiClient';

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
  promotion: boolean;
  promotionType?: string;
  observation?: string;
  value?: number;
}

interface Space {
  spaceId: number;
  name: string;
  status: string;
  sports: string;
  arenaId: number;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [loadDataMiniChart, setLoadDataMiniChart] = useState<Reserve[]>([]);
  const [getSpaces, setGetSpaces] = useState<Space[]>([]);

  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <div>Carregando...</div>;
  }

  const { user } = authContext;

  useEffect(() => {
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle('');
        setSendMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sendTitle, sendMessage]);

  async function loadSpaces() {
    try {
      const response = await api.post("/api/newSpace/get-spaces", {
        arenaId: user?.arena
      })
      setGetSpaces(response.data.$values)
    } catch (error: any) {
      console.log(error.response.data)
    }
  }

  useEffect(() => {
    loadSpaces()
  }, [user?.arena])

  async function loadDataMini() {
    try {
      const response = await api.post("/getdata/minicard", {
        arenaId: user?.arena
      })
      setLoadDataMiniChart(response.data)
    } catch (error: any) {
      console.log(error.response.data);
    }
  }

  useEffect(() => {
    loadDataMini()
  }, [user?.arena])

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {
        isLoading ?
          <Loading />
          : (
            <>
              <main className="main-dash">
                <MenuOption />

                <section className="main-charts">

                  <section className="area-cards-header">
                    {getSpaces
                      .map(space => {
                        const spaceAppointments = loadDataMiniChart.filter(reserve => reserve.spaceId === space.spaceId);
                        return { ...space, totalReservations: spaceAppointments.length, appointmentsByMonth: spaceAppointments };
                      })
                      .sort((a, b) => b.totalReservations - a.totalReservations) // Ordena do maior para o menor número de reservas
                      .map(space => {
                        const appointmentsByMonth = Array(12).fill(0);
                        space.appointmentsByMonth.forEach(reserve => {
                          const month = new Date(reserve.dataReserve).getMonth();
                          appointmentsByMonth[month]++;
                        });

                        return (
                          <div className="card" key={space.spaceId}>
                            <h2>{space.name}</h2>
                            <p><strong>Total de Agendamentos:</strong> {space.totalReservations}</p>
                            <div className="card-body">
                              <ApexCharts
                                options={{
                                  chart: {
                                    id: `chart-${space.spaceId}`,
                                    toolbar: { show: false },
                                    zoom: { enabled: false },
                                    background: 'transparent',
                                  },
                                  xaxis: {
                                    categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                                    labels: { show: false },
                                    axisBorder: { show: false },
                                    axisTicks: { show: false }
                                  },
                                  yaxis: {
                                    labels: { show: false },
                                    axisBorder: { show: false },
                                    axisTicks: { show: false }
                                  },
                                  grid: { show: false },
                                  stroke: { curve: 'smooth' },
                                  fill: {
                                    type: 'gradient',
                                    gradient: {
                                      shade: 'light',
                                      type: 'horizontal',
                                      gradientToColors: ['#ff8a5b'],
                                      stops: [0, 90, 100],
                                    }
                                  },
                                  colors: ['#ff8a5b'],
                                  dataLabels: { enabled: false },
                                }}
                                series={[{
                                  name: 'Agendamentos',
                                  data: appointmentsByMonth
                                }]}
                                type="area"
                                height={130}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </section>






                  <section className="line-chart-container">
                    <ApexCharts
                      options={{
                        chart: {
                          id: 'line-chart',
                          toolbar: { show: false },
                          zoom: { enabled: false },
                          background: '#fff',
                        },
                        xaxis: {
                          categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                          axisBorder: { show: false },
                          axisTicks: { show: false },
                        },
                        stroke: {
                          curve: 'smooth',
                          width: 3,
                        },
                        colors: ['#FF8A5B', '#00e676', '#673ab7'], // Adicione mais cores se necessário
                        grid: { show: false },
                        dataLabels: { enabled: true },
                        legend: { position: 'bottom' },
                      }}
                      series={getSpaces.map(space => {
                        const appointmentsByMonth = Array(12).fill(0);
                        loadDataMiniChart
                          .filter(reserve => reserve.spaceId === space.spaceId)
                          .forEach(reserve => {
                            const month = new Date(reserve.dataReserve).getMonth();
                            appointmentsByMonth[month]++;
                          });

                        return {
                          name: space.name,
                          data: appointmentsByMonth,
                        };
                      })}
                      type="line"
                      height="130%"
                      width="180%"
                    />
                  </section>










                </section>
              </main>
            </>
          )
      }
    </>
  );
}
