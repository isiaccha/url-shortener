from __future__ import annotations

from datetime import datetime
from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.session import Base


class Link(Base):
    __tablename__ = "links"
    __table_args__ = (
        UniqueConstraint("slug", name="uq_links_slug"),
        Index("ix_links_user_created_at", "user_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    slug: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True, # must be nullable with how we calculate the slug using id
    )

    target_url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    click_count: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        server_default="0",
    )

    last_clicked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # relationships
    user: Mapped["User"] = relationship(back_populates="links")

    click_events: Mapped[list["ClickEvent"]] = relationship(
        back_populates="link",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

