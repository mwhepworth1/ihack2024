const express = require("express");

const app = express();

app.listen(5000, () => {
    console.log("Listening on port 5000...");
});

app.get('/', (_, res) => {
    res.send("Root API page");
});

app.use((req, res) => {
    res.status(404).send({error: "404 Not Found", message: "Endpoint does not exist", path: `${req.path}`});
});
