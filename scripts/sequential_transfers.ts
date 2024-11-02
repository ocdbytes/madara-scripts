import { Account, Block, Contract, RpcProvider } from "starknet";
import {
  ETH_ADDRESS,
  L2_ACCOUNT_ADDRESS,
  L2_ACCOUNT_PK,
  L2_RPC_URL,
} from "./constants";
import { waitForTransactionSuccess } from "./post_setup/utils";

const starknet_provider = new RpcProvider({
  nodeUrl: L2_RPC_URL,
});

const ETHEREUM_APP_CHAIN_ADDRESS = ETH_ADDRESS;

const PRIV_KEY = L2_ACCOUNT_PK;
const ADDRESS = L2_ACCOUNT_ADDRESS;

async function transfer(
  starknet_account_private_key: string,
  starnet_expected_account_address: string
) {
  const account = new Account(
    starknet_provider,
    starnet_expected_account_address,
    starknet_account_private_key,
    "1"
  );
  const abi = [
    {
      members: [
        {
          name: "low",
          offset: 0,
          type: "felt",
        },
        {
          name: "high",
          offset: 1,
          type: "felt",
        },
      ],
      name: "Uint256",
      size: 2,
      type: "struct",
    },
    {
      inputs: [
        {
          name: "recipient",
          type: "felt",
        },
        {
          name: "amount",
          type: "Uint256",
        },
      ],
      name: "transfer",
      outputs: [
        {
          name: "success",
          type: "felt",
        },
      ],
      type: "function",
    },
  ];
  const contract = new Contract(
    abi,
    ETHEREUM_APP_CHAIN_ADDRESS,
    starknet_provider
  );
  let calldata = contract.populate("transfer", {
    recipient: "0x1234",
    amount: {
      low: 1,
      high: 0,
    },
  });

  let txn_hash = await account.execute(calldata);
  let receipt = await waitForTransactionSuccess(txn_hash.transaction_hash);

  while (!("block_hash" in receipt) || !receipt.block_hash) {
    receipt = await starknet_provider.getTransactionReceipt(
      txn_hash.transaction_hash
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Get block details if needed
  if ("block_hash" in receipt && receipt.block_hash) {
    const block = (await starknet_provider.getBlock(
      receipt.block_hash
    )) as Block;
    return block.block_number;
  }

  throw new Error("Could not determine block number");
}

async function main() {
  for (let i = 0; i <= 1000; i++) {
    let res = await transfer(PRIV_KEY, ADDRESS);
    console.log(">>> block number :", res);
  }
}

main();
