import React from "react";

import AuthUserContext from "./context";
import { withFirebase } from "../Firebase";

const withAuthentication = (Component) => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);

      // Handles session
      this.state = {
        authUser: null,
      };
    }

    // Control authUser state based on validity
    componentDidMount() {
      this.listener = this.props.firebase.auth.onAuthStateChanged(
        (authUser) => {
          if (authUser) {
            console.log("Auth User:", authUser);
            this.props.firebase
              .getStudent(authUser.uid)
              .then((res) => {
                if (res) {
                  const student = res;
                  authUser = {
                    uid: authUser.uid,
                    email: authUser.email,
                    ...student,
                  };
                  this.setState({ authUser });
                  console.log("Current Student:", authUser);
                } else {
                  this.props.firebase
                    .getTutor(authUser.uid)
                    .then((ans) => {
                      if (ans) {
                        const tutor = ans;
                        authUser = {
                          uid: authUser.uid,
                          email: authUser.email,
                          ...tutor,
                        };
                        this.setState({ authUser });
                        console.log("Current Tutor:", authUser);
                      }
                    })
                    .catch((error) => {
                      this.setState({ authUser: null });
                      console.error(error);
                    });
                }
              })
              .catch((error) => {
                this.setState({ authUser: null });
                console.error(error);
              });
          } else {
            this.setState({ authUser: null });
          }
        }
      );
    }

    // Remove the listener to avoid memory leaks
    componentWillUnmount() {
      this.listener();
    }

    render() {
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return withFirebase(WithAuthentication);
};

export default withAuthentication;
