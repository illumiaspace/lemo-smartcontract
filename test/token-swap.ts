import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { parseEther, parseUnits } from "ethers/lib/utils";

// eslint-disable-next-line node/no-missing-import
import { deployPancakeSwapTestnet } from "../scripts/deploy/token-swap";
// eslint-disable-next-line node/no-missing-import
import { MockToken } from "../typechain";

describe("Token Pancake Swap", () => {
  let pancakeRouter: Contract | null;
  let mockToken1: MockToken;
  let mockToken2: MockToken;
  let signer: Signer;

  before(async () => {
    const accounts = await ethers.getSigners();
    signer = accounts[0];
    pancakeRouter = await deployPancakeSwapTestnet(
      "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
    );
  });

  it("should be show on bsc testnet", async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(pancakeRouter).to.not.be.null;
  });

  // TODO: deploy token contract
  it("should deploy 2 new token contracts for testing", async () => {
    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken1 = await MockToken.connect(signer).deploy("Token1", "Token1");
    mockToken2 = await MockToken.connect(signer).deploy("Token2", "Token2");

    mockToken1 = await mockToken1.deployed();
    mockToken2 = await mockToken2.deployed();

    await mockToken1.mint(parseEther("1000000000"), await signer.getAddress());
    const supply1 = await mockToken1.totalSupply();
    expect(supply1).to.be.eq(parseEther("1000000000"));
    await mockToken2.mint(parseEther("1000000000"), await signer.getAddress());
    const supply2 = await mockToken2.totalSupply();
    expect(supply2).to.be.eq(parseEther("1000000000"));
  });

  describe("Liquidity Test", async () => {
    let wrapBnbAddress: string;
    let token1Address: string;

    before(async () => {
      wrapBnbAddress = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
      token1Address = mockToken1.address;
    });

    it("Should add liquidity Token1-WBNB pair", async () => {
      const [amount1, amount2, liquidity] = await pancakeRouter
        ?.connect(signer)
        .addLiquidity(
          token1Address,
          wrapBnbAddress,
          parseEther("100000"),
          parseEther("0.0041055"),
          parseEther("10000"),
          parseEther("0.000000041055"),
          await signer.getAddress(),
          parseUnits("19195000", "wei")
        );
    });
  });
});
