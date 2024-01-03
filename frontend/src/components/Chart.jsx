import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Plot from "react-plotly.js";
import PageNavigation from "./PageNavigation";
import FilterComponent from "./FilterComponent";
import Loading from "./Loading";
import { Dropdown } from "react-bootstrap";

function Chart() {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");

  const [data, setData] = useState([{}]);
  const [search] = useSearchParams();
  // state for collapsing
  const [collapseFlag, setCollapseFlag] = useState(true);
  //state for loading animation
  const [loading, setLoading] = useState(true);

  // states for filtering
  const [filterFlag, setFilterFlag] = useState(true);
  const [resetFilters, setResetFilters] = useState(false);

  const [activityFilters, setActivityFilters] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const [objectTypeFilters, setObjectTypeFilters] = useState([]);
  const [selectedObjectTypes, setSelectedObjectTypes] = useState([]);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  //states for views
  const [view, setView] = useState("eventID");
  const [dropdownItems, setDropdownItems] = useState(["eventID"]);

  // state for metrics
  const [metrics, setMetrics] = useState();
  const [objectAttributes, setObjectAttributes] = useState([{}]);
  const [eventAttributes, setEventAttributes] = useState([{}]);
  const [objectLifecycle, setObjectLifecycle] = useState([{}]);
  const [objectClick, setObjectClick] = useState(false);

  // fetch data
  useEffect(() => {
    setObjectClick(false); // hide object specific metrics
    if (resetFilters) {
      setStartTime("");
      setEndTime("");
    }
    setLoading(true);
    fetch(
      `/chartapi/scatterplot?filename=${search.get(
        "file"
      )}&view=${view}&startTime=${startTime}&endTime=${endTime}&resetFilters=${resetFilters}`
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.error) {
          setErrorMessage(response.error);
          console.log(errorMessage);
        } else {
          setData(response.figure);
          setLoading(false);
          setActivityFilters(response.activities);
          setSelectedActivities(response.selected_activities);
          setObjectTypeFilters(response.object_types);
          setSelectedObjectTypes(response.selected_object_types);
          setDropdownItems((prevItems) => [
            ...prevItems,
            ...response.object_types.filter(
              (item) => !prevItems.includes(item)
            ),
          ]);
          setErrorMessage("");
          setResetFilters(false);
          setData((data) => {
            let updateData = { ...data };
            updateData.layout.autosize = true;
            updateData.layout.width = "";
            updateData.layout.hight = "";
            return updateData;
          });
        }
      });

    // fetch metrics for the whole event log
    fetch(`/chartapi/get-general-metrics?filename=${search.get("file")}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.error === true) {
          setErrorMessage(res.errorMessage);
        }
        else {
          setMetrics(res)
        }
      });
  }, [view, resetFilters, search, collapseFlag, filterFlag]);

  // Click handler for collapsed dots in eventID view
  const handleSubplotClick = (event) => {
    const traceIndex = event.points[0].curveNumber;

    // Make API request to toggle the corresponding subplot
    fetch(`/chartapi/toggle-subplot?traceIndex=${traceIndex}`)
      .then((res) => res.json())
      .then((data) => {
        setCollapseFlag(!collapseFlag);
      })
      .catch((error) => {
        console.error("Error toggling subplot:", error);
      });
  };

  // button handler to load preview page
  const handlePreviewClick = () => {
    navigate(`/preview?file=${search.get("file")}`);
  };

  const handleSelectActivities = (activity) => {
    const isSelected = selectedActivities.includes(activity);
    const newSelection = isSelected
      ? selectedActivities.filter((currentAct) => currentAct !== activity)
      : [...selectedActivities, activity];
    setSelectedActivities(newSelection);
  };

  const handleSelectObjectTypes = (objectType) => {
    const isSelected = selectedObjectTypes.includes(objectType);
    const newSelection = isSelected
      ? selectedObjectTypes.filter((currentOT) => currentOT !== objectType)
      : [...selectedObjectTypes, objectType];
    setSelectedObjectTypes(newSelection);
  };

  const handleActivityFilterApply = () => {
    // Make the API request to the backend with the selected activities
    if (Array.isArray(selectedActivities) && selectedActivities.length > 0) {
      fetch("/chartapi/apply-activity-filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedActivities }),
      })
        .then((res) => res.json())
        .then((data) => {
          setFilterFlag(!filterFlag);
        })
        .catch((error) => {
          console.error("Error filtering activities:", error);
        });
    }
  };

  const handleObjectTypeFilterApply = () => {
    // Make the API request to the backend with the selected activities
    fetch("/chartapi/apply-object-filter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedObjectTypes }),
    })
      .then((res) => res.json())
      .then((data) => {
        setFilterFlag(!filterFlag);
      })
      .catch((error) => {
        console.error("Error filtering object types:", error);
      });
  };

  // button handler to collapse all subplots in eventID view
  const handleCollapseAll = () => {
    console.log(metrics);
    fetch("/chartapi/toggle-subplot?traceIndex=all")
      .then((res) => res.json())
      .then(() => {
        setCollapseFlag(!collapseFlag);
      })
      .catch((error) => {
        console.error("error when collapsing whole chart:", error);
      });
  };

  const handleTimeFilterApply = () => {
    setFilterFlag(!filterFlag);
  };

  const handleResetFilters = () => {
    setResetFilters(true);
    setFilterFlag(!filterFlag);
  };

  const handleDropdownChange = (eventKey) => {
    setView(eventKey);
  };

  // click handler on dots in any of the flattened views
  const handleDotClick = (event) => {
    setObjectClick(false);
    // get eventID that is saved in custom data attribute of each dot
    const eid = event.points[0].customdata[0];
    // Event attribute data
    fetch(
      `/chartapi/get-event-attributes?filename=${search.get("file")}&eid=${eid}`
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.error === "True") {
          setErrorMessage(res.errorMessage);
        } else {
          setEventAttributes(res.data);
        }
      });

    // get object id from click event
    const oid = event.points[0].y;

    // Object attribute data
    fetch(
      `/chartapi/get-object-attributes?filename=${search.get(
        "file"
      )}&oid=${oid}`
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.error === "True") {
          setErrorMessage(data.errorMessage);
        } else {
          setObjectAttributes(res.data);
        }
      });

    // Object lifecycle data
    fetch(
      `/chartapi/get-object-lifecycle?filename=${search.get("file")}&oid=${oid}`
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.error === "True") {
          setErrorMessage(res.errorMessage);
        } else {
          // format the lifecycle duration
          let object_lifecycle_tmp = res.data;
          let duration_seconds = object_lifecycle_tmp.object_lifecycle_duration;
          let duration_days = Math.floor(duration_seconds / (24 * 3600));
          duration_seconds -= duration_days * 24 * 3600;
          let duration_hours = Math.floor(duration_seconds / 3600);
          duration_seconds -= duration_hours * 3600;
          let duration_minutes = Math.floor(duration_seconds / 60);
          duration_seconds -= duration_minutes * 60;

          object_lifecycle_tmp.object_lifecycle_duration = `${
            duration_days > 9 ? duration_days : "0" + duration_days
          }
            : ${duration_hours > 9 ? duration_hours : "0" + duration_hours}
            : ${
              duration_minutes > 9 ? duration_minutes : "0" + duration_minutes
            }
            : ${
              duration_seconds > 9 ? duration_seconds : "0" + duration_seconds
            }`;
          // lifecycle duration formatting done

          setObjectLifecycle(object_lifecycle_tmp);
        }
      });
    // show object metrics
    setObjectClick(true);
  };

  // helper function to build table rows of activity lifecycle table in object metrics
  const assembleActivityTableRow = () => {
    let dataRows = [];
    for (
      let i = 0;
      i < objectLifecycle.object_lifecycle_activities.length;
      i++
    ) {
      dataRows.push(
        <tr key={objectLifecycle.object_lifecycle_eids[i]}>
          <td> {objectLifecycle.object_lifecycle_activities[i]}</td>
          <td> {objectLifecycle.object_lifecycle_timestamps[i]}</td>
          <td> {objectLifecycle.object_lifecycle_eids[i]}</td>
        </tr>
      );
    }
    return dataRows;
  };

  return (
    <div>
      <PageNavigation selectedFile={search.get("file")} />
      <div className="chart-container">
        {/* filters */}
        <div className="filter-container">
          {errorMessage ? (
            <div class="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          ) : (
            <div></div>
          )}
          <div className="dropdown-container">
            <Dropdown onSelect={handleDropdownChange}>
              <Dropdown.Toggle
                variant="warning"
                id="dropdown-basic"
                className="view-button"
              >
                {view}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {dropdownItems.map((item) => (
                  <Dropdown.Item key={item} eventKey={item}>
                    {item}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          {view === "eventID" ? (
            <div className="collapseAll-container">
              <button
                onClick={handleCollapseAll}
                className="collapse-all-button"
              >
                collapse all
              </button>
            </div>
          ) : (
            <div style={{ display: "inline-block" }}></div>
          )}
          <FilterComponent
            label="Activity Filter"
            onApply={handleActivityFilterApply}
          >
            {" "}
            <div className="filter-options-list">
              {activityFilters.map((activity, index) => {
                const isSelected = selectedActivities.includes(activity);
                return (
                  <label className="filter-label" key={index}>
                    <input
                      className="form-check-input filter-input"
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectActivities(activity)}
                    />
                    <span className="form-check-label">{activity}</span>
                  </label>
                );
              })}
            </div>
          </FilterComponent>
          {view === "eventID" ? (
            <FilterComponent
              label="Object Type Filter"
              onApply={handleObjectTypeFilterApply}
            >
              {" "}
              <div className="filter-options-list">
                {objectTypeFilters.map((objectType, index) => {
                  const isSelected = selectedObjectTypes.includes(objectType);
                  return (
                    <label className="filter-label" key={index}>
                      <input
                        className="form-check-input filter-input"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectObjectTypes(objectType)}
                      />
                      <span className="form-check-label">{objectType}</span>
                    </label>
                  );
                })}
              </div>
            </FilterComponent>
          ) : (
            <div></div>
          )}
        </div>
        <div className="filter-container">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Start Time</label>
              <input
                type="datetime-local"
                className="form-control"
                name="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">End Time</label>
              <input
                type="datetime-local"
                className="form-control"
                name="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-buttons">
            <button
              type="button"
              className="btn btn-dark btn-filter"
              onClick={handleTimeFilterApply}
            >
              Filter
            </button>
            <button
              type="button"
              className="btn btn-outline-dark btn-filter"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="scatterplot">
          {loading ? (
            <Loading loadingText="Chart is being created..." />
          ) : view === "eventID" ? (
            <Plot
              data={data.data}
              layout={data.layout}
              config={{
                scrollZoom: true,
                useResizeHandler: true,
                displayModeBar: true,
                responsive: true,
              }}
              onClick={handleSubplotClick}
              useResizeHandler={true}
              className="w-full h-full"
            />
          ) : (
            <Plot
              className="w-full h-full"
              data={data.data}
              layout={data.layout}
              config={{
                scrollZoom: true,
                useResizeHandler: true,
                displayModeBar: true,
                responsive: true,
              }}
              onClick={handleDotClick}
            />
          )}
        </div>
        <div className="metricContainer">
          {typeof metrics === "undefined" ||
          search.get("file") === null ||
          view !== "eventID" ||
          loading ? (
            <div></div>
          ) : (
            <>
              <h3>General Metrics</h3>
              <div className="metricPair">
                <h4>activities in the log</h4>
                <div className="activitiesContainer">
                  {metrics.data.activities.join(", ")}
                </div>
              </div>
              <div className="metricPair">
                <h4>number of events</h4>
                <div className="activityCountContainer">
                  {metrics.data.activity_count}
                </div>
              </div>
              <div className="metricPair">
                <h4> object types in the log </h4>
                <div className="objectTypeContainer">
                  {metrics.data.object_types.join(", ")}
                </div>
              </div>
              <div className="metricPair">
                <h4> object attributes in the log </h4>
                <div className="attributeNamesContainer">
                  {metrics.data.attribute_names.join(", ")}
                </div>
              </div>
              <div className="metricPair">
                <h4> activity counter </h4>
                <div className="countPerActivityContainer">
                  {Object.keys(metrics.data.count_per_activity).map(
                    (key, index) => {
                      let value = metrics.data.count_per_activity[key];
                      return (
                        <div key={index}>
                          <span>
                            {key} -- {value}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </>
          )}
          {typeof objectAttributes === "undefined" ||
          search.get("file") === null ||
          view === "eventID" ||
          loading ||
          !objectClick /* = no object clicked */ ? (
            <div></div>
          ) : (
            <>
              <h3>clicked object attributes</h3>
              <div className="objectAttributes">
                {Object.keys(objectAttributes).map((key, index) => {
                  let value = objectAttributes[key].toString();
                  return (
                    <p>
                      {key} -- {value}
                    </p>
                  );
                })}
              </div>
            </>
          )}
          {typeof eventAttributes === "undefined" ||
          search.get("file") === null ||
          view === "eventID" ||
          loading ||
          !objectClick /* = no object clicked */ ? (
            <div></div>
          ) : (
            <>
              <h3>clicked event attributes</h3>
              <div className="eventAttributes">
                {Object.keys(eventAttributes).map((key, index) => {
                  let value = eventAttributes[key].toString();
                  return (
                    <p>
                      {key} -- {value}
                    </p>
                  );
                })}
              </div>
            </>
          )}
          {typeof objectLifecycle === "undefined" ||
          typeof objectLifecycle.object_lifecycle_start === "undefined" ||
          typeof objectLifecycle.object_lifecycle_end === "undefined" ||
          typeof objectLifecycle.object_lifecycle_activities === "undefined" ||
          typeof objectLifecycle.object_lifecycle_duration === "undefined" ||
          typeof objectLifecycle.object_lifecycle_eids === "undefined" ||
          typeof objectLifecycle.object_lifecycle_timestamps === "undefined" ||
          search.get("file") === null ||
          view === "eventID" ||
          !objectClick /* = no object clicked */ ? (
            <div></div>
          ) : (
            <>
              <h3> clicked dot details </h3>
              <div className="metricPair">
                <h4> lifecycle activities </h4>
                <div className="object_lifecycle_activities ">
                  <table>
                    <thead>
                      <th>activities</th>
                      <th className="timestamp-column">timestamps</th>
                      <th>event ID</th>
                    </thead>
                    <tbody>{assembleActivityTableRow()}</tbody>
                  </table>
                </div>
              </div>
              <div className="metricPair">
                <h4> lifecycle duration (dd:hh:mm:ss)</h4>
                <div className="object_lifecycle_duration">
                  <p> {objectLifecycle.object_lifecycle_duration} </p>
                </div>
              </div>
              <div className="metricPair">
                <h4> lifecycle start</h4>
                <div className="object_lifecycle_start">
                  <p>{objectLifecycle.object_lifecycle_start}</p>
                </div>
              </div>
              <div className="metricPair">
                <h4> lifecycle end</h4>
                <div className="object_lifecycle_end">
                  <p>{objectLifecycle.object_lifecycle_end}</p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="button-container">
          <button
            className="btn-chart float-start btn btn-primary"
            onClick={handlePreviewClick}
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chart;
