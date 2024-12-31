import "./style-menuOption.css"
import LogoQuadra from "../../../img/logomarca.svg"
import { FiMenu, FiX } from "react-icons/fi";
import ReserveIcon from "./img/reserveIcon.svg"
import LicencaIcon from "./img/licencaIcon.svg"
import ArenaIcon from "./img/arenaIcon.svg"
import FiSettings from "./img/FiSettings.svg"
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { api } from "../../../services/axiosApi/apiClient";

interface GetPlanResponse {
  id: string;
  getPlan: {
    id: number;
    planSelect: string;
    planExpiry: string; // Use 'Date' se você transformar essa string em um objeto de data posteriormente
    arenaId: number;
    status: string;
  };
  arenaName: string;
}

export default function MenuOption() {
  const navigate = useNavigate();
  const [modalIsOpenLicence, setIsOpenLicence] = useState<boolean>(false);
  const [dataPlan, setDataPlan] = useState<GetPlanResponse | null>(null)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.post<GetPlanResponse>("/api/Plan/getplan-user", {
          arenaId: 1
        });
        setDataPlan(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPlan();
  }, []);

  // style modal 
  const customStylesModalLicence = {
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

  function openModalLicence() {
    setIsOpenLicence(true);   // Abre o modal
  }

  function closeModalLicence() {
    setIsOpenLicence(false);
  }

  return (
    <>
      <nav className="menu">
        <section className="area-logo-btnMenu">
          <img src={LogoQuadra} alt="Logo" />
          <FiMenu size={35} color="#868682" style={{ cursor: "pointer" }} />
        </section>

        <section className="menu-item">
          <div className="divider-item"></div>
          <img src={ReserveIcon} alt="Icon" width={28} height={28} />
          <strong>Reservas</strong>
        </section>

        <section className="menu-item" onClick={() => { navigate("/arena") }}>
          <div className="divider-item"></div>
          <img src={ArenaIcon} alt="Icon" width={28} height={28} />
          <strong>Arena</strong>
        </section>

        <section className="menu-item">
          <div className="divider-item"></div>
          <img src={LicencaIcon} alt="Icon" width={28} height={28} />
          <strong>Espaço</strong>
        </section>

        <section className="menu-item" onClick={() => openModalLicence()}>
          <div className="divider-item"></div>
          <img src={LicencaIcon} alt="Icon" width={28} height={28} />
          <strong>Licença</strong>
        </section>

        <section className="menu-item" onClick={() => navigate("/client")}>
          <div className="divider-item"></div>
          <img src={LicencaIcon} alt="Icon" width={28} height={28} />
          <strong>Clientes</strong>
        </section>

        <section className="menu-item">
          <div className="divider-item"></div>
          <img src={FiSettings} alt="Icon" width={28} height={28} />
          <strong>Configuração</strong>
        </section>

        <section className="menu-item">
          <div className="divider-item"></div>
          <img src={FiSettings} alt="Icon" width={28} height={28} />
          <strong>Dashboard</strong>
        </section>

        <section className="menu-item">
          <div className="divider-item"></div>
          <img src={FiSettings} alt="Icon" width={28} height={28} />
          <strong>Relatórios</strong>
        </section>
      </nav>

      {/* Modal licence */}
      <Modal
        isOpen={modalIsOpenLicence}
        onRequestClose={closeModalLicence}
        style={customStylesModalLicence}
        shouldCloseOnOverlayClick={false}
      >
        <header className="header-modal">
          <div className="header-arena-licence">
            <h5>Licença de uso</h5>
          </div>
          <div className="area-close" onClick={closeModalLicence}>
            <FiX size={24} />
          </div>
        </header>
        <main className="main-modal-licence">
          <div className="area-first">
            <h5><strong>Arena:</strong> {dataPlan?.arenaName} </h5>
            <h5><strong>Plano Atual:  </strong>{dataPlan?.getPlan.planSelect}</h5>
          </div>
          <div className="area-second">
            <h5><strong>Vencimento:  </strong>
              {
                dataPlan?.getPlan.planExpiry ?
                  new Date(dataPlan?.getPlan.planExpiry).toLocaleDateString("pt-br")
                  : "sem data"
              }
            </h5>
            <h5><strong>Status plano: </strong> {dataPlan?.getPlan.status}</h5>
          </div>
        </main>
        <div className="area-btn">
          <button>Mudar Plano</button>
        </div>
      </Modal>
    </>
  )
}