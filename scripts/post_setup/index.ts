import { CompiledSierra, RpcProvider } from "starknet";
import {
  ETH_ADDRESS,
  L1_BRIDGE_ADDRESS,
  L2_ACCOUNT_ADDRESS,
  L2_ACCOUNT_PK,
  L2_ETH_BRIDGE_ADDRESS,
  L2_RPC_URL,
  STRK_CORE_CONTRACT,
} from "../constants";
import { bridgeToChain } from "./bridge_to_l2";
import {
  calculatePrefactualAccountAddress,
  deployStarknetAccount,
  getAppChainBalance,
  setupMongoDb,
  transfer,
  validateBlockPassesSnosChecks,
} from "./utils";
import { upgradeETHToken } from "./upgrade_eth_token";
import { upgradeETHBridge } from "./upgrade_eth_bridge";
import { overrideStateOnCoreContract } from "./update_core_contract_state";

const l1_bridge_address = L1_BRIDGE_ADDRESS;
const core_contract_address = STRK_CORE_CONTRACT;
const l2_eth_token_address = ETH_ADDRESS;
const l2_eth_bridge_address = L2_ETH_BRIDGE_ADDRESS;
const bootstrapper_address = L2_ACCOUNT_ADDRESS;
const bootstrapper_private_key = L2_ACCOUNT_PK;

const starknet_provider = new RpcProvider({
  nodeUrl: L2_RPC_URL,
});

const main = async () => {
  let bootstrapper_address_balance = await getAppChainBalance(
    bootstrapper_address
  );

  // Bridging to L2
  if (bootstrapper_address_balance < 10 ** 17) {
    await bridgeToChain(l1_bridge_address, bootstrapper_address);
  } else {
    console.log("ℹ️ Bootstrapping account has enough funds, proceeding");
  }

  // upgrade ETH token to Cairo 1 as SNOS breaks otherwise
  const eth_token_class = (await starknet_provider.getClassAt(
    l2_eth_token_address
  )) as CompiledSierra;
  if (eth_token_class.sierra_program) {
    console.log("ℹ️ Eth token is already upgraded, proceeding");
  } else {
    await upgradeETHToken(
      l2_eth_token_address,
      bootstrapper_private_key,
      bootstrapper_address
    );
  }

  // upgrade ETH bridge to Cairo 1 as well
  const l2_eth_bridge_class = (await starknet_provider.getClassAt(
    l2_eth_bridge_address
  )) as CompiledSierra;
  if (l2_eth_bridge_class.sierra_program) {
    console.log("ℹ️ Eth bridge is already upgraded, proceeding");
  } else {
    await upgradeETHBridge(
      l2_eth_bridge_address,
      bootstrapper_private_key,
      bootstrapper_address
    );
  }

  const {
    address: starknet_account_address,
    private_key: starknet_account_private_key,
    public_key: starknet_account_public_key,
  } = calculatePrefactualAccountAddress();
  console.log(
    "🏦 Starknet expected account address:",
    starknet_account_address
  );

  await bridgeToChain(l1_bridge_address, starknet_account_address);

  let block_number = await deployStarknetAccount(
    starknet_account_private_key,
    starknet_account_address,
    starknet_account_public_key
  );

  // SNOS doesn't seem to be able to run on deploy account block
  await starknet_provider.waitForBlock(block_number + 1);

  block_number = await transfer(
    starknet_account_private_key,
    starknet_account_address
  );

  await validateBlockPassesSnosChecks(block_number);

  await overrideStateOnCoreContract(
    (block_number as number) - 1,
    core_contract_address
  );

  await setupMongoDb((block_number as number) - 1);
};

main();
