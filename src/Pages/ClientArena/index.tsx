import "./client.css";
import Select from "react-select";
import { useEffect, useState } from "react";
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
  const [selectedArena, setSelectedArena] = useState<Arena | null>(null); // Estado para armazenar a arena selecionada
  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false); // Novo estado para o dialog de confirmação
  const [isCheckd, setIsChecked] = useState("")

  // Get all arenas
  useEffect(() => {
    api
      .get<GetAllArenasResponse>("/api/Arena")
      .then((response) => {
        const arenaArray = response.data.arenas?.$values;
        if (Array.isArray(arenaArray)) {
          setGetAllArenas(response.data);
        } else {
          console.error("Os dados retornados não são um array:", response.data);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar dados:", err);
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

  // Style modal (details e plans)
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
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '40vw',
      height: '56vh',
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
      top: '18%',
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
      width: '30vw',
      height: '30vh',
      maxWidth: '90%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
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
  function openModalPlan() {
    setIsOpenPlans(true);
  }

  // Função para fechar o modal de planos
  function closeModalPlans() {
    setIsOpenPlans(false);
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
        }).then((response) => {
          setIsLoading(false);
          setSendTitle('success');
          setSendMessage('Arena temporariamente DESATIVADA');
          closeConfirmDialog();
          closeModalDetails();
        }).catch((err) => {
          setIsLoading(false);
          setSendTitle('error');
          setSendMessage('Erro ao desativar arena');
        })
      } else {
        await api.put("/api/Arena/status-edit", {
          realArenaId: selectedArena?.id,
          newStatus: "ativo"
        }).then((response) => {
          setIsLoading(false);
          setSendTitle('success');
          setSendMessage('Arena ATIVADA');
          closeConfirmDialog();
          closeModalDetails();
        }).catch((err) => {
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
                <header className="header-modal">
                  <h2>{selectedArena?.name}</h2>
                  <div className="area-close" onClick={closeModalDetails}>
                    <FiX size={24} />
                  </div>
                </header>
                <main className="main-modal">
                  <section className="adress">
                    <div className="titulo-adress">
                      <h3>Endereço:</h3>
                    </div>
                    <div className="main-adress">
                      <div className="body-adress">
                        <section className="first">
                          <h5><strong>Uf:</strong> {selectedArena?.adressArenas.$values[0]?.state}</h5>
                          <h5><strong>Cidade:</strong> {selectedArena?.adressArenas.$values[0]?.city}</h5>
                          <h5><strong>Bairro:</strong> {selectedArena?.adressArenas.$values[0]?.neighborhood}</h5>
                        </section>
                        <section className="main">
                          <h5><strong>Rua:</strong> {selectedArena?.adressArenas.$values[0]?.street}</h5>
                          <h5><strong>Numero:</strong> {selectedArena?.adressArenas.$values[0]?.number}</h5>
                        </section>
                      </div>
                      <section className="last">
                        <h5><strong>Referência:</strong> {selectedArena?.adressArenas.$values[0]?.reference}</h5>
                      </section>
                    </div>
                  </section>
                  <section className="plans">
                    <div className="titulo-plans">
                      <h3>Planos:</h3>
                    </div>
                    <div className="body-plans">
                      <h5><strong>Plano atual:</strong> {selectedArena?.plans.$values[0]?.planSelect}</h5>
                      <h5>Status Arena:
                        <input style={{ cursor: 'pointer' }} type="checkbox" checked={selectedArena?.status == "ativo" ? true : false}
                          onClick={() => openConfirmDialog()}
                          onChange={(event) => {
                            const isChecked = event.target.checked;
                            setIsChecked(isChecked ? 'ativo' : 'inativo');
                          }}
                        />
                      </h5>
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
              {!modalIsOpenDetails && !modalIsOpenPlans && (
                <section className="header">
                  <div className="area-search">
                    <input
                      type="text"
                      placeholder="Pesquise por arena, cidade, estado ou status"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="search-icon">
                      <FiSearch size={32} color="#8a8888" />
                    </button>
                  </div>
                  <h3>Área de filtragem de clientes</h3>
                  tipo de plano mensal, anual, semestral
                </section>
              )}

              {/* Exibindo os cards filtrados */}
              <section className="area-cards">
                {(filteredData?.length || 0) > 0 ? (
                  filteredData?.map((item) => (
                    <div key={item.id} className="card">
                      <header>
                        <h3>{item.name}</h3>
                        <div className="icon-area">
                          <FiPhone title={item.phone} color="var(--primary-color)" />
                        </div>
                        <div className="icon-area">
                          <FiMapPin
                            color="var(--primary-color)"
                            title={`${item.adressArenas?.$values[0]?.state}, ${item.adressArenas?.$values[0]?.city}`}
                          />
                        </div>
                      </header>
                      <main>
                        <div className="area-status">
                          <div
                            className="status"
                            style={{
                              backgroundColor: `${item.status === "ativo"
                                ? "#50cd48"
                                : item.status === "teste"
                                  ? "#ffee00"
                                  : "#f80000"
                                }`,
                            }}
                            title={item.plans?.$values[0]?.planSelect}
                          ></div>
                        </div>
                        <div className="area-plano">
                          <FiClipboard />
                          <p>
                            <strong>Valor da Hora: </strong> R${item.valueHour}
                          </p>
                        </div>
                        <div className="area-mudar-plano" onClick={openModalPlan}>
                          <FiRefreshCw />
                          <p>Mudar plano</p>
                        </div>
                        <div className="area-vencimento">
                          <FiCalendar />
                          <p>
                            <strong>Até:</strong>{" "}
                            {item.plans?.$values[0]?.planExpiry
                              ? new Date(item.plans?.$values[0]?.planExpiry).toLocaleDateString(
                                "pt-br"
                              )
                              : "sem plano"}
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
            </>
          )
      }
    </>
  );
}
