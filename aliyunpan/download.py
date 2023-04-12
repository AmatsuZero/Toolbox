from aligo import Aligo


def download_dir(folder_id: str, dst: str) -> None:
    aligo = Aligo()
    aligo.download_folder(folder_id, dst)
