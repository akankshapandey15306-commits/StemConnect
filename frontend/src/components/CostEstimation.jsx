import { useState } from "react";

function CostEstimation() {
  const [formData, setFormData] = useState({
    treatmentType: "",
    hospitalType: "",
    treatmentDuration: "",
  });

  const [estimate, setEstimate] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setEstimate(null);
  };

  const calculateEstimate = () => {
    const { treatmentType, hospitalType, treatmentDuration } = formData;

    if (!treatmentType || !hospitalType || !treatmentDuration) {
      alert("Please select all the required details.");
      return;
    }

    const treatmentCosts = {
      stemCellTransplant: 600000,
      chemotherapy: 250000,
      radiationTherapy: 150000,
    };

    const hospitalMultiplier = {
      government: 0.7,
      private: 1,
    };

    const durationMultiplier = {
      short: 0.8,
      medium: 1,
      long: 1.3,
    };

    const baseCost = treatmentCosts[treatmentType];
    const hospitalFactor = hospitalMultiplier[hospitalType];
    const durationFactor = durationMultiplier[treatmentDuration];

    const estimatedCost = Math.round(
      baseCost * hospitalFactor * durationFactor
    );

    setEstimate(estimatedCost);
  };

  return (
    <main className="cost-page">
      <section className="cost-hero">
        <div className="cost-hero-inner">
          <div className="cost-hero-content">
            <span className="cost-eyebrow">
              COST ESTIMATION
            </span>

            <h1>
              Understand the
              <br />
              <span>estimated treatment cost.</span>
            </h1>

            <p>
              Get a simple estimated cost based on treatment type,
              hospital category, and expected treatment duration.
            </p>
          </div>

          <div className="cost-hero-note">
            <span>ESTIMATE</span>
            <strong>01</strong>
            <p>
              A planning tool to help understand
              possible treatment-related expenses.
            </p>
          </div>
        </div>
      </section>

      <section className="cost-estimator-section">
        <div className="cost-section-heading">
          <span className="cost-eyebrow">
            ESTIMATE YOUR COST
          </span>

          <h2>
            Enter treatment
            <br />
            details.
          </h2>

          <p>
            Select the options below to generate an estimated
            treatment cost.
          </p>
        </div>

        <div className="cost-estimator-card">
          <div className="cost-form-grid">
            <div className="cost-form-field">
              <label htmlFor="treatmentType">
                Treatment Type
              </label>

              <select
                id="treatmentType"
                name="treatmentType"
                value={formData.treatmentType}
                onChange={handleChange}
              >
                <option value="">Select treatment</option>
                <option value="stemCellTransplant">
                  Stem Cell Transplant
                </option>
                <option value="chemotherapy">
                  Chemotherapy
                </option>
                <option value="radiationTherapy">
                  Radiation Therapy
                </option>
              </select>
            </div>

            <div className="cost-form-field">
              <label htmlFor="hospitalType">
                Hospital Type
              </label>

              <select
                id="hospitalType"
                name="hospitalType"
                value={formData.hospitalType}
                onChange={handleChange}
              >
                <option value="">Select hospital type</option>
                <option value="government">
                  Government Hospital
                </option>
                <option value="private">
                  Private Hospital
                </option>
              </select>
            </div>

            <div className="cost-form-field">
              <label htmlFor="treatmentDuration">
                Treatment Duration
              </label>

              <select
                id="treatmentDuration"
                name="treatmentDuration"
                value={formData.treatmentDuration}
                onChange={handleChange}
              >
                <option value="">Select duration</option>
                <option value="short">
                  Short Term
                </option>
                <option value="medium">
                  Medium Term
                </option>
                <option value="long">
                  Long Term
                </option>
              </select>
            </div>
          </div>

          <button
            type="button"
            className="cost-calculate-btn"
            onClick={calculateEstimate}
          >
            Calculate Estimate
            <span>→</span>
          </button>
        </div>
      </section>

      {estimate !== null && (
        <section className="cost-result-section">
          <div className="cost-result-card">
            <div>
              <span className="cost-eyebrow">
                ESTIMATED COST
              </span>

              <h2>
                Approximate treatment
                <br />
                expense.
              </h2>

              <p>
                This estimate is generated from the selected
                treatment details and is intended for planning
                purposes only.
              </p>
            </div>

            <div className="cost-result-value">
              <span>ESTIMATED AMOUNT</span>

              <strong>
                ₹{estimate.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </section>
      )}

      <section className="cost-disclaimer">
        <div>
          <span className="cost-eyebrow">
            IMPORTANT
          </span>

          <p>
            Treatment costs can vary depending on the hospital,
            treatment plan, patient requirements, medicines,
            investigations, and other medical expenses.
            This tool provides only a prototype estimate and
            should not be considered a final medical bill.
          </p>
        </div>
      </section>
    </main>
  );
}

export default CostEstimation;