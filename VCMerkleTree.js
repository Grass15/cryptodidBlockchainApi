// VCMerkleTree.js
const BasicMerkleTree = require('./BasicMerkleTree');
const SHA256 = require('crypto-js/sha256');
const { MerkleTree } = require('merkletreejs');


class VCMerkleTree extends BasicMerkleTree {
  constructor(db) {
    super(db, 'vcTree');
  }

  getProofForLeaf(vcId) {
    const vcIdHash = SHA256(vcId.toString());
    const vcBuffer = Buffer.from(vcIdHash.toString(), 'hex');
    return this.tree.getProof(vcBuffer);
}

verifyProof(proof, vcId) {
    const vcIdHash = SHA256(vcId.toString());
    const vcBuffer = Buffer.from(vcIdHash.toString(), 'hex');
    return MerkleTree.verify(proof, vcBuffer, this.getRoot());
}

}

module.exports = VCMerkleTree;
