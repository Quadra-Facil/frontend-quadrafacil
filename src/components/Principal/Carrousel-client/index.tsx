import './style.css'
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import Img4 from './gifs/Basketball.gif';
import Img1 from './gifs/Soccer.gif';
import Img2 from './gifs/Sport-family.gif';
import Img3 from './gifs/Beach volleyball (1).gif';
import Img5 from './gifs/Tennis (1).gif';
import Img6 from './gifs/Beach volleyball-1.gif';
import Img7 from './gifs/Beach volleyball.gif';
import Img8 from './gifs/FootballGoal.gif';
import Img9 from './gifs/Junior-soccer.gif';

const CarrosselClient = () => {
  // Definindo as configurações do carrossel
  const responsive = {
    superLargeDesktop: {
      // screens larger than 3000px
      breakpoint: { max: 4000, min: 3000 },
      items: 1 // Apenas uma imagem por vez
    },
    desktop: {
      // screens between 1024px and 3000px
      breakpoint: { max: 3000, min: 1024 },
      items: 1 // Apenas uma imagem por vez
    },
    tablet: {
      // screens between 464px and 1024px
      breakpoint: { max: 1024, min: 464 },
      items: 1 // Apenas uma imagem por vez
    },
    mobile: {
      // screens menores que 464px
      breakpoint: { max: 464, min: 0 },
      items: 1 // Apenas uma imagem por vez
    }
  };

  // Frases motivacionais
  const motivationalQuotes = [
    "O esforço de hoje é a vitória de amanhã!",
    "Jogue com paixão, vença com determinação!",
    "O trabalho em equipe torna o sonho possível!",
    "O esporte ensina a nunca desistir!",
    "O sucesso no esporte começa na dedicação!",
    "Vença seus limites, supere-se sempre!",
    "Acredite em você e no seu potencial!",
    "Seja o melhor no que você faz, sempre!",
    "O caminho para a vitória é feito de esforço!"
  ];

  return (
    <div>
      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={5000}
        keyBoardControl={true}
        customTransition="all 1s"
        transitionDuration={1000}
        containerClass="carousel-container"
        itemClass="carousel-item"
      >
        <div className="area-img-carousel">
          <img src={Img1} alt="Soccer" />
          <p className="legend">{motivationalQuotes[0]}</p>
        </div>
        <div className="area-img-carousel">
          <img src={Img2} alt="Sport Family" />
          <p className="legend">{motivationalQuotes[1]}</p>
        </div>
        <div className="area-img-carousel">
          <img src={Img3} alt="Tennis" />
          <p className="legend">{motivationalQuotes[2]}</p>
        </div>
        <div className="area-img-carousel">
          <img src={Img4} alt="Basketball" />
          <p className="legend">{motivationalQuotes[3]}</p>
        </div>
        <div className="area-img-carousel">
          <img src={Img5} alt="Beach Volleyball" />
          <p className="legend">{motivationalQuotes[4]}</p>
        </div>
        <div className="area-img-carousel">
          <img src={Img6} alt="Beach Volleyball 2" />
          <p className="legend">{motivationalQuotes[5]}</p>
        </div>
        <div className="area-img-carousel">
          <img src={Img7} alt="Football Goal" />
          <p className="legend">{motivationalQuotes[6]}</p>
        </div>
        <div className="area-img-carousel">
          <img src={Img8} alt="Grand Slam" />
          <p className="legend">{motivationalQuotes[7]}</p>
        </div>
        <div className="area-img-carousel">
          <img src={Img9} alt="Junior Soccer" />
          <p className="legend">{motivationalQuotes[8]}</p>
        </div>
      </Carousel>
    </div>
  );
};

export default CarrosselClient;
