@check_task
Feature: Check Task

    Rule: Checking Task updates the module data Resource

        Scenario: Checking a task
            Given deployed smart contract with 1 task with content "new task"
            When check task at position 0
            Then task at position 0 should be set to complete
            And nft should be minted to the user
            And user should be in position 0 in leaderboard
            And user should have a 1 task in the completed task mapping

        Scenario: Checking a task at position that doens't exist
            Given Freshly deployed Smart contract
            When Check task at position 0
            Then This call should error out

        Scenario: Creating a task without any content
            Given Deployed smart contract with
            When Task with content "" is created
            Then Task should be created and Added to the list and mapping

