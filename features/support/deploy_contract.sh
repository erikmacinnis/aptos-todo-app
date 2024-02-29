#!/bin/bash
cd move

# Extract the version from the YAML file
address=$(yq e '.profiles.default.account' .aptos/config.yaml)

random_number=$((1000000000 + $RANDOM % 9000000000))

yes yes | aptos move create-resource-account-and-publish-package --seed $random_number --address-name todo_list_addr --profile default --named-addresses source_addr=$address

