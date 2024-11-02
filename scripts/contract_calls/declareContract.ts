import { Account, RpcProvider, json } from "starknet";
import { readFileSync } from "fs";
import { L2_ACCOUNT_ADDRESS, L2_ACCOUNT_PK, L2_RPC_URL } from "../constants";

const provider = new RpcProvider({
  nodeUrl: L2_RPC_URL,
});

const account = new Account(provider, L2_ACCOUNT_ADDRESS, L2_ACCOUNT_PK);

const json_sierra_data = readFileSync(
  __dirname + "/../../contracts/HelloStarknet.sierra.json",
  "utf8"
);
const json_casm_data = readFileSync(
  __dirname + "/../../contracts/HelloStarknet.casm.json",
  "utf8"
);

const compiledERC20Sierra = json.parse(json_sierra_data);
const compiledERC20Casm = json.parse(json_casm_data);

async function main() {
  let res = await account.declare(
    {
      contract: compiledERC20Sierra,
      casm: compiledERC20Casm,
    },
    {
      nonce: await provider.getNonceForAddress(L2_ACCOUNT_ADDRESS),
    }
  );

  console.log("Txn hash - ", res);

  await provider.waitForTransaction(res.transaction_hash);
}

main();
