const {Given, When, Then, AfterAll} = require('@cucumber/cucumber')
const __ = require('hamjest');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const {aptos} = require('../support/aptos');

const {deployContractWithResourceAccount} = require('../support/deployContract');

const {getAccountKey} = require('../support/helpers.js');

Given('freshly deployed Smart contract', async function () {
    // Write code here that turns the phrase above into concrete actions
    const {resourceAccountAddress} = await deployContractWithResourceAccount()

    this.resourceAccountAddress = resourceAccountAddress

    return true;
});

When('task with content {string} is created by the same user', async function (content) {
    // Executing the create task function
    const { stdout, stderr } = await exec(`cd move && aptos move run --function-id ${this.resourceAccountAddress}::todo_list_with_resource_account::create_task --args string:'${content}' --assume-yes`);

    return true;
});

Then('task with content {string} should be added to the list and mapping', async function (content) {

    this.moduleData = await aptos.getAccountResource(
        {
            accountAddress: this.resourceAccountAddress,
            resourceType:`${this.resourceAccountAddress}::todo_list_with_resource_account::ModuleData`
        }
    );
    
    const accountAddr = getAccountKey()
    // This is how the mapping is represented in the move module
    // data: [
    //     {
    //       key: '0xd2812c6aaa752a89aa91db545832872460615ad8a801e67058c01166d8d4ed11',
    //       value: [Array]
    //     }
    //   ]
    const userTodoKeyPair = this.moduleData.todo.users_todos.data[0]
    
    __.assertThat(userTodoKeyPair.key, __.equalTo(accountAddr))
    __.assertThat(userTodoKeyPair.value[0].content, __.equalTo(content))

    const firstTask = this.moduleData.todo.tasks[0]

    __.assertThat(firstTask.content, __.equalTo(content))
    __.assertThat(firstTask.count, __.equalTo("1"))

    return true;
});

Given('deployed contract with a single task with content {string}', async function (content) {
    // Write code here that turns the phrase above into concrete actions
    const {resourceAccountAddress} = await deployContractWithResourceAccount()

    this.resourceAccountAddress = resourceAccountAddress

    const { stdout, stderr } = await exec(`cd move && aptos move run --function-id ${this.resourceAccountAddress}::todo_list_with_resource_account::create_task --args string:'${content}' --assume-yes`);

    return true
});

Then('two tasks with content {string} and {string} should be in the list and mapping under the same user', async function (content1, content2) {
    // Write code here that turns the phrase above into concrete actions
    this.moduleData = await aptos.getAccountResource(
        {
            accountAddress: this.resourceAccountAddress,
            resourceType:`${this.resourceAccountAddress}::todo_list_with_resource_account::ModuleData`
        }
    );

    const accountAddr = getAccountKey()
    // This is how the mapping is represented in the move module
    // data: [
    //     {
    //       key: '0xd2812c6aaa752a89aa91db545832872460615ad8a801e67058c01166d8d4ed11',
    //       value: [Array]
    //     }
    //   ]
    const userTodoKeyPair = this.moduleData.todo.users_todos.data[0]
    console.log(userTodoKeyPair.value[1].content)
    
    __.assertThat(userTodoKeyPair.key, __.equalTo(accountAddr))
    __.assertThat(userTodoKeyPair.value[0].content, __.equalTo(content1))
    __.assertThat(userTodoKeyPair.value[1].content, __.equalTo(content2))

    const firstTask = this.moduleData.todo.tasks[0]
    const secondTask = this.moduleData.todo.tasks[1]

    __.assertThat(firstTask.content, __.equalTo(content1))
    __.assertThat(secondTask.content, __.equalTo(content2))
    __.assertThat(firstTask.count, __.equalTo("1"))
    __.assertThat(secondTask.count, __.equalTo("2"))

    return true;
});

Given('deployed contract with two task created by the same user', async function () {
    // Write code here that turns the phrase above into concrete actions
    const {resourceAccountAddress} = await deployContractWithResourceAccount()

    this.resourceAccountAddress = resourceAccountAddress

    await exec(`cd move && aptos move run --function-id ${this.resourceAccountAddress}::todo_list_with_resource_account::create_task --args string:'first task' --assume-yes`);

    await exec(`cd move && aptos move run --function-id ${this.resourceAccountAddress}::todo_list_with_resource_account::create_task --args string:'second task' --assume-yes`);

    return true;
});

When('task with content {string} is created by another user', async function (content) {
    // Write code here that turns the phrase above into concrete actions
    await exec('./features/support/setup_new_user.sh 1');
    await exec(`cd move1 && aptos move run --function-id ${this.resourceAccountAddress}::todo_list_with_resource_account::create_task --args string:'${content}' --assume-yes`)

    return true
});

Then('task with content {string} should be in the list and mapping', async function (content) {
    // Write code here that turns the phrase above into concrete actions
    this.moduleData = await aptos.getAccountResource(
        {
            accountAddress: this.resourceAccountAddress,
            resourceType:`${this.resourceAccountAddress}::todo_list_with_resource_account::ModuleData`
        }
    );

    const accountAddr = getAccountKey('move1/.aptos/config.yaml')

    const userTodoKeyPair = this.moduleData.todo.users_todos.data[1]
    
    __.assertThat(userTodoKeyPair.key, __.equalTo(accountAddr))
    __.assertThat(userTodoKeyPair.value[0].content, __.equalTo(content))

    const thirdTask = this.moduleData.todo.tasks[2]

    __.assertThat(thirdTask.content, __.equalTo(content))
    __.assertThat(thirdTask.count, __.equalTo("3"))

    return true;
});

When('task with no content is created by another user', async function () {
    // Write code here that turns the phrase above into concrete actions
    const { stdout, stderr } = await exec(`cd move && aptos move run --function-id ${this.resourceAccountAddress}::todo_list_with_resource_account::create_task --args string:'' --assume-yes`);
    return true;
});

Then('task with no content should be in the list and mapping', async function () {
    // Write code here that turns the phrase above into concrete actions
    this.moduleData = await aptos.getAccountResource(
        {
            accountAddress: this.resourceAccountAddress,
            resourceType:`${this.resourceAccountAddress}::todo_list_with_resource_account::ModuleData`
        }
    );
    
    const accountAddr = getAccountKey()
    // This is how the mapping is represented in the move module
    // data: [
    //     {
    //       key: '0xd2812c6aaa752a89aa91db545832872460615ad8a801e67058c01166d8d4ed11',
    //       value: [Array]
    //     }
    //   ]
    const userTodoKeyPair = this.moduleData.todo.users_todos.data[0]
    
    __.assertThat(userTodoKeyPair.key, __.equalTo(accountAddr))
    __.assertThat(userTodoKeyPair.value[0].content, __.equalTo(''))

    const firstTask = this.moduleData.todo.tasks[0]

    __.assertThat(firstTask.content, __.equalTo(''))

    return true;
});

AfterAll(async function(){
    await exec('./features/support/remove_extra_users.sh')
})