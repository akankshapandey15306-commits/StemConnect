import { useState } from "react";
import { Link } from "react-router-dom";

const videos = [
  "/videos/register.mp4",
  "/videos/swab-kit.mp4",
  "/videos/what-happens-next.mp4",
  "/videos/finaldonation.mp4",
];

function Hero() {
  const [currentVideo, setCurrentVideo] = useState(0);

  const handleVideoEnd = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  };

  return (
    <section className="hero">

      <div className="hero-content">

        <p className="hero-tag">
          STEM CELL DONATION
        </p>

        <h1>
          One simple swab
          <br />
          can make a difference.
        </h1>

        <p className="hero-description">
          Learn how stem cell donation works, register as a donor,
          and support patients who may need a stem cell match.
        </p>

        <div className="hero-buttons">

          <Link to="/donors" className="hero-primary-btn">
               Become a Donor
          </Link>

          <Link
            to="/how-it-works"
            className="hero-secondary-btn"
          >
            How It Works →
          </Link>

        </div>

      </div>

      <div className="hero-video-container">

        <video
          key={videos[currentVideo]}
          src={videos[currentVideo]}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
        />

        <div className="video-indicators">

          {videos.map((_, index) => (
            <span
              key={index}
              className={
                index === currentVideo ? "active" : ""
              }
            />
          ))}

        </div>

      </div>

    </section>
  );
}

export default Hero;