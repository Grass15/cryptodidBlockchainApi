var StateContract = artifacts.require("./StateContract.sol");

module.exports = function(deployer) {
  deployer.deploy(StateContract);
};