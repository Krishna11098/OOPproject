# auth.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MAX_LEN = 72
def hash_password(password: str) -> str:
    return pwd_context.hash(password[:MAX_LEN])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password[:MAX_LEN], hashed_password)
