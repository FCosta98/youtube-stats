import pandas as pd
from io import StringIO
from fastapi import APIRouter, UploadFile, File
from utils.utils import get_bar_graph_data
from utils.colors_map import colors_map


analytics_router = APIRouter(prefix="/v1/analytics", tags=["analytics"])


@analytics_router.post("/generate-graph")
async def generate_graph(file: UploadFile = File(...)):
    if file.filename.endswith('.csv'):
        content = await file.read()

        content_str = str(content, 'utf-8')
        csv_data = StringIO(content_str)
        
        df = pd.read_csv(csv_data)

        df['time'] = pd.to_datetime(df['time'], format="%Y-%m-%dT%H:%M:%S.%fZ", errors='coerce')
        videos_watched = df.groupby(df['time'].dt.to_period('M')).size()
        months = [str(period) for period in videos_watched.index]
        counts = list(videos_watched)
        videos_watched_graph_data = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)')

        creator_watched = df.groupby(df['channelTitle']).size().sort_values(ascending=False)[:10]
        months = [str(creator) for creator in creator_watched.index]
        counts = list(creator_watched)
        creator_watched_graph_data = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)')

        category_df = df.groupby(df['category_name']).size().sort_values(ascending=False)
        categories = [str(category) for category in category_df.index]
        counts = list(category_df)
        colors = [colors_map[i] for i in range(len(categories))]
        category_graph_data = get_bar_graph_data(categories, counts, colors)

        await file.close()

        return {
            "videos_watched_graph": videos_watched_graph_data,
            "creator_watched_graph": creator_watched_graph_data,
            "category_graph_data": category_graph_data,
        }
    
@analytics_router.post("/all_videos")
async def filter_all_videos(by: str, max_time: str, min_time: str, categories_filter: str, file: UploadFile = File(...)):
    if file.filename.endswith('.csv'):
        content = await file.read()

        content_str = str(content, 'utf-8')
        csv_data = StringIO(content_str)
        
        df = pd.read_csv(csv_data)

        if categories_filter != "ALL":
            df = df[df['category_name'] == categories_filter].reset_index(drop=True)
        if max_time != "ALL":
            max_time = int(max_time.replace("min", '', 1))
            df = df.dropna(subset=['duration'])
            df["duration_timedelta"] = pd.to_timedelta(df["duration"])
            df = df[df['duration_timedelta'] <= pd.Timedelta(minutes=max_time)]
        if min_time != "ALL":
            min_time = int(min_time.replace("min", '', 1))
            df = df.dropna(subset=['duration'])
            df["duration_timedelta"] = pd.to_timedelta(df["duration"])
            df = df[df['duration_timedelta'] >= pd.Timedelta(minutes=min_time)]

        df['time'] = pd.to_datetime(df['time'], format="%Y-%m-%dT%H:%M:%S.%fZ", errors='coerce')
        videos_watched = df.groupby(df['time'].dt.to_period('Y')).size() if by == "Year" else df.groupby(df['time'].dt.to_period('M')).size()
        months = [str(period) for period in videos_watched.index]
        counts = list(videos_watched)
        videos_watched_graph_data = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)')

        await file.close()

        return {
            "filtered_data": videos_watched_graph_data,
        }

@analytics_router.post("/filters")
async def filter(by: str, max_time: str, min_time: str, categories_filter: str, file: UploadFile = File(...)):
    if file.filename.endswith('.csv'):
        print("Max :", max_time, "MIN :", min_time, "Categories :", categories_filter)
        content = await file.read()

        content_str = str(content, 'utf-8')
        csv_data = StringIO(content_str)
        
        df = pd.read_csv(csv_data)

        if categories_filter != "ALL":
            df = df[df['category_name'] == categories_filter].reset_index(drop=True)
        if max_time != "ALL":
            max_time = int(max_time.replace("min", '', 1))
            df = df.dropna(subset=['duration'])
            df["duration_timedelta"] = pd.to_timedelta(df["duration"])
            df = df[df['duration_timedelta'] <= pd.Timedelta(minutes=max_time)]
        if min_time != "ALL":
            min_time = int(min_time.replace("min", '', 1))
            df = df.dropna(subset=['duration'])
            df["duration_timedelta"] = pd.to_timedelta(df["duration"])
            df = df[df['duration_timedelta'] >= pd.Timedelta(minutes=min_time)]

        df['time'] = pd.to_datetime(df['time'], format="%Y-%m-%dT%H:%M:%S.%fZ", errors='coerce')
        videos_watched = df.groupby(df['time'].dt.to_period('Y')).size() if by == "Year" else df.groupby(df['time'].dt.to_period('M')).size()
        months = [str(period) for period in videos_watched.index]
        counts = list(videos_watched)
        videos_watched_graph_data = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)')

        creator_watched = df.groupby(df['channelTitle']).size().sort_values(ascending=False)[:10]
        months = [str(creator) for creator in creator_watched.index]
        counts = list(creator_watched)
        creator_watched_graph_data = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)')

        category_df = df.groupby(df['category_name']).size().sort_values(ascending=False)
        categories = [str(category) for category in category_df.index]
        counts = list(category_df)
        colors = [colors_map[i] for i in range(len(categories))]
        category_graph_data = get_bar_graph_data(categories, counts, colors)

        await file.close()

        return {
            "videos_watched_graph": videos_watched_graph_data,
            "creator_watched_graph": creator_watched_graph_data,
            "category_graph_data": category_graph_data,
        }