import { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What are stem cells?",
    answer:
      "Stem cells are cells that can develop into different types of cells in the body. Blood-forming stem cells are used in certain medical treatments, including some stem cell transplants.",
  },
  {
    question: "What is stem cell matching?",
    answer:
      "A stem cell match is based on specific biological characteristics between a donor and a patient. A suitable match can be important when a patient needs a stem cell transplant.",
  },
  {
    question: "Is registration the same as donation?",
    answer:
      "No. Registering as a donor means that your information may be considered if you are identified as a potential match. Registration does not automatically mean that you will donate.",
  },
  {
    question: "What happens after registration?",
    answer:
      "Your donor information can be stored in the relevant registry. If you are identified as a potential match, you may be contacted and provided with information about the next steps.",
  },
  {
    question: "Does every registered donor get contacted?",
    answer:
      "No. Being registered does not mean that every donor will be selected for donation. Contact generally depends on whether a potential match is identified.",
  },
  {
    question: "Can I change my decision later?",
    answer:
      "Donor registration and participation involve personal decisions and eligibility requirements. If your circumstances or decision changes, you should follow the process provided by the relevant donor registry.",
  },
];

const myths = [
  {
    myth: "Registration means I will definitely donate.",
    fact: "Registration only means you may be considered if you are identified as a potential match.",
  },
  {
    myth: "Stem cell donation is always a surgical procedure.",
    fact: "The collection method depends on the donation process and medical evaluation.",
  },
  {
    myth: "One donor can automatically help any patient.",
    fact: "Donation depends on finding a suitable match between donor and patient.",
  },
];

function AwarenessSection() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="awareness-page">

      {/* INTRO CARDS */}
      <section className="awareness-topics" id="questions">

        <div className="awareness-section-heading">

          <div>
            <span className="awareness-eyebrow">
              START WITH THE BASICS
            </span>

            <h2>
              What you should
              <br />
              <span>know first.</span>
            </h2>
          </div>

          <p>
            A simple introduction to the important concepts behind
            stem cell donation and donor matching.
          </p>

        </div>


        <div className="awareness-topic-grid">

          <article className="awareness-topic-card">
            <span className="topic-number">01</span>

            <h3>Why It Matters</h3>

            <p>
              Stem cell transplants can be part of treatment for certain
              serious diseases. Finding a suitable donor can be an
              important part of that process.
            </p>
          </article>


          <article className="awareness-topic-card featured-topic">
            <span className="topic-number">02</span>

            <h3>How Donation Works</h3>

            <p>
              Stem cells can be collected through different donation
              methods. The method used depends on the donation process
              and medical evaluation.
            </p>
          </article>


          <article className="awareness-topic-card">
            <span className="topic-number">03</span>

            <h3>Who Can Donate?</h3>

            <p>
              Donor eligibility depends on factors such as age,
              health, medical history, and the requirements of the
              relevant donor registry.
            </p>
          </article>


          <article className="awareness-topic-card">
            <span className="topic-number">04</span>

            <h3>Impact of Your Gift</h3>

            <p>
              A suitable donor match can provide an important treatment
              option for a patient who needs a stem cell transplant.
            </p>
          </article>

        </div>

      </section>


      {/* MATCHING SECTION */}
      <section className="matching-section">

        <div className="matching-visual">

          <div className="matching-ring ring-1" />
          <div className="matching-ring ring-2" />
          <div className="matching-ring ring-3" />

          <div className="matching-center">
            <span>DONOR</span>
            <strong>↔</strong>
            <span>PATIENT</span>
          </div>

        </div>


        <div className="matching-content">

          <span className="awareness-eyebrow">
            UNDERSTANDING MATCHING
          </span>

          <h2>
            What makes a
            <br />
            <span>potential match?</span>
          </h2>

          <p>
            Donor matching involves comparing specific biological
            characteristics between a donor and a patient. A registry
            can help identify potential matches when a patient's
            treatment requires a suitable donor.
          </p>

          <div className="matching-points">

            <div>
              <span>01</span>
              <p>Donor information is recorded in a registry.</p>
            </div>

            <div>
              <span>02</span>
              <p>Patient requirements are compared with donor information.</p>
            </div>

            <div>
              <span>03</span>
              <p>A potential match may lead to further evaluation.</p>
            </div>

          </div>

        </div>

      </section>


      {/* MYTHS & FACTS */}
      <section className="myths-section">

        <div className="awareness-section-heading">

          <div>
            <span className="awareness-eyebrow">
              MYTHS & FACTS
            </span>

            <h2>
              Let's clear up
              <br />
              the <span>confusion.</span>
            </h2>
          </div>

          <p>
            Understanding the difference between common assumptions
            and accurate information can help people make informed
            decisions.
          </p>

        </div>


        <div className="myths-list">

          {myths.map((item, index) => (
            <article className="myth-row" key={index}>

              <div className="myth-number">
                0{index + 1}
              </div>

              <div className="myth-column">
                <span>MYTH</span>
                <h3>{item.myth}</h3>
              </div>

              <div className="fact-column">
                <span>FACT</span>
                <p>{item.fact}</p>
              </div>

            </article>
          ))}

        </div>

      </section>


      {/* FAQ */}
      <section className="faq-section">

        <div className="faq-heading">

          <span className="awareness-eyebrow">
            FREQUENTLY ASKED QUESTIONS
          </span>

          <h2>
            Questions are
            <br />
            <span>part of learning.</span>
          </h2>

          <p>
            Find simple answers to some common questions about
            registration, matching, and donation.
          </p>

        </div>


        <div className="faq-list">

          {faqs.map((faq, index) => {

            const isOpen = openFaq === index;

            return (
              <div
                className={`faq-item ${isOpen ? "faq-open" : ""}`}
                key={index}
              >

                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>

                  <span className="faq-icon">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}

              </div>
            );
          })}

        </div>

      </section>


      {/* CTA */}
      <section className="awareness-final-cta">

        <div>

          <span>TAKE THE NEXT STEP</span>

          <h2>
            Knowledge first.
            <br />
            Decision next.
          </h2>

        </div>

        <Link to="/" className="awareness-cta-btn">
          Back to Home
          <span>↗</span>
        </Link>

      </section>

    </main>
  );
}

export default AwarenessSection;