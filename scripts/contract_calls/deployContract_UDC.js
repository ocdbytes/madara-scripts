import {
  Account,
  RpcProvider,
  hash,
  CallData,
  Contract,
  num,
  json,
  byteArray,
  cairo,
} from "starknet";
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
  "/Users/ocdbytes/Karnot/testing_madara_scripts/contracts/UDC.sierra.json",
  "utf8"
);

const UDC_address =
  "0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf";

const compiledUDCSierra = json.parse(json_sierra_data);

async function main() {
  let udc_contract = new Contract(compiledUDCSierra.abi, UDC_address, account);

  let populated_txn = udc_contract.populate("deploy_contract", [
    "0x233e7094e9e971bf0a5c0d999e7f2ae4f820dcb1304c00e3589a913423ab204",
    "12345",
    false,
    CallData.compile({
      name: byteArray.byteArrayFromString("zkSTRK"),
      symbol: byteArray.byteArrayFromString("zkSTRK"),
      fixed_supply: cairo.uint256(100 * 10 ** 18),
      recipient: account_0_address,
      owner: account_0_address,
    }),
  ]);

  let res = await account.execute(populated_txn, {
    nonce: 15,
    maxFee: "2870302852309280000",
  });

  console.log(">>>>> res : ", res);

  await provider.waitForTransaction(res.transaction_hash);
  let txn_r = await provider.getTransactionReceipt(res.transaction_hash);
  console.log("Txn hash - ", txn_r);
  console.log("Contract Deployed...");

  //   let addr = hash.calculateContractAddressFromHash(
  //     "12345",
  //     "0x233e7094e9e971bf0a5c0d999e7f2ae4f820dcb1304c00e3589a913423ab204",
  //     [
  //       byteArray.byteArrayFromString("zkSTRK"),
  //       byteArray.byteArrayFromString("zkSTRK"),
  //       cairo.uint256(100 * 10 ** 18),
  //       account_0_address,
  //       account_0_address,
  //     ],
  //     account_0_address
  //   );

  //   console.log(">>>> address : ", addr);

  let events = await provider.getEvents({
    from_block: { block_number: 0 },
    to_block: {
      block_number: (await provider.getBlock("latest")).block_number,
    },
    chunk_size: 100,
    address: UDC_address,
  });

  console.log(">>>> events : ", events);
}

main();

// Deployed Contract : 0x57c2f767887a0f7028298b8ec94a6b3eb1424b6e68bb70a5a7eb6b249d43eb0
// Deployed Contract : 0x4388385eb322f12e58c4ee0dff3b0d893789064e3355a04eaf635320044731e
// Deployed Contract : 0x43ef4efb127b8c74b310e9f4909d7a4478fe09cb95ff26b3f9010d389776344
