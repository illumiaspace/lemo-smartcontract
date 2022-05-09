import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { parseEther, parseUnits } from "ethers/lib/utils";

// eslint-disable-next-line node/no-missing-import
import { deployPancakeSwapTestnet } from "../scripts/deploy/token-swap-test";

describe("Token Pancake Swap", () => {
  let pancakeRouter: Contract | null;
  const paceTokenAddress: string = "0x2F78d418742C93467A5B6A906cF17fB040F91CF9";
  const lemoTokenAddress: string = "0xa20b0EAA5f46C69a2547DFA6539745270E5b3e5F";
  let signer: Signer;
  let deadline: number;

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

  describe("Liquidity Test", async () => {
    let wrapBnbAddress: string;

    before(async () => {
      wrapBnbAddress = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
    });

    beforeEach(async () => {
      deadline = Math.floor(Date.now() / 1000) + 30;
    });

    it("Should add liquidity Pace-WBNB pair", async () => {
      await pancakeRouter
        ?.connect(signer)
        .addLiquidity(
          paceTokenAddress,
          wrapBnbAddress,
          parseEther("10000"),
          parseEther("0.005"),
          parseEther("1000"),
          parseEther("0.0005"),
          await signer.getAddress(),
          parseUnits(deadline + "", "wei"),
          {
            gasPrice: 20000000000,
            gasLimit: 5000000,
          }
        );
    });

    it("Should add liquidity Lemo-WBNB pair", async () => {
      await pancakeRouter
        ?.connect(signer)
        .addLiquidity(
          lemoTokenAddress,
          wrapBnbAddress,
          parseEther("10000"),
          parseEther("0.005"),
          parseEther("1000"),
          parseEther("0.0005"),
          await signer.getAddress(),
          parseUnits(deadline + "", "wei"),
          {
            gasPrice: 20000000000,
            gasLimit: 5000000,
          }
        );
    });
  });

  describe("Swap Test", () => {
    beforeEach(async () => {
      deadline = Math.floor(Date.now() / 1000) + 30;
    });

    it("should swap between pace and lemo token", async () => {
      await pancakeRouter
        ?.connect(signer)
        .swapExactTokensForTokens(
          parseEther("1"),
          parseEther("2"),
          [lemoTokenAddress, paceTokenAddress],
          await signer.getAddress(),
          parseUnits(deadline + "", "wei"),
          {
            gasPrice: 20000000000,
            gasLimit: 5000000,
          }
        );
    });
  });
});
