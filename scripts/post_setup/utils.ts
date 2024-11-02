import {
  Account,
  Block,
  CallData,
  Contract,
  ec,
  GetTransactionReceiptResponse,
  hash,
  RpcProvider,
  stark,
  TransactionFinalityStatus,
} from "starknet";
import {
  ETH_ADDRESS,
  L2_RPC_URL,
  MONGO_URL,
  OZ_ACCOUNT_CLASS_HASH,
} from "../constants";
import { MongoClient } from "mongodb";
import { v4 } from "uuid";

const starknet_provider = new RpcProvider({
  nodeUrl: L2_RPC_URL,
});

export async function getAppChainBalance(address: string) {
  const abi = [
    {
      name: "balanceOf",
      type: "function",
      inputs: [
        {
          name: "account",
          type: "felt",
        },
      ],
      outputs: [
        {
          name: "balance",
          type: "Uint256",
        },
      ],
      stateMutability: "view",
    },
  ];
  const ethContract = new Contract(abi, ETH_ADDRESS, starknet_provider);

  // Interaction with the contract with call
  const balance = await ethContract.balanceOf(address);
  return balance.balance;
}

export async function waitForTransactionSuccess(
  hash: string
): Promise<GetTransactionReceiptResponse> {
  try {
    const receipt = await starknet_provider.waitForTransaction(hash, {
      retryInterval: 1000,
      successStates: [
        TransactionFinalityStatus.ACCEPTED_ON_L2,
        TransactionFinalityStatus.ACCEPTED_ON_L1,
      ],
    });

    if (!receipt.isSuccess()) {
      console.log("❌ Transaction failed - ", hash);
      console.log("Status:", receipt.status);
      if ("revert_reason" in receipt) {
        console.log("Revert reason:", receipt.revert_reason);
      }
      process.exit(1);
    }

    return receipt;
  } catch (error) {
    console.error("Error waiting for transaction:", error);
    process.exit(1);
  }
}

export function calculatePrefactualAccountAddress(): {
  address: string;
  private_key: string;
  public_key: string;
} {
  // new Open Zeppelin account v0.8.1
  // Generate public and private key pair.
  const privateKey = stark.randomAddress();
  console.log("🔑 Starknet private key:", privateKey);
  const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
  console.log("🔑 Starknet public key:", starkKeyPub);

  // Calculate future address of the account
  const OZaccountConstructorCallData = CallData.compile({
    publicKey: starkKeyPub,
  });
  const OZcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPub,
    OZ_ACCOUNT_CLASS_HASH,
    OZaccountConstructorCallData,
    0
  );
  return {
    address: OZcontractAddress,
    private_key: privateKey,
    public_key: starkKeyPub,
  };
}

export async function deployStarknetAccount(
  starknet_private_key: string,
  starnet_expected_account_address: string,
  starknet_account_public_key: string
) {
  console.log("⏳ Deploying Starknet account...");
  const account = new Account(
    starknet_provider,
    starnet_expected_account_address,
    starknet_private_key,
    "1"
  );
  const { transaction_hash, contract_address } = await account.deployAccount({
    classHash: OZ_ACCOUNT_CLASS_HASH,
    constructorCalldata: [starknet_account_public_key],
    addressSalt: starknet_account_public_key,
  });

  let receipt = await waitForTransactionSuccess(transaction_hash);

  while (!("block_hash" in receipt) || !receipt.block_hash) {
    receipt = await starknet_provider.getTransactionReceipt(transaction_hash);
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

export async function validateBlockPassesSnosChecks(block_number: number) {
  type CustomComponent = {
    l1_data_gas_price: {
      price_in_fri: string;
      price_in_wei: string;
    };
  };
  type BlockResponse = Block & CustomComponent;

  console.log("⏳ Checking if block", block_number, "can be run in SNOS...");
  const block = (await starknet_provider.getBlock(
    block_number
  )) as BlockResponse;

  // block number must be >= 10
  if (block_number < 10) {
    console.log("❌ Block number must be >= 10");
    process.exit(1);
  }
  console.log("✅ Block number is >= 10");

  // block must not be empty
  if (block.transactions.length === 0) {
    console.log("❌ Block has no transactions");
    process.exit(1);
  }
  console.log("✅ Block has transactions");

  // gas price shouldn't be 0
  if (
    (block.l1_gas_price.price_in_fri as unknown as number) === 0 ||
    (block.l1_gas_price.price_in_wei as unknown as number) == 0
  ) {
    console.log("❌ L1 gas price is 0", block.l1_gas_price);
    process.exit(1);
  }
  console.log("✅ L1 gas price is non zero");

  // data as price shouldn't be 0
  if (
    (block.l1_data_gas_price.price_in_fri as unknown as number) == 0 ||
    (block.l1_data_gas_price.price_in_wei as unknown as number) == 0
  ) {
    console.log("❌ L1 data gas price is 0", block.l1_data_gas_price);
    process.exit(1);
  }
  console.log("✅ L1 data gas price is non zero");
}

export async function setupMongoDb(block_number: number) {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  let db = client.db("orchestrator");
  const collection = db.collection("jobs");

  // delete everything in the collection
  await collection.deleteMany({});

  // insert all jobs
  let insert_promises = [
    "SnosRun",
    "ProofCreation",
    "DataSubmission",
    "StateTransition",
  ].map(async (job_type) => {
    console.log("Inserting job:", job_type);
    let metadata = {};
    if (job_type === "StateTransition") {
      metadata = {
        blocks_number_to_settle: String(block_number),
      };
    }
    await collection.insertOne({
      job_type,
      internal_id: String(block_number),
      external_id: "",
      status: "Completed",
      created_at: new Date(),
      updated_at: new Date(),
      id: v4(),
      metadata,
      version: 0,
    });
  });
  await Promise.all(insert_promises);
  await client.close();
  console.log("✅ Successfully inserted all jobs in MongoDB");
}

export async function transfer(
  starknet_account_private_key: string,
  starnet_account_address: string
) {
  const account = new Account(
    starknet_provider,
    starnet_account_address,
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
  const contract = new Contract(abi, ETH_ADDRESS, starknet_provider);
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
