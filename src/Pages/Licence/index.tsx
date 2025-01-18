// import "./style-menuOption.css"
// import LogoQuadra from "../../../img/logomarca.svg"
// import { FiMenu, FiX } from "react-icons/fi";
// import ReserveIcon from "./img/reserveIcon.svg"
// import LicencaIcon from "./img/licencaIcon.svg"
// import ArenaIcon from "./img/arenaIcon.svg"
// import ClientsIcon from "./img/icon-clients.svg"
// import DashIcon from "./img/icon-dashboard.svg"
// import RelatorioIcon from "./img/icon-relatorio.svg"
// import SpaceIcon from "./img/icon-space.svg"
// import FiSettings from "./img/FiSettings.svg"
// import { useNavigate } from "react-router-dom";
// import { FormEvent, useContext, useEffect, useState } from "react";
// import Modal from "react-modal";
// import Toast from "../../Toast";
// import Loading from "../../Loading";
// import { api } from "../../../services/axiosApi/apiClient";
// import { AuthContext } from "../../../services/contexts/AuthContext";
// import { DatePickerReserve } from "../../DatePickerReserve";
// import DatePickerHourReserved from "../../DatePickerHourReserved";

// interface GetPlanResponse {
//   id: string;
//   getPlan: {
//     id: number;
//     planSelect: string;
//     planExpiry: string; // Use 'Date' se você transformar essa string em um objeto de data posteriormente
//     arenaId: number;
//     status: string;
//   };
//   arenaName: string;
// }

// interface Space {
//   spaceId: number;
//   name: string;
//   sports: string;
//   status: string;
//   arenaId: number;
// }

// interface SpaceResponse {
//   $id: string;
//   $values: Space[];
// }

// export default function Licence() {
//   const navigate = useNavigate();
//   const [modalIsOpenLicence, setIsOpenLicence] = useState<boolean>(false);
//   const [modalIsOpenSpace, setIsOpenSpace] = useState<boolean>(false);
//   const [modalIsOpenSpaceStatus, setIsOpenSpaceStatus] = useState<boolean>(false);
//   const [dataPlan, setDataPlan] = useState<GetPlanResponse | null>(null)
//   const [sendTitle, setSendTitle] = useState<string>('');
//   const [sendMessage, setSendMessage] = useState<string>('');
//   const [space, setSpace] = useState<string>('');
//   const [selectedSports, setSelectedSports] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [spacesData, seTSpacesData] = useState<SpaceResponse | null>(null);
//   const [isChecked, setIsChecked] = useState<string>('')

//   const authContext = useContext(AuthContext);
//   const { user }: any = authContext;

//   useEffect(() => {
//     // setClassAreaUser(false)
//     if (sendTitle && sendMessage) {
//       const timer = setTimeout(() => {
//         setSendTitle('');
//         setSendMessage('');
//       }, 3000);

//       return () => clearTimeout(timer); // Limpar o timer ao desmontar o componente ou atualizar os estados
//     }
//   }, [sendTitle, sendMessage]);

//   useEffect(() => {
//     const fetchPlan = async () => {
//       try {
//         const response = await api.post<GetPlanResponse>("/api/Plan/getplan-user", {
//           arenaId: 1
//         });
//         setDataPlan(response.data);
//       } catch (err) {
//         console.log(err);
//       }
//     };

//     fetchPlan();
//   }, []);

//   useEffect(() => {
//     async function getSpaces() {
//       await api.post<SpaceResponse>("/api/newSpace/get-spaces", {
//         arenaId: Number(user.arena)
//       }).then((response) => {
//         seTSpacesData(response.data);

//       }).catch((error) => {
//         setSendTitle('error');
//         setSendMessage(error.response?.data?.erro || 'Erro ao buscar espaços');
//         setIsLoading(false);
//       })
//     }
//     getSpaces();
//   }, [modalIsOpenSpaceStatus])

//   //get value checkbox arena
//   const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const { value, checked } = event.target;

//     setSelectedSports((prevSelectedSports) => {
//       const updatedSports = checked
//         ? [...prevSelectedSports, value] // Adiciona ao array se marcado
//         : prevSelectedSports.filter((sport) => sport !== value); // Remove do array se desmarcado

//       return updatedSports;
//     });
//   };

//   async function handleNewSpace(e: FormEvent) {
//     e.preventDefault();
//     if (selectedSports.length === 0) {
//       setSendTitle('error');
//       setSendMessage(`Selecione os esportes.`);
//       return;
//     } else if (space == "") {
//       setSendTitle('error');
//       setSendMessage(`Preencha o espaço.`);
//       return;
//     } else if (space.length < 5) {
//       setSendTitle('error');
//       setSendMessage(`Nome do espaço muito curto`);
//       return;
//     } else {
//       setIsLoading(true);
//       const checksConvert = selectedSports.join(", ",)

//       await api.post("/api/newSpace", {
//         name: space,
//         sports: checksConvert,
//         arenaId: user.arena
//       }).then(() => {
//         setSendTitle('success');
//         setSendMessage(`Quadra inserida.`);
//         setIsLoading(false);
//         setSelectedSports([])
//       }).catch((error: any) => {
//         setSendTitle('error');
//         setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
//         setIsLoading(false);
//       })
//     }
//   }


//   // style modal licence
//   const customStylesModalSpace = {
//     content: {
//       top: '50%',
//       left: '50%',
//       right: 'auto',
//       bottom: 'auto',
//       marginRight: '-50%',
//       transform: 'translate(-50%, -50%)',
//       backgroundColor: '#f0f0f0',
//       border: '1px solid #ccc',
//       borderRadius: '10px',
//       padding: '20px',
//       boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//       width: '40vw',
//       height: '55vh',
//       maxWidth: '90%',
//       color: '#6c6c6c'
//     },
//     overlay: {
//       backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     },
//   };



//   //função para carpturar o status do botão 
//   const handleToggleStatus = async (spaceId: number, status: string) => {

//     setIsLoading(true)

//     await api.put("/api/newSpace/edit-space", {
//       spaceId: Number(spaceId),
//       status: status === "Disponível" ? "Indisponível" : "Disponível"
//     }).then(() => {
//       setSendTitle('success');
//       setSendMessage(`Status alterado.`);
//       setIsLoading(false);
//       closeModalSpaceStatus();
//     }).catch((error: any) => {
//       setSendTitle('error');
//       setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
//       setIsLoading(false);
//     })
//   }

//   return (
//     <>
//       <Toast title={sendTitle} message={sendMessage} />
//       {
//         isLoading ?
//           <Loading />
//           : (
//             <>
//               <nav className="menu">
//                 <section className="area-logo-btnMenu">
//                   <img src={LogoQuadra} alt="Logo" />
//                   <FiMenu size={35} color="#868682" style={{ cursor: "pointer" }} />
//                 </section>

//                 <section className="menu-item" onClick={() => navigate("/searchArena")}>
//                   <div className="divider-item"></div>
//                   <img src={ReserveIcon} alt="Icon" width={28} height={28} />
//                   <strong>Reservas</strong>
//                 </section>

                

//                 <section className="menu-item" onClick={() => openModalLicence()}>
//                   <div className="divider-item"></div>
//                   <img src={LicencaIcon} alt="Icon" width={28} height={28} />
//                   <strong>Licença</strong>
//                 </section>

//                 <section className="menu-item" onClick={() => navigate("/client")}>
//                   <div className="divider-item"></div>
//                   <img src={ClientsIcon} alt="Icon" width={28} height={28} />
//                   <strong>Clientes</strong>
//                 </section>

//                 <section className="menu-item">
//                   <div className="divider-item"></div>
//                   <img src={FiSettings} alt="Icon" width={28} height={28} />
//                   <strong>Configuração</strong>
//                 </section>

//                 <section className="menu-item">
//                   <div className="divider-item"></div>
//                   <img src={DashIcon} alt="Icon" width={28} height={28} />
//                   <strong>Dashboard</strong>
//                 </section>

//                 <section className="menu-item" onClick={() => navigate("/reserved")}>
//                   <div className="divider-item"></div>
//                   <img src={RelatorioIcon} alt="Icon" width={28} height={28} />
//                   <strong>Relatórios - agenda</strong>
//                 </section>
//               </nav>



//               {/* Modal space*/}
//               <Modal
//                 isOpen={modalIsOpenSpace}
//                 onRequestClose={closeModalSpace}
//                 style={customStylesModalSpace}
//                 shouldCloseOnOverlayClick={false}
//               >
//                 <header className="header-modal">
//                   <div className="header-arena-space">
//                     <h5>Espaços, Quadras, Campo...</h5>
//                   </div>
//                   <div className="area-close" onClick={closeModalSpace}>
//                     <FiX size={24} />
//                   </div>
//                 </header>
//                 <main className="main-modal-space">
//                   <div className="area-first">
//                     <h5>Novo Espaço:</h5>
//                     <input
//                       type="text"
//                       placeholder="Quadra 1"
//                       onChange={e => setSpace(e.target.value)}
//                     />
//                   </div>
//                   <div className="area-second">
//                     <h5>Selecione os esportes para esta quadra:</h5>
//                     <div>
//                       <input type="checkbox" name="Futevôlei" id="futevolei" value="Futevôlei" onChange={handleCheckboxChange} />
//                       <label htmlFor="futevolei">Futevôlei</label>
//                     </div>

//                     <div>
//                       <input type="checkbox" name="Beach Tênis" id="beachtenis" value="Beach Tênis" onChange={handleCheckboxChange} />
//                       <label htmlFor="beachtenis">Beach Tênis</label>
//                     </div>

//                     <div>
//                       <input type="checkbox" name="Vôlei de areia" id="voleiDeAreia" value="Vôlei de areia" onChange={handleCheckboxChange} />
//                       <label htmlFor="voleiDeAreia">Vôlei de areia</label>
//                     </div>

//                     <div>
//                       <input type="checkbox" name="Futebol" id="futebol" value="Futebol" onChange={handleCheckboxChange} />
//                       <label htmlFor="futebol">Futebol</label>
//                     </div>

//                     <div>
//                       <input type="checkbox" name="Basquete" id="basquete" value="Basquete" onChange={handleCheckboxChange} />
//                       <label htmlFor="basquete">Basquete</label>
//                     </div>

//                     <div>
//                       <input type="checkbox" name="Futsal" id="futsal" value="Futsal" onChange={handleCheckboxChange} />
//                       <label htmlFor="futsal">Futsal</label>
//                     </div>

//                     <div>
//                       <input type="checkbox" name="Vôlei de Quadra" id="voleidequadra" value="Vôlei de Quadra" onChange={handleCheckboxChange} />
//                       <label htmlFor="Vôlei de Quadra">Vôlei de Quadra</label>
//                     </div>
//                   </div>
//                 </main>
//                 <div className="area-btn">
//                   <button onClick={handleNewSpace}>Adicionar</button>
//                   <button onClick={openModalSpaceStatus}>Mostrar Espaços</button>
//                 </div>
//               </Modal>

//               {/* Modal mostrar space*/}
//               <Modal
//                 isOpen={modalIsOpenSpaceStatus}
//                 onRequestClose={closeModalSpaceStatus}
//                 style={customStylesModalSpaceStatus}
//                 shouldCloseOnOverlayClick={false}
//               >
//                 <header className="header-modal">
//                   <div className="header-arena-space">
//                     <h5>Seus Espaços</h5>
//                   </div>
//                   <div className="area-close" onClick={closeModalSpaceStatus}>
//                     <FiX size={24} />
//                   </div>
//                 </header>
//                 <main className="main-modal-space-status">
//                   <table style={{ width: '100%', fontWeight: 300 }}>
//                     <thead>
//                       <tr>
//                         <th>Id</th>
//                         <th>Espaços</th>
//                         <th>Esportes</th>
//                         <th>Ativar/Desativar</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {spacesData?.$values.map((item) => (
//                         <tr key={item.spaceId}>
//                           <td style={{ textAlign: 'center' }}>{item.spaceId}</td>
//                           <td style={{ textAlign: 'center' }}>{item.name}</td>
//                           <td>{item.sports}</td>
//                           <td style={{ textAlign: 'center' }}>

//                             <button
//                               onClick={() =>
//                                 handleToggleStatus(
//                                   item.spaceId,
//                                   item.status === "Disponível" ? "Disponível" : "Indisponível"
//                                 )
//                               }
//                               style={{
//                                 backgroundColor: item.status === "Disponível" ? "#e49e9e" : "#8ce49c",
//                                 padding: "1% 10%",
//                                 borderRadius: "10px",
//                                 color: "#fff",
//                                 border: "none",
//                                 cursor: "pointer",
//                               }}
//                             >
//                               {item.status === "Disponível" ? "Desativar" : "Ativar"}
//                             </button>

//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </main>
//               </Modal>
//             </>
//           )
//       }
//     </>
//   )
// }