from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
# from sqlalchemy import text
from app.core.config import settings
# Database Engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)
class Base(DeclarativeBase):
    pass
# Database Session Factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
# FastAPI database dependency
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
        
# print("Database engine created successfully")

# with engine.connect() as connection:
#     result = connection.execute(text("select 1"))
#     print(result.scalar())