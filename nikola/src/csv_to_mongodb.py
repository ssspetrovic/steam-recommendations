from pymongo import MongoClient
from datetime import datetime
import pandas as pd

client = MongoClient('localhost', 27017)
db = client['SteamDatabase']


def load_csv_to_mongodb(collection_name, csv_file_path, transform_func=None, row_limit=None):
    collection = db[collection_name]
    total_rows_read = 0

    try:
        data = pd.read_csv(csv_file_path)
        data_dict = data.to_dict("records")

        if transform_func:
            data_dict = [transform_func(record) for record in data_dict]

        if row_limit:
            data_dict = data_dict[:row_limit]

        if data_dict:
            collection.insert_many(data_dict)
            total_rows_read += len(data_dict)

        print(f"Data successfully loaded into {collection_name}. Total rows inserted: {total_rows_read}")
    except Exception as e:
        print(f"An error occurred while loading data into {collection_name}: {e}")


def transform_user(row):
    return {
        "user_id": row["user_id"],
        "products": int(row["products"]),
        "reviews": int(row["reviews"])
    }


def transform_game(row):
    return {
        "app_id": row["app_id"],
        "title": row["title"],
        "date_release": datetime.strptime(row["date_release"], '%Y-%m-%d'),
        "rating": row["rating"],
        "positive_ratio": float(row["positive_ratio"]),
        "user_reviews": int(row["user_reviews"])
    }


def transform_platform(row):
    return {
        "app_id": row["app_id"],
        "windows": row["win"] == True,
        "mac": row["mac"] == True,
        "linux": row["linux"] == True,
        "steam_deck": row["steam_deck"] == True
    }


def transform_price(row):
    return {
        "app_id": row["app_id"],
        "price_final": float(row["price_final"]),
        "price_original": float(row["price_original"]),
        "discount": int(row["discount"])
    }


def transform_recommendation(row):
    return {
        "review_id": row["review_id"],
        "user_id": row["user_id"],
        "app_id": row["app_id"],
        "date": datetime.strptime(row["date"], '%Y-%m-%d'),
        "is_recommended": row["is_recommended"] == True,
        "hours": float(row["hours"])
    }


def transform_review_feedback(row):
    return {
        "review_id": row["review_id"],
        "funny": int(row["funny"]),
        "helpful": int(row["helpful"])
    }


load_csv_to_mongodb('Users', 'users.csv', transform_user)
load_csv_to_mongodb('Games', 'games.csv', transform_game)
load_csv_to_mongodb('Platform', 'games.csv', transform_platform)
load_csv_to_mongodb('Price', 'games.csv', transform_price)
load_csv_to_mongodb('Recommendations', 'recommendations_processed.csv', transform_recommendation, row_limit=1000000)
load_csv_to_mongodb('ReviewFeedbacks', 'review_feedbacks_processed.csv', transform_review_feedback, row_limit=1000000)
