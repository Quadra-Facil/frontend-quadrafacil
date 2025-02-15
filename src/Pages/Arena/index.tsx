import "./style-arena.css";
import Select from "react-select";
import { Link } from "react-router-dom";
import { FormEvent, useState, useEffect, useContext } from "react";
import { api } from "../../services/axiosApi/apiClient";
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask"
import SelectSearchStatus from "../../components/SelectSearchStatus";
import Modal from "react-modal"
import { SingleValue, ActionMeta, InputActionMeta } from "react-select";
import { FiX } from "react-icons/fi";
import { AuthContext } from "../../services/contexts/AuthContext";

type GetAllUserResponse = {
  $id: string;
  users: {
    $id: string;
    $values: {
      $id: string;
      id: number;
      userName: string;
      email: string;
      role: string;
      phone: string;
      arenaId: number;
    }[];
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
    $values: Arena[];  // Tipando corretamente o $values
  };
}

export default function Arena() {
  const [arenaName, setarenaName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [valueHour, setValueHour] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalIsOpenPlan, setIsOpenPlan] = useState(false);
  const [getAllUsers, setGetAllUsers] = useState<{ value: string; label: string }[]>([]);
  const [getAllArenas, setGetAllArenas] = useState<{ value: string; label: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedArena, setSelectedArena] = useState<any>();
  const [selectedPlan, setSelectedPlan] = useState<any>();
  // const [selectedOption, setSelectedOption] = useState<SingleValue<OptionType>>(null);

  const navigate = useNavigate();

  const authContext = useContext(AuthContext);

  // Verificar se o authContext está disponível
  if (!authContext) {
    return <div>Carregando...</div>; // Pode retornar uma tela de carregamento ou um componente de fallback
  }

  const { user } = authContext;

  //style modal
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
      height: '70vh',
      maxWidth: '90%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };
  //style modal plan
  const customStylesModalPlan = {
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
      height: '70vh',
      maxWidth: '80%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };


  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function openModalPlan() {
    setIsOpenPlan(true);
  }

  function closeModalPlan() {
    setIsOpenPlan(false);
  }

  // Exibir Toast após mudança de sendTitle e sendMessage
  useEffect(() => {
    if (sendTitle && sendMessage) {
      // Exibe o Toast com os valores atuais
      const timer = setTimeout(() => {
        setSendTitle('');  // Limpa o título para esconder o Toast após 3 segundos
        setSendMessage('');  // Limpa a mensagem
      }, 3000);

      return () => clearTimeout(timer); // Limpar o timer quando o componente for desmontado ou o estado mudar
    }
  }, [sendTitle, sendMessage]);

  // Carregar usuários da API
  useEffect(() => {
    api.get<GetAllUserResponse>("/api/user/getUsers")
      .then((response) => {
        const usersArray = response.data.users.$values; // Acessar a lista de usuários no campo "users.$values"

        if (Array.isArray(usersArray)) {
          const formattedUsers = usersArray.map((item) => ({
            value: String(item.id), // Transformar ID em string para o componente Select
            label: `${item.userName} - ${item.email}`, // Exibir nome e email como rótulo
          }));
          setGetAllUsers(formattedUsers);
        } else {
          console.error("Os dados retornados não são um array:", response.data);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar dados:", err);
      });
  }, []);

  //get all arenas
  useEffect(() => {
    api
      .get<GetAllArenasResponse>("/api/Arena")
      .then((response) => {

        const arenaArray = response.data?.arenas?.$values || [];

        // Verificando se arenaArray é realmente um array
        if (Array.isArray(arenaArray)) {
          const formattedArena = arenaArray.map((item) => {
            const adressArenas = item.adressArenas?.$values || [];

            // Combina todas as cidades e estados disponíveis
            const stateCity = adressArenas
              .map((address: any) => `${address.state} - ${address.city}`)
              .join(", ") || "Sem endereço";

            return {
              value: String(item.id), // Transformar ID em string para o componente Select
              label: `${item.name} - ${stateCity}`, // Exibir nome, estado e cidade como rótulo
            };
          });

          setGetAllArenas(formattedArena);
        } else {
          console.error("Os dados retornados não são um array:", response.data);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar dados:", err);
      });
  }, [getAllArenas]);


  async function handleAddArena(e: FormEvent) {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await api.post('/api/Arena', {
        name: arenaName,
        phone,
        status,
        valuehour: valueHour
      });
      setIsLoading(false);
      setSendTitle('success');
      setSendMessage(`Arena ${response.data.name} inserida.`);
    } catch (error: any) {
      setIsLoading(false);
      setSendTitle('error');
      setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
    }
  }

  // Função de callback para atualizar o estado do status no componente pai
  const handleStatusChange = (newStatus: string): void => {
    setStatus(newStatus);
  };

  //vincular arena com user
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
        closeModal();

        await api.put("/api/user/edit/rule", {
          userId: Number(user.userId)
        }).then((resp) => {
          setSendTitle('success');
          setSendMessage(`Acesso admin inserido.`);
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

  //cadastrar plano
  async function handleAddPlan(e: FormEvent) {
    e.preventDefault();

    setIsLoading(true)

    await api.post("/api/Plan", {
      PlanSelect: selectedPlan,
      ArenaId: Number(selectedArena)
    }).then((reponse) => {
      setSendTitle('success');
      setSendMessage(`Plano inserido.`);
      setIsLoading(false)
      closeModalPlan();
    }).catch((erro: any) => {
      console.log("Erro ao cadastrar plano: " + erro)
      setIsLoading(false)
    })
  }

  const getPlans = [
    { value: 'teste', label: 'Teste' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' },
  ]

  return (
    <>

      <Toast title={sendTitle} message={sendMessage} />
      {
        isLoading ?
          <Loading />
          : (
            <>
              <div className="area-modal">

                {/* modal vincula user-arena */}
                <Modal
                  isOpen={modalIsOpen}
                  // onAfterOpen={afterOpenModal}
                  onRequestClose={closeModal}
                  style={customStylesModal}
                  shouldCloseOnOverlayClick={false}
                  contentLabel="Example Modal"
                >
                  <header className="header-modal">
                    <h1>Vinculo usuário-arena</h1>
                    <div className="area-close" onClick={closeModal}>
                      <FiX size={24} />
                    </div>
                  </header>

                  <div className="area-select-user">
                    <h3>Selecione o usuário:</h3>
                    <Select
                      options={getAllUsers}
                      onChange={(selectedOption) => {
                        if (selectedOption) {
                          setSelectedUser(selectedOption.value); // Converte para número antes de atribuir
                        } else {
                          setSelectedUser('usuario'); // Define como null se nada for selecionado
                        }
                      }}
                      placeholder="Usuário"
                      styles={{
                        control: (baseStyles) => ({
                          ...baseStyles,
                          borderColor: "none",
                          border: 0,
                          width: "30vw",
                          height: "8vh",
                          backgroundColor: "#dfdfdf",
                          padding: "0 12px",
                          borderRadius: "10px",
                          fontSize: "14px",
                        }),
                        option: (baseStyles, state) => ({
                          ...baseStyles,
                          backgroundColor: state.isFocused ? "#f7cebe" : "#fff",
                          color: "#878282",
                          padding: "12px 20px",
                          cursor: "pointer",
                          borderRadius: "4px",
                          fontSize: "14px",
                        }),
                        menu: (base) => ({
                          ...base,
                          maxHeight: '25vh', // Limita a altura do menu
                          overflowY: "hidden", // Adiciona rolagem
                        }),
                      }}
                    />
                  </div>

                  <div className="area-select-arena">
                    <h3>Selecione a arena:</h3>
                    <Select
                      options={getAllArenas}
                      onChange={(selectedOption) => {
                        if (selectedOption) {
                          setSelectedArena(selectedOption.value); // Converte para número antes de atribuir
                        } else {
                          setSelectedArena('arena'); // Define como null se nada for selecionado
                        }
                      }}
                      placeholder="Arena"
                      styles={{
                        control: (baseStyles) => ({
                          ...baseStyles,
                          borderColor: "none",
                          border: 0,
                          width: "30vw",
                          height: "8vh",
                          backgroundColor: "#dfdfdf",
                          padding: "0 12px",
                          borderRadius: "10px",
                          fontSize: "14px",
                        }),
                        option: (baseStyles, state) => ({
                          ...baseStyles,
                          backgroundColor: state.isFocused ? "#f7cebe" : "#fff",
                          color: "#878282",
                          padding: "12px 20px",
                          cursor: "pointer",
                          borderRadius: "4px",
                          fontSize: "14px",
                        }),
                        menu: (base) => ({
                          ...base,
                          maxHeight: '25vh', // Limita a altura do menu
                          overflowY: "hidden", // Adiciona rolagem
                        }),
                      }}
                    />
                  </div>

                  <div className="area-btn-vincular">
                    <button className="btn-vincular" onClick={handleVinculoArenaUser}>Vincular</button>
                  </div>
                </Modal>

                {/* modal plano */}
                <Modal
                  isOpen={modalIsOpenPlan}
                  onRequestClose={closeModalPlan}
                  style={customStylesModalPlan}
                  shouldCloseOnOverlayClick={false}
                >
                  <header className="header-modal">
                    <h1>Selecione um plano</h1>
                    <div className="area-close" onClick={closeModalPlan}>
                      <FiX size={24} />
                    </div>
                  </header>

                  <div className="area-select-arena">
                    <h3>Selecione a arena:</h3>
                    <Select
                      options={getAllArenas}
                      onChange={(selectedOption) => {
                        if (selectedOption) {
                          setSelectedArena(selectedOption.value); // Converte para número antes de atribuir
                        } else {
                          setSelectedArena('arena'); // Define como null se nada for selecionado
                        }
                      }}
                      placeholder="Arena"
                      styles={{
                        control: (baseStyles) => ({
                          ...baseStyles,
                          borderColor: "none",
                          border: 0,
                          width: "30vw",
                          height: "8vh",
                          backgroundColor: "#dfdfdf",
                          padding: "0 12px",
                          borderRadius: "10px",
                          fontSize: "14px",
                        }),
                        option: (baseStyles, state) => ({
                          ...baseStyles,
                          backgroundColor: state.isFocused ? "#f7cebe" : "#fff",
                          color: "#878282",
                          padding: "12px 20px",
                          cursor: "pointer",
                          borderRadius: "4px",
                          fontSize: "14px",
                        }),
                        menu: (base) => ({
                          ...base,
                          maxHeight: '50vh', // Limita a altura do menu
                          overflowY: "hidden", // Adiciona rolagem
                        }),
                      }}
                    />
                  </div>

                  <div className="area-select-user">
                    <h3>Selecione um plano:</h3>
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
                          width: "30vw",
                          height: "8vh",
                          backgroundColor: "#dfdfdf",
                          padding: "0 12px",
                          borderRadius: "10px",
                          fontSize: "14px",
                        }),
                        option: (baseStyles, state) => ({
                          ...baseStyles,
                          backgroundColor: state.isFocused ? "#f7cebe" : "#fff",
                          color: "#878282",
                          padding: "12px 20px",
                          cursor: "pointer",
                          borderRadius: "4px",
                          fontSize: "14px",
                        }),
                        menu: (base) => ({
                          ...base,
                          maxHeight: '25vh', // Limita a altura do menu
                          overflowY: "hidden", // Adiciona rolagem
                        }),
                      }}
                    />
                  </div>

                  <div className="area-btn-vincular">
                    <button className="btn-vincular" onClick={handleAddPlan}>Inserir Plano</button>
                  </div>

                </Modal>
              </div>

              {/* Renderiza o Toast com uma chave única baseada em sendTitle e sendMessage */}
              <Toast title={sendTitle} message={sendMessage} />

              <section className='arena-container'>
                <article className="information">
                  <h1>Gerenciamento - Arena </h1>
                  <h3>ou retorne ao menu principal.</h3>
                  <Link to="/principal" className="menu-btn">Menu Principal</Link>
                </article>

                <article className="area-arena">
                  <nav className="nav-arena">
                    <button className="endereco" type="submit" onClick={() => navigate('/adress')}>Endereço</button>
                    <button className="endereco" type="submit" onClick={openModalPlan}>Plano</button>
                    <button className="acesso" type="submit" onClick={openModal}>Acesso</button>
                  </nav>

                  {/* Condicional de loading */}
                  {isLoading ? (
                    <Loading />
                  ) : (
                    <form onSubmit={handleAddArena}>
                      <input className="input-form" type="text" placeholder='Arena' required onChange={e => setarenaName(e.target.value)} />
                      <IMaskInput
                        className="input-form"
                        mask={"(00)00000-0000"}
                        type="text"
                        placeholder='Telefone' required
                        onChange={e => setPhone((e.target as HTMLInputElement).value)}
                      />

                      <SelectSearchStatus currentStatus={status} onStatusChange={handleStatusChange} />

                      <input className="input-form" type="number" placeholder='Valor Hora' required onChange={e => setValueHour(e.target.value)} />

                      <div className="area-btns">
                        <button className="cadastrar" type="submit">Cadastrar</button>
                      </div>
                    </form>
                  )}
                </article>
              </section>
            </>

          )
      }
    </>
  );
}
