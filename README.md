# Game Recommendations on Steam Dataset Analysis and Optimization

<div align="center">
  <img src="mongodb_logo.png" height="100">
  <img src="steam_logo.png" height="100" style="margin-left:30px;">
</div>

## Overview

This project focuses on the analysis and optimization of the [Game Recommendations on Steam dataset](https://www.kaggle.com/datasets/antonkozyriev/game-recommendations-on-steam?select=games.csv) sourced from Kaggle. The dataset provides comprehensive information about games available on the Steam platform, including user reviews, ratings, pricing, and platform compatibility.

## Objectives

The main objectives of this project include:

- **Database Optimization**: Using MongoDB to optimize database structure and performance.
- **Index Creation**: Strategically creating indexes to improve query performance.
- **Data Modeling**: Implementing design patterns like bucketing, subset, extended reference, and computing for efficient data handling.
- **Query Optimization**: Writing and optimizing MongoDB queries to derive meaningful insights from the dataset.

## Dataset Description

The dataset consists of CSV files containing information such as game details, user reviews, recommendations, pricing, and platform compatibility. Key files utilized are:

- **games.csv**: Detailed information about each game including title, release date, rating, user reviews, and pricing.
- **recommendations.csv**: User-specific game recommendations, including recommendation status, hours played, and review date.
- **users.csv**: User profiles with details such as user ID, products owned, and reviews submitted.

## Methodology

### Data Loading and Transformation

- **Importing to MongoDB**: Data from CSV files was loaded into MongoDB using Python scripts.
- **Data Transformation**: Transformation functions were applied to preprocess and structure data according to MongoDB schema requirements.

### Database Design Patterns

- **Bucket Pattern**: Used to store recommendations grouped by game ID.
- **Subset Pattern**: Categorized games based on platform compatibility (e.g., Windows, Mac, Linux).
- **Extended Reference**: Linked additional game details across different collections for efficient querying.
- **Computing Pattern**: Created computed fields such as final price with applied discounts.

### Indexing Strategy

- Indexes were created on fields frequently used in queries to optimize query execution speed.
- Examples include:
  - `Games`: Index on `app_id` for fast game lookups.
  - `Platform`: Compound index on `mac` and `linux` for platform-specific queries.
  - `Price`: Index on `app_id` for pricing-related queries.

## Conclusion

This project showcases MongoDB's capabilities in optimizing storage and retrieval of data from the Steam game recommendations dataset. By utilizing indexing, design patterns, and efficient querying techniques, the database performance is enhanced, facilitating quicker analysis and extraction of valuable insights.
