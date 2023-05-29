// RootsMerkleTree.js
const BasicMerkleTree = require('./BasicMerkleTree');
const SHA256 = require('crypto-js/sha256');
const { MerkleTree } = require('merkletreejs');

class RootsMerkleTree extends BasicMerkleTree {
  constructor() {
    super();
  }

  // If needed, add specific methods for Roots Merkle tree
}

module.exports = RootsMerkleTree;
