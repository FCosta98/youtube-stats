import os.path
import json
import pandas as pd
import time
import random
from dotenv import load_dotenv
import os
import concurrent.futures
from fastapi import FastAPI, Depends, Header, HTTPException, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from googleapiclient.discovery import build
from pydantic import BaseModel
from utils.category_map import category_map


from fastapi.security import OAuth2PasswordBearer
import requests

import google_auth_oauthlib.flow

# Load variables from .env into the environment
load_dotenv()
API_KEY = os.getenv("API_KEY1")
API_KEYS = [os.getenv("API_KEY1"), os.getenv("API_KEY2"), os.getenv("API_KEY2")]
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000", "https://accounts.google.com/o/oauth2/auth", "http://127.0.0.1:8000/auth/google"],
    allow_credentials=True,
    # allow_methods=["*"],
    # allow_headers=["*"],
    allow_methods=["GET", "POST", "PUT", "HEAD", "OPTIONS"],
    allow_headers=["Content-Type", "Set-Cookie", "Access-Control-Allow-Headers", 'Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
youtube = build("youtube", "v3", developerKey=API_KEY)

class GoogleAuth(BaseModel):
    code: str

@app.get("/login/google")
async def login_google():
    url = f"https://accounts.google.com/o/oauth2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_REDIRECT_URI}&scope=openid%20profile%20email&access_type=offline"
    return {
        "url": url
    }

@app.post("/auth/google")
async def auth_google(payload: GoogleAuth):
    received_code = payload.code
    token_url = "https://accounts.google.com/o/oauth2/token"
    data = {
        "code": received_code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": "http://localhost:3000/callback",
        "grant_type": "authorization_code",
    }
    response = requests.post(token_url, data=data)
    access_token = response.json().get("access_token")
    
    return {
        "token": access_token,
    }

async def get_token_authorization(authorization: str = Header(...)):
    if authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1]
        return token
    raise HTTPException(status_code=401, detail="Invalid authorization header")

@app.get("/user-data")
async def auth_google(token: str = Depends(get_token_authorization)):
    user_info = requests.get("https://www.googleapis.com/oauth2/v1/userinfo", headers={"Authorization": f"Bearer {token}"})
    return {
        "user_data": user_info.json()
    }

#Example of a ytb api call with authentification
@app.get("/history2")
async def history2():
    scopes = ["https://www.googleapis.com/auth/youtube.readonly"]
    # Disable OAuthlib's HTTPS verification when running locally.
    # *DO NOT* leave this option enabled in production.
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    api_service_name = "youtube"
    api_version = "v3"
    client_secrets_file = "secret_file.json"

    # Get credentials and create an API client
    flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(client_secrets_file, scopes)
    # credentials = flow.run_console() 
    credentials = flow.run_local_server(port=8080)
    youtube = build(api_service_name, api_version, credentials=credentials)

    request = youtube.videos().list(
        part="snippet,contentDetails,statistics",
        maxResults=50,
        access_token="ACCES_TOKEN_EXAMPLE"
    )
    response = request.execute()

    print(response)
    return response

def fetch_video_data(ids):
    youtube = build("youtube", "v3", developerKey=API_KEYS[random.randint(0, 2)])
    str_ids = ','.join(ids)
    video_response = youtube.videos().list(
        part="snippet, statistics, contentDetails",
        id=str_ids,
        maxResults=50,
    ).execute()
    return video_response["items"]


@app.post("/upload-history2")
async def upload_file(file: UploadFile = File(...), response: Response = None):
    contents = await file.read()
    contents = json.loads(contents)
    contents_df = pd.DataFrame(contents)
    contents_df["id"] = contents_df['titleUrl'].str[32:].astype('str')

    all_ids = list(contents_df["id"])
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

    snippet_df = pd.DataFrame(videos_df['snippet'].tolist())
    videos_df["channelTitle"] = snippet_df["channelTitle"]
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

    return Response(content=csv_string, media_type="text/csv")


@app.post("/upload-history")
async def upload_file(file: UploadFile = File(...), response: Response = None):

    contents = await file.read()
    contents = json.loads(contents)
    contents_df = pd.DataFrame(contents)
    contents_df["id"] = contents_df['titleUrl'].str[32:].astype('str')

    all_ids = list(contents_df["id"])
    sublists_ids = [all_ids[i:i+50] for i in range(0, len(all_ids), 50)]
    videos_df = pd.DataFrame()

    str_ids = ','.join(sublists_ids[0])
    video_response = youtube.videos().list(
        part="snippet, statistics, contentDetails",
        id=str_ids,
        maxResults=50,
    ).execute()
    videos_df = pd.DataFrame(video_response["items"])

    snippet_df = pd.DataFrame(videos_df['snippet'].tolist())
    videos_df["channelTitle"] = snippet_df["channelTitle"]
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

    return Response(content=csv_string, media_type="text/csv")

