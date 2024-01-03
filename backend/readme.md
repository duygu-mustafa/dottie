# BACKEND

## Filemanager (host/filemanager/...)
### upload-file
expects a POST request with FormData()
returns "error - no file in request" if there are no files attached
returns "error - no file selected" if the attached file is empty
returns "error - upload failed" if the file could not be saved to the file system

### list-files
expects a GET request without parameters
returns an array of the present files

### get-file-details
expects a GET request with the parameter "filename"
returns "error - file not found" if there is no file with the specified name
returns a json array with the attributes "name", "size", "last_modified", "created", "type".

### file-preview
expects a GET request with the parameter "filename"
returns "error - file not found" if there is no file with the specified name
returns "error - no supported file extension" if the specified file exists, but is not spported
returns a json list containing the first 10 lines of the specified file

### delete-file
expects a GET request with the parameter "filename"
returns "error - file not deleted" if the file could no be deleted
returns "error - file not found" if there is no file with the specified name