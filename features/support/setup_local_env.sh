#!/bin/bash
cd move

aptos node run-local-testnet --with-indexer-api &

sleep 20

rm -rf ./.aptos/config.yaml

echo "local " | aptos init