import pymongo
import time


# Query for Funny Review Feedback
query_funny_reviews = [
    {
        "$lookup": {
            "from": "GamesExtendedReference",
            "localField": "review_id",
            "foreignField": "app_id",
            "as": "game_reviews",
        },
    },
    {
        "$unwind": "$game_reviews",
    },
    {
        "$lookup": {
            "from": "PlatformSubset",
            "localField": "game_reviews.app_id",
            "foreignField": "app_id",
            "as": "game_platform",
        },
    },
    {
        "$unwind": "$game_platform",
    },
    {
        "$match": {
            "game_reviews.positive_ratio": {"$gte": 80},
            "game_platform.platforms": "Steam Deck",
            "funny": {"$gt": 0},
        },
    },
    {
        "$project": {
            "review_id": 1,
            "funny": 1,
            "game_reviews.title": 1,
            "game_reviews.positive_ratio": 1,
        },
    },
    {
        "$limit": 5
    }
]


# Query for Max Hours Played by Users Who Did Not Recommend Games
query_max_hours_played = [
    {
        "$lookup": {
            "from": "RecommendationsBucket",
            "localField": "app_id",
            "foreignField": "app_id",
            "as": "recommendations",
        },
    },
    {
        "$unwind": "$recommendations",
    },
    {
        "$unwind": "$recommendations.recommendations",
    },
    {
        "$match": {
            "recommendations.recommendations.is_recommended": False,
        },
    },
    {
        "$group": {
            "_id": {
                "game_id": "$app_id",
                "game_name": "$title",
            },
            "max_hours_played": {
                "$max": "$recommendations.recommendations.hours",
            },
            "users_with_max_hours": {
                "$push": {
                    "user_id": "$recommendations.recommendations.user_id",
                    "hours": "$recommendations.recommendations.hours",
                },
            },
        },
    },
    {
        "$project": {
            "_id": 0,
            "game_id": "$_id.game_id",
            "game_name": "$_id.game_name",
            "max_hours_played": 1,
            "user_id": {
                "$arrayElemAt": [
                    "$users_with_max_hours.user_id",
                    {
                        "$indexOfArray": [
                            "$users_with_max_hours.hours",
                            "$max_hours_played",
                        ],
                    },
                ],
            },
        },
    },
    {
        "$sort": {
            "max_hours_played": -1,
        },
    },
    {
        "$limit": 5,
    },
]

# Query for Dedicated Fans of "Dota 2" Series
query_dedicated_fans = [
    {
        "$lookup": {
            "from": "RecommendationsBucket",
            "localField": "app_id",
            "foreignField": "app_id",
            "as": "recommendations_data",
        },
    },
    {
        "$unwind": "$recommendations_data",
    },
    {
        "$unwind": "$recommendations_data.recommendations",
    },
    {
        "$match": {
            "recommendations_data.recommendations.hours": {"$gt": 20},
            "recommendations_data.recommendations.is_recommended": True,
            "recommendations_data.recommendations.user_id": {"$mod": [10, 2]},
        },
    },
    {
        "$lookup": {
            "from": "GamesExtendedReference",
            "localField": "app_id",
            "foreignField": "app_id",
            "as": "game_info",
        },
    },
    {
        "$unwind": "$game_info",
    },
    {
        "$match": {
            "game_info.title": "Dota 2",
        },
    },
    {
        "$group": {
            "_id": "$recommendations_data.recommendations.user_id",
            "max_hours_played": {"$max": "$recommendations_data.recommendations.hours"},
        },
    },
    {
        "$sort": {
            "max_hours_played": -1,
        },
    },
    {
        "$limit": 10,
    },
    {
        "$project": {
            "_id": 0,
            "user_id": "$_id",
            "max_hours_played": 1,
        },
    },
]


# Query for Percentage of "Very Positive" Rated Games
query_very_positive_percentage = [
    {
        "$lookup": {
            "from": "PriceSubset",
            "localField": "app_id",
            "foreignField": "app_id",
            "as": "price_info",
        },
    },
    {
        "$unwind": "$price_info",
    },
    {
        "$group": {
            "_id": "$rating",
            "count": {"$sum": 1},
            "average_price": {"$avg": "$price_info.price_final"},
            "average_reviews": {"$avg": "$user_reviews"},
        },
    },
    {
        "$group": {
            "_id": None,
            "total": {"$sum": "$count"},
            "ratings": {
                "$push": {
                    "rating": "$_id",
                    "count": "$count",
                    "average_price": "$average_price",
                    "average_reviews": "$average_reviews",
                },
            },
        },
    },
    {
        "$unwind": "$ratings",
    },
    {
        "$project": {
            "_id": 0,
            "rating": "$ratings.rating",
            "percentage": {
                "$multiply": [
                    {"$divide": ["$ratings.count", "$total"]},
                    100,
                ],
            },
            "average_price": "$ratings.average_price",
            "average_reviews": "$ratings.average_reviews",
        },
    },
    {
        "$match": {
            "rating": "Very Positive",
        },
    },
]


# Query for Top 10 Most Popular Games on Mac and Linux with Price
query_top_games_mac_linux = [
    {
        "$lookup": {
            "from": "PlatformSubset",
            "localField": "app_id",
            "foreignField": "app_id",
            "as": "platform",
        },
    },
    {
        "$unwind": "$platform",
    },
    {
        "$match": {
            "platform.platforms": {"$all": ["Mac", "Linux"]},
        },
    },
    {
        "$lookup": {
            "from": "PriceSubset",
            "localField": "app_id",
            "foreignField": "app_id",
            "as": "price",
        },
    },
    {
        "$unwind": "$price",
    },
    {
        "$match": {
            "price.price_final": {"$lt": 15},
        },
    },
    {
        "$project": {
            "_id": 0,
            "app_id": 1,
            "title": 1,
            "user_reviews": 1,
            "price_final": "$price.price_final",
        },
    },
    {
        "$sort": {
            "user_reviews": -1,
        },
    },
    {
        "$limit": 10,
    },
]


# MongoDB connection setup
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["sbp"]


def execute_query(collection, query, timeout=600):
    start_time = time.time()
    try:
        result = list(db[collection].aggregate(
            query, maxTimeMS=timeout * 1000))
    except pymongo.errors.ExecutionTimeout as e:
        print(f"Query execution exceeded {timeout} seconds. Aborting...")
        return None
    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Query execution time: {execution_time} seconds")
    print(result)
    return result


def log_query_execution(query_name, collection, query):
    print(f"\nRunning query for {query_name}...")
    result = execute_query(collection, query)


log_query_execution("Funny Review Feedback",
                    "ReviewFeedback", query_funny_reviews)
log_query_execution("Max Hours Played by Users Who Did Not Recommend Games",
                    "Games", query_max_hours_played)
log_query_execution("Dedicated Fans of 'Dota 2' Series",
                    "Recommendations", query_dedicated_fans)
log_query_execution("Percentage of 'Very Positive' Rated Games",
                    "Games", query_very_positive_percentage)
log_query_execution("Top 10 Most Popular Games on Mac and Linux with Price",
                    "Games", query_top_games_mac_linux)

client.close()
