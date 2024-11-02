import { Account, RpcProvider, Contract } from "starknet";
import ERC20 from "../contracts/ERC20.sierra.json";
import {
  ACCOUNT_0_ADDRESS,
  ACCOUNT_0_PK,
  ETH_ADDRESS,
  L2_RPC_URL,
} from "./constants";

const eth_address = ETH_ADDRESS;
const provider = new RpcProvider({
  nodeUrl: L2_RPC_URL,
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
