/*
# Csonka Balint
# M1IHRM
# based on ethereumjs-vm example run-transaction-complete
# also based on Hyperledger Fabric chaincode_example02
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

var stateTrie = new Trie()

var vm = new VM({state: stateTrie})

var keyPair = require('./key-pair')

var account_1 = require('./key-pair_1')
var nonce1 = 0
var account_2 = require('./key-pair_2')
var nonce2 = -1

var createdAddress

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

    function adduser1 (cb) {
      var publicKeyBuf = Buffer.from(account_1.publicKey, 'hex')
      var address = utils.pubToAddress(publicKeyBuf, true)
      var account = new Account()
      account.balance = '0xf00000000000000000'
      console.log('user_1 address: ' + address.toString('hex'))
      stateTrie.put(address, account.serialize(), cb)
    }

    function adduser2 (cb) {
      var publicKeyBuf = Buffer.from(account_2.publicKey, 'hex')
      var address = utils.pubToAddress(publicKeyBuf, true)
      var account = new Account()
      account.balance = '0xf00000000000000000'
      console.log('user_2 address: ' + address.toString('hex'))
      stateTrie.put(address, account.serialize(), cb)
    }

    var vendingMachineContract = {
      nonce: '0x00',
      gasPrice: '0x09184e72a000',
      gasLimit: '0xF4240',
      data: '0x6060604052341561000f57600080fd5b60008060003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550600a600160006001815260200190815260200160002081905550600460016000600281526020019081526020016000208190555060026001600060038152602001908152602001600020819055506106a8806100b06000396000f30060606040523615610076576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680636833a77c1461007b57806370a082311461009e578063780bd3f1146100eb57806382409a7b146101225780639cc7f7081461016f578063de3819f2146101a6575b600080fd5b341561008657600080fd5b61009c60048080359060200190919050506101e1565b005b34156100a957600080fd5b6100d5600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610227565b6040518082815260200191505060405180910390f35b34156100f657600080fd5b61010c600480803590602001909190505061026f565b6040518082815260200191505060405180910390f35b341561012d57600080fd5b610159600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610287565b6040518082815260200191505060405180910390f35b341561017a57600080fd5b610190600480803590602001909190505061029f565b6040518082815260200191505060405180910390f35b34156101b157600080fd5b6101c760048080359060200190919050506102bc565b604051808215151515815260200191505060405180910390f35b806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60016020528060005260406000206000915090505481565b60006020528060005260406000206000915090505481565b600060016000838152602001908152602001600020549050919050565b60006001821480156102e257506000600160006001815260200190815260200160002054115b801561032d575060016000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410155b156103fa576001600060018152602001908152602001600020600081548092919060019003919050555060016000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555060016000803073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254019250508190555060019050610677565b60028214801561041e57506000600160006002815260200190815260200160002054115b8015610469575060026000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410155b15610536576001600060028152602001908152602001600020600081548092919060019003919050555060026000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555060026000803073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254019250508190555060019050610677565b60038214801561055a57506000600160006003815260200190815260200160002054115b80156105a5575060046000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410155b15610672576001600060038152602001908152602001600020600081548092919060019003919050555060046000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555060046000803073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254019250508190555060019050610677565b600090505b9190505600a165627a7a7230582025a32d4c9e056b7599c7b7b638d87da69e8f2ee344f4f2ce1b98532910ea86820029'
    }

    module.exports = vendingMachineContract

    function runTx (raw, cb) {
      var tx = new Transaction(raw)

      tx.sign(Buffer.from(account_1.secretKey, 'hex'))

      console.log('----Tranzakcio futtatasa (VendingMachine)-----')
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
      adduser1,
      adduser2,
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
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2 (User ID, product number)');
    }

    let User = args[0];
    let Choice = args[1];

    if(User == "A"){
      nonce1++
      nonce=nonce1
    } else if(User == "B") {
      nonce2++
      nonce=nonce2
    }

    var payTx = {
      nonce: '0x' + nonce.toString('16'),
      gasPrice: '0x09184e72a000',
      gasLimit: '0xF4240',
      to: '0x' + createdAddress.toString('hex'),
      data: '0xde3819f2000000000000000000000000000000000000000000000000000000000000000' + parseInt(Choice).toString('16')
    }
    module.exports = payTx

    function runTx(raw, cb) {
      // create a new transaction out of the json
      var tx = new Transaction(raw)

      if(User == "A"){
        tx.sign(Buffer.from(account_1.secretKey, 'hex'))
      } else if(User == "B") {
        tx.sign(Buffer.from(account_2.secretKey, 'hex'))
      }

      console.log('----Tranzakcio futtatasa (transferToken)-----')
      vm.runTx({
        tx: tx
      }, function (err, results) {
        if(results.vm.exception){
          console.log('successfull transaction!')
        } else {
          console.log('transaction failed!')
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
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2 (User ID, product number)')
    }

    let User = args[0];
    let Product = args[1];

    if(User == "A"){
      nonce1++
      nonce=nonce1
    } else if(User == "B") {
      nonce2++
      nonce=nonce2
    }

    var remainingProduct = {
      nonce: '0x' + nonce.toString('16'),
      gasPrice: '0x09184e72a000',
      gasLimit: '0xF4240',
      to: '0x' + createdAddress.toString('hex'),
      data: '0x9cc7f708000000000000000000000000000000000000000000000000000000000000000' + parseInt(Product).toString('16')
    }
    module.exports = remainingProduct

    function runTx(raw, cb) {
      var tx = new Transaction(raw)

      if(User == "A"){
        tx.sign(Buffer.from(account_1.secretKey, 'hex'))
      } else if(User == "B") {
        tx.sign(Buffer.from(account_2.secretKey, 'hex'))
      }

      console.log('----Tranzakcio futtatasa (balanceOfProduct)-----')
      vm.runTx({
        tx: tx
      }, function (err, results) {
      if(results.vm.exception){
          console.log('successfull transaction!')
        } else {
          console.log('transaction failed!')
        }
        console.log('Query Response(raktaron levo termek darabszama):');
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
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2 (User ID, account address)')
    }

    let User = args[0];
    let Address = args[1];

    if(User == "A"){
      nonce1++
      nonce=nonce1
    } else if(User == "B") {
      nonce2++
      nonce=nonce2
    }

    var ownerBalance = {
      nonce: '0x' + nonce.toString('16'),
      gasPrice: '0x09184e72a000',
      gasLimit: '0xF4240',
      to: '0x' + createdAddress.toString('hex'),
      data: '0x70a08231000000000000000000000000' + Address.toString('hex')
    }
    module.exports = ownerBalance

    function runTx(raw, cb) {
      var tx = new Transaction(raw)

      if(User == "A"){
        tx.sign(Buffer.from(account_1.secretKey, 'hex'))
      } else if(User == "B") {
        tx.sign(Buffer.from(account_2.secretKey, 'hex'))
      }

      console.log('----Tranzakcio futtatasa (balanceOfAccount)-----')
      vm.runTx({
        tx: tx
      }, function (err, results) {
        if(results.vm.exception){
          console.log('successfull transaction!')
        } else {
          console.log('transaction failed!')
        }
        console.log('Query Response(felhasznalo token egyenlege):');
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
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2 (User ID, new balance)')
    }

    let User = args[0];
    let NewBalance = args[1];

    if(User == "A"){
      nonce1++
      nonce=nonce1
    } else if(User == "B") {
      nonce2++
      nonce=nonce2
    }

    var changeBalanceTo = {
      nonce: '0x' + nonce.toString('16'),
      gasPrice: '0x09184e72a000',
      gasLimit: '0xF4240',
      to: '0x' + createdAddress.toString('hex'),
      data: '0x6833a77c00000000000000000000000000000000000000000000000000000000000000' + parseInt(NewBalance).toString('16')
    }
    module.exports = changeBalanceTo

    function runTx(raw, cb) {
      var tx = new Transaction(raw)

      if(User == "A"){
        tx.sign(Buffer.from(account_1.secretKey, 'hex'))
      } else if(User == "B") {
        tx.sign(Buffer.from(account_2.secretKey, 'hex'))
      }

      console.log('----Tranzakcio futtatasa (changeBalance)-----')
      vm.runTx({
        tx: tx
      }, function (err, results) {
        console.log('error:' + results.vm.exception)
      if(results.vm.exception){
          console.log('successfull transaction!')
        } else {
          console.log('transaction failed!')
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
