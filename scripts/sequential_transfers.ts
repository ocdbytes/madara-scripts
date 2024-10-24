import starknet from "starknet";

const starknet_provider = new starknet.RpcProvider({
  nodeUrl: "http://localhost:9944",
});

const ETHEREUM_APP_CHAIN_ADDRESS =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

const PRIV_KEY = "";
const ADDRESS = "";

async function transfer(
  starknet_account_private_key: string,
  starnet_expected_account_address: string
) {
  const account = new starknet.Account(
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
  const contract = new starknet.Contract(
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
  let receipt = await starknet_provider.waitForTransaction(
    txn_hash.transaction_hash,
    {
      retryInterval: 100,
    }
  );
  if (!receipt.isSuccess()) {
    console.log("❌ Failed to do a transfer on Starknet account");
    process.exit(1);
  }

  // if txn is pending, block_number won't be available
  while (!receipt.block_number) {
    receipt = await starknet_provider.getTransactionReceipt(
      txn_hash.transaction_hash
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  console.log("✅ Successfully did a transfer on Starknet account");
  return receipt.block_number;
}

async function main() {
  for (let i = 0; i <= 1000; i++) {
    await transfer(PRIV_KEY, ADDRESS);
  }
}

main();
