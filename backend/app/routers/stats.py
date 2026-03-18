from fastapi import APIRouter

from app.models.schemas import StatsEvent
from app.services.stats_service import append_stat

router = APIRouter()


@router.post("/stats")
async def record_stats(event: StatsEvent):
    append_stat(event.model_dump())
    return {"ok": True}
