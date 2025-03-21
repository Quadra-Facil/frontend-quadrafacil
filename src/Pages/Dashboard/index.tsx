import './styles.css';
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../services/contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import MenuOption from "../../components/Principal/MenuOption";
import ApexCharts from 'react-apexcharts';
import { api } from '../../services/axiosApi/apiClient';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { GoRocket } from 'react-icons/go';

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

  // dados de confgs para o grafico radial, ultimo
  const currentMonth = new Date().getMonth();
  const reservationsCount = getSpaces.map(space => {
    return loadDataMiniChart.filter(reserve => {
      return reserve.spaceId === space.spaceId && new Date(reserve.dataReserve).getMonth() === currentMonth;
    }).length;
  });
  const totalReservations = reservationsCount.reduce((acc, val) => acc + val, 0);
  const monthlyReservations = totalReservations > 0 ? reservationsCount.map(count => (count / totalReservations) * 100) : reservationsCount;
  const colors = ["#FF8A5B", "#26ea8a", "#673ab7", "#F3FF33", "#FF33A8", "#33FFF3"];
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const currentMonthName = monthNames[currentMonth];

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
                  <FiHome className='icon-home' title='Principal' onClick={() => navigate('/principal')} />

                  <section className={getSpaces.length <= 3 ? 'area-cards-header-length-3' : 'area-cards-header'}>
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
                                    zoom: { enabled: true },
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

                  <section className="last-area">

                    <section className="line-chart-container">
                      <ApexCharts
                        options={{
                          chart: {
                            id: 'line-chart',
                            toolbar: { show: false },
                            zoom: { enabled: true },
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
                          colors: ['#FF8A5B', '#00e676', '#673ab7', '#00b0ff', '#78909c', '#ffea00'], // Adicione mais cores se necessário
                          grid: { show: false },
                          dataLabels: { enabled: false },
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
                        height="100%"
                        width="180%"
                      />
                    </section>

                    <div className="radial-chart-container" style={{ position: "relative" }}>
                      <ApexCharts
                        options={{
                          chart: { type: "radialBar", height: 280 },
                          series: monthlyReservations,
                          colors: colors.slice(0, getSpaces.length),
                          plotOptions: {
                            radialBar: {
                              hollow: {
                                margin: 0,
                                size: "65%",
                                background: "#f7cebe"
                              },
                              track: {
                                dropShadow: {
                                  enabled: true,
                                  top: 2,
                                  left: 0,
                                  blur: 4,
                                  opacity: 0.15
                                }
                              },
                              dataLabels: {
                                name: { offsetY: -20, color: "#FF8A5B", fontSize: "16px" },
                                value: {
                                  color: "#8a8a8a",
                                  fontSize: "16px",
                                  show: true,
                                  formatter: () => `${totalReservations} Reservas`
                                }
                              }
                            }
                          },
                          fill: {
                            type: "gradient",
                            gradient: {
                              shade: "dark",
                              type: "vertical",
                              gradientToColors: colors.slice(0, getSpaces.length),
                              stops: [0, 100]
                            }
                          },
                          stroke: { lineCap: "round" },
                          labels: getSpaces.map(space => space.name),
                          tooltip: {
                            enabled: true,
                            y: {
                              formatter: (val) => `${Math.round(val)}%`
                            }
                          }
                        }}
                        series={monthlyReservations}
                        type="radialBar"
                        height={280}
                      />
                      <div className="chart-center-icon" style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -90%)",
                        fontSize: "50px",
                        color: "#F7f7f7",
                        pointerEvents: "none"
                      }}>
                        <GoRocket />
                      </div>
                      <div className="chart-title">
                        {currentMonthName} - {totalReservations} Reservas
                      </div>
                      <div className="chart-legend">
                        {getSpaces.map((space, index) => (
                          <div key={space.spaceId} className="legend-item">
                            <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: colors[index] }} />
                            <span style={{ color: '#8a8a8a', marginLeft: 5, fontWeight: 300 }}>{space.name}</span>
                          </div>
                        ))}
                      </div>
                      <style>{`
        .radial-chart-container:hover .chart-center-icon {
          display: none;
        }
      `}</style>
                    </div>

                  </section>

                </section>
              </main>
            </>
          )
      }
    </>
  );
}
