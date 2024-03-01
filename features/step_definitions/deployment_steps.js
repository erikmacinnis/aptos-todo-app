const {Given, When, Then, setDefaultTimeout} = require('@cucumber/cucumber')
const __ = require('hamjest');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const {aptos} = require('../support/aptos');

const {deployContractWithResourceAccount} = require('../support/deployContract');

setDefaultTimeout(10000)

Given('Undeployed Smart contract', async function () {
    return true;
});

When('Smart contract is', async function () {
    // Write code here that turns the phrase above into concrete actions
    const {resourceAccountAddress} = await deployContractWithResourceAccount()

    this.moduleData = await aptos.getAccountResource(
        {
            accountAddress: resourceAccountAddress,
            resourceType:`${resourceAccountAddress}::todo_list_with_resource_account::ModuleData`
        }
    );

    return true;
});

Then('Resource account is created, with expected values', function () {
    // Write code here that turns the phrase above into concrete actions
    console.log(this.moduleData)

    const createTokenDataParams = this.moduleData.create_token_data_params
    __.assertThat(createTokenDataParams.collection_name, __.equalTo('Todo Collection'))
    __.assertThat(createTokenDataParams.token_name, __.equalTo('Move Todo'))

    const todo = this.moduleData.todo
    __.assertThat(todo.leaderboard.length, __.equalTo(10))

    return true;
});