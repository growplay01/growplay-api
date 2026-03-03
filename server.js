const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   Conexão com PostgreSQL
========================= */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/* =========================
   Criar tabela automaticamente
========================= */

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        points INTEGER DEFAULT 0,
        coins INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Tabela users pronta");
  } catch (error) {
    console.error("Erro ao criar tabela:", error);
  }
}

createTable();

/* =========================
   Rota teste
========================= */

app.get("/", (req, res) => {
  res.send("🚀 GrowPlay API está funcionando!");
});

/* =========================
   Criar usuário
========================= */

app.post("/users", async (req, res) => {

  const { name, email } = req.body;

  try {

    const result = await pool.query(
      "INSERT INTO users (name, email, points, coins, level) VALUES ($1, $2, 0, 0, 1) RETURNING *",
      [name, email]
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erro ao criar usuário"
    });

  }

});

/* =========================
   Listar usuários
========================= */

app.get("/users", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM users ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erro ao buscar usuários"
    });

  }

});

/* =========================
   Iniciar servidor
========================= */

const PORT = process.env.PORT || 3000;
/* =========================
   Adicionar pontos ao usuário
========================= */

app.post("/add-points", async (req, res) => {

  const { userId, points } = req.body;

  try {

    const result = await pool.query(
      "UPDATE users SET points = points + $1 WHERE id = $2 RETURNING *",
      [points, userId]
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erro ao adicionar pontos"
    });

  }

});
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
