import { Account, RpcProvider, Contract } from "starknet";
import ERC20 from "../contracts/ERC20.sierra.json";
import { ACCOUNT_0_ADDRESS, ACCOUNT_0_PK } from "./constants";

const eth_address =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const provider = new RpcProvider({
  nodeUrl: "http://localhost:9944",
});
const account_0_address = ACCOUNT_0_ADDRESS;
const account_0_pk = ACCOUNT_0_PK;

const account = new Account(provider, account_0_address, account_0_pk);

async function transfer(to: string) {
  const contract = new Contract(ERC20.abi, eth_address, provider);
  let result = contract.populate("transfer", {
    recipient: to,
    amount: {
      low: 1,
      high: 0,
    },
  });

  let hash = await account.estimateFee(result);

  console.log("Txn hash - ", hash);
}

transfer(process.argv[2]);
