import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7b9hmwXeJdKQUeaRoDlmJafymUyiagro",
  authDomain: "prodigy-task-1.firebaseapp.com",
  projectId: "prodigy-task-1",
  storageBucket: "prodigy-task-1.firebasestorage.app",
  messagingSenderId: "660032754498",
  appId: "1:660032754498:web:acc94b7d7c6a26a4e6eedb",
  measurementId: "G-T9Q979GDFX",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const CLOUDINARY = {
  cloudName: "daqdbkplf",
  uploadPreset: "E-Comerce",
};

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY.uploadPreset);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`,
    { method: "POST", body: formData },
  );
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data.secure_url as string;
}
