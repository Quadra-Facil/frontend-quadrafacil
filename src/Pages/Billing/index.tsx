import './style.css';
import { useContext, useEffect, useState } from "react";
import { startOfWeek, startOfMonth, subMonths, endOfMonth, isSameDay, isWithinInterval, addDays } from 'date-fns';
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import MenuOption from "../../components/Principal/MenuOption";
import { FiFilter } from 'react-icons/fi';
import { FaMoneyBillTrendUp, FaRegFilePdf } from 'react-icons/fa6';
import { api } from '../../services/axiosApi/apiClient';
import { AuthContext } from '../../services/contexts/AuthContext';
import { MdPushPin } from 'react-icons/md';
import { FaFireAlt } from 'react-icons/fa';
import { LuFilterX } from 'react-icons/lu';

interface Reserve {
  id_reserve: number;
  userId: number;
  arenaId: number;
  spaceId: number;
  dataReserve: string;
  timeInitial: string;
  timeFinal: string;
  status: "Realizada" | "Pendente" | "Cancelada";
  typeReserve: "fixa" | "avulsa";
  promotion: boolean;
  promotionType?: string;
  observation?: string;
  value?: number;
}

export default function Billing() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Hoje');
  const [dataReserve, setDataReserve] = useState<Reserve[]>([]);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [initialDate, setInitialDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const authContext = useContext(AuthContext);
  const { user }: any = authContext;

  useEffect(() => {
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle('');
        setSendMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sendTitle, sendMessage]);

  async function loadReserves() {
    try {
      setIsLoading(true);
      const response = await api.post('/getReserves/arena', {
        arenaId: Number(user?.arena)
      });
      setDataReserve(response.data);
    } catch (error: any) {
      setSendTitle("Erro ao carregar reservas");
      setSendMessage(error.response?.data?.message || "Erro inesperado");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (user?.arena) {
      loadReserves();
    }
  }, [user?.arena]);

  function handlePeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedPeriod(e.target.value);
    // Limpa filtros de data quando seleciona um período
    setInitialDate('');
    setEndDate('');
  }

  function handleDateChange(type: 'initial' | 'end', value: string) {
    if (type === 'initial') {
      setInitialDate(value);
      // Limpa o período selecionado quando começa a filtrar por data
      setSelectedPeriod('');
    } else {
      setEndDate(value);
      // Limpa o período selecionado quando começa a filtrar por data
      setSelectedPeriod('');
    }
  }

  function filterByPeriod(data: Reserve[]) {
    // Se tem datas selecionadas, filtra por elas
    if (initialDate && endDate) {
      const startDate = new Date(initialDate);
      const endDateAdj = addDays(new Date(endDate), 1);

      return data.filter(reserve => {
        const reserveDate = new Date(reserve.dataReserve);
        return isWithinInterval(reserveDate, {
          start: startDate,
          end: endDateAdj
        });
      });
    }

    // Se não, filtra pelo período selecionado
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }); // Domingo
    const startOfCurrentMonth = startOfMonth(today);
    const startOfLastMonth = startOfMonth(subMonths(today, 1));
    const endOfLastMonth = endOfMonth(subMonths(today, 1));
    const startOfThreeMonthsAgo = startOfMonth(subMonths(today, 2));

    return data.filter(reserve => {
      const reserveDate = new Date(reserve.dataReserve);

      if (selectedPeriod === "Hoje") {
        return isSameDay(reserveDate, today);
      } else if (selectedPeriod === "Nesta Semana") {
        return isWithinInterval(reserveDate, {
          start: startOfCurrentWeek,
          end: today // Considera apenas até hoje, não o final da semana
        });
      } else if (selectedPeriod === "Neste Mês") {
        return isWithinInterval(reserveDate, {
          start: startOfCurrentMonth,
          end: today // Considera apenas até hoje, não o final do mês
        });
      } else if (selectedPeriod === "Mês Passado") {
        return isWithinInterval(reserveDate, {
          start: startOfLastMonth,
          end: endOfLastMonth // Mês passado completo
        });
      } else if (selectedPeriod === "Últimos 3 Meses") {
        return isWithinInterval(reserveDate, {
          start: startOfThreeMonthsAgo,
          end: today // Considera apenas até hoje
        });
      }

      return true;
    });
  }

  const filteredReserves = filterByPeriod(dataReserve);

  const totalFaturamento = filteredReserves.reduce((acc, num) => acc + (num.value || 0), 0);
  const totalFixos = filteredReserves.filter(item => item.typeReserve === 'fixa')
    .reduce((acc, num) => acc + (num.value || 0), 0);
  const totalAvulsos = filteredReserves.filter(item => item.typeReserve === 'avulsa')
    .reduce((acc, num) => acc + (num.value || 0), 0);

  function handleClearFilters() {
    setInitialDate('');
    setEndDate('');
    setSelectedPeriod('Hoje');
    setShowFilter(false);
  }

  // Calcular as porcentagens
  const porcentagemFixos = totalFaturamento > 0 ? ((totalFixos / totalFaturamento) * 100).toFixed(0) : '0';
  const porcentagemAvulsos = totalFaturamento > 0 ? ((totalAvulsos / totalFaturamento) * 100).toFixed(0) : '0';

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {isLoading ? (
        <Loading />
      ) : (
        <main className="principal-billing">
          <MenuOption />

          <section className="area-body-billing">
            <header className="area-header-export">
              <section className="area-left-header">
                <select
                  value={selectedPeriod}
                  onChange={handlePeriodChange}
                  disabled={!!(showFilter && (initialDate || endDate))}
                >
                  <option value="Hoje">Hoje</option>
                  <option value="Nesta Semana">Nesta Semana</option>
                  <option value="Neste Mês">Neste Mês</option>
                  <option value="Mês Passado">Mês Passado</option>
                  <option value="Últimos 3 Meses">Últimos 3 Meses</option>
                </select>
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="filter-button"
                >
                  {showFilter ? (
                    <LuFilterX
                      size={24}
                      title='Limpar filtros'
                      color='#ff8a5b'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearFilters();
                      }}
                    />
                  ) : (
                    <FiFilter size={24} title='Filtrar' color='#ff8a5b' />
                  )}
                </button>
                {showFilter && (
                  <div className="filter-container">
                    <div className="area-filter">
                      <label>De</label>
                      <input
                        type="date"
                        value={initialDate}
                        onChange={(e) => handleDateChange('initial', e.target.value)}
                      />
                    </div>
                    <div className="area-filter">
                      <label>Até</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </section>
              <button className='btn-export'>
                <FaRegFilePdf size={18} />
                Exportar
              </button>
            </header>

            <section className="area-cards-billing">
              <div className="card-billing">
                <p>Faturamento Total <FaMoneyBillTrendUp color='#ff8a5b' /></p>
                <h1>R$ {totalFaturamento.toFixed(2)}</h1>
              </div>

              <div className="card-billing">
                <p>Agendamentos Fixos <MdPushPin color='#ff8a5b' /></p>
                <h1>R$ {totalFixos.toFixed(2)}</h1>
                <h5>{porcentagemFixos}% do total</h5>
              </div>

              <div className="card-billing">
                <p>Agendamentos Avulsos <FaFireAlt color='#ff8a5b' /></p>
                <h1>R$ {totalAvulsos.toFixed(2)}</h1>
                <h5>{porcentagemAvulsos}% do total</h5>
              </div>
            </section>
          </section>
        </main>
      )}
    </>
  );
}