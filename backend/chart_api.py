from datetime import datetime

import numpy as np
from flask import Blueprint, request

from utils.chart_utils import performance_metric_utils as perf
from utils.chart_utils.chart import Chart
import plotly
import json

chart = Blueprint("chart", __name__)

dotted_chart = None
collapsed_subplots = []
selected_activities = []
selected_object_types = []
view = "eventID"


@chart.route("/scatterplot", methods=["GET"])
def get_dataframe():
    """
    returns the chart to the frontend
    """
    # import global vars
    global view, dotted_chart, selected_activities, selected_object_types, collapsed_subplots

    # get query params
    filename = request.args.get("filename")
    current_view = request.args.get("view")
    frontend_reset_filters = request.args.get("resetFilters")
    start_date = request.args.get("startTime")
    end_date = request.args.get("endTime")

    # handle reset_filters or view change
    if current_view != view or frontend_reset_filters == "true":
        view = current_view
        selected_activities = []
        selected_object_types = []

    # date formats
    start_date, end_date = extract_datetime(start_date, end_date)

    # init chart
    dotted_chart = Chart(
        filename,
        current_view,
        collapsed_subplots,
        selected_activities,
        selected_object_types,
        start_date,
        end_date,
    )

    # create chart and determine if error occurred
    is_success = dotted_chart.make_dotted_chart()

    all_activities = handle_shared_variables()
    if is_success is True:
        graphJSON = json.loads(plotly.io.to_json(dotted_chart.fig, pretty=True))
        response = {
            "figure": graphJSON,
            "activities": all_activities,
            "selected_activities": selected_activities,
            "object_types": dotted_chart.get_objects_list(),
            "selected_object_types": selected_object_types,
        }
    else:
        response = {
            "error": str(is_success),
            "activities": all_activities,
            "selected_activities": selected_activities,
            "object_types": dotted_chart.get_objects_list(),
            "selected_object_types": selected_object_types,
        }

    return response


@chart.route("/toggle-subplot", methods=["GET"])
def toggle_subplot():
    """
    toggles the index at the clicked subplot
    """
    global dotted_chart, collapsed_subplots

    # "collapse all" button has been clicked
    if request.args.get("traceIndex") == "all":
        for x in range(10):
            if not collapsed_subplots[x]:
                dotted_chart.set_collapsed_subplots_at_index(x)

        collapsed_subplots = dotted_chart.get_collapsed_subplots()
        return {"collapsedSubplots": None}

    trace_index = request.args.get("traceIndex", type=int)
    subplot_index = dotted_chart.get_subplot_by_trace_index(trace_index)
    dotted_chart.set_collapsed_subplots_at_index(subplot_index)

    collapsed_subplots = dotted_chart.get_collapsed_subplots()
    return {"collapsedSubplots": None}


@chart.route("/apply-activity-filter", methods=["POST"])
def apply_activity_filter():
    if request.method == "POST":
        data = request.get_json()
        global selected_activities, dotted_chart

        selected_activities = data.get("selectedActivities", [])
        dotted_chart.set_selected_activities(selected_activities)

        return {"selectedActivities": None}


@chart.route("/apply-object-filter", methods=["POST"])
def apply_object_filter():
    if request.method == "POST":
        data = request.get_json()
        global selected_object_types, dotted_chart

        selected_object_types = data.get("selectedObjectTypes", [])
        dotted_chart.set_selected_object_types(selected_object_types)

        return {"selectedObjects": None}


@chart.route("/get-general-metrics", methods=["GET"])
def get_general_metrics():
    response = {
        "error": "",
        "errorMessage": "",
        "data": "",
    }
    if request.args.get("filename"):
        filename = request.args.get("filename")
        response["error"] = "False"
        response["data"] = perf.get_general_metrics(filename)
    else:
        response["error"] = "True"
        response["errorMessage"] = "no file parameter"
    return response


@chart.route("/get-object-lifecycle", methods=["GET"])
def get_object_lifecycle():
    response = {"error": "", "errorMessage": "", "data": ""}
    if request.args.get("filename") and request.args.get("oid"):
        filename = request.args.get("filename")
        oid = request.args.get("oid")
        response["error"] = "False"
        data = perf.get_object_lifecycle(oid, filename)
        if data["error"] == True:
            response["error"] = True
            response["errorMessage"] = data["errorMessage"]
        else:
            response["data"] = data
    else:
        response["error"] = True
        response["errorMessage"] = "missing file or object id parameter"
    return response


@chart.route("/get-object-attributes", methods=["GET"])
def get_object_attributes():
    response = {"error": "", "errorMessage": "", "data": ""}

    if request.args.get("filename") and request.args.get("oid"):
        filename = request.args.get("filename")
        oid = request.args.get("oid")
        response["error"] = "False"
        response["data"] = perf.get_object_attributes(oid, filename)
    else:
        response["error"] = "True"
        response["errorMessage"] = "missing file or object id parameter"
    return response


@chart.route("/get-event-attributes", methods=["GET"])
def get_event_attributes():
    response = {"error": "", "errorMessage": "", "data": ""}
    if request.args.get("filename") and request.args.get("eid"):
        filename = request.args.get("filename")
        eid = request.args.get("eid")
        response["error"] = "False"
        response["data"] = perf.get_event_attributes(eid, filename)
    else:
        response["error"] = "True"
        response["errorMessage"] = "missing file or event id parameter"
    return response


def handle_shared_variables():
    global dotted_chart, selected_activities, selected_object_types, collapsed_subplots

    selected_activities = dotted_chart.get_selected_activities()
    selected_object_types = dotted_chart.get_selected_object_types()
    collapsed_subplots = dotted_chart.get_collapsed_subplots()
    selected_activities = (
        selected_activities.tolist()
        if isinstance(selected_activities, np.ndarray)
        else selected_activities
    )
    selected_object_types = (
        selected_object_types.tolist()
        if not isinstance(selected_object_types, list)
        else selected_object_types
    )
    all_activities = (
        dotted_chart.get_activity_list().tolist()
        if isinstance(dotted_chart.get_activity_list(), np.ndarray)
        else dotted_chart.get_activity_list()
    )
    return all_activities


def extract_datetime(start_date, end_date):
    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%dT%H:%M")
    except Exception:
        start_date = None
    try:
        end_date = datetime.strptime(end_date, "%Y-%m-%dT%H:%M")
    except Exception:
        end_date = None
    return start_date, end_date
