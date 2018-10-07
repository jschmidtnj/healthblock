# blockchain-api

Main Blockchain Database API

## installation
1. First install [docker](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)
2. Then install [node.js](https://nodejs.org/en/download/)
3. Then install the [hyperledger development tools](https://hyperledger.github.io/composer/latest/installing/development-tools.html)


## credits

[This tutorial](https://medium.freecodecamp.org/ultimate-end-to-end-tutorial-to-create-an-application-on-blockchain-using-hyperledger-3a83a80cbc71) was amazing. See [this github thread](https://github.com/hyperledger/composer/issues/3772) if you run into some common issues.
  
`sudo composer archive create -t dir -n .`
`sudo composer network install --card PeerAdmin@hlfv1 --archiveFile <name>.bna`
`sudo composer network start --networkName blockchain-api --networkVersion 0.0.1 --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --file networkadmin.card`