import { useEffect, useState } from "react";
import { FiCheck, FiInfo, FiAlertTriangle, FiX, FiXCircle } from "react-icons/fi";
import "./style.css"; // Importar estilos

export default function Toast({ title, message }: any) {
  const [getTitle, setGetTitle] = useState('');
  const [container, setContainer] = useState('container-default');
  const [divider, setDivider] = useState('divider-default');
  const [titleToast, setTitleToast] = useState('title-default');
  const [messageToast, setMessageToast] = useState('message-default');
  const [visibleToast, setVisibleToast] = useState(false);

  // Atualiza o título do Toast de acordo com o tipo de status
  useEffect(() => {
    if (title === "success") {
      setGetTitle('Sucesso');
    } else if (title === "info") {
      setGetTitle('Informação');
    } else if (title === "warning") {
      setGetTitle('Atenção');
    } else if (title === "error") {
      setGetTitle('Erro');
    }
  }, [title]);

  // Atualiza o estilo do Toast dependendo do tipo de título
  useEffect(() => {
    if (getTitle === 'Sucesso') {
      setContainer('container-success');
      setDivider('divider-success');
      setTitleToast('title-success');
      setMessageToast('message-success');
    } else if (getTitle === 'Informação') {
      setContainer('container-info');
      setDivider('divider-info');
      setTitleToast('title-info');
      setMessageToast('message-info');
    } else if (getTitle === 'Atenção') {
      setContainer('container-warning');
      setDivider('divider-warning');
      setTitleToast('title-warning');
      setMessageToast('message-warning');
    } else if (getTitle === 'Erro') {
      setContainer('container-error');
      setDivider('divider-error');
      setTitleToast('title-error');
      setMessageToast('message-error');
    }
  }, [getTitle]);

  // Lógica para esconder o Toast após 3 segundos
  useEffect(() => {

    if (title && message) {
      setVisibleToast(true); // Exibe o Toast sempre que title e message mudam

      const timer = setTimeout(() => {
        setVisibleToast(false);  // Esconde o Toast após 3 segundos
      }, 3000);

      return () => clearTimeout(timer); // Limpar o timer quando o componente for desmontado ou o estado mudar
    }
  }, [title, message]); // Sempre que title ou message mudam, executa novamente

  // Exibe o componente Toast com os valores configurados
  return (
    <>
      {visibleToast && (
        <div className={container}>
          <div className={divider}></div>
          <div className="icon">
            {getTitle === 'Sucesso' ? <FiCheck size={30} color="#0e8e34" /> :
              getTitle === 'Informação' ? <FiInfo size={30} color="#2192b5" /> :
                getTitle === 'Atenção' ? <FiAlertTriangle size={30} color="#b5b021" /> :
                  getTitle === 'Erro' ? <FiX size={30} color="#b52121" /> :
                    null}
          </div>
          <div className="body">
            <strong className={titleToast}>{getTitle}</strong>
            <h3 className={messageToast}>{message}</h3>
          </div>
          <div className="icon-close">
            <FiXCircle size={20} color={getTitle === 'Sucesso' ? '#0e8e34'
              : getTitle === 'Informação' ? '#2192b5'
                : getTitle === 'Atenção' ? '#b5b021'
                  : getTitle === 'Erro' ? '#b52121' : ''} cursor={"pointer"}
              onClick={() => setVisibleToast(false)} />
          </div>
        </div>
      )}
    </>
  );
}
