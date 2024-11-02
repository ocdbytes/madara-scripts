import { Contract, JsonRpcProvider, parseEther, Wallet } from "ethers";
import { getAppChainBalance } from "./utils";
import { ETH_PRIV_KEY, L1_RPC_URL } from "../constants";

const eth_provider = new JsonRpcProvider(L1_RPC_URL);
const wallet = new Wallet(ETH_PRIV_KEY, eth_provider);

export async function bridgeToChain(
  bridge_address: string,
  starnet_account_address: string
) {
  // call deposit function with 10 as argument and also send 10 eth to the contract
  const contract = new Contract(
    bridge_address,
    ["function deposit(uint256, uint256)"],
    wallet
  );

  const initial_app_chain_balance = await getAppChainBalance(
    starnet_account_address
  );
  const tx = await contract.deposit(
    parseEther("0.1"),
    starnet_account_address,
    { value: parseEther("0.15") }
  );

  tx.wait();
  // wait for the transaction to be successful
  console.log("✅ Successfully sent 1 ETH on L1 bridge");

  let counter = 10;
  while (counter--) {
    const final_app_chain_balance = await getAppChainBalance(
      starnet_account_address
    );
    if (final_app_chain_balance > initial_app_chain_balance) {
      console.log(
        "💰 App chain balance:",
        (final_app_chain_balance / 10 ** 18).toString(),
        "ETH"
      );
      return;
    }
    console.log("🔄 Waiting for funds to arrive on app chain...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  console.log("❌ Failed to get funds on app chain");
  process.exit(1);
}
