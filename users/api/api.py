from ninja import Router

from .auth import router as auth_router
from .me import router as me_router

router = Router()
router.add_router("", auth_router)
router.add_router("/me/", me_router)
