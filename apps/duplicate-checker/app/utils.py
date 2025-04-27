import os
import hashlib
import faiss
import numpy as np
from imagehash import dhash
from PIL import Image
from io import BytesIO
from faiss import IndexBinaryFlat

# ----------------------------------------------------------------------
# 1. Работа с индексом faiss
# ----------------------------------------------------------------------
def load_index(filename: str = 'faiss_index', hash_size: int = 16) -> IndexBinaryFlat:
    d = hash_size**2
    try:
        return faiss.read_index_binary(f'{filename}_{d}')
    except RuntimeError:
        return faiss.IndexBinaryFlat(d)

def save_index(index: IndexBinaryFlat, filename: str = 'faiss_index', hash_size: int = 16) -> None:
    d = hash_size**2
    faiss.write_index_binary(index, f'{filename}_{d}')

# ----------------------------------------------------------------------
# 2. Хеширование 2D-изображения (если в gltf есть встроенные изображения)
# ----------------------------------------------------------------------
def hash_image(image: Image.Image, hash_size: int) -> np.ndarray:
    # DHash
    im_hash = dhash(image, hash_size=hash_size)
    # dHash выдаёт объект, у которого есть атрибут .hash (это numpy-массив bool)
    # Превращаем bool-массив (hash_size*hash_size) в packed bits
    return np.packbits(np.array(im_hash.hash).reshape(1, hash_size**2), axis=1)

def read_imagefile(file_bytes: bytes) -> Image.Image:
    return Image.open(BytesIO(file_bytes))

# ----------------------------------------------------------------------
# 3. Хеширование бинарного файла (если это .glb без изображений)
# ----------------------------------------------------------------------
def hash_binary(data: bytes, hash_size: int = 16) -> np.ndarray:
    # Возьмём SHA-256, превратим в массив бинарных значений
    file_hash = hashlib.sha256(data).digest()
    # Превратим первые hash_size^2 бит в packed bits
    # Для упрощения: возьмём первые (hash_size^2) бит
    bit_length = hash_size**2
    # Превратим hash в двоичную строку
    full_bin_str = ''.join(f'{byte:08b}' for byte in file_hash)
    # Обрежем до нужного количества бит
    truncated_bin_str = full_bin_str[:bit_length]
    # Превратим в int-массив
    arr = np.array(list(map(int, truncated_bin_str))).reshape(1, bit_length)
    packed = np.packbits(arr, axis=1)
    return packed

def check_duplicate(index: IndexBinaryFlat, data: np.ndarray, thresh: int) -> bool:
    # range_search ищет в радиусе Hamming distance == thresh
    lims, D, I = index.range_search(data, thresh)
    print(lims, len(D), I)
    # Если lims указывает, что найдено совпадение, значит есть похожий 
    # (Мы смотрим на количество элементов, попавших в диапазон)
    # lims - массив, где lims[i] и lims[i+1] - границы результатов для i
    # если lims[0] < lims[1], значит что-то найдено
    # АЛЬТЕРНАТИВНЫЙ ПУТЬ: return len(D) > 0
    return (lims[1] - lims[0]) > 0