import {
  AbiCoder,
  Contract,
  ContractFactory,
  JsonRpcProvider,
  parseEther,
  Wallet,
} from "ethers";
import fs from "fs";
import { ETH_PRIV_KEY, L1_RPC_URL } from "../constants";

const eth_provider = new JsonRpcProvider(L1_RPC_URL);
const wallet = new Wallet(ETH_PRIV_KEY, eth_provider);

export async function deployEthL1UpdatedBridge() {
  const contract_artifact = JSON.parse(
    fs.readFileSync("./artifacts/eth_bridge_upgraded.json").toString()
  );
  const contract = new ContractFactory(
    contract_artifact.abi,
    contract_artifact.bytecode,
    wallet
  );

  const txn = await contract.deploy();
  await txn.waitForDeployment();
  return await txn.getAddress();
}

export async function upgradeEthBridgeL1(
  l1_eth_bridge_proxy_address: string,
  implementation_address: string
) {
  const contract = new Contract(
    l1_eth_bridge_proxy_address,
    [
      {
        type: "function",
        name: "addImplementation",
        inputs: [
          {
            name: "newImplementation",
            type: "address",
            internalType: "address",
          },
          {
            name: "data",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "finalize",
            type: "bool",
            internalType: "bool",
          },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "upgradeTo",
        inputs: [
          {
            name: "newImplementation",
            type: "address",
            internalType: "address",
          },
          {
            name: "data",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "finalize",
            type: "bool",
            internalType: "bool",
          },
        ],
        outputs: [],
        stateMutability: "payable",
      },
    ],
    wallet
  );

  const abiCoder = new AbiCoder();

  // Encode the initialization parameters
  const initData = abiCoder.encode(
    ["address"], // types of parameters
    ["0x0000000000000000000000000000000000000000"] // actual values
  );

  console.log(">>>> call data : ", initData);

  // add implementation :
  const txn1 = await contract.addImplementation(
    implementation_address,
    initData,
    false
  );
  const receipt_1 = await txn1.wait();
  console.log("Implementation added for ETH bridge.", receipt_1);

  // upgrade to
  const txn2 = await contract.upgradeTo(
    implementation_address,
    initData,
    false
  );
  const receipt_2 = await txn2.wait();
  console.log("Upgrade To for ETH bridge.", receipt_2);

  const contract_artifact = JSON.parse(
    fs.readFileSync("./scripts/artifacts/eth_bridge_upgraded.json").toString()
  );
  let contract2 = new Contract(
    l1_eth_bridge_proxy_address,
    contract_artifact.abi,
    wallet
  );
  // setup bridge
  const txn3 = await contract2.setMaxTotalBalance(
    "0x0000000000000000000000000000000000455448",
    parseEther("10000000")
  );
  const receipt_3 = await txn3.wait();
  console.log("ETH bridge setup", receipt_3);
}
