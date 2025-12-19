from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.session import Base


class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"
    __table_args__ = (
        # One external identity (provider + subject) maps to exactly one row
        UniqueConstraint("provider", "provider_user_id", name="uq_provider_user_id"),
        # Optional but recommended: one account per provider per user (1 google per user)
        UniqueConstraint("user_id", "provider", name="uq_user_provider"),
        # Helpful index for lookups by provider + subject
        Index("ix_oauth_provider_subject", "provider", "provider_user_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    provider: Mapped[str] = mapped_column(
        String(50),  # "google", later "github", etc.
        nullable=False,
    )

    # For Google OIDC: this is the "sub" claim (stable unique id for the user in that provider)
    provider_user_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="oauth_accounts")

