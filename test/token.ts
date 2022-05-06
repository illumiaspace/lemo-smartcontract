import { ethers } from "hardhat";
import {
  ADDRESSZERO,
  deployDiamond,
  FacetCutAction,
  getSelectors,
} from "../scripts/deploy/diamond";
import { BasketFacet } from "../typechain";
import { Contract, Signer } from "ethers";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Token transaction", () => {
  let accounts: SignerWithAddress[];
  let diamondAddress: string;
  let basketFacet: BasketFacet;
  let signer: Signer;
  let owner: string;
  let mockToken: Contract;

  before(async () => {
    accounts = await ethers.getSigners();
    signer = accounts[0];
    owner = await signer.getAddress();
    diamondAddress = (await deployDiamond(signer)).address;
    console.log("diamond address:", diamondAddress);

    const BasketFacet = await ethers.getContractFactory("BasketFacet");
    basketFacet = await BasketFacet.connect(signer).deploy();
    const bFacet = await basketFacet.deployed();
    console.log("basket facet:", bFacet.address);

    const cut = [
      {
        action: FacetCutAction.Add,
        facetAddress: bFacet.address,
        functionSelectors: getSelectors(bFacet),
      },
    ];

    const IDiamondCut = await ethers.getContractAt(
      "IDiamondCut",
      diamondAddress
    );
    const diamondCut = await IDiamondCut.deployed();
    await diamondCut.diamondCut(cut, ADDRESSZERO, "0x");

    const IDiamondLoupe = await ethers.getContractAt(
      "IDiamondLoupe",
      diamondAddress
    );
    const diamondLoupe = await IDiamondLoupe.deployed();
    const addresses = await diamondLoupe.facetAddresses();
    console.log("facet addresses:", addresses);

    basketFacet = await ethers.getContractAt("BasketFacet", diamondAddress);
    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.connect(signer).deploy("MockERC20", "Mock");
    mockToken = await mockToken.deployed();
    await mockToken.connect(signer).mint(parseEther("100000000000000"), owner);
    await mockToken
      .connect(signer)
      .transfer(diamondAddress, parseEther("1000"));

    const supply = await mockToken.balanceOf(owner);
    console.log("supply:", supply.toString());

    const contractSupply = await mockToken.balanceOf(diamondAddress);
    console.log("contract -supply:", contractSupply.toString());

    // eslint-disable-next-line no-unused-expressions
    console.log(mockToken.address);
    await basketFacet.connect(signer).addToken(mockToken.address);
  });

  it("Should transfer token", async () => {
    const receipient = accounts[1];
  });
});
