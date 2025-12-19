from __future__ import annotations

from datetime import datetime
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.session import Base


class ClickEvent(Base):
    __tablename__ = "click_events"
    __table_args__ = (
        Index("ix_click_events_link_clicked_at", "link_id", "clicked_at"),
        Index("ix_click_events_clicked_at", "clicked_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    link_id: Mapped[int] = mapped_column(
        ForeignKey("links.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    clicked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    referrer_host: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    ua_raw: Mapped[str | None] = mapped_column(
        String(1024),
        nullable=True,
    )

    visitor_hash: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(2),
        nullable=True,
    )

    # relationships
    link: Mapped["Link"] = relationship(back_populates="click_events")

