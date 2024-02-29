@deployment
Feature: Deployment

    Rule: when deploying the smart contract

        Scenario: Deploying smart contract
            Given Undeployed Smart contract
            When Smart contract is
            Then Resource account is created, with expected values