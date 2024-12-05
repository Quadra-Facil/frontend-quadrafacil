import "./style.css";
import Select from "react-select";
import { Link } from "react-router-dom";
import { FormEvent, useState, useEffect } from "react";
import { api } from "../../services/axiosApi/apiClient";
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncSelect from "react-select/async";

type IBGEUFResponse = {
  sigla: string;
  nome: string;
};
type IBGECITYResponse = {
  id: number;
  nome: string;
};

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

export default function AdressArena() {
  const [ufs, setUfs] = useState<{ value: string; label: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [selectedUf, setSelectedUf] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [road, setRoad] = useState<string>("");
  const [neighborhood, setNeighborhood] = useState<string>("");
  const [number, setNumber] = useState<string | number>("");
  const [reference, setReference] = useState<string>("");
  const [arenaId, setArenaId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendTitle, setSendTitle] = useState<string>("");
  const [sendMessage, setSendMessage] = useState<string>("");
  const [getAllUsers, setGetAllUsers] = useState<{ value: string; label: string }[]>([]);

  const navigate = useNavigate();

  // Exibir Toast
  useEffect(() => {
    if (sendTitle && sendMessage) {
      const timer = setTimeout(() => {
        setSendTitle("");
        setSendMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sendTitle, sendMessage]);

  // Carregar UFs da API do IBGE
  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados/"
      )
      .then((response) => {
        const formattedUfs = response.data.map((uf) => ({
          value: uf.sigla,
          label: uf.nome,
        }));
        setUfs(formattedUfs);
      });
  }, []);

  // Carregar cidades ao selecionar UF
  useEffect(() => {
    if (selectedUf) {
      axios
        .get<IBGECITYResponse[]>(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
        )
        .then((response) => {
          const formattedCities = response.data.map((city) => ({
            value: city.nome,
            label: city.nome,
          }));
          setCities(formattedCities);
        });
    } else {
      setCities([]);
    }
  }, [selectedUf]);

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

  // Submissão do formulário
  async function handleAddAdressArena(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/api/adress", {
        state: selectedUf,
        city: selectedCity,
        street: road,
        neighborhood,
        number,
        reference,
        arenaId,
      });
      setIsLoading(false);
      setSendTitle("success");
      setSendMessage(`Endereço ${response.data.name} inserido.`);
    } catch (error: any) {
      setIsLoading(false);
      setSendTitle("error");
      setSendMessage(error.response?.data?.erro || "Erro desconhecido");
    }
  }

  return (
    <>
      <Toast title={sendTitle} message={sendMessage} />
      <section className="arena-container">
        <article className="information">
          <h1>Gerenciamento - Endereço </h1>
          <h3>ou retorne ao menu principal.</h3>
          <Link to="/principal" className="menu-btn">Menu Principal</Link>
        </article>

        <article className="endereco">
          {isLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleAddAdressArena}>
              <div className="area-selects">
                <Select
                  options={ufs}
                  onChange={(selectedOption) =>
                    setSelectedUf(selectedOption ? selectedOption.value : null)
                  }
                  placeholder="Selecione uma UF"
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      border: 0,
                      width: "15vw",
                      height: "10vh",
                      backgroundColor: "#dfdfdf",
                      color: "#878282",
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
                  }}
                />

                <Select
                  options={cities}
                  onChange={(selectedOption) =>
                    setSelectedCity(selectedOption ? selectedOption.value : null)
                  }
                  placeholder="Selecione uma cidade"
                  isDisabled={!selectedUf}
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      border: 0,
                      width: "19vw",
                      height: "10vh",
                      backgroundColor: "#dfdfdf",
                      color: "#878282",
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
                  }}
                />
              </div>

              <input
                className="input-form"
                type="text"
                placeholder="Rua"
                required
                onChange={(e) => setRoad(e.target.value)}
              />

              <div className="area-bairro-numero">
                <input
                  className="input-form"
                  type="text"
                  placeholder="Bairro"
                  required
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
                <input
                  className="input-form"
                  type="text"
                  placeholder="Número"
                  required
                  onChange={(e) => setNumber(e.target.value)}
                />
              </div>


              <input
                className="input-form"
                type="text"
                placeholder="Referência"
                required
                onChange={(e) => setReference(e.target.value)}
              />

              {/* /* busca os user(name e email) Alan - alan@gmail.com */}
              <h3>Selecione um usuário para arena</h3>

              <Select
                options={getAllUsers}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setArenaId(Number(selectedOption.value)); // Converte para número antes de atribuir
                  } else {
                    setArenaId(null); // Define como null se nada for selecionado
                  }
                }}
                placeholder="Vincule um usuário"
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    borderColor: "none",
                    border: 0,
                    width: "35vw",
                    height: "10vh",
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
                }}
              />
              <button className="cadastrar" type="submit">
                Cadastrar
              </button>
            </form>
          )}
        </article>
      </section>
    </>
  );
}
