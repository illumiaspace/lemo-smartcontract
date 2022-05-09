import { ethers } from "hardhat";

export async function deployPancakeSwapTestnet(contractAddress: string = "") {
  if (contractAddress.length === 0) {
    // TODO: deploy new contract
    return null;
  } else {
    // init interfaces with contract address
    return initInterfacesWithAddress(contractAddress);
  }
}

async function initInterfacesWithAddress(address: string) {
  return await ethers.getContractAt("IPancakeRouter02", address);
}
