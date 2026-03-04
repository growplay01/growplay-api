const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/", (req, res) => {
  res.send("🚀 GrowPlay API funcionando!");
});

/* Criar usuário */

app.post("/users", async (req, res) => {

  const { name, email } = req.body;

  try {

    const result = await pool.query(
      "INSERT INTO users (name,email) VALUES ($1,$2) RETURNING *",
      [name,email]
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao criar usuário"
    });

  }

});

/* Listar usuários */

app.get("/users", async (req, res) => {

  const result = await pool.query(
    "SELECT * FROM users ORDER BY id DESC"
  );

  res.json(result.rows);

});

/* Adicionar pontos */

app.post("/addpoints", async (req, res) => {

  const { id, points } = req.body;

  try {

    const result = await pool.query(
      "UPDATE users SET points = points + $1 WHERE id = $2 RETURNING *",
      [points, id]
    );

    let user = result.rows[0];

    let level = 1;

    if (user.points >= 100) level = 2;
    if (user.points >= 300) level = 3;
    if (user.points >= 600) level = 4;
    if (user.points >= 1000) level = 5;

    await pool.query(
      "UPDATE users SET level = $1 WHERE id = $2",
      [level, id]
    );

    user.level = level;

    res.json(user);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao adicionar pontos"
    });

  }

});

/* Adicionar moedas */

app.post("/addcoins", async (req, res) => {

  const { id, coins } = req.body;

  const result = await pool.query(
    "UPDATE users SET coins = coins + $1 WHERE id = $2 RETURNING *",
    [coins, id]
  );

  res.json(result.rows[0]);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando");
});
