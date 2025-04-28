const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findByEmail, createUser } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET;

// Registro
async function register(req, res) {
  const { nome, email, password, telefone, tipo, foto, resumo } = req.body;
  if (!nome || !email || !password || !tipo)
    return res.status(400).json({ error: 'Dados obrigatórios faltando' });

  const existing = await findByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email já cadastrado' });

  const senhaHash = await bcrypt.hash(password, 10);
  const userId = await createUser({ nome, email, senhaHash, telefone, tipo, foto, resumo });
  res.status(201).json({ message: 'Usuário criado', id: userId });
}

// Login
async function login(req, res) {
  const { email, password } = req.body;
  const user = await findByEmail(email);
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

  const match = await bcrypt.compare(password, user.senha);
  if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });

  // Você pode incluir nome/tipo no token, se quiser
  const token = jwt.sign({ id: user.id, tipo: user.tipo }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
}

module.exports = { register, login };
