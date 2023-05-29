// BasicMerkleTree.js
const { MerkleTree } = require('merkletreejs');
const SHA256 = require('crypto-js/sha256');

class BasicMerkleTree {
  constructor() {
    this.leaves = [];
    this.tree = null;
  }

  addLeaf(value) {
    const hash = Buffer.from(SHA256(value.toString()).toString(), 'hex');
    this.leaves.push(hash);
    this.tree = new MerkleTree(this.leaves, SHA256);
  }
  

  getRoot() {
    // If the tree is empty, return null
    if (this.leaves.length === 0) {
        return null;
    }

    // Otherwise, compute the root
    return this.tree.getRoot().toString('hex');
}

  getProof(value) {
    const hash = SHA256(value.toString());
    const buffer = Buffer.from(hash.toString(), 'hex');
    return this.tree.getProof(buffer);
  }

  verify(proof, value) {
    const hash = SHA256(value.toString());
    const buffer = Buffer.from(hash.toString(), 'hex');
    return MerkleTree.verify(proof, buffer, this.tree.getRoot());
  }

  getLeaves() {
    return this.leaves.map(leaf => leaf.toString('hex'));
}
}

module.exports = BasicMerkleTree;
