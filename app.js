const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const playersQuery = `
    SELECT
      *
    FROM 
      cricket_team;   
    `;

  let playersList = await db.all(playersQuery);
  response.send(
    playersList.map((eachItem) => convertDbObjectToResponseObject(eachItem))
  );
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const addPlayerQuery = `
    INSERT INTO 
       cricket_team(player_name,jersey_number,role)
    VALUES 
    (
       '${playerName}',
        ${jerseyNumber},
        '${role}'
    ) `;

  const newPlayer = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playerQuery = `
    SELECT 
        *
    FROM 
    cricket_team
    WHERE player_id = ${playerId};    `;

  const playerResult = await db.get(playerQuery);
  response.send(convertDbObjectToResponseObject(playerResult));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const playerQuery = `
    UPDATE cricket_team
    SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'; `;

  const playerResult = await db.run(playerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM 
      cricket_team
  WHERE player_id = ${playerId};`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
