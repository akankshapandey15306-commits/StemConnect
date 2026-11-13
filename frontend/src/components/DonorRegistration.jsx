import { useState } from "react";

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
const isValidPin = (value) => /^[1-9]\d{5}$/.test(value);
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getAge = (dateString) => {
  const birth = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

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

const todayString = () => new Date().toISOString().split("T")[0];

/* Eligibility ke 5 sawal (step 1 se 5) */
const QUESTIONS = [
  {
    key: "healthy",
    title: "Are you generally healthy?",
    text: "Potential donors should be in generally good health. Final eligibility is determined through appropriate medical screening.",
    yes: "I am generally healthy",
    no: "I have a health concern",
    proceedOn: "yes",
    continueLabel: "Continue",
    noticeTitle: "Thank you for your response.",
    noticeText: "Some health conditions may affect donor eligibility.",
  },
  {
    key: "age",
    title: "Are you between 18 and 50 years old?",
    text: "For this registration flow, the eligible age range is 18–50 years.",
    yes: "I am between 18 and 50 years old",
    no: "I am outside this age range",
    proceedOn: "yes",
    continueLabel: "Continue",
    noticeTitle: "You may not meet this registration requirement.",
    noticeText: "The current eligibility flow uses an 18–50 year age range.",
  },
  {
    key: "india",
    title: "Do you live in India?",
    text: "This question helps us understand whether this registration flow is applicable to you.",
    yes: "I currently live in India",
    no: "I currently live outside India",
    proceedOn: "yes",
    continueLabel: "Continue",
    noticeTitle: "This registration flow is designed for donors living in India.",
    noticeText: "Registration requirements can vary between donor registries and locations.",
  },
  {
    key: "registered",
    title: "Are you already registered with another stem cell donor registry?",
    text: "Please let us know if you have already joined another blood stem cell donor registry.",
    yes: "I am already registered",
    no: "I have not registered elsewhere",
    proceedOn: "no",
    continueLabel: "Continue",
    noticeTitle: "You may not need to register again.",
    noticeText: "Please check with the applicable donor registry before creating another registration.",
  },
  {
    key: "condition",
    title: "Have you been diagnosed with cancer, HIV, or a bleeding disorder?",
    text: "Please answer based on your current medical history. Final donor eligibility is determined through medical screening.",
    yes: "One of these conditions applies to me",
    no: "None of these apply to me",
    proceedOn: "no",
    continueLabel: "Continue to Registration",
    noticeTitle: "Further eligibility assessment may be required.",
    noticeText: "Certain medical conditions can affect donor eligibility. A qualified medical team must make the final determination.",
  },
];

function DonorRegistration() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [answers, setAnswers] = useState({
    healthy: "",
    age: "",
    india: "",
    registered: "",
    condition: "",
  });

  const [personalDetails, setPersonalDetails] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    availability: "",
    consent: false,
    hlaType: "",
  });

  const handleAnswer = (name, value) => {
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonalChange = (e) => {
    const { name, value, checked, type } = e.target;

    let newValue = type === "checkbox" ? checked : value;
    if (name === "mobile") newValue = onlyDigits(value, 10);
    if (name === "pinCode") newValue = onlyDigits(value, 6);

    setPersonalDetails((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validatePersonalDetails = () => {
    const d = personalDetails;
    const newErrors = {};

    if (d.fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!d.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required.";
    } else {
      const age = getAge(d.dateOfBirth);
      if (age < 18 || age > 50) {
        newErrors.dateOfBirth = "Donor age must be between 18 and 50 years.";
      }
    }

    if (!d.gender) newErrors.gender = "Please select gender.";

    if (!isValidEmail(d.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!isValidMobile(d.mobile)) {
      newErrors.mobile =
        "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.";
    }

    if (d.address.trim().length < 5) {
      newErrors.address = "Please enter your complete address.";
    }

    if (!d.city.trim()) newErrors.city = "City is required.";

    if (!ALL_STATES.includes(d.state)) {
      newErrors.state = "Please select a state or union territory.";
    }

    if (!isValidPin(d.pinCode)) {
      newErrors.pinCode = "Enter a valid 6-digit PIN code.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerDonor = async () => {
    const payload = {
      full_name: personalDetails.fullName.trim(),
      date_of_birth: personalDetails.dateOfBirth,
      gender: personalDetails.gender,
      email: personalDetails.email.trim(),
      mobile: personalDetails.mobile,
      address: personalDetails.address.trim(),
      city: personalDetails.city.trim(),
      state: personalDetails.state,
      pin_code: personalDetails.pinCode,
      hla_type: personalDetails.hlaType || null,

      healthy: answers.healthy,
      registered_elsewhere: answers.registered,
      medical_condition: answers.condition,

      availability: personalDetails.availability,
      consent: personalDetails.consent,
    };

    const response = await fetch(`${API_URL}/api/donors/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, "Donor registration failed")
      );
    }

    return await response.json();
  };

  const handleContinue = async () => {
    /* Steps 1 se 5: eligibility */
    if (step >= 1 && step <= 5) {
      const q = QUESTIONS[step - 1];
      if (answers[q.key] === q.proceedOn) setStep(step + 1);
      return;
    }

    if (step === 6) {
      if (validatePersonalDetails()) setStep(7);
      return;
    }

    if (step === 7) {
      setStep(8);
      return;
    }

    if (step === 8) {
      if (!personalDetails.availability) {
        alert("Please select your availability status.");
        return;
      }

      if (!personalDetails.consent) {
        alert("Please provide your consent to continue.");
        return;
      }

      setSubmitting(true);
      try {
        await registerDonor();
        setStep(9);
      } catch (error) {
        console.error("Donor registration error:", error);
        alert(error.message || "Registration failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const getProgress = () => {
    return Array.from({ length: 9 }, (_, index) => (
      <span key={index} className={index < step ? "active" : ""}></span>
    ));
  };

  const fieldError = (name) =>
    errors[name] ? <small className="field-error">{errors[name]}</small> : null;

  return (
    <main className="donor-registration">
      <section className="donor-check-section">
        <div className="donor-check-container">

          {/* HEADER */}
          <span className="donor-check-label">BECOME A DONOR</span>

          <h1 className="donor-check-title">
            {step <= 5 ? "Check your eligibility" : "Your donor profile"}
          </h1>

          <p className="donor-check-subtitle">
            {step <= 5
              ? "Before you register, let's check a few basic eligibility questions."
              : "Tell us a little about yourself to continue your donor registration."}
          </p>

          {/* CARD */}
          <div className="donor-question-card">

            {/* TOP */}
            <div className="donor-question-top">
              <span>{String(step).padStart(2, "0")}</span>
              <span>{step <= 5 ? "ELIGIBILITY" : "REGISTRATION"}</span>
            </div>

            {/* STEPS 1-5: ELIGIBILITY */}
            {QUESTIONS.map(
              (q, index) =>
                step === index + 1 && (
                  <div className="donor-question-content" key={q.key}>
                    <h2>{q.title}</h2>
                    <p>{q.text}</p>

                    <div className="donor-answer-list">
                      {["yes", "no"].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`donor-answer ${
                            answers[q.key] === value ? "selected" : ""
                          }`}
                          onClick={() => handleAnswer(q.key, value)}
                        >
                          <span className="donor-answer-radio">
                            {answers[q.key] === value ? "✓" : ""}
                          </span>

                          <span className="donor-answer-text">
                            <strong>{value === "yes" ? "Yes" : "No"}</strong>
                            <small>{q[value]}</small>
                          </span>

                          <span className="donor-answer-arrow">→</span>
                        </button>
                      ))}
                    </div>

                    {answers[q.key] === q.proceedOn && (
                      <button
                        type="button"
                        className="donor-continue-btn"
                        onClick={handleContinue}
                      >
                        {q.continueLabel}
                        <span>→</span>
                      </button>
                    )}

                    {answers[q.key] && answers[q.key] !== q.proceedOn && (
                      <div className="donor-info-message">
                        <strong>{q.noticeTitle}</strong>
                        <p>{q.noticeText}</p>
                      </div>
                    )}

                    {step > 1 && (
                      <button
                        type="button"
                        className="donor-back-btn"
                        onClick={handleBack}
                      >
                        ← Back
                      </button>
                    )}
                  </div>
                )
            )}

            {/* STEP 6: PERSONAL DETAILS */}
            {step === 6 && (
              <div className="donor-form-content">

                <div className="donor-form-heading">
                  <h2>Tell us about yourself</h2>
                  <p>
                    These details will be used to create your
                    potential donor profile.
                  </p>
                </div>

                <div className="donor-form-grid">

                  {/* FULL NAME */}
                  <div className="donor-field donor-field-full">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={personalDetails.fullName}
                      onChange={handlePersonalChange}
                    />
                    {fieldError("fullName")}
                  </div>

                  {/* DOB */}
                  <div className="donor-field">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      max={todayString()}
                      value={personalDetails.dateOfBirth}
                      onChange={handlePersonalChange}
                    />
                    {fieldError("dateOfBirth")}
                  </div>

                  {/* GENDER */}
                  <div className="donor-field">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={personalDetails.gender}
                      onChange={handlePersonalChange}
                    >
                      <option value="">Select gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {fieldError("gender")}
                  </div>

                  {/* EMAIL */}
                  <div className="donor-field">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={personalDetails.email}
                      onChange={handlePersonalChange}
                    />
                    {fieldError("email")}
                  </div>

                  {/* MOBILE */}
                  <div className="donor-field">
                    <label htmlFor="mobile">Mobile Number</label>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={personalDetails.mobile}
                      onChange={handlePersonalChange}
                    />
                    {fieldError("mobile")}
                  </div>

                  {/* ADDRESS */}
                  <div className="donor-field donor-field-full">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      placeholder="Enter your complete address"
                      value={personalDetails.address}
                      onChange={handlePersonalChange}
                    ></textarea>
                    {fieldError("address")}
                  </div>

                  {/* CITY */}
                  <div className="donor-field">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Enter city"
                      value={personalDetails.city}
                      onChange={handlePersonalChange}
                    />
                    {fieldError("city")}
                  </div>

                  {/* STATE */}
                  <div className="donor-field">
                    <label htmlFor="state">State / Union Territory</label>
                    <select
                      id="state"
                      name="state"
                      value={personalDetails.state}
                      onChange={handlePersonalChange}
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

                  {/* PIN */}
                  <div className="donor-field">
                    <label htmlFor="pinCode">PIN Code</label>
                    <input
                      id="pinCode"
                      name="pinCode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-digit PIN"
                      value={personalDetails.pinCode}
                      onChange={handlePersonalChange}
                    />
                    {fieldError("pinCode")}
                  </div>

                  {/* HLA TYPE */}
                  <div className="donor-field donor-field-full">
                    <label htmlFor="hlaType">HLA Type</label>
                    <input
                      id="hlaType"
                      name="hlaType"
                      type="text"
                      placeholder="Enter HLA type if available"
                      value={personalDetails.hlaType}
                      onChange={handlePersonalChange}
                    />
                    <small>
                      Optional for this demo. Use fictional sample data.
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  className="donor-continue-btn"
                  onClick={handleContinue}
                >
                  Continue to Review
                  <span>→</span>
                </button>

                <button
                  type="button"
                  className="donor-back-btn"
                  onClick={handleBack}
                >
                  ← Back
                </button>
              </div>
            )}

            {/* STEP 7: REVIEW */}
            {step === 7 && (
              <div className="donor-question-content">

                <h2>Review your information</h2>

                <p>
                  Please review the details below before we
                  move to the final registration step.
                </p>

                <div className="donor-review-list">
                  <div className="donor-review-item">
                    <span>Full Name</span>
                    <strong>{personalDetails.fullName}</strong>
                  </div>

                  <div className="donor-review-item">
                    <span>Date of Birth</span>
                    <strong>{personalDetails.dateOfBirth}</strong>
                  </div>

                  <div className="donor-review-item">
                    <span>Gender</span>
                    <strong>{personalDetails.gender}</strong>
                  </div>

                  <div className="donor-review-item">
                    <span>Email</span>
                    <strong>{personalDetails.email}</strong>
                  </div>

                  <div className="donor-review-item">
                    <span>Mobile</span>
                    <strong>{personalDetails.mobile}</strong>
                  </div>

                  <div className="donor-review-item">
                    <span>Location</span>
                    <strong>
                      {personalDetails.city}, {personalDetails.state}
                    </strong>
                  </div>

                  <div className="donor-review-item">
                    <span>HLA Type</span>
                    <strong>{personalDetails.hlaType || "Not provided"}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="donor-continue-btn"
                  onClick={handleContinue}
                >
                  Continue to Consent
                  <span>→</span>
                </button>

                <button
                  type="button"
                  className="donor-back-btn"
                  onClick={handleBack}
                >
                  ← Edit Details
                </button>
              </div>
            )}

            {/* STEP 8: AVAILABILITY & CONSENT */}
            {step === 8 && (
              <div className="donor-form-content">

                <div className="donor-form-heading">
                  <h2>One final step</h2>
                  <p>
                    Tell us your current availability and confirm
                    your consent to continue with donor registration.
                  </p>
                </div>

                <div className="donor-availability-section">
                  <h3>What is your current donor availability?</h3>

                  <div className="donor-answer-list">
                    <button
                      type="button"
                      className={`donor-answer ${
                        personalDetails.availability === "available" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setPersonalDetails((prev) => ({
                          ...prev,
                          availability: "available",
                        }))
                      }
                    >
                      <span className="donor-answer-radio">
                        {personalDetails.availability === "available" ? "✓" : ""}
                      </span>

                      <span className="donor-answer-text">
                        <strong>Available</strong>
                        <small>I am currently available as a potential donor</small>
                      </span>

                      <span className="donor-answer-arrow">→</span>
                    </button>

                    <button
                      type="button"
                      className={`donor-answer ${
                        personalDetails.availability === "not-available" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setPersonalDetails((prev) => ({
                          ...prev,
                          availability: "not-available",
                        }))
                      }
                    >
                      <span className="donor-answer-radio">
                        {personalDetails.availability === "not-available" ? "✓" : ""}
                      </span>

                      <span className="donor-answer-text">
                        <strong>Not available right now</strong>
                        <small>I may update my availability later</small>
                      </span>

                      <span className="donor-answer-arrow">→</span>
                    </button>
                  </div>
                </div>

                {/* CONSENT */}
                <div className="donor-consent-box">
                  <label className="donor-consent-label">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={personalDetails.consent}
                      onChange={handlePersonalChange}
                    />

                    <span>
                      I confirm that the information provided by me is
                      accurate to the best of my knowledge, and I consent
                      to continue with my potential donor registration.
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  className="donor-continue-btn"
                  onClick={handleContinue}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Complete Registration"}
                  <span>→</span>
                </button>

                <button
                  type="button"
                  className="donor-back-btn"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  ← Back
                </button>
              </div>
            )}

            {/* STEP 9: SUCCESS */}
            {step === 9 && (
              <div className="donor-success-content">

                <div className="donor-success-icon">✓</div>

                <span className="donor-success-label">
                  REGISTRATION COMPLETE
                </span>

                <h2>
                  Thank you for
                  <br />
                  taking the first step.
                </h2>

                <p>
                  Your donor registration details have been recorded.
                  Your information can now be considered as part of the
                  donor support and matching process.
                </p>

                <div className="donor-success-card">
                  <div>
                    <span>REGISTRATION STATUS</span>
                    <strong>Completed</strong>
                  </div>

                  <div>
                    <span>DONOR AVAILABILITY</span>
                    <strong>
                      {personalDetails.availability === "available"
                        ? "Available"
                        : "Not available right now"}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="donor-success-btn"
                  onClick={() => (window.location.href = "/")}
                >
                  Return to Home
                  <span>→</span>
                </button>

                <p className="donor-success-note">
                  Your registration is only the beginning of the donor journey.
                  Further steps may be required as part of the donor process.
                </p>
              </div>
            )}

            {/* FOOTER */}
            <div className="donor-question-footer">
              <span>{String(step).padStart(2, "0")} / 09</span>
              <div className="donor-progress">{getProgress()}</div>
              <span>09</span>
            </div>

          </div>

          <p className="donor-check-note">
            Registration as a potential donor does not mean that
            you will automatically be asked to donate.
          </p>

        </div>
      </section>
    </main>
  );
}

export default DonorRegistration;