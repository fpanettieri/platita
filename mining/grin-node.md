# Update package list & upgrade system
sudo apt update
sudo apt upgrade
sudo reboot

# Install rust
curl https://sh.rustup.rs -sSf | sh; source $HOME/.cargo/env

# Install dependencies
sudo apt install build-essential cmake git libgit2-dev clang libncurses5-dev libncursesw5-dev zlib1g-dev pkg-config libssl-dev llvm

# Build grin
git clone https://github.com/mimblewimble/grin.git
cd grin
cargo build --release

# Create sandbox
mkdir $HOME/sandbox
cd $HOME/sandbox

# Create server config (testnet == floonet)
grin --floonet server config

# Config changes
enable_stratum_server = true

# Download miner
git clone https://github.com/mimblewimble/grin-miner.git
cd grin-miner
git submodule update --init
cargo build

# Run
grin --floonet wallet init
grin --floonet wallet listen
grin --floonet server run
grin-miner --floonet

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

# Add Grin debug to the path
export PATH=$HOME/grin/target/release:$PATH
export PATH=$HOME/grin-miner/target/debug:$PATH
