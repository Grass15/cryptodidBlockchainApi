Use these curl commands to test the API:

- Creating a new VC and Publishing the new state onto the blockchain:

curl -X POST -H "Content-Type: application/json" \
     -d '{"signature":"sample_signature","revNonce":"sample_revNonce","version":"0"}' \
     http://localhost:3000/post/vc


- Updating a VC and Publishing the new state onto the blockchain:

curl -X POST -H "Content-Type: application/json" \
     -d '{"signature":"sample_signature","revNonce":"sample_revNonce","version":"1"}' \
     http://localhost:3000/update/vc


- Revoking a VC and Publishing the new state onto the blockchain:

curl -X POST -H "Content-Type: application/json" \
     -d '{"revNonce":"sample_revNonce","version":"1"}' \
     http://localhost:3000/revoke/vc


- Get the newest state:

curl -X GET "http://localhost:3000/state"


Checking if the VC is active and not revoked:

First, check that the VC is inside the VC Merkle Tree and that it was issued at some point.
Second, check that the VC is not in the Revocations Merkle Tree and that it's not revoked yet.

- Check if the the VC is inside the VC Merkle Tree:

curl "http://localhost:3000/isvcinVCMerkleTree?signature=sample_signature&revNonce=sample_revNonce&version=1"


- Check if the the VC is inside the Revocations Merkle Tree:

curl "http://localhost:3000/isvcinRevocationsMerkleTree?revNonce=sample_revNonce&version=1"



- Check the VC Tree leaves:

curl -X GET "http://localhost:3000/vcTree/leaves"


- Check the VC Tree root:

curl -X GET "http://localhost:3000/vcTree/root"


- Check the roots tree leaves:

curl -X GET "http://localhost:3000/rootsTree/leaves"


- Check the roots tree root:

curl -X GET "http://localhost:3000/rootsTree/root"

- Check the revocations tree leaves:

curl "http://localhost:3000/revocationsTree/leaves"


- Check the revocations tree root:

curl "http://localhost:3000/revocationsTree/root"



TODO: 
- merge the verification into 1 get request for the verifier.
- if a vc already exists in the vc/revocations tree you cant re-insert it (vc already issued, vc already revoked)
- store the merkle trees
- clean and re-organise the code to be more readble


