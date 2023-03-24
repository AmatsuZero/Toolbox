import sys
from aligo import Aligo


def show(qr_link: str):
    tmp_file = sys.argv[1]
    text_file = open(tmp_file, "w")
    text_file.write(qr_link)
    text_file.close()


ali = Aligo(show=show)
