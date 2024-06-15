//Games
db.Games.createIndex({ date_release: 1 });
db.Games.createIndex({ app_id: 1 });
db.Games.createIndex({ title: 1 });

//Platform
db.Platform.createIndex({ "app_id": 1 });

//Price
db.Price.createIndex({ "app_id": 1 });

//Recommendations
db.Recommendations.createIndex({ app_id: 1 });
db.Recommendations.createIndex({ date: 1 });

//Users
db.Users.createIndex({ "user_id": 1 })
