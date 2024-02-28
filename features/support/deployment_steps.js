const {Given, When, Then, setDefaultTimeout} = require('@cucumber/cucumber')
const __ = require('hamjest');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

require('dotenv').config()

const aptos = require('./aptos');

setDefaultTimeout(10000)

function getResourceAccountAddress(inputString) {
    // Regular expression to match the pattern of the address
    const regex = /Do you want to publish this package under the resource account's address (0x[a-fA-F0-9]+)\?/;
    const match = inputString.match(regex);

    // If a match is found, return the address; otherwise, return null
    return match ? match[1] : null;
}

// Deploys the smart contract and waits for the bash script to be done
async function deployContractWithResourceAccount() {
    try {
        const { stdout, stderr } = await exec('./features/support/deploy_contract.sh');
        const resourceAccountAddress = getResourceAccountAddress(stdout)
        return { stdout, stderr, resourceAccountAddress };
    } catch (error) {
        console.error('Error occurred:', error);
        throw error; // Rethrow the error to propagate it to the caller
    }
}

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