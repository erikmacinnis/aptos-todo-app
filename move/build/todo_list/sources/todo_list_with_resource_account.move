// Must be run with aptos move create-resource-account-and-publish-package --seed [seed] --address-name mint_nft --profile default --named-addresses source_addr=[default account's address]

module todo_list_addr::todo_list_with_resource_account {
    use std::string;
    use std::signer;
    use std::vector;
    use std::string::String;

    use aptos_std::simple_map::{Self, SimpleMap};
    
    use aptos_framework::account;
    use aptos_framework::resource_account;
    use aptos_token::token;

    const LEADERBOARD_SIZE: u64 = 10;

    struct ModuleData has key {
        // Storing the signer capability here, so the module can programmatically sign for transactions
        signer_cap: account::SignerCapability,
        create_token_data_params: CreateTokenDataParams,
        todo: Todo,
    }

    struct LeaderboardValue has key, drop, store, copy {
        addr: address,
        num_todos: u64,
    }

    struct Todo has key, store {
        count: u64,
        // List of all tasks
        tasks: vector<Task>,
        // map from address to number of todos a user completed
        completed_task_per_user: SimpleMap<address, u64>,
        // List a tasks that belong to each user
        users_todos: SimpleMap<address, vector<Task>>,
        // list of top ten users who have completed todos
        leaderboard: vector<LeaderboardValue>,
    }

    struct Task has key, drop, store, copy {
        count: u64,
        content: string::String,
        completed: bool,
        completed_by: address,
        creator: address,
    }

    struct CreateTokenDataParams has key, drop, store, copy {
        collection_name: String,
        token_name: String,
        // If zero then infinit supply
        maximum: u64,
        token_uri: String,
        royalty_payee_address: address,
        royalty_points_denominator: u64,
        royalty_points_numerator: u64,
        token_mutate_config: token::TokenMutabilityConfig,
        property_keys: vector<String>,
        property_values: vector<vector<u8>>,
        property_types: vector<String>,
    }

    fun init_module(resource_signer: &signer) {
        let collection_name = string::utf8(b"Todo Collection");
        let collection_uri = string::utf8(b"Collection uri");
        let description = string::utf8(b"Collection of NFTS foe each todo you complete");
        let token_name = string::utf8(b"Move Todo");
        let token_uri = string::utf8(b"https://yellow-magic-possum-182.mypinata.cloud/ipfs/QmPhhGJpEzz5Pq3syoD2H4xJnSX3tnpgMxpWNBC2D8Ktjk");
        let maximum_supply = 0;
        let mutate_setting = vector<bool>[ false, false, false ];

        // Create the nft collection.
        token::create_collection(resource_signer, collection_name, description, collection_uri, maximum_supply, mutate_setting);

        let create_token_data_params = CreateTokenDataParams {
            collection_name: collection_name,
            token_name: token_name,
            maximum: 0,
            token_uri: token_uri,
            royalty_payee_address: signer::address_of(resource_signer),
            royalty_points_denominator: 1,
            royalty_points_numerator: 0,
            // This variable sets if we want to allow mutation for token maximum, uri, royalty, description, and properties.
            // Here we enable mutation for properties by setting the last boolean in the vector to true.
            token_mutate_config: token::create_token_mutability_config(
                &vector<bool>[ false, false, false, false, true ]
            ),
            // We can use property maps to record attributes related to the token.
            // In this example, we are using it to record the receiver's address.
            // We will mutate this field to record the user's address
            // when a user successfully mints a token in the `mint_event_ticket()` function.
            property_keys: vector<String>[string::utf8(b"given_to")],
            property_values: vector<vector<u8>>[b""],
            property_types: vector<String>[ string::utf8(b"address") ],
        };

        let emptyLeaderboardValue = LeaderboardValue{
            addr: @0x1,
            num_todos: 0,
        };
        
        // Creating the leaderboard vector
        let index = 0;
        let leaderboard: vector<LeaderboardValue> = vector::empty();
        loop {
            if (index >= LEADERBOARD_SIZE) break;
            vector::push_back(&mut leaderboard, copy emptyLeaderboardValue);
            index = index + 1;
        };

        //* @source_addr is defined 
        // Retrieve the resource signer's signer capability and store it within the `ModuleData`.
        // Note that by calling `resource_account::retrieve_resource_account_cap` to retrieve the resource account's signer capability,
        // we rotate th resource account's authentication key to 0 and give up our control over the resource account. Before calling this function,
        // the resource account has the same authentication key as the source account so we had control over the resource account.
        let resource_signer_cap = resource_account::retrieve_resource_account_cap(resource_signer, @source_addr);

        move_to(resource_signer, ModuleData {
            signer_cap: resource_signer_cap,
            create_token_data_params: create_token_data_params,
            todo: Todo {
                count: 0,
                tasks: vector::empty(),
                completed_task_per_user: simple_map::create<address, u64>(),
                users_todos: simple_map::create<address, vector<Task>>(),
                leaderboard: leaderboard,
            }
        });
    }

    // #[test_only] // test helper function
    // fun setModuleData(resource: &signer) {
    //     init_module(resource)
    // }

    // Creates a new task and updates the users_todos map and tasks list
    public entry fun create_task(account: &signer, content: string::String) acquires ModuleData {
        let module_data = borrow_global_mut<ModuleData>(@todo_list_addr);
        let todo = &mut module_data.todo;
        // incrementing count
        todo.count = todo.count + 1;
        // creating the new task
        let task = Task {
            count: todo.count,
            content: content,
            completed: false,
            creator: signer::address_of(account),
            completed_by: @0x1,
        };
        // Adding task to tasks list
        vector::push_back(&mut todo.tasks, task);

        let user_todos = &mut todo.users_todos;
        
        let addr = signer::borrow_address(account);
        // Updating the user_todos list
        if (simple_map::contains_key(user_todos, addr)) {
            // Taking existing list and adding the new task
            let user_tasks = simple_map::borrow_mut(user_todos, addr);
            vector::push_back(user_tasks, copy task)
        } else {
            // Setting the value of a list of the single task
            simple_map::add(user_todos, *addr, vector::singleton(copy task))
        };
    }

    // #[test(resource_addr = @0x07f147dc045ecdfd5c5a54f214d02d76b7492bf3f831674ec016e9a0d3f4f83d, user = @0x2)]
    // fun test_create_task(resource_addr: signer, user: signer) acquires ModuleData {
    //     setModuleData(&resource_addr);

    //     create_task(&user, string::utf8(b"Test"));
    // }

    fun updateLeaderboard(todo: &mut Todo, num_todos: u64, addr: &address) {
        // Getting the leaderboard
        let leaderboard = &mut todo.leaderboard;
        // Ensuring your num Todos is at least in the Leaderboard size
        if (num_todos > vector::borrow(leaderboard, LEADERBOARD_SIZE-1).num_todos) {
            // Treating 100 as null
            let old_standing = 100;
            let new_standing = 100;
            let index = 0;
            // Getting the old standing and the new standing
            loop {
                // Doing set interations
                if (index >= LEADERBOARD_SIZE) break;
                // Get current leader
                let leader = vector::borrow(leaderboard, index);
                // If the current leader is the caller
                if (leader.addr == *addr) {
                    // Finds their old standing
                    old_standing = index;
                    // If new standing didn't change then no standing changed
                    if (new_standing == 100) {
                        new_standing = index;
                    };
                    break
                };
                // Moving up to current index 
                // Ensuring the user has a greater amount then the rest and a previous standing wasn't set
                if (num_todos > leader.num_todos && new_standing == 100) {
                    new_standing = index;
                };
                // incrementing the index
                index = index + 1;
            };
            // Checking if there is a change in the leaderboard
            if (old_standing != new_standing) {
                // Setting the new leaderboard value
                let new_leader_value = LeaderboardValue {
                    addr: *addr,
                    num_todos: num_todos,
                };
                
                let index = 0;
                let new_leaderboard = &mut vector::empty<LeaderboardValue>();
                // Creating a new leaderboard
                loop {
                    // Doing set interations
                    if (index >= LEADERBOARD_SIZE) break;
                    // At the new standing we insert the users todo
                    if (index == new_standing) {
                        vector::push_back(new_leaderboard, new_leader_value);
                    } else {
                        // Before new standing or after the old standing 
                        // Basically copying the array for these values
                        if (index < new_standing || index > old_standing) {
                            vector::push_back(new_leaderboard, *vector::borrow(leaderboard, index));
                        } else {
                            // In between the new standing and the old standing
                            // index >= old_standing && index > new_standing
                            vector::push_back(new_leaderboard, *vector::borrow(leaderboard, (index-1)));
                        };
                    };
                    index = index + 1;
                };
                todo.leaderboard = *new_leaderboard;
            // old_leaderboard value should at least be set to something other than 100
            // Otherwise there is a bug in the logic
            } else {
                let user_leaderboard_value = vector::borrow_mut(leaderboard, new_standing);
                user_leaderboard_value.num_todos = user_leaderboard_value.num_todos + 1;
            }
        };
    }

    // Checks a task, updates completed_task_pre_user map, and updating the leaderboard
    public entry fun check_task(receiver: &signer, index: u64) acquires ModuleData {
        let module_data = borrow_global_mut<ModuleData>(@todo_list_addr);

        let token_data_params = module_data.create_token_data_params;

        let todo = &mut module_data.todo;
        // Getting the task at given index
        let task = vector::borrow_mut<Task>(&mut todo.tasks, index);

        // Create a signer of the resource account from the signer capability stored in this module.
        // Using a resource account and storing its signer capability within the module allows the module to programmatically
        // sign transactions on behalf of the module.
        let resource_signer = account::create_signer_with_capability(&module_data.signer_cap);

         // Create a token data id to specify the token to be minted.
         // Updating the task.content field
        let token_data_id = token::create_tokendata(
            &resource_signer,
            token_data_params.collection_name,
            task.content,
            task.content,
            token_data_params.maximum,
            token_data_params.token_uri,
            token_data_params.royalty_payee_address,
            token_data_params.royalty_points_denominator,
            token_data_params.royalty_points_numerator,
            token_data_params.token_mutate_config,
            token_data_params.property_keys,
            token_data_params.property_values,
            token_data_params.property_types,
        );

        // Miting the NFT with the unique description
        let token_id = token::mint_token(&resource_signer, token_data_id, 1);
        token::direct_transfer(&resource_signer, receiver, token_id, 1);

        // Setting completed to true
        task.completed = true;
        // Setting the completed_by to function caller
        let addr = signer::borrow_address(receiver);
        task.completed_by = *addr;
        // Setting default num_todos to 1
        // This is used to determine the number todos a user has completed
        let num_todos = 1;
        let completed_task_per_user = &mut todo.completed_task_per_user;
        // Updating the completed task per user
        if (simple_map::contains_key(completed_task_per_user, addr)) {
            // Incrementing the value by 1 
            let total_completed = simple_map::borrow_mut(completed_task_per_user, addr);
            // Setting num_todos to be used later as well for the leaderboard
            num_todos = *total_completed + 1;
            // Reseting the value of the reference
            *total_completed = num_todos;
        } else {
            // Setting a keypair in the map of addr to 1 completed task
            simple_map::add(completed_task_per_user, *addr, 1);
        };

        updateLeaderboard(todo, num_todos, addr)
    }   

}