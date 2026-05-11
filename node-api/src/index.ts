import express from 'express';
import cors from 'cors';
import { pool } from './database';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Node funcionando');
});

// Criar usuário
app.post('/users', async (req, res) => {
  const { name, email, phone, notificationEnabled } = req.body;

  const result = await pool.query(
    `INSERT INTO users (name, email, phone, notification_enabled)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, phone, notificationEnabled]
  );

  res.json(result.rows[0]);
});

// Listar usuários
app.get('/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users ORDER BY id');
  res.json(result.rows);
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});