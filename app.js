const express = require('express');
const VCMerkleTree = require('./VCMerkleTree');
const RootsMerkleTree = require('./RootsMerkleTree');
const RevocationsMerkleTree = require('./RevocationsMerkleTree');
const SHA256 = require('crypto-js/sha256');
const blockchain = require('./blockchain.js');

const app = express();
app.use(express.json());
const port = 4000;

let vcTree = new VCMerkleTree();
let rootsTree = new RootsMerkleTree();
let revocationsTree = new RevocationsMerkleTree();


app.post('/post/vc', async (req, res) => {
    try {
        const { signature, revNonce, version } = req.body;
        // TODO: Validate signature, revNonce, and version here

        const hash = SHA256(signature + revNonce + version).toString();
        vcTree.addLeaf(hash);
        const vcTreeRoot = vcTree.getRoot();
        rootsTree.addLeaf(vcTreeRoot);
        const rootsTreeRoot = rootsTree.getRoot();
        const revocationsTreeRoot = revocationsTree.getRoot();

        let state;

        if (revocationsTreeRoot) {
            state = SHA256(vcTreeRoot + revocationsTreeRoot + rootsTreeRoot).toString();
        } else {
            state = SHA256(vcTreeRoot + rootsTreeRoot).toString();
        }

        // Signing and sending transaction
        const receipt = await signAndSendTransaction(state);

        // Inform verifier
        console.log(`State has changed: ${state}`);

        res.status(200).json({
            message: 'VC added successfully',
            state: state,
            transactionReceipt: receipt
        });
    } catch (error) {
        console.error("Error processing VC: ", error);
        res.status(500).json({ error: "An error occurred while processing the VC." });
    }
});

app.post('/revoke/vc', async (req, res) => {
    try {
    // Endpoint for adding revocations
    const { revNonce, version } = req.body;
    const hash = SHA256(revNonce + version).toString();

    revocationsTree.addLeaf(hash);

    const vcTreeRoot = vcTree.getRoot();
    const rootsTreeRoot = rootsTree.getRoot();
    const revocationsTreeRoot = revocationsTree.getRoot();

    const state = SHA256(vcTreeRoot + revocationsTreeRoot+ rootsTreeRoot).toString();

    // Signing and sending transaction
    const receipt = await signAndSendTransaction(state);

        // Inform verifier
    console.log(`State has changed: ${state}`);
    res.status(200).json({
        message: 'VC revoked successfully',
        state: state,
        transactionReceipt: receipt
    });
}
catch (error) {
        console.error("Error processing VC: ", error);
        res.status(500).json({ error: "An error occurred while processing the VC." });
    }
});

app.post('/update/vc', async (req, res) => {
    try {
        const { signature, revNonce, version } = req.body;

        // Adding a new VC
        const newHash = SHA256(signature + revNonce + version).toString();
        vcTree.addLeaf(newHash);
        
        // Adding to the Revocation tree
        const revocationHash = SHA256(revNonce + (version - 1)).toString();
        revocationsTree.addLeaf(revocationHash);

        const vcTreeRoot = vcTree.getRoot();
        
        // Update the Roots tree with the new VC tree root
        rootsTree.addLeaf(vcTreeRoot);

        const rootsTreeRoot = rootsTree.getRoot();
        const revocationsTreeRoot = revocationsTree.getRoot();

        const state = SHA256(vcTreeRoot + revocationsTreeRoot+ rootsTreeRoot).toString();

        // Signing and sending transaction
        const receipt = await signAndSendTransaction(state);

        // Inform verifier
        console.log(`State has changed: ${state}`);
        
        res.status(200).json({
            message: 'VC updated successfully',
            state: state,
            transactionReceipt: receipt
        });
    } catch (error) {
        console.error("Error processing VC update: ", error);
        res.status(500).json({ error: "An error occurred while processing the VC update." });
    }
});




app.get('/isvcinVCMerkleTree', (req, res) => {
    const { signature, revNonce, version } = req.query;
    // TODO: Validate signature, revNonce, and version here

    const hash = SHA256(signature + revNonce + version).toString();

    const proof = vcTree.getProofForLeaf(hash);

    console.log("VC Merkle Tree Leaves: ", vcTree.getLeaves());
    console.log("Proof for VC hash ", hash, ": ", proof);

    if (vcTree.verifyProof(proof, hash)) {
        res.status(200).json({
            message: 'VC was issued at some point',
            proof
        });
    } else {
        res.status(400).json({ 
            message: 'VC doesnt exist'
        });
    }
});

app.get('/isvcinRevocationsMerkleTree', (req, res) => {
    const { revNonce, version } = req.query;
    // TODO: Validate revNonce, and version here

    const hash = SHA256(revNonce + version).toString();

    const proof = revocationsTree.getProofForLeaf(hash);

    console.log("Revocations Merkle Tree Leaves: ", revocationsTree.getLeaves());
    console.log("Proof for VC hash ", hash, ": ", proof);

    if (revocationsTree.verifyProof(proof, hash)) {
        res.status(200).json({
            isRevoked: true,
            proof
        });
    } else {
        res.status(200).json({ 
            isRevoked: false
        });
    }
});



app.get('/rootsTree/root', (req, res) => {
    const root = rootsTree.getRoot();
    res.status(200).json(root);
});

app.get('/revocationsTree/leaves', (req, res) => {
    const leaves = revocationsTree.getLeaves();
    res.status(200).json(leaves);
});

app.get('/revocationsTree/root', (req, res) => {
    const root = revocationsTree.getRoot();
    res.status(200).json(root);
});


app.get('/vcTree/leaves', (req, res) => {
    const leaves = vcTree.getLeaves();
    res.status(200).json(leaves);
});

app.get('/vcTree/root', (req, res) => {
    const root = vcTree.getRoot();
    res.status(200).json(root);
});

app.get('/rootsTree/leaves', (req, res) => {
    const leaves = rootsTree.getLeaves();
    res.status(200).json(leaves);
});

app.get('/state', async (req, res) => {
    const state = await blockchain.contract.methods.state().call();
    res.status(200).json(state);
});

async function signAndSendTransaction(state) {
    try {
        const encodedABI = blockchain.contract.methods.setState(state).encodeABI();

        const tx = {
            from: blockchain.account,
            to: blockchain.contractAddress,
            gas: 2000000,
            data: encodedABI
        };

        const signedTx = await blockchain.web3.eth.accounts.signTransaction(tx, `0x${blockchain.privateKey.toString('hex')}`);
        const receipt = await blockchain.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return receipt;
    } catch (error) {
        console.error("Error signing and sending transaction: ", error);
        throw error;
    }
}

app.listen(process.env.PORT || port, () => {
    console.log('Server is running on port 4000');
});
