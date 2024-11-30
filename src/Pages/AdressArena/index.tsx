import { Link } from "react-router-dom";
import "./style.css";
import { FormEvent, useState, useEffect } from "react";
import { api } from "../../services/axiosApi/apiClient";
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask"
import SelectSearchStatus from "../../components/SelectSearchStatus";

export default function AdressArena() {
  const [uf, setUf] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [road, setRoad] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>('');
  const [number, setNumber] = useState<number | any>();
  const [reference, setReference] = useState<string>('');
  const [arenaId, setArenaId] = useState<number | any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendMessage, setSendMessage] = useState<string>('');

  const navigate = useNavigate();

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

  async function handleAddAdressArena(e: FormEvent) {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await api.post('/api/adress', {
        state: uf,
        city,
        street: road,
        neighborhood,
        number,
        reference,
        arenaId,
      });
      setIsLoading(false);
      setSendTitle('success');
      setSendMessage(`Endereço ${response.data.name} inserido.`);
    } catch (error: any) {
      setIsLoading(false);
      setSendTitle('error');
      setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
    }
  }



  return (
    <>
      {/* Renderiza o Toast com uma chave única baseada em sendTitle e sendMessage */}
      <Toast title={sendTitle} message={sendMessage} />

      <section className='arena-container'>
        <article className="information">
          <h1>Menu Principal</h1>
          <h3>Volte ao menu principal.</h3>
          <Link to="/principal">Menu Principal</Link>
        </article>

        <article className="arena">
          <h1>Vincula Arena</h1>

          {/* Condicional de loading */}
          {isLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleAddAdressArena}>
              <select name="uf" id="uf">
                <option value="0">Estado</option>
              </select>
              <select name="city" id="city">
                <option value="0">Cidade</option>
              </select>

              <input className="input-form" type="text" placeholder='Rua' required onChange={e => setRoad(e.target.value)} />
              <input className="input-form" type="text" placeholder='Bairro' required onChange={e => setNeighborhood(e.target.value)} />
              <input className="input-form" type="text" placeholder='numero' required onChange={e => setNumber(e.target.value)} />
              <input className="input-form" type="text" placeholder='Referência' required onChange={e => setReference(e.target.value)} />
              <select name="arenaId" id="arenaId">
                <option value="0">ArenaId</option>
              </select>


              <button type="submit">Cadastrar</button>
            </form>
          )}
        </article>
      </section>
    </>
  );
}
