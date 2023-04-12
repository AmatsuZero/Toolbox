import tempfile
from typing import Optional
import typer
from aligo import Aligo
from pathlib import Path
from aliyunpan import ERRORS, __app_name__, __version__, config, database, download

app = typer.Typer()


@app.command()
def login(file_path: str = typer.Option(
    str(tempfile.mktemp('.png')),
    "--path",
    "-p",
    prompt="链接保存地址?"),
) -> None:
    """通过二维码登陆阿里云盘"""

    def show(qr_link: str):
        text_file = open(file_path, "w")
        text_file.write(qr_link)
        text_file.close()

    Aligo(show=show)


@app.command()
def init(
        db_path: str = typer.Option(
            str(database.DEFAULT_DB_FILE_PATH),
            "--db-path",
            "-db",
            prompt="to-do database location?",
        ),
) -> None:
    """Initialize the to-do database."""
    app_init_error = config.init_app(db_path)
    if app_init_error:
        typer.secho(
            f'Creating config file failed with "{ERRORS[app_init_error]}"',
            fg=typer.colors.RED,
        )
        raise typer.Exit(1)
    db_init_error = database.init_database(Path(db_path))
    if db_init_error:
        typer.secho(
            f'Creating database failed with "{ERRORS[db_init_error]}"',
            fg=typer.colors.RED,
        )
        raise typer.Exit(1)
    else:
        typer.secho(f"The to-do database is {db_path}", fg=typer.colors.GREEN)


def _version_callback(value: bool) -> None:
    if value:
        typer.echo(f"{__app_name__} v{__version__}")
        raise typer.Exit()


@app.command()
def retrieve_dir(folder_id: str = typer.Option(
    None,
    "--id",
    "-i",
    prompt="文件夹 id ?"), dst: str = typer.Option(
    None,
    "--dst",
    "-d",
    prompt="下载路径")) -> None:
    """下载文件夹"""
    download.download_dir(folder_id, dst)


@app.callback()
def main(
        version: Optional[bool] = typer.Option(
            None,
            "--version",
            "-v",
            help="Show the application's version and exit.",
            callback=_version_callback,
            is_eager=True,
        )
) -> None:
    return