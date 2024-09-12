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
  "/Users/ocdbytes/Karnot/testing_madara_scripts/madara-get-started/contracts/ERC20.sierra.json",
  "utf8"
);

const compiledERC20Sierra = json.parse(json_sierra_data);

async function main() {
  let res = await account.deployContract(
    {
      classHash:
        "0x233e7094e9e971bf0a5c0d999e7f2ae4f820dcb1304c00e3589a913423ab204",
      constructorCalldata: CallData.compile({
        name: "zkSTRK",
        symbol: "zkSTRK",
        fixed_supply: "1000000000000000000",
        recipient: account_0_address,
        owner: account_0_address,
      }),
    },
    {
      nonce: 9,
      maxFee: "2870302852309280000",
    }
  );

  await provider.waitForTransaction(res.transaction_hash);

  let txn_r = await provider.getTransactionReceipt(res.transaction_hash);

  console.log("Txn hash - ", txn_r);
  console.log("Contract Deployed...");
}

main();
