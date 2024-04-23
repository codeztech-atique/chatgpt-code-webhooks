require('dotenv').config();

const AWS = require('aws-sdk');
const axios = require('axios');

AWS.config.update({
    region: process.env.REGION, // replace with your region
});

const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const callGPTForReview =  (commitId, repoName, totalLinesAdded, filesChanged, committerUserId) => {
    return new Promise((resolve, reject) => {
        const queueUrl = process.env.SQS_QUEUE_URL;
        const postData = JSON.stringify({
            commitId,
            repoName,
            totalLinesAdded,
            filesChanged,
            committerUserId
        });

        console.log("Sending to SQS queue:", postData);

        const params = {
            MessageBody: postData,
            QueueUrl: queueUrl
        };

        sqs.sendMessage(params, function(err, data) {
            if (err) {
                console.error('Error sending data to SQS:', err);
                reject('Failed to send data to SQS. Error: ' + err.message);
            } else {
                console.log('Data sent to SQS:', data.MessageId);
                resolve('Webhook received and processed for development branch; data sent to SQS.');
            }
        });
    });
}

// Helper function to fetch the commit data including the author
const fetchCommitData = async (repoName, commitId) => {
    const commitDataResponse = await axios.get(`https://api.github.com/repos/${repoName}/commits/${commitId}`, {
        headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
    });
    return commitDataResponse.data;
};
  
exports.analyzeCommitChanges = async (body) => {
    try {
        const repoName = body.repository.full_name;
        const ref = body.ref;
        console.log("Repo name:", repoName, "References:", ref);

        if (ref === 'refs/heads/develop') {
            const lastCommitId = body.after; // This should be the ID of the last commit in the push
            console.log("Commit ID:", lastCommitId);

            if (!lastCommitId) {
                throw new Error('No commit ID found in the webhook payload');
            }

            const commitData = await fetchCommitData(repoName, lastCommitId);
            const filesChanged = commitData.files;
            let totalLinesAdded = 0;
            let committerUserId = commitData.committer?.login;

            filesChanged.forEach(file => {
                totalLinesAdded += file.additions;
            });

            console.log(`Total lines added: ${totalLinesAdded}`);
            console.log(`Committer User ID: ${committerUserId}`);

            await callGPTForReview(lastCommitId, repoName, totalLinesAdded, filesChanged, committerUserId);
            return 'Webhook received and processed for development branch; data sent to code-review API';
        } else {
            return 'Push not on development branch, webhook ignored';
        }
    } catch (err) {
        console.error('Something went wrong:', err);
        throw new Error(err.message);
    }
};
