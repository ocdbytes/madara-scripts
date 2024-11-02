import { RpcProvider, StateUpdate } from "starknet";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { ETH_PRIV_KEY, L1_RPC_URL, L2_RPC_URL } from "../constants";

const starknet_provider = new RpcProvider({
  nodeUrl: L2_RPC_URL,
});

const eth_provider = new JsonRpcProvider(L1_RPC_URL);

const ETHEREUM_PRIVATE_KEY = ETH_PRIV_KEY;

const wallet = new Wallet(ETHEREUM_PRIVATE_KEY, eth_provider);

export async function overrideStateOnCoreContract(
  block_number: number,
  core_contract_address: string
) {
  let state_update = (await starknet_provider.getStateUpdate(
    block_number
  )) as StateUpdate;
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
