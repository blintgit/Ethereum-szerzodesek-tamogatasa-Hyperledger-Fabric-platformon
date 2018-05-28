#!/bin/bash

CC_NAME=$1
QUERY_TYPE=$2
QUERY_PARAM1=$3
QUERY_PARAM2=$4
peer chaincode query -C $CHANNEL_NAME -n $CC_NAME -c '{"Args":["'"$QUERY_TYPE"'", "'"$QUERY_PARAM1"'", "'"$QUERY_PARAM2"'"]}'
