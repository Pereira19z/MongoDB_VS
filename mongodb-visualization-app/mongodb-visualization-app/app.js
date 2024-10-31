const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Conectar ao MongoDB com tratamento de erro
mongoose.connect('mongodb://localhost:27017/Challenge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

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
  data_criacao: { type: Date, default: Date.now },
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

// Configurar a visualização
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rota para visualizar todos os usuários
app.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find({});
    res.render('index', { usuarios });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar usuários');
  }
});

// Rota para buscar usuários
app.post('/search', async (req, res) => {
  try {
    const { searchQuery } = req.body;
    const usuarios = await Usuario.find({ nome: { $regex: searchQuery, $options: 'i' } });
    res.render('index', { usuarios });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar usuários');
  }
});

// Rota para adicionar um novo usuário
app.post('/add', async (req, res) => {
  try {
    const { cpf, nome, rg, senha, email, telefone, rua, numero, cidade, estado, cep, data_nascimento } = req.body;
    const usuario = new Usuario({
      cpf,
      nome,
      rg,
      senha,
      email,
      telefone,
      endereco: { rua, numero, cidade, estado, cep },
      data_nascimento: new Date(data_nascimento),
    });
    await usuario.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar usuário');
  }
});

// Rota para editar um usuário
app.get('/edit/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).send('Usuário não encontrado');
    }
    res.render('edit', { usuario });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar usuário para edição');
  }
});

// Rota para atualizar um usuário
app.post('/update/:id', async (req, res) => {
  try {
    const { cpf, nome, rg, senha, email, telefone, rua, numero, cidade, estado, cep, data_nascimento } = req.body;
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, {
      cpf,
      nome,
      rg,
      senha,
      email,
      telefone,
      endereco: { rua, numero, cidade, estado, cep },
      data_nascimento: new Date(data_nascimento),
    }, { new: true });
    
    if (!usuario) {
      return res.status(404).send('Usuário não encontrado');
    }
    
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar usuário');
  }
});

// Rota para excluir um usuário
app.post('/delete/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).send('Usuário não encontrado');
    }
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir usuário');
  }
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Algo deu errado!');
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
