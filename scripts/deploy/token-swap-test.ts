import { ethers } from "hardhat";
import { Signer } from "ethers";

let mockTokens: Map<string, string>;

export async function deployPancakeSwapTestnet(contractAddress: string = "") {
  if (contractAddress.length === 0) {
    // TODO: deploy new contract
    return null;
  } else {
    // init interfaces with contract address
    return initInterfacesWithAddress(contractAddress);
  }
}

export async function deployMockToken(
  owner: Signer,
  name: string,
  symbol: string
) {
  const key = `${symbol}-${name}`;
  if (mockTokens.has(key)) {
    return mockTokens.get(key);
  }

  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.connect(owner).deploy(name, symbol);

  return (await mockToken.deployed()).address;
}

async function initInterfacesWithAddress(address: string) {
  return await ethers.getContractAt("IPancakeRouter02", address);
}
