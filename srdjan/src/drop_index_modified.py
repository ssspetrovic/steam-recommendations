import pymongo
import time

# MongoDB connection setup
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["sbp"]

# Function to drop index and measure time


def drop_index(collection, index):
    index_name = db[collection].index_information()
    for name, info in index_name.items():
        if info['key'] == index:
            print(f"Dropping index on {collection} for {index}...")
            start_time = time.time()
            db[collection].drop_index(name)
            end_time = time.time()
            execution_time = end_time - start_time
            print(f"Index dropped on {collection} for {
                  index}. Time taken: {execution_time} seconds")
            print()
            break


# Index dropping for Funny Review Feedback Query
print('Starting index dropping for Funny Review Feedback')
# drop_index('ReviewFeedback', [('review_id', pymongo.ASCENDING)])
drop_index('GamesExtendedReference', [('app_id', pymongo.ASCENDING)])
drop_index('PlatformSubset', [('app_id', pymongo.ASCENDING)])
# drop_index('PlatformSubset', [('platforms', pymongo.ASCENDING)])
# drop_index('PlatformSubset', [('steam_deck', pymongo.ASCENDING)])

# Index dropping for Max Hours Played by Users Who Did Not Recommend Games Query
print('Starting index dropping for Max Hours Played by Users Who Did Not Recommend Games')
drop_index('Games', [('app_id', pymongo.ASCENDING)])
drop_index('RecommendationsBucket', [('app_id', pymongo.ASCENDING)])
# drop_index('RecommendationsBucket', [
#            ('recommendations.is_recommended', pymongo.ASCENDING)])
# drop_index('RecommendationsBucket', [
#            ('recommendations.hours', pymongo.DESCENDING)])

# Index dropping for Dedicated Fans of "Dota 2" Series Query
print('Starting index dropping for Dedicated Fans of "Dota 2" Series')
drop_index('RecommendationsBucket', [('app_id', pymongo.ASCENDING)])
# drop_index('RecommendationsBucket', [('recommendations.hours', pymongo.ASCENDING),
#                                        ('recommendations.is_recommended',
#                                         pymongo.ASCENDING),
#                                        ('recommendations.user_id', pymongo.ASCENDING)])
drop_index('GamesExtendedReference', [('app_id', pymongo.ASCENDING)])
# drop_index('GamesExtendedReference', [('title', pymongo.ASCENDING)])

# Index dropping for Percentage of "Very Positive" Rated Games Query
print('Starting index dropping for Percentage of "Very Positive" Rated Games')
drop_index('Games', [('app_id', pymongo.ASCENDING)])
drop_index('PriceSubset', [('app_id', pymongo.ASCENDING)])
# drop_index('Games', [('rating', pymongo.ASCENDING)])

# Index dropping for Top 10 Most Popular Games on Mac and Linux with Price Query
print('Starting index dropping for Top 10 Most Popular Games on Mac and Linux with Price')
# drop_index('Games', [('app_id', pymongo.ASCENDING)])
drop_index('Price', [('app_id', pymongo.ASCENDING)])
drop_index('Platform', [('app_id', pymongo.ASCENDING)])

client.close()
