import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const UNION_TERRITORIES = [
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

const ALL_STATES = [...INDIAN_STATES, ...UNION_TERRITORIES];

const onlyDigits = (value, max) => value.replace(/\D/g, "").slice(0, max);
const isValidMobile = (value) => /^[6-9]\d{9}$/.test(value);
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const todayString = () => new Date().toISOString().split("T")[0];

const getErrorMessage = async (response, fallback) => {
  try {
    const data = await response.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((item) => item.msg).join(" ");
    }
  } catch {
    /* response JSON nahi tha */
  }
  return fallback;
};

const SUPPORT_OPTIONS = [
  {
    key: "donorSearch",
    icon: "🧬",
    title: "Stem Cell Donor Search",
    text: "Request assistance with a potential donor matching process.",
  },
  {
    key: "financialSupport",
    icon: "₹",
    title: "Financial Support",
    text: "Request information or assistance related to treatment costs.",
  },
  {
    key: "treatmentSupport",
    icon: "+",
    title: "Treatment Support",
    text: "Access relevant treatment and patient-support resources.",
  },
  {
    key: "otherAssistance",
    icon: "•••",
    title: "Other Assistance",
    text: "Specify any other support requirement.",
  },
];

const INITIAL_PATIENT = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  mobile: "",
  email: "",
  city: "",
  state: "",
};

const INITIAL_MEDICAL = {
  diagnosis: "",
  treatmentInfo: "",
  hla_type: "",
};

const INITIAL_SUPPORT = {
  donorSearch: false,
  financialSupport: false,
  treatmentSupport: false,
  otherAssistance: false,
  otherDetails: "",
};

function PatientSupport() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [patientDetails, setPatientDetails] = useState(INITIAL_PATIENT);
  const [medicalDetails, setMedicalDetails] = useState(INITIAL_MEDICAL);
  const [supportDetails, setSupportDetails] = useState(INITIAL_SUPPORT);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [photoConsent, setPhotoConsent] = useState(false);

  useEffect(() => {
    if (!profileImagePreview) return;

    return () => {
      URL.revokeObjectURL(profileImagePreview);
    };
  }, [profileImagePreview]);
  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const updatePatientDetails = (field, value) => {
    const newValue = field === "mobile" ? onlyDigits(value, 10) : value;
    setPatientDetails((prev) => ({ ...prev, [field]: newValue }));
    clearError(field);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];

    console.log("Image name:", file?.name);
    console.log("Image type:", file?.type);
    console.log("Image size:", file?.size);

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "Please upload JPG, PNG or WEBP image.",
      }));
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "Image size must be less than 5 MB.",
      }));
      e.target.value = "";
      return;
    }

    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));

    setErrors((prev) => ({
      ...prev,
      profileImage: "",
    }));
  };

  const updateMedicalDetails = (field, value) => {
    setMedicalDetails((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const updateSupportDetails = (field, value) => {
    setSupportDetails((prev) => ({ ...prev, [field]: value }));
    clearError("support");
    clearError(field);
  };

  const fieldError = (name) =>
    errors[name] ? <small className="field-error">{errors[name]}</small> : null;

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (patientDetails.fullName.trim().length < 2) {
        newErrors.fullName = "Please enter the patient's full name.";
      }

      if (!patientDetails.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required.";
      } else if (new Date(patientDetails.dateOfBirth) > new Date()) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future.";
      }

      if (!patientDetails.gender) newErrors.gender = "Please select gender.";

      if (!isValidMobile(patientDetails.mobile)) {
        newErrors.mobile =
          "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.";
      }

      if (!isValidEmail(patientDetails.email.trim())) {
        newErrors.email = "Enter a valid email address.";
      }

      if (!patientDetails.city.trim()) newErrors.city = "City is required.";

      if (!ALL_STATES.includes(patientDetails.state)) {
        newErrors.state = "Please select a state or union territory.";
      }
      if (profileImage && !photoConsent) {
        newErrors.photoConsent =
          "Please provide consent before uploading a campaign photograph.";
      }

      if (photoConsent && !profileImage) {
        newErrors.profileImage =
          "Please upload a photograph if you want it used in a campaign.";
      }
    }

    if (step === 2) {
      if (!medicalDetails.diagnosis.trim()) {
        newErrors.diagnosis = "Diagnosis is required.";
      }
    }

    if (step === 3) {
      const anySelected = SUPPORT_OPTIONS.some((o) => supportDetails[o.key]);
      if (!anySelected) {
        newErrors.support = "Please select at least one type of support.";
      }
      if (supportDetails.otherAssistance && !supportDetails.otherDetails.trim()) {
        newErrors.otherDetails = "Please describe the other assistance needed.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep()) return;

    if (step < 4) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const registerPatient = async () => {
    const payload = {
      full_name: patientDetails.fullName.trim(),
      date_of_birth: patientDetails.dateOfBirth,
      gender: patientDetails.gender,
      mobile: patientDetails.mobile,
      email: patientDetails.email.trim(),
      city: patientDetails.city.trim(),
      state: patientDetails.state,

      diagnosis: medicalDetails.diagnosis.trim(),
      treatment_info: medicalDetails.treatmentInfo,
      hla_type: medicalDetails.hla_type || null,

      donor_search: supportDetails.donorSearch,
      financial_support: supportDetails.financialSupport,
      treatment_support: supportDetails.treatmentSupport,
      other_assistance: supportDetails.otherAssistance,
      other_details: supportDetails.otherDetails || null,
      photo_consent: photoConsent,



    };

    const formData = new FormData();

    formData.append("patient_data", JSON.stringify(payload));

    if (photoConsent && profileImage) {
      formData.append("profile_image", profileImage);
    }
    const response = await fetch(`${API_URL}/api/patients/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, "Patient registration failed")
      );
    }

    return await response.json();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (step !== 4 || submitting) return;

    setSubmitting(true);
    try {
      await registerPatient();
      setSubmitted(true);
    } catch (error) {
      console.error("Patient registration failed:", error);
      alert(error.message || "Patient registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setErrors({});
    setPatientDetails(INITIAL_PATIENT);
    setMedicalDetails(INITIAL_MEDICAL);
    setSupportDetails(INITIAL_SUPPORT);
    setProfileImage(null);
    setProfileImagePreview("");
    setPhotoConsent(false);
    setSubmitted(false);
  };

  const selectedSupport = SUPPORT_OPTIONS.filter((o) => supportDetails[o.key]);

  /* ===================== SUCCESS ===================== */

  if (submitted) {
    return (
      <main className="patient-page">
        <section className="patient-success-section">
          <div className="patient-success-card">

            <div className="patient-success-icon">✓</div>

            <span className="patient-eyebrow">REQUEST RECEIVED</span>

            <h1>
              Your support request
              <br />
              has been submitted.
            </h1>

            <p>
              Your information has been recorded for this project
              prototype. In a real system, the request would be
              reviewed and processed by the appropriate healthcare
              or donor-support team.
            </p>

            <div className="patient-success-details">
              <div>
                <span>Patient</span>
                <strong>{patientDetails.fullName || "Patient"}</strong>
              </div>

              <div>
                <span>Request</span>
                <strong>
                  {selectedSupport.length > 0
                    ? selectedSupport.map((o) => o.title).join(", ")
                    : "Support request"}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong className="status-text">Submitted</strong>
              </div>
            </div>

            <button
              type="button"
              className="patient-primary-btn"
              onClick={resetForm}
            >
              Create Another Request
              <span>→</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* ===================== FORM ===================== */

  return (
    <main className="patient-page">

      {/* HERO */}
      <section className="patient-hero">
        <div className="patient-hero-inner">

          <div className="patient-hero-content">
            <span className="patient-eyebrow">PATIENT SUPPORT</span>

            <h1>
              Find support for
              <br />
              your <span>care journey.</span>
            </h1>

            <p>
              Create a patient support request by providing your
              basic information, treatment details and the type
              of assistance you need.
            </p>

            <div className="patient-hero-points">
              <div>
                <span>01</span>
                <p>Patient profile</p>
              </div>

              <div>
                <span>02</span>
                <p>Medical information</p>
              </div>

              <div>
                <span>03</span>
                <p>Support request</p>
              </div>
            </div>
          </div>

          <div className="patient-hero-panel">
            <div className="patient-panel-top">
              <span>SUPPORT REQUEST</span>
              <span>04 STEPS</span>
            </div>

            <div className="patient-panel-content">
              <div className="patient-panel-number">01</div>

              <h2>
                Start your
                <br />
                support request.
              </h2>

              <p>
                Tell us about the patient and the support
                required. Your information helps organize
                the next stage of the support process.
              </p>

              <div className="patient-panel-line">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FORM SECTION */}
      <section className="patient-form-section">
        <div className="patient-form-wrapper">

          <div className="patient-form-heading">
            <div>
              <span className="patient-eyebrow">PATIENT REQUEST</span>

              <h2>
                Tell us what
                <br />
                you need.
              </h2>
            </div>

            <p>
              Complete the steps below to create your patient
              support request.
            </p>
          </div>

          {/* PROGRESS */}
          <div className="patient-progress">
            {[
              { no: "01", label: "Patient" },
              { no: "02", label: "Medical" },
              { no: "03", label: "Support" },
              { no: "04", label: "Review" },
            ].map((item, index) => (
              <div key={item.no} style={{ display: "contents" }}>
                {index > 0 && <div className="patient-progress-line" />}
                <div
                  className={
                    step >= index + 1
                      ? "patient-progress-step active"
                      : "patient-progress-step"
                  }
                >
                  <span>{item.no}</span>
                  <p>{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="patient-form-card">

                <div className="patient-card-header">
                  <div>
                    <span>STEP 01</span>
                    <h3>Patient information</h3>
                    <p>Provide the basic details of the patient.</p>
                  </div>

                  <div className="patient-card-number">01</div>
                </div>

                <div className="patient-form-grid">

                  <div className="patient-field patient-field-full">
                    <label htmlFor="p-fullName">Full Name</label>
                    <input
                      id="p-fullName"
                      type="text"
                      placeholder="Enter patient's full name"
                      value={patientDetails.fullName}
                      onChange={(e) =>
                        updatePatientDetails("fullName", e.target.value)
                      }
                    />
                    {fieldError("fullName")}
                  </div>
                  <div className="patient-field patient-field-full">
                    <label htmlFor="p-profile-image">
                      Patient Photograph
                    </label>

                    <input
                      id="p-profile-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleProfileImageChange}
                    />

                    <small>
                      Upload a clear patient photograph (JPG, PNG or WEBP, maximum 5 MB).
                      This photo will be used for the patient's campaign.
                    </small>

                    {profileImagePreview && (
                      <div style={{ marginTop: "14px" }}>
                        <img
                          src={profileImagePreview}
                          alt="Patient photograph preview"
                          style={{
                            width: "130px",
                            height: "130px",
                            objectFit: "cover",
                            borderRadius: "12px",
                            border: "1px solid #ddd",
                          }}
                        />

                        <p style={{ marginTop: "6px" }}>
                          {profileImage?.name}
                        </p>
                      </div>
                    )}

                    {fieldError("profileImage")}
                    <div className="patient-field patient-field-full">
                      <label>
                        <input
                          type="checkbox"
                          checked={photoConsent}
                          onChange={(e) => {
                            setPhotoConsent(e.target.checked);
                            clearError("photoConsent");
                          }}
                        />
                        I voluntarily consent to using my uploaded photograph
                        in a public StemConnect campaign.
                      </label>

                      {fieldError("photoConsent")}
                    </div>
                  </div>

                  <div className="patient-field">
                    <label htmlFor="p-dob">Date of Birth</label>
                    <input
                      id="p-dob"
                      type="date"
                      max={todayString()}
                      value={patientDetails.dateOfBirth}
                      onChange={(e) =>
                        updatePatientDetails("dateOfBirth", e.target.value)
                      }
                    />
                    {fieldError("dateOfBirth")}
                  </div>

                  <div className="patient-field">
                    <label htmlFor="p-gender">Gender</label>
                    <select
                      id="p-gender"
                      value={patientDetails.gender}
                      onChange={(e) =>
                        updatePatientDetails("gender", e.target.value)
                      }
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    {fieldError("gender")}
                  </div>

                  <div className="patient-field">
                    <label htmlFor="p-mobile">Mobile Number</label>
                    <input
                      id="p-mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={patientDetails.mobile}
                      onChange={(e) =>
                        updatePatientDetails("mobile", e.target.value)
                      }
                    />
                    {fieldError("mobile")}
                  </div>

                  <div className="patient-field">
                    <label htmlFor="p-email">Email Address</label>
                    <input
                      id="p-email"
                      type="email"
                      placeholder="Enter email address"
                      value={patientDetails.email}
                      onChange={(e) =>
                        updatePatientDetails("email", e.target.value)
                      }
                    />
                    {fieldError("email")}
                  </div>

                  <div className="patient-field">
                    <label htmlFor="p-city">City</label>
                    <input
                      id="p-city"
                      type="text"
                      placeholder="Enter city"
                      value={patientDetails.city}
                      onChange={(e) =>
                        updatePatientDetails("city", e.target.value)
                      }
                    />
                    {fieldError("city")}
                  </div>

                  <div className="patient-field">
                    <label htmlFor="p-state">State / Union Territory</label>
                    <select
                      id="p-state"
                      value={patientDetails.state}
                      onChange={(e) =>
                        updatePatientDetails("state", e.target.value)
                      }
                    >
                      <option value="">Select state</option>
                      <optgroup label="States">
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Union Territories">
                        {UNION_TERRITORIES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </optgroup>
                    </select>
                    {fieldError("state")}
                  </div>

                </div>

                <div className="patient-form-actions">
                  <span>Basic patient details</span>

                  <button
                    type="button"
                    className="patient-primary-btn"
                    onClick={handleContinue}
                  >
                    Continue
                    <span>→</span>
                  </button>
                </div>

              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="patient-form-card">

                <div className="patient-card-header">
                  <div>
                    <span>STEP 02</span>
                    <h3>Medical information</h3>
                    <p>
                      Add the available diagnosis and treatment
                      information for the patient.
                    </p>
                  </div>

                  <div className="patient-card-number">02</div>
                </div>

                <div className="patient-form-grid">

                  <div className="patient-field patient-field-full">
                    <label htmlFor="p-diagnosis">Diagnosis / Cancer Type</label>
                    <input
                      id="p-diagnosis"
                      type="text"
                      placeholder="Enter diagnosis or cancer type"
                      value={medicalDetails.diagnosis}
                      onChange={(e) =>
                        updateMedicalDetails("diagnosis", e.target.value)
                      }
                    />
                    {fieldError("diagnosis")}
                  </div>

                  <div className="patient-field patient-field-full">
                    <label htmlFor="p-treatment">Treatment Information</label>
                    <textarea
                      id="p-treatment"
                      placeholder="Enter relevant treatment information"
                      value={medicalDetails.treatmentInfo}
                      onChange={(e) =>
                        updateMedicalDetails("treatmentInfo", e.target.value)
                      }
                    />
                  </div>

                  <div className="patient-field patient-field-full">
                    <label htmlFor="patient-hla-type">HLA Type</label>
                    <input
                      id="patient-hla-type"
                      type="text"
                      placeholder="e.g. A*02:01, B*07:02, DRB1*15:01"
                      value={medicalDetails.hla_type}
                      onChange={(e) =>
                        updateMedicalDetails("hla_type", e.target.value)
                      }
                    />
                    <small>
                      Demo testing only. Enter sample HLA values if available.
                    </small>
                  </div>

                </div>

                <div className="patient-info-note">
                  <span>i</span>
                  <p>
                    HLA information can be used in a donor
                    matching workflow. This prototype does not
                    perform a real medical donor match.
                  </p>
                </div>

                <div className="patient-form-actions">
                  <button
                    type="button"
                    className="patient-back-btn"
                    onClick={handleBack}
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    className="patient-primary-btn"
                    onClick={handleContinue}
                  >
                    Continue
                    <span>→</span>
                  </button>
                </div>

              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="patient-form-card">

                <div className="patient-card-header">
                  <div>
                    <span>STEP 03</span>
                    <h3>Support required</h3>
                    <p>Select the areas where support is required.</p>
                  </div>

                  <div className="patient-card-number">03</div>
                </div>

                <div className="patient-support-options">
                  {SUPPORT_OPTIONS.map((option) => (
                    <label
                      key={option.key}
                      className={
                        supportDetails[option.key]
                          ? "patient-support-option selected"
                          : "patient-support-option"
                      }
                    >
                      <input
                        type="checkbox"
                        checked={supportDetails[option.key]}
                        onChange={(e) =>
                          updateSupportDetails(option.key, e.target.checked)
                        }
                      />

                      <div className="patient-option-icon">{option.icon}</div>

                      <div>
                        <strong>{option.title}</strong>
                        <p>{option.text}</p>
                      </div>

                      <span className="patient-option-check">✓</span>
                    </label>
                  ))}

                  {fieldError("support")}
                </div>

                {supportDetails.otherAssistance && (
                  <div className="patient-field patient-other-field">
                    <label htmlFor="p-other">Describe Other Assistance</label>
                    <textarea
                      id="p-other"
                      placeholder="Describe the support required"
                      value={supportDetails.otherDetails}
                      onChange={(e) =>
                        updateSupportDetails("otherDetails", e.target.value)
                      }
                    />
                    {fieldError("otherDetails")}
                  </div>
                )}

                <div className="patient-form-actions">
                  <button
                    type="button"
                    className="patient-back-btn"
                    onClick={handleBack}
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    className="patient-primary-btn"
                    onClick={handleContinue}
                  >
                    Review Request
                    <span>→</span>
                  </button>
                </div>

              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="patient-form-card">

                <div className="patient-card-header">
                  <div>
                    <span>STEP 04</span>
                    <h3>Review your request</h3>
                    <p>
                      Check the information before submitting
                      the patient support request.
                    </p>
                  </div>

                  <div className="patient-card-number">04</div>
                </div>

                <div className="patient-review-section">
                  <div className="patient-review-heading">
                    <span>01</span>
                    <h4>Patient Information</h4>
                  </div>

                  <div className="patient-review-grid">
                    <div>
                      <span>Patient Photograph</span>

                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Patient photograph"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                      ) : (
                        <strong>Not uploaded</strong>
                      )}
                    </div>
                    <div>
                      <span>Campaign Photo Consent</span>
                      <strong>{photoConsent ? "Granted" : "Not Granted"}</strong>
                    </div>
                    <div>
                      <span>Full Name</span>
                      <strong>{patientDetails.fullName || "—"}</strong>
                    </div>

                    <div>
                      <span>Date of Birth</span>
                      <strong>{patientDetails.dateOfBirth || "—"}</strong>
                    </div>

                    <div>
                      <span>Gender</span>
                      <strong>{patientDetails.gender || "—"}</strong>
                    </div>

                    <div>
                      <span>Mobile</span>
                      <strong>{patientDetails.mobile || "—"}</strong>
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>{patientDetails.email || "—"}</strong>
                    </div>

                    <div>
                      <span>Location</span>
                      <strong>
                        {patientDetails.city || "—"}
                        {patientDetails.state ? `, ${patientDetails.state}` : ""}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="patient-review-section">
                  <div className="patient-review-heading">
                    <span>02</span>
                    <h4>Medical Information</h4>
                  </div>

                  <div className="patient-review-grid">
                    <div>
                      <span>Diagnosis</span>
                      <strong>{medicalDetails.diagnosis || "—"}</strong>
                    </div>

                    <div>
                      <span>HLA Type</span>
                      <strong>{medicalDetails.hla_type || "Not provided"}</strong>
                    </div>

                    <div className="patient-review-full">
                      <span>Treatment Information</span>
                      <strong>{medicalDetails.treatmentInfo || "—"}</strong>
                    </div>
                  </div>
                </div>

                <div className="patient-review-section">
                  <div className="patient-review-heading">
                    <span>03</span>
                    <h4>Support Required</h4>
                  </div>

                  <div className="patient-selected-support">
                    {selectedSupport.map((option) => (
                      <span key={option.key}>{option.title}</span>
                    ))}

                    {selectedSupport.length === 0 && (
                      <span>No support type selected</span>
                    )}
                  </div>
                </div>

                <div className="patient-demo-notice">
                  <strong>Prototype Notice</strong>

                  <p>
                    This is an academic project prototype.
                    Submitted information is for demonstration
                    purposes and is not connected to a real
                    healthcare or donor registry.
                  </p>
                </div>

                <div className="patient-form-actions">
                  <button
                    type="button"
                    className="patient-back-btn"
                    onClick={handleBack}
                    disabled={submitting}
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    className="patient-primary-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                    <span>✓</span>
                  </button>
                </div>

              </div>
            )}

          </form>

        </div>
      </section>

      {/* PROCESS */}
      <section className="patient-process-section">
        <div className="patient-process-inner">

          <div className="patient-process-heading">
            <span className="patient-eyebrow">AFTER SUBMISSION</span>

            <h2>
              What happens
              <br />
              next?
            </h2>
          </div>

          <div className="patient-process-list">

            <div className="patient-process-item">
              <span>01</span>
              <div>
                <strong>Request Review</strong>
                <p>
                  Patient information and support requirements
                  can be reviewed by the responsible team.
                </p>
              </div>
            </div>

            <div className="patient-process-item">
              <span>02</span>
              <div>
                <strong>HLA-Based Matching</strong>
                <p>
                  Where donor search is requested, HLA
                  information can be used as part of the
                  matching workflow.
                </p>
              </div>
            </div>

            <div className="patient-process-item">
              <span>03</span>
              <div>
                <strong>Support & Assistance</strong>
                <p>
                  Relevant patient-support resources can be
                  connected according to the request.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}

export default PatientSupport;