import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { format } from "date-fns";
import Swal from "sweetalert2";

const storage = getStorage();

const EventLoginPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    flatNo: "",
    wing: "",
    file: null,
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [eventDetails, setEventDetails] = useState(null);
  const [registeredUserCount, setRegisteredUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isEventEnded =
    eventDetails?.endTime?.seconds
      ? eventDetails.endTime.seconds * 1000 < Date.now()
      : false;

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchRegisteredUserCount();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    const eventRef = doc(db, "LeadCapture", id);
    const eventDoc = await getDoc(eventRef);
    if (eventDoc.exists()) {
      setEventDetails(eventDoc.data());
    }
    setLoading(false);
  };

  const fetchRegisteredUserCount = async () => {
    const registeredUsersRef = collection(
      db,
      "LeadCapture",
      id,
      "registeredUsers"
    );
    const snapshot = await getDocs(registeredUsersRef);
    setRegisteredUserCount(snapshot.size);
  };

  // ---------------- FILE HANDLER (Simplified) ----------------

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, file }));

    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  // ---------------- VALIDATION ----------------

  const validateField = (name, value) => {
    let message = "";

    if (name === "name" && !value.trim())
      message = "Full name is required";

    if (name === "phone") {
      if (!value) message = "Phone number is required";
      else if (!/^[0-9]{10}$/.test(value))
        message = "Enter valid 10 digit phone number";
    }

    if (name === "flatNo" && !value.trim())
      message = "Flat number is required";

    if (name === "wing" && !value.trim())
      message = "Wing is required";

    setErrors((prev) => ({ ...prev, [name]: message }));
    return message === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateForm = () => {
    const results = [
      validateField("name", formData.name),
      validateField("phone", formData.phone),
      validateField("flatNo", formData.flatNo),
      validateField("wing", formData.wing),
    ];
    return results.every((item) => item === true);
  };

  // ---------------- SUBMIT ----------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const userRef = doc(
        db,
        "LeadCapture",
        id,
        "registeredUsers",
        formData.phone
      );

      const existingUser = await getDoc(userRef);

      if (existingUser.exists()) {
        Swal.fire({
          icon: "info",
          title: "Already Registered",
          text: "This phone number is already registered.",
          confirmButtonColor: "#16274f",
        });
        return;
      }

      let fileURL = "";

      if (formData.file) {
        const fileRef = ref(
          storage,
          `LeadCapture/${id}/registeredUsers/${formData.phone}/${formData.file.name}`
        );

        await uploadBytes(fileRef, formData.file);
        fileURL = await getDownloadURL(fileRef);
      }

      await setDoc(userRef, {
        name: formData.name,
        phoneNumber: formData.phone,
        flatNo: formData.flatNo,
        wing: formData.wing,
        builder: eventDetails?.builder || "",
        fileURL: fileURL,
        registeredAt: serverTimestamp(),
      });

      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        confirmButtonColor: "#16274f",
      });

      setFormData({
        name: "",
        phone: "",
        flatNo: "",
        wing: "",
        file: null,
      });

      setPreview(null);
      setErrors({});
      fetchRegisteredUserCount();

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong.",
      });
    }
  };

  if (loading) return <div style={{ padding: 50 }}>Loading...</div>;

  const formattedDate = eventDetails?.startTime?.seconds
    ? format(
        new Date(eventDetails.startTime.seconds * 1000),
        "EEEE, dd/MM/yy"
      )
    : "";

  return (
    <section className="feedbackContainer">
      <div className="feedback-form-container">

        <h2 className="feedback-form-title">
          {eventDetails?.name || "Event"}
        </h2>

        {formattedDate && (
          <div className="event-card">{formattedDate}</div>
        )}

        <div className="count-badge">
          {registeredUserCount} people registered
        </div>

        <form onSubmit={handleSubmit} noValidate>

          <div className="input-group">
            <label>Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isEventEnded}
              className={errors.name ? "error-input" : ""}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="input-group">
            <label>Contact Number</label>
            <input
              name="phone"
              maxLength="10"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isEventEnded}
              className={errors.phone ? "error-input" : ""}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>

          <div className="input-group">
            <label>Flat No</label>
            <input
              name="flatNo"
              value={formData.flatNo}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isEventEnded}
              className={errors.flatNo ? "error-input" : ""}
            />
            {errors.flatNo && (
              <span className="error-message">{errors.flatNo}</span>
            )}
          </div>

          <div className="input-group">
            <label>Wing</label>
            <input
              name="wing"
              value={formData.wing}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isEventEnded}
              className={errors.wing ? "error-input" : ""}
            />
            {errors.wing && (
              <span className="error-message">{errors.wing}</span>
            )}
          </div>

          {/* SINGLE UPLOAD FIELD */}
          <div className="input-group">
            <label>Upload Photo or PDF</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              capture="user"
              onChange={handleFileChange}
              disabled={isEventEnded}
            />
          </div>

          {preview && (
            <div style={{ marginTop: 10 }}>
              <img
                src={preview}
                alt="Preview"
                style={{ width: 130, borderRadius: 10 }}
              />
            </div>
          )}

          {formData.file &&
            formData.file.type === "application/pdf" && (
              <div style={{ marginTop: 10 }}>
                📄 Selected File: {formData.file.name}
              </div>
            )}

          <div className="input-group">
            <label>Builder</label>
            <input value={eventDetails?.builder || ""} disabled readOnly />
          </div>

          <button className="submitbtns" disabled={isEventEnded}>
            Submit Registration
          </button>

        </form>

        <div className="logo-row">
          <img src="/ujustlogo.png" alt="Logo1" />
          <img src="/karuyaki.png" alt="Logo2" />
          <img src="/connect.png" alt="Logo3" />
        </div>

      </div>
    </section>
  );
};

export default EventLoginPage;
