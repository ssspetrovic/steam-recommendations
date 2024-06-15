// Find Funny Review Feedback for Highly Rated Games on Steam Deck
// This query identifies reviews for games that are compatible with Steam Deck, have a high positive ratio, and have received "funny" feedback.
// RUN ON REVIEWFEEDBACK
[
  {
    $lookup: {
      from: "Games",
      localField: "review_id",
      foreignField: "app_id",
      as: "game_reviews",
    },
  },
  {
    $unwind: "$game_reviews",
  },
  {
    $lookup: {
      from: "Platform",
      localField: "game_reviews.app_id",
      foreignField: "app_id",
      as: "game_platform",
    },
  },
  {
    $unwind: "$game_platform",
  },
  {
    $match: {
      "game_reviews.positive_ratio": { $gte: 80 },
      "game_platform.steam_deck": true,
      funny: { $gt: 0 },
    },
  },
  {
    $project: {
      review_id: 1,
      funny: 1,
      "game_reviews.title": 1,
      "game_reviews.positive_ratio": 1,
    },
  },
]



// The goal of this aggregation query is to identify games where users who have not recommended the game (is_recommended: false) have spent the maximum number of hours playing.
// For each of these games, the query also aims to find out which user has spent the most hours playing it
// RUN ON GAMES
[
  {
    $lookup: {
      from: "Recommendations",
      localField: "app_id",
      foreignField: "app_id",
      as: "recommendations"
    }
  },
  {
    $unwind: "$recommendations"
  },
  {
    $match: {
      "recommendations.is_recommended": false
    }
  },
  {
    $group: {
      _id: {
        game_id: "$app_id",
        game_name: "$title"
      },
      max_hours_played: {
        $max: "$recommendations.hours"
      },
      users_with_max_hours: {
        $push: {
          user_id: "$recommendations.user_id",
          hours: "$recommendations.hours"
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      game_id: "$_id.game_id",
      game_name: "$_id.game_name",
      max_hours_played: 1,
      user_id: {
        $arrayElemAt: [
          "$users_with_max_hours.user_id",
          {
            $indexOfArray: [
              "$users_with_max_hours.hours",
              "$max_hours_played"
            ]
          }
        ]
      }
    }
  },
  {
    $sort: {
      max_hours_played: -1
    }
  },
  {
    $limit: 5
  }
]

// Let’s say we want to find the most “dedicated” fans of the “Goat Simulator” series.
// These are users who have played any “Goat Simulator” game for more than 20 hours
// left a positive recommendation, and have a user ID that ends with the number 3 (because goats have 3 letters, and we love a good coincidence!).
// RUN ON RECOMMENDATIONS
[
  {
    $match: {
      hours: { $gt: 20 },
      is_recommended: true,
      user_id: { $mod: [ 10, 3 ] }
    }
  },
  {
    $lookup: {
      from: "Games",
      localField: "app_id",
      foreignField: "app_id",
      as: "game_info"
    }
  },
  {
    $unwind: "$game_info"
  },
  {
    $match: {
      "game_info.title": { $regex: "Goat Simulator.*" }
    }
  },
  {
    $group: {
      _id: "$user_id",
      max_hours_played: { $max: "$hours" }
    }
  },
  {
    $sort: {
      max_hours_played: -1
    }
  },
  {
    $limit: 10
  },
  {
    $project: {
      _id: 0,
      user_id: "$_id",
      max_hours_played: 1
    }
  }
]



// 4
// find out not only the percentage of games that have a “Very Positive” rating,
// but also the average price of these games and the average number of user reviews they have.
// RUN ON GAMES
[
  {
    $lookup: {
      from: "Price",
      localField: "app_id",
      foreignField: "app_id",
      as: "price_info"
    }
  },
  {
    $unwind: "$price_info"
  },
  {
    $group: {
      _id: "$rating",
      count: { $sum: 1 },
      average_price: { $avg: "$price_info.price_final" },
      average_reviews: { $avg: "$user_reviews" }
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$count" },
      ratings: {
        $push: {
          rating: "$_id",
          count: "$count",
          average_price: "$average_price",
          average_reviews: "$average_reviews"
        }
      }
    }
  },
  {
    $unwind: "$ratings"
  },
  {
    $project: {
      _id: 0,
      rating: "$ratings.rating",
      percentage: {
        $multiply: [
          { $divide: ["$ratings.count", "$total"] },
          100
        ]
      },
      average_price: "$ratings.average_price",
      average_reviews: "$ratings.average_reviews"
    }
  },
  {
    $match: {
      rating: "Very Positive"
    }
  }
]


// 5
// Koje su top 10 najpopularnije igre koje se mogu igrati i na Mac i na Linux, uz cenu igre? (Games)
[
  {
    $lookup: {
      from: "Platform",
      localField: "app_id",
      foreignField: "app_id",
      as: "platform"
    }
  },
  {
    $lookup: {
      from: "Price",
      localField: "app_id",
      foreignField: "app_id",
      as: "price"
    }
  },
  {
    $match: {
      "platform.mac": true,
      "platform.linux": true,
      "price.price_final": {
        $lt: 15
      }
    }
  },
  {
    $project: {
      _id: 0,
      app_id: 1,
      title: 1,
      user_reviews: 1,
      price_final: { $arrayElemAt: ["$price.price_final", 0] }
    }
  },
  {
    $sort: {
      user_reviews: -1
    }
  },
  {
    $limit: 10
  }
]
  