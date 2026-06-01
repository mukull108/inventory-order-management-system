from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app import models, schemas


def list_products(db: Session) -> list[models.Product]:
    return list(db.scalars(select(models.Product).order_by(models.Product.created_at.desc())))


def create_product(db: Session, payload: schemas.ProductCreate) -> models.Product:
    existing = db.scalar(select(models.Product).where(models.Product.sku == payload.sku))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product SKU already exists.")

    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, payload: schemas.ProductUpdate) -> models.Product:
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    updates = payload.model_dump(exclude_unset=True)
    if "sku" in updates:
        existing = db.scalar(
            select(models.Product).where(
                models.Product.sku == updates["sku"],
                models.Product.id != product_id,
            )
        )
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product SKU already exists.")

    for field, value in updates.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def list_customers(db: Session) -> list[models.Customer]:
    return list(db.scalars(select(models.Customer).order_by(models.Customer.created_at.desc())))


def create_customer(db: Session, payload: schemas.CustomerCreate) -> models.Customer:
    existing = db.scalar(select(models.Customer).where(models.Customer.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Customer email already exists.")

    customer = models.Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def update_customer(db: Session, customer_id: int, payload: schemas.CustomerUpdate) -> models.Customer:
    customer = db.get(models.Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    updates = payload.model_dump(exclude_unset=True)
    if "email" in updates:
        existing = db.scalar(
            select(models.Customer).where(
                models.Customer.email == updates["email"],
                models.Customer.id != customer_id,
            )
        )
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Customer email already exists.")

    for field, value in updates.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer


def list_orders(db: Session) -> list[models.Order]:
    stmt = (
        select(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.items).joinedload(models.OrderItem.product),
        )
        .order_by(models.Order.created_at.desc())
    )
    return list(db.scalars(stmt).unique())


def create_order(db: Session, payload: schemas.OrderCreate) -> models.Order:
    customer = db.get(models.Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    product_ids = [item.product_id for item in payload.items]
    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Each product can only appear once per order.",
        )

    order = models.Order(customer_id=payload.customer_id, status="placed", total_amount=Decimal("0.00"))
    db.add(order)

    total_amount = Decimal("0.00")

    for item in payload.items:
        product = db.scalar(
            select(models.Product).where(models.Product.id == item.product_id).with_for_update()
        )
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found.",
            )
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for SKU {product.sku}. Requested {item.quantity}, available {product.stock_quantity}.",
            )

        product.stock_quantity -= item.quantity
        line_total = product.price * item.quantity
        total_amount += line_total

        order_item = models.OrderItem(
            order=order,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price,
            line_total=line_total,
        )
        db.add(order_item)

    order.total_amount = total_amount
    db.commit()

    created_order = db.scalar(
        select(models.Order)
        .where(models.Order.id == order.id)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.items).joinedload(models.OrderItem.product),
        )
    )
    return created_order
