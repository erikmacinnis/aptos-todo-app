Feature: Create Task
    Scenario: Creating a task
        Given Freshly deployed Smart contract
        When Task with content "first task" is created
        Then Task with content "first task" should be created and Added to the list and mapping


