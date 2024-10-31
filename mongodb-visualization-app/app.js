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

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
