import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageNavigation from "./PageNavigation";
import Loading from "./Loading";

function Preview() {
  // for button navigation
  const navigate = useNavigate();

  // search parameters
  const [search] = useSearchParams();

  // preview data of selected file
  const [data, setData] = useState([{}]);

  // state for error Message
  const [errorMessage, setErrorMessage] = useState("");

  // state for loading animation
  const [isLoading, setIsLoading] = useState(false);

  // fetch selected file preview when page is loaded
  useEffect(() => {
    setIsLoading(true);
    fetch(`/filemanager/file-preview?filename=${search.get("file")}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.error === true) {
          setErrorMessage(res.errorMessage);
        } else {
          setErrorMessage("");
          setData(res);
        }
      })
      .then(() => {
        setIsLoading(false);
      });
  }, [search]);

  // button handler to load file overview page
  const handleLastClick = () => {
    navigate(`/files?file=${search.get("file")}`);
  };

  // button handler to load chart page
  const handleNextClick = () => {
    navigate(`/chart?file=${search.get("file")}`);
  };

  // returns a single row of the preview table
  const assembleSingleRow = (rowindex) => {
    let keys = Object.keys(data[0]);
    return keys.map((key, index) => {
      return (
        <td key={key}>
          {data[rowindex][key]}
        </td>
      );
    });
  };

  // returns an array of all the rows for the preview table
  const assembleTableRows = () => {
    let dataRows = [];
    for (let i = 0; i < data.length; i++) {
      dataRows.push(<tr key={i}> {assembleSingleRow(i)}</tr>);
    }
    return dataRows;
  };

  // returns the headers for the preview table
  const assembleTableHeader = () => {
    let keys = Object.keys(data[0]);
    return keys.map((key, index) => {
      return (
        <th scope="col" key={key}>
          {key}
        </th>
      );
    });
  };

  // returns the whole preview table
  const assembleTable = () => {
    if (search.get("file") === "null" || search.get("file") === "") {
      return <h3>please select a file!</h3>;
    }
    return (
      <div className="table-container h-full">
        <table className="table table-striped">
          <thead>
            <tr>{assembleTableHeader()}</tr>
          </thead>
          <tbody>{assembleTableRows()}</tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <PageNavigation selectedFile={search.get("file")} />
      <div className="preview-container">
        {/*ERROR MESSAGE*/}
        {errorMessage ? (
          <div class="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        ) : (
          <div></div>
        )}
        <div>
          {/*CSV DISCLAIMER*/}
          {search.get("file").split(".").pop() === "csv" ? (
            <div class="alert alert-danger" role="alert">
              Please note that CSV files are expected in the OCEL format (see
              https://ocel-standard.org/ for examples)
            </div>
          ) : (
            <div></div>
          )}
          {/* DATA PREVIEW */}
          {isLoading ? (
            <Loading loadingText="Data is being loaded..." />
          ) : typeof data === "undefined" ? (
            <p>No data</p>
          ) : (
            assembleTable()
          )}
        </div>
      </div>

      {/* LAST PAGE BUTTON */}
      <button
        className="btn-preview float-start btn btn-primary"
        onClick={handleLastClick}
      >
        Files
      </button>
      {/* NEXT PAGE BUTTON */}
      <button
        className="btn-preview float-end btn btn-primary"
        onClick={handleNextClick}
      >
        Chart
      </button>
    </div>
  );
}

export default Preview;
