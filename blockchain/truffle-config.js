module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      // Add timeout settings to prevent handle closing issues
      timeoutBlocks: 200,
      // Gas settings for development
      gas: 6721975,
      gasPrice: 20000000000
    },
    docker: {
      host: "ganache",
      port: 7545,
      network_id: "*",
      timeoutBlocks: 200,
      gas: 6721975,
      gasPrice: 20000000000
    }
  },
  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        }
      }
    }
  },
  // Add mocha options to handle timeouts better
  mocha: {
    timeout: 100000
  }
};