call %1%
Rem 安装 transformers
pip install git+https://github.com/huggingface/transformers
pip install sentencepiece
pip install peft

Rem 需要 protobuf，版本不得高于3.20.x, 否则有报错
pip install protobuf==3.20.2

Rem 其他依赖
pip install -r %2%