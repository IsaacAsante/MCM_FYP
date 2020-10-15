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

    /***** FIREBASE AUTH API  *****
     * ===========================*/

    // Signups
    this.createUser = (email, password) =>
      this.auth.createUserWithEmailAndPassword(email, password);

    // Logins
    this.signInUser = (email, password) =>
      this.auth.signInWithEmailAndPassword(email, password);

    // Logouts
    this.signOutUser = () => {
      this.auth.signOut();
      console.log("Signed Out");
    };

    // Password Resets
    this.resetUserPassword = (email) => this.auth.sendPasswordResetEmail(email);

    // Update passwords
    this.updateUserPassword = (password) =>
      this.auth.currentUser.updatePassword(password);

    /***** CLOUD FIRESTORE API  *****
     * ===========================*/
    this.getStudent = async (uid) => {
      const studentRef = this.db.collection("students").doc(uid);
      let doc = await studentRef.get();
      return doc.data();
    };

    this.getTutor = async (uid) => {
      const tutorRef = this.db.collection("tutors").doc(uid);
      let doc = await tutorRef.get();
      return doc.data();
    };

    this.getAllDocsInCollection = async (collectionID) => {
      const docsRef = this.db.collection(collectionID);
      const snapshot = await docsRef.get();
      let docData = [];
      snapshot.forEach((doc) => {
        console.log(doc.data());
      });
    };

    // Use the generic addData() function variations below on primary Firestore collections (and not subcollections)
    this.addData = async (collectionID, dataObj) => {
      const res = await this.db.collection(collectionID).add(dataObj);
      console.log("Document added!");
    };

    // Function to avoid overwriting documents (merge data instead)
    this.updateData = async (collectionID, docID, dataObj) => {
      const res = await this.db
        .collection(collectionID)
        .doc(docID)
        .update(dataObj);
      console.log("Document updated!");
    };
  }
}
export default Firebase;
