const {Given, When, Then, AfterAll} = require('@cucumber/cucumber')
const __ = require('hamjest');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { request, gql } = require("graphql-request");

const {AccountAddress, IndexerClient} = require('@aptos-labs/ts-sdk')

const {aptos, aptosConfig} = require('../support/aptos');

const {deployContractWithResourceAccount} = require('../support/deployContract');

const {getAccountKey} = require('../support/helpers.js');

const collectionName = 'Todo Collection'

Given('deployed smart contract with {int} task with content {string}', async function (numTask, content) {
    // Write code here that turns the phrase above into concrete actions
    const {resourceAccountAddress} = await deployContractWithResourceAccount()

    this.resourceAccountAddress = resourceAccountAddress

    for (let i = 0; i < numTask; i++) {
        const { stdout, stderr } = await exec(`cd move && aptos move run --function-id ${this.resourceAccountAddress}::todo_list_with_resource_account::create_task --args string:'${content}' --assume-yes`);
    }

    return true;
});

When('check task at position {int}', async function (position) {
    const { stdout, stderr } = await exec(`cd move && aptos move run --function-id ${this.resourceAccountAddress}::todo_list_with_resource_account::check_task --args u64:'${position}' --assume-yes`);
    console.log(stdout)
    return true;
});

Then('task at position {int} should be set to complete', async function (position) {
    // Write code here that turns the phrase above into concrete actions
    this.moduleData = await aptos.getAccountResource(
        {
            accountAddress: this.resourceAccountAddress,
            resourceType:`${this.resourceAccountAddress}::todo_list_with_resource_account::ModuleData`
        }
    );

    const task = this.moduleData.todo.tasks[position]

    __.assertThat(task.completed, __.equalTo(true))
    return true;
});

const indexerUrl =
  "http://127.0.0.1:8090/";

const tokensOwnedByAccountQueryDoc = gql`
  query TokensOwnedByAccount($owner_address: String, $offset: Int) {
    current_token_ownerships(
      where: {
        owner_address: { _eq: $owner_address }
        amount: { _gt: "0" }
        table_type: { _eq: "0x3::token::TokenStore" }
      }
      order_by: { last_transaction_version: desc }
      offset: $offset
    ) {
      creator_address
      collection_name
    }
  }
`;


async function fetchTokensOwnedByAccount(userAccountAddress) {
  // TODO: Do pagination.
  const variables = { owner_address: userAccountAddress, offset: 0 };
  return await request({
    url: indexerUrl,
    document: tokensOwnedByAccountQueryDoc,
    variables,
  });
}

Then('nft should be minted to the user', async function () {
    const accountAddr = getAccountKey()

    console.log(accountAddr)

    const aptosAddr = AccountAddress.fromStringStrict(accountAddr)

    console.log(aptosAddr)

    aptos.getAccountResources

    // const userDigitalAssets = await aptos.getCollectionData({
    //     creatorAddress: this.resourceAccountAddress,
    //     collectionName: collectionName,
    // });

    const userDigitalAssets = await fetchTokensOwnedByAccount(accountAddr)

    console.log(userDigitalAssets)

    return true;
});
    
Then('user should be in position {int} in leaderboard', async function (int) {

    return true;
});

Then('user should have a {int} task in the completed task mapping', async function (int) {

    return true;
});