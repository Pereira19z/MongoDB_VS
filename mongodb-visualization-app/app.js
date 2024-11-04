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
  usuario: String,
  id_usuario: String,
  cpf: String,
  nome: String,
  rg: String,
  senha: String,

  cadastro: {
    servico_site: String,
    email_site: String,
    telefone_site: String,
  },

  problema: {
    nome_site: String,
    problema: String,
    dificuldade: String,
  },

  feedback: {
    nome_site: String,
    melhorias: String,
    nt_funcionamento: Number,
    nt_facilidade: Number,
    nt_dificuldade: Number,
  },
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
  const {
    usuario,
    id_usuario,
    cpf,
    nome,
    rg,
    senha,
    servico_site,
    email_site,
    telefone_site,
    nome_site_problema,
    problema,
    dificuldade,
    nome_site_feedback,
    melhorias,
    nt_funcionamento,
    nt_facilidade,
    nt_dificuldade,
  } = req.body;

  const novoUsuario = new Usuario({
    usuario,
    id_usuario,
    cpf,
    nome,
    rg,
    senha,
    cadastro: {
      servico_site,
      email_site,
      telefone_site,
    },
    problema: {
      nome_site: nome_site_problema,
      problema,
      dificuldade,
    },
    feedback: {
      nome_site: nome_site_feedback,
      melhorias,
      nt_funcionamento: parseInt(nt_funcionamento),
      nt_facilidade: parseInt(nt_facilidade),
      nt_dificuldade: parseInt(nt_dificuldade),
    },
  });

  try {
    await novoUsuario.save();
    res.redirect('/');
  } catch (err) {
    console.error('Erro ao adicionar usuário:', err);
    res.redirect('/?message=Erro ao adicionar usuário');
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
  const {
    usuario,
    id_usuario,
    cpf,
    nome,
    rg,
    senha,
    servico_site,
    email_site,
    telefone_site,
    nome_site_problema,
    problema,
    dificuldade,
    nome_site_feedback,
    melhorias,
    nt_funcionamento,
    nt_facilidade,
    nt_dificuldade,
  } = req.body;

  const updates = {
    usuario,
    id_usuario,
    cpf,
    nome,
    rg,
    cadastro: {
      servico_site,
      email_site,
      telefone_site,
    },
    problema: {
      nome_site: nome_site_problema,
      problema,
      dificuldade,
    },
    feedback: {
      nome_site: nome_site_feedback,
      melhorias,
      nt_funcionamento: parseInt(nt_funcionamento),
      nt_facilidade: parseInt(nt_facilidade),
      nt_dificuldade: parseInt(nt_dificuldade),
    },
  };

  if (senha) {
    updates.senha = senha;
  }

  try {
    await Usuario.findByIdAndUpdate(req.params.id, updates);
    res.redirect('/');
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.redirect('/?message=Erro ao atualizar usuário');
  }
});

// Rota para excluir um usuário
app.post('/delete/:id', async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    res.redirect('/?message=Erro ao excluir usuário');
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
