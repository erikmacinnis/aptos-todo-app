Feature: Create Task
    Scenario: Creating the first task
        Given freshly deployed Smart contract
        When task with content "first task" is created by the same user
        Then task with content "first task" should be added to the list and mapping
    
    Scenario: Creating a second task
        Given deployed contract with a single task with content "first task"
        When task with content "second task" is created by the same user
        Then two tasks with content "first task" and "second task" should be in the list and mapping under the same user
    
    Scenario: Creating a third task with another user
        Given deployed contract with two task created by the same user
        When task with content "third task" is created by another user
        Then task with content "third task" should be in the list and mapping

    Scenario: Create a task without data
        Given freshly deployed Smart contract
        When task with no content is created by another user
        Then task with no content should be in the list and mapping

    


