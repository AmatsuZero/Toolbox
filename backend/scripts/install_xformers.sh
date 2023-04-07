#!/usr/bin/env bash

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

which clang
# 启动 venv
echo "🚀 启动 venv"
source "$1"

git submodule update --init --recursive
pip install --verbose --no-deps -e .