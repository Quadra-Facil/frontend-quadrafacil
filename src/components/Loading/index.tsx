import Lottie from "lottie-react";
import loading from "../../img/loading.json"
import './style.css'

export default function Loading() {
  return (

    <>
      <div className="overlay">
        <div className="animation-container">
          <Lottie
            animationData={loading}
            loop={true}
            autoplay={true}
            className="loading"
          />
          {/* <h2>Aguarde...</h2> */}
        </div>
      </div>

    </>
  )
}