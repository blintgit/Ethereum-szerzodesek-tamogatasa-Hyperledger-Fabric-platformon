#!/bin/bash

sudo git clone https://github.com/ethereumjs/ethereumjs-vm.git
cd ethereumjs-vm
sudo npm install 

mv node_modules node_modules_old
mkdir node_modules 
cd node_modules_old

sudo mv -t ../node_modules \
abstract-leveldown/        elliptic/                  hmac-drbg/                 level-ws/                  prr/              \
async/                     errno/                     inherits/                  levelup/                   readable-stream/  \
async-eventemitter/        ethereum-common/           is-hex-prefixed/           lodash/                    rlp/              \
bip66/                     ethereumjs-account/        isarray/                   ltgt/                      rustbn.js/        \
bn.js/                     ethereumjs-block/          js-sha3/                   memdown/                   safe-buffer/      \
brorand/                   ethereumjs-tx/             keccak/                    merkle-patricia-tree/      secp256k1/        \
browserify-sha3/           ethereumjs-util/           keccakjs/                  minimalistic-assert/       semaphore/        \
core-util-is/              ethjs-util/                level-codec/               minimalistic-crypto-utils/ strip-hex-prefix/ \
create-hash/               functional-red-black-tree/ level-errors/              object-keys/               util-deprecate/   \
deferred-leveldown/        hash.js/                   level-iterator-stream/     process-nextick-args/      xtend/

cd ..
rm -rf node_modules_old

