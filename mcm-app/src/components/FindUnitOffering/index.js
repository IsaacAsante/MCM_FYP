import { auth } from "firebase";
import React from "react";
import { withFirebase } from "../Firebase";

import { withAuthorization } from "../Session";

const INITIAL_STATE = {
  unitOfferings: [],
  error: null,
};

class FindOfferingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  // Function to sort the list of unit offerings by unit code
  compare = (a, b) => {
    if (a.unit.unitCode < b.unit.unitCode) {
      return -1;
    }
    if (a.unitCode > b.unitCode) {
      return 1;
    }
    return 0;
  };

  componentDidMount() {
    // Get all offerings
    this.props.firebase
      .getAllDocsInCollection("unitofferings")
      .then((offerings) => {
        let offeringsArray = [];
        if (offerings.length > 0) {
          offerings.forEach((doc) => {
            console.log("Unit Offering doc:", doc);
            let unitObj = {
              id: doc.id,
              unit: null,
              semester: null,
            };
            // Get the corresponding semesters
            this.props.firebase
              .findSemester(doc.semesterID)
              .then((semester) => {
                unitObj.semester = semester;
                return unitObj;
              })
              .then((unitObj) => {
                this.props.firebase
                  .findUnit(doc.unitID)
                  .then((unit) => {
                    unitObj.unit = unit;
                    return unitObj;
                  })
                  .then((unitObj) => {
                    offeringsArray = offeringsArray.concat(unitObj);
                    // Sort the array
                    offeringsArray.sort(this.compare);
                    this.setState({ unitOfferings: offeringsArray });
                    console.log("Updated state:", this.state.unitOfferings);
                  });
              })
              .catch((err) => console.error(err));
          });
        }
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  }

  onClick = (event) => {
    const offeringID = event.target.getAttribute("uid");
    this.props.history.push(`/unit-offerings/${offeringID}`);
  };

  render() {
    return (
      <div>
        <section id="main-content">
          <section className="wrapper">
            <div className="row">
              <div className="col-md-12">
                <h3>
                  <i className="fa fa-angle-right" aria-hidden="true"></i>{" "}
                  Active Unit Offerings
                </h3>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <section className="task-panel tasks-widget">
                  <div className="panel-heading">
                    <div className="pull-left">
                      <p className="mt">
                        Allocate yourself to any of the unit offerings listed
                        below.
                      </p>
                    </div>
                    <br />
                  </div>
                  <div className="panel-body mt">
                    <div className="task-content">
                      <ul className="task-list">
                        {this.state.unitOfferings.length > 0
                          ? this.state.unitOfferings.map((doc) => (
                              <li
                                key={doc.id}
                                uid={doc.id}
                                onClick={this.onClick}
                              >
                                <i
                                  className="fa fa-graduation-cap icon"
                                  uid={doc.id}
                                  onClick={this.onClick}
                                ></i>
                                <div
                                  className="task-title"
                                  uid={doc.id}
                                  onClick={this.onClick}
                                >
                                  <span
                                    className="task-title-sp"
                                    uid={doc.id}
                                    onClick={this.onClick}
                                  >
                                    <strong uid={doc.id} onClick={this.onClick}>
                                      {doc.unit.unitCode}
                                    </strong>{" "}
                                    {doc.unit.name} - Semester{" "}
                                    {doc.semester.number}, {doc.semester.year} (
                                    {doc.semester.type})
                                  </span>
                                  {/* <span className="badge bg-important">Allocated</span> */}
                                </div>
                              </li>
                            ))
                          : " "}
                      </ul>
                    </div>
                    {/* <div className=" add-task-row mb">
                      <a
                        className="btn btn-success btn-sm pull-left"
                        href="todo_list.html#"
                      >
                        Add New Tasks
                      </a>
                      <a
                        className="btn btn-default btn-sm pull-right"
                        href="todo_list.html#"
                      >
                        See All Tasks
                      </a>
                    </div> */}
                  </div>
                </section>
              </div>
            </div>
          </section>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(FindOfferingPage);
