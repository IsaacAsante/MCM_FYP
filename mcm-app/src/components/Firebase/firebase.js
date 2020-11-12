/* Firebase configuration-related security information here:
 * https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public
 */
// Core Firebase SDK
import app from "firebase/app";

// Firebase services used by the app
import "firebase/auth";
import "firebase/firestore";

// Role-based access: https://firebase.google.com/docs/firestore/solutions/role-based-access

// Dev project config (NOT PRODUCTION!)
const devFirebaseConfig = {
  apiKey: "AIzaSyA2TS4JwnDmVdz0VCNW32eN56FkZG_ijHY",
  authDomain: "dev-mcm-app.firebaseapp.com",
  databaseURL: "https://dev-mcm-app.firebaseio.com",
  projectId: "dev-mcm-app",
  storageBucket: "dev-mcm-app.appspot.com",
  messagingSenderId: "234254647001",
  appId: "1:234254647001:web:bdc87e322c0669a01388c8",
  measurementId: "G-XM8RCJJWTG",
};

class Firebase {
  constructor() {
    app.initializeApp(devFirebaseConfig); // Initialize app
    this.auth = app.auth(); // For Firebase Auth
    this.db = app.firestore(); // For Cloud Firestore
    this.batch = app.firestore().batch(); // Used to create student docs in batch
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
    console.log("Signed Out");
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

  findEnrolment = async (studentID) => {
    const enrolmentRef = await this.db.collection("enrolments");
    const snapshot = await enrolmentRef
      .where("studentID", "==", studentID)
      .get();
    const students = [];
    snapshot.forEach((doc) => students.push(doc.data()));
    return students[0];
  };

  findLab = async (offeringID, labName) => {
    const labRef = await this.db
      .collection("unitofferings")
      .doc(offeringID)
      .collection("labgroups");
    const snapshot = await labRef.where("name", "==", labName).get();
    const labs = [];
    snapshot.forEach((doc) => labs.push(doc.data()));
    return labs[0];
  };

  findLabsByTutor = async (offeringID, tutorEmail) => {
    const labGroupRef = this.db
      .collection("unitofferings")
      .doc(offeringID)
      .collection("labgroups");
    const snapshot = await labGroupRef
      .where("tutorEmail", "==", tutorEmail)
      .get();
    const tutorLabGroups = [];
    snapshot.forEach((doc) => tutorLabGroups.push(doc.data()));
    return tutorLabGroups; // Return the entire array
  };

  findSemester = async (semesterID) => {
    const semesterRef = this.db.collection("semesters");
    const snapshot = await semesterRef.where("id", "==", semesterID).get();
    const semesters = [];
    snapshot.forEach((doc) => semesters.push(doc.data()));
    return semesters[0]; // Return a single semester (by ID, so there's only one valid entry).
  };

  findTask = async (offeringID, taskID) => {
    const taskRef = this.db
      .collection("unitofferings")
      .doc(offeringID)
      .collection("tasks");
    const snapshot = await taskRef.where("id", "==", taskID).get();
    const tasks = [];
    snapshot.forEach((doc) => tasks.push(doc.data()));
    return tasks[0]; // Return a single task (by ID, so only one entry possible)
  };

  findTutor = async (firstName, lastName) => {
    const tutorRef = this.db.collection("tutors");
    let tutors = await tutorRef.where("firstname", "==", firstName);
    tutors = await tutors.where("lastname", "==", lastName).get();
    if (tutors.empty) {
      tutors = await tutorRef.where("lastname", "==", firstName);
      tutors = await tutors.where("firstname", "==", lastName).get();
    }
    let tutors_found = [];
    tutors.forEach((doc) => tutors_found.push(doc.data()));
    return tutors_found[0];
  };

  findUnit = async (unitID) => {
    const unitRef = this.db.collection("units");
    const snapshot = await unitRef.where("id", "==", unitID).get();
    const units = [];
    snapshot.forEach((doc) => units.push(doc.data()));
    return units[0]; // Return a single unit (by ID, so there's only one valid entry).
  };

  getBookingSlotsByTutor = async (offeringID, taskID, tutorID) => {
    const bookingSlotRef = this.db
      .collection("unitofferings")
      .doc(offeringID)
      .collection("tasks")
      .doc(taskID)
      .collection("bookingslots");
    const snapshot = bookingSlotRef.where("tutorID", "==", tutorID).get();
    const bookingSlots = [];
    (await snapshot).forEach((doc) => bookingSlots.push(doc.data()));
    return bookingSlots; // Return all matching docs
  };

  getLabGroups = async (offeringID) => {
    const labGroupRef = this.db
      .collection("unitofferings")
      .doc(offeringID)
      .collection("labgroups");
    const snapshot = await labGroupRef.get();
    const labGroups = [];
    snapshot.forEach((doc) => labGroups.push(doc.data()));
    return labGroups; // Return the entire array
  };

  getStudent = async (uid) => {
    const studentRef = this.db.collection("students").doc(uid);
    let doc = await studentRef.get();
    return doc.data();
  };

  getTasks = async (offeringID) => {
    const tasksRef = this.db
      .collection("unitofferings")
      .doc(offeringID)
      .collection("tasks");
    const snapshot = await tasksRef.get();
    let tasks = [];
    snapshot.forEach((doc) => {
      tasks.push(doc.data());
    });
    return tasks;
  };

  getTutor = async (uid) => {
    const tutorRef = this.db.collection("tutors").doc(uid);
    let doc = await tutorRef.get();
    return doc.data();
  };

  getTutorUID = async (tutorEmail) => {
    const tutorRef = this.db.collection("tutors");
    let snapshot = await tutorRef.where("email", "==", tutorEmail).get();
    let tutors = [];
    snapshot.forEach((doc) => tutors.push(doc.id));
    return tutors[0]; // Return a single tutor (by email, so only one entry possible)
  };

  getUnit = async (uCode) => {
    const unitRef = this.db.collection("units");
    // Query values in Firestore are case-sensitive, hence the use of toUpperCase() string method.
    const snapshot = await unitRef
      .where("unitCode", "==", uCode.toUpperCase())
      .get();
    const unit = [];
    snapshot.forEach((doc) => unit.push(doc.data()));
    return unit;
  };

  getUnitOffering = async (docID) => {
    const unitOfferingRef = this.db.collection("unitofferings").doc(docID);
    let doc = await unitOfferingRef.get();
    return doc.data();
  };

  getValidSemesters = async () => {
    const semestersRef = this.db.collection("semesters");
    const currentYear = new Date().getFullYear();
    const snapshot = await semestersRef.where("year", ">=", currentYear).get();
    const semesters = [];
    snapshot.forEach((doc) => semesters.push(doc.data()));
    return semesters;
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

  addBookingSlot = async (offeringID, taskID, bookingSlotObj) => {
    const res = await this.db
      .collection("unitofferings")
      .doc(offeringID)
      .collection("tasks")
      .doc(taskID)
      .collection("bookingslots")
      .add(bookingSlotObj);
    if (res) {
      const doc = await this.db
        .collection("unitofferings")
        .doc(offeringID)
        .collection("tasks")
        .doc(taskID)
        .collection("bookingslots")
        .doc(res.id)
        .set({ id: res.id }, { merge: true });
    }
    return res;
  };

  addTask = async (offeringID, taskObj) => {
    const res = await this.db
      .collection("unitofferings")
      .doc(offeringID)
      .collection("tasks")
      .add(taskObj);
    console.log("Task added!", res.id);
    if (res) {
      const doc = await this.db
        .collection("unitofferings")
        .doc(offeringID)
        .collection("tasks")
        .doc(res.id)
        .set({ id: res.id }, { merge: true });
    }
    return res;
  };

  addUserToDB = async (collectionID, uid, dataObj) => {
    const res = await this.db.collection(collectionID).doc(uid).set(dataObj);
    console.log("Document added!");
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
    console.log("Document added!");
    return res;
  };

  // Function to avoid overwriting documents (merge data instead)
  updateData = async (collectionID, docID, fieldObj) => {
    const res = await this.db
      .collection(collectionID)
      .doc(docID)
      .update(fieldObj);
    console.log("Document updated!");
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

  /***** FIRESTORE BATCH OPERATIONS *****
   ***** ========================== ******/

  getStudentRef = () => {
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
        this.getStudent(authUser.uid)
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
              console.log("Current Student:", authUser);
            } else {
              this.getTutor(authUser.uid)
                .then((ans) => {
                  if (ans) {
                    const tutor = ans;
                    authUser = {
                      uid: authUser.uid,
                      email: authUser.email,
                      ...tutor,
                    };
                    next(authUser);
                    console.log("Current Tutor:", authUser);
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
