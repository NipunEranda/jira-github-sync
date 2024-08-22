const express = require('express');
const app = express();
const port = 3000;
const system = require('./system');
const config = require('./config');

const server = app.listen(port, async () => {
    try {
        const args = process.argv.slice(2);
        const custom_jira = args[0];
        const custom_github = args[1];

        await system.start(custom_jira, custom_github);
    } catch (e) {
        console.log(e);
    }
});

process.on('SIGTERM', async () => {
    server.close();
});
process.kill(process.pid, 'SIGTERM');