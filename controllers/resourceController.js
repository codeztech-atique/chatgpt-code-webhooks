const config = require('config');
const service = require('../services/resource');

exports.fetchAndForwardCommitData = async(req, res) => {
    try {
        const analyzeCommits = await service.analyzeCommitChanges(req.body);
        res.status(config.get('success').statusCode).send(analyzeCommits);
    } catch(err) {
        console.error("Error processing request:", err);
        // Corrected to use status() correctly before sending the error response
        res.status(config.get('error').statusCode).send({
            error: err.message  // It's better to send err.message to avoid sending sensitive error data
        });
    }
}

