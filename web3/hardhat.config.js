/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { API_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "goerli",
  networks: {
    hardhat: {},
    goerli: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
    },
  },
};
