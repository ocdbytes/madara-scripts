import { Account, Contract, RpcProvider } from "starknet";
import { L2_RPC_URL } from "../constants";
import { waitForTransactionSuccess } from "./utils";

const starknet_provider = new RpcProvider({
  nodeUrl: L2_RPC_URL,
});

export async function upgradeETHBridge(
  l2_eth_bridge_address: string,
  starknet_account_private_key: string,
  starnet_expected_account_address: string
) {
  const account = new Account(
    starknet_provider,
    starnet_expected_account_address,
    starknet_account_private_key,
    "1"
  );

  // declare and deploy the new ETH bridge contract
  // https://sepolia.starkscan.co/tx/0x05c266b9069c04f68752f5eb9652d7c0cd130c6d152d2267a8480273ec991de6
  console.log(
    "ℹ️ Sending transaction to declare and deploy new ETH bridge contract for ETH..."
  );
  let new_bridge_declare_deploy = await account.declareAndDeploy({
    contract: require("./artifacts/new_eth_bridge.sierra.json"),
    casm: require("./artifacts/new_eth_bridge.casm.json"),
    constructorCalldata: ["0"],
  });
  console.log("✅ Transaction successful.");

  // declare and deploy the EIC (external initializer contract)
  // this is a method used to upgrade contracts in Starknet's proxy version'
  // however, I couldn't find the code of this contract
  // https://sepolia.starkscan.co/tx/0x02fde4be42ecb05b545f53adf9d4c1aed8392e6a3743e9f5b6b8333fc580e684
  console.log("ℹ️ Sending transaction to declare and deploy EIC contract...");
  let eic_declare_deploy = await account.declareAndDeploy({
    contract: require("./artifacts/eic_eth_bridge.sierra.json"),
    casm: require("./artifacts/eic_eth_bridge.casm.json"),
    constructorCalldata: [],
  });
  console.log("✅ Transaction successful.");

  // add_implementation to bridge contarct before we upgrade
  // https://sepolia.starkscan.co/call/0x0721b02e1f4daa98ed8928966d66f345cb897f382274b22c89d86c00e755106d_1_1
  console.log(
    "ℹ️ Sending transaction to add implementation to bridge contract..."
  );
  let eth_bridge = new Contract(
    require("./artifacts/bridge_proxy_legacy.json").abi,
    l2_eth_bridge_address,
    account
  );
  let add_implementation_calldata = eth_bridge.populate("add_implementation", [
    new_bridge_declare_deploy.deploy.address,
    eic_declare_deploy.deploy.address,
    [
      "ETH",
      "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    ], // init vector
    0, // final
  ]);
  let add_implementation_txn_hash = await eth_bridge.add_implementation(
    add_implementation_calldata.calldata
  );
  await waitForTransactionSuccess(add_implementation_txn_hash.transaction_hash);
  console.log("✅ Transaction successful.");

  // upgrade ETH token contract
  // https://sepolia.starkscan.co/tx/0x02660d0b82cd88e28a420adf8b5a5139b1f6084af708d10a75269b757ff6367c
  console.log("ℹ️ Sending transaction to upgrade ETH bridge contract...");
  let upgrade_txn_hash = await eth_bridge.upgrade_to(
    // the calldata is the same
    add_implementation_calldata.calldata
  );
  await waitForTransactionSuccess(upgrade_txn_hash.transaction_hash);
  console.log("✅ Transaction successful.");

  // now add a new implementation to the bridge contract for the bridge class hash
  // https://sepolia.starkscan.co/tx/0x051cc24816ec349c601bbd4e9afc8e0a8c7a93061aba372045bbf7e5d35aff7a
  console.log(
    "ℹ️ Sending transaction to add new implementation to bridge contract..."
  );
  let add_new_implementation_txn_hash = await account.execute([
    {
      contractAddress: l2_eth_bridge_address,
      entrypoint: "add_new_implementation",
      calldata: [
        // class hash of new_eth_bridge
        new_bridge_declare_deploy.declare.class_hash,
        "0x1",
        "0x0",
      ],
    },
  ]);
  await waitForTransactionSuccess(
    add_new_implementation_txn_hash.transaction_hash
  );
  console.log("✅ Transaction successful.");

  // finally replace the class hash on the ETH contract
  console.log(
    "ℹ️ Sending transaction to replace class hash on the ETH contract..."
  );
  let replace_to_txn_hash = await account.execute([
    {
      contractAddress: l2_eth_bridge_address,
      entrypoint: "replace_to",
      calldata: [new_bridge_declare_deploy.declare.class_hash, "0x1", "0x0"],
    },
  ]);
  await waitForTransactionSuccess(replace_to_txn_hash.transaction_hash);
  console.log("✅ Transaction successful.");
}
