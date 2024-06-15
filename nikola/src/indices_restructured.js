//GamesAttribute
db.GamesExtendedReference.createIndex({ date_release: 1 });
db.GamesExtendedReference.createIndex({ app_id: 1 });
db.GamesExtendedReference.createIndex({ title: 1 });

//PlatformSubset
db.PlatformSubset.createIndex({ "app_id": 1 });

//PriceSubset
db.PriceSubset.createIndex({ "app_id": 1 });

//RecommendationsBucket
db.RecommendationsBucket.createIndex({ app_id: 1 });

//Users
db.Users.createIndex({"user_id": 1});
db.Users.createIndex({"products": 1});