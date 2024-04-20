require('dotenv').config();
const axios = require('axios');

const callGPTForReview = (commitId, repoName, totalLinesAdded, filesChanged, committerUserId) => {
   return new Promise((resolve, reject) => {
        // Asynchronously send the data to another API gateway endpoint
        const codeReviewEndpoint = process.env.CODE_REVIEW_ENDPOINT;
        const postData = {
            commitId,
            repoName,
            totalLinesAdded,
            filesChanged,
            committerUserId
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

// Helper function to fetch the commit data including the author
const fetchCommitData = async (repoName, commitId) => {
    const commitDataResponse = await axios.get(`https://api.github.com/repos/${repoName}/commits/${commitId}`, {
        headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
    });
    return commitDataResponse.data;
};
  
exports.analyzeCommitChanges = (body) => {
    return new Promise(async(resolve, reject) => {
        try {
            const { after: commitId, ref, repository } = body;
            const repoName = repository.full_name;

            console.log("Repo name:", repoName, "Commit ID:", commitId);
            console.log("References:", ref);
    
            // Check if the push was to the development branch
            if (ref === 'refs/heads/develop') {
                // Fetch commit data including the author's details
                const commitData = await fetchCommitData(repoName, commitId);
    
                const filesChanged = commitData.files;
                let totalLinesAdded = 0;
                let committerUserId = commitData.committer?.login; // Get the committer's user ID
    
                filesChanged.forEach(file => {
                    totalLinesAdded += file.additions;
                });
    
                console.log(`Total lines added: ${totalLinesAdded}`);
                console.log(`Committer User ID: ${committerUserId}`);
    
                // Include the committer's user ID in the review process
                await callGPTForReview(commitId, repoName, totalLinesAdded, filesChanged, committerUserId);
                
                resolve('Webhook received and processed for development branch; data sent to code-review API');
                
            } else {
                // Not the development branch, ignore or log if needed
                resolve('Push not on development branch, webhook ignored');
            }
        } catch(err) {
            console.error('Something went wrong:', err.message);
            reject(err);
        }
    });
}