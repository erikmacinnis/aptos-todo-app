Feature: Check Task

    Rule: Checking Task updates the module data Resource

        Scenario: Checking a task
            Given: Deployed smart contract with 1 task created
            When: Check task at position 0
            Then: Task should be set to complete
            And: Nft should be minted to the user
            And: Caller should be first in the leaderboard
            And: Users should have a single completed task

        Scenario: Checking a task at position that doens't exist
            Given: Freshly deployed Smart contract
            When: Check task at position 0
            Then: This call should error out

        Scenario: Creating a task without any content
            Given: Deployed smart contract with
            When: Task with content "" is created
            Then: Task should be created and Added to the list and mapping

