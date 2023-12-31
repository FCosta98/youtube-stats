def get_bar_graph_data(labels, data, color):
    return {
        "labels" : labels,
        "datasets": [
            {
                "label": 'Watched Creator ',
                "data": data,
                "backgroundColor": color,
            },
        ],
    }