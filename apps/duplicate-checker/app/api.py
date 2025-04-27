import os
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from app.models import AddResponse, CheckResponse
from app.utils import (
    load_index, save_index, check_duplicate, hash_image, read_imagefile, hash_binary
)
from PIL import Image

app = FastAPI(title="DuplicateChecker")

origins = ["*"]  # Для упрощения
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------
# 1) Проверка на дубликат
# ---------------------
@app.post("/api/check", response_model=CheckResponse)
async def check_file(
    file: UploadFile = File(...),
    dist: int = Form(10),
    hash_size: int = Form(16),
    index_name: str = Form("faiss_index")
):
    # 1. Считываем файл в память
    contents = await file.read()
    # 2. Загружаем/создаём индекс
    index = load_index(index_name, hash_size)

    # 3. Пробуем понять, это картинка или нет
    # Если это .glb/.gltf => может не открыться PIL
    is_image = False
    try:
        img = Image.open(file.file)
        is_image = True
    except:
        pass

    # 4. Хешируем
    if is_image:
        # Если это удалось открыть как изображение
        im = Image.open(file.filename)  # либо img
        # Но у нас img может уже быть "закрыт", поэтому:
        im = Image.open(file.file)
        im_hash = hash_image(im, hash_size)
    else:
        # Иначе бинарное хеширование
        im_hash = hash_binary(contents, hash_size)

    # 5. Проверка
    duplicated = check_duplicate(index, im_hash, dist)

    # 6. Вернём результат
    return CheckResponse(duplicated=duplicated)

# ---------------------
# 2) Добавление файла (чтобы хранился в индексе)
# ---------------------
@app.post("/api/add", response_model=AddResponse)
async def add_file(
    file: UploadFile = File(...),
    hash_size: int = Form(16),
    index_name: str = Form("faiss_index")
):
    contents = await file.read()
    index = load_index(index_name, hash_size)

    # Аналогичная логика
    is_image = False
    try:
        Image.open(file.file)
        is_image = True
    except:
        pass

    if is_image:
        # Хешируем картинку
        image = Image.open(file.filename)  # Или file.file
        image = Image.open(file.file)
        data = hash_image(image, hash_size)
    else:
        data = hash_binary(contents, hash_size)

    index.add(data)
    save_index(index, hash_size=hash_size)

    return AddResponse(added=[file.filename])