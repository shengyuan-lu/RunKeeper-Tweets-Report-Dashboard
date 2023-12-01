#!/bin/zsh

echo "Starting Website ..."
tsc --p tsconfig.json

live-server .

