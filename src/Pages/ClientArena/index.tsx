import "./client.css";
import Select from "react-select";
import { FormEvent, useEffect, useState } from "react";
import { FiSearch, FiPhone, FiArrowRight, FiMapPin, FiCalendar, FiRefreshCw, FiClipboard, FiX } from "react-icons/fi";
import { api } from "../../services/axiosApi/apiClient";
import Modal from "react-modal";
import Toast from "../../components/Toast";
import Loading from "../../components/Loading";

// Tipagem de AddressArena e Arena conforme a estrutura fornecida
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

type Plan = {
  $id: string;
  id: number;
  planSelect: string; // Tipo de plano (ex: mensal, teste)
  planExpiry: string; // Data de expiração do plano
  arenaId: number;
  status: string; // Status do plano (ativo, inativo, etc)
  arena: {
    $ref: string;
  };
};

type Arena = {
  $id: string;
  id: number;
  name: string;
  phone: string;
  status: string;
  valueHour: number;
  adressArenas: {
    $id: string;
    $values: AddressArena[]; // Lista de endereços da arena
  };
  plans: {
    $id: string;
    $values: Plan[]; // Lista de planos da arena
  };
};

type GetAllArenasResponse = {
  $id: string;
  arenas: {
    $id: string;
    $values: Arena[]; // Lista de arenas
  };
};

export default function ClientArena() {
  const [searchTerm, setSearchTerm] = useState("");
  const [getAllArenas, setGetAllArenas] = useState<GetAllArenasResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [modalIsOpenDetails, setIsOpenDetails] = useState(false);
  const [modalIsOpenPlans, setIsOpenPlans] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Arena | null>(null);
  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false);
  const [isCheckd, setIsChecked] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<any>();

  // Get all arenas
  useEffect(() => {
    setIsLoading(true);
    api
      .get<GetAllArenasResponse>("/api/Arena")
      .then((response) => {
        const arenaArray = response.data.arenas?.$values;
        if (Array.isArray(arenaArray)) {
          setIsLoading(false)
          setGetAllArenas(response.data);
        } else {
          setIsLoading(false)
          console.error("Os dados retornados não são um array:", response.data);
        }
      })
      .catch((err) => {
        setIsLoading(false)
        console.error("Erro ao buscar dados:", err);
        isCheckd;
      });
  }, [selectedArena]);

  // Função para filtrar as arenas com base no searchTerm
  const filteredData = getAllArenas?.arenas.$values.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    const nameMatches = item.name.toLowerCase().includes(searchTermLower);
    const stateMatches = item.adressArenas?.$values.some((address) =>
      address.state.toLowerCase().includes(searchTermLower)
    );
    const cityMatches = item.adressArenas?.$values.some((address) =>
      address.city.toLowerCase().includes(searchTermLower)
    );
    const statusMatches = item.status.toLowerCase().includes(searchTermLower);
    const planMatches = item.plans?.$values.some((plans) =>
      plans.planSelect.toLowerCase().includes(searchTermLower)
    );
    return nameMatches || stateMatches || cityMatches || statusMatches || planMatches;
  });

  // Style modal (details)
  const customStylesModal = {
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
      width: '50vw',
      height: '65vh',
      maxWidth: '90%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

  // style modal dialog
  const customStylesModalDialog = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff9f7',
      borderRadius: '10px',
      padding: '0',
      width: '100%',
      maxWidth: '600px',
      border: 'none',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000
    }
  };

  // style modal plans
  const customStylesModalPlansClient = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff9f7',
      borderRadius: '10px',
      padding: '0',
      width: '100%',
      maxWidth: '600px',
      border: 'none',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000
    }
  };

  // Função para abrir o modal de detalhes com os dados da arena selecionada
  function openModalDetails(arena: Arena) {
    setSelectedArena(arena);  // Atualiza o estado com os dados da arena selecionada
    setIsOpenDetails(true);   // Abre o modal
  }

  // Função para fechar o modal de detalhes
  function closeModalDetails() {
    setIsOpenDetails(false);
    setSelectedArena(null); // Limpa o estado quando o modal for fechado
  }

  // Função para abrir o modal de planos
  function openModalPlan(arena: Arena) {
    setSelectedArena(arena)
    setIsOpenPlans(true);
  }

  // Função para fechar o modal de planos
  function closeModalPlans() {
    setIsOpenPlans(false);
    setSelectedArena(null)
  }

  // Função para abrir o modal de confirmação
  function openConfirmDialog() {
    setIsOpenConfirmDialog(true);
  }

  // Função para fechar o modal de confirmação
  function closeConfirmDialog() {
    setIsOpenConfirmDialog(false);
  }

  // Função para lidar com a resposta do usuário (Sim ou Não)
  async function handleConfirmAction(confirmed: boolean) {
    if (confirmed) {
      setIsLoading(true);
      if (selectedArena?.status == "ativo") {
        await api.put("/api/Arena/status-edit", {
          realArenaId: selectedArena?.id,
          newStatus: "inativo"
        }).then(() => {
          setIsLoading(false);
          setSendTitle('success');
          setSendMessage('Arena temporariamente DESATIVADA');
          closeConfirmDialog();
          closeModalDetails();
        }).catch(() => {
          setIsLoading(false);
          setSendTitle('error');
          setSendMessage('Erro ao desativar arena');
        })
      } else {
        await api.put("/api/Arena/status-edit", {
          realArenaId: selectedArena?.id,
          newStatus: "ativo"
        }).then(() => {
          setIsLoading(false);
          setSendTitle('success');
          setSendMessage('Arena ATIVADA');
          closeConfirmDialog();
          closeModalDetails();
        }).catch(() => {
          setIsLoading(false);
          setSendTitle('error');
          setSendMessage('Erro ao ATIVAR arena');
        })
      }

    } else {
      closeConfirmDialog();
    }
    closeConfirmDialog(); // Fechar o modal de confirmação
  }

  const getPlans = [
    { value: 'teste', label: 'Teste' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' },
  ]

  async function handleEditPlan(e: FormEvent) {
    e.preventDefault();

    setIsLoading(true)

    await api.put("/edit", {
      PlanSelect: selectedPlan,// O tipo de plano escolhido: "mensal", "semestral", "anual"
      ArenaId: Number(selectedArena?.id)
    }).then(() => {
      setIsLoading(false);
      setSendTitle('success');
      setSendMessage('Plano alterado');
      closeModalPlans();
    }).catch(() => {
      setIsLoading(false);
      setSendTitle('error');
      setSendMessage('Erro ao ALTERAR plano');
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
              {/* Modal Detalhes */}
              <Modal
                isOpen={modalIsOpenDetails}
                onRequestClose={closeModalDetails}
                style={customStylesModal}
                shouldCloseOnOverlayClick={false}
              >
                <header className="header-details-client">
                  <h2>{selectedArena?.name || "sem arena"}</h2>
                  <div className="area-close" onClick={closeModalDetails}>
                    <FiX size={24} />
                  </div>
                </header>
                <main className="main-modal-client">
                  <section className="adress">
                    <div className="titulo-adress">
                      <h3>Endereço:</h3>
                    </div>
                    <div className="main-adress">
                      <div className="body-adress">
                        <section className="first">
                          <h5><strong>Uf:</strong> {selectedArena?.adressArenas.$values[0]?.state || "sem estado"}</h5>
                          <h5><strong>Cidade:</strong> {selectedArena?.adressArenas.$values[0]?.city || "sem cidade"}</h5>
                          <h5><strong>Bairro:</strong> {selectedArena?.adressArenas.$values[0]?.neighborhood || "sem bairro"}</h5>
                        </section>
                        <section className="main">
                          <h5><strong>Rua:</strong> {selectedArena?.adressArenas.$values[0]?.street || "sem endereço"}</h5>
                          <h5><strong>Numero:</strong> {selectedArena?.adressArenas.$values[0]?.number || "s/n"}</h5>
                        </section>
                      </div>
                      <section className="last">
                        <h5><strong>Referência:</strong> {selectedArena?.adressArenas.$values[0]?.reference || "sem referência"}</h5>
                      </section>
                    </div>
                  </section>
                  <section className="plans">
                    <h5 style={{ marginRight: 5 }}><strong>Plano atual:</strong> {selectedArena?.plans.$values[0]?.planSelect || "sem plano"}</h5>
                    <h5>Status Arena:
                      <input style={{ cursor: 'pointer' }} type="checkbox" checked={selectedArena?.status == "ativo" ? true : false}
                        onClick={() => openConfirmDialog()}
                        onChange={(event) => {
                          const isChecked = event.target.checked;
                          setIsChecked(isChecked ? 'ativo' : 'inativo');
                        }}
                      />
                    </h5>
                  </section>
                </main>
              </Modal>

              {/* Modal Plans */}
              <Modal
                isOpen={modalIsOpenPlans}
                onRequestClose={closeModalPlans}
                style={customStylesModalPlansClient}
                shouldCloseOnOverlayClick={false}
              >
                <header className="header-modal-plans-client">
                  <div className="header-arena-plans">
                    <h5><strong>Arena:</strong> {selectedArena?.name || "Sem nome"}</h5>
                    <h5><strong>Plano Atual:</strong> {selectedArena?.plans?.$values[0]?.planSelect || "Sem plano"}</h5>

                  </div>
                  <div className="area-close" onClick={closeModalPlans}>
                    <FiX size={24} />
                  </div>
                </header>
                <main className="main-modal-plans">
                  <section className="new-plan">
                    <div className="title-plans">
                      <h3>Selecione um novo plano:</h3>
                      <h3>Ou o mesmo plano para renovação.</h3>
                      <Select
                        options={getPlans}
                        onChange={(selectedOption) => {
                          if (selectedOption) {
                            setSelectedPlan(selectedOption.value); // Converte para número antes de atribuir
                          } else {
                            setSelectedPlan('null'); // Define como null se nada for selecionado
                          }
                        }}
                        placeholder="Plano"
                        styles={{
                          control: (baseStyles) => ({
                            ...baseStyles,
                            borderColor: "none",
                            border: 0,
                            height: "8vh",
                            backgroundColor: "#dfdfdf",
                            padding: "0 12px",
                            borderRadius: "10px",
                            fontSize: "14px",
                            marginTop: '-30px',
                            minWidth: "30vw",
                            '@media (max-width: 768px)': {
                              minWidth: "80vw",
                              height: "6vh",
                              fontSize: "12px"
                            },
                            '@media (max-width: 480px)': {
                              minWidth: "80vw",
                              height: "8vh",
                              padding: "0 8px"
                            }
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? "#f7cebe" : "#fff",
                            color: "#878282",
                            padding: "12px 20px",
                            cursor: "pointer",
                          }),
                          menu: (base) => ({
                            ...base,
                            maxHeight: "30vh", // Altura máxima do menu
                            overflow: "hidden", // Garante que o menu não ultrapasse a altura máxima
                          }),
                          menuList: (base) => ({
                            ...base,
                            maxHeight: "30vh", // Altura máxima da lista de opções
                            overflowY: "auto", // Habilita a rolagem vertical
                            // Estilo da barra de rolagem (opcional)
                            '&::-webkit-scrollbar': {
                              width: "8px",
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: "#f7cebe",
                              borderRadius: "4px",
                            },
                          }),
                        }}
                      />
                    </div>
                    <div className="area-btn-save">
                      <button onClick={handleEditPlan}>Salvar Alterações</button>
                    </div>
                  </section>
                </main>
              </Modal>

              {/* Modal de confirmação (Sim/Não) */}
              <Modal
                isOpen={isOpenConfirmDialog}
                onRequestClose={closeConfirmDialog}
                style={customStylesModalDialog}
                shouldCloseOnOverlayClick={false}
              >
                <header className="header-modal-dialog">
                  <h2>Você tem certeza?</h2>
                  <div className="area-close" onClick={closeConfirmDialog}>
                    <FiX size={24} />
                  </div>
                </header>
                <main className="main-modal-dialog">
                  {/* se tiver desmarcado perguntar se quer ativar a arena x se não perguntar se quer desativar */}
                  <p>{selectedArena?.status == "ativo" ? "Deseja desativar arena?" : "Deseja ativar arena?"}</p>
                  <div className="confirm-buttons-dialog">
                    <button onClick={() => handleConfirmAction(false)} className="btn-no">Não</button>
                    <button onClick={() => handleConfirmAction(true)} className="btn-yes">Sim</button>
                  </div>
                </main>
              </Modal>

              {/* Input de Pesquisa (visível apenas se nenhum modal estiver aberto) */}
              <section className="header-client">
                <div className="area-search">
                  <input
                    type="text"
                    placeholder="Arena, Cidade, Estado ou Status"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="search-icon">
                    <FiSearch size={32} color="#8a8888" />
                  </button>
                </div>
                {/* <h3>Área de filtragem de clientes</h3>
                tipo de plano mensal, anual, semestral */}
              </section>

              {/* Exibindo os cards filtrados */}
              {
                isLoading ? <Loading /> : (

                  <section className="area-cards-clients">
                    {(filteredData?.length || 0) > 0 ? (
                      filteredData?.map((item) => (
                        <div key={item.id} className="card-client">
                          <header>
                            <h3>{item.name || "Sem nome"}</h3>
                            <div className="icon-area">
                              <FiPhone title={item.phone || "Sem telefone"} color="var(--primary-color)" />
                            </div>
                            <div className="icon-area">
                              <FiMapPin
                                color="var(--primary-color)"
                                title={
                                  item.adressArenas?.$values?.[0]
                                    ? `${item.adressArenas.$values[0].state || "Sem estado"}, ${item.adressArenas.$values[0].city || "Sem cidade"}`
                                    : "Sem endereço"
                                }
                              />
                            </div>
                          </header>
                          <main>
                            <div className="area-status">
                              <div
                                className="status"
                                style={{
                                  backgroundColor:
                                    item.status === "ativo"
                                      ? "#50cd48"
                                      : item.status === "teste"
                                        ? "#ffee00"
                                        : "#f80000",
                                }}
                                title={item.plans?.$values?.[0]?.planSelect || "Sem plano"}
                              ></div>
                            </div>
                            <div className="area-plano">
                              <FiClipboard />
                              <p>
                                <strong>Valor da Hora: </strong> R${item.valueHour || "Valor não informado"}
                              </p>
                            </div>
                            <div className="area-mudar-plano" onClick={() => openModalPlan(item)}>
                              <FiRefreshCw />
                              <p>Mudar plano</p>
                            </div>
                            <div className="area-vencimento">
                              <FiCalendar />
                              <p>
                                <strong>Até:</strong>{" "}
                                {item.plans?.$values?.[0]?.planExpiry
                                  ? new Date(item.plans.$values[0].planExpiry).toLocaleDateString("pt-br")
                                  : "Sem plano"}
                              </p>
                            </div>
                          </main>
                          <footer>
                            <button className="show-plus" onClick={() => openModalDetails(item)}>
                              <h4>Ver mais</h4>
                              <div className="icon-area">
                                <FiArrowRight />
                              </div>
                            </button>
                          </footer>
                        </div>
                      ))
                    ) : (
                      <p>Nenhuma arena encontrada.</p>
                    )}
                  </section>
                )}
            </>
          )
      }
    </>
  );
}
