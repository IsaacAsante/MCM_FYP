/* Firebase configuration-related security information here:
 * https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public
 */
// Core Firebase SDK
import app from "firebase/app";

// Firebase services used by the app
import "firebase/auth";
import "firebase/firestore";

// Role-based access: https://firebase.google.com/docs/firestore/solutions/role-based-access

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHgiwSA_ievXkfomu5WAnzaPkFbuZW1fE",
  authDomain: "my146-41378.firebaseapp.com",
  projectId: "my146-41378",
  storageBucket: "my146-41378.appspot.com",
  messagingSenderId: "35571861911",
  appId: "1:35571861911:web:a395c2566cf7df4a5c5cd2",
  measurementId: "G-TBSM341G3Z",
};

class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig); // Initialize app
    this.auth = app.auth(); // For Firebase Auth
    this.db = app.firestore(); // For Cloud Firestore
    this.batch = app.firestore().batch(); // Used to create docs in batch
  }

  /***** FIREBASE AUTH API  *****
   * ===========================*/

  // Signups
  createUser = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  // Logins
  signInUser = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  // Logouts
  signOutUser = () => {
    this.auth.signOut();
    // console.log("Signed Out");
  };

  // Password Resets
  resetUserPassword = (email) => this.auth.sendPasswordResetEmail(email);

  // Update passwords
  updateUserPassword = (password) =>
    this.auth.currentUser.updatePassword(password);

  // Save the currently logged-in user
  getCurrentUser = async () => {
    return this.auth.currentUser;
  };

  // Force the current user to remain signed in (important for the Excel file import process)
  stayLoggedIn = (user) => {
    this.auth.updateCurrentUser(user);
  };

  reloadCurrentUser = async () => await this.auth.currentUser.reload();

  /***** CLOUD FIRESTORE API  *****
   * ===========================*/

  findAllocation = async (tutorID) => {
    const allocationRef = await this.db.collection("allocations");
    const snapshot = await allocationRef.where("tutorID", "==", tutorID).get();
    const tutors = [];
    snapshot.forEach((doc) => tutors.push(doc.data()));
    return tutors[0];
  };

  findUser = async (firstName, lastName) => {
    const userRef = this.db.collection("users");
    let users = await userRef.where("firstname", "==", firstName);
    users = await userRef.where("lastname", "==", lastName).get();
    if (users.empty) {
      users = await userRef.where("lastname", "==", firstName);
      users = await users.where("firstname", "==", lastName).get();
    }
    let users_found = [];
    users.forEach((doc) => users_found.push(doc.data()));
    return users_found[0];
  };

  getMonitor = async (uid) => {
    const monitorRef = this.db.collection("monitors").doc(uid);
    let doc = await monitorRef.get();
    return doc.data();
  };

  getUser = async (uid) => {
    const userRef = this.db.collection("users").doc(uid);
    let doc = await userRef.get();
    return doc.data();
  };

  getAllDocsInCollection = async (collectionID) => {
    const docsRef = this.db.collection(collectionID);
    const snapshot = await docsRef.get();
    let docData = [];
    snapshot.forEach((doc) => {
      docData.push(doc.data());
    });
    return docData;
  };

  addBookingToDB = async (offeringID, taskID, bookingSlotID, bookingObj) => {
    const bookingsRef = this.db
      .collection("unitofferings")
      .doc(offeringID)
      .collection("tasks")
      .doc(taskID)
      .collection("bookingslots")
      .doc(bookingSlotID)
      .collection("bookings");

    const isEmpty = (await bookingsRef.get()).empty;

    if (isEmpty) {
      const res = await bookingsRef.add(bookingObj);
      if (res) {
        // Add the booking's UID to the doc
        const doc = await bookingsRef
          .doc(res.id)
          .set({ id: res.id }, { merge: true });
        // Update the booking object's ID for the next operations
        bookingObj["id"] = res.id;
        // Sync doc in the bookinglogs collection
        const confirmed = await this.db
          .collection("bookinglogs")
          .doc(res.id)
          .set(bookingObj)
          .then(async () => {
            // Update the status of the relevant booking slot
            const next = await this.db
              .collection("unitofferings")
              .doc(offeringID)
              .collection("tasks")
              .doc(taskID)
              .collection("bookingslots")
              .doc(bookingSlotID)
              .update({ slotStatus: "In Review" });
          });
      }
    } else {
      return false;
    }
  };

  addUserToDB = async (collectionID, uid, dataObj) => {
    const res = await this.db.collection(collectionID).doc(uid).set(dataObj);
    // console.log("Document added!");
    return res;
  };

  // Use the generic addData() function variations below on primary Firestore collections (and not subcollections)
  addData = async (collectionID, dataObj) => {
    const res = await this.db.collection(collectionID).add(dataObj);
    if (res) {
      const doc = await this.db
        .collection(collectionID)
        .doc(res.id)
        .set({ id: res.id }, { merge: true });
    }
    // console.log("Document added!");
    return res;
  };

  approveBooking = async (offeringID, taskID, bookingObj) => {
    bookingObj.bookingSlot.slotStatus = "Taken";
    bookingObj.bookingStatus = "Approved";
    const taskRef = this.db
      .collection("unitofferings")
      .doc(offeringID)
      .collection("tasks")
      .doc(taskID);
    const step_two = await taskRef
      .collection("bookingslots")
      .doc(bookingObj.bookingSlot.id)
      .update({ slotStatus: "Taken" })
      .then(async () => {
        const step_three = await taskRef
          .collection("bookingslots")
          .doc(bookingObj.bookingSlot.id)
          .collection("bookings")
          .doc(bookingObj.id)
          .update({
            bookingStatus: "Approved",
            "bookingSlot.slotStatus": "Taken",
          })
          .then(async () => {
            const step_four = await this.db
              .collection("bookinglogs")
              .doc(bookingObj.id)
              .update({
                bookingStatus: "Approved",
                "bookingSlot.slotStatus": "Taken",
              })
              .then(async () => {
                let studentID = bookingObj.student.studentID;
                const final = await this.db
                  .collection("unitofferings")
                  .doc(offeringID)
                  .collection("tasks")
                  .doc(taskID);

                const taskDoc = await taskRef.get();

                const task = taskDoc.data();
                const studentList = task.submissions;
                // Increase the count of submissions per student
                studentList.push(studentID);
                taskRef.update({ submissions: studentList });
              });
          });
      })
      .catch((err) => {
        // Do nothing
      });
  };

  rejectBooking = async (offeringID, taskID, bookingObj) => {
    const taskRef = this.db
      .collection("unitofferings")
      .doc(offeringID)
      .collection("tasks")
      .doc(taskID);
    // Delete the booking
    const step_two = await taskRef
      .collection("bookingslots")
      .doc(bookingObj.bookingSlot.id)
      .collection("bookings")
      .doc(bookingObj.id)
      .delete()
      .then(async () => {
        // Sync update the logs
        // Delete booking from the logs
        const step_three = await this.db
          .collection("bookinglogs")
          .doc(bookingObj.id)
          .delete()
          .then(async () => {
            // Revert the slot's avaiability to initial value
            const step_four = await taskRef
              .collection("bookingslots")
              .doc(bookingObj.bookingSlot.id)
              .update({ slotStatus: "Available" })
              .then(async () => {
                // Remove the student's ID from the list of students who have submitted bookings
                let studentID = bookingObj.student.studentID;
                const taskRef = await this.db
                  .collection("unitofferings")
                  .doc(offeringID)
                  .collection("tasks")
                  .doc(taskID);

                const taskDoc = await taskRef.get();

                const task = taskDoc.data();
                const studentList = task.submissions;

                for (let i = 0; i < studentList.length; i++) {
                  if (studentList[i] == studentID) {
                    studentList.splice(i, 1);
                    break;
                  }
                }

                taskRef.update({ submissions: studentList });
              });
          });
      })
      .catch((err) => {
        // Do nothing
      });
  };

  // Function to avoid overwriting documents (merge data instead)
  updateData = async (collectionID, docID, fieldObj) => {
    const res = await this.db
      .collection(collectionID)
      .doc(docID)
      .update(fieldObj);
    // console.log("Document updated!");
  };

  verifyTask = async (offeringID, taskName) => {
    let tasks = await this.db
      .collection("unitofferings")
      .doc(offeringID)
      .collection("tasks");
    tasks = await tasks.where("name", "==", taskName);
    return tasks.get();
  };

  verifyUnitOffering = async (unitID, semesterID) => {
    let offerings = await this.db.collection("unitofferings");
    offerings = await offerings.where("unitID", "==", unitID);
    offerings = await offerings.where("semesterID", "==", semesterID);
    return offerings.get();
  };

  verifySemester = async (semNo, semYear, semType) => {
    let semesters = await this.db.collection("semesters");
    semesters = await semesters.where("year", "==", semYear);
    semesters = await semesters.where("type", "==", semType);
    semesters = await semesters.where("number", "==", semNo);
    return semesters.get();
  };

  /***** BOOKING LOGS *****
   ***** ============= ******/

  loadTutorBookings = async (tutorID, bookingType) => {
    let today = new Date(Date.now());
    today.setHours(0, 0, 0, 0);

    let bookings = await this.db
      .collection("bookinglogs")
      .where("bookingSlot.date", ">", today)
      .limit(100)
      .get();
    let bookingDocs = [];
    bookings.forEach((doc) => bookingDocs.push(doc.data()));
    return bookingDocs;
  };

  /***** FIRESTORE BATCH OPERATIONS *****
   ***** ========================== ******/

  getUserRef = () => {
    this.db.collection("students");
  };

  setStudentBatch = async (studentObj, id) => {
    const setting = this.batch.set(
      this.db.collection("students").doc(id),
      studentObj
    );
    return setting;
  };

  setLabBatch = async (offeringID, labObj, objID) => {
    const setting = this.batch.set(
      this.db
        .collection("unitofferings")
        .doc(offeringID)
        .collection("labgroups")
        .doc(objID),
      labObj
    );
    return setting;
  };

  commitBatch = async () => {
    await this.batch.commit();
    this.batch = this.db.batch(); // Use a new batch next time
  };

  /***** LOGIC FOR AUTHENTICATION IMPLEMENTATION *****
   ***** ======================================= *****/

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.getUser(authUser.uid)
          .then((res) => {
            if (res) {
              const student = res;
              // console.log("Auth User:", authUser);
              authUser = {
                uid: authUser.uid,
                email: authUser.email,
                ...student,
              };
              next(authUser);
              // console.log("Current Student:", authUser);
            } else {
              this.getMonitor(authUser.uid)
                .then((ans) => {
                  if (ans) {
                    const tutor = ans;
                    authUser = {
                      uid: authUser.uid,
                      email: authUser.email,
                      ...tutor,
                    };
                    next(authUser);
                    // console.log("Current Tutor:", authUser);
                  }
                })
                .catch((error) => {
                  fallback();
                  console.error(error);
                });
            }
          })
          .catch((error) => {
            fallback();
            console.error(error);
          });
      } else {
        fallback();
      }
    });
}
export default Firebase;
