#!/bin/bash
move="move$1"

rm -rf $move

mkdir $move

cd $move

echo "local " | aptos init

