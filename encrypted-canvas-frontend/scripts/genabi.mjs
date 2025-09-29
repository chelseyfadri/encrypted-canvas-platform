import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Contracts to generate ABI for
const CONTRACTS = [
  { name: "EncryptedCanvas", file: "EncryptedCanvas" }
];

// <root>/packages/fhevm-hardhat-template
const rel = "../fhevm-hardhat-template";

// <root>/packages/site/components
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line =
  "\n===================================================================\n";

if (!fs.existsSync(dir)) {
  console.error(
    `${line}Unable to locate ${rel}. Expecting <root>/packages/${dirname}${line}`
  );
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");

function deployOnHardhatNode() {
  if (process.platform === "win32") {
    // Not supported on Windows
    return;
  }
  try {
    execSync(`./deploy-hardhat-node.sh`, {
      cwd: path.resolve("./scripts"),
      stdio: "inherit",
    });
  } catch (e) {
    console.error(`${line}Script execution failed: ${e}${line}`);
    process.exit(1);
  }
}

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir) && chainId === 31337) {
    // Try to auto-deploy the contract on hardhat node!
    deployOnHardhatNode();
  }

  if (!fs.existsSync(chainDeploymentDir)) {
    console.error(
      `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
    );
    if (!optional) {
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(
    path.join(chainDeploymentDir, `${contractName}.json`),
    "utf-8"
  );

  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

// Generate ABI for each contract
for (const contract of CONTRACTS) {
  const { name, file } = contract;

  try {
    // Auto deployed on Linux/Mac (will fail on windows)
    const deployLocalhost = readDeployment("localhost", 31337, file, false /* optional */);

    // Sepolia is optional - use localhost ABI if sepolia deployment doesn't exist
    let deploySepolia;
    try {
      deploySepolia = readDeployment("sepolia", 11155111, file, true /* optional */);
    } catch (error) {
      // Sepolia deployment doesn't exist, use localhost ABI
      deploySepolia = { abi: deployLocalhost.abi, address: "0x0000000000000000000000000000000000000000" };
    }
    if (!deploySepolia) {
      deploySepolia = { abi: deployLocalhost.abi, address: "0x0000000000000000000000000000000000000000" };
    }

    if (deployLocalhost && deploySepolia) {
      if (
        JSON.stringify(deployLocalhost.abi) !== JSON.stringify(deploySepolia.abi)
      ) {
        console.error(
          `${line}Deployments on localhost and Sepolia differ. Cant use the same abi on both networks. Consider re-deploying the contracts on both networks.${line}`
        );
        process.exit(1);
      }
    }

    const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${name}ABI = ${JSON.stringify({ abi: deployLocalhost.abi }, null, 2)} as const;
`;
    const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${name}Addresses = {
  "11155111": { address: "${deploySepolia.address}", chainId: 11155111, chainName: "sepolia" },
  "31337": { address: "${deployLocalhost.address}", chainId: 31337, chainName: "hardhat" },
};
`;

    console.log(`Generated ${path.join(outdir, `${name}ABI.ts`)}`);
    console.log(`Generated ${path.join(outdir, `${name}Addresses.ts`)}`);

    fs.writeFileSync(path.join(outdir, `${name}ABI.ts`), tsCode, "utf-8");
    fs.writeFileSync(
      path.join(outdir, `${name}Addresses.ts`),
      tsAddresses,
      "utf-8"
    );
  } catch (error) {
    console.warn(`Skipping ${name} - deployment not found: ${error.message}`);
  }
}