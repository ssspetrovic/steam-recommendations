//1. Najigranije placene igre na Linuxu koje su izasle do 2010.

[
    {
      $lookup: {
        from: "PlatformSubset",
        localField: "app_id",
        foreignField: "app_id",
        as: "platform_info"
      }
    },
    {
      $match: {
        "platform_info.platforms": "Linux",
        date_release: {
          $lt: ISODate("2010-01-01T00:00:00Z")
        }
      }
    },
    {
      $match: {
        price: {
          $ne: 0
        }
      }
    },
    {
      $sort: {
        user_reviews: -1
      }
    },
    {
      $project: {
        title: 1,
        user_reviews: 1,
        rating: 1,
        price: 1,
        _id: 0
      }
    }
]

//2. Koliko kostaju sume svih preporucenih igara za svaku platformu?

[
    {
      $lookup: {
        from: "PlatformSubset",
        localField: "app_id",
        foreignField: "app_id",
        as: "platforms"
      }
    },
    {
      $lookup: {
        from: "PriceSubset",
        localField: "app_id",
        foreignField: "app_id",
        as: "prices"
      }
    },
    {
      $unwind: "$platforms"
    },
    {
      $unwind: "$platforms.platforms"
    },
    {
      $unwind: "$prices"
    },
    {
      $group: {
        _id: "$platforms.platforms",
        total_price: {
          $sum: "$prices.price_final"
        }
      }
    },
    {
      $sort: {
        total_price: -1
      }
    },
    {
      $project: {
        _id: 0,
        platform: "$_id",
        total_price: 1
      }
    }
]


//3. Najvise recenzirane igre za svaki kvartal 

  [
    {
      $lookup: {
        from: "RecommendationsBucket",
        localField: "app_id",
        foreignField: "app_id",
        as: "reviews"
      }
    },
    {
      $unwind: "$reviews"
    },
    {
      $unwind: "$reviews.recommendations"
    },
    {
      $group: {
        _id: {
          title: "$title",
          year: {
            $year: "$reviews.recommendations.date"
          },
          quarter: {
            $concat: [
              {
                $toString: {
                  $year:
                    "$reviews.recommendations.date"
                }
              },
              ", ",
              "Q",
              {
                $cond: [
                  {
                    $lte: [
                      {
                        $month:
                          "$reviews.recommendations.date"
                      },
                      3
                    ]
                  },
                  "1",
                  {
                    $cond: [
                      {
                        $lte: [
                          {
                            $month:
                              "$reviews.recommendations.date"
                          },
                          6
                        ]
                      },
                      "2",
                      {
                        $cond: [
                          {
                            $lte: [
                              {
                                $month:
                                  "$reviews.recommendations.date"
                              },
                              9
                            ]
                          },
                          "3",
                          "4"
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        total_reviews: {
          $sum: 1
        }
      }
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.quarter": 1,
        total_reviews: -1
      }
    },
    {
      $group: {
        _id: {
          year: "$_id.year",
          quarter: "$_id.quarter"
        },
        top_game_reviews: {
          $first: "$$ROOT"
        }
      }
    },
    {
      $replaceRoot: {
        newRoot: "$top_game_reviews"
      }
    },
    {
      $project: {
        _id: 0,
        quarter: "$_id.quarter",
        title: "$_id.title",
        total_reviews: 1
      }
    },
    {
      $sort: {
        quarter: 1,
        year: 1
      }
    }
]

//4. Koje igre su i dalje popularne?

[
    {
      $lookup: {
        from: "RecommendationsBucket",
        localField: "app_id",
        foreignField: "app_id",
        as: "reviews"
      }
    },
    {
      $unwind: "$reviews"
    },
    {
      $unwind: "$reviews.recommendations"
    },
    {
      $match: {
        date_release: {
          $lt: ISODate("2010-05-25")
        },
        "reviews.recommendations.date": {
          $gte: ISODate("2020-05-25")
        }
      }
    },
    {
      $group: {
        _id: "$_id",
        title: {
          $first: "$title"
        },
        date_release: {
          $first: "$date_release"
        },
        positive_reviews_last_year: {
          $sum: 1
        }
      }
    },
    {
      $sort: {
        positive_reviews_last_year: -1
      }
    }
]

//5. Igraci sa najvise sati u Dark Souls igrama

[
    {
      $lookup: {
        from: "RecommendationsBucket",
        localField: "app_id",
        foreignField: "app_id",
        as: "reviews"
      }
    },
    {
      $unwind: "$reviews"
    },
    {
      $unwind: "$reviews.recommendations"
    },
    {
      $lookup: {
        from: "Users",
        localField: "reviews.recommendations.user_id",
        foreignField: "user_id",
        as: "user"
      }
    },
    {
      $unwind: "$user"
    },
    {
      $match: {
        title: {
          $regex:
            "^(DARK SOULS™: REMASTERED|DARK SOULS™ II|DARK SOULS™ II: Scholar of the First Sin|DARK SOULS™ III)"
        }
      }
    },
    {
      $sort: {
        "reviews.recommendations.hours": -1
      }
    },
    {
      $project: {
        _id: 0,
        user_id: "$user.user_id",
        products: "$user.products",
        app_id: 1,
        game_title: "$title",
        verdict: {
          $cond: {
            if: {
              $eq: [
                "$reviews.recommendations.is_recommended",
                true
              ]
            },
            then: "Was Recommended",
            else: "Wasn't Recommended"
          }
        },
        review_date: "$reviews.recommendations.date",
        hours_played: "$reviews.recommendations.hours"
      }
    }
]
