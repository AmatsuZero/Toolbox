import json
import sys
from aligo import Aligo

params = sys.argv[1:]  # 第一个参数是文件
args = {}

for arg in params:
    arr = arg.split("=")
    args[arr[0]] = arr[1]

ali = Aligo(name=args["name"],
            port=int(args["port"]) if args.get("port") is None else None)

# 获取网盘根目录文件列表
ll = ali.get_file_list()
files = map(lambda f: {
    "fileId": f.file_id,
    "url": f.url,
    "downloadUrl": f.download_url,
    "type": f.type,
    "name": f.name
}, ll)

print(json.dumps({"data": list(files)}))
