# Install rust
curl https://sh.rustup.rs -sSf | sh; source $HOME/.cargo/env

# Update package list
sudo apt update

# Install dependencies
sudo apt install build-essential cmake git libgit2-dev clang libncurses5-dev libncursesw5-dev zlib1g-dev pkg-config libssl-dev llvm

# Build grin
git clone https://github.com/mimblewimble/grin.git
cd grin
cargo build --release

# Add Grin debug to the path
export PATH=~/grin/target/release:$PATH

# Create server config (testnet == floonet)
grin --floonet server config

# Config changes
api_http_addr = "0.0.0.0:13413"
enable_stratum_server = true
stratum_server_addr = "0.0.0.0:13416"

# Screen
https://gist.github.com/ChrisWills/1337178
remove # New mail notification
add startup_message off
screen

# Listen
grin --floonet wallet init
grin --floonet wallet listen

# Switch screen
Ctrl-A c
Ctrl-A n

# Sync node
grin --floonet server run

# Download miner
git clone https://github.com/mimblewimble/grin-miner.git
cd grin-miner
git submodule update --init
cargo build --release

# Add Grin-miner debug to the path
export PATH=~/grin-miner/target/release:$PATH

# Grin doctor
GRIN_API="localhost:13415"
echo "API is $GRIN_API"

echo "Asking API for chain status..."
curl "http://$GRIN_API/v1/chain"

echo "Asking grin for client status"
grin --floonet client status

echo "Asking API for connected peers"
curl "http://$GRIN_API/v1/peers/connected"

echo "Asking wallet for info"
grin --floonet wallet info
