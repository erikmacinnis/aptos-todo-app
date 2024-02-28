Feature: Create Task

    Rule: Creating Task updates the module data Resource

        Scenario: Creating a task
            Given: Freshly deployed Smart contract
            When: Task with content "first task" is created
            Then: Task should be created and Added to the list and mapping

        Scenario: Creating a task without any content
            Given: Freshly deployed Smart contract
            When: Task with content "" is created
            Then: Task should be created and Added to the list and mapping

        Scenario: Creating a task second task
            Given: Smart contract with 1 task already created
            When: Task with content "Second Task" is created
            Then: Task should be created and Added to the list and mapping along with first task

