# Run the application
- **npm install**
- **npm start**

# Code-Webhooks-Bot Part 1 API Description
Fetch and Forward commit data. This API endpoint will receive webhook calls from GitHub whenever there is a push to the development branch. It will extract the commit ID and calculate the number of lines of code added.


### Functionality
#### 1. Receive Webhook Calls
Automatically triggered by GitHub upon any push to the development branch, this endpoint captures important data such as the commit ID and the files changed.

#### 2. Fetch and Forward Commit Data
Utilizes the GitHub API to fetch detailed commit information, including the number of lines added or modified. This data is then prepared and forwarded to Part 2 for code analysis.

### Technical Components
- **GitHub Webhook Integration**: Configured to listen for `push` events specifically on the development branch.
- **Express Server Setup**: Built with Node.js and Express, this server efficiently handles incoming POST requests from GitHub.
- **Environment Variable Management**: Uses environment variables to manage sensitive information like GitHub tokens securely.

### Workflow Integration
- **Data Extraction**: Extracts and analyzes commit details directly from the webhook payload.
- **Seamless Transition to Part 2**: Forwards the relevant data to Part 2, ensuring a smooth data flow between the two parts of the application.

### Benefits
- **Automation**: Automates the initial steps of the code review process by capturing and analyzing every push to the development branch.
- **Efficiency**: Reduces manual overhead by preprocessing webhook data and directly forwarding it for detailed review.
- **Improved Workflow**: Enhances the development workflow by integrating real-time data processing, which helps in faster turnaround for code reviews.


# API Endpoint URL
https://dz7c1y8ewf.execute-api.us-west-1.amazonaws.com/production/api
