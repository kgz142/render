import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import cors from 'cors';
import axios from 'axios'; // Importa axios

// Configurações do MongoDB
const uri = "mongodb+srv://kgz142:kgzMongoDBpass=40028922@kgzcluster.clu7w.mongodb.net/?retryWrites=true&w=majority&appName=kgzCluster";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Nome do banco de dados e das coleções
const dbName = 'chatbot';
const collectionName = 'conversas';
const loginCollectionName = 'logins'; // Nova coleção para armazenar logins

// Configura o servidor Express
const app = express();
const port = 3000;

// Middleware para parsing de JSON
app.use(express.json());

// Configura o middleware CORS
app.use(cors()); // Permite requisições de qualquer origem

// Função para conectar ao MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB Atlas com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar com MongoDB Atlas:', error);
    process.exit(1); // Encerra o processo com código de erro
  }
}

// Endpoint de login para armazenar IP e geolocalização
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username e password são obrigatórios');
  }

  try {
    // Captura o IP usando a API Ipify
    const ipifyResponse = await axios.get('https://api.ipify.org?format=json');
    const ip = ipifyResponse.data.ip;

    // Chama a API Whois Lookup para obter localização com base no IP
    const geoResponse = await axios.get(`https://ipwhois.app/json/${ip}`);
    const { city, region: state, country } = geoResponse.data; // Obtém cidade, estado e país

    // Armazena o login no MongoDB
    const db = client.db(dbName);
    const loginCollection = db.collection(loginCollectionName);

    const loginData = {
      username,
      ip,
      city,
      state,
      country,
      timestamp: new Date(), // Data e hora do login
    };

    // Insere os dados de login na coleção
    const resultado = await loginCollection.insertOne(loginData);

    res.status(201).send(`Login registrado com o ID: ${resultado.insertedId}`);
  } catch (error) {
    console.error('Erro ao registrar login:', error);
    res.status(500).send('Erro ao registrar login');
  }
});

// Endpoint para adicionar uma conversa
app.post('/api/conversas', async (req, res) => {
  const { usuario, mensagem, resposta } = req.body;

  if (!usuario || !mensagem || !resposta) {
    return res.status(400).send('Usuário, mensagem e resposta são obrigatórios');
  }

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  try {
    const resultado = await collection.insertOne({ usuario, mensagem, resposta, timestamp: new Date() });
    res.status(201).send(`Conversa registrada com o ID: ${resultado.insertedId}`);
  } catch (error) {
    console.error('Erro ao registrar conversa:', error);
    res.status(500).send('Erro ao registrar conversa');
  }
});

// Iniciar o servidor e conectar ao MongoDB
connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Servidor ouvindo na porta ${port}`);
  });
});

// Fechar a conexão quando o processo for encerrado
process.on('SIGINT', async () => {
  await client.close();
  process.exit();
});
