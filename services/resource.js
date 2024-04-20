require('dotenv').config();
const axios = require('axios');

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
                
                // Optionally trigger further actions here
                resolve('Webhook received and processed for development branch')
            } else {
                // Not the development branch, ignore or log if needed
                reject('Push not on development branch, webhook ignored')
            }
        } catch(err) {
    
        }
    })   
}