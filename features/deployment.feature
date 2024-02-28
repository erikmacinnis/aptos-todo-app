Feature: Deployment

    Rule: when deploying the smart contract

        Scenario: Deploying smart contract
            Given Undeployed Smart contract
            When Smart contract is
            Then Resource account is created, with expected values

        Scenario: Creating a task
            Given: Freshly deployed Smart contract
            When: Task with content "first task" is created
            Then: Task should be created and Added to the list and mapping