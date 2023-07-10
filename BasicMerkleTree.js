// BasicMerkleTree.js

const SHA256 = require('crypto-js/sha256');
const { MerkleTree }= require('merkletreejs');


class BasicMerkleTree {
  constructor(db, tableName) {
    this.leaves = [];
    this.tree = null;
    this.db = db;
    this.tableName = tableName;
  }

  addLeaf(value) {
    const timestamp = Date.now();
    const hash = Buffer.from(SHA256(value.toString()).toString(), 'hex');
    this.leaves.push(hash);
    this.tree = new MerkleTree(this.leaves, SHA256);

    // Save the new leaf and its timestamp to the SQLite database
    this.db.run(`INSERT INTO ${this.tableName} VALUES (?, ?)`, [timestamp, hash.toString('hex')]);
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

initFromDB() {
  this.db.all(`SELECT leaf FROM ${this.tableName}`, (err, rows) => {
      if (err) {
          console.error(err);
          return;
      }

      rows.forEach(row => {
          let leaf = Buffer.from(row.leaf, 'hex');
          this.leaves.push(leaf);
      });

      this.tree = new MerkleTree(this.leaves, SHA256);
  });
}

}

module.exports = BasicMerkleTree;