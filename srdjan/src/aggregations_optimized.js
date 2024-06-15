[
  {
    "$lookup": {
      "from": "GamesExtendedReference",
      "localField": "review_id",
      "foreignField": "app_id",
      "as": "game_reviews"
    }
  },
  {
    "$unwind": "$game_reviews"
  },
  {
    "$lookup": {
      "from": "PlatformSubset",
      "localField": "game_reviews.app_id",
      "foreignField": "app_id",
      "as": "game_platform"
    }
  },
  {
    "$unwind": "$game_platform"
  },
  {
    "$match": {
      "game_reviews.positive_ratio": {"$gte": 80},
      "game_platform.platforms": "Steam Deck",
      "funny": {"$gt": 0}
    }
  },
  {
    "$project": {
      "review_id": 1,
      "funny": 1,
      "game_reviews.title": 1,
      "game_reviews.positive_ratio": 1
    }
  },
  {
    "$limit": 5
  }
]

[
  {
    "$lookup": {
      "from": "RecommendationsBucket",
      "localField": "app_id",
      "foreignField": "app_id",
      "as": "recommendations"
    }
  },
  {
    "$unwind": "$recommendations"
  },
  {
    "$unwind": "$recommendations.recommendations"
  },
  {
    "$match": {
      "recommendations.recommendations.is_recommended": False
    }
  },
  {
    "$group": {
      "_id": {
        "game_id": "$app_id",
        "game_name": "$title"
      },
      "max_hours_played": {
        "$max": "$recommendations.recommendations.hours"
      },
      "users_with_max_hours": {
        "$push": {
          "user_id": "$recommendations.recommendations.user_id",
          "hours": "$recommendations.recommendations.hours"
        }
      }
    }
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
              "$max_hours_played"
            ]
          }
        ]
      }
    }
  },
  {
    "$sort": {
      "max_hours_played": -1
    }
  },
  {
    "$limit": 5
  }
]

[
  {
    "$match": {
      "hours": {"$gt": 20},
      "is_recommended": True,
      "user_id": {"$mod": [10, 2]}
    }
  },
  {
    "$lookup": {
      "from": "Games",
      "localField": "app_id",
      "foreignField": "app_id",
      "as": "game_info"
    }
  },
  {
    "$unwind": "$game_info"
  },
  {
    "$match": {
      "game_info.title": "Dota 2"
    }
  },
  {
    "$group": {
      "_id": "$user_id",
      "max_hours_played": {"$max": "$hours"}
    }
  },
  {
    "$sort": {
      "max_hours_played": -1
    }
  },
  {
    "$limit": 10
  },
  {
    "$project": {
      "_id": 0,
      "user_id": "$_id",
      "max_hours_played": 1
    }
  }
]

[
  {
    "$lookup": {
      "from": "PriceSubset",
      "localField": "app_id",
      "foreignField": "app_id",
      "as": "price_info"
    }
  },
  {
    "$unwind": "$price_info"
  },
  {
    "$group": {
      "_id": "$rating",
      "count": {"$sum": 1},
      "average_price": {"$avg": "$price_info.price_final"},
      "average_reviews": {"$avg": "$user_reviews"}
    }
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
          "average_reviews": "$average_reviews"
        }
      }
    }
  },
  {
    "$unwind": "$ratings"
  },
  {
    "$project": {
      "_id": 0,
      "rating": "$ratings.rating",
      "percentage": {
        "$multiply": [
          {"$divide": ["$ratings.count", "$total"]},
          100
        ]
      },
      "average_price": "$ratings.average_price",
      "average_reviews": "$ratings.average_reviews"
    }
  },
  {
    "$match": {
      "rating": "Very Positive"
    }
  }
]

[
  {
    "$lookup": {
      "from": "Platform",
      "localField": "app_id",
      "foreignField": "app_id",
      "as": "platform"
    }
  },
  {
    "$lookup": {
      "from": "Price",
      "localField": "app_id",
      "foreignField": "app_id",
      "as": "price"
    }
  },
  {
    "$match": {
      "platform.mac": True,
      "platform.linux": True,
      "price.price_final": {"$lt": 15}
    }
  },
  {
    "$project": {
      "_id": 0,
      "app_id": 1,
      "title": 1,
      "user_reviews": 1,
      "price_final": {"$arrayElemAt": ["$price.price_final", 0]}
    }
  },
  {
    "$sort": {
      "user_reviews": -1
    }
  },
  {
    "$limit": 10
  }
]
