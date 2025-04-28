
const db = require('../config/db');

async function findByEmail(email) {
  const [rows] = await db.query(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
  );
  return rows[0];
}

async function createUser({ nome, email, senhaHash, telefone, tipo, foto, resumo }) {
  const [result] = await db.query(
    `INSERT INTO usuarios
       (nome, email, senha, telefone, tipo, foto, resumo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nome, email, senhaHash, telefone, tipo, foto, resumo]
  );
  return result.insertId;
}

module.exports = { findByEmail, createUser };
