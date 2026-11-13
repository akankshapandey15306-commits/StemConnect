

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    image: "/images/howitworks_1.jpg",
    title: "Every Journey Starts With You",
    subtitle: "Register and take the first step toward helping someone.",
  },
  {
    image: "/images/howitworks_2.jpg",
    title: "Understand the Process",
    subtitle: "Learn about eligibility and the donor screening process.",
  },
  {
    image: "/images/howitworks_3.jpg",
    title: "Science Creates Possibilities",
    subtitle: "Medical teams carefully evaluate every potential match.",
  },
  {
    image: "/images/howitworks_4.jpg",
    title: "A Match Can Bring Hope",
    subtitle: "Help patients find potential stem cell donors.",
  },
  {
    image: "/images/howitworks_5.jpg",
    title: "Guided by Medical Experts",
    subtitle: "Qualified professionals guide the donation journey.",
  },
  {
    image: "/images/howitworks_6.jpg",
    title: "Be Part of Something Bigger",
    subtitle: "Your decision to register could make a difference.",
  },
];

const steps = [
  {
    number: "01",
    label: "REGISTER",
    title: "Join the Donor Registry",
    description:
      "Sign up by providing your health information so you can be considered for potential matches with patients in need.",
    symbol: "＋",
  },
  {
    number: "02",
    label: "MATCH",
    title: "Find a Potential Match",
    description:
      "Your details can help identify potential matches. A potential match is not a confirmed clinical match and requires medical verification.",
    symbol: "↔",
  },
  {
    number: "03",
    label: "DONATE",
    title: "Help Give Someone Hope",
    description:
      "If a suitable match is confirmed, the medical team will explain the donation procedure, possible risks and next steps.",
    symbol: "♡",
  },
];

function HowItWorks() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [failedImages, setFailedImages] = useState({});

  const extendedSlides = [...slides, slides[0]];

  const showSlide = (index) => {
    setIsTransitioning(true);
    setActiveSlide((index + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setActiveSlide((prev) => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeSlide === slides.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setActiveSlide(0);
      }, 700);

      return () => clearTimeout(timeout);
    }
  }, [activeSlide, slides.length]);

  return (
    <main className="how-page">
      {/* HERO */}
      <section className="how-hero">
        <div className="how-hero-inner">
          <div className="how-hero-copy">
            <span className="how-eyebrow">
              HOW STEM CELL DONATION WORKS
            </span>

            <h1>
              Your Commitment
              <br />
              <span>Can Change Lives.</span>
            </h1>

            <p>
              Discover how registering as a stem cell donor can help connect
              patients with potential donors. Explore the journey from
              registration to clinical verification and donation.
            </p>

            <div className="how-hero-actions">
              <Link to="/register" className="how-primary-btn">
                Become a Donor <span aria-hidden="true">↗</span>
              </Link>

              <a
                href="#donation-journey"
                className="how-secondary-link"
              >
                Explore the process <span aria-hidden="true">↓</span>
              </a>
            </div>

            <div className="how-trust-note">
              <span className="how-trust-dot" />
              Informed decisions. Expert medical guidance.
            </div>
          </div>

          <div className="how-hero-decoration" aria-hidden="true">
            <div className="how-decoration-ring ring-one" />
            <div className="how-decoration-ring ring-two" />
            <div className="how-decoration-center">
              <span>STEM</span>
              <strong>CELL</strong>
              <small>DONATION</small>
            </div>
          </div>
        </div>
      </section>

      {/* FULL-WIDTH HORIZONTAL IMAGE SLIDER */}
      <section
        className="how-wide-slider"
        aria-label="Stem cell donation image gallery"
      >
        <div
          className="how-wide-track"
          style={{
            transform: `translateX(-${activeSlide * 100}%)`,
            transition: isTransitioning
              ? "transform 700ms ease-in-out"
              : "none",
          }}
        >
          {extendedSlides.map((slide, index) => (
            <div
              className="how-wide-slide"
              key={`${slide.image}-${index}`}
            >

              {!failedImages[slide.image] ? (
                <img
                  src={slide.image}
                  alt={slide.title}
                  onError={() =>
                    setFailedImages((previous) => ({
                      ...previous,
                      [slide.image]: true,
                    }))
                  }
                />
              ) : (
                <div className="how-wide-image-fallback">
                  <span>STEMCONNECT</span>
                  <h2>{slide.title}</h2>
                  <p>
                    Image not found: {slide.image}
                  </p>
                </div>
              )}

              <div className="how-wide-overlay">
                <span className="how-wide-kicker">
                  STEMCONNECT · THE DONOR JOURNEY
                </span>
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="how-wide-controls">
          <div className="how-wide-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.image}
                type="button"
                className={
                  index === activeSlide ? "active" : ""
                }
                onClick={() => showSlide(index)}
                aria-label={`Show image ${index + 1}`}
                aria-pressed={index === activeSlide}
              />
            ))}
          </div>

          <div className="how-wide-navigation">
            <span className="how-wide-count">
              {String((activeSlide % slides.length) + 1).padStart(2, "0")} / 06
            </span>

            <button
              type="button"
              onClick={() => showSlide(activeSlide - 1)}
              aria-label="Previous image"
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => showSlide(activeSlide + 1)}
              aria-label="Next image"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* DONATION JOURNEY */}
      <section
        className="journey-section"
        id="donation-journey"
      >
        <div className="journey-header">
          <div>
            <span className="how-eyebrow">
              YOUR JOURNEY MATTERS
            </span>

            <h2>
              Three Steps.
              <br />
              <span>One Powerful Purpose.</span>
            </h2>
          </div>

          <p>
            Becoming a donor starts with a simple decision. Explore the
            three main stages of the journey, from registration to
            potential matching and donation.
          </p>
        </div>

        <div className="journey-cards">
          {steps.map((step) => (
            <article
              className="journey-card"
              key={step.number}
            >
              <div className="journey-card-top">
                <span className="journey-card-number">
                  {step.number}
                </span>

                <span
                  className="journey-card-icon"
                  aria-hidden="true"
                >
                  {step.symbol}
                </span>
              </div>

              <span className="journey-label">
                {step.label}
              </span>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

              <div className="journey-card-footer">
                <span>STEMCONNECT</span>
                <span aria-hidden="true">↗</span>
              </div>
            </article>
          ))}
        </div>

        <div className="journey-bottom-note">
          <span className="journey-note-icon">i</span>
          <p>
            Eligibility, matching and donation decisions require
            assessment and guidance from qualified medical professionals.
            Registration does not guarantee a match.
          </p>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="how-cta">
        <div
          className="how-cta-decoration how-cta-decoration-one"
          aria-hidden="true"
        />
        <div
          className="how-cta-decoration how-cta-decoration-two"
          aria-hidden="true"
        />

        <div className="how-cta-inner">
          <div>
            <span className="how-eyebrow">
              YOUR NEXT STEP STARTS HERE
            </span>

            <h2>
              Someone Needs Hope.
              <br />
              <span>You Can Help.</span>
            </h2>

            <p>
              Explore donor registration and learn how you could become
              part of someone's journey.
            </p>
          </div>

          <Link to="/register" className="how-back-btn">
            Register Now
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default HowItWorks;
