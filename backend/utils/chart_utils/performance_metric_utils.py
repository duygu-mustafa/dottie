import pm4py
import re

from pm4py import ocel as pm4py_ocel
from pm4py import ocel_get_attribute_names

from utils.filemanager_utils import filemanager_utils as fu


"""
returns a dictionary that contains the following metrics of the the whole event log: 
- all contained object types
- all contained attribute names
- all contained activity names
- how many events are in the log
- a nested dictionary of how many activities per name occur
"""


def get_general_metrics(filename):
    try:
        ## assemble data
        filepath = fu.get_path_from_name(filename)
        ocel = pm4py.read_ocel(filepath)
        df = ocel.get_extended_table()

        # simple metrics
        object_types = pm4py_ocel.ocel_get_object_types(ocel)
        attribute_names = ocel_get_attribute_names(ocel)
        tmp_activities = df["ocel:activity"].unique()

        # count per activity
        activities = list()
        for x in tmp_activities:
            activities.append(x)
        activity_count = len(df.index)
        count_per_activity = df["ocel:activity"].value_counts().to_dict()

        result = {
            "object_types": object_types,
            "attribute_names": attribute_names,
            "activities": activities,
            "activity_count": activity_count,
            "count_per_activity": count_per_activity,
        }
        return result
    except:
        result = {
            "error": True,
            "errorMessage": "could not generate Performance Metrics"
        }
        return result


"""
returns a dictionary that contains the following information about a given Object in a given event log:
- all the activities the object occurs in, including their eventIDs and timestamps
- duration of the object lifecycle
- start of the object lifecycle
- end of the object lifecycle
"""


def get_object_lifecycle(oid, filename):
    try:
        # collect data
        filepath = fu.get_path_from_name(filename)
        ocel = pm4py.read_ocel(filepath)
        all_objects_summary = pm4py.ocel_objects_summary(ocel)
        relations = ocel.relations.loc[ocel.relations["ocel:oid"] == oid]

        # get single object information
        single_object_summary = all_objects_summary.loc[
            all_objects_summary["ocel:oid"] == oid
        ]
        object_lifecycle_activities = single_object_summary["activities_lifecycle"].iloc[0]
        object_lifecycle_duration = single_object_summary["lifecycle_duration"].iloc[0]
        object_lifecycle_start = single_object_summary["lifecycle_start"].iloc[0]
        object_lifecycle_end = single_object_summary["lifecycle_end"].iloc[0]
        object_lifecycle_eids = relations["ocel:eid"].tolist()
        object_lifecycle_timestamps = []
        for eid in object_lifecycle_eids:
            tmp = ocel.events.loc[ocel.events["ocel:eid"] == eid]
            timestamp = tmp["ocel:timestamp"].iloc[0]
            object_lifecycle_timestamps.append(timestamp)
        result = {
            "error": False,
            "object_lifecycle_activities": object_lifecycle_activities,
            "object_lifecycle_duration": object_lifecycle_duration,
            "object_lifecycle_start": object_lifecycle_start,
            "object_lifecycle_end": object_lifecycle_end,
            "object_lifecycle_eids": object_lifecycle_eids,
            "object_lifecycle_timestamps": object_lifecycle_timestamps,
        }
        return result
    except:
        result = {
            "error": True,
            "errorMessage": "could not generate dot metrics"
        }
        return result

"""
returns a dictionary that contains the given objects attributes in the given event log
"""


def get_object_attributes(oid, filename):
    try:
        filepath = fu.get_path_from_name(filename)
        ocel = pm4py.read_ocel(filepath)
        object_entry = ocel.objects[ocel.objects["ocel:oid"] == oid]

        # get all table headers
        tableheaders = ocel.objects.columns.tolist()

        # get non-attributes column names
        r = re.compile("ocel:.*")
        nonattributes = list(filter(r.match, tableheaders))

        # get attribute column names, by filtering out non-attribute names
        object_attributes = [i for i in tableheaders if i not in nonattributes]

        # get attribute Values
        obj_attributes = dict()
        for attribute in object_attributes:
            if str(object_entry[attribute].iloc[0]) != "nan":
                obj_attributes[attribute] = object_entry[attribute].iloc[0]
            else:
                obj_attributes[attribute] = ""
        return obj_attributes

    except:
        response = {
            "error": True,
            "errorMessage": "could not generate object attributes"
        }
        return response

"""
returns a dictionary that contains the given events attributes in the given event log
"""


def get_event_attributes(eid, filename):
    filepath = fu.get_path_from_name(filename)
    ocel = pm4py.read_ocel(filepath)
    event_entry = ocel.events[ocel.events["ocel:eid"] == eid]

    # get all table headers
    tableheaders = ocel.events.columns.tolist()

    # get non-attributes
    r = re.compile("ocel:*")
    nonattributes = list(filter(r.match, tableheaders))

    # filter actual attributes
    event_attributes = [i for i in tableheaders if i not in nonattributes]

    # get attribute values
    e_attributes = dict()
    for attribute in event_attributes:
        if str(event_entry[attribute].iloc[0]) != "nan":
            e_attributes[attribute] = event_entry[attribute].iloc[0]
        else:
            e_attributes[attribute] = ""
    return e_attributes
