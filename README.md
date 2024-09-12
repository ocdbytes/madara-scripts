# Scripts for madara

```diff
-⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣴⠶⠞⠛⠛⠛⠛⠻⠶⢶⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀
-⠀⠀⠀⠀⠀⣠⣴⠟⠋⠁⠀⠀⠀⠀⠀⣀⣀⠀⠀⠀⠈⠉⠻⢶⣄⠀⠀⠀⠀⠀
-⠀⠀⠀⣠⡾⠋⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⣟⠛⠒⠄⠀⠀⠀⠀⠙⢷⣄⠀⠀⠀
-⠀⠀⣴⠟⠀⠀⠀⠀⠀⠀⠀⢀⣰⣿⣿⣿⣿⣆⡀⠀⠀⠀⠀⠀⠀⠀⠹⣧⡀⠀
-⠀⣼⠏⠀⠀⠀⠀⠀⠀⡠⠊⠁⠀⠙⠿⠿⠛⠀⠈⠑⢄⠀⠀⠀⠀⠀⠀⠘⣷⠀
-⢰⡟⠀⠀⠀⠀⠀⢀⠎⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱⡀⠀⠀⠀⠀⠀⢹⣇
-⣾⠃⠀⠀⠀⠀⠀⡜⠀⠀⠀⠀⢠⣶⣿⣿⣷⣄⠀⠀⠀⠀⢳⠀⠀⠀⠀⠀⠀⣿
-⣿⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⣿
-⢿⡄⠀⠀⢠⠀⢀⣷⣶⣤⡀⠀⠘⢿⣿⣿⡿⠋⠀⠀⣠⣴⣾⣄⠀⠀⠀⠀⠀⣿
-⠸⣧⠀⠀⢸⣷⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠰⣿⣿⣿⣿⣧⠀⠀⠀⣸⡏
-⠀⢻⣆⠀⠀⠙⠿⠿⠿⠛⢅⡀⠀⠀⠀⠀⠀⠀⢀⡠⠛⠛⠛⣿⡟⠀⠀⢠⡿⠀
-⠀⠀⢻⣦⠀⠀⠀⠀⠀⠀⠀⠈⠑⠒⠒⠀⠐⠊⠁⠀⠀⡠⠞⠋⠀⠀⣠⡿⠁⠀
-⠀⠀⠀⠙⢷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠋⠀⠀⠀
-⠀⠀⠀⠀⠀⠙⠷⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⡾⠋⠀⠀⠀⠀⠀
-⠀⠀⠀⠀⠀⠀⠀⠈⠉⠛⠷⠶⣦⣤⣤⣤⣤⣤⡶⠾⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀
```

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
  --l1-endpoint https://sepolia.infura.io/v3/bf9e41563a6a45e28eb60382d85ef3c9
  ```