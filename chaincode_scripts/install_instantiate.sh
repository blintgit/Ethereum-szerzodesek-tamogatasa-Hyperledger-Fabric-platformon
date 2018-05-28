#!/bin/bash

CC_NAME=$1
export CHANNEL_NAME=mychannel

peer chaincode install -n $CC_NAME -v 1.0 -l node -p /opt/gopath/src/github.com/chaincode/vendingMachine2/
#waiting for chaincode to install, then instantiate
sleep=5
peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n $CC_NAME -l node -v 1.0 -c '{"Args":["init"]}' -P "OR ('Org1MSP.member','Org2MSP.member')"





