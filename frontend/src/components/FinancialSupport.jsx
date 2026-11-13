import { useEffect, useState } from "react";

function FinancialSupport() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [amount, setAmount] = useState("");

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/financial-support/campaigns")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load campaigns");
        }
        return response.json();
      })
      .then((data) => setCampaigns(data))
      .catch((error) => {
        console.error("Campaign loading error:", error);
        alert("Campaigns load nahi ho paaye. Backend check karo.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSupport = (campaign) => {
    setSelectedCampaign(campaign);
    setAmount("");
  };


  const handleContribution = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid contribution amount.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/financial-support/donations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            campaign_id: selectedCampaign.id,
            amount: Number(amount),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Donation request failed.");
      }

      console.log("Donation record created:", data);

      setSelectedCampaign(null);
      setAmount("");
    } catch (error) {
      console.error("Donation error:", error);
      alert(error.message || "Could not create donation record.");
    }
  };


  return (
    <main className="financial-page">

      {/* HERO */}
      <section className="financial-hero">
        <div className="financial-hero-inner">
          <div className="financial-hero-content">
            <span className="financial-eyebrow">
              FINANCIAL SUPPORT
            </span>

            <h1>
              Your support can
              <br />
              <span>help someone continue.</span>
            </h1>

            <p>
              Support fundraising campaigns created for treatment-related
              assistance and contribute towards a patient's care journey.
            </p>

            <a
              href="#campaigns"
              className="financial-primary-btn"
            >
              Explore Campaigns
              <span>→</span>
            </a>
          </div>

          <div className="financial-hero-visual">
            <div className="financial-visual-number">
              <span>SUPPORT</span>
              <strong>01</strong>
            </div>

            <div className="financial-visual-content">
              <div className="financial-plus">+</div>

              <p>
                Every contribution
                <br />
                becomes part of a
                <br />
                patient's support journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CAMPAIGNS */}
      <section
        className="financial-campaign-section"
        id="campaigns"
      >
        <div className="financial-section-heading">
          <div>
            <span className="financial-eyebrow">
              SUPPORT CAMPAIGNS
            </span>

            <h2>
              Choose a campaign
              <br />
              to support.
            </h2>
          </div>

          <p>
            Explore active fundraising campaigns and choose where
            you would like your contribution to go.
          </p>
        </div>

        <div className="financial-campaign-grid">
          {loading && <p>Loading campaigns...</p>}

          {!loading && campaigns.length === 0 && (
            <p>No active campaigns available yet.</p>
          )}
          {campaigns.map((campaign) => {
            const progress =
              campaign.goal_amount > 0
                ? Math.min(
                  (campaign.raised_amount / campaign.goal_amount) * 100,
                  100
                )
                : 0;

            return (
              <article
                className="financial-campaign-card"
                key={campaign.id}
              >
                {campaign.patient_photo_url && (
                  <img
                    src={`http://127.0.0.1:8000${campaign.patient_photo_url}`}
                    alt={`Photo for ${campaign.patient_name || "patient campaign"}`}
                    className="financial-patient-photo"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}

                {campaign.patient_name && (
                  <p className="financial-patient-name">
                    Patient: {campaign.patient_name}
                  </p>
                )}
                <div className="financial-campaign-top">
                  <span>CAMPAIGN 0{campaign.id}</span>
                  <span>SUPPORT</span>
                </div>

                <h3>{campaign.title}</h3>

                <p>{campaign.description}</p>

                <div className="financial-progress">
                  <div className="financial-progress-track">
                    <span
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="financial-campaign-stats">
                  <div>
                    <small>RAISED</small>
                    <strong>
                      ₹{campaign.raised_amount.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <small>GOAL</small>
                    <strong>
                      ₹{campaign.goal_amount.toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="financial-support-btn"
                  onClick={() => handleSupport(campaign)}
                >
                  Support This Campaign
                  <span>→</span>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* CONTRIBUTION */}
      {selectedCampaign && (
        <section className="financial-contribution-section">
          <div className="financial-contribution-inner">

            <div className="financial-contribution-copy">
              <span className="financial-eyebrow">
                MAKE A CONTRIBUTION
              </span>

              <h2>
                Support
                <br />
                {selectedCampaign.title}
              </h2>

              <p>
                Select the amount you would like to contribute
                towards this campaign.
              </p>
            </div>

            <div className="financial-contribution-card">

              <div className="financial-amount-options">
                {[500, 1000, 2000, 5000].map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={
                      Number(amount) === value
                        ? "financial-amount-btn selected"
                        : "financial-amount-btn"
                    }
                    onClick={() => setAmount(value)}
                  >
                    ₹{value.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              <div className="financial-custom-amount">
                <label htmlFor="contributionAmount">
                  OR ENTER AMOUNT
                </label>

                <div className="financial-input-wrapper">
                  <span>₹</span>

                  <input
                    id="contributionAmount"
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="financial-total">
                <span>Your contribution</span>

                <strong>
                  ₹
                  {amount
                    ? Number(amount).toLocaleString("en-IN")
                    : "0"}
                </strong>
              </div>

              <button
                type="button"
                className="financial-continue-btn"
                onClick={handleContribution}
              >
                Continue
                <span>→</span>
              </button>

              <p className="financial-demo-note">
                This is a prototype contribution flow.
                Online payment integration can be connected
                during the backend/payment integration phase.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CONTRIBUTION TRACKING */}
      <section className="financial-tracking-section">
        <div className="financial-tracking-inner">

          <div>
            <span className="financial-eyebrow">
              CONTRIBUTION TRACKING
            </span>

            <h2>
              Follow the progress
              <br />
              of financial support.
            </h2>
          </div>

          <div className="financial-tracking-copy">
            <p>
              Campaign progress can reflect the contributions
              received through the platform.
            </p>

            <div className="financial-tracking-line">
              <span />
            </div>

            <div className="financial-tracking-labels">
              <span>Campaign progress</span>
              <strong>Prototype</strong>
            </div>
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="financial-final-cta">
        <div className="financial-final-inner">
          <div>
            <span className="financial-eyebrow">
              MAKE A DIFFERENCE
            </span>

            <h2>
              Support can start
              <br />
              with one contribution.
            </h2>
          </div>

          <a
            href="#campaigns"
            className="financial-final-btn"
          >
            View Campaigns
            <span>↗</span>
          </a>
        </div>
      </section>

    </main>
  );
}

export default FinancialSupport;