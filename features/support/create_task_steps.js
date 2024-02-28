const {Given, When, Then, setDefaultTimeout} = require('@cucumber/cucumber')
const __ = require('hamjest');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

