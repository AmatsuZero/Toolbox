#!/usr/bin/env bash
# 启动 venv

echo "🚀 启动 venv"
source "$1"

pip install git+https://github.com/huggingface/transformers
pip install sentencepiece
pip install peft

# 通过云盘下载模型
pip install -U aligo