const util = require('util');
const exec = util.promisify(require('child_process').exec);

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

module.exports = {deployContractWithResourceAccount}