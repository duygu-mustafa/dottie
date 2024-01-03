import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageNavigation from "./PageNavigation";

function Files() {
  // for button navigation
  const navigate = useNavigate();

  // search parameters
  const [search, setSearch] = useSearchParams();

  // state for list of available files
  const [data, setData] = useState([{}]);

  // state for error message
  const [errorMessage, setErrorMessage] = useState("");

  // fetch available files when page is loaded
  useEffect(() => {
    fetch("/filemanager/list-files")
      .then((res) => res.json())
      .then((res) => {
        if (res.error === true) {
          setErrorMessage(res.errorMessage);
        } else {
          console.log(res);
          setData(res);
        }
      });
  }, []);

  // Button Handler when a file is deleted
  const onFileDelete = (filename) => {
    fetch(`/filemanager/delete-file?filename=${filename}`, {
      method: "DELETE",
    })
      .then((res) => console.log(res))
      .catch((err) => console.error(err));

    document.getElementById(filename).remove();
    // deselect file, if it was selected
    if (search.get("file") === filename) {
      setSearch({ file: "" });
    }
  };

  // Button handler when a file is selected
  const onFileSelect = (filename) => {
    if (
      !(
        search === undefined ||
        search.get("file") === null ||
        search.get("file") === ""
      )
    ) {
      document
        .getElementById(search.get("file"))
        .getElementsByClassName("file-name")[0].style.color = "";
    }
    setSearch({ file: filename });
    // mark selected entry with green writing
    document
      .getElementById(filename)
      .getElementsByClassName("file-name")[0].style.color = "green";
  };

  // Button handler to switch to file preview
  const handleNextClick = () => {
    navigate(`/preview?file=${search.get("file")}`);
  };

  // Button handler to switch to upload
  const handleLastClick = () => {
    navigate(`/upload?file=${search.get("file")}`);
  };

  return (
    <div>
      <PageNavigation selectedFile={search.get("file")} />
      <div className="files-container">
        {/*ERROR MESSAGE*/}
        {errorMessage ? (
          <div class="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        ) : (
          <div></div>
        )}
        {/*FILE LIST*/}
        {typeof data.files === "undefined" || data.files === ""? (
          <p></p>
        ) : (
          data.files.map((file, i) => (
            <div className="file-item" id={file}>
              <div className="file-name">{file}</div>
              <div>
                <button
                  type="button"
                  className="btn btn-danger mx-2"
                  onClick={() => onFileDelete(file)}
                >
                  Delete
                </button>
                {search.get("file") === file ? (
                  <button
                    type="button"
                    className="btn btn-success mx-2"
                    onClick={() => onFileSelect(file)}
                  >
                    Select
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-dark mx-2"
                    onClick={() => onFileSelect(file)}
                  >
                    Select
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="d-flex justify-content-between">
        {/* LAST PAGE BUTTON */}
        <button className="btn-files btn btn-primary" onClick={handleLastClick}>
          Upload
        </button>
        {/* NEXT PAGE BUTTON */}
        <button className="btn-files btn btn-primary" onClick={handleNextClick}>
          Preview
        </button>
      </div>
    </div>
  );
}

export default Files;
