import React, { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageNavigation from "./PageNavigation";
import { useDropzone } from "react-dropzone";

function Upload() {
  // state that stores selected file
  const [file, setFile] = useState([{}]);

  // error state
  const [errorMessage, setErrorMessage] = useState("");

  // state that controls the display of the error message
  const [showError, setShowError] = useState(false);

  // for button navigation
  const navigate = useNavigate();

  // Dropzone stuff
  const onDrop = useCallback((acceptedFiles) => {
    setFile({ selectedFile: acceptedFiles[0] });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // state for percentage indicator
  const [uploadPercentage, setUploadPercentage] = useState(0);

  // state for alert
  const [uploadComplete, setUploadComplete] = useState(false);

  // Button handler to switch to files overview
  const handleNextClick = () => {
    navigate("/files");
  };

  // On file select (from the pop up)
  const onFileChange = (event) => {
    // Update the state
    setFile({ selectedFile: event.target.files[0] });
  };

  // On file upload (click the upload button)
  const onFileUpload = () => {
    // Request made to the backend api
    // Send formData object
    if (typeof file.selectedFile !== "undefined" || file.selectedFile === "") {
      const data = new FormData();
      data.append("file", file.selectedFile, file.selectedFile.name);

      axios
        .post("/filemanager/upload-file", data, {
          onUploadProgress: (progressEvent) => {
            setUploadPercentage(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
          },
        })
        .then((res) => {
          // handle error from backend
          console.log(res)
          if (res.data.error === true) {
            setErrorMessage(res.data.errorMessage);
            setUploadComplete(false);
            setShowError(true);
            setUploadPercentage(0);
            // hide the error message after 2.5 seconds
            setTimeout(() => {
              setShowError(false);
            }, 2500);
          } else {
            setErrorMessage("");
            setUploadComplete(true);
            setFile([{}]); // reset state
            // keep the green alert and 100% percentage indicator for 2.5 seconds
            setTimeout(() => {
              setUploadPercentage(0);
              setUploadComplete(false);
            }, 2500);
          }
        });
    }
  };

  // File content to be displayed after
  // file upload is complete
  const fileData = () => {
    if (file && file.selectedFile) {
      // get file metadata
      let lastModified = "";
      if (file.selectedFile.lastModified) {
        lastModified = file.selectedFile.lastModified;
      }
      let date = new Date(lastModified);

      let file_size = file.selectedFile.size / 1000; // in KB

      // display selected file metadata
      return (
        <div className="file-details">
          <h3>File Details:</h3>
          <p>File Name: {file.selectedFile.name}</p>
          <p>File Type: {file.selectedFile.name.split(".").pop()}</p>
          <p>File size in KB: {file_size}</p>
          <p>
            File last modified: {date.toLocaleDateString("de-DE")} at{" "}
            {date.toLocaleTimeString("de-DE")}
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h5>Select a file before pressing the upload button</h5>
        </div>
      );
    }
  };

  return (
    <div>
      <PageNavigation selectedFile="" />
      <div className="upload-container">
        {/* <h3 className="upload-title">Upload a file</h3> */}
        {/*FILE UPLOAD*/}
        <div
          {...getRootProps()}
          className="upload-input-container dropzone"
          style={{ height: "230px" }}
        >
          <input {...getInputProps()} type="file" onChange={onFileChange} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag and drop a file here, or click to select files</p>
          )}
        </div>
        <button
          type="button"
          className="btn btn-dark upload-btn"
          onClick={onFileUpload}
        >
          Upload
        </button>
        {/*PROGRESS BAR*/}
        <div className="progress">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${uploadPercentage}%` }}
            aria-valuenow={uploadPercentage}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {uploadPercentage}%
          </div>
        </div>
        {/*SUCCESS MESSAGE*/}
        {uploadComplete && (
          <div className="alert alert-success" role="alert">
            Your file has been uploaded. You can now upload another file or
            continue to the next step.
          </div>
        )}
        {/*ERROR MESSAGE*/}
        {showError && (
          <div class="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
        <div className="file-data">{fileData()}</div>
      </div>
      {/* NEXT PAGE BUTTON */}
      <div className="nav-btn-container">
        <button
          className="btn-upload float-end btn btn-primary"
          onClick={handleNextClick}
        >
          Files
        </button>
      </div>
    </div>
  );
}

export default Upload;
