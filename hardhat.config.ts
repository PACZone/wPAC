import "@nomicfoundation/hardhat-chai-matchers"
import "@nomicfoundation/hardhat-toolbox"
import "@openzeppelin/hardhat-upgrades"
import { config as dotenvConfig } from "dotenv"
import type { HardhatUserConfig } from "hardhat/config"
import { resolve, join } from "path"

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || join(__dirname, ".env")
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) })

const etherscanApiKey = process.env.ETHERSCAN_API_KEY
const account = process.env.PRIVATE_KEY
const RPC = process.env.POLYGON_RPC_URL

let config: HardhatUserConfig

if (!process.env.CI) {
	if (!etherscanApiKey) throw new Error("Hardhat_Config: etherscan api key is not defined.")
	if (!account) throw new Error("Hardhat_Config: account is not defined.")
	if (!RPC) throw new Error("Hardhat_Config: RPC is not defined.")

	config = {
		defaultNetwork: "hardhat",
		solidity: "0.8.20",
		networks: {
			hardhat: {
				allowUnlimitedContractSize: false,
			},
			amoy: {
				url: RPC,
				accounts: [account],
			},

			polygon: {
				url: RPC,
				accounts: [account],
			},
		},
		etherscan: {
			apiKey: {
				amoy: etherscanApiKey,
				polygon:etherscanApiKey
			},
			customChains: [
				{
				  network: "polygon",
				  chainId: 137,
				  urls: {
					apiURL: "https://api.polygonscan.com/api",
					browserURL: "https://polygonscan.com"
				  }
				}
			  ]
		},
		gasReporter: {
			currency: "USD",
			enabled: true,
			excludeContracts: [],
			src: "./contracts",
		},
		typechain: {
			outDir: "src/types",
		},
		mocha: {
			timeout: 100000000,
		},
		paths: {
			artifacts: "./artifacts",
			cache: "./cache",
			sources: "./contracts",
		},
	}
} else {
	config = {
		defaultNetwork: "hardhat",
		solidity: "0.8.20",
		networks: {
			hardhat: {
				allowUnlimitedContractSize: false,
			},
		},
		gasReporter: {
			currency: "USD",
			enabled: true,
			excludeContracts: [],
			src: "./contracts",
		},
		typechain: {
			outDir: "src/types",
		},
		mocha: {
			timeout: 100000000,
		},
		paths: {
			artifacts: "./artifacts",
			cache: "./cache",
			sources: "./contracts",
		},
	}
}

export default config
