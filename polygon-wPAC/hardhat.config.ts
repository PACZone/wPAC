import "@nomicfoundation/hardhat-chai-matchers"
import "@nomicfoundation/hardhat-toolbox"
import "@openzeppelin/hardhat-upgrades"
import { config as dotenvConfig } from "dotenv"
import type { HardhatUserConfig } from "hardhat/config"
import { resolve } from "path"

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env"
dotenvConfig({path: resolve(__dirname, dotenvConfigPath)})

const etherscanApiKey = process.env.ETHERSCAN_API_KEY
const account = process.env.PRIVATE_KEY
const RPC = process.env.POLYGON_RPC_URL

console.log(RPC);

if (!etherscanApiKey) throw new Error("Hardhat_Config: etherscan api key is not defined.")
if (!account) throw new Error("Hardhat_Config: account is not defined.")
if (!RPC) throw new Error("Hardhat_Config: RPC is not defined.")

const config: HardhatUserConfig = {
	defaultNetwork: "hardhat",
	solidity: "0.8.20",
	networks: {
		mumbai: {
			url: RPC,
			accounts: [account],
		},
	},
	etherscan: {
		apiKey: etherscanApiKey,
	},
	gasReporter: {
		currency: "USD",
		enabled: true,
		excludeContracts: [],
		src: "./contracts",
	},
}

export default config
