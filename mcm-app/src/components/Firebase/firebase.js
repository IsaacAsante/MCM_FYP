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

  /***** CLOUD FIRESTORE API  *****
   * ===========================*/

  findSemester = async (semesterID) => {
    const semesterRef = this.db.collection("semesters");
    const snapshot = await semesterRef.where("id", "==", semesterID).get();
    const semesters = [];
    snapshot.forEach((doc) => semesters.push(doc.data()));
    return semesters[0]; // Return a single semester (by ID, so there's only one valid entry).
  };

  findUnit = async (unitID) => {
    const unitRef = this.db.collection("units");
    const snapshot = await unitRef.where("id", "==", unitID).get();
    const units = [];
    snapshot.forEach((doc) => units.push(doc.data()));
    return units[0]; // Return a single semester (by ID, so there's only one valid entry).
  };

  getStudent = async (uid) => {
    const studentRef = this.db.collection("students").doc(uid);
    let doc = await studentRef.get();
    return doc.data();
  };

  getTutor = async (uid) => {
    const tutorRef = this.db.collection("tutors").doc(uid);
    let doc = await tutorRef.get();
    return doc.data();
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

  getAllDocsInCollection = async (collectionID) => {
    const docsRef = this.db.collection(collectionID);
    const snapshot = await docsRef.get();
    let docData = [];
    snapshot.forEach((doc) => {
      docData.push(doc.data());
    });
    return docData;
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
  updateData = async (collectionID, docID, dataObj) => {
    const res = await this.db
      .collection(collectionID)
      .doc(docID)
      .update(dataObj);
    console.log("Document updated!");
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
