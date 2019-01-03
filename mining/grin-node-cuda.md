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
cargo build
cargo build --release

# Create sandbox
mkdir $HOME/sandbox
cd $HOME/sandbox

# Create server config (testnet == floonet)
grin --floonet server config

# Config changes
enable_stratum_server = true

# Screen
https://gist.github.com/ChrisWills/1337178
remove # New mail notification
add # startup_message off
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


# Download Cuda
https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&target_distro=Ubuntu&target_version=1804&target_type=deblocal

sudo dpkg -i cuda-repo-ubuntu1804-10-0-local-10.0.130-410.48_1.0-1_amd64.deb
sudo apt-key add /var/cuda-repo-<version>/7fa2af80.pub
sudo apt update
sudo apt install cuda

# After migrating it to GPU powered machine
screen
cd sandbox
grin --floonet wallet listen
grin --floonet server run
cp ../grin-miner/grin-miner.toml ./
grin-miner --floonet

# Upgrade grin to use CUDA
https://www.grin-forum.org/t/how-to-mine-cuckoo-30-in-grin-help-us-test-and-collect-stats/152

# Check NVIDIA stats
nvidia-smi

# Compile with gcc-6
which gcc-6
CUDA_HOST_COMPILER=/usr/bin/gcc-6 cargo build --release
