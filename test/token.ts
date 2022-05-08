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
import { BigNumber, Contract, Signer } from "ethers";
import { expect } from "chai";
import { parseEther, parseUnits } from "ethers/lib/utils";
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

  it("Should get token info", async () => {
    const name = await mockToken.name();
    expect(name).to.be.eq("MockERC20");

    const symbol = await mockToken.symbol();
    expect(symbol).to.be.eq("Mock");
  });

  describe("ERC20 Transfer", () => {
    it("Should transfer from owner to accounts[1]", async () => {
      const recipient = await accounts[1].getAddress();
      await mockToken.connect(signer).transfer(recipient, parseEther("1000"));

      const balance = await mockToken.balanceOf(recipient);
      expect(balance).to.be.eq(parseEther("1000"));
    });

    it("Should transfer from accounts[1] to accounts[2] exceeds balance", async () => {
      const amountTransfer = parseEther("1001");
      const recipient2 = await accounts[2].getAddress();

      try {
        await mockToken
          .connect(accounts[1])
          .transfer(recipient2, amountTransfer);
      } catch (e) {
        // eslint-disable-next-line no-unused-expressions
        expect(e).to.not.be.null;
      }

      const balance = await mockToken.balanceOf(recipient2);
      expect(balance).to.be.eq("0");
    });

    it("Should transfer from accounts[1] to accounts[2]", async () => {
      const amountTransfer = parseEther("999.99999999999");
      const recipient2 = await accounts[2].getAddress();

      await mockToken.connect(accounts[1]).transfer(recipient2, amountTransfer);

      const balance = await mockToken.balanceOf(recipient2);
      expect(balance).to.be.eq(amountTransfer);
    });
  });

  describe("ERC20 TransferFrom", () => {
    let spender: string;

    before(async () => {
      spender = await signer.getAddress();
      await mockToken
        .connect(signer)
        .transfer(await accounts[1].getAddress(), parseEther("10000000"));

      const receiver = await accounts[2].getAddress();
      const balance: BigNumber = await mockToken.balanceOf(receiver);
      await mockToken.connect(signer).burn(balance, receiver);
    });

    it("Should transfer from accounts[1] to accounts[2] without approval of accounts[1] for signer to spend its account", async () => {
      const fromAddress = await accounts[1].getAddress();
      const toAddress = await accounts[2].getAddress();

      try {
        await mockToken
          .connect(signer)
          .transferFrom(fromAddress, toAddress, parseEther("100"));
      } catch (e) {
        // eslint-disable-next-line no-unused-expressions
        expect(e).to.not.be.null;
      }
    });

    it("Should apply new allowance amount from accounts[1] to signer", async () => {
      await mockToken.connect(accounts[1]).approve(spender, parseEther("100"));
      const owner = await accounts[1].getAddress();
      // get allowance
      const allowance = await mockToken.allowance(owner, spender);
      expect(allowance).to.be.eq(parseEther("100"));
    });

    it("Should transfer from accounts[1] to accounts[2]", async () => {
      const fromAddress = await accounts[1].getAddress();
      const toAddress = await accounts[2].getAddress();

      await mockToken
        .connect(signer)
        .transferFrom(fromAddress, toAddress, parseEther("100"));
      const balance = await mockToken.balanceOf(toAddress);
      expect(balance).to.be.eq(parseEther("100"));
    });
  });

  describe("ERC20 Mint Token", () => {
    let testAccount: SignerWithAddress;
    let totalSupply: BigNumber;

    before(async () => {
      testAccount = accounts[3];
      totalSupply = await mockToken.totalSupply();
      console.log(totalSupply.toString());
    });

    it("Should mint token to accounts[3]", async () => {
      const address = await testAccount.getAddress();
      await mockToken.mint(parseUnits("10", "kwei"), address);

      const balance = await mockToken.balanceOf(address);
      expect(balance).to.be.eq(parseUnits("10", "kwei"));
      const newTotalSupply = await mockToken.totalSupply();
      expect(newTotalSupply).to.be.eq(
        totalSupply.add(parseUnits("10", "kwei"))
      );
      console.log(newTotalSupply.toString());
    });
  });

  describe("ERC20 Burn Token", () => {
    let testAccount: SignerWithAddress;
    let totalSupply: BigNumber;

    before(async () => {
      testAccount = accounts[4];
      totalSupply = await mockToken.totalSupply();
      console.log(totalSupply.toString());

      await mockToken
        .connect(signer)
        .transfer(await testAccount.getAddress(), parseUnits("11", "kwei"));
    });

    it("Should burn token in accounts[4]", async () => {
      const address = await testAccount.getAddress();
      await mockToken.burn(parseUnits("10", "kwei"), address);

      const balance = await mockToken.balanceOf(address);
      expect(balance).to.be.eq(parseUnits("1", "kwei"));
      const newTotalSupply = await mockToken.totalSupply();
      expect(newTotalSupply).to.be.eq(
        totalSupply.sub(parseUnits("10", "kwei"))
      );
      console.log(newTotalSupply.toString());
    });
  });
});
