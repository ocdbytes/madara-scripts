import {
  Account,
  RpcProvider,
  hash,
  CallData,
  Contract,
  json,
  byteArray,
} from "starknet";
import { readFileSync } from "fs";
import {
  ACCOUNT_0_ADDRESS,
  ACCOUNT_0_PK,
  ERC20_CONTRACT_CLASS_HASH,
} from "../constants";

const provider = new RpcProvider({
  nodeUrl: "http://localhost:9944",
});

const account_0_address = ACCOUNT_0_ADDRESS;
const account_0_pk = ACCOUNT_0_PK;

const account = new Account(provider, account_0_address, account_0_pk);

const json_sierra_data = readFileSync(
  "/Users/ocdbytes/Karnot/testing_madara_scripts/contracts/ERC20.sierra.json",
  "utf8"
);

const compiledERC20Sierra = json.parse(json_sierra_data);

async function main() {
  let res = await account.deployContract(
    {
      classHash: ERC20_CONTRACT_CLASS_HASH,
      constructorCalldata: CallData.compile({
        name: byteArray.byteArrayFromString("zkSTARK Token"),
        symbol: byteArray.byteArrayFromString("zkSTARK"),
        fixed_supply: { low: "1000000000000000000", high: "0" },
        recipient: account_0_address,
        owner: account_0_address,
      }),
    },
    {
      nonce: await provider.getNonceForAddress(account_0_address),
      maxFee: "2870302852309280000",
    }
  );

  console.log(">>>>>", res);

  await provider.waitForTransaction(res.transaction_hash);

  let txn_r = await provider.getTransactionReceipt(res.transaction_hash);

  console.log("Txn hash - ", txn_r);
  console.log("Contract Deployed...");
}

main();
