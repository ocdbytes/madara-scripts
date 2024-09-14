import {
  Account,
  RpcProvider,
  hash,
  CallData,
  Contract,
  json,
  ec,
} from "starknet";
import { readFileSync } from "fs";
import {
  ACCOUNT_CONTRACT_CLASS_HASH,
  ETH_ADDRESS,
  SENDER_ACCOUNT_ADDRESS,
  SENDER_ACCOUNT_PK,
  STRK_ADDRESS,
} from "../constants";

const provider = new RpcProvider({
  nodeUrl: "http://localhost:9944",
});

const account_sender_address = SENDER_ACCOUNT_ADDRESS;
const account_sender_pk = SENDER_ACCOUNT_PK;

const account = new Account(
  provider,
  account_sender_address,
  account_sender_pk
);

const json_data = readFileSync(
  __dirname + "/../../contracts/ERC20.sierra.json",
  "utf8"
);

const contract_eth = new Contract(
  json.parse(json_data).abi,
  ETH_ADDRESS,
  provider
);
const contract_strk = new Contract(
  json.parse(json_data).abi,
  STRK_ADDRESS,
  provider
);

async function transfer_funds(contractAddress: string) {
  let hash_0 = await account.execute(
    contract_eth.populate("transfer", [
      contractAddress,
      "100000000000000000000",
    ]),
    {
      nonce: await provider.getNonceForAddress(account_sender_address),
      maxFee: "2870302852309280000",
    }
  );

  console.log("Txn hash - ", hash_0);
  await provider.waitForTransaction(hash_0.transaction_hash);

  let hash_1 = await account.execute(
    contract_strk.populate("transfer", [
      contractAddress,
      "100000000000000000000",
    ]),
    {
      nonce: await provider.getNonceForAddress(account_sender_address),
      maxFee: "2870302852309280000",
    }
  );

  console.log("Txn hash - ", hash_1);
  await provider.waitForTransaction(hash_1.transaction_hash);

  console.log(
    ">>> balance_sender_final [ETH]",
    await contract_eth.balanceOf(account_sender_address)
  );
  console.log(
    ">>> balance_reciever_final [ETH]",
    await contract_eth.balanceOf(contractAddress)
  );
  console.log(
    ">>> balance_sender_final [STRK]",
    await contract_strk.balanceOf(account_sender_address)
  );
  console.log(
    ">>> balance_reciever_final [STRK]",
    await contract_strk.balanceOf(contractAddress)
  );
}

async function main() {
  const privateKey =
    "0x297c53b2998da162e534aacaed1ab468f369b78e4cdf06214c95e9aa438371c";
  console.log("New OZ account:\nprivateKey =", privateKey);
  const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
  console.log("publicKey =", starkKeyPub);

  const accountClassHash = ACCOUNT_CONTRACT_CLASS_HASH;

  try {
    const accountConstructorCallData = CallData.compile({
      publicKey: starkKeyPub,
    });

    const contractAddress = hash.calculateContractAddressFromHash(
      starkKeyPub,
      accountClassHash,
      accountConstructorCallData,
      0
    );

    console.log("Precalculated account address =", contractAddress);
    await transfer_funds(contractAddress);

    const account = new Account(provider, contractAddress, privateKey);

    const { transaction_hash, contract_address } = await account.deployAccount(
      {
        classHash: accountClassHash,
        constructorCalldata: accountConstructorCallData,
        addressSalt: starkKeyPub,
      },
      {
        nonce: 0,
        maxFee: "2870302852309280000",
      }
    );

    await provider.waitForTransaction(transaction_hash);

    console.log(
      "✅ New OpenZeppelin account created.\n   address =",
      contract_address
    );
  } catch (err) {
    console.log("Error : ", err);
  }
}

main();
