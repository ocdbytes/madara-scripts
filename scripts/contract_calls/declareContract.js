import { Account, RpcProvider, hash, CallData, Contract, json } from "starknet";
import { readFileSync } from "fs";

const provider = new RpcProvider({
  nodeUrl: "http://localhost:9944",
});

const account_0_address =
  "0x63cea32ab068f7ca8b51df44cfb91f6f38a4ab467d4fcc073b06aa7041bdf84";
const account_0_pk =
  "0x297c53b2998da162e534aacaed1ab468f369b78e4cdf06214c95e9aa438371c";

const account = new Account(provider, account_0_address, account_0_pk);

const json_sierra_data = readFileSync(
  "/Users/ocdbytes/Karnot/testing_madara_scripts/contracts/ERC20.sierra.json",
  "utf8"
);
const json_casm_data = readFileSync(
  "/Users/ocdbytes/Karnot/testing_madara_scripts/contracts/ERC20.casm.json",
  "utf8"
);

const compiledERC20Sierra = json.parse(json_sierra_data);
const compiledERC20Casm = json.parse(json_casm_data);

async function main() {
  let res = await account.declare(
    {
      contract: compiledERC20Sierra,
      casm: compiledERC20Casm
    },
    {
      nonce: 1,
      maxFee: "2870302852309280000",
    }
  );

  console.log("Txn hash - ", res);

  await provider.waitForTransaction(res.transaction_hash);
}

main();
