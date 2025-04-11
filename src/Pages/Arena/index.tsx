import "./style-arena.css";
import Select from "react-select";
import { Link } from "react-router-dom";
import { FormEvent, useState, useEffect, useContext, useCallback } from "react";
import { api } from "../../services/axiosApi/apiClient";
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask";
import SelectSearchStatus from "../../components/SelectSearchStatus";
import Modal from "react-modal";
import { FiX } from "react-icons/fi";
import { AuthContext } from "../../services/contexts/AuthContext";

type User = {
  $id: string;
  id: number;
  userName: string;
  email: string;
  role: string;
  phone: string;
  arenaId: number;
};

type GetAllUserResponse = {
  $id: string;
  users: {
    $id: string;
    $values: User[];
  };
};

type AddressArena = {
  state: string;
  city: string;
};

type Arena = {
  id: number;
  name: string;
  phone: string;
  adressArenas: {
    $values: AddressArena[];
  };
};

interface GetAllArenasResponse {
  arenas: {
    $values: Arena[];
  };
}

export default function Arena() {
  const [arenaName, setArenaName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [valueHour, setValueHour] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>("");
  const [sendMessage, setSendMessage] = useState<string>("");
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalIsOpenPlan, setIsOpenPlan] = useState(false);
  const [getAllUsers, setGetAllUsers] = useState<{ value: string; label: string }[]>([]);
  const [getAllArenas, setGetAllArenas] = useState<{ value: string; label: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedArena, setSelectedArena] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <div>Carregando...</div>;
  }

  const { user } = authContext;

  // Modal styles
  const customStylesModal = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#f0f0f0",
      border: "1px solid #ccc",
      borderRadius: "12px",
      padding: "0px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      width: "40vw",
      height: "70vh",
      maxWidth: "90%",
      color: "#6c6c6c",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  const customStylesModalPlan = {
    content: {
      ...customStylesModal.content,
      maxWidth: "80%",
    },
    overlay: customStylesModal.overlay,
  };

  // Modal handlers
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const openModalPlan = () => setIsOpenPlan(true);
  const closeModalPlan = () => setIsOpenPlan(false);

  // Toast handler
  useEffect(() => {
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle("");
        setSendMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [sendTitle, sendMessage]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<GetAllUserResponse>("/api/user/getUsers");
        const usersArray = response.data.users.$values;

        if (Array.isArray(usersArray)) {
          const formattedUsers = usersArray.map((item) => ({
            value: String(item.id),
            label: `${item.userName} - ${item.email}`,
          }));
          setGetAllUsers(formattedUsers);
        }
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      }
    };

    fetchUsers();
  }, []);

  // Fetch arenas with cleanup
  useEffect(() => {
    const controller = new AbortController();

    const fetchArenas = async () => {
      try {
        const response = await api.get<GetAllArenasResponse>("/api/Arena", {
          signal: controller.signal,
        });
        const arenaArray = response.data?.arenas?.$values || [];

        if (Array.isArray(arenaArray)) {
          const formattedArena = arenaArray.map((item) => {
            const adressArenas = item.adressArenas?.$values || [];
            const stateCity = adressArenas
              .map((address) => `${address.state} - ${address.city}`)
              .join(", ") || "Sem endereço";

            return {
              value: String(item.id),
              label: `${item.name} - ${stateCity}`,
            };
          });

          setGetAllArenas(formattedArena);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Erro ao buscar arenas:", err);
        }
      }
    };

    fetchArenas();

    return () => controller.abort();
  }, []);

  // Add arena
  const handleAddArena = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/api/Arena", {
        name: arenaName,
        phone,
        status,
        valuehour: valueHour,
      });
      setSendTitle("success");
      setSendMessage(`Arena ${response.data.name} inserida.`);
    } catch (error: any) {
      setSendTitle("error");
      setSendMessage(error.response?.data?.erro || "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  // Link user to arena
  async function handleVinculoArenaUser(e: FormEvent) {
    e.preventDefault();

    setIsLoading(true);

    await api
      .put(`/api/Arena/association-arena-user`, {
        realArenaId: Number(selectedArena),
      }, {
        params: { // query params
          id_user: Number(selectedUser),
        },
      })
      .then(async (response) => {
        setIsLoading(false);
        setSendTitle('success');
        setSendMessage(`Vínculo realizado.`);

        await api.put("/api/user/edit/rule", {
          // params: { // query params
          userId: Number(selectedUser)
          // },
        }).then((resp) => {
          setSendTitle('success');
          setSendMessage(`Acesso admin inserido.`);
          closeModal();
        })
          .catch((erro: any) => {
            console.log("Erro ao atribuir acesso: " + erro)
          })
      })
      .catch((error) => {
        setIsLoading(false);
        setSendTitle('error');
        setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
      });
  }

  // Add plan
  const handleAddPlan = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/api/Plan", {
        PlanSelect: selectedPlan,
        ArenaId: Number(selectedArena),
      });
      setSendTitle("success");
      setSendMessage("Plano inserido com sucesso!");
      closeModalPlan();
    } catch (error: any) {
      console.error("Erro ao cadastrar plano:", error);
      setSendTitle("error");
      setSendMessage(error.response?.data?.erro || "Erro ao cadastrar plano");
    } finally {
      setIsLoading(false);
    }
  };

  // Status handler
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  // Plan options
  const getPlans = [
    { value: "teste", label: "Teste" },
    { value: "mensal", label: "Mensal" },
    { value: "semestral", label: "Semestral" },
    { value: "anual", label: "Anual" },
  ];

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />

      {isLoading ? (
        <Loading />
      ) : (
        <>
          {/* Modals */}
          <div className="area-modal">
            {/* User-Arena Link Modal */}
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              style={customStylesModal}
              shouldCloseOnOverlayClick={false}
              contentLabel="Vincular Usuário-Arena"
            >
              <header className="header-modal-acesso">
                <h1 style={{ fontSize: 25 }}>Vínculo usuário-arena</h1>
                <div className="area-close" onClick={closeModal}>
                  <FiX size={24} />
                </div>
              </header>

              <div className="area-select-user">
                <h3>Selecione o usuário:</h3>
                <Select
                  options={getAllUsers}
                  onChange={(selectedOption) =>
                    setSelectedUser(selectedOption?.value || "")
                  }
                  placeholder="Usuário"
                  styles={{
                    control: (baseStyles, state) => ({
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
                        height: "5vh",
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

              <div className="area-select-arena">
                <h3>Selecione a arena:</h3>
                <Select
                  options={getAllArenas}
                  onChange={(selectedOption) =>
                    setSelectedArena(selectedOption?.value || "")
                  }
                  placeholder="Arena"
                  styles={{
                    control: (baseStyles, state) => ({
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
                        height: "5vh",
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

              <div className="area-btn-vincular">
                <button className="btn-vincular" onClick={handleVinculoArenaUser}>
                  Vincular
                </button>
              </div>
            </Modal>

            {/* Plan Modal */}
            <Modal
              isOpen={modalIsOpenPlan}
              onRequestClose={closeModalPlan}
              style={customStylesModalPlan}
              shouldCloseOnOverlayClick={false}
              contentLabel="Selecionar Plano"
            >
              <header className="header-modal-plano">
                <h1>Selecione um plano</h1>
                <div className="area-close" onClick={closeModalPlan}>
                  <FiX size={24} />
                </div>
              </header>

              <div className="area-select-arena">
                <h3>Selecione a arena:</h3>
                <Select
                  options={getAllArenas}
                  onChange={(selectedOption) => setSelectedArena(selectedOption?.value || "")}
                  placeholder="Arena"
                  styles={{
                    control: (baseStyles, state) => ({
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
                        height: "5vh",
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

              <div className="area-select-user">
                <h3>Selecione um plano:</h3>
                <Select
                  options={getPlans}
                  onChange={(selectedOption) =>
                    setSelectedPlan(selectedOption?.value || "")
                  }
                  placeholder="Plano"
                  styles={{
                    control: (baseStyles, state) => ({
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
                        height: "5vh",
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

              <div className="area-btn-vincular">
                <button className="btn-vincular" onClick={handleAddPlan}>
                  Inserir Plano
                </button>
              </div>
            </Modal>
          </div>

          {/* Main Content */}
          <section className="arena-container">
            <article className="information">
              <h1>Gerenciamento - Arena</h1>
              <h3>ou retorne ao menu principal.</h3>
              <Link to="/principal" className="menu-btn">
                Menu Principal
              </Link>
            </article>

            <article className="area-arena-principal">
              <nav className="nav-arena">
                <button
                  className="endereco"
                  type="button"
                  onClick={() => navigate("/adress")}
                >
                  Endereço
                </button>
                <button
                  className="endereco"
                  type="button"
                  onClick={openModalPlan}
                >
                  Plano
                </button>
                <button className="acesso" type="button" onClick={openModal}>
                  Acesso
                </button>
              </nav>

              <form onSubmit={handleAddArena}>
                <input
                  className="input-form"
                  type="text"
                  placeholder="Arena"
                  required
                  value={arenaName}
                  onChange={(e) => setArenaName(e.target.value)}
                />
                <IMaskInput
                  className="input-form"
                  mask={"(00)00000-0000"}
                  type="text"
                  placeholder="Telefone"
                  required
                  value={phone}
                  onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
                />

                <SelectSearchStatus
                  currentStatus={status}
                  onStatusChange={handleStatusChange}
                />

                <input
                  className="input-form"
                  type="number"
                  placeholder="Valor Hora"
                  required
                  value={valueHour}
                  onChange={(e) => setValueHour(e.target.value)}
                />

                <div className="area-btns">
                  <button className="cadastrar-arena" type="submit">
                    Cadastrar
                  </button>
                </div>
              </form>
            </article>
          </section>
        </>
      )}
    </>
  );
}