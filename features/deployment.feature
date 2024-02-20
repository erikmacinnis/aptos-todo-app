Feature: Deployment

    The owner of the smart contract deploys it.
    Scenario: Smart contract is deployed.
        Given Nothing
        When Smart contract was initialized
        Then Resource account is created, with expected values