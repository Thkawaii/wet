#Start API -> uvicorn main:app --host 0.0.0.0 --port 8000 --reload
#Go Run -> go run main.go
#frint end -> npm run dev 
from fastapi import *
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import pandas as pd
import json
from pydantic import BaseModel
import sqlite3
from sqlalchemy import create_engine
from datetime import datetime

app = FastAPI(
    prefix="/Cabana",
    title="Cabana API",
    tags=["Cabana API"],
    responses={404: {"message": "Not found"}},
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AddPayment(BaseModel):
    amount: float
    istype: str
    method: str
    date: str
    booking_id: int = 1
    promotion_id: int = 1

class AddComment(BaseModel):
    rating: int
    comment: str
    booking_id: int = 1
    passenger_id: int = 1
    driver_id: int = 1

class DeleteReview(BaseModel):
    review_id: int

class EditReviews(BaseModel):
    review_id: int
    review_id: int
    rating: int
    comment: str
    booking_id: int
    passenger_id: int
    driver_id: int

database_path = "cabana.db"
engine = sqlite3.connect(database_path, timeout=1, check_same_thread=False)

def insertPaidsCard(method, last_id):
    cursor = engine.cursor()
    cursor.execute(f"""
        INSERT INTO
            paids (card_type, payment_id)
        VALUES ('{method}', {last_id})     
    """)
    engine.commit()
def getDateNow():
    now = datetime.now()
    return now.strftime("%Y-%m-%d %H:%M:%S")
    
@app.get("/", include_in_schema=False)
async def index():
    try:
        return RedirectResponse("/docs")
    except:
        return { "message": "Unable to connect" }

@app.post("/add/payment", tags=['Payment'])
async def add_pay(item: AddPayment):
    toDay = getDateNow()
    sql = f"""
        INSERT INTO
            payments (
                payment_amount,
                payment_method,
                payment_date,
                booking_id,
                promotion_id, 
                create_at
            )
        VALUES (
            {item.amount},
            '{item.method}',
            '{item.date}',
            {item.booking_id},
            {item.promotion_id},
            '{toDay}'
        )
    """
    try:
        cursor = engine.cursor()
        cursor.execute(sql)
        engine.commit()
        last_id = cursor.lastrowid
        if item.istype == "card":
            insertPaidsCard(item.method, last_id)
            
        return {'message': 'success', 'id': int(last_id)}
    except Exception as e:
        return {'message': e}

@app.post("/add/comment", tags=['Review'])
async def add_comment(item: AddComment):
    sql = f"""
        INSERT INTO
            reviews (
                rating,
                comment,
                booking_id,
                passenger_id,
                driver_id
            )
        VALUES (
            {item.rating},
            '{item.comment}',
            '{item.booking_id}',
            {item.passenger_id},
            {item.driver_id}
        )
    """
    try:
        cursor = engine.cursor()
        cursor.execute(sql)
        engine.commit()
        return {'message': 'success'}
    except Exception as e:
        return {'message': e, 'sql': sql}
    
@app.get("/get/promotion", tags=["Promotion"])
async def get_promo(code: str, booking_id: int = None):
    sql = f"""
        SELECT 
            promotion_code AS promotion_code,
            discount AS discount,
            discount_type_id AS is_type
        FROM 
            promotions
        WHERE 
            promotion_code = '{code}'
    """
    df = pd.read_sql(sql, engine)
    res = df.to_json(orient='records')
    parsed = json.loads(res)
    if len(df) > 0:
        return {'message': 'success', 'data': parsed}
    else:
        return {'message': 'error', 'data': []}
    
@app.get("/get/reviews", tags=["Review"])
async def get_promo():
    sql = f"""
        SELECT 
            *
        FROM 
            reviews
        ORDER BY review_id ASC
    """
    df = pd.read_sql(sql, engine)
    res = df.to_json(orient='records')
    parsed = json.loads(res)
    if len(df) > 0:
        return {'message': 'success', 'data': parsed}
    else:
        return {'message': 'error', 'data': []}
    
@app.get("/get/reviews/id", tags=["Review"])
async def get_promo2(id: str):
    sql = f"""
        SELECT 
            *
        FROM 
            reviews
        WHERE
            review_id = '{id}'
    """
    df = pd.read_sql(sql, engine)
    res = df.to_json(orient='records')
    parsed = json.loads(res)
    try:
        return {'message': 'success', 'data': parsed}
    except Exception as e:
        return {'message': 'error', 'data': e}
    
@app.delete("/delete/reviews", tags=["Review"])
async def del_review(item: DeleteReview):
    sql = f"""
        DELETE FROM reviews WHERE review_id = {item.review_id}
    """
    try:
        cursor = engine.cursor()
        cursor.execute(sql)
        engine.commit()
        return {'message': 'success'}
    except Exception as e:
        return {'message': e, 'sql': sql}
    
@app.put("/edit/reviews", tags=["Review"])
async def del_review(item: EditReviews):
    sql = f"""
        UPDATE
            reviews
        SET
            rating = {item.rating},
            comment = '{item.comment}',
            booking_id = {item.booking_id},
            passenger_id = {item.passenger_id},
            driver_id = {item.driver_id}
        WHERE
            review_id = {item.review_id}
    """
    try:
        cursor = engine.cursor()
        cursor.execute(sql)
        engine.commit()
        last_id = cursor.lastrowid
        return {'message': 'success', 'id': last_id}
    except Exception as e:
        return {'message': e}
    
@app.get("/get/passenger", tags=['Passenger'])
async def get_passenger():
    sql = "SELECT id FROM passengers"
    cursor = engine.cursor()
    cursor.execute(sql)
    result = cursor.fetchone()
    return {'message': 'success', 'data': result[0]}

@app.get("/get/driver", tags=['Driver'])
async def get_passenger():
    sql = "SELECT id FROM drivers"
    cursor = engine.cursor()
    cursor.execute(sql)
    result = cursor.fetchone()
    return {'message': 'success', 'data': result[0]}

@app.get("/close/db", tags=['Database'])
async def db(is_state):
    engine.execute("PRAGMA journal_mode = DELETE;")
    engine.close()
