import { ethers } from "hardhat";
import { Contract, Signer, utils } from "ethers";
// eslint-disable-next-line node/no-extraneous-import
import { BytesLike } from "@ethersproject/bytes";

export const ADDRESSZERO = "0x0000000000000000000000000000000000000000";

export const FacetCutAction = {
  Add: 0,
  Replace: 1,
  Remove: 2,
};

export function getSelectors(contract: Contract) {
  const signatures: BytesLike[] = [];
  for (const key of Object.keys(contract.functions)) {
    signatures.push(utils.keccak256(utils.toUtf8Bytes(key)).substr(0, 10));
  }
  return signatures;
}

export async function deployDiamond(signer: Signer) {
  const owner = await signer.getAddress();
  console.log("owner:", owner);

  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  const diamondCutFacet = await DiamondCutFacet.connect(signer).deploy();
  const dCutFacet = await diamondCutFacet.deployed();
  console.log("diamond cut facet:", dCutFacet.address);

  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.connect(signer).deploy(
    owner,
    dCutFacet.address
  );
  const dm = await diamond.deployed();

  const DiamondLoupeFacet = await ethers.getContractFactory(
    "DiamondLoupeFacet"
  );
  const diamondLoupeFacet = await DiamondLoupeFacet.deploy();
  const dLoupeFacet = await diamondLoupeFacet.deployed();

  const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");
  const ownershipFacet = await OwnershipFacet.deploy();
  const oFacet = await ownershipFacet.deployed();

  const cuts = [
    {
      action: FacetCutAction.Add,
      facetAddress: dLoupeFacet.address,
      functionSelectors: getSelectors(dLoupeFacet),
    },
    {
      action: FacetCutAction.Add,
      facetAddress: oFacet.address,
      functionSelectors: getSelectors(oFacet),
    },
  ];

  const IDiamondCut = await ethers.getContractAt("IDiamondCut", dm.address);
  const diamondCut = await IDiamondCut.deployed();
  await diamondCut.diamondCut(cuts, ADDRESSZERO, "0x");

  return dm;
}
