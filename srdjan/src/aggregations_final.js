// recenzije koje su označene kao smešne za igre sa visokim pozitivnim rejtingom na Steam Deck platformi.
[
  {
    $lookup: {
      from: "Games",
      localField: "review_id",
      foreignField: "app_id",
      as: "game_reviews"
    }
  },
  {
    $unwind: "$game_reviews"
  },
  {
    $lookup: {
      from: "Platform",
      localField: "game_reviews.app_id",
      foreignField: "app_id",
      as: "game_platform"
    }
  },
  {
    $unwind: "$game_platform"
  },
  {
    $match: {
      "game_reviews.positive_ratio": { $gte: 80 },
      "game_platform.steam_deck": true,
      funny: { $gt: 0 }
    }
  },
  {
    $project: {
      review_id: 1,
      funny: 1,
      "game_reviews.title": 1,
      "game_reviews.positive_ratio": 1
    }
  },
  {
    $limit: 5
  }
]

// maksimalan broj sati koje su korisnici igrali igre za koje nisu preporučili, grupišući ih po igrama.
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

// najveći fanovi "Dota 2" igre na osnovu maksimalnog broja sati koje su igrali.
[
  {
    $match: {
      hours: { $gt: 20 },
      is_recommended: true,
      user_id: { $mod: [10, 2] }
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
      "game_info.title": "Dota 2"
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

// procenat igara koje imaju vrlo pozitivan rejting, uz prosečnu cenu i prosečne korisničke recenzije.
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

// najpopularnije igre na platformama Mac i Linux sa cenom manjom od 15 dolara, sortirane po broju korisničkih recenzija.
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
      "price.price_final": { $lt: 15 }
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
