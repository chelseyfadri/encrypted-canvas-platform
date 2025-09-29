import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedEncryptedCanvas = await deploy("EncryptedCanvas", {
    from: deployer,
    log: true,
  });

  console.log(`EncryptedCanvas contract: `, deployedEncryptedCanvas.address);
};
export default func;
func.id = "deploy_encryptedCanvasContracts"; // id required to prevent reexecution
func.tags = ["EncryptedCanvas"];
