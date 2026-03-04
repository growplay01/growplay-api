const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* Conexão com banco */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* Teste da API */

app.get("/", (req, res) => {
  res.send("🚀 GrowPlay API funcionando!");
});

/* Criar usuário */

app.post("/users", async (req, res) => {

  const { name, email } = req.body;

  try {

    const result = await pool.query(
      "INSERT INTO users (name,email) VALUES ($1,$2) RETURNING *",
      [name, email]
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

  try {

    const result = await pool.query(
      "SELECT * FROM users ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao listar usuários"
    });

  }

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

  try {

    const result = await pool.query(
      "UPDATE users SET coins = coins + $1 WHERE id = $2 RETURNING *",
      [coins, id]
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao adicionar moedas"
    });

  }

});

/* MISSÕES */

app.post("/mission", async (req, res) => {

  const { id } = req.body;

  try {

    const userResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    let user = userResult.rows[0];

    const today = new Date().toISOString().slice(0,10);

    let streak = user.streak || 0;

    if (!user.last_mission) {

      streak = 1;

    } else {

      const last = new Date(user.last_mission).toISOString().slice(0,10);

      const diff =
        (new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24);

      if (diff === 1) streak += 1;
      else if (diff > 1) streak = 1;

    }

    const result = await pool.query(
      `UPDATE users
       SET points = points + 100,
           coins = coins + 10,
           streak = $1,
           last_mission = CURRENT_DATE
       WHERE id = $2
       RETURNING *`,
      [streak, id]
    );

    user = result.rows[0];

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
      error: "Erro na missão"
    });

  }

});
/* CONQUISTAS */

if (user.points >= 50) {
  await pool.query(
    "INSERT INTO achievements (user_id, title) VALUES ($1,$2) ON CONFLICT DO NOTHING",
    [id, "Primeira Missão"]
  );
}

if (user.points >= 200) {
  await pool.query(
    "INSERT INTO achievements (user_id, title) VALUES ($1,$2) ON CONFLICT DO NOTHING",
    [id, "Estudante"]
  );
}

if (user.points >= 500) {
  await pool.query(
    "INSERT INTO achievements (user_id, title) VALUES ($1,$2) ON CONFLICT DO NOTHING",
    [id, "Focado"]
  );
}

if (user.points >= 1000) {
  await pool.query(
    "INSERT INTO achievements (user_id, title) VALUES ($1,$2) ON CONFLICT DO NOTHING",
    [id, "Mestre"]
  );
}
    res.json({
      mission:type,
      gained_points:points,
      gained_coins:coins,
      user:user
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro na missão"
    });

  }

});
/* Ranking */

app.get("/ranking", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT id, name, points, level FROM users ORDER BY points DESC LIMIT 10"
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao buscar ranking"
    });

  }

});

/* Iniciar servidor */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta", PORT);
});
