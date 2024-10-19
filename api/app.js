const express = require("express");

const app = express();

app.use(express.json());

app.listen(5000, () => {
    console.log("Listening on port 5000...");
});

app.get('/', (_, res) => {
    res.status(200).send("Root API page");
});

app.post('/process', (req, res) => {
    const prompt_text = req.body.message;

    let body = {
        "model": "llama3.2",
        "prompt": `Objectively read the following text and identify all truths. Provide them in no more than 10 items in a bulleted list:\n\n${prompt_text}`,
        "stream": false,
        "options": {
            "mirostat_tau": 5.0, // default 5.0
            "temperature": 0.0, // default 0.8
            "tfs_z": 1.0, // default 1.0
            "top_k": 40, // default 40
            "top_p": 0.9, // default 0.9
            // "min_p": 0.0 // default 0.0
        }
    }

    fetch('http://localhost:11434/api/generate', {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    .then(response => {
        if (response.status == 200) return response.json();

        return -1;
    })
    .then(data => {
        if (data === -1) throw new Error("Bad Request");

        const returnedData = {
            response: data.response,
            duration: data.total_duration / (10 ** 9)
        }

        console.log(returnedData);

        res.send(returnedData);
    })
    .catch(err => {
        console.error(err);
        res.end();
    });
});

app.use((req, res) => {
    res.status(404).send({error: "404 Not Found", message: "Endpoint does not exist", path: `${req.path}`});
});
