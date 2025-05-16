import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function HomeEmpresa() {

  const navigate = useNavigate();

  

  async function handleLogout() {
    try {
      await auth.signOut();
      navigate("/cadastro");
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  return (
   <div>
    <h1>Empresaaaaaaaaa</h1>
      <button className="btn btn-primary" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
