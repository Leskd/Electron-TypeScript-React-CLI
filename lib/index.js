const fs = require('fs-extra');
const inquirer = require('inquirer');
const ora = require('ora');
const download = require('download-git-repo');
const chalk = require('chalk');
const omit = require('omit.js');

const spin = ora('Downloading template');
spin.color = 'yellow';

const questions = [{
  type: 'input',
  name: 'author',
  message: 'Author:',
  default: '',
  validate (val) {
    const validate = !/(\w\s\w)/g.test(val);
    return validate || 'Author cannot contain spaces';
  },
  transformer(val) {
    return val.trim();
  }
}, {
  type: 'input',
  name: 'version',
  message: 'Version:',
  default: '1.0.0',
  validate (val) {
    return true
  },
  transformer(val) {
    return val;
  }
}, {
  type: 'input',
  name: 'description',
  message: 'Description:',
  default: '',
  validate (val) {
    return true;
  },
  transformer(val) {
    return val.trim();
  }
}, {
  type: 'list',
  message: 'License:',
  name: 'license',
  choices: [
    "ISC",
    "MIT"
  ],
  filter: function (val) {
    return val;
  }
}];

async function init(projectName) {
  let answers = null;
  try {
    answers = await initInquirer(projectName);
    await rewritePackageJson(projectName, answers);
  } catch(e) {
    spin.stop();
    console.log(chalk.red(error));
    process.exit();
  }
  spin.stop();
  console.log(chalk.green(`${projectName} init success!`))
  console.log(`
    ${chalk.bgWhite.black('   Run Application  ')}
    ${chalk.yellow(`cd ${projectName}`)}
    ${chalk.yellow('npm install')}
    ${chalk.yellow('npm start')}
  `);
} 

async function rewritePackageJson(projectName, answers) {
  let jsonObject = null;
  try {
    jsonObject = await fs.readJson(`./${projectName}/package.json`);
  } catch (error) {
    console.log(chalk.red(error));
    process.exit();
  };
  Object.keys(answers).forEach(key => {
    jsonObject[key] = answers[key] || '';
  });
  omit(jsonObject, ['homepage', 'bugs', 'repository']);
  try {
    await fs.writeJson(`./${projectName}/package.json`, jsonObject, {
      spaces: '\t',
    });
  } catch (error) {
    console.log(chalk.red(error));
    process.exit();
  };
}

function initInquirer(projectName) {
  return inquirer
  .prompt(questions)
  .then((answers) => {
    spin.start();
    return new Promise((resolve, reject) => {
      download('Leskd/electron-react-typescript', `./${projectName}`, (error) => {
        if (error) {
          console.log(chalk.red('Failed to download repo ' + template + ': ' + error.message.trim()));
          reject(error);
          process.exit();
        };
        resolve(answers);
      });
    })
  })
}

module.exports = (projectName) => {
  return init(projectName);
}
