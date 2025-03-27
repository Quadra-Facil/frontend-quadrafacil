import './style.css';
import { useContext, useEffect, useState } from "react";
import { startOfWeek, startOfMonth, subMonths, endOfMonth, isSameDay, isWithinInterval, addDays, format } from 'date-fns';
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
import { jsPDF } from "jspdf";
import autoTable, { CellDef } from 'jspdf-autotable';

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

export interface Space {
  $id: string;
  spaceId: number;
  name: string;
  status: 'Disponível' | 'Indisponível' | 'Manutenção';
  sports: string;
  arenaId: number;
}

export interface ApiSpace {
  $id: string;
  $values: Space[];
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
  const [spacesOccupancy, setSpacesOccupancy] = useState<{ spaceId: number, name: string, occupancy: number }[]>([]);
  const [loadSpace, setLoadSpace] = useState<Space[]>([]);

  const authContext = useContext(AuthContext);
  const { user }: any = authContext;

  const getSpaceName = (spaceId: number): string => {
    if (!loadSpace || loadSpace.length === 0) return `Espaço ${spaceId}`;
    const space = loadSpace.find(s => s.spaceId === spaceId);
    return space ? space.name : `Espaço ${spaceId}`;
  };

  useEffect(() => {
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle('');
        setSendMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sendTitle, sendMessage]);

  const calculateSpaceOccupancy = (reserves: Reserve[]) => {
    const spaceMap: Record<number, { count: number, name: string }> = {};

    reserves.forEach(reserve => {
      if (!spaceMap[reserve.spaceId]) {
        spaceMap[reserve.spaceId] = {
          count: 0,
          name: getSpaceName(reserve.spaceId)
        };
      }
      spaceMap[reserve.spaceId].count++;
    });

    const totalReserves = reserves.length;
    return Object.keys(spaceMap).map(spaceId => {
      const id = Number(spaceId);
      return {
        spaceId: id,
        name: spaceMap[id].name,
        occupancy: totalReserves > 0 ? Math.round((spaceMap[id].count / totalReserves) * 100) : 0
      };
    });
  };

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

  async function loadSpacesFunction() {
    try {
      const response = await api.post("/api/newSpace/get-spaces", {
        arenaId: user?.arena
      });
      setLoadSpace(response.data.$values);
    } catch (error: any) {
      console.log(error.response.data);
    }
  }

  useEffect(() => {
    if (user?.arena) {
      loadReserves();
      loadSpacesFunction();
    }
  }, [user?.arena]);

  function handlePeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedPeriod(e.target.value);
    setInitialDate('');
    setEndDate('');
  }

  function handleDateChange(type: 'initial' | 'end', value: string) {
    if (type === 'initial') {
      setInitialDate(value);
      setSelectedPeriod('');
    } else {
      setEndDate(value);
      setSelectedPeriod('');
    }
  }

  function filterByPeriod(data: Reserve[]) {
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

    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });
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
          end: today
        });
      } else if (selectedPeriod === "Neste Mês") {
        return isWithinInterval(reserveDate, {
          start: startOfCurrentMonth,
          end: today
        });
      } else if (selectedPeriod === "Mês Passado") {
        return isWithinInterval(reserveDate, {
          start: startOfLastMonth,
          end: endOfLastMonth
        });
      } else if (selectedPeriod === "Últimos 3 Meses") {
        return isWithinInterval(reserveDate, {
          start: startOfThreeMonthsAgo,
          end: today
        });
      }

      return true;
    });
  }

  const filteredReserves = filterByPeriod(dataReserve);

  useEffect(() => {
    if (filteredReserves.length > 0) {
      setSpacesOccupancy(calculateSpaceOccupancy(filteredReserves));
    } else {
      setSpacesOccupancy([]);
    }
  }, [filteredReserves]);

  const lastReserves = [...filteredReserves]
    .sort((a, b) => new Date(b.dataReserve).getTime() - new Date(a.dataReserve).getTime())
    .slice(0, 5);

  const totalFaturamento = filteredReserves.reduce((acc, num) => acc + (num.value || 0), 0);
  const totalFixos = filteredReserves.filter(item => item.typeReserve === 'fixa')
    .reduce((acc, num) => acc + (num.value || 0), 0);
  const totalAvulsos = filteredReserves.filter(item => item.typeReserve === 'avulsa')
    .reduce((acc, num) => acc + (num.value || 0), 0);

  const porcentagemFixos = totalFaturamento > 0 ? ((totalFixos / totalFaturamento) * 100).toFixed(0) : '0';
  const porcentagemAvulsos = totalFaturamento > 0 ? ((totalAvulsos / totalFaturamento) * 100).toFixed(0) : '0';

  function handleClearFilters() {
    setInitialDate('');
    setEndDate('');
    setSelectedPeriod('Hoje');
    setShowFilter(false);
  }

  function generatePdf() {
    setIsLoading(true);
    const doc = new jsPDF();

    // Configurações de cor como tuplas
    const primaryColor: [number, number, number] = [255, 138, 91]; // FF8A5B
    const darkColor: [number, number, number] = [40, 40, 40];
    const lightColor: [number, number, number] = [100, 100, 100];
    const whiteColor: [number, number, number] = [255, 255, 255];

    // Configurações da página
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let yPosition = 20;

    // Função para adicionar cabeçalho com logo
    const addHeader = () => {
      try {
        // Substitua pela sua logo em base64
        const logoData = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzM1IiBoZWlnaHQ9IjEwNSIgdmlld0JveD0iMCAwIDMzNSAxMDUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xNDEuNDg5IDYyLjY2NjdMMTQwLjA4OSA2MC45Nzc4QzEzOS4zMDQgNjEuNDM3IDEzOC40NTkgNjEuNzg1MiAxMzcuNTU2IDYyLjAyMjJDMTM2LjY2NyA2Mi4yNzQxIDEzNS43NDEgNjIuNCAxMzQuNzc4IDYyLjRDMTMzLjMyNiA2Mi40IDEzMS45NjMgNjIuMTMzMyAxMzAuNjg5IDYxLjZDMTI5LjQxNSA2MS4wNTE5IDEyOC4yODkgNjAuMzAzNyAxMjcuMzExIDU5LjM1NTZDMTI2LjM0OCA1OC40MDc0IDEyNS41OTMgNTcuMzAzNyAxMjUuMDQ0IDU2LjA0NDRDMTI0LjUxMSA1NC43ODUyIDEyNC4yNDQgNTMuNDM3IDEyNC4yNDQgNTJDMTI0LjI0NCA1MC41NjMgMTI0LjUxMSA0OS4yMTQ4IDEyNS4wNDQgNDcuOTU1NkMxMjUuNTkzIDQ2LjY5NjMgMTI2LjM0OCA0NS41OTI2IDEyNy4zMTEgNDQuNjQ0NEMxMjguMjg5IDQzLjY5NjMgMTI5LjQxNSA0Mi45NTU2IDEzMC42ODkgNDIuNDIyMkMxMzEuOTYzIDQxLjg3NDEgMTMzLjMyNiA0MS42IDEzNC43NzggNDEuNkMxMzYuMjQ0IDQxLjYgMTM3LjYwNyA0MS44NzQxIDEzOC44NjcgNDIuNDIyMkMxNDAuMTQxIDQyLjk1NTYgMTQxLjI1OSA0My42OTYzIDE0Mi4yMjIgNDQuNjQ0NEMxNDMuMiA0NS41OTI2IDE0My45NTYgNDYuNjk2MyAxNDQuNDg5IDQ3Ljk1NTZDMTQ1LjAzNyA0OS4yMTQ4IDE0NS4zMTEgNTAuNTYzIDE0NS4zMTEgNTJDMTQ1LjMxMSA1My4zNjMgMTQ1LjA2NyA1NC42NDQ0IDE0NC41NzggNTUuODQ0NEMxNDQuMDg5IDU3LjA0NDQgMTQzLjQwNyA1OC4xMTExIDE0Mi41MzMgNTkuMDQ0NEwxNDUuNTU2IDYyLjY2NjdIMTQxLjQ4OVpNMTM0Ljc3OCA1OC45MTExQzEzNS44NDQgNTguOTExMSAxMzYuODQ0IDU4LjY3NDEgMTM3Ljc3OCA1OC4yTDEzMi42MjIgNTJIMTM2LjY4OUwxNDAuMTc4IDU2LjE3NzhDMTQwLjYwNyA1NS42IDE0MC45NDEgNTQuOTU1NiAxNDEuMTc4IDU0LjI0NDRDMTQxLjQxNSA1My41MzMzIDE0MS41MzMgNTIuNzg1MiAxNDEuNTMzIDUyQzE0MS41MzMgNTAuNzExMSAxNDEuMjMgNDkuNTQ4MSAxNDAuNjIyIDQ4LjUxMTFDMTQwLjAzIDQ3LjQ3NDEgMTM5LjIyMiA0Ni42NDQ0IDEzOC4yIDQ2LjAyMjJDMTM3LjE5MyA0NS40IDEzNi4wNTIgNDUuMDg4OSAxMzQuNzc4IDQ1LjA4ODlDMTMzLjUwNCA0NS4wODg5IDEzMi4zNTYgNDUuNCAxMzEuMzMzIDQ2LjAyMjJDMTMwLjMxMSA0Ni42NDQ0IDEyOS41MDQgNDcuNDc0MSAxMjguOTExIDQ4LjUxMTFDMTI4LjMxOSA0OS41NDgxIDEyOC4wMjIgNTAuNzExMSAxMjguMDIyIDUyQzEyOC4wMjIgNTMuMjc0MSAxMjguMzE5IDU0LjQzNyAxMjguOTExIDU1LjQ4ODlDMTI5LjUwNCA1Ni41MjU5IDEzMC4zMTEgNTcuMzU1NiAxMzEuMzMzIDU3Ljk3NzhDMTMyLjM1NiA1OC42IDEzMy41MDQgNTguOTExMSAxMzQuNzc4IDU4LjkxMTFaTTE1Ny44MiA2Mi40QzE1Ni44ODcgNjIuNCAxNTYuMDA1IDYyLjE3MDQgMTU1LjE3NiA2MS43MTExQzE1NC4zNDYgNjEuMjUxOSAxNTMuNjggNjAuNTkyNiAxNTMuMTc2IDU5LjczMzNDMTUyLjY3MiA1OC44NTkzIDE1Mi40MiA1Ny44IDE1Mi40MiA1Ni41NTU2VjQ4LjY2NjdIMTU1LjkwOVY1Ni4wODg5QzE1NS45MDkgNTYuOTE4NSAxNTYuMTU0IDU3LjY1MTkgMTU2LjY0MiA1OC4yODg5QzE1Ny4xNDYgNTguOTI1OSAxNTcuODQyIDU5LjI0NDQgMTU4LjczMSA1OS4yNDQ0QzE1OS40NzIgNTkuMjQ0NCAxNjAuMTMxIDU4Ljk3NzggMTYwLjcwOSA1OC40NDQ0QzE2MS4yODcgNTcuOTExMSAxNjEuNTc2IDU3LjE0ODEgMTYxLjU3NiA1Ni4xNTU2VjQ4LjY2NjdIMTY1LjA2NVY2MkgxNjEuODg3VjYwLjRDMTYxLjQxMyA2MS4wNTE5IDE2MC44MiA2MS41NDgxIDE2MC4xMDkgNjEuODg4OUMxNTkuMzk4IDYyLjIyOTYgMTU4LjYzNSA2Mi40IDE1Ny44MiA2Mi40Wk0xNzguNzM0IDYyLjMxMTFDMTc3LjUxOSA2Mi4zMTExIDE3Ni40MDggNjIgMTc1LjQwMSA2MS4zNzc4QzE3NC4zOTQgNjAuNzQwNyAxNzMuNTg2IDU5Ljg5NjMgMTcyLjk3OSA1OC44NDQ0QzE3Mi4zODYgNTcuNzc3OCAxNzIuMDkgNTYuNjA3NCAxNzIuMDkgNTUuMzMzM0MxNzIuMDkgNTQuMDU5MyAxNzIuMzg2IDUyLjg5NjMgMTcyLjk3OSA1MS44NDQ0QzE3My41ODYgNTAuNzc3OCAxNzQuMzk0IDQ5LjkzMzMgMTc1LjQwMSA0OS4zMTExQzE3Ni40MDggNDguNjc0MSAxNzcuNTE5IDQ4LjM1NTYgMTc4LjczNCA0OC4zNTU2QzE3OS42MDggNDguMzU1NiAxODAuNDE2IDQ4LjUxMTEgMTgxLjE1NyA0OC44MjIyQzE4MS44OTcgNDkuMTMzMyAxODIuNTI3IDQ5LjU3MDQgMTgzLjA0NSA1MC4xMzMzVjQ4LjY2NjdIMTg2LjA5VjYySDE4My4wNDVWNjAuNTMzM0MxODIuNTI3IDYxLjA4MTUgMTgxLjg5NyA2MS41MTg1IDE4MS4xNTcgNjEuODQ0NEMxODAuNDE2IDYyLjE1NTYgMTc5LjYwOCA2Mi4zMTExIDE3OC43MzQgNjIuMzExMVpNMTc5LjE1NyA1OS4yMjIyQzE3OS44NjggNTkuMjIyMiAxODAuNTA1IDU5LjA0NDQgMTgxLjA2OCA1OC42ODg5QzE4MS42NDUgNTguMzMzMyAxODIuMTA1IDU3Ljg2NjcgMTgyLjQ0NSA1Ny4yODg5QzE4Mi43ODYgNTYuNjk2MyAxODIuOTU3IDU2LjA0NDQgMTgyLjk1NyA1NS4zMzMzQzE4Mi45NTcgNTQuNjIyMiAxODIuNzg2IDUzLjk3NzggMTgyLjQ0NSA1My40QzE4Mi4xMDUgNTIuODA3NCAxODEuNjQ1IDUyLjMzMzMgMTgxLjA2OCA1MS45Nzc4QzE4MC41MDUgNTEuNjIyMiAxNzkuODc1IDUxLjQ0NDQgMTc5LjE3OSA1MS40NDQ0QzE3OC40NjggNTEuNDQ0NCAxNzcuODIzIDUxLjYyMjIgMTc3LjI0NSA1MS45Nzc4QzE3Ni42ODIgNTIuMzMzMyAxNzYuMjMxIDUyLjgwNzQgMTc1Ljg5IDUzLjRDMTc1LjU0OSA1My45Nzc4IDE3NS4zNzkgNTQuNjIyMiAxNzUuMzc5IDU1LjMzMzNDMTc1LjM3OSA1Ni4wNDQ0IDE3NS41NDkgNTYuNjk2MyAxNzUuODkgNTcuMjg4OUMxNzYuMjMxIDU3Ljg2NjcgMTc2LjY4MiA1OC4zMzMzIDE3Ny4yNDUgNTguNjg4OUMxNzcuODIzIDU5LjA0NDQgMTc4LjQ2IDU5LjIyMjIgMTc5LjE1NyA1OS4yMjIyWk0xOTkuNzk5IDYyLjMxMTFDMTk4LjU2OSA2Mi4zMTExIDE5Ny40NTEgNjIgMTk2LjQ0MyA2MS4zNzc4QzE5NS40MzYgNjAuNzQwNyAxOTQuNjI5IDU5Ljg5NjMgMTk0LjAyMSA1OC44NDQ0QzE5My40MjkgNTcuNzc3OCAxOTMuMTMyIDU2LjYwNzQgMTkzLjEzMiA1NS4zMzMzQzE5My4xMzIgNTQuMDU5MyAxOTMuNDI5IDUyLjg5NjMgMTk0LjAyMSA1MS44NDQ0QzE5NC42MjkgNTAuNzc3OCAxOTUuNDM2IDQ5LjkzMzMgMTk2LjQ0MyA0OS4zMTExQzE5Ny40NTEgNDguNjc0MSAxOTguNTY5IDQ4LjM1NTYgMTk5Ljc5OSA0OC4zNTU2QzIwMC41NTUgNDguMzU1NiAyMDEuMjUxIDQ4LjQ3NDEgMjAxLjg4OCA0OC43MTExQzIwMi41NCA0OC45NDgxIDIwMy4xMjUgNDkuMjc0MSAyMDMuNjQzIDQ5LjY4ODlWNDAuNjY2N0gyMDcuMTMyVjYySDIwNC4wODhWNjAuNTc3OEMyMDMuNTY5IDYxLjExMTEgMjAyLjk0IDYxLjUzMzMgMjAyLjE5OSA2MS44NDQ0QzIwMS40NTggNjIuMTU1NiAyMDAuNjU4IDYyLjMxMTEgMTk5Ljc5OSA2Mi4zMTExWk0yMDAuMTk5IDU5LjIyMjJDMjAwLjkxIDU5LjIyMjIgMjAxLjU0NyA1OS4wNDQ0IDIwMi4xMSA1OC42ODg5QzIwMi42ODggNTguMzMzMyAyMDMuMTQ3IDU3Ljg2NjcgMjAzLjQ4OCA1Ny4yODg5QzIwMy44MjkgNTYuNjk2MyAyMDMuOTk5IDU2LjA0NDQgMjAzLjk5OSA1NS4zMzMzQzIwMy45OTkgNTQuNjIyMiAyMDMuODI5IDUzLjk3NzggMjAzLjQ4OCA1My40QzIwMy4xNDcgNTIuODA3NCAyMDIuNjg4IDUyLjMzMzMgMjAyLjExIDUxLjk3NzhDMjAxLjU0NyA1MS42MjIyIDIwMC45MTggNTEuNDQ0NCAyMDAuMjIxIDUxLjQ0NDRDMTk5LjUxIDUxLjQ0NDQgMTk4Ljg2NiA1MS42MjIyIDE5OC4yODggNTEuOTc3OEMxOTcuNzI1IDUyLjMzMzMgMTk3LjI3MyA1Mi44MDc0IDE5Ni45MzIgNTMuNEMxOTYuNTkyIDUzLjk3NzggMTk2LjQyMSA1NC42MjIyIDE5Ni40MjEgNTUuMzMzM0MxOTYuNDIxIDU2LjA0NDQgMTk2LjU5MiA1Ni42OTYzIDE5Ni45MzIgNTcuMjg4OUMxOTcuMjczIDU3Ljg2NjcgMTk3LjcyNSA1OC4zMzMzIDE5OC4yODggNTguNjg4OUMxOTguODY2IDU5LjA0NDQgMTk5LjUwMyA1OS4yMjIyIDIwMC4xOTkgNTkuMjIyMlpNMjE0LjkwOCA2MlY0OC42NjY3SDIxOC4wNDJWNTFDMjE4LjUxNiA1MC4yMjk2IDIxOS4xMDggNDkuNjI5NiAyMTkuODE5IDQ5LjJDMjIwLjU0NSA0OC43NTU2IDIyMS40MDQgNDguNTMzMyAyMjIuMzk3IDQ4LjUzMzNMMjIzLjE3NSA1MS42ODg5QzIyMi44OTMgNTEuNiAyMjIuNTc1IDUxLjU1NTYgMjIyLjIxOSA1MS41NTU2QzIyMS4wNjQgNTEuNTU1NiAyMjAuMTM4IDUxLjkyNTkgMjE5LjQ0MiA1Mi42NjY3QzIxOC43NDUgNTMuNDA3NCAyMTguMzk3IDU0LjQ1OTMgMjE4LjM5NyA1NS44MjIyVjYySDIxNC45MDhaTTIzNS4wMTggNjIuMzExMUMyMzMuODAzIDYyLjMxMTEgMjMyLjY5MiA2MiAyMzEuNjg1IDYxLjM3NzhDMjMwLjY3NyA2MC43NDA3IDIyOS44NyA1OS44OTYzIDIyOS4yNjMgNTguODQ0NEMyMjguNjcgNTcuNzc3OCAyMjguMzc0IDU2LjYwNzQgMjI4LjM3NCA1NS4zMzMzQzIyOC4zNzQgNTQuMDU5MyAyMjguNjcgNTIuODk2MyAyMjkuMjYzIDUxLjg0NDRDMjI5Ljg3IDUwLjc3NzggMjMwLjY3NyA0OS45MzMzIDIzMS42ODUgNDkuMzExMUMyMzIuNjkyIDQ4LjY3NDEgMjMzLjgwMyA0OC4zNTU2IDIzNS4wMTggNDguMzU1NkMyMzUuODkyIDQ4LjM1NTYgMjM2LjcgNDguNTExMSAyMzcuNDQgNDguODIyMkMyMzguMTgxIDQ5LjEzMzMgMjM4LjgxMSA0OS41NzA0IDIzOS4zMjkgNTAuMTMzM1Y0OC42NjY3SDI0Mi4zNzRWNjJIMjM5LjMyOVY2MC41MzMzQzIzOC44MTEgNjEuMDgxNSAyMzguMTgxIDYxLjUxODUgMjM3LjQ0IDYxLjg0NDRDMjM2LjcgNjIuMTU1NiAyMzUuODkyIDYyLjMxMTEgMjM1LjAxOCA2Mi4zMTExWk0yMzUuNDQgNTkuMjIyMkMyMzYuMTUxIDU5LjIyMjIgMjM2Ljc4OCA1OS4wNDQ0IDIzNy4zNTEgNTguNjg4OUMyMzcuOTI5IDU4LjMzMzMgMjM4LjM4OCA1Ny44NjY3IDIzOC43MjkgNTcuMjg4OUMyMzkuMDcgNTYuNjk2MyAyMzkuMjQgNTYuMDQ0NCAyMzkuMjQgNTUuMzMzM0MyMzkuMjQgNTQuNjIyMiAyMzkuMDcgNTMuOTc3OCAyMzguNzI5IDUzLjRDMjM4LjM4OCA1Mi44MDc0IDIzNy45MjkgNTIuMzMzMyAyMzcuMzUxIDUxLjk3NzhDMjM2Ljc4OCA1MS42MjIyIDIzNi4xNTkgNTEuNDQ0NCAyMzUuNDYzIDUxLjQ0NDRDMjM0Ljc1MSA1MS40NDQ0IDIzNC4xMDcgNTEuNjIyMiAyMzMuNTI5IDUxLjk3NzhDMjMyLjk2NiA1Mi4zMzMzIDIzMi41MTQgNTIuODA3NCAyMzIuMTc0IDUzLjRDMjMxLjgzMyA1My45Nzc4IDIzMS42NjMgNTQuNjIyMiAyMzEuNjYzIDU1LjMzMzNDMjMxLjY2MyA1Ni4wNDQ0IDIzMS44MzMgNTYuNjk2MyAyMzIuMTc0IDU3LjI4ODlDMjMyLjUxNCA1Ny44NjY3IDIzMi45NjYgNTguMzMzMyAyMzMuNTI5IDU4LjY4ODlDMjM0LjEwNyA1OS4wNDQ0IDIzNC43NDQgNTkuMjIyMiAyMzUuNDQgNTkuMjIyMloiIGZpbGw9IiNGOUI1OUIiLz4KPHBhdGggZD0iTTI2MS45NTIgNjJWNDJIMjcyLjM5N1Y0NS4wNjY3SDI2NS40NjNWNDguNTMzM0gyNzEuNzNWNTEuNkgyNjUuNDYzVjYySDI2MS45NTJaTTI4My44OTYgNjIuMzExMUMyODIuNjgxIDYyLjMxMTEgMjgxLjU3IDYyIDI4MC41NjIgNjEuMzc3OEMyNzkuNTU1IDYwLjc0MDcgMjc4Ljc0NyA1OS44OTYzIDI3OC4xNCA1OC44NDQ0QzI3Ny41NDcgNTcuNzc3OCAyNzcuMjUxIDU2LjYwNzQgMjc3LjI1MSA1NS4zMzMzQzI3Ny4yNTEgNTQuMDU5MyAyNzcuNTQ3IDUyLjg5NjMgMjc4LjE0IDUxLjg0NDRDMjc4Ljc0NyA1MC43Nzc4IDI3OS41NTUgNDkuOTMzMyAyODAuNTYyIDQ5LjMxMTFDMjgxLjU3IDQ4LjY3NDEgMjgyLjY4MSA0OC4zNTU2IDI4My44OTYgNDguMzU1NkMyODQuNzcgNDguMzU1NiAyODUuNTc3IDQ4LjUxMTEgMjg2LjMxOCA0OC44MjIyQzI4Ny4wNTkgNDkuMTMzMyAyODcuNjg4IDQ5LjU3MDQgMjg4LjIwNyA1MC4xMzMzVjQ4LjY2NjdIMjkxLjI1MVY2MkgyODguMjA3VjYwLjUzMzNDMjg3LjY4OCA2MS4wODE1IDI4Ny4wNTkgNjEuNTE4NSAyODYuMzE4IDYxLjg0NDRDMjg1LjU3NyA2Mi4xNTU2IDI4NC43NyA2Mi4zMTExIDI4My44OTYgNjIuMzExMVpNMjg0LjMxOCA1OS4yMjIyQzI4NS4wMjkgNTkuMjIyMiAyODUuNjY2IDU5LjA0NDQgMjg2LjIyOSA1OC42ODg5QzI4Ni44MDcgNTguMzMzMyAyODcuMjY2IDU3Ljg2NjcgMjg3LjYwNyA1Ny4yODg5QzI4Ny45NDcgNTYuNjk2MyAyODguMTE4IDU2LjA0NDQgMjg4LjExOCA1NS4zMzMzQzI4OC4xMTggNTQuNjIyMiAyODcuOTQ3IDUzLjk3NzggMjg3LjYwNyA1My40QzI4Ny4yNjYgNTIuODA3NCAyODYuODA3IDUyLjMzMzMgMjg2LjIyOSA1MS45Nzc4QzI4NS42NjYgNTEuNjIyMiAyODUuMDM2IDUxLjQ0NDQgMjg0LjM0IDUxLjQ0NDRDMjgzLjYyOSA1MS40NDQ0IDI4Mi45ODQgNTEuNjIyMiAyODIuNDA3IDUxLjk3NzhDMjgxLjg0NCA1Mi4zMzMzIDI4MS4zOTIgNTIuODA3NCAyODEuMDUxIDUzLjRDMjgwLjcxIDUzLjk3NzggMjgwLjU0IDU0LjYyMjIgMjgwLjU0IDU1LjMzMzNDMjgwLjU0IDU2LjA0NDQgMjgwLjcxIDU2LjY5NjMgMjgxLjA1MSA1Ny4yODg5QzI4MS4zOTIgNTcuODY2NyAyODEuODQ0IDU4LjMzMzMgMjgyLjQwNyA1OC42ODg5QzI4Mi45ODQgNTkuMDQ0NCAyODMuNjIxIDU5LjIyMjIgMjg0LjMxOCA1OS4yMjIyWk0yODIuOTE4IDQ2Ljg2NjdMMjg0Ljk2MiA0Mi40NjY3SDI4OC44MDdMMjg1LjY5NiA0Ni44NjY3SDI4Mi45MThaTTMwNS40NDkgNjIuNEMzMDQuMTMxIDYyLjQgMzAyLjkyMyA2Mi4wODE1IDMwMS44MjcgNjEuNDQ0NEMzMDAuNzQ1IDYwLjgwNzQgMjk5Ljg4NiA1OS45NTU2IDI5OS4yNDkgNTguODg4OUMyOTguNjEyIDU3LjgwNzQgMjk4LjI5NCA1Ni42MjIyIDI5OC4yOTQgNTUuMzMzM0MyOTguMjk0IDU0LjAyOTYgMjk4LjYxMiA1Mi44NDQ0IDI5OS4yNDkgNTEuNzc3OEMyOTkuODg2IDUwLjcxMTEgMzAwLjc0NSA0OS44NTkzIDMwMS44MjcgNDkuMjIyMkMzMDIuOTIzIDQ4LjU4NTIgMzA0LjEzMSA0OC4yNjY3IDMwNS40NDkgNDguMjY2N0MzMDYuMzgzIDQ4LjI2NjcgMzA3LjI2NCA0OC40MjIyIDMwOC4wOTQgNDguNzMzM0MzMDguOTIzIDQ5LjA0NDQgMzA5LjY1NyA0OS40OTYzIDMxMC4yOTQgNTAuMDg4OUwzMDkuMzYgNTMuNzc3OEMzMDguOTkgNTMuMTQwNyAzMDguNDc5IDUyLjU5MjYgMzA3LjgyNyA1Mi4xMzMzQzMwNy4xNzUgNTEuNjU5MyAzMDYuNDIgNTEuNDIyMiAzMDUuNTYgNTEuNDIyMkMzMDQuODIgNTEuNDIyMiAzMDQuMTUzIDUxLjYgMzAzLjU2IDUxLjk1NTZDMzAyLjk4MyA1Mi4zMTExIDMwMi41MjMgNTIuNzg1MiAzMDIuMTgzIDUzLjM3NzhDMzAxLjg0MiA1My45NTU2IDMwMS42NzEgNTQuNjA3NCAzMDEuNjcxIDU1LjMzMzNDMzAxLjY3MSA1Ni4wNDQ0IDMwMS44NDIgNTYuNjk2MyAzMDIuMTgzIDU3LjI4ODlDMzAyLjUyMyA1Ny44ODE1IDMwMi45ODMgNTguMzU1NiAzMDMuNTYgNTguNzExMUMzMDQuMTUzIDU5LjA2NjcgMzA0LjgyIDU5LjI0NDQgMzA1LjU2IDU5LjI0NDRDMzA2LjQyIDU5LjI0NDQgMzA3LjE3NSA1OS4wMTQ4IDMwNy44MjcgNTguNTU1NkMzMDguNDc5IDU4LjA4MTUgMzA4Ljk5IDU3LjUyNTkgMzA5LjM2IDU2Ljg4ODlMMzEwLjI5NCA2MC41Nzc4QzMwOS42NTcgNjEuMTcwNCAzMDguOTIzIDYxLjYyMjIgMzA4LjA5NCA2MS45MzMzQzMwNy4yNjQgNjIuMjQ0NCAzMDYuMzgzIDYyLjQgMzA1LjQ0OSA2Mi40Wk0zMTcuMDI5IDYyVjQ4LjY2NjdIMzIwLjUxOFY2MkgzMTcuMDI5Wk0zMTguNzg1IDQ2LjYyMjJDMzE4LjIzNyA0Ni42MjIyIDMxNy43NyA0Ni40MzcgMzE3LjM4NSA0Ni4wNjY3QzMxNy4wMTQgNDUuNjgxNSAzMTYuODI5IDQ1LjIxNDggMzE2LjgyOSA0NC42NjY3QzMxNi44MjkgNDQuMTAzNyAzMTcuMDE0IDQzLjYzNyAzMTcuMzg1IDQzLjI2NjdDMzE3Ljc3IDQyLjg5NjMgMzE4LjIzNyA0Mi43MTExIDMxOC43ODUgNDIuNzExMUMzMTkuMzQ4IDQyLjcxMTEgMzE5LjgxNCA0Mi44OTYzIDMyMC4xODUgNDMuMjY2N0MzMjAuNTU1IDQzLjYzNyAzMjAuNzQgNDQuMTAzNyAzMjAuNzQgNDQuNjY2N0MzMjAuNzQgNDUuMjE0OCAzMjAuNTU1IDQ1LjY4MTUgMzIwLjE4NSA0Ni4wNjY3QzMxOS44MTQgNDYuNDM3IDMxOS4zNDggNDYuNjIyMiAzMTguNzg1IDQ2LjYyMjJaTTMyOC4zMjIgNjJWNDAuNjY2N0gzMzEuODExVjYySDMyOC4zMjJaIiBmaWxsPSIjNzU3NTc1Ii8+CjxlbGxpcHNlIGN4PSI4Ni4zMzM0IiBjeT0iNDcuMzIwNiIgcng9IjI1LjY2NjciIHJ5PSIyNC42Nzk1IiBmaWxsPSIjRjlCNTlCIi8+CjxwYXRoIGQ9Ik0xMDcuNzE1IDQwLjIwNzdMMTAxLjU5NiA0Ni4wOTA3TDkzLjg2NjkgNDQuMDgxOUw5MS44NTkxIDM3LjAwNjlMOTcuNDI2NCAzMS42NTM4TDEwNS44OTggMzMuODc0NkwxMDYuNzkgMzAuNzI3Nkw5OC4zMDMxIDI4LjUwMTlMOTYuMDU5NiAyMC41OTM3TDkyLjc4ODQgMjEuNDUxNEw5NS4wMjg1IDI5LjM0NjVMODkuNDYzIDM0LjY5OEw4MS45MjM1IDMyLjcyMThMNzkuOTM5NSAyNS43MjgzTDg2LjIwMiAxOS43MDVMODMuODA0MiAxNy4zOTk0TDc3LjU0MTYgMjMuNDIxMUw2OS4wNjc4IDIxLjIwMDJMNjguMTc1OCAyNC4zNDcyTDc2LjY2MTUgMjYuNTcyOUw3OC42NDU2IDMzLjU2OTdMNzMuMDMyNiAzOC45NjY4TDY1Ljc5NSAzNy4wODY4TDYzLjQ1MTQgMjguODg1MUw2MC4xODE5IDI5Ljc0OTNMNjIuNDM1NiAzNy42MjY1TDU2LjE1OTUgNDMuNjYxMkw1OC41NTc0IDQ1Ljk2NjhMNjQuNjA0NSA0MC4xNTA2TDcyLjQzMzkgNDIuMTg1NUw3NC4zOTk0IDQ5LjA1ODNMNjguNzM3MSA1NC41MDI4TDYwLjQwMDcgNTIuMzM1N0w1OS41MTU1IDU1LjQ4NDRMNjcuOTcyNCA1Ny42ODI0TDcwLjI4NzEgNjUuNzc4MUw3My41NTY2IDY0LjkxMzlMNzEuMjE2NCA1Ni43MzAxTDc2LjY4NTMgNTEuNDY5OUw4NC4xMzY1IDUzLjQwN0w4Ni4yMTg5IDYwLjc0OTRMODAuMTAyMyA2Ni42MzA5TDgyLjUwMDEgNjguOTM2NUw4OC43NDU3IDYyLjkzMTFMOTcuMjM4MSA2NS4xMzg5TDk4LjEyMzMgNjEuOTkwM0w4OS40NDYgNTkuNzM1Mkw4Ny40NjUzIDUyLjc1MzJMOTMuMTYxNSA0Ny4yNzYxTDEwMC41MTYgNDkuMTg3MUwxMDIuODU4IDU3LjQ0MjdMMTA2LjEyOSA1Ni41ODVMMTAzLjg0NSA0OC41MzMzTDExMC4xMDcgNDIuNTExNkwxMDcuNzE1IDQwLjIwNzdaTTg1LjIxNSA1MC4zMTA2TDc3LjcxOCA0OC4zNjIxTDc1LjYzMzkgNDEuMDc2N0w4MS4wNDUxIDM1Ljg3Mkw4OC41ODEyIDM3Ljg0ODJMOTAuNjM2NSA0NS4wOTQ0TDg1LjIxNSA1MC4zMTA2WiIgZmlsbD0iIzc1NzU3NSIvPgo8cGF0aCBkPSJNOTAuMTU0NyA2OC4yODkyQzk5LjUxODggNjUuODc3NiAxMDYuODMxIDU4Ljg0NSAxMDkuMzQxIDQ5Ljg0MTFDMTA5Ljk2MyA0Ny42MTA1IDExMC4yNjUgNDUuMzQwNyAxMTAuMjY1IDQzLjA5MDZDMTEwLjI2NSAzNi4yNjE4IDEwNy40NzIgMjkuNTk5MyAxMDIuMzE3IDI0LjY0MjRDOTcuMTYzNCAxOS42ODU1IDkwLjIzNDQgMTcgODMuMTMwOCAxN0M4MC43OTA2IDE3IDc4LjQzMDEgMTcuMjkxOSA3Ni4xMTAzIDE3Ljg5MDNDNjYuNzQ3OSAyMC4zMDE5IDU5LjQzNCAyNy4zMzQ1IDU2LjkyNDIgMzYuMzM2OEM1Ni4zMDM1IDM4LjU2NzQgNTYgNDAuODM3MSA1NiA0My4wODczQzU2IDQ5LjkxNjEgNTguNzkzIDU2LjU3ODUgNjMuOTQ4MSA2MS41MzU0QzY5LjEwMzMgNjYuNDkyMyA3Ni4wMzIzIDY5LjE3NzkgODMuMTM0MiA2OS4xNzc5Qzg1LjQ3NjEgNjkuMTc5NSA4Ny44MzQ5IDY4Ljg4NzYgOTAuMTU0NyA2OC4yODkyWk01OS4zOTE2IDQzLjA4NzNDNTkuMzkxNiA0MS4xMTc2IDU5LjY1NjEgMzkuMTMzMiA2MC4yMDA0IDM3LjE3OThDNjIuMzk2NSAyOS4zMDI2IDY4Ljc5NDcgMjMuMTQ4OCA3Ni45ODcgMjEuMDM4OUM3OS4wMjAyIDIwLjUxNTUgODEuMDg0IDIwLjI2MTEgODMuMTMwOCAyMC4yNjExQzg5LjM0NTggMjAuMjYxMSA5NS40MDgyIDIyLjYxMDcgOTkuOTE5IDI2Ljk0OEMxMDQuNDMgMzEuMjg1MyAxMDYuODczIDM3LjExNjIgMTA2Ljg3MyA0My4wOTA2QzEwNi44NzMgNDUuMDYwMyAxMDYuNjA5IDQ3LjA0NDcgMTA2LjA2NSA0OC45OTgxQzEwMy44NjggNTYuODc1MyA5Ny40NzAzIDYzLjAyOSA4OS4yNzYzIDY1LjEzOUM4Ny4yNDQ4IDY1LjY2MjQgODUuMTgxIDY1LjkxNjcgODMuMTMyNSA2NS45MTY3Qzc2LjkxNzUgNjUuOTE2NyA3MC44NTUgNjMuNTY3MSA2Ni4zNDQzIDU5LjIyOThDNjEuODM1MiA1NC44OTQyIDU5LjM5MTYgNDkuMDYzMyA1OS4zOTE2IDQzLjA4NzNaIiBmaWxsPSIjNzU3NTc1Ii8+CjxwYXRoIGQ9Ik0xNSA2NEw0NSA0MyIgc3Ryb2tlPSIjNzU3NTc1IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNNyA3MEwxMCA2OCIgc3Ryb2tlPSIjRjlCNTlCIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMzcgOTdMNjcgNzYiIHN0cm9rZT0iIzc1NzU3NSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTI5IDEwM0wzMiAxMDEiIHN0cm9rZT0iI0Y5QjU5QiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTI2LjM2ODQgOTIuNjY2Nkw1NCA3NCIgc3Ryb2tlPSIjNzU3NTc1IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTkgOThMMjEuNzYzMiA5Ni4yMjIyIiBzdHJva2U9IiNGOUI1OUIiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xMi4zNjg0IDc0LjY2NjZMNDAgNTYiIHN0cm9rZT0iIzc1NzU3NSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTUgODBMNy43NjMxNiA3OC4yMjIyIiBzdHJva2U9IiNGOUI1OUIiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0yIDk2TDQ0IDY3IiBzdHJva2U9IiM3NTc1NzUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=';
        doc.addImage(logoData, 'PNG', margin, 10, 40, 15);
      } catch (e) {
        console.warn('Logo não carregada, usando texto alternativo');
        doc.setFontSize(16);
        doc.setTextColor(...primaryColor);
        doc.text('MINHA MARCA', margin, 15);
      }

      doc.setFontSize(10);
      doc.setTextColor(...lightColor);
      doc.text(`Relatório emitido em: ${new Date().toLocaleDateString('pt-BR')}`,
        pageWidth - margin, 15, { align: 'right' });

      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(margin, 20, pageWidth - margin, 20);
    };

    // Função para formatar moeda
    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    // Função para adicionar itens de lista
    const addListItem = (text: string, x: number, y: number) => {
      doc.text(`• ${text}`, x, y);
    };

    // Função principal para adicionar seções
    const addReportSection = (title: string, reserves: Reserve[]) => {
      if (reserves.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(...lightColor);
        doc.text(`${title} - Nenhum dado disponível`, margin, yPosition);
        yPosition += 10;
        return yPosition;
      }

      // Título da seção
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, yPosition);
      yPosition += 8;

      // Divisor
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Cálculos
      const total = reserves.reduce((acc, num) => acc + (num.value || 0), 0);
      const fixos = reserves.filter(r => r.typeReserve === 'fixa').reduce((acc, num) => acc + (num.value || 0), 0);
      const avulsos = reserves.filter(r => r.typeReserve === 'avulsa').reduce((acc, num) => acc + (num.value || 0), 0);
      const ocupacao = calculateSpaceOccupancy(reserves);

      // Lista de dados
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.setFont('helvetica', 'normal');

      addListItem(`Total de reservas: ${reserves.length}`, margin + 5, yPosition);
      yPosition += 6;
      addListItem(`Faturamento total: ${formatCurrency(total)}`, margin + 5, yPosition);
      yPosition += 6;
      addListItem(`Agendamentos fixos: ${formatCurrency(fixos)} (${total > 0 ? ((fixos / total) * 100).toFixed(0) : '0'}%)`, margin + 5, yPosition);
      yPosition += 6;
      addListItem(`Agendamentos avulsos: ${formatCurrency(avulsos)} (${total > 0 ? ((avulsos / total) * 100).toFixed(0) : '0'}%)`, margin + 5, yPosition);
      yPosition += 12;

      // Tabela de ocupação
      if (ocupacao.length > 0) {
        doc.setFontSize(11);
        doc.text('Ocupação por Espaço:', margin, yPosition);
        yPosition += 6;

        autoTable(doc, {
          startY: yPosition,
          head: [['Espaço', 'Ocupação (%)']],
          body: ocupacao.map(space => [space.name, `${space.occupancy}%`]),
          margin: { left: margin },
          styles: {
            fontSize: 9,
            cellPadding: 3,
            halign: 'center',
            textColor: darkColor
          },
          headStyles: {
            fillColor: primaryColor,
            textColor: whiteColor,
            fontStyle: 'bold'
          }
        });
        yPosition = (doc as any).lastAutoTable.finalY + 12;
      }

      // Últimos agendamentos
      const lastFive = [...reserves]
        .sort((a, b) => new Date(b.dataReserve).getTime() - new Date(a.dataReserve).getTime())
        .slice(0, 5);

      if (lastFive.length > 0) {
        doc.setFontSize(11);
        doc.text('Últimos Agendamentos:', margin, yPosition);
        yPosition += 6;

        autoTable(doc, {
          startY: yPosition,
          head: [['Espaço', 'Data', 'Horário', 'Tipo', 'Valor', 'Status']],
          body: lastFive.map(reserve => [
            getSpaceName(reserve.spaceId),
            new Date(reserve.dataReserve).toLocaleDateString('pt-BR'),
            `${reserve.timeInitial.slice(0, 5)} - ${reserve.timeFinal.slice(0, 5)}`,
            reserve.typeReserve === 'fixa' ? 'Fixa' : 'Avulsa',
            formatCurrency(reserve.value || 0),
            reserve.status
          ]),
          margin: { left: margin },
          styles: {
            fontSize: 8,
            cellPadding: 2,
            halign: 'center',
            textColor: darkColor
          },
          headStyles: {
            fillColor: primaryColor,
            textColor: whiteColor,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { halign: 'left', cellWidth: 30 },
            1: { cellWidth: 20 },
            2: { cellWidth: 25 },
            3: { cellWidth: 15 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 }
          }
        });
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      if (yPosition > 270) {
        doc.addPage();
        addHeader();
        yPosition = 25;
      }

      return yPosition;
    };

    // Definir períodos de relatório
    const today = new Date();
    const periods = [
      {
        name: "Hoje",
        filter: (data: Reserve[]) => data.filter(reserve =>
          isSameDay(new Date(reserve.dataReserve), today))
      },
      {
        name: "Esta Semana (Domingo à Hoje)",
        filter: (data: Reserve[]) => {
          const startOfWeekDate = startOfWeek(today, { weekStartsOn: 0 });
          return data.filter(reserve =>
            isWithinInterval(new Date(reserve.dataReserve), {
              start: startOfWeekDate,
              end: today
            }))
        }
      },
      {
        name: "Este Mês (Dia 1 à Hoje)",
        filter: (data: Reserve[]) => {
          const startOfMonthDate = startOfMonth(today);
          return data.filter(reserve =>
            isWithinInterval(new Date(reserve.dataReserve), {
              start: startOfMonthDate,
              end: today
            }))
        }
      },
      {
        name: "Mês Passado",
        filter: (data: Reserve[]) => {
          const startOfLastMonth = startOfMonth(subMonths(today, 1));
          const endOfLastMonth = endOfMonth(subMonths(today, 1));
          return data.filter(reserve =>
            isWithinInterval(new Date(reserve.dataReserve), {
              start: startOfLastMonth,
              end: endOfLastMonth
            }))
        }
      },
      {
        name: "Últimos 3 Meses",
        filter: (data: Reserve[]) => {
          const startOfThreeMonthsAgo = startOfMonth(subMonths(today, 2));
          return data.filter(reserve =>
            isWithinInterval(new Date(reserve.dataReserve), {
              start: startOfThreeMonthsAgo,
              end: today
            }))
        }
      },
      {
        name: `Período Personalizado (${format(initialDate, 'dd/MM/yyyy') || '--'} à ${format(endDate, 'dd/MM/yyyy') || '--'})`,
        filter: (data: Reserve[]) => {
          if (!initialDate || !endDate) return [];
          const startDate = new Date(initialDate);
          const endDateAdj = addDays(new Date(endDate), 1);
          return data.filter(reserve =>
            isWithinInterval(new Date(reserve.dataReserve), {
              start: startDate,
              end: endDateAdj
            }))
        },
        condition: initialDate && endDate
      }
    ];

    // Adicionar sumário executivo
    doc.setFontSize(16);
    doc.setTextColor(...darkColor);
    doc.text('Sumário Executivo', margin, yPosition);
    yPosition += 10;

    const allReserves = dataReserve.filter(r => r.status !== 'Cancelada');
    const totalGeral = allReserves.reduce((acc, num) => acc + (num.value || 0), 0);

    addListItem(`Total geral de reservas: ${allReserves.length}`, margin + 5, yPosition);
    yPosition += 6;
    addListItem(`Faturamento total: ${formatCurrency(totalGeral)}`, margin + 5, yPosition);
    yPosition += 6;
    addListItem(`Período coberto até: ${new Date().toLocaleDateString('pt-BR')}`, margin + 5, yPosition);
    yPosition += 15;

    // Gerar seções para cada período
    periods.forEach(period => {
      // if (period.condition === false) return;
      const filteredData = period.filter(dataReserve);
      yPosition = addReportSection(period.name, filteredData);
    });

    // Salvar o PDF
    doc.save(`Relatorio_Faturamento_${new Date().toISOString().slice(0, 10)}.pdf`);
    setIsLoading(false);
  }

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
              <button className='btn-export' onClick={() => generatePdf()}>
                <FaRegFilePdf size={18} />
                Exportar
              </button>
            </header>

            <section className="area-cards-billing">
              <div className="card-billing">
                <p>Faturamento Total <FaMoneyBillTrendUp color='#ff8a5b' /></p>
                <h1>R$ {new Intl.NumberFormat('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(totalFaturamento)}</h1>
                <h5></h5>
              </div>

              <div className="card-billing">
                <p>Agendamentos Fixos <MdPushPin color='#ff8a5b' /></p>
                <h1>R$ {new Intl.NumberFormat('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(totalFixos)}</h1>
                <h5>{porcentagemFixos}% do total</h5>
              </div>

              <div className="card-billing">
                <p>Agendamentos Avulsos <FaFireAlt color='#ff8a5b' /></p>
                <h1>R$ {new Intl.NumberFormat('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(totalAvulsos)}</h1>
                <h5>{porcentagemAvulsos}% do total</h5>
              </div>
            </section>

            <section className="area-porc">
              <div className="card-porc">
                <h2 className="title-porc-card">Ocupação por espaço</h2>
                {spacesOccupancy.length > 0 ? (
                  spacesOccupancy.map(space => (
                    <div className="line-porc" key={space.spaceId}>
                      <h4>{space.name}</h4>
                      <div className="bar">
                        <div
                          className="percent"
                          style={{
                            width: `${space.occupancy}%`,
                          }}
                        ></div>
                      </div>
                      <h4
                        className="percent-number"
                        style={{ color: '#FF8A5B' }}
                      >
                        {space.occupancy}%
                      </h4>
                    </div>
                  ))
                ) : (
                  <p className="no-data">Nenhum dado disponível para o período selecionado</p>
                )}
              </div>

              <div className="card-last-schedules">
                <h2 className="title-porc-card">Últimos agendamentos</h2>
                <div className="schedules-table">
                  {lastReserves.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Espaço</th>
                          <th>Data</th>
                          <th>Horário</th>
                          <th>Tipo</th>
                          <th>Valor</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lastReserves.map(reserve => (
                          <tr key={reserve.id_reserve}>
                            <td>{getSpaceName(reserve.spaceId)}</td>
                            <td>{new Date(reserve.dataReserve).toLocaleDateString('pt-BR')}</td>
                            <td>{reserve.timeInitial.split(':').slice(0, 2).join(":")} - {reserve.timeFinal.split(':').slice(0, 2).join(":")}</td>
                            <td>{reserve.typeReserve === 'fixa' ? 'Fixa' : 'Avulsa'}</td>
                            <td>R$ {reserve.value?.toFixed(2) || '0,00'}</td>
                            <td>
                              <span className={`status-${reserve.status.toLowerCase()}`}>
                                {reserve.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-data">Nenhum agendamento encontrado</p>
                  )}
                </div>
              </div>
            </section>
          </section>
        </main>
      )}
    </>
  );
}