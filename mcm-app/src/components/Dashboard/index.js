import React from "react";
import axios from "axios";

import { withAuthorization } from "../Session";

class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // const content = {
    //   email: "ike@asante.com",
    //   message: "This is working with Express.",
    // };
    // axios
    //   .post("/email/send", {
    //     method: "POST",
    //     headers: {
    //       "Content-type": "application/json",
    //     },
    //     body: JSON.stringify({ content }),
    //   })
    //   .then((res) => {
    //     console.log("Successful communication with server: ", res.data);
    //   })
    //   .catch((err) => {
    //     console.error("Error from backend: ", err);
    //   });
  }

  render() {
    return (
      <div>
        <section id="main-content">
          <section className="wrapper">
            <h1>Dashboard component</h1>
          </section>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(DashboardPage);
