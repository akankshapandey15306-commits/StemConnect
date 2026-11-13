import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [donorCount, setDonorCount] = useState(0);
  const [donors, setDonors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [matchedDonors, setMatchedDonors] = useState([]);
  const [matchedPatients, setMatchedPatients] = useState([]);
  const [patientCount, setPatientCount] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchingError, setMatchingError] = useState("");
  const [matchingMessage, setMatchingMessage] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [eligiblePatients, setEligiblePatients] = useState([]);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignError, setCampaignError] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");

  const [campaignForm, setCampaignForm] = useState({
    patient_id: "",
    title: "",
    description: "",
    goal_amount: "",
  });

  const [patientPhoto, setPatientPhoto] = useState("");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const availabilityData = [
    {
      name: "Available",
      value: donors.filter(
        (d) => String(d.availability).toLowerCase() === "available"
      ).length,
    },
    {
      name: "Other status",
      value: donors.filter(
        (d) => String(d.availability).toLowerCase() !== "available"
      ).length,
    },
  ];

  const registrationData = [
    { name: "Donors", total: donorCount },
    { name: "Patients", total: patientCount },
  ];

  const matchReviewData = [
    {
      name: "Pending",
      total: matches.filter((m) =>
        String(m.status || "").toUpperCase().includes("PENDING")
      ).length,
    },
    {
      name: "Reviewed",
      total: matches.filter(
        (m) => !String(m.status || "").toUpperCase().includes("PENDING")
      ).length,
    },
  ];


  useEffect(() => {
    if (!isLoggedIn || activeSection !== "campaigns") return;

    setCampaignError("");
    fetchEligiblePatients();
    fetchCampaigns();
  }, [isLoggedIn, activeSection]);



  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchDonors = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/donors/"
        );

        if (!response.ok) {
          throw new Error(`Donors API error: ${response.status}`);
        }

        const data = await response.json();

        console.log("DONORS API DATA:", data);

        setDonors(data);
        setDonorCount(data.length);
      } catch (error) {
        console.error("DONORS FETCH FAILED:", error);
      }
    };

    fetchDonors();
  }, [isLoggedIn]);




  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchPatients = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/patients/"
        );

        if (!response.ok) {
          throw new Error(`Patients API error: ${response.status}`);
        }

        const data = await response.json();

        console.log("PATIENTS API DATA:", data);

        setPatients(data);
        setPatientCount(data.length);
      } catch (error) {
        console.error("PATIENTS FETCH FAILED:", error);
      }
    };

    fetchPatients();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || activeSection !== "analytics") return;

    const fetchAnalyticsData = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError("");

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/financial-support/campaigns"
        );

        if (!response.ok) {
          throw new Error("Could not load financial support data.");
        }

        const data = await response.json();
        setCampaigns(Array.isArray(data) ? data : []);
      } catch (error) {
        setAnalyticsError(error.message);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [isLoggedIn, activeSection]);




  const fetchMatchedRecords = async () => {
    try {
      const [donorsResponse, patientsResponse] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/donors/matched"),
        fetch("http://127.0.0.1:8000/api/patients/matched"),
      ]);

      if (!donorsResponse.ok || !patientsResponse.ok) {
        throw new Error("Could not load matched records.");
      }

      const donorsData = await donorsResponse.json();
      const patientsData = await patientsResponse.json();

      setMatchedDonors(donorsData);
      setMatchedPatients(patientsData);

      console.log("MATCHED DONORS:", donorsData);
      console.log("MATCHED PATIENTS:", patientsData);

    } catch (error) {
      console.error("MATCHED RECORDS FETCH FAILED:", error);
    }
  };
  useEffect(() => {
    if (isLoggedIn) {
      fetchMatches();
      fetchMatchedRecords();
    }
  }, [isLoggedIn])


  const fetchMatches = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/patients/potential-matches"
      );

      if (!response.ok) {
        throw new Error("Could not load potential matches.");
      }

      const data = await response.json();
      setMatches(data);
    } catch (error) {
      setMatchingError(error.message);
    }
  };


  const fetchEligiblePatients = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/financial-support/eligible-patients"
      );

      if (!response.ok) {
        throw new Error("Could not load eligible patients.");
      }

      const data = await response.json();
      setEligiblePatients(Array.isArray(data) ? data : []);
    } catch (error) {
      setCampaignError(error.message);
    }
  };

  const handleCampaignChange = (e) => {
    const { name, value } = e.target;

    setCampaignForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "patient_id") {
      const selectedPatient = eligiblePatients.find(
        (patient) => String(patient.id) === value
      );

      if (
        selectedPatient &&
        selectedPatient.photo_consent &&
        selectedPatient.profile_image
      ) {
        setPatientPhoto(selectedPatient.profile_image);
      } else {
        setPatientPhoto("");
      }
    }
  };


  const createCampaign = async (e) => {
    e.preventDefault();

    setCampaignLoading(true);
    setCampaignError("");
    setCampaignMessage("");

    if (!campaignForm.patient_id || !patientPhoto) {
      setCampaignError(
        "Selected patient must have a registered photo and photo consent."
      );
      setCampaignLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("patient_id", campaignForm.patient_id);
      formData.append("title", campaignForm.title);
      formData.append("description", campaignForm.description);
      formData.append("goal_amount", campaignForm.goal_amount);

      const response = await fetch(
        "http://127.0.0.1:8000/api/financial-support/campaigns",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Campaign creation failed."
        );
      }

      setCampaignMessage("Campaign created successfully!");

      setCampaignForm({
        patient_id: "",
        title: "",
        description: "",
        goal_amount: "",
      });

      setPatientPhoto("");

      await fetchCampaigns();
      await fetchEligiblePatients();

    } catch (error) {
      setCampaignError(error.message);
    } finally {
      setCampaignLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/financial-support/campaigns"
      );

      if (!response.ok) {
        throw new Error("Could not load campaigns.");
      }

      const data = await response.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (error) {
      setCampaignError(error.message);
    }
  };


  const deleteCampaign = async (campaignId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this campaign?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/financial-support/campaigns/${campaignId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Campaign deletion failed.");
      }

      setCampaignMessage("Campaign deleted successfully.");
      await fetchCampaigns();

    } catch (error) {
      setCampaignError(error.message);
    }
  };


  const deleteDonor = async (donorId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this donor?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/donors/${donorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Donor deletion failed.");
      }

      setDonors((prev) => prev.filter((donor) => donor.id !== donorId));
      setDonorCount((prev) => Math.max(0, prev - 1));

      alert("Donor deleted successfully.");
    } catch (error) {
      alert(error.message);
    }
  };

  const deletePatient = async (patientId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/patients/${patientId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Patient deletion failed.");
      }

      setPatients((prev) =>
        prev.filter((patient) => patient.id !== patientId)
      );
      setPatientCount((prev) => Math.max(0, prev - 1));

      setSelectedPatient((prev) =>
        prev?.id === patientId ? null : prev
      );

      alert("Patient deleted successfully.");
    } catch (error) {
      alert(error.message);
    }
  };





  const runMatching = async () => {
    setMatchingLoading(true);
    setMatchingError("");
    setMatchingMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/patients/run-matching",
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Matching failed. Please try again."
        );
      }

      setMatchingMessage(
        data.created_count > 0
          ? `${data.created_count} new potential match(es) created.`
          : "No new potential matches found. Existing matches are shown below."
      );

      // Refresh donor records
      const donorsResponse = await fetch(
        "http://127.0.0.1:8000/api/donors/"
      );

      if (!donorsResponse.ok) {
        throw new Error("Could not refresh donors.");
      }

      const donorsData = await donorsResponse.json();
      setDonors(donorsData);
      setDonorCount(donorsData.length);

      // Refresh patient records
      const patientsResponse = await fetch(
        "http://127.0.0.1:8000/api/patients/"
      );

      if (!patientsResponse.ok) {
        throw new Error("Could not refresh patients.");
      }

      const patientsData = await patientsResponse.json();
      setPatients(patientsData);
      setPatientCount(patientsData.length);

      // Refresh matching records
      await fetchMatches();
      await fetchMatchedRecords();
    } catch (error) {
      setMatchingError(error.message);
    } finally {
      setMatchingLoading(false);
    }
  };



  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams();
      formData.append("username", loginData.email);
      formData.append("password", loginData.password);

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        setIsLoggedIn(false);
        alert("Invalid admin email or password.");
        return;
      }

      const data = await response.json();

      // Keep the token in memory for this page session.
      setAdminToken(data.access_token);
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
      alert("Backend se connect nahi ho paaya. Server check karo.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);

    setLoginData({
      email: "",
      password: "",
    });
  };

  /* =========================
     ADMIN LOGIN
  ========================= */

  if (!isLoggedIn) {
    return (
      <main className="admin-page">
        <section className="admin-login-section">
          <div className="admin-login-card">

            <div className="admin-login-header">
              <div className="admin-icon">🛡️</div>

              <span className="admin-eyebrow">
                ADMIN PORTAL
              </span>

              <h1>
                Welcome back,
                <br />
                <span>Administrator.</span>
              </h1>

              <p>
                Sign in to manage donors, patients, HLA matching,
                and platform analytics.
              </p>
            </div>

            <form
              className="admin-login-form"
              onSubmit={handleLogin}
            >
              <div className="admin-form-field">
                <label htmlFor="adminEmail">
                  Email Address
                </label>

                <input
                  id="adminEmail"
                  name="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={loginData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="adminPassword">
                  Password
                </label>

                <input
                  id="adminPassword"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={loginData.password}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="admin-login-btn"
              >
                Sign In
                <span>→</span>
              </button>
            </form>

            <p className="admin-login-note">
              Admin authentication will be securely connected
              through the backend during the integration phase.
            </p>

          </div>
        </section>
      </main>
    );
  }

  /* =========================
     ADMIN DASHBOARD
  ========================= */

  return (
    <main className="admin-dashboard-page">


      <aside className="admin-sidebar">

        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-icon">🧬</div>

          <div>
            <strong>StemConnect</strong>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">

          <button
            className={`admin-nav-item ${activeSection === "dashboard" ? "active" : ""
              }`}
            onClick={() => setActiveSection("dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className={`admin-nav-item ${activeSection === "donors" ? "active" : ""
              }`}
            onClick={() => setActiveSection("donors")}
          >
            <span>♙</span>
            Donor Management
          </button>
          <button
            className={`admin-nav-item ${activeSection === "patients" ? "active" : ""
              }`}
            onClick={() => setActiveSection("patients")}
          >
            <span>♧</span>
            Patient Management
          </button>

          <button
            className={`admin-nav-item ${activeSection === "matchedDonors" ? "active" : ""
              }`}
            onClick={() => setActiveSection("matchedDonors")}
          >
            <span>♙</span>
            Matched Donors
          </button>

          <button
            className={`admin-nav-item ${activeSection === "matchedPatients" ? "active" : ""
              }`}
            onClick={() => setActiveSection("matchedPatients")}
          >
            <span>♧</span>
            Matched Patients
          </button>


          <button
            className={`admin-nav-item ${activeSection === "matching" ? "active" : ""
              }`}
            onClick={() => setActiveSection("matching")}
          >
            <span>🧬</span>
            HLA Matching
          </button>

          <button
            className={`admin-nav-item ${activeSection === "analytics" ? "active" : ""
              }`}
            onClick={() => setActiveSection("analytics")}
          >
            <span>▥</span>
            Analytics
          </button>

          <button
            className={`admin-nav-item ${activeSection === "campaigns" ? "active" : ""
              }`}
            onClick={() => setActiveSection("campaigns")}
          >
            <span>♡</span>
            Campaign Management
          </button>

        </nav>

        <button
          type="button"
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          Logout
          <span>↗</span>
        </button>

      </aside>

      {activeSection === "dashboard" && (
        <section className="admin-dashboard-content">

          <div className="admin-dashboard-header">
            <div>
              <span className="admin-eyebrow">
                ADMIN DASHBOARD
              </span>

              <h1>
                Platform
                <br />
                <span>overview.</span>
              </h1>
            </div>

            <div className="admin-status">
              <span />
              Admin session active
            </div>
          </div>

          <div className="admin-stats-grid">

            <div className="admin-stat-card">
              <span>Total Donors</span>
              <strong>{donorCount}</strong>
              <small>Registered donors</small>
            </div>

            <div className="admin-stat-card">
              <span> Total Patients</span>
              <strong>{patientCount}</strong>
              <small>Support profiles</small>
            </div>

            <div className="admin-stat-card">
              <span>Potential Matches</span>
              <strong>{matches.length}</strong>
              <small>HLA matching records</small>
            </div>

          </div>

          <section className="admin-dashboard-section">

            <div className="admin-section-heading">
              <div>
                <span className="admin-eyebrow">
                  PLATFORM MANAGEMENT
                </span>

                <h2>
                  Manage the
                  <br />
                  platform.
                </h2>
              </div>

              <p>
                Access the major management areas of the
                StemConnect platform.
              </p>
            </div>

            <div className="admin-module-grid">

              <button
                className="admin-module-card"
                onClick={() => setActiveSection("donors")}
              >
                <span className="admin-module-number">
                  01
                </span>

                <strong>Donor Management</strong>

                <p>
                  Manage donor registrations and donor information.
                </p>

                <span className="admin-module-arrow">
                  →
                </span>
              </button>

              <button className="admin-module-card" onClick={() => setActiveSection("patients")}
              >
                <span className="admin-module-number">
                  02
                </span>

                <strong>Patient Support</strong>

                <p>
                  Review patient support requirements and records.
                </p>

                <span className="admin-module-arrow">
                  →
                </span>
              </button>

              <button
                className="admin-module-card"
                onClick={() => setActiveSection("analytics")}
              >
                <span className="admin-module-number">
                  05
                </span>

                <strong>Analytics</strong>

                <p>
                  View platform activity and management insights.
                </p>

                <span className="admin-module-arrow">
                  →
                </span>
              </button>
            </div>

          </section>

          <section className="admin-recent-section">

            <div className="admin-section-heading">
              <div>
                <span className="admin-eyebrow">
                  RECENT ACTIVITY
                </span>

                <h2>
                  Recent
                  <br />
                  registrations.
                </h2>
              </div>
            </div>

            <div className="admin-table">

              <div className="admin-table-row admin-table-header">
                <span>Name</span>
                <span>Email</span>
                <span>City</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {donors.map((donor) => (
                <div
                  className="admin-table-row"
                  key={donor.id}
                >
                  <span>{donor.full_name}</span>
                  <span>{donor.email}</span>
                  <span>{donor.mobile || "Not provided"}</span>
                  <span>{donor.city}</span>
                  <span>{donor.hla_type || "Not provided"}</span>
                  <span className="admin-table-status">
                    {donor.availability}
                  </span>
                  <button
                    type="button"
                    className="campaign-delete-btn"
                    onClick={() => deleteDonor(donor.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}

            </div>

          </section>

        </section>
      )}

      {activeSection === "donors" && (
        <section className="admin-dashboard-content">

          <div className="admin-dashboard-header">
            <div>
              <span className="admin-eyebrow">
                DONOR MANAGEMENT
              </span>

              <h1>
                Donor
                <br />
                <span>management.</span>
              </h1>
            </div>

            <div className="admin-status">
              <span />
              Admin session active
            </div>
          </div>

          <section className="admin-recent-section">

            <div className="admin-section-heading">
              <div>
                <span className="admin-eyebrow">
                  REGISTERED DONORS
                </span>

                <h2>
                  Donor
                  <br />
                  records.
                </h2>
              </div>

              <p>
                View registered donor information from the
                StemConnect platform.
              </p>
            </div>

            <div className="admin-table">

             <div className="admin-table-row admin-table-header donor-table-row matched-donor-table-row">
                <span>Name</span>
                <span>Email</span>
                <span>Phone</span>
                <span>City</span>
                <span>HLA Type</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {donors.map((donor) => {
                const availability = String(
                  donor.availability || ""
                ).toLowerCase();

                const isUnavailable = [
                  "matched",
                  "unavailable",
                  "donated"
                ].includes(availability);

                return (
                  <div
                    className="admin-table-row donor-table-row matched-donor-table-row"
                    key={donor.id}
                  >
                    <div>
                      <strong>{donor.full_name}</strong>

                      {availability === "matched" && (
                        <p className="donor-status-message">
                          Potential patient match found.
                        </p>
                      )}

                      {availability === "donated" && (
                        <p className="donor-status-message">
                          Donation completed. Further matching is disabled.
                        </p>
                      )}
                    </div>

                    <span>{donor.email}</span>
                    <span>{donor.mobile || "Not provided"}</span>
                    <span>{donor.city}</span>
                    <span>{donor.hla_type || "Not provided"}</span>

                    <span className="admin-table-status">
                      {isUnavailable ? "Unavailable" : donor.availability}
                    </span>
                    <button
                      type="button"
                      className="campaign-delete-btn"
                      onClick={() => deleteDonor(donor.id)}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}

            </div>

          </section>

        </section>
      )}

      {activeSection === "patients" && (
        <section className="admin-dashboard-content">
          <div className="admin-dashboard-header">
            <div>
              <span className="admin-eyebrow">
                PATIENT MANAGEMENT
              </span>

              <h1>
                Patient
                <br />
                <span>management.</span>
              </h1>
            </div>

            <div className="admin-status">
              <span />
              Admin session active
            </div>
          </div>

          <section className="admin-recent-section">
            <div className="admin-section-heading">
              <div>
                <span className="admin-eyebrow">
                  REGISTERED PATIENTS
                </span>

                <h2>Patient records.</h2>
              </div>

              <p>
                View patient details and support requests.
              </p>
            </div>

            <div className="admin-table" style={{ overflowX: "auto" }}>
              <div className="admin-table-row admin-table-header patient-table-row">
                <span>Name</span>
                <span>Email</span>
                <span>Diagnosis</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {patients.map((patient) => (
                <div
                  className="admin-table-row patient-table-row"
                  key={patient.id}
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      {patient.full_name}
                    </button>

                    {String(patient.status).toLowerCase() === "matched" && (
                      <p style={{ color: "crimson", fontSize: 12 }}>
                        A potential donor match has been found for you.
                        Further donor matching is not required.
                      </p>
                    )}
                  </div>

                  <span>{patient.email}</span>
                  <span>{patient.diagnosis}</span>

                  <span className="admin-table-status">
                    {["matched", "unavailable"].includes(
                      String(patient.status).toLowerCase()
                    )
                      ? "Unavailable"
                      : patient.status}
                  </span>
                  <button
                    type="button"
                    className="campaign-delete-btn"
                    onClick={() => deletePatient(patient.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}

              {patients.length === 0 && (
                <p>
                  No patient records found yet.
                </p>
              )}
            </div>
          </section>
        </section>
      )}

      {activeSection === "matchedDonors" && (
        <section className="admin-dashboard-content">

          <div className="admin-dashboard-header">
            <div>
              <span className="admin-eyebrow">
                MATCHED DONORS
              </span>

              <h1>
                Matched donor
                <br />
                <span>records.</span>
              </h1>
            </div>

            <div className="admin-status">
              <span />
              Admin session active
            </div>
          </div>

          <section className="admin-recent-section">

            <div className="admin-section-heading">
              <div>
                <span className="admin-eyebrow">
                  DONOR MATCH RECORDS
                </span>

                <h2>Matched donors.</h2>
              </div>

              <p>
                Donors who have an active potential or verified patient match.
              </p>
            </div>

            <div className="admin-table" style={{ overflowX: "auto" }}>

              <div className="admin-table-row admin-table-header donor-table-row">
                <span>Name</span>
                <span>Email</span>
                <span>Phone</span>
                <span>City</span>
                <span>HLA Type</span>
                <span>Status</span>
              </div>

              {matchedDonors.map((donor) => (
                <div
                  className="admin-table-row donor-table-row"
                  key={donor.id}
                >
                  <strong>{donor.full_name}</strong>
                  <span>{donor.email}</span>
                  <span>{donor.mobile || "Not provided"}</span>
                  <span>{donor.city}</span>
                  <span>{donor.hla_type || "Not provided"}</span>
                  <span className="admin-table-status">
                    {donor.availability}
                  </span>
                </div>
              ))}

              {matchedDonors.length === 0 && (
                <p style={{ padding: 16 }}>
                  No matched donors found.
                </p>
              )}

            </div>

          </section>
        </section>
      )}

      {activeSection === "matchedPatients" && (
        <section className="admin-dashboard-content">

          <div className="admin-dashboard-header">
            <div>
              <span className="admin-eyebrow">
                MATCHED PATIENTS
              </span>

              <h1>
                Matched patient
                <br />
                <span>records.</span>
              </h1>
            </div>

            <div className="admin-status">
              <span />
              Admin session active
            </div>
          </div>

          <section className="admin-recent-section">

            <div className="admin-section-heading">
              <div>
                <span className="admin-eyebrow">
                  PATIENT MATCH RECORDS
                </span>

                <h2>Matched patients.</h2>
              </div>

              <p>
                Patients who have an active potential or verified donor match.
              </p>
            </div>

            <div className="admin-table" style={{ overflowX: "auto" }}>

              <div className="admin-table-row admin-table-header patient-table-row">
                <span>Name</span>
                <span>Email</span>
                <span>Diagnosis</span>
                <span>HLA Type</span>
                <span>Status</span>
              </div>

              {matchedPatients.map((patient) => (
                <div
                  className="admin-table-row patient-table-row"
                  key={patient.id}
                >
                  <strong>{patient.full_name}</strong>

                  <span>{patient.email || "Not provided"}</span>

                  <span>{patient.diagnosis || "Not provided"}</span>

                  <span>{patient.hla_type || "Not provided"}</span>

                  <span className="admin-table-status">
                    {patient.status || "Matched"}
                  </span>
                </div>
              ))}

              {matchedPatients.length === 0 && (
                <p style={{ padding: 16 }}>
                  No matched patients found.
                </p>
              )}

            </div>

          </section>
        </section>
      )}



      {activeSection === "matching" && (
        <section className="admin-dashboard-content">
          <div className="admin-dashboard-header">
            <div>
              <span className="admin-eyebrow">DONOR MATCHING</span>
              <h1>
                HLA <span>matching.</span>
              </h1>
              <p>
                Run preliminary screening and review saved potential matches.
              </p>
            </div>
          </div>

          <section className="admin-recent-section">
            <button
              type="button"
              className="admin-login-btn"
              onClick={runMatching}
              disabled={matchingLoading}
            >
              {matchingLoading ? "Matching..." : "Run HLA Matching"}
            </button>

            <button
              type="button"
              onClick={fetchMatches}
              disabled={matchingLoading}
              style={{ marginLeft: 12 }}
            >
              Refresh Results
            </button>

            {matchingError && (
              <p role="alert" style={{ color: "crimson", marginTop: 16 }}>
                {matchingError}
              </p>
            )}

            {matchingMessage && (
              <p role="status" style={{ marginTop: 16 }}>
                {matchingMessage}
              </p>
            )}

            <div
              className="admin-table"
              style={{ marginTop: 24, overflowX: "auto" }}
            >
              <div
                className="admin-table-row admin-table-header"
                style={{ minWidth: 1100 }}
              >
                <span>Match ID</span>
                <span>Patient Details</span>
                <span>Donor Details</span>
                <span>Matched Markers</span>
                <span>Review Status</span>
              </div>

              {matches.map((match) => {
                let loci = [];

                try {
                  loci = Array.isArray(match.matched_loci)
                    ? match.matched_loci
                    : JSON.parse(match.matched_loci || "[]");
                } catch {
                  loci = [];
                }

                return (
                  <div
                    className="admin-table-row"
                    key={match.id}
                    style={{ minWidth: 1100, alignItems: "start" }}
                  >
                    <span>#{match.id}</span>

                    <div>
                      <strong>{match.patient_name || "Not available"}</strong>
                      <p>ID: {match.patient_id}</p>
                      <p>Phone: {match.patient_phone || "Not available"}</p>
                      <p>Email: {match.patient_email || "Not available"}</p>
                    </div>
                    {match.patient_message && (
                      <p style={{ color: "green", fontWeight: "bold", fontSize: 12 }}>
                        {match.patient_message}
                      </p>
                    )}

                    <div>
                      <strong>{match.donor_name || "Not available"}</strong>
                      <p>ID: {match.donor_id}</p>
                      <p>Phone: {match.donor_phone || "Not available"}</p>
                      <p>Email: {match.donor_email || "Not available"}</p>
                    </div>
                    {match.donor_message && (
                      <p style={{ color: "green", fontWeight: "bold", fontSize: 12 }}>
                        {match.donor_message}
                      </p>
                    )}

                    <span>{loci.join(", ") || "Not available"}</span>

                    <div>
                      <strong>{match.clinical_status || "NOT_VERIFIED"}</strong>
                      <p>{match.status || "PENDING_REVIEW"}</p>
                    </div>
                  </div>
                );
              })}

              {matches.length === 0 && (
                <p style={{ padding: 16 }}>
                  No potential matches available yet.
                </p>
              )}
            </div>

            <p style={{ marginTop: 16 }}>
              HLA text comparison is preliminary. Clinical compatibility
              must be confirmed by an authorized clinical professional.
            </p>
          </section>
        </section>
      )}



      {activeSection === "analytics" && (
        <section className="admin-dashboard-content">
          <div className="admin-dashboard-header">
            <div>
              <span className="admin-eyebrow">DATA & INSIGHTS</span>
              <h1>
                Analytics <span>studio.</span>
              </h1>
              <p>Explore registrations, donor availability and match reviews.</p>
            </div>
          </div>

          <div className="admin-analytics-grid">
            <div className="admin-chart-card">
              <span className="admin-eyebrow">REGISTRATION OVERVIEW</span>
              <h2>Donors vs Patients</h2>
              <p>Current registered profiles</p>

              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="total"
                    name="Registered profiles"
                    fill="#5375e2"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-chart-card">
              <span className="admin-eyebrow">DONOR NETWORK</span>
              <h2>Availability breakdown</h2>
              <p>Distribution by saved availability status</p>

              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={availabilityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
                    paddingAngle={4}
                    label
                  >
                    {availabilityData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={["#5375e2", "#e6a45b"][index % 2]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-chart-card admin-chart-wide">
              <span className="admin-eyebrow">MATCH REVIEW</span>
              <h2>Potential match status</h2>
              <p>Saved records grouped by their review status</p>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={matchReviewData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={90} />
                  <Tooltip />
                  <Bar
                    dataKey="total"
                    name="Match records"
                    fill="#25a889"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="admin-analytics-note">
            Charts reflect current API records. HLA matches are preliminary
            and require independent clinical verification.
          </p>
        </section>
      )}

      {activeSection === "campaigns" && (
        <section className="admin-dashboard-content">
          <div className="admin-dashboard-header">
            <div>
              <span className="admin-eyebrow">FINANCIAL SUPPORT</span>
              <h1>
                Campaign <span>management.</span>
              </h1>
              <p>Create campaigns for patients who have requested financial support.</p>
            </div>
          </div>

          <section className="admin-recent-section">
            <div className="admin-section-heading">
              <div>
                <span className="admin-eyebrow">NEW CAMPAIGN</span>
                <h2>Create patient campaign.</h2>
              </div>
            </div>
            <div className="campaign-form-card">

              <form onSubmit={createCampaign} className="admin-campaign-form">
                <label htmlFor="campaignPatient">Select eligible patient</label>

                <select
                  id="campaignPatient"
                  name="patient_id"
                  value={campaignForm.patient_id}
                  onChange={handleCampaignChange}
                  required
                >
                  <option value="">Choose a patient</option>
                  {eligiblePatients.map((patient) => (
                    <option
                      key={patient.id}
                      value={patient.id}
                      disabled={!patient.photo_consent || !patient.profile_image}
                    >
                      {patient.full_name} — {patient.diagnosis}
                      {(!patient.photo_consent || !patient.profile_image)
                        ? " (Photo unavailable)"
                        : ""}
                    </option>
                  ))}
                </select>

                <label htmlFor="campaignTitle">Campaign title</label>
                <input
                  id="campaignTitle"
                  name="title"
                  value={campaignForm.title}
                  onChange={handleCampaignChange}
                  placeholder="Enter campaign title"
                  required
                />

                <label htmlFor="campaignDescription">Description</label>
                <textarea
                  id="campaignDescription"
                  name="description"
                  value={campaignForm.description}
                  onChange={handleCampaignChange}
                  placeholder="Explain the patient's support needs"
                  required
                />

                <label htmlFor="campaignGoal">Goal amount (₹)</label>
                <input
                  id="campaignGoal"
                  name="goal_amount"
                  type="number"
                  min="1"
                  value={campaignForm.goal_amount}
                  onChange={handleCampaignChange}
                  placeholder="Enter target amount"
                  required
                />

                <div className="form-group">
                  <label>Patient Registered Photo</label>

                  {patientPhoto ? (
                    <div>
                      <img
                        src={`http://127.0.0.1:8000${patientPhoto}`}
                        alt="Selected patient"
                        className="admin-campaign-photo"
                      />
                      <p>Registered photo will be used for this campaign.</p>
                    </div>
                  ) : campaignForm.patient_id ? (
                    <p>
                      This patient has no registered photo or has not given photo consent.
                    </p>
                  ) : (
                    <p>Select a patient to see their registered photo.</p>
                  )}
                </div>

                {campaignError && (
                  <p role="alert" style={{ color: "crimson" }}>
                    {campaignError}
                  </p>
                )}

                {campaignMessage && (
                  <p role="status" style={{ color: "green" }}>
                    {campaignMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="admin-login-btn"
                  disabled={campaignLoading}
                >
                  {campaignLoading ? "Creating..." : "Create Campaign"}
                </button>
              </form>
            </div>
          </section>

          <section className="admin-recent-section">
            <div className="admin-section-heading">
              <div>
                <span className="admin-eyebrow">EXISTING CAMPAIGNS</span>

                <h2>Campaign records.</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchCampaigns}
            >
              Refresh Campaigns
            </button>

            {campaigns.map((campaign) => (
              <div key={campaign.id} className="admin-campaign-card">
                {campaign.patient_photo_url && (
                  <img
                    src={`http://127.0.0.1:8000${campaign.patient_photo_url}`}
                    alt="Patient"
                    className="admin-campaign-photo"
                  />
                )}

                <div>
                  <h3>{campaign.title}</h3>
                  <p>Patient: {campaign.patient_name || "Not linked"}</p>
                  <p>{campaign.description}</p>
                  <p>Goal: ₹{Number(campaign.goal_amount).toLocaleString("en-IN")}</p>
                  <p>Raised: ₹{Number(campaign.raised_amount).toLocaleString("en-IN")}</p>
                  <p>
                    Remaining: ₹
                    {Math.max(
                      0,
                      Number(campaign.goal_amount) - Number(campaign.raised_amount)
                    ).toLocaleString("en-IN")}
                  </p>
                  <p>Status: {campaign.status}</p>
                  <button
                    type="button"
                    className="campaign-delete-btn"
                    onClick={() => deleteCampaign(campaign.id)}
                  >
                    Delete Campaign
                  </button>
                </div>
              </div>
            ))}

            {campaigns.length === 0 && <p>No campaigns found.</p>}
          </section>
        </section>
      )}

    </main>
  );
}

export default Admin;