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
