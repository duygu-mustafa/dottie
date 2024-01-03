import pandas as pd
import pm4py

from utils.filemanager_utils.filemanager_utils import get_path_from_name


def process_df(file_name: str):
    """
    Loading and processing of data from file

    Args:
        file_name (str):

    Returns:
        pd.DataFrame: processed df
    """
    file_path = get_path_from_name(file_name)
    ocel = pm4py.read_ocel(file_path)
    df = ocel.get_extended_table()
    df = downsample_df(df, 10)
    object_types = pm4py.ocel_get_object_types(ocel)

    # Create a new column
    df["objects"] = None

    # Iterate through each row
    for index, row in df.iterrows():
        # Access the values in each column of the current row
        new_value = dict()
        for o in object_types:
            # Define value
            new_value[o] = []
            data_type = type(row[f"ocel:type:{o}"])
            if data_type == list:
                new_value[o] = row[f"ocel:type:{o}"]

        # Assign the new value to the 'NewColumn' for the current row
        df.at[index, "objects"] = new_value

    # Format columns
    df = df.rename(
        columns={
            "ocel:activity": "activity",
            "ocel:timestamp": "timestamp",
            "ocel:eid": "eid",
        }
    )

    return df


def downsample_df(original_df: pd.DataFrame, n: int):
    """
    Downsampling of a dataframe at regular intervals n

    Args:
        original_df (pd.DataFrame):
        n (int):

    Returns:
        pd.Dataframe: downsampled df
    """
    total_rows = len(original_df)
    interval_size = max(1, total_rows // n)  # Ensure a minimum interval size of 1

    # Create a list of indices to extract
    indices = list(range(0, total_rows, interval_size))

    # Extract the rows based on the indices
    df = original_df.iloc[indices]

    # Reset the index of the selected DataFrame
    df = df.reset_index(drop=True)
    return df


def process_flatten_df(file_name: str, view: str):
    """
    Loading, flattening and processing of data from file


    Args:
        file_name (str):
        view (str): object_type to flatten

    Returns:
        pd.Dataframe: processed df
    """
    file_path = get_path_from_name(file_name)
    ocel = pm4py.read_ocel(file_path)
    df = pm4py.ocel_flattening(ocel, view)

    df = df.rename(
        columns={
            "case:concept:name": "case",
            "concept:name": "activity",
            "time:timestamp": "timestamp",
            "ocel:eid": "eid",
        }
    )

    return df
