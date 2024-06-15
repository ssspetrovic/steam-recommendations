import pymongo
import time

# MongoDB connection setup
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["sbp"]


def create_index(collection, index):
    print(f"Creating index on {collection} for {index}...")
    start_time = time.time()
    db[collection].create_index(index)
    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Index created on {collection} for {
          index}. Time taken: {execution_time} seconds")
    print()


# Index creation for Funny Review Feedback Query
# create_index('ReviewFeedback', [('review_id', pymongo.ASCENDING)])
create_index('GamesExtendedReference', [('app_id', pymongo.ASCENDING)])
create_index('PlatformSubset', [('app_id', pymongo.ASCENDING)])
# create_index('PlatformSubset', [('platforms', pymongo.ASCENDING)])
# create_index('PlatformSubset', [('steam_deck', pymongo.ASCENDING)])

# Index creation for Max Hours Played by Users Who Did Not Recommend Games Query
create_index('Games', [('app_id', pymongo.ASCENDING)])
create_index('RecommendationsBucket', [('app_id', pymongo.ASCENDING)])
# create_index('RecommendationsBucket', [
#              ('recommendations.is_recommended', pymongo.ASCENDING)])
# create_index('RecommendationsBucket', [
#              ('recommendations.hours', pymongo.DESCENDING)])

# Index creation for Dedicated Fans of "Dota 2" Series Query
create_index('RecommendationsBucket', [('app_id', pymongo.ASCENDING)])
# create_index('RecommendationsBucket', [('recommendations.hours', pymongo.ASCENDING),
#                                        ('recommendations.is_recommended',
#                                         pymongo.ASCENDING),
#                                        ('recommendations.user_id', pymongo.ASCENDING)])
create_index('GamesExtendedReference', [('app_id', pymongo.ASCENDING)])
# create_index('GamesExtendedReference', [('title', pymongo.ASCENDING)])


# Index creation for Percentage of "Very Positive" Rated Games Query
create_index('Games', [('app_id', pymongo.ASCENDING)])
create_index('PriceSubset', [('app_id', pymongo.ASCENDING)])

# Index creation for Top 10 Most Popular Games on Mac and Linux with Price
create_index('Price', [('app_id', pymongo.ASCENDING)])
create_index('Platform', [('app_id', pymongo.ASCENDING)])

client.close()
