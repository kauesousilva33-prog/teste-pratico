import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { pool } from './database';

const app = express();

const userSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(1, 'O telefone é obrigatório'),
  notificationEnabled: z.boolean()
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Node funcionando');
});

// Criar usuário
app.post('/users', async (req, res) => {
  try {
    const validatedData = userSchema.parse(req.body);
    const { name, email, phone, notificationEnabled } = validatedData;

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, notification_enabled)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone, notificationEnabled]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errors: error.issues.map(issue => issue.message)
      });
    }

    return res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// Listar usuários
app.get('/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users ORDER BY id');
  res.json(result.rows);
});

// Atualizar usuário
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const validatedData = userSchema.parse(req.body);
  const { name, email, phone, notificationEnabled } = validatedData;

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