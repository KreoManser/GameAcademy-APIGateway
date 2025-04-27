from pydantic import BaseModel
from typing import List

class CheckResponse(BaseModel):
    duplicated: bool

class AddResponse(BaseModel):
    added: List[str]