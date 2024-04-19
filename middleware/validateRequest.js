const chalk = require("chalk");

exports.validate = (req, res, next) => {
    var error = '';
    if (req.body.commitId === undefined || req.body.commitId === '') {
      console.log(chalk.red('commitId is missing'));
      error += "commitId, "
    } if (req.body.repository === undefined || req.body.repository === '') {
      console.log(chalk.red('repository is missing'));
      error += "repository, "
    } if (error !== '') {
        res.status(400).send({
          status: 400,
          message: error + ' is required !!!'
        });
    } else {
        next();
    }
}