import { Link } from "react-router-dom";
import "./style.css";
import { FormEvent, useState, useEffect, ChangeEvent } from "react";
import { api } from "../../services/axiosApi/apiClient";
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask"
import SelectSearchStatus from "../../components/SelectSearchStatus";
import axios from "axios";

type IBGEUFResponse = {
  sigla: string;
  nome: string;
};
type IBGECITYResponse = {
  id: number;
  nome: string;
};

export default function AdressArena() {
  const [ufs, setUfs] = useState<IBGEUFResponse[]>([]);
  const [cities, setCities] = useState<IBGECITYResponse[]>([]);
  const [selectedUf, setSelectedUf] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");
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

  useEffect(() => {
    if (selectedUf === "0") {
      return;
    }
    axios
      .get(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        setCities(response.data);
      });
  });

  useEffect(() => {
    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados/")
      .then((response) => {
        setUfs(response.data);
      });
  }, [selectedUf]);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setSelectedUf(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city);
  }

  async function handleAddAdressArena(e: FormEvent) {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await api.post('/api/adress', {
        state: ufs,
        city: cities,
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
              
              <select name="uf" id="uf" onChange={handleSelectUf}>
                <option value="0">Selecione uma UF</option>
                {ufs.map((uf) => (
                  <option value={uf.sigla}>{uf.nome}</option>
                ))}
              </select>

              <select
                name="City"
                id="City"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.nome}>
                    {city.nome}
                  </option>
                ))}
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
