import { Account, RpcProvider, hash, CallData, Contract, json } from "starknet";
import { readFileSync } from "fs";
import { ACCOUNT_0_ADDRESS, ACCOUNT_0_PK } from "../constants";

const provider = new RpcProvider({
  nodeUrl: "http://localhost:9944",
});

const args = process.argv.slice(2);

const account_0_address = ACCOUNT_0_ADDRESS;
const account_0_pk = ACCOUNT_0_PK;

const account = new Account(provider, account_0_address, account_0_pk);

const json_sierra_data = readFileSync(
  "/Users/ocdbytes/Karnot/testing_madara_scripts/contracts/OpenZeppelinAccountCairoOne.sierra.json",
  "utf8"
);
const json_casm_data = readFileSync(
  "/Users/ocdbytes/Karnot/testing_madara_scripts/contracts/OpenZeppelinAccountCairoOne.casm.json",
  "utf8"
);

const compiledERC20Sierra = json.parse(json_sierra_data);
const compiledERC20Casm = json.parse(json_casm_data);

async function main(nonce) {
  let res = await account.declare(
    {
      contract: compiledERC20Sierra,
      casm: compiledERC20Casm,
    },
    {
      nonce: nonce,
      maxFee: "2870302852309280000",
    }
  );

  console.log("Txn hash - ", res);

  await provider.waitForTransaction(res.transaction_hash);
}

main(args[0]);
