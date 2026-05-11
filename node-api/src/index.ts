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

// Atualizar usuário
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, notificationEnabled } = req.body;

  const result = await pool.query(
    `UPDATE users
     SET name = $1,
         email = $2,
         phone = $3,
         notification_enabled = $4,
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [name, email, phone, notificationEnabled, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  res.json(result.rows[0]);
});

// Remover usuário
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  res.json({
    message: 'Usuário removido com sucesso',
    user: result.rows[0]
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});