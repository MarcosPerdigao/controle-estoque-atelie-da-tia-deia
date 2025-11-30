import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaSortUp, FaSortDown } from 'react-icons/fa';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [editId, setEditId] = useState(null);
  const [mostrarSobre, setMostrarSobre] = useState(false);
  const [ordenacao, setOrdenacao] = useState(() => {
    return localStorage.getItem('ordenacao') || 'nome-asc';
  });

  const api = axios.create({ baseURL: 'http://localhost:3001' });

  useEffect(() => {
    fetchProdutos();
  }, []);

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
      if (editId) {
        await api.put(`/produtos/${editId}`, dados);
      } else {
        await api.post('/produtos', dados);
      }
      limparCampos();
      fetchProdutos();
    } catch {
      alert('Erro ao salvar produto');
    }
  };

  const editarProduto = (produto) => {
    setNome(produto.nome);
    setQuantidade(produto.quantidade);
    setPreco(produto.preco);
    setEditId(produto.id);
  };

  const deletarProduto = async (id) => {
    if (window.confirm('Confirma exclusão?')) {
      try {
        await api.delete(`/produtos/${id}`);
        fetchProdutos();
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

  const produtosOrdenados = [...produtos].sort((a, b) => {
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
      default:
        return 0;
    }
  });

  return (
    <div className="container">
      <h1>
        <img src="/logo.png" alt="" className="logoimg" /> Ateliê da Tia Deia - Controle de Estoque
      </h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          placeholder="Quantidade"
          type="number"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          style={{ marginLeft: 10 }}
        />
        <input
          type="number"
          placeholder="Preço (R$)"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          style={{
            marginLeft: 10,
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button onClick={salvarProduto} className="salvar" style={{ marginLeft: 10 }}>
          {editId ? <FaEdit /> : <FaPlus />} {editId ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>

      <table border="1" width="100%" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th 
              onClick={() => handleOrdenacaoChange('nome-asc')} 
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Nome {ordenacao === 'nome-asc' && <FaSortUp />}{ordenacao === 'nome-desc' && <FaSortDown />}
            </th>
            <th 
              onClick={() => handleOrdenacaoChange('qtd-asc')} 
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Quantidade {ordenacao === 'qtd-asc' && <FaSortUp />}{ordenacao === 'qtd-desc' && <FaSortDown />}
            </th>
            <th 
              onClick={() => handleOrdenacaoChange('preco-asc')} 
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Preço {ordenacao === 'preco-asc' && <FaSortUp />}{ordenacao === 'preco-desc' && <FaSortDown />}
            </th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtosOrdenados.map((p) => (
            <tr key={p.id}>
              <td>{p.nome}</td>
              <td className={p.quantidade < 4 ? 'qtd-baixa' : ''}>{p.quantidade}</td>
              <td>
                {Number(p.preco).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </td>
              <td>
                <button onClick={() => editarProduto(p)} className="editar">
                  <FaEdit /> Editar
                </button>
                <button
                  onClick={() => deletarProduto(p.id)}
                  className="excluir"
                  style={{ marginLeft: 5 }}
                >
                  <FaTrashAlt /> Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarSobre && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={toggleSobre}>&times;</span>
            <h2>Sobre o Sistema</h2>
            <p>Este sistema foi desenvolvido para facilitar o controle de estoque do <strong>Ateliê da Tia Deia</strong>.
              <p>Através dele, é possível adicionar, editar e remover produtos, além de visualizar rapidamente os itens com quantidade baixa.</p>
            </p>
            <p>
              O objetivo é proporcionar praticidade no gerenciamento de produtos artesanais, ajudando a manter a organização e o controle das vendas e da produção.
            </p>
          </div>
        </div>
      )}

      <button onClick={toggleSobre} className="btn-sobre">
        Sobre
      </button>

      <footer className="rodape">
        <p>
          Desenvolvido por <a href='https://github.com/MarcosPerdigao' className="personNames">Marcos Perdigão</a> & <a href="https://github.com/bielwdev" className="personNames">Gabriel Victor </a>para <a href="https://www.instagram.com/ateliedatiadeia/" className="personNames">Ateliê da Tia Deia</a>
        </p>
        <p>Andrea Cristina de Oliveira Pires dos Santos - 27.504.827/0001-99</p>
      </footer>
    </div>
  );
}

export default App;
