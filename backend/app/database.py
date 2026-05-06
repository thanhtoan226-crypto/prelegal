from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    import os

    db_dir = os.path.dirname(settings.DATABASE_URL.replace("sqlite:///", ""))
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

    Base.metadata.create_all(bind=engine)

    # Seed demo user for fake auth (PRE-4)
    from app.models import User

    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "demo@prelegal.com").first():
            db.add(User(email="demo@prelegal.com", hashed_password="fake"))
            db.commit()
    finally:
        db.close()
