require('dotenv').config();
const axios = require('axios');

const callGPTForReview = (commitId, repoName, totalLinesAdded, filesChanged) => {
   return new Promise((resolve, reject) => {
        // Asynchronously send the data to another API gateway endpoint
        const codeReviewEndpoint = 'https://7hz4z79x7i.execute-api.us-west-1.amazonaws.com/production/api/code-review';
        const postData = {
            commitId,
            repoName,
            totalLinesAdded,
            filesChanged
        };

        axios.post(codeReviewEndpoint, postData, {
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            console.log('Data sent to code review API:', response.data);
            resolve('Webhook received and processed for development branch; data sent to code-review API.');
        }).catch(err => {
            console.error('Error sending data to code review API:', err);
            reject('Failed to send data to code-review API.');
        });
   })
}

exports.analyzeCommitChanges = (body) => {
    return new Promise(async(resolve, reject) => {
        try {
            const { after: commitId, ref, repository } = body;
            const repoName = repository.full_name;

            console.log("Repo name:", repoName, commitId);
            console.log("References:", ref);
    
            // Check if the push was to the development branch
            if (ref === 'refs/heads/develop') {
                // Fetch commit data from GitHub API
                const commitData = await axios.get(`https://api.github.com/repos/${repoName}/commits/${commitId}`, {
                    headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
                });
    
                const filesChanged = commitData.data.files;
                let totalLinesAdded = 0;
    
                filesChanged.forEach(file => {
                    totalLinesAdded += file.additions;
                });
    
                console.log(`Total lines added: ${totalLinesAdded}`);

                resolve('Webhook received and processed for development branch; data sent to code-review API');
                
                await callGPTForReview(commitId, repoName, totalLinesAdded, filesChanged);
                

            } else {
                // Not the development branch, ignore or log if needed
                resolve('Push not on development branch, webhook ignored')
            }
        } catch(err) {
            reject('Something went wrong - '+err);
        }
    })   
}