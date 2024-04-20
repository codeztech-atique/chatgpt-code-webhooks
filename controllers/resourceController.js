const config = require('config');
const service = require('../services/resource');

exports.fetchAndForwardCommitData = async(req, res) => {
    try {
        const analyzeCommits = await service.analyzeCommitChanges(req.body);
        res.status(config.get('success').statusCode).send(analyzeCommits);
    } catch(err) {
        res.send(config.get('error').statusCode).send({
            error: err
        })
    }
}

