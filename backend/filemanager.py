from flask import Blueprint, request
import pm4py
import pandas as pd
from utils.filemanager_utils import filemanager_utils as fu

filemanager = Blueprint("filemanager", __name__)

'''
file upload
parameters: file in the request
'''
@filemanager.route("/upload-file", methods=['POST'])
def upload_file():
    response = {
        "error" : "",
        "errorMessage" : ""
    }

    # Check if request is good
    if 'file' not in request.files:
        response["error"] = True
        response["errorMessage"] = "no file in the received request"
        return response

    # check if there is a filename
    file = request.files['file']
    if file.filename == '':
        response["error"] = True
        response["errorMessage"] = "no filename found"
        return response

    # Check if file format is supported
    supportedFileTypes = [".csv", ".jsonocel", ".xmlocel"]
    if fu.get_file_exension(file.filename) not in supportedFileTypes:
        response["error"] = True
        response["errorMessage"] = "file type is not supported, please choose a different file"
        return response

    # Check if a file with the same name already exists
    if fu.check_file_exists(file.filename):
        response["error"] = True
        response["errorMessage"] = "a file with the same name already exists, please choose a different file"
        return response

    else:
        # save the file
        fu.save_file(file)

        # check if file safe was successful
        if fu.check_file_exists(file.filename):
            response["error"] = False
            response["errorMessage"] = ""
            return response
        else:
            response["error"] = True
            response["errorMessage"] = "Saving the file failed"
            return response


'''
returns a json array of the files that currently exist in /tmp/data
no parameters
'''
@filemanager.route('/list-files', methods=['GET'])
def list_files():
    data = fu.get_uploaded_files()
    response = {
        "error": "",
        "errorMessage": "",
        "files": ""
    }

    if data:
        # list is not empty...
        response["error"] = False
        response["errorMessage"] = ""
        response["files"] = data
        return response

    else:
        # list is empty => no files available
        response["error"] = True
        response["errorMessage"] = "no files available, please upload a file"
        return response


'''
return a json array of the meta data for the file
takes filename as query parameter
example: /get-file-details?filename=FILE.txt
'''
@filemanager.route('/get-file-details', methods=['GET'])
def get_file_details():
    filename = request.args.get('filename')
    # check if the file has been uploaded
    if fu.check_file_exists(filename):
        # collect meta data of the file
        file_size = fu.get_file_size(filename)
        file_last_modified = fu.get_file_last_mod(filename)
        file_created = fu.get_file_created_time(filename)
        file_extension = fu.get_file_exension(filename)
        data = {
            "name": filename,
            "size": file_size,
            "last_modified": file_last_modified,
            "created": file_created,
            "type": file_extension
        }
        return data
    return "error - file not found"


'''
returns the first 10 lines / entries of the selected file
expects filename as query parameter
example: /file-preview?filename=FILE.txt
'''
@filemanager.route('/file-preview', methods=['GET'])
def file_preview():
    filename = request.args.get('filename')
    response = {
        "error": "",
        "errorMessage": "",
        "data": ""
    }
    # check if there is a filename in the request
    if filename == '' or filename == 'null':
        response["error"] = True
        response["errorMessage"] = "no file selected, please select a file to preview"
        return response

    filepath = fu.get_path_from_name(filename)

    # check if the file exists
    if fu.check_file_exists(filename):
        file_extension = fu.get_file_exension(filename)
        # check file extension
        match file_extension:
            case ".csv":
                log = pd.read_csv(filepath)
            case ".xmlocel":
                ocel = pm4py.read.read_ocel_xml(filepath)
                log = ocel.get_extended_table()
            case ".jsonocel":
                ocel = pm4py.read.read_ocel_json(filepath)
                log = ocel.get_extended_table()
            case _:
                response["error"] = True
                response["errorMessage"] = "file format not supported"
                return response
        return log.head(15).to_json(orient="records")
    else:
        response["error"] = True
        response["errorMessage"] = "file not found"
        return response


'''
deletes specified file
expects filename as query parameter
example: /delete-file?filename=FILE.txt

'''
@filemanager.route('/delete-file', methods=['DELETE'])
def delete_file():
    response = {
        "error": False,
        "errorMessage": "",
    }
    filename = request.args.get('filename')
    if fu.check_file_exists(filename):
        fu.delete_file(filename)
        # check if the file has been deleted
        if not fu.check_file_exists(filename):
            return response
        else:
            response["error"] = True
            response["errorMessage"] = "deleting the file failed"
            return response
    else:
        response["error"] = True
        response["errorMessage"] = "to be deleted file not found"
        return response
