import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaSortUp, FaSortDown, FaMoon, FaSun } from 'react-icons/fa';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [editId, setEditId] = useState(null);
  const [mostrarSobre, setMostrarSobre] = useState(false);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [quantidadeEdicao, setQuantidadeEdicao] = useState('');
  const [precoEdicao, setPrecoEdicao] = useState('');
  const [ordenacao, setOrdenacao] = useState(() => {
    return localStorage.getItem('ordenacao') || 'nome-asc';
  });
  const [tema, setTema] = useState(() => {
    return localStorage.getItem('tema') || 'light';
  });
  const [busca, setBusca] = useState('');
  const [mostrarNotificacao, setMostrarNotificacao] = useState(false);
  const [mensagemNotificacao, setMensagemNotificacao] = useState('');

  const api = axios.create({ baseURL: 'http://localhost:3001' });

  useEffect(() => {
    fetchProdutos();
  }, []);

  useEffect(() => {
    document.body.className = tema === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('tema', tema);
  }, [tema]);

  useEffect(() => {
    const handleKeyboard = (e) => {
      if (mostrarModalEdicao || mostrarSobre) return;
      
      if (e.key === 'Enter') {
        e.preventDefault();
        salvarProduto();
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        limparCampos();
      }
      
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        salvarProduto();
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [nome, quantidade, preco, mostrarModalEdicao, mostrarSobre]);

  const toggleTema = () => {
    setTema(tema === 'light' ? 'dark' : 'light');
  };

  const fetchProdutos = async () => {
    try {
      const res = await api.get('/produtos');
      setProdutos(res.data);
    } catch {
      alert('Erro ao buscar produtos');
    }
  };

  const limparCampos = () => {
    setNome('');
    setQuantidade('');
    setPreco('');
    setEditId(null);
  };

  const salvarProduto = async () => {
    if (!nome || !quantidade || !preco) {
      alert('Nome, quantidade e preço são obrigatórios');
      return;
    }

    const dados = {
      nome,
      quantidade: Number(quantidade),
      preco: Number(preco),
    };

    try {
      await api.post('/produtos', dados);
      limparCampos();
      fetchProdutos();
      mostrarNotificacaoSucesso('Produto adicionado com sucesso!');
    } catch {
      alert('Erro ao salvar produto');
    }
  };

  const mostrarNotificacaoSucesso = (mensagem) => {
    setMensagemNotificacao(mensagem);
    setMostrarNotificacao(true);
    setTimeout(() => setMostrarNotificacao(false), 3000);
  };

  const editarProduto = (produto) => {
    setEditId(produto.id);
    setNomeEdicao(produto.nome);
    setQuantidadeEdicao(produto.quantidade);
    setPrecoEdicao(produto.preco);
    setMostrarModalEdicao(true);
  };

  const salvarEdicao = async () => {
    if (!nomeEdicao || !quantidadeEdicao || !precoEdicao) {
      alert('Nome, quantidade e preço são obrigatórios');
      return;
    }

    const dados = {
      nome: nomeEdicao,
      quantidade: Number(quantidadeEdicao),
      preco: Number(precoEdicao),
    };

    try {
      await api.put(`/produtos/${editId}`, dados);
      fecharModalEdicao();
      fetchProdutos();
      mostrarNotificacaoSucesso('Produto atualizado com sucesso!');
    } catch {
      alert('Erro ao atualizar produto');
    }
  };

  const fecharModalEdicao = () => {
    setMostrarModalEdicao(false);
    setEditId(null);
    setNomeEdicao('');
    setQuantidadeEdicao('');
    setPrecoEdicao('');
  };

  const duplicarProduto = (produto) => {
    setNome(produto.nome);
    setQuantidade(produto.quantidade);
    setPreco(produto.preco);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deletarProduto = async (id) => {
    if (window.confirm('Confirma exclusão?')) {
      try {
        await api.delete(`/produtos/${id}`);
        fetchProdutos();
        mostrarNotificacaoSucesso('Produto excluído com sucesso!');
      } catch {
        alert('Erro ao deletar produto');
      }
    }
  };

  const toggleSobre = () => {
    setMostrarSobre(!mostrarSobre);
  };

  const handleOrdenacaoChange = (tipo) => {
    let novaOrdenacao = tipo;
    if (ordenacao === tipo) {
      // Se já está ordenado por esse campo em asc, muda para desc
      if (tipo.endsWith('-asc')) {
        novaOrdenacao = tipo.replace('-asc', '-desc');
      } else {
        novaOrdenacao = tipo.replace('-desc', '-asc');
      }
    }
    setOrdenacao(novaOrdenacao);
    localStorage.setItem('ordenacao', novaOrdenacao);
  };

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    switch (ordenacao) {
      case 'nome-asc':
        return a.nome.localeCompare(b.nome);
      case 'nome-desc':
        return b.nome.localeCompare(a.nome);
      case 'qtd-asc':
        return a.quantidade - b.quantidade;
      case 'qtd-desc':
        return b.quantidade - a.quantidade;
      case 'preco-asc':
        return a.preco - b.preco;
      case 'preco-desc':
        return b.preco - a.preco;
      case 'preco-total-asc':
        return (a.quantidade * a.preco) - (b.quantidade * b.preco);
      case 'preco-total-desc':
        return (b.quantidade * b.preco) - (a.quantidade * a.preco);
      default:
        return 0;
    }
  });

  const valorTotalEstoque = produtos.reduce((total, p) => {
    return total + (p.quantidade * p.preco);
  }, 0);

  const produtosEstoqueBaixo = produtos.filter(p => p.quantidade < 4);

  const scrollParaEstoqueBaixo = () => {
    const primeiroItemBaixo = document.querySelector('.qtd-baixa');
    if (primeiroItemBaixo) {
      primeiroItemBaixo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <>
      <div className="app-container">
        <button className="theme-toggle" onClick={toggleTema} aria-label="Alternar tema">
          {tema === 'light' ? <FaMoon /> : <FaSun />}
        </button>

        {mostrarNotificacao && (
          <div className="notification-success">
            ✓ {mensagemNotificacao}
          </div>
        )}

        <header className="app-header">
          <div className="header-content">
            <img src="/logo.png" alt="Ateliê da Tia Deia" className="logo" />
            <h1 className="app-title">Ateliê da Tia Deia</h1>
            <p className="app-subtitle">Controle de Estoque</p>
          </div>
        </header>

        <main className="main-content">
          <section className="form-section">
            <div className="form-grid">
              <input
                className="input-field"
                placeholder="Nome do produto"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <input
                className="input-field"
                placeholder="Quantidade"
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
              <input
                className="input-field"
                type="number"
                placeholder="Preço (R$)"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
              />
              <button onClick={salvarProduto} className="btn-primary">
                <FaPlus /> Adicionar
              </button>
            </div>
          </section>

          {produtosEstoqueBaixo.length > 0 && (
            <div className="alert-estoque-baixo" onClick={scrollParaEstoqueBaixo}>
              <span className="alert-icon">🔔</span>
              <span>Produtos com estoque baixo: <strong>{produtosEstoqueBaixo.length}</strong> {produtosEstoqueBaixo.length === 1 ? 'item' : 'itens'}</span>
            </div>
          )}

          <div className="search-section">
            <input
              className="search-input"
              placeholder="🔍 Buscar produto por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <section className="table-section">
            <div className="table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th 
                      onClick={() => handleOrdenacaoChange('nome-asc')} 
                      className="sortable"
                    >
                      <span>Nome</span>
                      {ordenacao === 'nome-asc' && <FaSortUp className="sort-icon" />}
                      {ordenacao === 'nome-desc' && <FaSortDown className="sort-icon" />}
                    </th>
                    <th 
                      onClick={() => handleOrdenacaoChange('qtd-asc')} 
                      className="sortable"
                    >
                      <span>Quantidade</span>
                      {ordenacao === 'qtd-asc' && <FaSortUp className="sort-icon" />}
                      {ordenacao === 'qtd-desc' && <FaSortDown className="sort-icon" />}
                    </th>
                    <th 
                      onClick={() => handleOrdenacaoChange('preco-asc')} 
                      className="sortable"
                    >
                      <span>Preço</span>
                      {ordenacao === 'preco-asc' && <FaSortUp className="sort-icon" />}
                      {ordenacao === 'preco-desc' && <FaSortDown className="sort-icon" />}
                    </th>
                    <th 
                      onClick={() => handleOrdenacaoChange('preco-total-asc')} 
                      className="sortable"
                    >
                      <span>Preço Total</span>
                      {ordenacao === 'preco-total-asc' && <FaSortUp className="sort-icon" />}
                      {ordenacao === 'preco-total-desc' && <FaSortDown className="sort-icon" />}
                    </th>
                    <th className="actions-header">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosOrdenados.map((p) => (
                    <tr key={p.id}>
                      <td className="product-name">{p.nome}</td>
                      <td>
                        <span className={p.quantidade < 4 ? 'qtd-baixa' : 'qtd-normal'}>
                          {p.quantidade}
                        </span>
                      </td>
                      <td 
                        className="product-price"
                        title={`Preço unitário: ${Number(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                      >
                        {Number(p.preco).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                      <td className="product-price-total">
                        {Number(p.quantidade * p.preco).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                      <td className="actions-cell">
                        <button onClick={() => editarProduto(p)} className="btn-edit" title="Editar">
                          <FaEdit />
                        </button>
                        <button onClick={() => duplicarProduto(p)} className="btn-duplicate" title="Duplicar">
                          📄
                        </button>
                        <button onClick={() => deletarProduto(p.id)} className="btn-delete" title="Excluir">
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="total-estoque-card">
            <span className="total-label">Valor total do estoque:</span>
            <span className="total-value">
              {valorTotalEstoque.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </div>
        </main>

        <footer className="app-footer">
          <button onClick={toggleSobre} className="btn-about">
            Sobre o Sistema
          </button>
          <div className="footer-info">
            <p>
              Desenvolvido por{' '}
              <a href="https://github.com/MarcosPerdigao" target="_blank" rel="noopener noreferrer">
                Marcos Perdigão
              </a>{' '}
              &{' '}
              <a href="https://github.com/bielwdev" target="_blank" rel="noopener noreferrer">
                Gabriel Victor
              </a>{' '}
              para{' '}
              <a href="https://www.instagram.com/ateliedatiadeia/" target="_blank" rel="noopener noreferrer">
                Ateliê da Tia Deia
              </a>
            </p>
            <p className="cnpj">Andrea Cristina de Oliveira Pires dos Santos - 27.504.827/0001-99</p>
          </div>
        </footer>
      </div>

      {mostrarSobre && (
        <div className="modal-overlay" onClick={toggleSobre}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={toggleSobre}>
              &times;
            </button>
            <h2>Sobre o Sistema</h2>
            <p>
              Este sistema foi desenvolvido para facilitar o controle de estoque do{' '}
              <strong>Ateliê da Tia Deia</strong>.
            </p>
            <p>
              Através dele, é possível adicionar, editar e remover produtos, além de visualizar
              rapidamente os itens com quantidade baixa.
            </p>
            <p>
              O objetivo é proporcionar praticidade no gerenciamento de produtos artesanais,
              ajudando a manter a organização e o controle das vendas e da produção.
            </p>
          </div>
        </div>
      )}

      {mostrarModalEdicao && (
        <div className="modal-overlay" onClick={fecharModalEdicao}>
          <div className="modal-edit" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharModalEdicao}>
              &times;
            </button>
            <h2>Editar Produto</h2>
            <div className="modal-form">
              <div className="modal-field">
                <label>Nome do Produto</label>
                <input
                  className="input-field"
                  placeholder="Nome do produto"
                  value={nomeEdicao}
                  onChange={(e) => setNomeEdicao(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label>Quantidade</label>
                <input
                  className="input-field"
                  placeholder="Quantidade"
                  type="number"
                  value={quantidadeEdicao}
                  onChange={(e) => setQuantidadeEdicao(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label>Preço (R$)</label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Preço (R$)"
                  value={precoEdicao}
                  onChange={(e) => setPrecoEdicao(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button onClick={fecharModalEdicao} className="btn-cancel">
                  Cancelar
                </button>
                <button onClick={salvarEdicao} className="btn-save">
                  <FaEdit /> Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
