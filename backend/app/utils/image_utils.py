
from fastapi import UploadFile
import shutil
from pathlib import Path
from PIL import Image

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def save_upload_file(upload_file: UploadFile, destination: Path) -> str:
    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()
    return str(destination)

def process_image(image_path: Path, max_size: tuple[int, int] = (800, 800)):
    with Image.open(image_path) as img:
        img.thumbnail(max_size)
        img.save(image_path)
