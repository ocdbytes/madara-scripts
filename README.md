# Scripts for madara

> [!IMPORTANT]
> You need to update the SENDER_ACCOUNT_ADDRESS, SENDER_ACCOUNT_PK
> in [constants.ts](./scripts/constants.ts) everytime you
> are running madara as devnet addresses are not yet constant
> everytime.

```diff
-⠀⠀⣀⣀⣀⣠⣤⣤⣤⠤⡀⠀⠀⠀⠀⠀⠀⠀⠀
-⣠⣤⣤⣤⡤⢴⡶⠶⣤⣄⣉⠙⣦⡀⠀⠀⠀⠀⠀
-⢨⣭⣭⡅⣼⣿⣿⡇⠈⢻⣮⡑⣦⡙⢦⣄⡀⠀⠀
-⣄⢻⣿⣧⠻⠇⠋⠀⠛⠀⢘⣿⢰⣿⣦⡀⢍⣂⠀
-⠈⣃⡙⢿⣧⣙⠶⣿⣿⡷⢘⣡⣿⣿⣿⣿⣆⠹⠂
-⠀⠈⠳⡀⠉⠻⣿⣶⣶⡾⠿⠿⠿⠿⠛⠋⣉⡴⠀
-⠀⠀⠀⠀⠈⠓⠦⠤⠀⠀⠐⠖⠉⠛⠛⠛⠋⠉⠀
```

- Madara Repo Link : [Git Repo :)](https://github.com/madara-alliance/madara)
- To run the madara sequencer :

  ```sh
  cargo run --release \
  -- --name madara \
  --base-path ../madara6 \
  --network sepolia \
  --authority \
  --telemetry-disabled \
  --rpc-port 9944 \
  --rpc-cors "*" \
  --rpc-external \
  --devnet \
  --l1-endpoint https://sepolia.infura.io/v3/$INFURA_API_KEY
  ```
