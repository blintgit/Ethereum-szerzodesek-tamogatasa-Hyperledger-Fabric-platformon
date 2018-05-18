/*
# Csonka Bálint
# M1IHRM
*/

const shim = require('fabric-shim');
const util = require('util');

var async = require('./ethereumjs-vm/node_modules/async')
var Account = require('./ethereumjs-vm/node_modules/ethereumjs-account')
var VM = require('./ethereumjs-vm/index.js')
var Transaction = require('./ethereumjs-vm/node_modules/ethereumjs-tx')
var Trie = require('./ethereumjs-vm/node_modules/merkle-patricia-tree')
var rlp = require('./ethereumjs-vm/node_modules/rlp')
var utils = require('./ethereumjs-vm/node_modules/ethereumjs-util')

// Az Ethereum Merkle patricia Trie pélányosítása
var stateTrie = new Trie()
// Egy új VM példány létrehozása
var vm = new VM({state: stateTrie})

// import the key pair
var keyPair = require('./key-pair')
// A létrehozott contract address változója
var createdAddress
// Nonce futó számláló
var nonce = 0

var Chaincode = class {
  async Init(stub) {
    console.info('========= VendingMachine Init =========');
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let args = ret.params;

    if (args.length != 0) {
      return shim.error('Incorrect number of arguments. Expecting 0');
    }

    function setup (cb) {
      var publicKeyBuf = Buffer.from(keyPair.publicKey, 'hex')
      var address = utils.pubToAddress(publicKeyBuf, true)
      var account = new Account()
      account.balance = '0xf00000000000000001'
      console.log('address deploying contract: ' + address.toString('hex'))
      stateTrie.put(address, account.serialize(), cb)
    }

    var vendingMachineContract = {
      nonce: '0x00',
      gasPrice: '0x09184e72a000',
      gasLimit: '0xF4240',
      data: '0x6060604052341561000f57600080fd5b60008060003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550600a600160006001815260200190815260200160002081905550600460016000600281526020019081526020016000208190555060026001600060038152602001908152602001600020819055506106aa806100b06000396000f300606060405260043610610078576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680636833a77c1461007d5780636db33d5a146100a05780639fc71b31146100d7578063a514bf8914610112578063c237d39214610149578063eedc966a14610196575b600080fd5b341561008857600080fd5b61009e60048080359060200190919050506101e3565b005b34156100ab57600080fd5b6100c16004808035906020019091905050610229565b6040518082815260200191505060405180910390f35b34156100e257600080fd5b6100f86004808035906020019091905050610241565b604051808215151515815260200191505060405180910390f35b341561011d57600080fd5b6101336004808035906020019091905050610601565b6040518082815260200191505060405180910390f35b341561015457600080fd5b610180600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190505061061e565b6040518082815260200191505060405180910390f35b34156101a157600080fd5b6101cd600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610666565b6040518082815260200191505060405180910390f35b806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555050565b60016020528060005260406000206000915090505481565b600060018214801561026757506000600160006001815260200190815260200160002054115b80156102b2575060016000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410155b1561037f576001600060018152602001908152602001600020600081548092919060019003919050555060016000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555060016000803073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282540192505081905550600190506105fc565b6002821480156103a357506000600160006002815260200190815260200160002054115b80156103ee575060026000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410155b156104bb576001600060028152602001908152602001600020600081548092919060019003919050555060026000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555060026000803073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282540192505081905550600190506105fc565b6003821480156104df57506000600160006003815260200190815260200160002054115b801561052a575060046000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410155b156105f7576001600060038152602001908152602001600020600081548092919060019003919050555060046000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555060046000803073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282540192505081905550600190506105fc565b600090505b919050565b600060016000838152602001908152602001600020549050919050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b600060205280600052604060002060009150905054815600a165627a7a72305820d91228e0ad5f36d1340fcb6b2822c6f8da4d1763a0f631a46900df5809a21c310029'
    }

    module.exports = vendingMachineContract

    function runTx (raw, cb) {
      var tx = new Transaction(raw)
      tx.sign(Buffer.from(keyPair.secretKey, 'hex'))
      console.log('----Tranzakció futtatása (VendingMachine)-----')
      vm.runTx({
        tx: tx
      }, function (err, results) {
        //console.log('gas used: ' + results.gasUsed.toString())
        //console.log('error:' + results.vm.exception)
        //console.log('EEerror:' + results.vm.exceptionError)
        //console.log('returned: ' + results.vm.return.toString('hex'))
        if (results.createdAddress) {
          createdAddress = results.createdAddress
          console.log('address created: ' +  createdAddress.toString('hex'))
        } else {
          console.log('successful transaction!')
        }
        cb(err)
      })
    }
    async.series([
      setup,
      async.apply(runTx, vendingMachineContract)
    ])
    return shim.success();
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let method = this[ret.fcn];
    if (!method) {
      console.log('no method of name:' + ret.fcn + ' found');
      return shim.success();
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async transferToken(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }

    let Choice = args[0];

    nonce++
    var payTx = {
      nonce: '0x' + nonce.toString('16'),
      gasPrice: '0x09184e72a000',
      gasLimit: '0xF4240',
      to: '0x' + createdAddress.toString('hex'),
      data: '0x9fc71b31000000000000000000000000000000000000000000000000000000000000000' + Choice.toString('hex')
    }
    module.exports = payTx

    function runTx(raw, cb) {
      // create a new transaction out of the json
      var tx = new Transaction(raw)
      tx.sign(Buffer.from(keyPair.secretKey, 'hex'))
      console.log('----Tranzakció futtatása (transferToken)-----')
      vm.runTx({
        tx: tx
      }, function (err, results) {
        if(results.vm.exception){
          console.log('true')
        } else {
          console.log('false')
        }
        console.log('returned: ' + results.vm.return.toString('hex'))
        cb(err)
      })
    }
    async.series([
      async.apply(runTx, payTx),
    ])
  }

  async balanceOfProduct(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1')
    }

    let Product = args[0];

    nonce++
    var remainingProduct = {
      nonce: '0x' + nonce.toString('16'),
      gasPrice: '0x09184e72a000',
      gasLimit: '0xF4240',
      to: '0x' + createdAddress.toString('hex'),
      data: '0xa514bf89000000000000000000000000000000000000000000000000000000000000000' + Product.toString('hex')
    }
    module.exports = remainingProduct

    function runTx(raw, cb) {
      var tx = new Transaction(raw)
      tx.sign(Buffer.from(keyPair.secretKey, 'hex'))
      console.log('----Tranzakció futtatása (balanceOfProduct)-----')
      vm.runTx({
        tx: tx
      }, function (err, results) {
      if(results.vm.exception){
          console.log('true')
        } else {
          console.log('false')
        }
        console.log('Query Response(raktáron lévő termék darabszáma):');
        console.log('returned: ' + results.vm.return.toString('hex'))
        cb(err)
      })
    }
    async.series([
      async.apply(runTx, remainingProduct)
    ])
    return;
  }

  async balanceOfAccount(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1')
    }
    let Address = args[0];

    nonce++
    var ownerBalance = {
      nonce: '0x' + nonce.toString('16'),
      gasPrice: '0x09184e72a000',
      gasLimit: '0xF4240',
      to: '0x' + createdAddress.toString('hex'),
      data: '0xc237d392000000000000000000000000' + Address.toString('hex')
    }
    module.exports = ownerBalance

    function runTx(raw, cb) {
      var tx = new Transaction(raw)
      tx.sign(Buffer.from(keyPair.secretKey, 'hex'))
      console.log('----Tranzakció futtatása (balanceOfAccount)-----')
      vm.runTx({
        tx: tx
      }, function (err, results) {
        if(results.vm.exception){
          console.log('true')
        } else {
          console.log('false')
        }
        console.log('Query Response(felhasználó token egyenlege):');
        console.log('returned: ' + results.vm.return.toString('hex'))
        cb(err)
      })
    }
    async.series([
      async.apply(runTx, ownerBalance)
    ])
    return;
  }

  async changeBalance(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1')
    }

    let NewBalance = args[0];

    nonce++
    var changeBalanceTo = {
      nonce: '0x' + nonce.toString('16'),
      gasPrice: '0x09184e72a000',
      gasLimit: '0xF4240',
      to: '0x' + createdAddress.toString('hex'),
      data: '0x6833a77c00000000000000000000000000000000000000000000000000000000000000' + NewBalance.toString('hex')
    }
    module.exports = changeBalanceTo

    function runTx(raw, cb) {
      var tx = new Transaction(raw)
      tx.sign(Buffer.from(keyPair.secretKey, 'hex'))
      console.log('----Tranzakció futtatása (changeBalance)-----')
      vm.runTx({
        tx: tx
      }, function (err, results) {
        console.log('error:' + results.vm.exception)
      if(results.vm.exception){
          console.log('true')
        } else {
          console.log('false')
        }
        console.log('returned: ' + results.vm.return.toString('hex'))
        cb(err)
      })
    }
    async.series([
      async.apply(runTx, changeBalanceTo)
    ])
    return;
  }
};

shim.start(new Chaincode());
