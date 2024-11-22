import "./style-menuOption.css"
import LogoQuadra from "../../../img/logomarca.svg"
import { FiMenu, FiChevronRight } from "react-icons/fi";
import ReserveIcon from "./img/reserveIcon.svg"

export default function MenuOption() {
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
          <FiChevronRight size={28} color="#868282" />
        </section>

        <section className="menu-item">
          <div className="divider-item"></div>
          <img src={ReserveIcon} alt="Icon" width={28} height={28} />
          <strong>Licença</strong>
          <FiChevronRight size={28} color="#868282" />
        </section>

        <section className="menu-item">
          <div className="divider-item"></div>
          <img src={ReserveIcon} alt="Icon" width={28} height={28} />
          <strong>Arena</strong>
          <FiChevronRight size={28} color="#868282" />
        </section>

        <section className="menu-item">
          <div className="divider-item"></div>
          <img src={ReserveIcon} alt="Icon" width={28} height={28} />
          <strong>Configurações</strong>
          <FiChevronRight size={28} color="#868282" />
        </section>

      </nav>
    </>
  )
}