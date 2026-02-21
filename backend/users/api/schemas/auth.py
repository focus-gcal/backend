from datetime import datetime
from typing import Optional

from ninja import Schema
from pydantic import field_validator


class StateIn(Schema):
    state: str

    @field_validator("state")
    def validate_state(cls, v):
        if not v:
            raise ValueError("State is required")
        return v


class StateOut(Schema):
    ok: bool
    state: str
    error: Optional[str] = None


class OAuthStartIn(Schema):
    code: str
    state: str

    @field_validator("code", "state")
    def validate_code_and_state(cls, v):
        if not v["code"] or not v["state"]:
            raise ValueError("Code and state are required")
        return v


class OAuthStartOut(Schema):
    jwt_token: str
    expiry_date: datetime
    ok: bool


class OAuthStartError(Schema):
    ok: bool
    error: str
