const {Given, When, Then, setDefaultTimeout} = require('@cucumber/cucumber')
const __ = require('hamjest');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const aptos = require('../support/aptos');

const {deployContractWithResourceAccount} = require('../support/deployContract');

Given('Freshly deployed Smart contract', async function () {
    // Write code here that turns the phrase above into concrete actions
    const {resourceAccountAddress} = await deployContractWithResourceAccount()

    this.resourceAccountAddress = resourceAccountAddress

    console.log(this.resourceAccountAddress)

    return true;
});

When('Task with content {string} is created', async function (content) {
    // Executing the create task function
    const { stdout, stderr } = await exec(`cd move && aptos move run --function-id ${this.resourceAccountAddress}::todo_list_with_resource_account::create_task --args string:'${content}' --assume-yes`);

    return true;
});

Then('Task with content {string} should be created and Added to the list and mapping', async function (content) {

    this.moduleData = await aptos.getAccountResource(
        {
            accountAddress: this.resourceAccountAddress,
            resourceType:`${this.resourceAccountAddress}::todo_list_with_resource_account::ModuleData`
        }
    );

    const firstTask = this.moduleData.todo.tasks[0]

    __.assertThat(firstTask.content, __.equalTo(content))
    __.assertThat(firstTask.count, __.equalTo("1"))

    return true;
});