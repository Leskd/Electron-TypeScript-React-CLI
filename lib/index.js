const fs = require('fs-extra');
const inquirer = require('inquirer');
const ora = require('ora');
const download = require('download-git-repo');
const chalk = require('chalk');
const omit = require('omit.js');

const spin = ora('Downloading project, waiting please');
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
  let anwsers = null;
  try {
    anwsers = await initInquirer(projectName);
    await rewritePackageJson(projectName, anwsers);
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

async function rewritePackageJson(projectName, anwsers) {
  let jsonObject = null;
  try {
    jsonObject = await fs.readJson(`./${projectName}/package.json`);
  } catch (error) {
    console.log(chalk.red(error));
    process.exit();
  };
  Object.keys(anwsers).forEach(key => {
    jsonObject[key] = anwsers[key] || '';
  });
  omit(jsonObject, ['homepage', 'bugs', 'repository']);
  try {
    await fs.writeJson(`./${projectName}/package.json`, JSON.stringify(jsonObject, null, 2), 'utf8');
  } catch (error) {
    console.log(chalk.red(error));
    process.exit();
  };
}

function initInquirer(projectName) {
  return inquirer
  .prompt(questions)
  .then((anwsers) => {
    spin.start();
    return new Promise((resolve, reject) => {
      download('Leskd/electron-react-typescript', `./${projectName}`, (error) => {
        if (error) {
          console.log(chalk.red(error));
          reject(error);
          process.exit();
        };
        resolve(anwsers);
      });
    })
  })
}

module.exports = (projectName) => {
  return init(projectName);
}
