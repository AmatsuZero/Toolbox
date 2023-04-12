#!/usr/bin/env bash
# 启动 venv

echo "🚀 启动 venv"
source "$1"

pip install git+https://github.com/huggingface/transformers
pip install sentencepiece
pip install peft

# 安装云盘依赖
pip install -r "$2"