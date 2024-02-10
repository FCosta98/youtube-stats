import pandas as pd

def get_bar_graph_data(labels, data, color, axis):
    return {
        "labels" : labels,
        "datasets": [
            {
                "data": data,
                "backgroundColor": color,
                "indexAxis": axis,
            },
        ],
    }

def manage_analytics_filter(df, max_time, min_time, categories_filter):
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
    return df