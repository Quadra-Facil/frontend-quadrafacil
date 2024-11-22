import "./style-menuOption.css"
import LogoQuadra from "../../../img/logomarca.svg"
import { FiMenu } from "react-icons/fi";
import ReserveIcon from "./img/reserveIcon.svg"
import LicencaIcon from "./img/licencaIcon.svg"
import ArenaIcon from "./img/arenaIcon.svg"

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
        </section>

        <section className="menu-item">
          <div className="divider-item"></div>
          <img src={ArenaIcon} alt="Icon" width={28} height={28} />
          <strong>Arena</strong>
        </section>

        <section className="menu-item">
          <div className="divider-item"></div>
          <img src={LicencaIcon} alt="Icon" width={28} height={28} />
          <strong>Licença</strong>
        </section>

        <section className="menu-item">
          <div className="divider-item"></div>
          <img src={ReserveIcon} alt="Icon" width={28} height={28} />
          <strong>Configuração</strong>
        </section>
      </nav>
    </>
  )
}