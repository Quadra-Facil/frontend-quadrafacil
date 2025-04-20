import "./style.css";
import Select from "react-select";
import { useState, useEffect, useContext } from "react";
import { api } from "../../services/axiosApi/apiClient";
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal"
import { FiX } from "react-icons/fi";
import { AuthContext } from "../../services/contexts/AuthContext";
import Logo from "../../img/logomarca.svg"

import ArenaIcon from "../../components/Principal/MenuOption/img/arenaIcon.svg"
import ReserveIcon from "../../components/Principal/MenuOption/img/reserveIcon.svg"
import SportIcon from "../../components/Principal/MenuOption/img/sportIcon.svg"
import { format } from "date-fns";

type AddressArena = {
  state: string;
  city: string;
};

type Arena = {
  id: number;
  name: string;
  phone: string;
  status: string;
  valueHour: number
  adressArenas: {
    $values: AddressArena[];
  };
};

interface GetAllArenasResponse {
  arenas: {
    $values: Arena[];  // Tipando corretamente o $values
  };
}

interface DataProgram {
  id: number;
  startDate: Date | any;
  endDate: Date | any;
  reason: string;
}

export default function ModalSerchArena() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');
  const [modalIsOpen, setIsOpen] = useState(false);
  const [getAllArenas, setGetAllArenas] = useState<{ value: string; label: string }[]>([]);
  const [selectedArena, setSelectedArena] = useState<any>();
  const [selectedArenaAdress, setSelectedArenaAdress] = useState<any>();
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [allArenas, setAllArenas] = useState<Arena[]>([])
  const [isOpenInforme, setIsOpenInforme] = useState<boolean>(false)
  const [dataDesativeProgrma, setDataDesativeProgrma] = useState<DataProgram[]>()

  const navigate = useNavigate();

  const authContext = useContext(AuthContext);
  // const { user } = authContext;

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

  // Verificar se o authContext está disponível
  if (!authContext) {
    return <div>Carregando...</div>; // Pode retornar uma tela de carregamento ou um componente de fallback
  }

  //style modal
  const customStylesModal = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#f8f8f8',
      border: '0px solid #ccc',
      borderRadius: '10px',
      padding: '0px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '80vw',
      height: '95vh',
      maxWidth: '100%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

  const customStylesModalInforme = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      border: '0px solid #ccc',
      borderRadius: '10px',
      padding: '0px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '50vw',
      minHeight: '60vh',
      maxWidth: '100%',
      color: '#6c6c6c'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
  };

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    navigate("/principal")
  }

  function openModalInformeArenaDisable() {
    setIsOpenInforme(true);
  }

  function closeModalInformeArenaDisable() {
    setIsOpenInforme(false);
  }

  useEffect(() => {
    openModal();
  })

  //get all arenas
  useEffect(() => {
    api
      .get<GetAllArenasResponse>("/api/Arena")
      .then((response) => {

        const arenaArray = response.data?.arenas?.$values || [];
        setAllArenas(arenaArray)
        setIsLoading(false)

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
  }, []);

  //get value checkbox arena
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;

    setSelectedSports((prevSelectedSports) => {
      const updatedSports = checked
        ? [...prevSelectedSports, value] // Adiciona ao array se marcado
        : prevSelectedSports.filter((sport) => sport !== value); // Remove do array se desmarcado

      return updatedSports;
    });
  };

  //redireciona para modal reserve passando dados
  async function redirectReserve() {
    if (selectedArena == undefined || selectedArena == null) {
      setSendTitle('error');
      setSendMessage(`Selecione uma arena.`);
      return;
    } else if (selectedSports.length == 0) {
      setSendTitle('error');
      setSendMessage(`Selecione seu esporte.`);
      return;
    } else {

      const arenaS = allArenas.filter(item => item.id == selectedArena)
      const selectedArenaData = allArenas.find(item => item.id == selectedArena);
      const getvalueHour = selectedArenaData ? selectedArenaData.valueHour : null;


      if (arenaS[0].status === "ativo") {
        navigate('/reserve', {
          state: {
            arenaId: selectedArena,
            arena: selectedArenaAdress,
            sports: selectedSports,
            GetvalueHour: getvalueHour
          },
        })
        return;
      } else {
        const response = await api.post("/api/DesativeProgram/get", {
          arenaId: selectedArena
        })
        setDataDesativeProgrma(response.data.$values)

        openModalInformeArenaDisable()

        return;
      }
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
              {/* modal seatch arena */}
              <Modal
                isOpen={modalIsOpen}
                // onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStylesModal}
                shouldCloseOnOverlayClick={false}
              >
                <header className="header-modal-search">
                  <h1>Supere limites<strong>,</strong> vença desafios<strong>,</strong> viva o esporte<strong>!</strong></h1>
                  <div className="area-close-search" onClick={closeModal}>
                    <FiX size={24} />
                  </div>
                </header>

                <div className="area-icons-header">
                  <div className="item-header">
                    <div className="icons-header">
                      <img className="icon" src={ArenaIcon} alt="arenaicon" />
                    </div>
                    <p><strong>1.</strong> Escolha sua arena</p>
                  </div>

                  <div className="item-header">
                    <div className="icons-header">
                      <img className="icon" src={SportIcon} alt="arenaicon" />
                    </div>
                    <p><strong>2.</strong> Selecione seu esporte</p>
                  </div>

                  <div className="item-header">
                    <div className="icons-header">
                      <img className="icon" src={ReserveIcon} alt="arenaicon" />
                    </div>
                    <p><strong>3.</strong> Faça sua reserva</p>
                  </div>
                </div>

                <section className="main-modal-search">

                  <div className="area-select-arena">
                    <Select
                      options={getAllArenas}
                      onChange={(selectedOption) => {
                        if (selectedOption) {
                          setSelectedArena(selectedOption.value); // Converte para número antes de atribuir
                          setSelectedArenaAdress(selectedOption.label);
                        } else {
                          setSelectedArena('arena'); // Define como null se nada for selecionado
                        }
                      }}
                      placeholder="Digite o nome da arena, estado ou cidade"
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
                            minWidth: "90vw",
                            height: "60px",
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
                    <div className="area-checks">
                      <div className="area-checks-left">
                        <h5>O que vamos jogar?</h5>
                        <div>
                          <input type="checkbox" name="Futevôlei" id="futevolei" value="Futevôlei" onChange={handleCheckboxChange} />
                          <label htmlFor="futevolei">Futevôlei</label>
                        </div>

                        <div>
                          <input type="checkbox" name="Beach Tênis" id="beachtenis" value="Beach Tênis" onChange={handleCheckboxChange} />
                          <label htmlFor="beachtenis">Beach Tênis</label>
                        </div>

                        <div>
                          <input type="checkbox" name="Vôlei de areia" id="voleiDeAreia" value="Vôlei de areia" onChange={handleCheckboxChange} />
                          <label htmlFor="voleiDeAreia">Vôlei de areia</label>
                        </div>

                        <div>
                          <input type="checkbox" name="Futebol" id="futebol" value="Futebol" onChange={handleCheckboxChange} />
                          <label htmlFor="futebol">Futebol</label>
                        </div>
                      </div>
                      <div className="area-checks-rigth">

                        <div>
                          <input type="checkbox" name="Basquete" id="basquete" value="Basquete" onChange={handleCheckboxChange} />
                          <label htmlFor="basquete">Basquete</label>
                        </div>

                        <div>
                          <input type="checkbox" name="Futsal" id="futsal" value="Futsal" onChange={handleCheckboxChange} />
                          <label htmlFor="futsal">Futsal</label>
                        </div>

                        <div>
                          <input type="checkbox" name="Vôlei de Quadra" id="voleidequadra" value="Vôlei de Quadra" onChange={handleCheckboxChange} />
                          <label htmlFor="Vôlei de Quadra">Vôlei de Quadra</label>
                        </div>
                      </div>
                    </div>

                    <div className="area-btn-agendar">
                      <button className="btn-agendar" onClick={redirectReserve}> Agendar</button>
                    </div>
                  </div>
                </section>

              </Modal>

              {/* modal informe */}
              <Modal
                isOpen={isOpenInforme}
                onRequestClose={closeModalInformeArenaDisable}
                style={customStylesModalInforme}
                shouldCloseOnOverlayClick={false}
              >
                <header className="header-modal-informe">

                  <img src={Logo} alt="logo" />

                  <div className="area-close" onClick={closeModalInformeArenaDisable}>
                    <FiX size={24} />
                  </div>
                </header>
                <section className="main-modal-informe">
                  <h1>Arena Desativada =(</h1>


                  {
                    dataDesativeProgrma && dataDesativeProgrma.length > 0 && dataDesativeProgrma[0]?.startDate && dataDesativeProgrma[0]?.endDate
                      ? (
                        <>
                          <h5><strong>Período:</strong> {format(new Date(dataDesativeProgrma[0]?.startDate), "dd/MM/yyyy")} até {format(new Date(dataDesativeProgrma[0]?.endDate), "dd/MM/yyyy")}</h5>
                          <h5 style={{ marginTop: '-0.1%' }}>{dataDesativeProgrma[0]?.reason}</h5>
                        </>
                      ) : (
                        <h5><strong>{allArenas[0]?.name}</strong> está desativada temporariamente.</h5>
                      )
                  }



                  <button onClick={() => closeModalInformeArenaDisable()}>Fechar</button>

                </section>

              </Modal>
            </>
          )
      }
    </>
  )
}
