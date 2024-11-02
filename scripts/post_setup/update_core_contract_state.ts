import { RpcProvider } from "starknet";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import {
  ETH_PRIV_KEY,
  L1_RPC_URL,
  L2_RPC_URL,
  STRK_CORE_CONTRACT,
} from "../constants";

const starknet_provider = new RpcProvider({
  nodeUrl: L2_RPC_URL,
});

const eth_provider = new JsonRpcProvider(L1_RPC_URL);

const ETHEREUM_PRIVATE_KEY = ETH_PRIV_KEY;
const BLOCK_NO = "54";
const CORE_CONTRACT_ADDRESS = STRK_CORE_CONTRACT;

const wallet = new Wallet(ETHEREUM_PRIVATE_KEY, eth_provider);

export async function overrideStateOnCoreContract(
  block_number: number,
  core_contract_address: string
) {
  let state_update = await starknet_provider.getStateUpdate(block_number);
  let abi = [
    {
      type: "function",
      name: "updateStateOverride",
      inputs: [
        {
          name: "globalRoot",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "blockNumber",
          type: "int256",
          internalType: "int256",
        },
        {
          name: "blockHash",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
  ];

  const contract = new Contract(core_contract_address, abi, wallet);
  const tx = await contract.updateStateOverride(
    state_update.new_root,
    block_number,
    state_update.block_hash
  );
  const receipt = await tx.wait();
  if (!receipt.status) {
    console.log("❌ Failed to override state on core contract");
    process.exit(1);
  }
  console.log("✅ Successfully overridden state on core contract");
}
