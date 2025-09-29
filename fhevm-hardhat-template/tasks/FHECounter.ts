import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact with Privacy Ledger Locally (--network localhost)
 * ==============================================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the PrivacyLedger contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the PrivacyLedger contract
 *
 *   npx hardhat --network localhost task:decrypt-accumulated
 *   npx hardhat --network localhost task:accumulate --value 2
 *   npx hardhat --network localhost task:diminish --value 1
 *   npx hardhat --network localhost task:decrypt-accumulated
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the PrivacyLedger contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the PrivacyLedger contract
 *
 *   npx hardhat --network sepolia task:decrypt-accumulated
 *   npx hardhat --network sepolia task:accumulate --value 2
 *   npx hardhat --network sepolia task:diminish --value 1
 *   npx hardhat --network sepolia task:decrypt-accumulated
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:ledger-address
 *   - npx hardhat --network sepolia task:ledger-address
 */
task("task:ledger-address", "Prints the PrivacyLedger address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const privacyLedger = await deployments.get("PrivacyLedger");

  console.log("PrivacyLedger address is " + privacyLedger.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-accumulated
 *   - npx hardhat --network sepolia task:decrypt-accumulated
 */
task("task:decrypt-accumulated", "Calls the getAccumulatedValue() function of PrivacyLedger Contract")
  .addOptionalParam("address", "Optionally specify the PrivacyLedger contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const PrivacyLedgerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivacyLedger");
    console.log(`PrivacyLedger: ${PrivacyLedgerDeployment.address}`);

    const signers = await ethers.getSigners();

    const privacyLedgerContract = await ethers.getContractAt("PrivacyLedger", PrivacyLedgerDeployment.address);

    const encryptedValue = await privacyLedgerContract.getAccumulatedValue();
    if (encryptedValue === ethers.ZeroHash) {
      console.log(`encrypted value: ${encryptedValue}`);
      console.log("clear value    : 0");
      return;
    }

    const clearValue = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedValue,
      PrivacyLedgerDeployment.address,
      signers[0],
    );
    console.log(`Encrypted accumulated value: ${encryptedValue}`);
    console.log(`Clear accumulated value    : ${clearValue}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:accumulate --value 1
 *   - npx hardhat --network sepolia task:accumulate --value 1
 */
task("task:accumulate", "Calls the accumulateValue() function of PrivacyLedger Contract")
  .addOptionalParam("address", "Optionally specify the PrivacyLedger contract address")
  .addParam("value", "The accumulation value")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const value = parseInt(taskArguments.value);
    if (!Number.isInteger(value)) {
      throw new Error(`Argument --value is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const PrivacyLedgerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivacyLedger");
    console.log(`PrivacyLedger: ${PrivacyLedgerDeployment.address}`);

    const signers = await ethers.getSigners();

    const privacyLedgerContract = await ethers.getContractAt("PrivacyLedger", PrivacyLedgerDeployment.address);

    // Encrypt the value passed as argument
    const encryptedValue = await fhevm
      .createEncryptedInput(PrivacyLedgerDeployment.address, signers[0].address)
      .add32(value)
      .encrypt();

    const tx = await privacyLedgerContract
      .connect(signers[0])
      .accumulateValue(encryptedValue.handles[0], encryptedValue.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const newEncryptedValue = await privacyLedgerContract.getAccumulatedValue();
    console.log("Encrypted accumulated value after accumulation:", newEncryptedValue);

    console.log(`PrivacyLedger accumulate(${value}) succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:diminish --value 1
 *   - npx hardhat --network sepolia task:diminish --value 1
 */
task("task:diminish", "Calls the diminishValue() function of PrivacyLedger Contract")
  .addOptionalParam("address", "Optionally specify the PrivacyLedger contract address")
  .addParam("value", "The diminution value")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const value = parseInt(taskArguments.value);
    if (!Number.isInteger(value)) {
      throw new Error(`Argument --value is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const PrivacyLedgerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivacyLedger");
    console.log(`PrivacyLedger: ${PrivacyLedgerDeployment.address}`);

    const signers = await ethers.getSigners();

    const privacyLedgerContract = await ethers.getContractAt("PrivacyLedger", PrivacyLedgerDeployment.address);

    // Encrypt the value passed as argument
    const encryptedValue = await fhevm
      .createEncryptedInput(PrivacyLedgerDeployment.address, signers[0].address)
      .add32(value)
      .encrypt();

    const tx = await privacyLedgerContract
      .connect(signers[0])
      .diminishValue(encryptedValue.handles[0], encryptedValue.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const newEncryptedValue = await privacyLedgerContract.getAccumulatedValue();
    console.log("Encrypted accumulated value after diminution:", newEncryptedValue);

    console.log(`PrivacyLedger diminish(${value}) succeeded!`);
  });
