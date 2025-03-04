import "./style-config.css"
import { FiActivity, FiArrowDownRight, FiCheck, FiChevronRight, FiDollarSign, FiEdit, FiLogOut, FiTrash, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { AuthContext } from "../../services/contexts/AuthContext";
import Toast from "../../components/Toast";
import Loading from "../../components/Loading";
import { api } from "../../services/axiosApi/apiClient";
import { CiUser, CiPower, CiStar, CiClock2, CiBadgeDollar } from "react-icons/ci";
import { IMaskInput } from "react-imask";
import Switch from "react-switch"
import { format } from "date-fns";

// Tipagem de AddressArena conforme a estrutura fornecida
type AddressArena = {
  $id: string;
  state: string;
  city: string;
  street: string;
  neighborhood: string;
  number: number;
  reference: string;
  arenaId: number;
  arena: {
    $ref: string;
  };
};

// Tipagem de Plan conforme a estrutura fornecida
type Plan = {
  $id: string;
  id: number;
  planSelect: string;
  planExpiry: string;
  arenaId: number;
  status: string;
  arena: {
    $ref: string;
  };
};

// Tipagem de Arena, ajustada para refletir o objeto retornado
type Arena = {
  $id: string;
  id: number;
  name: string;
  phone: string;
  status: string;
  valueHour: number;
  adressArenas: {
    $id: string;
    $values: AddressArena[];
  };
  plans: {
    $id: string;
    $values: Plan[];
  };
};

// Tipagem ajustada para refletir a estrutura retornada pela API
type GetAllArenasResponse = Arena; // Agora é um único objeto Arena, não uma lista

interface Program {
  $id: string;
  id: number;
  startDate: string; // ou Date, dependendo de como você deseja tratar a data
  endDate: string; // ou Date
  arenaId: number;
  reason: string;
}

interface ProgramResponse {
  $id: string;
  $values: Program[];
}

interface WeekSchedule {
  id: number;
  arenaId: number;
  weekDays: {
    $id: string;
    $values: number[];  // O valor real do array de dias da semana
  };
  startTime: string;
  endTime: string;
  open: boolean;
}



export default function ConfigArena() {
  const navigate = useNavigate();
  const [modalIsOpenPrincipal, setModalIsOpenPrincipal] = useState<boolean>(false);
  const [modalIsOpenOpeningHours, setModalIsOpenOpeningHours] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [getAllArenas, setGetAllArenas] = useState<GetAllArenasResponse | null>(null);
  const [selectedMenu, setSelectedMenu] = useState('')

  const [modoEdicao, setModoEdicao] = useState(false);

  const [arenaName, setArenaName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [valueHour, setValueHour] = useState<number>()
  const [state, setState] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [street, setStreet] = useState<string>('')
  const [neighborhood, setNeighborhood] = useState<string>('')
  const [number, setNumber] = useState<number>()
  const [reference, setReference] = useState<string>('')

  const [isCheckedSwitch, setIsCheckeSwith] = useState<boolean>(false)

  const [isShowProg, setIsShowProg] = useState<boolean>(false)

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [reason, setReason] = useState<string>('')

  const [programs, setPrograms] = useState<Program[]>([]);

  const [weekDays, setWeekDays] = useState<number[]>([]); // Começa vazio até carregar do backend
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [shouldFetchPrograms, setShouldFetchPrograms] = useState(false); // Variável de controle


  const authContext = useContext(AuthContext);
  const { user, logout }: any = authContext;

  useEffect(() => {
    // setClassAreaUser(false)
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle('');
        setSendMessage('');
      }, 3000);

      return () => clearTimeout(timer); // Limpar o timer ao desmontar o componente ou atualizar os estados
    }
  }, [sendTitle, sendMessage]);

  useEffect(() => {
    if (getAllArenas) {
      setArenaName(getAllArenas.name); // Atualiza o estado arenaName
      setPhone(getAllArenas.phone)
      setValueHour(Number(getAllArenas.valueHour))

      setState(getAllArenas.adressArenas.$values[0].state)
      setCity(getAllArenas.adressArenas.$values[0].city)
      setStreet(getAllArenas.adressArenas.$values[0].street)
      setNeighborhood(getAllArenas.adressArenas.$values[0].neighborhood)
      setNumber(Number(getAllArenas.adressArenas.$values[0].number))
      setReference(getAllArenas.adressArenas.$values[0].reference)
    }
  }, [getAllArenas]); // Esse efeito só é executado quando getAllArenas é atualizado

  // Função para alternar o modo de edição
  const alternarModoEdicao = async () => {
    setModoEdicao(!modoEdicao);

    //se edição desbloqueada libera para confirmar edição
    if (modoEdicao) {
      if (arenaName === "" || phone === "" || valueHour == 0 || state === "" || city === "" ||
        street === "" || neighborhood === "" || number == 0 || reference === ""
      ) {
        setSendTitle('error');
        setSendMessage('Preencha os dados.');
        return;
      } else {

        await api.put("/api/Arena/arena-edit", {
          arenaId: user?.arena,
          name: arenaName,
          phone: phone,
          valueHour: valueHour,
          state: state,
          city: city,
          street: street,
          neighborhood: neighborhood,
          number: number,
          reference: reference
        })
        setSendTitle('success');
        setSendMessage(`Alteração realizada.`);
      }
    }

  };

  async function handleDesativeProgram() {
    // Validação dos dados de entrada
    if (startDate === null || endDate === null || reason === "") {
      setSendTitle('error');
      setSendMessage('Preencha corretamente.');
      return;
    }

    try {
      // Envia a solicitação para desativar o programa
      const response = await api.post("/api/DesativeProgram/desative/program", {
        startDate: format(startDate, 'yyyy-MM-dd'), // Formata as datas
        endDate: format(endDate, 'yyyy-MM-dd'),
        arenaId: user?.arena,
        reason: reason
      });

      // Exibe a mensagem de sucesso
      setSendTitle('success');
      setSendMessage('Arena será desativada.');

      // Limpa os campos após o sucesso
      setStartDate(null);
      setEndDate(null);
      setReason("");

      // Oculta o programa agendado
      setIsShowProg(false);
      setShouldFetchPrograms(shouldFetchPrograms ? false : true)

      navigate("/principal")

      // Verifica se a data atual está dentro do intervalo de desativação
      const currentDate = new Date();
      const programStartDate = new Date(response.data.startDate);
      const programEndDate = new Date(response.data.endDate);

      if (currentDate >= programStartDate && currentDate <= programEndDate) {
        // Se a data atual estiver dentro do intervalo, desativa a arena
        await api.put("/api/Arena/status-edit", {
          realArenaId: user?.arena,
          newStatus: "inativo"
        });
        setIsCheckeSwith(false)
        setShouldFetchPrograms(true)
      }

    } catch (error: any) {
      // Em caso de erro, exibe a mensagem de erro
      setSendTitle('error');
      setSendMessage(error.response.data);
      setIsShowProg(false)
    }
  }


  // style modal opening Hours
  const customStylesModalPrincipal = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '10px',
      padding: '0px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '70vw',
      height: '80vh',
      maxWidth: '90%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

  function openModalPrincipal() {
    setModalIsOpenPrincipal(true);   // Abre o modal
  }

  function closeModalPrincipal() {
    setModalIsOpenPrincipal(false);
    navigate("/principal")
  }

  useEffect(() => {
    openModalPrincipal();
  }, [])

  async function getArena() {
    setIsLoading(true)
    try {
      const response = await api.post<GetAllArenasResponse>("/api/Arena/getArena", {
        arenaId: user?.arena
      })
      setIsLoading(false)
      setGetAllArenas(response.data);
      setIsLoading(false);
    } catch (error: any) {

      setIsLoading(false);
      setSendTitle('error');
      setSendMessage('Erro ao buscar arena.');
    }
  }
  useEffect(() => {
    getArena();
  }, [])

  useEffect(() => {
    handleClickMenu("perfil")
  }, [])

  function handleClickMenu(click: string) {
    if (selectedMenu === "") {
      setSelectedMenu('perfil')
      return;
    } else if (click === "perfil") {
      setSelectedMenu("perfil")
      return;
    } else if (click === "expediente") {
      setSelectedMenu("expediente")
      return;
    } else if (click === "promocao") {
      setSelectedMenu("promocao")
      return;
    } else if (click === "desativar") {
      setSelectedMenu("desativar")
      return;
    }
  }



  useEffect(() => {
    setIsCheckeSwith(getAllArenas?.status === 'ativo');
  }, [getAllArenas]);

  useEffect(() => {
    async function getDesativeProgram() {
      await api.post<ProgramResponse>("/api/DesativeProgram/get", {
        arenaId: user?.arena
      }).then((response) => {
        setPrograms(response.data.$values);
        setShouldFetchPrograms(true)
        return;
      }).catch((error: any) => {
        setSendTitle('error');
        setSendMessage('Erro ao buscar programação.');
      })
    }
    getDesativeProgram();
  }, [shouldFetchPrograms])

  const handleChangeSwitch = async (nextChecked: boolean) => {
    const currentDate = new Date();

    // Verificar se o array de programas está vazio ou não
    if (programs && programs.length > 0) {
      const programStartDate = new Date(programs[0].startDate);
      const programEndDate = new Date(programs[0].endDate);

      // Verificar se a data atual está dentro do intervalo do programa
      if (currentDate >= programStartDate && currentDate <= programEndDate) {
        try {
          const response = await api.delete("/api/DesativeProgram/delete", {
            data: { id: programs[0].id }  // Envia o id no corpo da requisição
          });
          setPrograms((prevPrograms) => prevPrograms.filter(program => program.id !== programs[0].id));
          console.log("Program deleted:", response.data); // Log da resposta
        } catch (error) {
          console.error("Error deleting program:", error); // Log de erro
          setSendTitle('error');
          setSendMessage('Erro ao excluir programação.');
        }
      }
    }

    // Atualiza o estado do switch
    setIsCheckeSwith(nextChecked);

    // Agora, independentemente do programa, alteramos o status da arena
    try {
      await api.put('/api/Arena/status-edit', {
        realArenaId: user?.arena,
        newStatus: nextChecked ? 'ativo' : 'inativo',
      });

      setSendTitle('success');
      setSendMessage(`Arena ${nextChecked ? 'ativada' : 'desativada'}.`);
    } catch (error) {
      setSendTitle('error');
      setSendMessage('Erro ao alterar o status da arena.');
    }
  };



  async function handleDeleteProgram(id: number) {
    try {
      const response = await api.delete("/api/DesativeProgram/delete", {
        data: { id: id }  // Envia o id no corpo da requisição
      });

      // Atualiza a lista de programas após a exclusão
      setPrograms((prevPrograms) => prevPrograms.filter(program => program.id !== id));

      setSendTitle('success');
      setSendMessage(response.data); // Mensagem de sucesso
      setShouldFetchPrograms(true)
    } catch (error: any) {
      setSendTitle('error');
      setSendMessage(error.response.data);
    }
  }

  //expediente
  // Função para alternar os dias da semana
  const toggleDay = (day: number) => {
    setWeekDays((prevWeekDays: any) =>
      prevWeekDays.includes(day)
        ? prevWeekDays.filter((d: any) => d !== day) // Remove o dia se já estiver
        : [...prevWeekDays, day] // Adiciona o dia se não estiver
    );
  };

  // Funções para manipular o tempo
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value);
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value);

  // Mapeando os dias da semana para o layout
  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const [isOpen, setIsOpen] = useState(true); // Exemplo de estado para controlar a abertura

  const [valueOpen, setValueOpen] = useState<boolean>(true);
  const handleOpenClick = () => {
    setValueOpen(true); // Altera para "aberto"
  };

  const handleCloseClick = () => {
    setValueOpen(false); // Altera para "fechado"
  };

  async function handleAddHour() {
    try {
      if (weekDays.length === 0) {
        setSendTitle('error');
        setSendMessage('Selecione os dias da semana.');
        return;
      } else if (valueOpen && (startTime === '' || endTime === '')) {
        setSendTitle('error');
        setSendMessage('Selecione os horários');
        return;
      }
      else {
        await api.post("/api/ArenaHours/arena-hours", {
          ArenaId: user?.arena,
          WeekDays: weekDays,
          StartTime: !valueOpen ? '00:00:00' : startTime + ':00',
          EndTime: !valueOpen ? '00:00:00' : endTime + ':00',
          Open: valueOpen
        })
          .then(async (response: any) => {
            setSendTitle('success');
            setSendMessage(response?.data);
            await fetchHours();
            setWeekDays([])
            setValueOpen(true)
            setEndTime("")
            setStartTime("")
            return;
          }).catch((error: any) => {
            setSendTitle('error');

            // Extrair mensagens de erro detalhadas da resposta
            if (error?.response?.data?.errors) {
              const errorMessages = Object.keys(error.response.data.errors).map(field => {
                return `${field}: ${error.response.data.errors[field].join(', ')}`;
              }).join(', ');

              setSendMessage(`Erro(s): ${errorMessages}`);
            } else {
              // Caso não tenha erros detalhados, mostre a mensagem geral
              setSendMessage(error?.response?.data?.title || 'Erro desconhecido');
            }
            return;
          });
      }
    } catch (error: any) {
      setSendTitle('error');
      setSendMessage('Erro desconhecido');
      console.log(error.response.data)
      return;
    }
  }

  const [getHours, setGetHours] = useState<WeekSchedule[]>([]);

  async function fetchHours() {
    try {
      const response = await api.post("/api/ArenaHours/get", {
        arenaId: user?.arena
      });
      setGetHours(response?.data?.$values);
    } catch (error: any) {
      console.log(error?.response?.data || "Erro desconhecido");
    }
  }

  useEffect(() => {
    fetchHours(); // Chama a função para obter os dados
  }, []);

  async function deleteHour(id: number) {
    await api.delete("/api/ArenaHours/delete", {
      data: {
        Id: id
      }
    }).then((response) => {
      setSendTitle('success');
      setSendMessage(response.data);
      setGetHours(prevHours => prevHours.filter(hour => hour.id !== id));
    }).catch((error: any) => {
      console.log(error?.response?.data || "Erro desconhecido");
    })
  }

  //promotions -------------------

  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [selectedValueRadio, setSelectedValueRadio] = useState<string>("todo-dia");
  const [startDatePromotion, setStartDatePromotion] = useState<string>("")
  const [endDatePromotion, setEndDatePromotion] = useState<string>("")
  const [valuePromotion, setValuePromotion] = useState<number | undefined>(undefined)
  const [QtdPeoplePromotion, setQtdPeoplePromotion] = useState<number | undefined>(undefined)

  // Função para lidar com a mudança no select
  const handleChangePromotions = (event: any) => {
    setSelectedPromotion(event.target.value);
  };

  // Função para lidar com a mudança do valor do radio
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValueRadio(event.target.value);
  };

  async function handleRegisterPromotion() {

    if (selectedPromotion === "dayuse") {
      // Verifica se algum valor em schedule.weekDays.$values corresponde a algum valor em weekDays
      // E também verifica se a coluna close é igual a 0 (indicando que está fechado)
      const hasClose = getHours.some((schedule) =>
        schedule.weekDays.$values.some((day) =>
          weekDays.includes(day) && schedule.open === false
        )
      );

      if (hasClose) {//se o dia do day use for o mesmo que foi configurado para está fechado

        const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

        const dayArray = getHours.filter(item => item.open === false);
        const allDays = dayArray.flatMap(item => item.weekDays.$values);
        const dayWeek = allDays.toString()

        setSendTitle('error');
        setSendMessage(`${daysOfWeek[Number(dayWeek) - 1]} - fechado na arena.`)
        return
      } else {
        if (selectedPromotion === "dayuse") {
          if (valuePromotion === undefined || weekDays.length === 0) {

            setSendTitle('error');
            setSendMessage(`Preencha todos os campos.`)
            return;
          }
        }

        try {
          const response = await api.post("/api/Promotions/promotion", {
            promotionType: selectedPromotion,
            when: "por-periodo",
            startDate: selectedPromotion === "dayuse" ? null : startDatePromotion,
            endDate: selectedPromotion === "dayuse" ? null : endDatePromotion,
            weekDays: weekDays,
            value: valuePromotion, // Garantindo que seja número
            qtdPeople: 0,
            arenaId: user?.arena,
          });

          setSendTitle('success');
          setSendMessage(response?.data);

          setQtdPeoplePromotion(undefined)
          setValuePromotion(undefined)
          setWeekDays([])

          await loadPromotionsFunction();
        } catch (error: any) {
          setSendTitle('error');

          const errorMessage = error?.response?.data || 'Erro desconhecido'; // Valor padrão caso não tenha resposta da API
          setSendMessage(errorMessage);
        }
      }
      return;
    } else if (selectedPromotion === "2h" ||
      selectedPromotion === "3h" ||
      selectedPromotion === "4h" ||
      selectedPromotion === "5h"
    ) {
      if (selectedValueRadio === "todo-dia") {
        try {
          const response = await api.post("/api/Promotions/promotion", {
            promotionType: selectedPromotion,
            when: selectedValueRadio,
            startDate: selectedValueRadio === "todo-dia" ? format(new Date(), "yyyy-MM-dd") : "",
            endDate: selectedValueRadio === "todo-dia" ? format(new Date(), "yyyy-MM-dd") : "",
            weekDays: [0],
            value: valuePromotion,
            qtdPeople: 0,
            arenaId: user?.arena,
          });

          setSendTitle('success');
          setSendMessage(response?.data);

          await loadPromotionsFunction();

        } catch (error: any) {
          setSendTitle('error');

          const errorMessage = error?.response?.data;
          setSendMessage(errorMessage);
        }
        return;
      } else {
        try {
          const response = await api.post("/api/Promotions/promotion", {
            promotionType: selectedPromotion,
            when: selectedValueRadio,
            startDate: format(startDatePromotion, "yyyy-MM-dd"),
            endDate: format(endDatePromotion, "yyyy-MM-dd"),
            weekDays: [0],
            value: valuePromotion,
            qtdPeople: 0,
            arenaId: user?.arena,
          });

          setSendTitle('success');
          setSendMessage(response?.data);

          setQtdPeoplePromotion(undefined)
          setValuePromotion(undefined)
          setWeekDays([])

          await loadPromotionsFunction();
        } catch (error: any) {
          setSendTitle('error');

          const errorMessage = error?.response?.data || 'Erro desconhecido';
          setSendMessage(errorMessage);
        }
        return;
      }
      return;
    }
  }

  interface WeekDaysResponse {
    $id: string;
    $values: number[];
  }

  interface Promotion {
    $id: string;
    id: number;
    promotionType: string;
    when: string;
    weekDays: WeekDaysResponse;
    value: number;
    qtdPeople: number;
    arenaId: number;
    startDate?: string;
    endDate?: string;
  }

  interface PromotionResponse {
    $id: string;
    $values: Promotion[];
  }

  const [loadPromotions, setLoadPromotions] = useState<Promotion[]>([]);

  async function loadPromotionsFunction() {
    await api.post("/api/Promotions/get-promotion", {
      arenaId: user?.arena
    }).then((response) => {
      setLoadPromotions(response?.data?.$values)
    }).catch((error: any) => {
      setSendTitle('error');
      setSendMessage(error?.response?.data);
    })
  }

  useEffect(() => {
    loadPromotionsFunction();
  }, [])

  async function handleDeletePromotion(id: number) {
    await api.delete("/api/Promotions/delete", {
      data: {
        arenaId: id
      }
    }).then(async (response) => {
      setSendTitle('success');
      setSendMessage(response?.data);
      await loadPromotionsFunction();
    }).catch((error: any) => {
      setSendTitle('error');
      setSendMessage(error?.response?.data);
    })
  }

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      {
        isLoading ?
          <Loading />
          : (
            <>
              {/* Modal principal */}
              <Modal
                isOpen={modalIsOpenPrincipal}
                onRequestClose={closeModalPrincipal}
                style={customStylesModalPrincipal}
                shouldCloseOnOverlayClick={false}
              >
                <main className="main-modal-config">
                  <section className="left-config">
                    <h1>{getAllArenas?.name}</h1>

                    <div className="item-menu-config"
                      onClick={() => handleClickMenu("perfil")}
                      title="Visualize ou edite os dados da sua arena."
                      style={{ backgroundColor: `${selectedMenu === 'perfil' ? 'var(--secundary-color)' : ''}` }}
                    >
                      <div className="first">
                        <CiUser size={20} />
                        <p>Perfil</p>
                      </div>
                      <FiChevronRight size={20} />
                    </div>

                    <div className="item-menu-config"
                      onClick={() => handleClickMenu("expediente")}
                      title="Registre o horário de funcionamento da sua arena."
                      style={{ backgroundColor: `${selectedMenu === 'expediente' ? 'var(--secundary-color)' : ''}` }}
                    >
                      <div className="first">
                        <CiClock2 size={20} />
                        <p>Expediente</p>
                      </div>
                      <FiChevronRight size={20} />
                    </div>

                    <div className="item-menu-config"
                      onClick={() => handleClickMenu("promocao")}
                      title="Registre as promoções de sua arena."
                      style={{ backgroundColor: `${selectedMenu === 'promocao' ? 'var(--secundary-color)' : ''}` }}
                    >
                      <div className="first">
                        <CiBadgeDollar size={20} />
                        <p>Promoções</p>
                      </div>
                      <FiChevronRight size={20} />
                    </div>

                    <div className="item-menu-config"
                      onClick={() => handleClickMenu("desativar")}
                      title="Desative temporariamente sua arena."
                      style={{ backgroundColor: `${selectedMenu === 'desativar' ? 'var(--secundary-color)' : ''}` }}
                    >
                      <div className="first">
                        <CiPower size={20} />
                        <p>Dasativar</p>
                      </div>
                      <FiChevronRight size={20} />
                    </div>

                    <footer className="btn-logout">
                      <button onClick={() => logout()}>
                        <FiLogOut size={20} />
                        Log out
                      </button>
                    </footer>
                  </section>

                  <section className="rigth-config">
                    <header>
                      <h3>{
                        selectedMenu === "perfil" ? `Visualize ou edite os dados da arena.` :
                          selectedMenu === "expediente" ? "Registre o horário de funcionamento" :
                            selectedMenu === "desativar" ? "Desative temporariamente sua arena" :
                              selectedMenu === "promocao" ? "Registre suas promoções" : ""

                      }</h3>
                      <div className="area-close-modal" onClick={() => closeModalPrincipal()}>
                        <FiX size={24} />
                      </div>
                    </header>

                    {/* perfil */}
                    {
                      selectedMenu === "perfil" && (
                        <section className="perfil">
                          <h3>Dados Arena:</h3>
                          <section className="data-arena">
                            <div className="area-input">
                              <label>Arena:</label>
                              <input
                                type="text"
                                value={arenaName}
                                onChange={(e) => setArenaName(e.target.value)}
                                disabled={!modoEdicao}
                              />
                            </div>
                            <div className="area-input">
                              <label>Telefone:</label>
                              <IMaskInput
                                mask={"(00)00000-0000"}
                                type="text"
                                placeholder='Telefone'
                                value={phone}
                                disabled={!modoEdicao}
                                onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
                              />
                            </div>
                            <div className="area-input">
                              <label>Valor Hora:</label>
                              <input
                                type="number"
                                value={valueHour}
                                placeholder="Valor Hora"
                                onChange={(e) => setValueHour((e.target as any).value)}
                                disabled={!modoEdicao}
                              />
                            </div>
                            <div className="area-status">
                              <label>Status</label>
                              <div
                                onClick={() => setSelectedMenu("desativar")}
                                style={{
                                  cursor: 'pointer',
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  backgroundColor: `${isCheckedSwitch ? '#69F0AE' : '#FF3D00'}`
                                }}
                              ></div>
                            </div>
                          </section>

                          <h3>Endereço:</h3>
                          <section className="adress-arena">
                            <section className="lineOne">
                              <div className="area-input">
                                <label>Estado:</label>
                                <input
                                  type="text"
                                  value={state}
                                  onChange={(e) => setState(e.target.value)}
                                  disabled={!modoEdicao}
                                />
                              </div>
                              <div className="area-input">
                                <label>Cidade:</label>
                                <input
                                  type="text"
                                  value={city}
                                  onChange={(e) => setCity(e.target.value)}
                                  disabled={!modoEdicao}
                                />
                              </div>
                              <div className="area-input">
                                <label>Rua:</label>
                                <input
                                  type="text"
                                  value={street}
                                  onChange={(e) => setStreet(e.target.value)}
                                  disabled={!modoEdicao}
                                />
                              </div>
                            </section>

                            <section className="line-two-adress">
                              <div className="area-input">
                                <label>Bairro:</label>
                                <input
                                  type="text"
                                  value={neighborhood}
                                  onChange={(e) => setNeighborhood(e.target.value)}
                                  disabled={!modoEdicao}
                                />
                              </div>
                              <div className="area-input">
                                <label>Número:</label>
                                <input
                                  type="text"
                                  value={number}
                                  onChange={(e) => setNumber((e.target as any).value)}
                                  disabled={!modoEdicao}
                                />
                              </div>

                              <div className="area-input">
                                <label>Referência:</label>
                                <input
                                  type="text"
                                  value={reference}
                                  onChange={(e) => setReference(e.target.value)}
                                  disabled={!modoEdicao}
                                />
                              </div>
                            </section>
                          </section>
                          <button onClick={alternarModoEdicao}
                            style={{
                              backgroundColor: modoEdicao ? 'var(--primary-color)' : 'var(--secundary-color)',
                              color: modoEdicao ? '#fff' : '#515a5a'
                            }}
                          >

                            {modoEdicao ? <FiCheck size={20} /> : <FiEdit size={20} />}
                            {modoEdicao ? 'Confirmar' : 'Editar'}
                          </button>
                        </section>
                      )
                    }
                    {
                      selectedMenu === "expediente" && (
                        /* expediente */
                        <section className="expediente">

                          {/* Exibindo botões para os dias da semana */}
                          <div className="weekdays">
                            <h5>Selecione os dias desejados</h5>
                            <div className="btns">
                              {daysOfWeek.map((day, index) => {
                                const dayNumber = index + 1; // Mapeando de 1 a 7 (seg a dom)
                                const isSelected = weekDays.includes(dayNumber);
                                return (
                                  <button
                                    key={dayNumber}
                                    className={weekDays.includes(dayNumber) ? 'selected' : ''}
                                    onClick={() => toggleDay(dayNumber)}
                                    style={{
                                      backgroundColor: isSelected ? '#f7cebe' : '#fff', // Cor de fundo condicional
                                      color: isSelected ? '#FF8A5B' : '#FF8A5B', // Cor do texto condicional
                                      padding: '10px',
                                      border: '1px solid #FF8A5B',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="status-open-close">
                            <h5>Agora defina o status da arena</h5>

                            <div className="area-select">
                              <div
                                className="open"
                                onClick={handleOpenClick}
                                style={{
                                  backgroundColor: valueOpen ? '#f7cebe' : '',
                                  color: 'ff8a5b',
                                  padding: '10px',
                                  cursor: 'pointer',
                                  border: '1px solid #ff8a5b',
                                }}
                              >
                                Aberto
                              </div>
                              <div
                                className="close"
                                onClick={handleCloseClick}
                                style={{
                                  backgroundColor: !valueOpen ? '#f7cebe' : '',
                                  color: '#ff8a5b',
                                  padding: '10px',
                                  cursor: 'pointer',
                                  border: '1px solid #ff8a5b',

                                }}
                              >
                                Fechado
                              </div>
                            </div>

                          </div>

                          {/* Exibindo o temporizador para início e fim */}
                          <div className="time-picker">
                            <h5>Quais os horários?</h5>

                            <div className="area-timers">
                              <label>
                                Horário Inicial:
                                <input
                                  type="time"
                                  value={startTime}
                                  onChange={handleStartTimeChange}
                                  disabled={!valueOpen ? true : false}
                                  style={{
                                    cursor: !valueOpen ? 'not-allowed' : ''
                                  }}
                                />
                              </label>

                              <label>
                                Horário Final:
                                <input
                                  type="time"
                                  value={endTime}
                                  onChange={handleEndTimeChange}
                                  disabled={!valueOpen ? true : false}
                                  style={{
                                    cursor: !valueOpen ? 'not-allowed' : ''
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="weeks-day-result">
                            {
                              getHours.map((item) => (
                                <>
                                  <h5 key={item.id}>
                                    <strong>
                                      {
                                        Array.isArray(item.weekDays.$values)
                                          ? item.weekDays.$values.includes(1) ? "Segunda" :
                                            item.weekDays.$values.includes(2) ? "Terça" :
                                              item.weekDays.$values.includes(3) ? "Quarta" :
                                                item.weekDays.$values.includes(4) ? "Quinta" :
                                                  item.weekDays.$values.includes(5) ? "Sexta" :
                                                    item.weekDays.$values.includes(6) ? "Sábado" :
                                                      item.weekDays.$values.includes(7) ? "Domingo" : ""
                                          : ""
                                      }
                                    </strong> -
                                    {item.open ? "Aberto" : "Fechado"} - {item.startTime.split(":").slice(0, 2).join(":")} às {item.endTime.split(":").slice(0, 2).join(":")}. <FiTrash style={{ marginLeft: item.open ? 20 : '' }} onClick={() => deleteHour(item.id)} /> </h5>
                                </>
                              ))
                            }
                          </div>

                          <button
                            className="btn-inserir"
                            onClick={handleAddHour}

                          >Inserir</button>
                        </section>
                      )
                    }
                    {
                      selectedMenu === "promocao" && (
                        <section className="promocao">
                          <section className="area-select">
                            <select value={selectedPromotion} onChange={handleChangePromotions}>
                              <option value="">Selecione</option>
                              <option value="dayuse">Day Use</option>
                              <option value="2h">2 horas pagando menos</option>
                              <option value="3h">3 horas pagando menos</option>
                              <option value="4h">4 horas pagando menos</option>
                              <option value="5h">5 horas pagando menos</option>
                            </select>

                            {
                              selectedPromotion !== "dayuse" && (
                                <div className="area-radio">
                                  <div className="all-days">
                                    <input
                                      type="radio"
                                      name="schedule"
                                      id="todo-dia"
                                      value="todo-dia"
                                      onChange={handleRadioChange}
                                      checked={selectedValueRadio === "todo-dia"}
                                    />
                                    <label htmlFor="todo-dia">Todo dia</label>
                                  </div>
                                  <div className="period">
                                    <input
                                      type="radio"
                                      name="schedule"
                                      id="por-periodo"
                                      value="por-periodo"
                                      onChange={handleRadioChange}
                                      checked={selectedValueRadio === "por-periodo"}
                                    />
                                    <label htmlFor="por-periodo">Por período</label>
                                  </div>
                                </div>

                              )
                            }

                            {
                              selectedPromotion === "dayuse" && (
                                <div className="btns">
                                  <h3>Selecione o dia do Day Use</h3>
                                  {daysOfWeek.map((day, index) => {
                                    const dayNumber = index + 1; // Mapeando de 1 a 7 (seg a dom)
                                    const isSelected = weekDays.includes(dayNumber);
                                    return (
                                      <button
                                        key={dayNumber}
                                        className={weekDays.includes(dayNumber) ? 'selected' : ''}
                                        onClick={() => toggleDay(dayNumber)}
                                        style={{
                                          backgroundColor: isSelected ? '#f7cebe' : '#fff', // Cor de fundo condicional
                                          color: isSelected ? '#FF8A5B' : '#FF8A5B', // Cor do texto condicional
                                          padding: '10px',
                                          border: '1px solid #FF8A5B',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        {day}
                                      </button>
                                    );
                                  })}
                                </div>
                              )
                            }
                          </section>
                          <section className="main-promotion">

                            {
                              selectedPromotion !== "dayuse" && selectedValueRadio !== "todo-dia" && (
                                <div className="inputs-date">
                                  <div className="start">
                                    <label>Data inicial:</label>
                                    <input type="date" onChange={(e) => setStartDatePromotion(e.target.value)} />
                                  </div>
                                  <div className="start">
                                    <label>Data final:</label>
                                    <input type="date" onChange={(e) => setEndDatePromotion(e.target.value)} />
                                  </div>
                                </div>
                              )
                            }

                            <div className="value">
                              <label>{selectedPromotion === "dayuse" ? "Valor por pessoa:" : "Valor:"}</label>
                              <input value={valuePromotion} type="number" onChange={(e) => setValuePromotion(Number(e.target.value))} />
                            </div>
                            {
                              // selectedPromotion === "dayuse" && (
                              //   <div className="qtd">
                              //     <label>{selectedPromotion === "dayuse" ? "Qtd pessoas:" : "Qtd:"}</label>
                              //     <input value={QtdPeoplePromotion} type="number" onChange={(e) => setQtdPeoplePromotion(Number(e.target.value))} />
                              //   </div>
                              // )
                            }

                          </section>

                          <section className="getAllPromotions">
                            {
                              loadPromotions.map((item) => (
                                <h5 key={item.id}>
                                  <strong>
                                    {
                                      item.promotionType === "dayuse" ? "Day Use" :
                                        item.promotionType === "2h" ? "2h por menos" :
                                          item.promotionType === "3h" ? "3h por menos" :
                                            item.promotionType === "4h" ? "4h por menos" :
                                              item.promotionType === "5h" ? "5h por menos" : ""
                                    }
                                  </strong>

                                  {
                                    item.promotionType === "dayuse"
                                      ? item.when === "todo-dia"
                                        ? "Todo dia "
                                        : item.weekDays.$values.includes(1)
                                          ? "Segunda "
                                          : item.weekDays.$values.includes(2)
                                            ? "Terça "
                                            : item.weekDays.$values.includes(3)
                                              ? "Quarta "
                                              : item.weekDays.$values.includes(4)
                                                ? "Quinta "
                                                : item.weekDays.$values.includes(5)
                                                  ? "Sexta "
                                                  : item.weekDays.$values.includes(6)
                                                    ? "Sábado "
                                                    : item.weekDays.$values.includes(7)
                                                      ? "Domingo "
                                                      : "Não especificado"
                                      : item.startDate ? format(item.startDate, "dd-MM-yy") + " até " + format(item.endDate as any, "dd-MM-yy") : "Todo dia "
                                  }

                                  - R$ {item.value.toFixed(2)} <FiTrash onClick={() => handleDeletePromotion(item.id)} /></h5>
                              ))
                            }
                          </section>

                          <button className="btn-salvar" onClick={handleRegisterPromotion}>Salvar</button>

                        </section>
                      )
                    }
                    {
                      selectedMenu === "desativar" && (
                        /* desativar */
                        <section className="desativar">
                          <div className="status-atual-area"
                            style={{ backgroundColor: isCheckedSwitch ? '#69F0AE' : '#FF3D00' }}
                          ></div>
                          <div className="area-desativar-temp">
                            <h3
                              style={{
                                textDecoration: 'underline',
                                textDecorationColor: isCheckedSwitch ? '#69F0AE' : '#FF3D00'
                              }}
                            ><strong>Status atual: </strong>{isCheckedSwitch ? 'Ativo' : 'Inativo'}</h3>
                            <Switch
                              checked={isCheckedSwitch}
                              onChange={handleChangeSwitch}
                              offColor="#888"
                              onColor="#69F0AE"
                              uncheckedIcon={false}
                              checkedIcon={false}
                            />
                          </div>

                          <div className="area-divisor">
                            <div className="left"></div>
                            <strong>Ou</strong>
                            <div className="righ"></div>
                          </div>

                          <div className={!isShowProg ? 'area-desativar-prog-none' : 'area-desativar-prog'}>
                            <button className="btn-show" onClick={() => setIsShowProg(!isShowProg)}>

                              {!isShowProg ? 'Desativar de forma programada' : 'Cancelar programação de desativação'}
                            </button>

                            {!isShowProg &&
                              programs.length === 0 ?
                              <h4>Sem agendamento de desativação.</h4>
                              :
                              programs.map((item) => (
                                <h4 key={item.id}>Sua arena estará desativada de
                                  <strong>{format(item.startDate, "dd/MM/yyyy")}</strong>
                                  até
                                  <strong>{format(item.endDate, "dd/MM/yyyy")}</strong>
                                  <FiTrash title="Excluir"
                                    onClick={() => handleDeleteProgram(item.id)}
                                  />
                                </h4>
                              ))
                            }

                            {
                              isShowProg && (
                                <>
                                  <div className="area-prog">

                                    <div className="inputs-prog">
                                      <input
                                        type="date"
                                        value={startDate ? startDate.toLocaleDateString('sv-SE') : ''}
                                        onChange={(e) => {
                                          const selectedDate = e.target.value ? new Date(e.target.value + 'T00:00:00') : null;
                                          setStartDate(selectedDate);
                                        }}
                                      />
                                      até
                                      <input
                                        type="date"
                                        value={endDate ? endDate.toLocaleDateString('sv-SE') : ''}
                                        onChange={(e) => {
                                          const selectedDate = e.target.value ? new Date(e.target.value + 'T00:00:00') : null;
                                          setEndDate(selectedDate);
                                        }}
                                      />
                                    </div>

                                    <div className="footer-prog">
                                      <textarea
                                        placeholder="Motivo (opcional)"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                      />
                                      <button
                                        className="confirm-prog"
                                        onClick={() => handleDesativeProgram()}

                                      >
                                        <FiCheck size={20} />
                                        Desativar
                                      </button>
                                    </div>

                                  </div>
                                </>
                              )
                            }


                          </div>
                        </section>
                      )
                    }
                  </section>
                </main>

              </Modal>
            </>
          )
      }
    </>
  )
}