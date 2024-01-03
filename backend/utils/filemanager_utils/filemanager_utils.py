import os
from os import listdir
from os.path import isfile, join, exists

"""
assembles the absolute filepath for the standard location
"""


def get_path_from_name(filename):
    filepath = join("/tmp", "data", filename)
    return filepath


"""
reads the standard file location
"""


def get_uploaded_files():
    data = [f for f in listdir("/tmp/data") if isfile(join("/tmp/data", f))]
    return data


"""
checks if a file with the given name has already been created
"""


def check_file_exists(filename):
    return exists(get_path_from_name(filename))


"""
saves a file to the filesystem at the standard location
"""


def save_file(file):
    file.save(get_path_from_name(file.filename))


"""
returns size of the file with the given name
"""


def get_file_size(filename):
    filepath = get_path_from_name(filename)
    file_size = os.path.getsize(filepath)
    return file_size


"""
returns the time when the file with the given name was last modified
"""


def get_file_last_mod(filename):
    filepath = get_path_from_name(filename)
    file_last_mod = os.path.getmtime(filepath)
    return file_last_mod


"""
returns the time when the file with the given name was created
"""


def get_file_created_time(filename):
    filepath = get_path_from_name(filename)
    file_created_time = os.path.getctime(filepath)
    return file_created_time


"""
returns the fileextension of the file with the given name
"""


def get_file_exension(filename):
    filepath = get_path_from_name(filename)
    file_name, file_extension = os.path.splitext(filepath)
    return file_extension


"""
deletes the file with the given name in the standard location 
"""


def delete_file(filename):
    filepath = get_path_from_name(filename)
    os.remove(filepath)
