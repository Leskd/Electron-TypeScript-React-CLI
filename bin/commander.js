#!/usr/bin/env node
const path = require('path');
const program = require('commander');
const packageJson = require('../package.json');

const resolvePath = (relativePath) => path.resolve(__dirname, relativePath);
const DEFAULT_PROJECT_NAME = 'Electron-typeScript-React';
let projectName = DEFAULT_PROJECT_NAME;

program
  .version(packageJson.version)
  .usage('build-app <command> [options]')
  .option('-v --version', 'output the version number')
  .on('--help', function() {
    console.log('');
    console.log('Examples:');
  });

  program
  .command('init <name>')
  .description('generate a new project')
  .alias('i')
  .action(function(name) {
    if (name) {
      projectName = name;
    };
    require(resolvePath('../lib'))(projectName);
  });

  program.parse(process.argv);
