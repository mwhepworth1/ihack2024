const express = require("express");

const app = express();

app.use(express.json({ limit: '1mb' }));

app.listen(5000, () => {
    console.log("Listening on port 5000...");
});

app.get('/', (_, res) => {
    res.status(200).send("Root API page");
});

app.post('/process', (req, res) => {
    const prompt_text = req.body.message;
    const custom_instructions = (req.body.custom_instructions) ? req.body.custom_instructions : '';
    
    fetch('http://localhost:11434/api/generate', {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "model": "llama3.2",
            "prompt": `Follow my instructions exactly. Not following my instructions will result in a bad score.
            Objectively read the following text and identify all truths. Ignore anything unrelated to the bulk of the text.
            Do not give broad answers, rather focus on important details from within the analyzed text. Do not make any summaries,
            rather provide facts that would be useful for me to go and use to research further. Make sure your answer is devoid of all bias and opinion.
            Pick the most important ten facts and include them in a bulleted list of ten items using only one asterisk as the bullet point like so:\n
            * Fact 1
            * Fact 2
            * Fact 3
            The more detail you provide, the better your score will be.\n${custom_instructions}:\n\n${prompt_text}`,
            "stream": false,
            "options": {
                "mirostat_tau": 5.0, // default 5.0
                "temperature": 0.0, // default 0.8
                "tfs_z": 1.0, // default 1.0
                "top_k": 40, // default 40
                "top_p": 0.9, // default 0.9
                // "min_p": 0.0 // default 0.0
            }
        })
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
