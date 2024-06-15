//1. Najigranije placene igre na Linuxu koje su izasle do 2010. 

[
    {
      $lookup: {
        from: "Platform",
        localField: "app_id",
        foreignField: "app_id",
        as: "platform_info"
      }
    },
    {
      $match: {
        "platform_info.linux": true,
        date_release: {
          $lt: ISODate("2010-01-01T00:00:00Z")
        }
      }
    },
    {
      $lookup: {
        from: "Price",
        localField: "app_id",
        foreignField: "app_id",
        as: "price_info"
      }
    },
    {
      $match: {
        "price_info.price_final": {
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
      $limit: 10
    },
    {
      $project: {
        title: 1,
        user_reviews: 1,
        rating: 1,
        price_final: {
          $arrayElemAt: [
            "$price_info.price_final",
            0
          ]
        },
        _id: 0
      }
    }
]

//2. Koliko kostaju sume svih preporucenih igara za svaku platformu?

[
    {
      $group: {
        _id: "$app_id",
        app_id: {
          $first: "$app_id"
        }
      }
    },
    {
      $lookup: {
        from: "Platform",
        localField: "app_id",
        foreignField: "app_id",
        as: "platforms"
      }
    },
    {
      $lookup: {
        from: "Price",
        localField: "app_id",
        foreignField: "app_id",
        as: "prices"
      }
    },
    {
      $unwind: "$platforms"
    },
    {
      $unwind: "$prices"
    },
    {
      $facet: {
        windows: [
          {
            $group: {
              _id: null,
              total_price: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$platforms.windows",
                        true
                      ]
                    },
                    "$prices.price_final",
                    0
                  ]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              platform: "Windows",
              total_price: "$total_price"
            }
          }
        ],
        mac: [
          {
            $group: {
              _id: null,
              total_price: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$platforms.mac", true]
                    },
                    "$prices.price_final",
                    0
                  ]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              platform: "Mac",
              total_price: "$total_price"
            }
          }
        ],
        linux: [
          {
            $group: {
              _id: null,
              total_price: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$platforms.linux",
                        true
                      ]
                    },
                    "$prices.price_final",
                    0
                  ]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              platform: "Linux",
              total_price: "$total_price"
            }
          }
        ],
        steam_deck: [
          {
            $group: {
              _id: null,
              total_price: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$platforms.steam_deck",
                        true
                      ]
                    },
                    "$prices.price_final",
                    0
                  ]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              platform: "Steam Deck",
              total_price: "$total_price"
            }
          }
        ]
      }
    },
    {
      $project: {
        results: {
          $setUnion: [
            "$windows",
            "$mac",
            "$linux",
            "$steam_deck"
          ]
        }
      }
    },
    {
      $unwind: "$results"
    },
    {
      $replaceRoot: {
        newRoot: "$results"
      }
    },
    {
      $sort: {
        total_price: -1
      }
    }
]

//3. Najvise recenzirane igre za svaki kvartal 

[
    {
      $lookup: {
        from: "Recommendations",
        localField: "app_id",
        foreignField: "app_id",
        as: "reviews"
      }
    },
    {
      $unwind: "$reviews"
    },
    {
      $group: {
        _id: {
          title: "$title",
          year: {
            $year: "$reviews.date"
          },
          quarter: {
            $concat: [
              {
                $toString: {
                  $year: "$reviews.date"
                }
              },
              ", ",
              "Q",
              {
                $cond: [
                  {
                    $lte: [
                      {
                        $month: "$reviews.date"
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
                            $month: "$reviews.date"
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
                                  "$reviews.date"
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
        date_release: {
          $lt: ISODate("2010-05-25")
        },
        "recommendations.date": {
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
      $lookup: {
        from: "Users",
        localField: "recommendations.user_id",
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
        "recommendations.hours": -1
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
                "$recommendations.is_recommended",
                true
              ]
            },
            then: "Was Recommended",
            else: "Wasn't Recommended"
          }
        },
        review_date: "$recommendations.date",
        hours_played: "$recommendations.hours"
      }
    }
]
