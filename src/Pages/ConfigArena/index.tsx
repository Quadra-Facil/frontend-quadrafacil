import "./style-config.css"
import { FiActivity, FiArrowDownRight, FiCheck, FiChevronRight, FiEdit, FiLogOut, FiTrash, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { AuthContext } from "../../services/contexts/AuthContext";
import Toast from "../../components/Toast";
import Loading from "../../components/Loading";
import { api } from "../../services/axiosApi/apiClient";
import { CiUser, CiPower, CiStar, CiClock2 } from "react-icons/ci";
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

  const [IdDesativeProgram, setIdDesativeProgram] = useState<number>()
  const [getstartDate, setGetsetStartDate] = useState<Date | null>(null)
  const [getEndDate, setGetEndDate] = useState<Date | null>(null)

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

  // style modal opening Hours
  const customStylesModalOpeningHours = {
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
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '40vw',
      height: '50vh',
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
  function openModalOpeningHours() {
    setModalIsOpenOpeningHours(true);   // Abre o modal
  }

  function closeModalOpeningHours() {
    setModalIsOpenOpeningHours(false);
    openModalPrincipal();
  }

  useEffect(() => {
    openModalPrincipal();
  }, [])

  useEffect(() => {
    async function getArena() {
      setIsLoading(true)
      await api.post<GetAllArenasResponse>("/api/Arena/getArena", {
        arenaId: user?.arena
      }).then((response) => {
        setIsLoading(false)
        setGetAllArenas(response.data);
        setIsLoading(false);
        return;
      }).catch((error: any) => {
        setIsLoading(false);
        setSendTitle('error');
        setSendMessage('Erro ao buscar arena.');
      })
    }
    getArena();
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
    } else if (click === "desativar") {
      setSelectedMenu("desativar")
      return;
    }
  }

  useEffect(() => {
    handleClickMenu("perfil")
  }, [])

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
                            selectedMenu === "desativar" ? "Desative temporariamente sua arena" : ""

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
                          <h1>section expediente</h1>
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
                                      <button className="confirm-prog" onClick={() => handleDesativeProgram()}>
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

              {/* Modal opening Hours */}
              <Modal
                isOpen={modalIsOpenOpeningHours}
                onRequestClose={closeModalOpeningHours}
                style={customStylesModalOpeningHours}
                shouldCloseOnOverlayClick={false}
              >
                <header className="header-modal">
                  <div className="header-arena-licence">
                    <h5>Horário de funcionamento</h5>
                  </div>
                  <div className="area-close" onClick={closeModalOpeningHours}>
                    <FiX size={24} />
                  </div>
                </header>
                <main className="main-modal-opening-hours">
                  <h1>Horários</h1>
                  <div className="timers">
                    <h5>Início:</h5>
                    <input type="time" />
                    <h5>às</h5>
                    <h5>Final:</h5>
                    <input type="time" />
                  </div>
                  <div className="days-week">
                    seg,ter,qua
                  </div>
                </main>
                <div className="area-btn">
                  <button>Editar</button>
                  <button>Confirmar</button>
                </div>
              </Modal>
            </>
          )
      }
    </>
  )
}