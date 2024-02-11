import pandas as pd
from io import StringIO
from fastapi import APIRouter, UploadFile, File
from utils.utils import get_bar_graph_data, manage_analytics_filter
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
        first_year = df.time.dt.year.min()
        last_year = df.time.dt.year.max()
        videos_watched = df[df.time.dt.year == last_year]
        videos_watched = videos_watched.groupby(df['time'].dt.to_period('M')).size()
        months = [str(period) for period in videos_watched.index]
        counts = list(videos_watched)
        videos_watched_graph_data = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)', "x")

        creator_watched = df.groupby(df['channelTitle']).size().sort_values(ascending=False)[:10]
        creators = [str(creator) for creator in creator_watched.index]
        counts = list(creator_watched)
        creator_watched_graph_data = get_bar_graph_data(creators, counts, 'rgba(255, 99, 132, 0.5)', "x")

        category_df = df.groupby(df['category_name']).size().sort_values(ascending=False)
        categories = [str(category) for category in category_df.index]
        counts = list(category_df)
        colors = [colors_map[i] for i in range(len(categories))]
        category_graph_data = get_bar_graph_data(categories, counts, colors, "x")

        hours_watched = df.groupby(df['time'].dt.hour).size()
        hours = [str(int(period))+"h" for period in hours_watched.index]
        counts = list(hours_watched)
        hours_watched_graph_data = get_bar_graph_data(hours, counts, 'rgba(255, 99, 132, 0.5)', "x")

        favourites_videos = df.groupby(df['real_title']).size().sort_values(ascending=False)[:10]
        months = [str(video) for video in favourites_videos.index]
        counts = list(favourites_videos)
        favourites_videos_graph_data = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)', "y")     

        await file.close()

        return {
            "videos_watched_graph": videos_watched_graph_data,
            "next_year": None,
            "current_year": last_year,
            "prev_year": last_year-1 if last_year-1 >= first_year else None,
            "creator_watched_graph": creator_watched_graph_data,
            "category_graph_data": category_graph_data,
            "hours_watched_graph_data": hours_watched_graph_data,
            "favourites_videos_graph_data": favourites_videos_graph_data,
        }
    
@analytics_router.post("/all_videos")
async def filter_all_videos(by: str, max_time: str, min_time: str, categories_filter: str, year: int, file: UploadFile = File(...)):
    if file.filename.endswith('.csv'):
        content = await file.read()

        content_str = str(content, 'utf-8')
        csv_data = StringIO(content_str)
        
        df = pd.read_csv(csv_data)

        df = manage_analytics_filter(df, max_time, min_time, categories_filter)

        df['time'] = pd.to_datetime(df['time'], format="%Y-%m-%dT%H:%M:%S.%fZ", errors='coerce')
        if by != "Year":
            videos_watched = df[df.time.dt.year == year]
            videos_watched = videos_watched.groupby(videos_watched['time'].dt.to_period('M')).size()
        else:
            videos_watched = df.groupby(df['time'].dt.to_period('Y')).size()
        # videos_watched = df.groupby(df['time'].dt.to_period('Y')).size() if by == "Year" else df.groupby(df['time'].dt.to_period('M')).size()
        months = [str(period) for period in videos_watched.index]
        counts = list(videos_watched)
        videos_watched_graph_data = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)', "x")

        await file.close()

        return {
            "filtered_data": videos_watched_graph_data,
        }
    
@analytics_router.post("/hours_watched")
async def filter_all_videos(isMean: str, max_time: str, min_time: str, categories_filter: str, file: UploadFile = File(...)):
    if file.filename.endswith('.csv'):
        content = await file.read()

        content_str = str(content, 'utf-8')
        csv_data = StringIO(content_str)
        
        df = pd.read_csv(csv_data)

        df = manage_analytics_filter(df, max_time, min_time, categories_filter)

        df['time'] = pd.to_datetime(df['time'], format="%Y-%m-%dT%H:%M:%S.%fZ", errors='coerce')
        if isMean == "General":
            hours_watched = df.groupby(df['time'].dt.hour).size()
        else:
            time_difference = df['time'].iloc[0] - df['time'].iloc[-1]
            hours_watched = df.groupby(df['time'].dt.hour).size() / time_difference.days
        hours = [str(int(period))+"h" for period in hours_watched.index]
        counts = list(hours_watched)
        hours_watched_graph_data = get_bar_graph_data(hours, counts, 'rgba(255, 99, 132, 0.5)', "x")    

        await file.close()

        return {
            "filtered_data": hours_watched_graph_data,
        }

@analytics_router.post("/filters")
async def filter(by: str, isMean: str, max_time: str, min_time: str, categories_filter: str, file: UploadFile = File(...)):
    if file.filename.endswith('.csv'):
        content = await file.read()

        content_str = str(content, 'utf-8')
        csv_data = StringIO(content_str)
        
        df = pd.read_csv(csv_data)

        df = manage_analytics_filter(df, max_time, min_time, categories_filter)

        df['time'] = pd.to_datetime(df['time'], format="%Y-%m-%dT%H:%M:%S.%fZ", errors='coerce')
        first_year = df.time.dt.year.min()
        last_year = df.time.dt.year.max()
        if by == "Month":
            videos_watched = df[df.time.dt.year == last_year]
            videos_watched = videos_watched.groupby(df['time'].dt.to_period('M')).size()
        else:
            videos_watched = df.groupby(df['time'].dt.to_period('Y')).size()
        months = [str(period) for period in videos_watched.index]
        counts = list(videos_watched)
        videos_watched_graph_data = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)', "x")

        creator_watched = df.groupby(df['channelTitle']).size().sort_values(ascending=False)[:10]
        months = [str(creator) for creator in creator_watched.index]
        counts = list(creator_watched)
        creator_watched_graph_data = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)', "x")

        category_df = df.groupby(df['category_name']).size().sort_values(ascending=False)
        categories = [str(category) for category in category_df.index]
        counts = list(category_df)
        colors = [colors_map[i] for i in range(len(categories))]
        category_graph_data = get_bar_graph_data(categories, counts, colors, "x")

        if isMean == "General":
            hours_watched = df.groupby(df['time'].dt.hour).size()
        else:
            time_difference = df['time'].iloc[0] - df['time'].iloc[-1]
            hours_watched = df.groupby(df['time'].dt.hour).size() / time_difference.days
        hours = [str(int(period))+"h" for period in hours_watched.index]
        counts = list(hours_watched)
        hours_watched_graph_data = get_bar_graph_data(hours, counts, 'rgba(255, 99, 132, 0.5)', "x")

        favourites_videos = df.groupby(df['real_title']).size().sort_values(ascending=False)[:10]
        months = [str(video) for video in favourites_videos.index]
        counts = list(favourites_videos)
        favourites_videos_graph_data = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)', "y")  

        await file.close()

        return {
            "videos_watched_graph": videos_watched_graph_data,
            "next_year": None,
            "current_year": last_year,
            "prev_year": last_year-1 if last_year-1 >= first_year else None,
            "creator_watched_graph": creator_watched_graph_data,
            "category_graph_data": category_graph_data,
            "hours_watched_graph_data": hours_watched_graph_data,
            "favourites_videos_graph_data": favourites_videos_graph_data,
        }
    
@analytics_router.post("/pagination")
async def filter(max_time: str, min_time: str, categories_filter: str, page: int, graph_type: str, file: UploadFile = File(...)):
    if file.filename.endswith('.csv'):
        content = await file.read()
        content_str = str(content, 'utf-8')
        csv_data = StringIO(content_str)
        
        df = pd.read_csv(csv_data)

        df = manage_analytics_filter(df, max_time, min_time, categories_filter)

        min = 10*(page-1)
        max = 10*page

        if graph_type == "all_videos":
            df['time'] = pd.to_datetime(df['time'], format="%Y-%m-%dT%H:%M:%S.%fZ", errors='coerce')
            first_year = df.time.dt.year.min()
            last_year = df.time.dt.year.max()
            videos_watched = df[df.time.dt.year == page]
            videos_watched = videos_watched.groupby(videos_watched['time'].dt.to_period('M')).size()
            months = [str(period) for period in videos_watched.index]
            counts = list(videos_watched)
            videos_watched_graph = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)', "x")
            data_graph = {
                "data_graph": videos_watched_graph,
                "next_year": page+1 if page+1 <= last_year else None,
                "current_year": page,
                "prev_year": page-1 if page-1 >= first_year else None,
            }

        elif graph_type == "favourite_creators":
            creator_watched = df.groupby(df['channelTitle']).size().sort_values(ascending=False)
            creator_watched_reduced = creator_watched[min:max]
            months = [str(creator) for creator in creator_watched_reduced.index]
            counts = list(creator_watched_reduced)
            creator_watched_graph = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)', "x")
            data_graph = {
                "data_graph": creator_watched_graph,
                "next_top_creator_page": page+1 if creator_watched.count()>=page*10 else 0,
                "prev_top_creator_page": page-1,
            }

        else:
            favourites_videos = df.groupby(df['real_title']).size().sort_values(ascending=False)
            favourites_videos_reduced = favourites_videos[min:max]
            months = [str(video) for video in favourites_videos_reduced.index]
            counts = list(favourites_videos_reduced)
            favourites_videos_graph_data = get_bar_graph_data(months, counts, 'rgba(255, 99, 132, 0.5)', "y")
            data_graph = {
                "data_graph": favourites_videos_graph_data,
                "next_top_videos_page": page+1 if favourites_videos.count()>=page*10 else 0,
                "prev_top_videos_page": page-1,
            }

        await file.close()

        return data_graph