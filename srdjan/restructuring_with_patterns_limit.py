from pymongo import MongoClient
from datetime import datetime
import pandas as pd

client = MongoClient('localhost', 27017)
db = client['sbp']


def load_csv_to_mongodb(collection_name, csv_file_path, transform_func=None, pattern=None, chunk_size=None, row_limit=50000000):
    collection = db[collection_name]
    total_rows_read = 0

    try:
        if chunk_size is None:
            data = pd.read_csv(csv_file_path)
            process_data(collection, data, transform_func, pattern)
            total_rows_read += len(data)
        else:
            chunks = pd.read_csv(csv_file_path, chunksize=chunk_size)
            for chunk in chunks:
                if total_rows_read >= row_limit:
                    break
                process_data(collection, chunk, transform_func, pattern)
                total_rows_read += len(chunk)

        print(f"Data successfully loaded into {collection_name}")
    except Exception as e:
        print(f"An error occurred while loading data into {
              collection_name}: {e}")


def process_data(collection, data, transform_func, pattern):
    data_dict = data.to_dict("records")

    if transform_func:
        data_dict = [transform_func(record) for record in data_dict]

    if pattern == "Attribute":
        collection.insert_many(data_dict)
    elif pattern == "Bucket":
        bulk_operations = []
        for document in data_dict:
            app_id = document["app_id"]
            date = document["date"]
            new_recommendation = {
                "review_id": document["review_id"],
                "user_id": document["user_id"],
                "date": date,
                "is_recommended": document["is_recommended"],
                "hours": document["hours"]
            }

            # Update existing document or insert new document
            collection.update_one(
                {"app_id": app_id},
                {
                    # Dodaj u set recommendations
                    "$addToSet": {"recommendations": new_recommendation},
                    # Postavi app_id i start_date ako se insertuje novi dokument
                    "$setOnInsert": {"app_id": app_id, "start_date": date},
                    # Postavi end_date na novu vrednost
                    "$set": {"end_date": date}
                },
                upsert=True  # Insert ako ne postoji
            )

    elif pattern == "Computed":
        collection.insert_many(data_dict)
    elif pattern == "SubsetPlatform":
        bulk_operations = []
        for index, row in data.iterrows():
            platforms = []
            if row["win"]:
                platforms.append("Windows")
            if row["mac"]:
                platforms.append("Mac")
            if row["linux"]:
                platforms.append("Linux")
            if row["steam_deck"]:
                platforms.append("Steam Deck")

            document = {
                "app_id": row["app_id"],
                "platforms": platforms
            }
            bulk_operations.append(document)

        if bulk_operations:
            collection.insert_many(bulk_operations)

    elif pattern == "SubsetPrice":
        bulk_operations = []
        for index, row in data.iterrows():
            price_final = float(row["price_final"])
            price_original = float(row["price_original"])
            discount = int(row["discount"])

            # Dodajemo samo price_final ako je discount 0 ili price_final == price_original
            if discount == 0 or price_final == price_original:
                document = {
                    "app_id": row["app_id"],
                    "price_final": price_final
                }
            else:
                document = {
                    "app_id": row["app_id"],
                    "price_final": price_final,
                    "price_original": price_original,
                    "discount": discount
                }
            bulk_operations.append(document)

        if bulk_operations:
            collection.insert_many(bulk_operations)

    elif pattern == "Polymorphic":
        bulk_operations = []
        for index, row in data.iterrows():
            document = {
                "app_id": row["app_id"],
                "type": "final_price",
                "value": {
                    "price": float(row["price_final"]),
                    "original_price": float(row["price_original"]),
                    "discount": float(row["discount"])
                }
            }
            bulk_operations.append(document)

        if bulk_operations:
            collection.insert_many(bulk_operations)

    print(f"Processed {len(data_dict)} records.")


def transform_user(row):
    return {
        "user_id": row["user_id"],
        "products": int(row["products"]),
        "reviews": int(row["reviews"])
    }


def transform_game(row):
    attributes = []
    for key in ["positive_ratio", "user_reviews"]:
        attributes.append({"key": key, "value": int(row[key])})

    return {
        "app_id": row["app_id"],
        "date_release": datetime.strptime(row["date_release"], '%Y-%m-%d'),
        "title": row["title"],
        "rating": row["rating"],
        "attributes": attributes
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
        "helpful": int(row["helpful"]),
        "total_feedback": int(row["funny"]) + int(row["helpful"])
    }


load_csv_to_mongodb('GamesAttribute', 'games.csv', transform_game, pattern="Attribute")
load_csv_to_mongodb('PlatformSubset', 'games.csv', pattern="SubsetPlatform")
load_csv_to_mongodb('PriceSubset', 'games.csv', pattern="SubsetPrice")
load_csv_to_mongodb('Users', 'users.csv', transform_user)
load_csv_to_mongodb('RecommendationsBucket', 'recommendations.csv',
                    transform_recommendation, pattern="Bucket",  chunk_size=200000, row_limit=1000000)
load_csv_to_mongodb('ReviewFeedbacksComputed', 'recommendations.csv', transform_review_feedback, pattern="Computed", chunk_size=200000, row_limit=1000000)
