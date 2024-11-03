const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/Challenge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir o esquema e modelo para o Usuario
const usuarioSchema = new mongoose.Schema({
  cpf: String,
  nome: String,
  rg: String,
  senha: String,
  email: String,
  telefone: String,
  endereco: {
    rua: String,
    numero: Number,
    cidade: String,
    estado: String,
    cep: String,
  },
  data_nascimento: Date,
  data_criacao: Date,
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

// Configurar a visualização
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rota para visualizar todos os usuários
app.get('/', async (req, res) => {
  const usuarios = await Usuario.find({});
  res.render('index', { usuarios });
});

// Rota para buscar usuários
app.post('/search', async (req, res) => {
  const { searchQuery } = req.body;
  const usuarios = await Usuario.find({ nome: { $regex: searchQuery, $options: 'i' } });
  res.render('index', { usuarios });
});

// Rota para adicionar um novo usuário
app.post('/add', async (req, res) => {
  const { cpf, nome, rg, senha, email, telefone, rua, numero, cidade, estado, cep, data_nascimento } = req.body;
  const novoUsuario = new Usuario({
    cpf,
    nome,
    rg,
    senha,
    email,
    telefone,
    endereco: { rua, numero, cidade, estado, cep },
    data_nascimento,
    data_criacao: new Date(),
  });

  try {
    await novoUsuario.save();
    res.redirect('/'); // Redireciona para a página inicial após adicionar o usuário
  } catch (err) {
    console.error('Erro ao adicionar usuário:', err);
    res.redirect('/?message=Erro ao adicionar usuário'); // Redireciona com uma mensagem de erro
  }
});

// Rota para mostrar o formulário de edição
app.get('/edit/:id', async (req, res) => {
  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) {
    return res.status(404).send('Usuário não encontrado');
  }
  res.render('edit', { usuario });
});

// Rota para atualizar o usuário
app.post('/edit/:id', async (req, res) => {
  const { cpf, nome, rg, senha, email, telefone, rua, numero, cidade, estado, cep, data_nascimento } = req.body;
  const updates = {
    cpf,
    nome,
    rg,
    email,
    telefone,
    endereco: { rua, numero, cidade, estado, cep },
    data_nascimento,
  };

  if (senha) {
    updates.senha = senha; // Atualiza a senha apenas se foi fornecida
  }

  try {
    await Usuario.findByIdAndUpdate(req.params.id, updates);
    res.redirect('/'); // Redireciona para a página inicial após editar o usuário
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.redirect('/?message=Erro ao atualizar usuário'); // Redireciona com uma mensagem de erro
  }
});

// Rota para excluir um usuário
app.post('/delete/:id', async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.redirect('/'); // Redireciona para a página inicial após excluir o usuário
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    res.redirect('/?message=Erro ao excluir usuário'); // Redireciona com uma mensagem de erro
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
