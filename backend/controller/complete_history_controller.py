import pandas as pd
import json
import random
import os
from dotenv import load_dotenv
import concurrent.futures
from fastapi import APIRouter, UploadFile, File, Response
from googleapiclient.discovery import build
from utils.category_map import category_map

# Load variables from .env into the environment
load_dotenv()
API_KEYS = [os.getenv("API_KEY1"), os.getenv("API_KEY2"), os.getenv("API_KEY2")]

complete_history_router = APIRouter(prefix="/v1/complete-history", tags=["complete-history"])

def fetch_video_data(ids):
    youtube = build("youtube", "v3", developerKey=API_KEYS[random.randint(0, 2)])
    str_ids = ','.join(ids)
    video_response = youtube.videos().list(
        part="snippet, statistics, contentDetails",
        id=str_ids,
        maxResults=50,
    ).execute()
    return video_response["items"]


@complete_history_router.post("")
async def upload_file(file: UploadFile = File(...), response: Response = None):
    contents = await file.read()
    contents = json.loads(contents)
    contents_df = pd.DataFrame(contents)
    contents_df["id"] = contents_df['titleUrl'].str[32:].astype('str')

    contents_df = contents_df.loc[pd.isna(contents_df['details'])] #remove ads
    contents_df_without_dupplicate = contents_df.drop_duplicates(subset='id', keep='first') #remove dupplicate id
    all_ids = list(contents_df_without_dupplicate["id"])
    sublists_ids = [all_ids[i:i+50] for i in range(0, len(all_ids), 50)]
    videos_df = pd.DataFrame()

    executor = concurrent.futures.ThreadPoolExecutor(12)
    futures = []
    for ids in sublists_ids:
        future = executor.submit(fetch_video_data, (ids))
        futures.append(future)
    
    for future in futures:
        new_videos_df = pd.DataFrame(future.result())
        videos_df = pd.concat([videos_df, new_videos_df])

    videos_df = videos_df.reset_index(drop=True)
    snippet_df = pd.DataFrame(list(videos_df['snippet']))
    videos_df["channelTitle"] = snippet_df["channelTitle"]
    videos_df["real_title"] = snippet_df["title"]
    videos_df["publishedAt"] = snippet_df["publishedAt"]
    videos_df["tags"] = snippet_df["tags"]
    videos_df["categoryId"] = snippet_df["categoryId"]
    videos_df["languages"] = snippet_df["defaultAudioLanguage"]
    videos_df["category_name"] = videos_df["categoryId"].replace(category_map)

    contentDetails_df = pd.DataFrame(videos_df['contentDetails'].tolist())
    videos_df["duration"] = contentDetails_df["duration"]

    statistics_df = pd.DataFrame(videos_df['statistics'].tolist())
    videos_df["viewCount"] = statistics_df["viewCount"]
    videos_df["likeCount"] = statistics_df["likeCount"]
    videos_df["commentCount"] = statistics_df["commentCount"]

    merged_df = pd.merge(contents_df, videos_df, on='id', how='left')
    columns_to_remove = ['snippet', 'contentDetails', 'statistics', 'header', 'subtitles', 'activityControls']
    merged_df = merged_df.drop(columns=columns_to_remove)

    csv_string = merged_df.to_csv(index=False)

    # Set response headers
    response.headers["Content-Disposition"] = "attachment; filename=data.csv"
    response.headers["Content-Type"] = "text/csv"

    await file.close()

    return Response(content=csv_string, media_type="text/csv")