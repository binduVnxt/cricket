const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
// accept json object as request and parse it
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
//ALL API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

//POST API
app.post("/players/", async (request, response) => {
  // get json input details
  const playerDetails = request.body;
  // deStructure jsonObject data
  const { player_name, jersey_number, role } = playerDetails;
  //Insert query with json input details
  const postQuery = `
    INSERT INTO cricket_team(player_name,jersey_number,role)
    values('${player_name}',
           '${jersey_number}',
           '${role}');`;
  //Run the insert query
  const playerResponse = await db.run(postQuery);
  //get the primary key of the newly inserted row
  const playerInserted = playerResponse.lastID;
  response.send("Player Added to Team");
  //send inserted data primary key as response
  //response.send({ playerInserted: playerInserted });
});

// GET API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

//UPDATE API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `
    UPDATE cricket_team
    SET 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE player_id = ${playerId};`;

  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//DELETE API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE FROM cricket_team where player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.export = app;
