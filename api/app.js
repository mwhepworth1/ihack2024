const express = require("express");
require('dotenv').config();

const app = express();

app.use(express.json({ limit: '5mb' }));

app.listen(5000, () => {
    console.log("Listening on port 5000...");
});

app.get('/', (_, res) => {
    res.status(200).send("Root API page");
});

app.post('/process', (req, res) => {
    const prompt_text = req.body.message;
    const custom_instructions = (req.body.custom_instructions) ? req.body.custom_instructions : '';
    // let date = Date.now();
    // console.log(date);
    // return res.status(200).send({response: `${date}`});


    async function run(model, input) {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/e475088c8c03b7b243b887361172c942/ai/run/${model}`,
            {
                headers: { Authorization: "Bearer " + process.env.CF_API_KEY },
                method: "POST",
                body: JSON.stringify(input),
            }
        );
        const result = await response.json();
        return result;
    }
    console.time('CF AI Time');
    run("@cf/meta/llama-3.1-8b-instruct-fast", {
        messages: [
            {
                role: "system",
                content: `
                You are an objective assistant. You are to obey all instructions given to you. 
                You are to read the following text and identify all truths. 
                Provide them in no more than 10 items in a bulleted list using only one asterisk as the bullet point like so: 
                * Fact 1 
                * Fact 2 
                * Fact 3. 
                Ignore anything unrelated to the bulk of the text. Shorten names and make each truth short and concise.` + custom_instructions,
            },
            {
                role: "user",
                content: prompt_text,
            },
        ],
        temperature: 0,
        top_p: 0.5,
        top_k: 10,
    }).then(response => {
        console.warn(response);
        console.timeEnd('CF AI Time');
        if (response.success == true) return response.result;
        if (response.errors[0].code == 3036) return -2;

        return -1;
    })
    .then(data => {
        if (data === -1) throw new Error("Bad Request");
        if (data === -2) throw new Error("Out of Cloudflare AI credits.")

        const returnedData = {
            response: data.response,
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
