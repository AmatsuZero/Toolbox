#!/usr/bin/env bash

pip install git+https://github.com/huggingface/transformers
pip install sentencepiece
pip install peft

# 安装云盘依赖
pip install -r "$1"