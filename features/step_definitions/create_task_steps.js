const {Given, When, Then, setDefaultTimeout} = require('@cucumber/cucumber')
const __ = require('hamjest');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { Account, RawTransaction, EntryFunction, TransactionPayloadEntryFunction, ModuleId, Identifier, TypeTagVector, TypeTagU8, MoveString, ChainId } = require("@aptos-labs/ts-sdk");

const aptos = require('../support/aptos');

const {deployContractWithResourceAccount} = require('../support/deployContract');

const todoListModuleName = 'todo_list_with_resource_account'
const createTaskFunName = 'create_task'

Given('Freshly deployed Smart contract', async function () {
    // Write code here that turns the phrase above into concrete actions
    const {resourceAccountAddress} = await deployContractWithResourceAccount()

    this.resourceAccountAddress = resourceAccountAddress

    console.log(this.resourceAccountAddress)

    return true;
});

When('Task with content {string} is created', async function (content) {

    const { stdout, stderr } = await exec(`cd move && aptos move run --function-id ${this.resourceAccountAddress}::todo_list_with_resource_account::create_task --args string:'${content}' --assume-yes`);

    // this.alice = Account.generate()

    // await aptos.faucet.fundAccount({
    //     accountAddress: this.alice.accountAddress,
    //     amount: 100_000_000,
    // })

    // const moduleId = new ModuleId(
    //     this.resourceAccountAddress,
    //     todoListModuleName,
    // )

    // const functionName = new Identifier(createTaskFunName)

    // const createTaskFun = new EntryFunction(
    //     moduleId,
    //     functionName,
    //     [
    //         new TypeTagVector(new TypeTagU8()),
    //     ],
    //     [
    //         new MoveString(content),
    //     ],
    // )

    // const rawCreateTaskTx = new RawTransaction(
    //     this.alice.accountAddress,
    //     BigInt(1),
    //     new TransactionPayloadEntryFunction(createTaskFun),
    //     BigInt(100_000_000),
    //     BigInt(1000),
    //     BigInt(60),
    //     new ChainId(4),
    // )

    // const simpleCreateTaskTx = {
    //     rawTransaction: rawCreateTaskTx,
    //     feePayerAddress: this.alice.accountAddress,
    // }

    // const response = await aptos.signAndSubmitTransaction({
    //     signer: this.alice,
    //     transaction: simpleCreateTaskTx,
    // })

    // await aptos.waitForTransaction({transactionHash:response.hash});



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