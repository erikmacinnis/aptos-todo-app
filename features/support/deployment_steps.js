const {Given, When, Then} = require('@cucumber/cucumber')
const fs = require('fs');
const path = require('path');
require('dotenv').config()

const { Account, Ed25519PrivateKey, RawTransaction, FixedBytes, TypeTagU8, TypeTagVector, ChainId, TransactionPayloadEntryFunction, EntryFunction } = require("@aptos-labs/ts-sdk");

const aptos = require('./aptos')

const accountStartBal = 1_000_000_000

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
        return hexString
        // return [hexString]
        // const hexArray = Array.from(data).map(byte => byte.toString(16).padStart(2, '0'));
        // const hexArray = Array.from(data).map(byte => parseInt(byte, 16));
        // return [hexArray];
        return hexArray
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

Given('Nothing', async function () {
    const moduleBytecode = await getModuleBytecode()
    console.log(moduleBytecode)
    const metadataBytes = await getMetadataBytes()
    console.log(metadataBytes)

    const account = await getAccount()

    // console.log(account.accountAddress.toString())

    // const publishTx = await aptos.publishPackageTransaction({
    //     account: account.accountAddress,
    //     metadataBytes: metadataBytes,
    //     moduleBytecode: moduleBytecode,
    // })

    // const publishTxSubmit = await aptos.signAndSubmitTransaction({
    //     signer: account,
    //     transaction: publishTx,
    // })

    // await aptos.waitForTransaction({transactionHash: publishTxSubmit.hash})

    

    const entryFun = new EntryFunction(
        '0x0000000000000000000000000000000000000000000000000000000000000001::resource_account',
        'create_resource_account_and_publish_package',
        [
            new TypeTagVector(new TypeTagU8()),
            new TypeTagVector(new TypeTagU8()),
            new TypeTagVector(new TypeTagVector(new TypeTagU8())),
        ],
        [
            new FixedBytes(new Uint8Array([1, 2, 3])),
            new FixedBytes(metadataBytes),
            [new FixedBytes(moduleBytecode)]
        ],
    )  

    const rawTx = new RawTransaction(
        account.accountAddress,
        BigInt(1),
        new TransactionPayloadEntryFunction(entryFun),
        BigInt(100_000_000),
        BigInt(1000),
        BigInt(60),
        new ChainId(4),
        )

    const simpleTx = {
        rawTransaction: rawTx,
        feePayerAddress: account.accountAddress,
    }

    // const transaction = {
    //     data : {
    //         function:`0x0000000000000000000000000000000000000000000000000000000000000001::resource_account::create_resource_account_and_publish_package`,
    //         functionArguments:[
    //             [1,2,3],
    //             metadataBytes,
    //             moduleBytecode,
    //         ]
    //     }
    // }

    const publishTxSubmit = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction: simpleTx,
    })

    await aptos.waitForTransaction({transactionHash:publishTxSubmit.hash});

    console.log(publishTxSubmit)



    // Write code here that turns the phrase above into concrete actions
    return true;
});

When('Smart contract was initialized', function () {
    // Write code here that turns the phrase above into concrete actions
    return true;
});
Then('Resource account is created, with expected values', function () {
    // Write code here that turns the phrase above into concrete actions
    return true;
});