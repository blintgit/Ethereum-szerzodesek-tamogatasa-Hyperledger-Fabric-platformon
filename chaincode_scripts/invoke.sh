#!/bin/bash
CC_NAME=$1
INVOKE_TYPE=$2
PARAM1=$3
PARAM2=$4

peer chaincode invoke -o orderer.example.com:7050  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem  -C $CHANNEL_NAME -n $CC_NAME -c '{"Args":["'"$INVOKE_TYPE"'", "'"$PARAM1"'", "'"$PARAM2"'"]}'
