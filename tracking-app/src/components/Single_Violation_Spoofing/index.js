import React from "react";
import { Link } from "react-router-dom";
import { withFirebase } from "../Firebase";
import { withAuthorization } from "../Session";

import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";

const INITIAL_STATE = {};
class SingleViolationSpoofingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    // Recognize current user
    this.props.firebase.onAuthUserListener((authUser) => {
      // console.log("Dashboard current user:", authUser);
      this.setState({ authUser });
    });
  }

  onClick = (offeringID) => {
    // console.log(offeringID);
    this.props.history.push(`/unit-offerings/${offeringID}`);
  };

  //   findUnitOffering = () => {
  //     this.props.history.push(ROUTES.FIND_UNIT_OFFERING);
  //   };

  render() {
    const { empty, warning } = this.state;
    return (
      <div>
        <section id="main-content">
          <section className="wrapper site-min-height">
            <h3>
              <i className="fa fa-bullhorn"></i> Single Spoofing Violation Log
            </h3>
            <hr />
            <div className="row mt">
              <div className="col-lg-12">
                <div className="row content-panel">
                  <div className="col-md-4 profile-text mt mb centered">
                    <div className="right-divider hidden-sm hidden-xs">
                      <h4>12</h4>
                      <h6>DAYS LEFT IN QUARANTINE</h6>
                      <h4>18/07/2021</h4>
                      <h6>LAST VIOLATION</h6>
                      <h4>68</h4>
                      <h6>VIOLATION COUNT</h6>
                    </div>
                  </div>
                  {/* col-md-4               */}
                  <div className="col-md-4 profile-text">
                    <h3>Mathilda Lee</h3>
                    <h6>Quarantined in Kuching, Sarawak</h6>
                    <div class="alert alert-danger">
                      <b>Attention!</b> This user is currently flagged for
                      violations.
                    </div>
                    <p class="single-violation-buttons">
                      <button className="btn btn-danger">
                        <i className="fa fa-flag"></i> Unflag
                      </button>
                      <button className="btn btn-warning">
                        <i className="fa fa-phone"></i> Call User
                      </button>
                      <button className="btn btn-warning">
                        <i className="fa fa-envelope"></i> Email
                      </button>
                    </p>
                  </div>
                  {/* col-md-4 */}
                  <div className="col-md-4">
                    <div className="profile-pic">
                      <p className="float-right">
                        <button className="btn btn-theme">
                          <i className="fa fa-plus"></i> Profile
                        </button>
                      </p>
                      <p className="float-right">
                        <button className="btn btn-theme">
                          <i className="fa fa-backward"></i> Return
                        </button>
                      </p>
                    </div>
                  </div>
                  {/* col-md-4  */}
                </div>
                {/* row */}
              </div>
              {/* col-lg-12 */}
            </div>
            <div className="row mt">
              <div className="col-md-12 cap-height">
                <table className="table table-hover table-responsive">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Distance</th>
                      {/* <th>Coordinates</th> */}
                      <th>Live Location</th>
                      <th>Acceleration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>18/07/2021</td>
                      <td>10:02:27</td>
                      <td>2340m</td>
                      {/* <td>1.5498915073442023, 110.35768472476958</td> */}
                      <td>
                        <Link
                          to={{
                            pathname:
                              "https://www.google.com/maps/search/1.533921586016006,110.35569906334419",
                          }}
                          target="_blank"
                        >
                          View on map
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td>18/07/2021</td>
                      <td>10:00:27</td>
                      <td>2340m</td>
                      <td>
                        <Link to="#">View on map</Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="alert-row">18/07/2021</td>
                      <td className="alert-row">09:58:22</td>
                      <td className="alert-row">2264m</td>
                      <td className="alert-row">
                        <Link to="#">View on map</Link>
                      </td>
                      <td className="alert-row bold">
                        Unnatural movement detected.
                      </td>
                    </tr>
                    <tr>
                      <td>18/07/2021</td>
                      <td>09:56:22</td>
                      <td>1952m</td>
                      <td>
                        <Link to="#">View on map</Link>
                      </td>
                      <td>Unnatural movement detected.</td>
                    </tr>
                    <tr>
                      <td>18/07/2021</td>
                      <td>09:54:22</td>
                      <td>1608m</td>
                      <td>
                        <Link to="#">View on map</Link>
                      </td>
                      <td>Unnatural movement detected.</td>
                    </tr>
                    <tr>
                      <td>18/07/2021</td>
                      <td>09:52:22</td>
                      <td>1213m</td>
                      <td>
                        <Link to="#">View on map</Link>
                      </td>
                      <td>Unnatural movement detected.</td>
                    </tr>
                    <tr>
                      <td>18/07/2021</td>
                      <td>09:50:28</td>
                      <td>857m</td>
                      <td>
                        <Link to="#">View on map</Link>
                      </td>
                      <td>Unnatural movement detected.</td>
                    </tr>
                    <tr>
                      <td>18/07/2021</td>
                      <td>09:48:16</td>
                      <td>364m</td>
                      <td>
                        <Link to="#">View on map</Link>
                      </td>
                      <td>Unnatural movement detected.</td>
                    </tr>
                    <tr>
                      <td>18/07/2021</td>
                      <td>09:46:17</td>
                      <td>145m</td>
                      <td>
                        <Link to="#">View on map</Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* content-panel */}
              </div>
            </div>
          </section>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(SingleViolationSpoofingPage);
