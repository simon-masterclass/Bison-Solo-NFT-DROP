require("dotenv").config()
const HDWalletProvider = require('@truffle/hdwallet-provider')

module.exports = {
	networks: {

		development: {
			host: "127.0.0.1",
			port: 7545,
			network_id: "*" // Match any network id
		},

		ganache: {
			  host: "127.0.0.1",
			  port: 8545,
			  network_id: "*"
		},

		goerli: {
			provider: function () {
				return new HDWalletProvider(
					[process.env.DEPLOYER_PRIVATE_KEY],
					"https://goerli.infura.io/v3/83020c814c5b4714a0632ed3011c4246" // URL to Ethereum Node: ${process.env.INFURA_API_KEY}
				)
			},
			// gasPrice: 60000000000, // 60 Gwei
			// gas: 4000000,
			network_id: 5
		},

		matic: {
			provider: function () {
				return new HDWalletProvider(
					[process.env.DEPLOYER_PRIVATE_KEY],
					`https://polygon-rpc.com`
				)
			},
			network_id: 137
		}

	},

	contracts_directory: './src/contracts/',
	contracts_build_directory: './src/abis/',

	compilers: {
		solc: {
			version: '0.8.9',
			optimizer: {
				enabled: true,
				runs: 200
			}
		}
	},

	plugins: [
		'truffle-plugin-verify'
	],

	api_keys: {
		etherscan: "RJNUSEUB6YTH4VW1KJEM4V7S9QDCHC4F16" //${process.env.ETHERSCAN_API_KEY}
	}
}
