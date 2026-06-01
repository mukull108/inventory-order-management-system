from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import schemas, services
from app.config import get_settings
from app.database import Base, engine, get_db


settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Inventory & Order Management API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/products", response_model=list[schemas.ProductRead])
def get_products(db: Session = Depends(get_db)):
    return services.list_products(db)


@app.post("/products", response_model=schemas.ProductRead, status_code=201)
def post_product(payload: schemas.ProductCreate, db: Session = Depends(get_db)):
    return services.create_product(db, payload)


@app.put("/products/{product_id}", response_model=schemas.ProductRead)
def put_product(product_id: int, payload: schemas.ProductUpdate, db: Session = Depends(get_db)):
    return services.update_product(db, product_id, payload)


@app.get("/customers", response_model=list[schemas.CustomerRead])
def get_customers(db: Session = Depends(get_db)):
    return services.list_customers(db)


@app.post("/customers", response_model=schemas.CustomerRead, status_code=201)
def post_customer(payload: schemas.CustomerCreate, db: Session = Depends(get_db)):
    return services.create_customer(db, payload)


@app.put("/customers/{customer_id}", response_model=schemas.CustomerRead)
def put_customer(customer_id: int, payload: schemas.CustomerUpdate, db: Session = Depends(get_db)):
    return services.update_customer(db, payload=payload, customer_id=customer_id)


@app.get("/orders", response_model=list[schemas.OrderRead])
def get_orders(db: Session = Depends(get_db)):
    return services.list_orders(db)


@app.post("/orders", response_model=schemas.OrderRead, status_code=201)
def post_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)):
    return services.create_order(db, payload)
