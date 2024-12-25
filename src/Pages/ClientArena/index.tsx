import "./client.css"
import { useState } from 'react';
import { FiSearch, FiPhone, FiArrowRight, FiMapPin, FiCalendar, FiRefreshCw, FiClipboard } from 'react-icons/fi';


export default function ClientArena() {
  const [searchTerm, setSearchTerm] = useState('');

  // Dados fictícios para exemplificar os cards
  const DataArena = [
    { id: 1, name: 'João', age: 28, description: 'Desenvolvedor Frontend' },
    { id: 2, name: 'Maria', age: 34, description: 'Designer Gráfico' },
    { id: 3, name: 'José', age: 25, description: 'Desenvolvedor Backend' },
    { id: 4, name: 'Ana', age: 22, description: 'Product Manager' },
    { id: 5, name: 'Carlos', age: 30, description: 'DevOps' },
    { id: 6, name: 'Patricia', age: 27, description: 'QA Analyst' },
  ];
  // Função para filtrar os dados com base no termo de pesquisa
  const filteredData = DataArena.filter(
    item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Input de Pesquisa */}
      <section className="header">

        <div className="area-search">
          <input type="text"
            placeholder="Pesquise por nome ou descrição"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-icon">
            <FiSearch size={32} color="#8a8888" />
          </button>
        </div>

        <h3>area de filtragem de clientes</h3>
        tipo de plano mensal, anual, semestral


      </section>

      {/* Exibindo os cards filtrados */}
      <section className="area-cards">
        {filteredData.map((item) => (

          <div key={item.id} className='card'>
            <header>
              <h3>Alvorada Beach</h3>
              <div className="icon-area">
                <FiPhone title="8899327598978" color="#fff" />
              </div>
              <div className="icon-area">
                <FiMapPin />
              </div>
            </header>
            <main>
              <div className="area-status">
                <div className="status"></div>
              </div>
              <div className="area-plano">
                <FiClipboard />
                <p><strong>Plano Atual: </strong> Mensal</p>
              </div>
              <div className="area-mudar-plano">
                <FiRefreshCw />
                <p>Mudar plano</p>
              </div>
              <div className="area-vencimento">
                <FiCalendar />
                <p><strong>Até:</strong> 15/06/2024</p>
              </div>
            </main>
            <footer>
              <button className="show-plus">
                <h4>Ver mais</h4>
                <div className="icon-area">
                  <FiArrowRight />
                </div>
              </button>
            </footer>
          </div>

        ))}
      </section >
    </>
  );
};
