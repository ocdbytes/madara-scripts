import { Account, Contract, RpcProvider } from "starknet";
import { L2_RPC_URL } from "../constants";
import { waitForTransactionSuccess } from "./utils";

const starknet_provider = new RpcProvider({
  nodeUrl: L2_RPC_URL,
});

export async function upgradeETHToken(
  l2_eth_token_address: string,
  starknet_account_private_key: string,
  starnet_expected_account_address: string
) {
  const account = new Account(
    starknet_provider,
    starnet_expected_account_address,
    starknet_account_private_key,
    "1"
  );

  // declare and deploy the new ERC20 contract
  // https://sepolia.starkscan.co/tx/0x04b5fa2a2e738a8b7a6c7b15194fbcf4409411743ebbe48cc5b83e5fe0edffdf
  console.log(
    "ℹ️ Sending transaction to declare and deploy new ERC20 contract for ETH..."
  );
  let new_erc20_declare_deploy = await account.declareAndDeploy({
    contract: require("./artifacts/new_eth_token.sierra.json"),
    casm: require("./artifacts/new_eth_token.casm.json"),
    constructorCalldata: [
      "eee",
      "eeee",
      "6",
      "0",
      "0",
      "0x137e2eb39d5b20f7257425dbea0a97ab6a53941e7ccdc9168ba3b0f8b39d1ce",
      "0x137e2eb39d5b20f7257425dbea0a97ab6a53941e7ccdc9168ba3b0f8b39d1ce",
      "0x137e2eb39d5b20f7257425dbea0a97ab6a53941e7ccdc9168ba3b0f8b39d1ce",
      "0",
    ],
  });
  console.log("✅ Transaction successful.");

  // declare and deploy the EIC (external initializer contract)
  // this is a method used to upgrade contracts in Starknet's proxy version'
  // however, I couldn't find the code of this contract
  // https://sepolia.starkscan.co/tx/0x03e50d969b41bc98e4da481ec7a48151bb0738137473f8f32f52fa317b9a9fe4
  console.log("ℹ️ Sending transaction to declare and deploy EIC contract...");
  let eic_declare_deploy = await account.declareAndDeploy({
    contract: require("./artifacts/eic_eth_token.sierra.json"),
    casm: require("./artifacts/eic_eth_token.casm.json"),
    constructorCalldata: [],
  });
  console.log("✅ Transaction successful.");

  // add_implementation to bridge contarct before we upgrade
  // https://sepolia.starkscan.co/tx/0x064ab87819a2f8ebf91176eeb901f842c23ef6c97c107fe31b14defa352ba045
  console.log(
    "ℹ️ Sending transaction to add implementation to bridge contract..."
  );
  let eth_bridge = new Contract(
    require("./artifacts/bridge_proxy_legacy.json").abi,
    l2_eth_token_address,
    account
  );
  let add_implementation_calldata = eth_bridge.populate("add_implementation", [
    new_erc20_declare_deploy.deploy.address,
    eic_declare_deploy.deploy.address,
    [], // init vector
    0, // final
  ]);
  let add_implementation_txn_hash = await eth_bridge.add_implementation(
    add_implementation_calldata.calldata
  );
  await waitForTransactionSuccess(add_implementation_txn_hash.transaction_hash);
  console.log("✅ Transaction successful.");

  // upgrade ETH token contract
  // https://sepolia.starkscan.co/tx/0x03115f88d0d2e97be5e752ff12c4e2f537ca0dcec92ad49b77d3d329efcd1c9f
  console.log("ℹ️ Sending transaction to upgrade ETH token contract...");
  let upgrade_txn_hash = await eth_bridge.upgrade_to(
    // the calldata is the same
    add_implementation_calldata.calldata
  );
  await waitForTransactionSuccess(upgrade_txn_hash.transaction_hash);
  console.log("✅ Transaction successful.");

  // now add a new implementation to the bridge contract for the erc20 class hash
  // https://sepolia.starkscan.co/tx/0x051cc24816ec349c601bbd4e9afc8e0a8c7a93061aba372045bbf7e5d35aff7a
  console.log(
    "ℹ️ Sending transaction to add new implementation to bridge contract..."
  );
  let add_new_implementation_txn_hash = await account.execute([
    {
      contractAddress: l2_eth_token_address,
      entrypoint: "add_new_implementation",
      calldata: [
        // class hash of new_eth_token
        new_erc20_declare_deploy.declare.class_hash,
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
      contractAddress: l2_eth_token_address,
      entrypoint: "replace_to",
      calldata: [
        // class hash of new_eth_token
        new_erc20_declare_deploy.declare.class_hash,
        "0x1",
        "0x0",
      ],
    },
  ]);
  await waitForTransactionSuccess(replace_to_txn_hash.transaction_hash);
  console.log("✅ Transaction successful.");
}
