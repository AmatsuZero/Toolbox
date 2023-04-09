#!/usr/bin/env bash
# 启动 venv
echo "🚀 启动 venv"
source "$1"

# 先安装 torch
# 这里参考 webui.sh 配置 torch 和 torchvision
# Check prerequisites
gpu_info=$(ioreg -l | grep PCI 2>/dev/null | grep VGA)
case "$gpu_info" in
    *"Navi 1"*|*"Navi 2"*) export HSA_OVERRIDE_GFX_VERSION=10.3.0
    ;;
    *"Renoir"*) export HSA_OVERRIDE_GFX_VERSION=9.0.0
        printf "\n%s\n" "${delimiter}"
        printf "Experimental support for Renoir: make sure to have at least 4GB of VRAM and 10GB of RAM or enable cpu mode: --use-cpu all --no-half"
        printf "\n%s\n" "${delimiter}"
    ;;
    *) 
    ;;
esac
if echo "$gpu_info" | grep -q "AMD" && [[ -z "${TORCH_COMMAND}" ]]
then
    export TORCH_COMMAND="pip install torch torchvision --extra-index-url https://download.pytorch.org/whl/rocm5.2"
fi  

# 设置 Homebrew 镜像
export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git"
export HOMEBREW_BOTTLE_DOMAIN="https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles"

# 更新 homebrew
brew update

# 替换仓库上游
for tap in core cask{,-fonts,-drivers,-versions} command-not-found; do
    brew tap --custom-remote --force-auto-update "homebrew/${tap}" "https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-${tap}.git"
done
brew update

# Apple 的 llvm 不支持 -fopenmp 参数，需要配置
CPP=/usr/local/opt/llvm/bin/clang
if [ ! -f "$CPP" ]; then
    echo "安装 llvm 和 libomp"
    brew install llvm libomp
fi

#To use the bundled libc++ please add the following LDFLAGS:
LDFLAGS="-L/usr/local/opt/llvm/lib/c++ -Wl,-rpath,/usr/local/opt/llvm/lib/c++"
export PATH="/usr/local/opt/llvm/bin:$PATH"
export LDFLAGS="-L/usr/local/opt/llvm/lib"
export CPPFLAGS="-I/usr/local/opt/llvm/include"

git submodule update --init --recursive
pip install --verbose --no-deps -e .

echo "xformers has been installed"