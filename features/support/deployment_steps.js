const {Given, When, Then, setDefaultTimeout} = require('@cucumber/cucumber')
const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

require('dotenv').config()

const { Account, Ed25519PrivateKey, RawTransaction, FixedBytes, TypeTagU8, TypeTagVector, ChainId, TransactionPayloadEntryFunction, EntryFunction } = require("@aptos-labs/ts-sdk");

const aptos = require('./aptos')

const accountStartBal = 1_000_000_000

setDefaultTimeout(10000)

async function getNewAccount() {
    const account = Account.generate()
    await aptos.fundAccount({
        accountAddress: account.accountAddress,
        amount: accountStartBal,
    })

    return account
}

async function getAccount() {
    const derivationPath = process.env.DERIVATION_PATH
    const seedPhrase = process.env.MNEMONIC_PHRASE

    const privKey = await Ed25519PrivateKey.fromDerivationPath(derivationPath, seedPhrase)
    const account = await Account.fromPrivateKey({privateKey: privKey})

    await aptos.fundAccount({
        accountAddress: account.accountAddress,
        amount: accountStartBal,
    })

    return account
}

async function getModuleBytecode() {
    const filePath = path.join(__dirname, '../../move/build/todo_list/bytecode_modules/todo_list_with_resource_account.mv');

    try {
        // Read the contents of the binary file asynchronously
        const data = fs.readFileSync(filePath);
        const hexString = data.toString('hex');
        // return hexString
        return [hexString]
        // const hexArray = Array.from(data).map(byte => byte.toString(16).padStart(2, '0'));
        // const hexArray = Array.from(data).map(byte => parseInt(byte, 16));
        // return [hexArray];
        // return hexArray
    } catch (err) {
        console.error(`Error reading file: ${err.message}`);
        return null;
    }
}

async function getMetadataBytes() {
    const filePath = path.join(__dirname, '../../move/build/todo_list/package-metadata.bcs')
    try {
        // Read the contents of the binary file asynchronously
        const data = fs.readFileSync(filePath);
        // const hexArray = Array.from(data).map(byte => byte.toString(16).padStart(2, '0'));
        // const hexArray = Array.from(data).map(byte => parseInt(byte, 16));
        // return hexArray
        const hexString = data.toString('hex');
        // const hexValue = `0x${hexString}`;
        // return hexValue;
        return hexString
    } catch (err) {
        console.error(`Error reading file: ${err.message}`);
        return null;
    }
}

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
    // Write code here that turns the phrase above into concrete actions
    const {resourceAccountAddress} = await deployContractWithResourceAccount()

    const moduleData = await aptos.getAccountResource(
        {
            accountAddress: resourceAccountAddress,
            resourceType:`${resourceAccountAddress}::todo_list_with_resource_account::ModuleData`
        }
    );

    console.log(moduleData)
    return 'pending';
});

When('Smart contract is', function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

Then('Resource account is created, with expected values', function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

// Given('Nothing', async function () {
//     const moduleBytecode = await getModuleBytecode()
//     console.log(moduleBytecode)
//     const metadataBytes = await getMetadataBytes()
//     console.log(metadataBytes)

//     const account = await getAccount()

//     console.log(account.accountAddress.toString())

//     const publishTx = await aptos.publishPackageTransaction({
//         account: account.accountAddress,
//         metadataBytes: metadataBytes,
//         moduleBytecode: moduleBytecode,
//     })

//     const publishTxSubmit = await aptos.signAndSubmitTransaction({
//         signer: account,
//         transaction: publishTx,
//     })

//     await aptos.waitForTransaction({transactionHash: publishTxSubmit.hash})

//     console.log(publishTxSubmit)

//     // Write code here that turns the phrase above into concrete actions
//     return true;
// });