from ninja import Schema
from pydantic import EmailStr, field_validator


class RegisterIn(Schema):
    username: str
    email: EmailStr
    password: str
    max_duration_chunk: int | None = None

    @field_validator("username")
    @classmethod
    def clean_username(cls, v: str):
        v = v.strip().lower()
        if not v:
            raise ValueError("username cannot be blank")
        return v

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: EmailStr):
        v = str(v).strip().lower()
        if not v:
            raise ValueError("email cannot be blank")
        return v


class RegisterOut(Schema):
    ok: bool
    id: int | None = None
    username: str | None = None
    email: EmailStr | None = None
    error: str | None = None


class LoginIn(Schema):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def clean_username(cls, v: str):
        v = v.strip().lower()
        if not v:
            raise ValueError("username cannot be blank")
        return v


class TokenOut(Schema):
    ok: bool
    token: str | None = None
    token_type: str = "Bearer"
    error: str | None = None
