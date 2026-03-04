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

/* MISSÃO */

app.post("/mission", async (req, res) => {

  try {

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "ID do usuário é obrigatório"
      });
    }

    const user = await pool.query(
      "SELECT * FROM users WHERE id=$1",
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        error: "Usuário não encontrado"
      });
    }

    const points = user.rows[0].points + 50;
    const coins = user.rows[0].coins + 5;
    const streak = (user.rows[0].streak || 0) + 1;

    await pool.query(
      `UPDATE users 
       SET points=$1, coins=$2, streak=$3, last_mission=NOW()
       WHERE id=$4`,
      [points, coins, streak, id]
    );

    res.json({
      message: "Missão concluída",
      points,
      coins,
      streak
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro na missão"
    });

  }

});

    /* LEVEL */

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

    /* CONQUISTAS */

    if (user.points >= 50) {
      await pool.query(
        "INSERT INTO achievements (user_id,title) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [id,"Primeira Missão"]
      );
    }

    if (user.points >= 200) {
      await pool.query(
        "INSERT INTO achievements (user_id,title) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [id,"Estudante"]
      );
    }

    if (user.points >= 500) {
      await pool.query(
        "INSERT INTO achievements (user_id,title) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [id,"Focado"]
      );
    }

    if (user.points >= 1000) {
      await pool.query(
        "INSERT INTO achievements (user_id,title) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [id,"Mestre"]
      );
    }

    res.json(user);

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
      "SELECT id,name,points,level FROM users ORDER BY points DESC LIMIT 10"
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
  console.log("Servidor rodando na porta", PORT);
});
