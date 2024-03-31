import "@nomicfoundation/hardhat-chai-matchers"
import "@nomicfoundation/hardhat-toolbox"
import "@openzeppelin/hardhat-upgrades"
import { config as dotenvConfig } from "dotenv"
import type { HardhatUserConfig } from "hardhat/config"
import { resolve, join } from "path"

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || join(__dirname,".env")
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) })

const config: HardhatUserConfig = {
	defaultNetwork: "hardhat",
	solidity: "0.8.20",
	networks: {
		hardhat: {
			allowUnlimitedContractSize: false,
		},
	},
	typechain: {
		outDir: "./contracts/evm/src/types",
	},
	mocha: {
		timeout: 100000000,
	},
	paths: {
		artifacts: "./contracts/evm/artifacts",
		cache: "./contracts/evm/cache",
		sources: "./contracts/evm/contracts",
		tests: "./contracts/evm/test",
	},
}

export default config
