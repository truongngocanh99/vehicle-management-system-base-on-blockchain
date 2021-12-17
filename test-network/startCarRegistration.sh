./network.sh down
./network.sh up createChannel -ca -s couchdb
./network.sh deployCC -ccn CRChaincode -ccv 1 -ccl typescript -ccp ../chaincode/