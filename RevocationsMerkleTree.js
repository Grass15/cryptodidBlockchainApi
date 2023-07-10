// RevocationsMerkleTree.js
const BasicMerkleTree = require('./BasicMerkleTree');
const SHA256 = require('crypto-js/sha256');
const { MerkleTree } = require('merkletreejs');

class RevocationsMerkleTree extends BasicMerkleTree {
  constructor(db) {
    super(db, 'revocationsTree');
  }

  getProofForLeaf(revId) {
    const revIdHash = SHA256(revId.toString());
    const vcBuffer = Buffer.from(revIdHash.toString(), 'hex');
    return this.tree.getProof(vcBuffer);
}

verifyProof(proof, revId) {
    const revIdHash = SHA256(revId.toString());
    const vcBuffer = Buffer.from(revIdHash.toString(), 'hex');
    return MerkleTree.verify(proof, vcBuffer, this.getRoot());
}
}

module.exports = RevocationsMerkleTree;
