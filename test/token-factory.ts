import { expect } from "chai";
import { ethers } from "hardhat";
import {
  ADDRESSZERO,
  deployDiamond,
  FacetCutAction,
  getSelectors,
  // eslint-disable-next-line node/no-missing-import
} from "../scripts/deploy/diamond";
// eslint-disable-next-line node/no-missing-import
import { BasketFacet } from "../typechain";
import { parseEther } from "ethers/lib/utils";
import { Signer } from "ethers";

describe("Basket Factory", () => {
  let diamondAddress: string;
  // eslint-disable-next-line camelcase
  let basketFacet: BasketFacet;
  let signer: Signer;
  let owner: string;

  before(async () => {
    const accounts = await ethers.getSigners();
    signer = accounts[0];
    owner = await signer.getAddress();
    diamondAddress = (await deployDiamond(signer)).address;
    console.log("diamond address:", diamondAddress);
  });

  it("should deploy basket facet into diamond", async () => {
    console.log("owner:", owner);

    const BasketFacet = await ethers.getContractFactory("BasketFacet");
    basketFacet = await BasketFacet.connect(signer).deploy();
    const bFacet = await basketFacet.deployed();
    // eslint-disable-next-line no-unused-expressions
    expect(bFacet.address).to.not.be.null;
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
    expect(bFacet.address).to.be.oneOf(addresses);
  });

  it("should deploy MockToken into basket", async () => {
    basketFacet = await ethers.getContractAt("BasketFacet", diamondAddress);
    // eslint-disable-next-line no-unused-expressions
    expect(basketFacet.address).to.not.be.null;
    console.log("basket facet:", basketFacet.address);

    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.connect(signer).deploy(
      "MockERC20",
      "Mock"
    );
    const mToken = await mockToken.deployed();
    await mToken.connect(signer).mint(parseEther("100000000000000"), owner);
    await mToken.connect(signer).transfer(diamondAddress, parseEther("1000"));

    const supply = await mToken.balanceOf(owner);
    console.log("supply:", supply.toString());

    const contractSupply = await mToken.balanceOf(diamondAddress);
    console.log("contract -supply:", contractSupply.toString());

    // eslint-disable-next-line no-unused-expressions
    expect(mToken.address).to.not.be.null;
    console.log(mToken.address);

    await basketFacet.connect(signer).addToken(mToken.address);
    const tokens = await basketFacet.getTokens();
    expect(mToken.address).to.be.oneOf(tokens);
  });
});
