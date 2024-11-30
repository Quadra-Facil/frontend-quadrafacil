import "./style.css";
import { Link } from "react-router-dom";
import { FormEvent, useState, useEffect } from "react";
import { api } from "../../services/axiosApi/apiClient";
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask"
import SelectSearchStatus from "../../components/SelectSearchStatus";

export default function Arena() {
  const [arenaName, setarenaName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [valueHour, setValueHour] = useState<any>();
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

  async function handleAddArena(e: FormEvent) {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await api.post('/api/Arena', {
        name: arenaName,
        phone,
        status,
        valuehour: valueHour
      });
      setIsLoading(false);
      setSendTitle('success');
      setSendMessage(`Arena ${response.data.name} inserida.`);
    } catch (error: any) {
      setIsLoading(false);
      setSendTitle('error');
      setSendMessage(error.response?.data?.erro || 'Erro desconhecido');
    }
  }

  // Função de callback para atualizar o estado do status no componente pai
  const handleStatusChange = (newStatus: string): void => {
    setStatus(newStatus);
  };

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
            <form onSubmit={handleAddArena}>
              <input className="input-form" type="text" placeholder='Arena' required onChange={e => setarenaName(e.target.value)} />
              <IMaskInput
                className="input-form"
                mask={"(00)00000-0000"}
                type="text"
                placeholder='Telefone' required
                onChange={e => setPhone((e.target as HTMLInputElement).value)}
              />

              <SelectSearchStatus currentStatus={status} onStatusChange={handleStatusChange} />

              <input className="input-form" type="number" placeholder='Valor Hora' required onChange={e => setValueHour(e.target.value)} />

              <div className="area-btns">
                <button className="cadastrar" type="submit">Cadastrar</button>
                <button className="endereco" type="submit" onClick={() => navigate('/adress')}>Endereço</button>
                <button className="acesso" type="submit" >Acesso</button>
              </div>
            </form>
          )}
        </article>
      </section>
    </>
  );
}
