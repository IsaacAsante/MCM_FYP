import React from "react";
import { withAuthorization } from "../Session";

import * as ROLES from "../../constants/roles";

const INITIAL_STATE = {
  authUser: null,
  bookings: null,
  empty: false,
  error: null,
  success: null,
  userRole: null,
};

const DAYS = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

class BookingsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    // Recognize current user
    this.props.firebase.onAuthUserListener(async (authUser) => {
      this.setState({ authUser });

      // Verify the privileges of the currently logged-in user to hide the 'Create Booking Slot' button
      // Easy trick is to verify if the email address contains 'students'.
      if (authUser.email.search("students") == -1) {
        this.setState({ userRole: ROLES.TUTOR });
      } else {
        this.setState({ userRole: ROLES.STUDENT });
      }

      await this.props.firebase
        .loadTutorBookings(this.state.authUser.uid, this.state.bookingType)
        .then((bookings) => {
          this.setState({ success: true, error: false });
          if (bookings.length > 0) {
            this.setState({
              bookings,
              empty: false,
              success: true,
              error: false,
            });
          } else {
            this.setState({
              bookings: null,
              empty: true,
              success: true,
              error: false,
            });
          }
          // console.log(bookings);
        })
        .catch((error) => {
          this.setState({
            bookings: null,
            error,
            success: false,
            empty: false,
          });
        });
    });
  }

  convertDate = (dateValue) => {
    let date = new Date(dateValue); // Firestore will return the seconds instead of milliseconds
    return `${DAYS[date.getDay()]}, ${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
  };

  goToBooking = (offeringID, taskID, slotID) => {
    this.props.history.push(
      `unit-offerings/${offeringID}/tasks/${taskID}/booking-slots/${slotID}`
    );
  };

  render() {
    const {
      authUser,
      bookings,
      bookingType,
      empty,
      error,
      success,
      userRole,
    } = this.state;
    const invalid = bookingType == "None";
    return (
      <div>
        <section id="main-content">
          <section className="wrapper">
            <div className="row">
              <div className="col-sm-12">
                {/* Heading */}
                <div className="row">
                  <div className="col-sm-12">
                    <h3>Upcoming Bookings</h3>
                    <hr />
                  </div>
                </div>

                <div className="row mt">
                  <div className="col-sm-12">
                    {/* Once the user submits  a selection */}
                    {bookings ? (
                      <table className="table table-bordered table-striped table-condensed slots-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Status</th>
                            {userRole == ROLES.TUTOR ? (
                              <th>Student</th>
                            ) : (
                              <th>Tutor</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map(
                            (booking) =>
                              (booking.bookingSlot.tutorID == authUser.uid ||
                                booking.student.uid == authUser.uid) && (
                                <tr
                                  key={booking.bookingSlot.id}
                                  onClick={() =>
                                    this.goToBooking(
                                      booking.offeringID,
                                      booking.taskID,
                                      booking.bookingSlot.id
                                    )
                                  }
                                >
                                  <td>
                                    {this.convertDate(
                                      booking.bookingSlot.date.toDate()
                                    )}
                                  </td>
                                  <td>{booking.bookingSlot.startTime}</td>
                                  <td>{booking.bookingSlot.endTime}</td>
                                  <td>{booking.bookingStatus}</td>
                                  {userRole == ROLES.TUTOR ? (
                                    <td>
                                      {booking.student.firstname}{" "}
                                      {booking.student.lastname}
                                    </td>
                                  ) : (
                                    <td>
                                      {booking.bookingSlot.tutor.firstname}{" "}
                                      {booking.bookingSlot.tutor.lastname}
                                    </td>
                                  )}
                                </tr>
                              )
                          )}
                        </tbody>
                      </table>
                    ) : empty ? (
                      <div className="alert alert-warning">
                        <strong>No bookings found.</strong> Once you start
                        creating booking slots and students start to create
                        booking entries, they will appear here.
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => authUser;

export default withAuthorization(condition)(BookingsPage);
