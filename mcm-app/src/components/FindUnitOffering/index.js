import { auth } from "firebase";
import React from "react";
import { withFirebase } from "../Firebase";

import { withAuthorization } from "../Session";

const INITIAL_STATE = {
  allocated: false,
  allocateMessage: "Allocate Yourself",
  authUser: null,
  offeringID: null,
  semester: null,
  semesterError: null,
  unit: null,
  unitError: null,
};

class FindOfferingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    const offeringID = this.props.match.params.offeringID;
    this.setState({ offeringID });
    console.log(offeringID);

    // Recognize current user
    this.props.firebase.onAuthUserListener((authUser) => {
      this.setState({ authUser });
      // Determine if a Tutor is already allocated to the unit offering currently being viewed, or not.
      this.props.firebase.findAllocation(authUser.uid).then((res) => {
        if (res) {
          console.log("Response to debug:", res);
          if (res.unitOfferings.includes(offeringID)) {
            this.setState({ allocated: true, allocateMessage: "Allocated" });
          }
        }
      });
    });

    // Get all offerings
  }

  onAllocate = (event) => {
    this.props.firebase.findAllocation(this.state.authUser.uid).then((res) => {
      if (res === undefined) {
        const allocationData = {
          tutorID: this.state.authUser.uid,
          unitOfferings: [this.state.offeringID],
        };
        // Create an allocation entry for the logged in Tutor
        this.props.firebase
          .addData("allocations", allocationData)
          .then((res) => {
            console.log(res);
            this.setState({ allocateMessage: "Allocated" });
          });
      } else {
        if (!res.unitOfferings.includes(this.state.offeringID)) {
          res.unitOfferings.push(this.state.offeringID);
          // console.log("Allocation array:", res);
          this.props.firebase
            .updateData("allocations", res.id, {
              unitOfferings: res.unitOfferings,
            })
            .then(() => {
              this.setState({ allocated: true, allocateMessage: "Allocated" });
            });
        }
      }
    });
  };

  render() {
    const {
      allocated,
      allocateMessage,
      authUser,
      semester,
      semesterError,
      unit,
      unitError,
    } = this.state;
    const invalid =
      semesterError ==
        "There was an error fetching the unit data for this unit offering." ||
      semesterError == "Invalid semester." ||
      unitError ==
        "There was an error fetching the unit data for this unit offering." ||
      unitError == "Invalid unit.";
    return (
      <div>
        <section id="main-content">
          <section className="wrapper">
            <div class="row">
              <div class="col-md-12">
                <h3>
                  <i class="fa fa-angle-right" aria-hidden="true"></i> Active
                  Unit Offerings
                </h3>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <section class="task-panel tasks-widget">
                  <div class="panel-heading">
                    <div class="pull-left">
                      <p class="mt">
                        Allocate yourself to any of the unit offerings listed
                        below.
                      </p>
                    </div>
                    <br />
                  </div>
                  <div class="panel-body mt">
                    <div class="task-content">
                      <ul class="task-list">
                        <li>
                          <i class="fa fa-graduation-cap icon"></i>
                          <div class="task-title">
                            <span class="task-title-sp">
                              Dashio - Admin Panel & Front-end Theme
                            </span>
                            <span class="badge bg-important">Allocated</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                    {/* <div class=" add-task-row mb">
                      <a
                        class="btn btn-success btn-sm pull-left"
                        href="todo_list.html#"
                      >
                        Add New Tasks
                      </a>
                      <a
                        class="btn btn-default btn-sm pull-right"
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
