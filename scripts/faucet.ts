import { Account, RpcProvider, Contract } from "starknet";
import ERC20 from "../contracts/ERC20.sierra.json";

const eth_address =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const provider = new RpcProvider({
  nodeUrl: "http://localhost:9944",
});
const account = new Account(
  provider,
  "0x4",
  "0x00c1cf1490de1352865301bb8705143f3ef938f97fdf892f1090dcb5ac7bcd1d",
  "1"
);

async function transfer(to: string) {
  const contract = new Contract(ERC20.abi, eth_address, provider);
  let result = contract.populate("transfer", {
    recipient: to,
    amount: {
      low: 1e20,
      high: 0,
    },
  });

  let hash = await account.execute(result, undefined);

  console.log("Txn hash - ", hash);
}

transfer(process.argv[2]);
