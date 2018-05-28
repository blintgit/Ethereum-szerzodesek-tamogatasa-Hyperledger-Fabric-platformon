pragma solidity ^0.4.11;

contract VendingMachine{

    mapping (address => uint256) public zsetonEgyenleg;

    mapping (uint256 => uint256) public product;

    function VendingMachine() public {
            zsetonEgyenleg[this] = 0;
            product[1] = 10;
            product[2] = 4;
            product[3] = 2;
        }

    function balanceOf(address _owner) public constant returns (uint256 bal) {
        return zsetonEgyenleg[_owner];
    }

    function balanceOf(uint256 _product) public constant returns (uint256 pcs) {
        return product[_product];
    }
    
    function changeBalance(uint256 _newBalance) public {
        zsetonEgyenleg[msg.sender] = _newBalance;
    }

    function transferZseton(uint256 _choice) public returns (bool success) {
        if (_choice == 1 && product[1] > 0 && zsetonEgyenleg[msg.sender] >= 1) {
          product[1] --;
          zsetonEgyenleg[msg.sender] -= 1;
          zsetonEgyenleg[this] += 1;
          return true;
        }
        else if (_choice == 2 && product[2] > 0 && zsetonEgyenleg[msg.sender] >= 2) {
          product[2]--;
          zsetonEgyenleg[msg.sender] -= 2;
          zsetonEgyenleg[this] += 2;
          return true;
        }
        else if (_choice == 3 && product[3] > 0 && zsetonEgyenleg[msg.sender] >= 4) {
          product[3]--;
          zsetonEgyenleg[msg.sender] -= 4;
          zsetonEgyenleg[this] += 4;
          return true;
        }
        else {
          return false;
        }
    }
}
