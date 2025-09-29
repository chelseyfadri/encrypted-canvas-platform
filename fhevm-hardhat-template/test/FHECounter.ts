import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { PrivacyLedger, PrivacyLedger__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("PrivacyLedger")) as PrivacyLedger__factory;
  const privacyLedgerContract = (await factory.deploy()) as PrivacyLedger;
  const privacyLedgerContractAddress = await privacyLedgerContract.getAddress();

  return { privacyLedgerContract, privacyLedgerContractAddress };
}

describe("PrivacyLedger", function () {
  let signers: Signers;
  let privacyLedgerContract: PrivacyLedger;
  let privacyLedgerContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ privacyLedgerContract, privacyLedgerContractAddress } = await deployFixture());
  });

  it("encrypted value should be uninitialized after deployment", async function () {
    const encryptedValue = await privacyLedgerContract.getAccumulatedValue();
    // Expect initial value to be bytes32(0) after deployment,
    // (meaning the encrypted value is uninitialized)
    expect(encryptedValue).to.eq(ethers.ZeroHash);
  });

  it("accumulate value by 1", async function () {
    const encryptedValueBeforeAcc = await privacyLedgerContract.getAccumulatedValue();
    expect(encryptedValueBeforeAcc).to.eq(ethers.ZeroHash);
    const clearValueBeforeAcc = 0;

    // Encrypt constant 1 as a euint32
    const clearOne = 1;
    const encryptedOne = await fhevm
      .createEncryptedInput(privacyLedgerContractAddress, signers.alice.address)
      .add32(clearOne)
      .encrypt();

    const tx = await privacyLedgerContract
      .connect(signers.alice)
      .accumulateValue(encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();

    const encryptedValueAfterAcc = await privacyLedgerContract.getAccumulatedValue();
    const clearValueAfterAcc = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedValueAfterAcc,
      privacyLedgerContractAddress,
      signers.alice,
    );

    expect(clearValueAfterAcc).to.eq(clearValueBeforeAcc + clearOne);
  });

  it("diminish value by 1", async function () {
    // Encrypt constant 1 as a euint32
    const clearOne = 1;
    const encryptedOne = await fhevm
      .createEncryptedInput(privacyLedgerContractAddress, signers.alice.address)
      .add32(clearOne)
      .encrypt();

    // First accumulate by 1, value becomes 1
    let tx = await privacyLedgerContract
      .connect(signers.alice)
      .accumulateValue(encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();

    // Then diminish by 1, value goes back to 0
    tx = await privacyLedgerContract.connect(signers.alice).diminishValue(encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();

    const encryptedValueAfterDim = await privacyLedgerContract.getAccumulatedValue();
    const clearValueAfterDim = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedValueAfterDim,
      privacyLedgerContractAddress,
      signers.alice,
    );

    expect(clearValueAfterDim).to.eq(0);
  });
});
