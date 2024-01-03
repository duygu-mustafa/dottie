import random

import pandas as pd
import plotly.graph_objs
from plotly.subplots import make_subplots
import plotly.graph_objects as go
import plotly.express as px
import datetime

from utils.chart_utils.process_utils import process_df, process_flatten_df


class Chart:
    """
    Class that represents the chart elememnt of the app
    """

    def __init__(
        self,
        file_name: str,
        view: str,
        collapsed_subplots: list,
        selected_activities: list,
        selected_objects: list,
        start_date: datetime,
        end_date: datetime,
    ):
        """
        Initialisation method

        Args:
            file_name (str): the event log that is plotted
            view (str): the attribute the event log is flattened on
            collapsed_subplots (list): list containing the subplots in the eventID view and the corresponding bool values
            selected_activities (list): filtered activities
            selected_objects (list): filtered object types
            start_date (datetime): filter start date
            end_date (datetime): filter end date
        """
        self.view = view
        self.file_name = file_name
        self.df = pd.DataFrame()
        self.fig = None

        # vars used for subplots
        self.collapsed_subplots = collapsed_subplots
        self.trace_to_row = dict()

        # vars used for filtering
        self.activity_list = []
        self.objects_list = []
        self.allowed_activity_list = selected_activities
        self.required_object_list = selected_objects

        self.start_time = start_date
        self.end_time = end_date

    def get_subplot_by_trace_index(self, trace_index: int) -> int:
        """
        Args:
            trace_index (int): trace index from the plotly chart

        Returns:
            int: the subplot index the trace is from
        """
        return self.trace_to_row[trace_index]

    def get_collapsed_subplots(self) -> list:
        """
        Getter method for collapsed_subplots

        Returns:
            list:
        """
        return self.collapsed_subplots

    def set_collapsed_subplots_at_index(self, index: int):
        """
        Setter method for collapsed_subplots

        Args:
            index (int):
        """
        self.collapsed_subplots[index] = not self.collapsed_subplots[index]

    def get_activity_list(self) -> list:
        """
        Getter method for activity_list


        Returns:
            list:
        """
        return self.activity_list

    def set_activity_list(self):
        """
        Setter method for collapsed_subplots
        """
        self.activity_list = self.df["activity"].unique()

    def get_objects_list(self) -> list:
        """
        Getter method for objects_list

        Returns:
            list:
        """
        return self.objects_list

    def set_objects_list(self):
        """
        Setter method for objects_list
        """
        self.objects_list = list(self.df.iloc[1]["objects"].keys())

    def get_selected_object_types(self) -> list:
        """
        Getter method for selected_object_types

        Returns:
            list:
        """
        return self.required_object_list

    def set_selected_object_types(self, allowed_object_list):
        """
        Setter method for selected_object_types


        Args:
            allowed_object_list (list):
        """
        self.required_object_list = allowed_object_list

    def get_selected_activities(self) -> list:
        """
        Getter method for selected_activities

        Returns:
            list:
        """
        return self.allowed_activity_list

    def set_selected_activities(self, allowed_activity_list):
        """
        Setter method for selected_activities

        Args:
            allowed_activity_list (list):
        """
        self.allowed_activity_list = allowed_activity_list

    def assign_color(self) -> dict:
        """
        Assigns each object_type in the df a color

        Returns:
            dict:
        """
        elements = self.df.iloc[1]["objects"].keys()
        colors = []
        for _ in elements:
            # Generate a random hexadecimal color code
            while True:
                color = "#" + "".join(random.choices("0123456789ABCDEF", k=6))
                if color != "#000000":
                    break
            colors.append(color)
        return dict(zip(elements, colors))

    def assign_shape(self) -> dict:
        """
        Assigns each activity a shape

        Returns:
            dict:
        """
        activity_list = self.df["activity"].drop_duplicates()
        shape_options = [
            "circle",
            "square",
            "diamond",
            "cross",
            "x",
            "star",
            "triangle-up",
            "triangle-down",
        ]

        shape_dict = {}

        for activity in activity_list:
            cur = random.choice(shape_options)
            while cur in shape_dict.values():
                cur = random.choice(shape_options)
            shape_dict[activity] = random.choice(shape_options)
        return shape_dict

    def filter_activities(self):
        """
        Applies activity filters on the df
        """
        if not self.allowed_activity_list:
            self.allowed_activity_list = self.activity_list

        filtered_df = self.df[self.df["activity"].isin(self.allowed_activity_list)]
        filtered_df = filtered_df.reset_index(drop=True)

        self.df = filtered_df

    def filter_object_types(self):
        """
        Applies object_type filters on the df
        """
        filtered_df = self.df

        for o in self.required_object_list:
            filtered_df = filtered_df[
                filtered_df["objects"].apply(lambda x: x.get(o) != [])
            ]
            filtered_df = filtered_df.reset_index(drop=True)

        self.df = filtered_df

    def filter_timestamp(self):
        """
        Applies start and end date filters on the df
        """
        filtered_df = self.df
        if self.start_time is not None:
            filtered_df = filtered_df[(self.df["timestamp"] >= self.start_time)]
        if self.end_time is not None:
            filtered_df = filtered_df[(self.df["timestamp"] <= self.end_time)]
        filtered_df = filtered_df.reset_index(drop=True)

        self.df = filtered_df

    def plot_df(self) -> go.Figure:
        """
        Creates plotly scatterchart with subplots and heatmap on the "eventID" view
        """
        if not self.collapsed_subplots:
            self.collapsed_subplots = [True] * len(self.df)

        color_dict = self.assign_color()
        shape_dict = self.assign_shape()

        fig = make_subplots(
            rows=len(self.df), cols=1, shared_xaxes=True, x_title="Timestamp"
        )
        legend_covered_object_types = []
        trace_to_row = dict()

        for index, row in self.df.iterrows():
            row_index = index
            scatter_objects = []

            activity = row["activity"]
            marker_symbol = shape_dict.get(activity, "circle")
            if self.collapsed_subplots[index]:
                # Subplot is collapsed, use event ID as y data
                x_data = [row["timestamp"]]
                y_data = [row["eid"]]
                hover_text = [f"{activity}-click for more"]
                scatter = go.Scatter(
                    x=x_data,
                    y=y_data,
                    mode="markers",
                    marker=dict(
                        symbol=marker_symbol,
                        # size=marker_size,
                        line=dict(width=1),
                    ),
                    name=index,
                    line=dict(color="#000000"),
                    showlegend=False,
                    hoverinfo="text",  # Show only the hover text in the tooltip
                    text=hover_text,  # Assign the hover text
                )
                scatter_objects.append(scatter)

                # Create the heatmap trace
                total_count = 0
                for values in row["objects"].values():
                    total_count += len(values)
                heatmap_data = [total_count]
                heatmap_trace = go.Scatter(
                    x=x_data,
                    y=y_data,
                    mode="markers",
                    marker=dict(
                        size=heatmap_data,  # Adjust the size of the heatmap markers
                        sizemode="diameter",  # Use the size as the diameter of the markers
                        sizeref=0.3,  # Adjust the size reference for the markers
                        color=heatmap_data,
                        colorscale="Viridis",
                        showscale=False,
                        opacity=0.5,
                        colorbar=dict(title="Object Count"),
                    ),
                    hoverinfo="skip",  # Hide hover information for the heatmap
                    showlegend=False,
                )
                scatter_objects.append(heatmap_trace)
            else:
                # Loop through each object type
                for object_type, objects in row["objects"].items():
                    # Create x and y data for the Scatter object

                    x_data = [row["timestamp"]] * len(objects)
                    y_data = objects
                    hover_text = [f"{activity}-{object_type}-{obj}" for obj in objects]

                    marker_size = max(5, 2 * len(objects))

                    show_legend_flag = False
                    if object_type not in legend_covered_object_types:
                        show_legend_flag = True
                        legend_covered_object_types.append(object_type)
                    scatter = go.Scatter(
                        x=x_data,
                        y=y_data,
                        mode="markers",
                        marker=dict(
                            symbol=marker_symbol, size=marker_size, line=dict(width=1)
                        ),
                        name=object_type,
                        line=dict(color=color_dict[object_type]),
                        showlegend=show_legend_flag,
                        hoverinfo="text",  # Show only the hover text in the tooltip
                        text=hover_text,  # Assign the hover text
                    )
                    scatter_objects.append(scatter)

            # Create the subplot figure
            for scatter_trace in scatter_objects:
                fig.add_trace(scatter_trace, row=index + 1, col=1)
                trace_to_row[len(fig.data) - 1] = row_index

        fig.update_layout(
            height=800,
            width=1000,
            yaxis={"title": "Event ID"},
        )

        self.trace_to_row = trace_to_row
        return fig

    def plot_flattened_df(self) -> go.Figure:
        """
        Creates plotly scattterchart on the flattened object_type view

        """
        fig = px.scatter(
            self.df,
            x="timestamp",
            y="case",
            render_mode="webgl",
            color="activity",
            hover_data=["eid"],
        )

        # Set the axis labels
        fig.update_layout(
            xaxis_title="Timestamp",
            yaxis_title=f"{self.view.title()}",
            width=1500,
            height=800,
        )

        # Remove the color bar
        fig.update_layout(coloraxis_colorbar=None)

        # Show the plot
        return fig

    def make_dotted_chart(self):
        """
        Main function for chart creation
        """
        try:
            if self.view == "eventID":
                self.df = process_df(self.file_name)

                self.set_activity_list()
                self.set_objects_list()

                self.filter_activities()
                self.filter_object_types()
                self.filter_timestamp()

                if len(self.df) == 0:
                    raise Exception("No data for those filters!")

                self.fig = self.plot_df()
                return True
            else:
                self.df = process_flatten_df(self.file_name, self.view)
                self.set_activity_list()

                self.filter_activities()
                self.filter_timestamp()

                if len(self.df) == 0:
                    raise Exception("No data for those filters!")

                self.fig = self.plot_flattened_df()
                return True

        except Exception as e:
            return e
