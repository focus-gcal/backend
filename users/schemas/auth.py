from ninja import Schema
from pydantic import field_validator


class RegisterIn(Schema):
    username: str
    email: str
    password: str
    max_duration_chunk: int | None = None


class RegisterOut(Schema):
    ok: bool
    id: int | None = None
    username: str | None = None
    email: str | None = None
    error: str | None = None


@field_validator("username")
@classmethod
def clean_username(cls, v: str):
    v = v.strip()
    if not v:
        raise ValueError("username cannot be blank")
    return v


@field_validator("email")
@classmethod
def clean_email(cls, v: str):
    v = v.strip().lower()
    if not v:
        raise ValueError("email cannot be blank")
    return v


class LoginIn(Schema):
    username: str
    password: str


class TokenOut(Schema):
    ok: bool
    token: str | None = None
    token_type: str | None = None
    error: str | None = None
