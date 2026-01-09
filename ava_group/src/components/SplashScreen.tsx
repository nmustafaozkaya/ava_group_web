import { useEffect, useState } from "react";
import { Lato } from "next/font/google";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const architecturalIcons = [
  "/icons/bruj.svg",
  "/icons/eiffel.svg",
  "/icons/khalifa.svg",
  "/icons/tajmahal.svg",
  "/icons/sultanahmet.png",
];

const starsData = [
  { top: "10vh", left: "15vw", animationDelay: "0s" },
  { top: "20vh", left: "40vw", animationDelay: "1s" },
  { top: "35vh", left: "70vw", animationDelay: "2s" },
  { top: "50vh", left: "20vw", animationDelay: "3.5s" },
  { top: "65vh", left: "60vw", animationDelay: "4.5s" },
  { top: "80vh", left: "10vw", animationDelay: "1.7s" },
  { top: "90vh", left: "75vw", animationDelay: "3.1s" },
  { top: "40vh", left: "85vw", animationDelay: "2.6s" },
  { top: "15vh", left: "55vw", animationDelay: "0.3s" },
  { top: "70vh", left: "35vw", animationDelay: "4.1s" },
  { top: "5vh", left: "80vw", animationDelay: "1.2s" },
  { top: "25vh", left: "10vw", animationDelay: "2.8s" },
  { top: "45vh", left: "50vw", animationDelay: "0.7s" },
  { top: "75vh", left: "85vw", animationDelay: "3.9s" },
  { top: "85vh", left: "45vw", animationDelay: "2.1s" },
  { top: "30vh", left: "25vw", animationDelay: "4.2s" },
  { top: "55vh", left: "75vw", animationDelay: "1.5s" },
  { top: "95vh", left: "30vw", animationDelay: "3.7s" },
  { top: "12vh", left: "90vw", animationDelay: "0.9s" },
  { top: "18vh", left: "5vw", animationDelay: "2.3s" },
  { top: "42vh", left: "95vw", animationDelay: "1.8s" },
  { top: "62vh", left: "15vw", animationDelay: "4.6s" },
  { top: "78vh", left: "55vw", animationDelay: "0.5s" },
  { top: "88vh", left: "20vw", animationDelay: "3.4s" },
  { top: "33vh", left: "65vw", animationDelay: "2.9s" },
  { top: "48vh", left: "8vw", animationDelay: "1.1s" },
  { top: "68vh", left: "88vw", animationDelay: "4.0s" },
  { top: "83vh", left: "65vw", animationDelay: "2.5s" },
  { top: "38vh", left: "45vw", animationDelay: "3.6s" },
  { top: "58vh", left: "92vw", animationDelay: "0.8s" },
];

export default function SplashScreen({
  onAnimationComplete,
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [moveUpAndGrow, setMoveUpAndGrow] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [startDisappear, setStartDisappear] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const text = "AVA GROUP";

  // Initialize component and check for mobile screen size safely
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };

    checkMobile();
    // Set ready state after mobile check
    setIsReady(true);

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Don't start animation until component is ready
    if (!isReady) return;

    const charDelayMultiplier = 100;
    const textStaticDisplayDuration = 1500;
    const iconAppearanceDelay = 100;

    // Harfleri tek tek göster (cursor ile birlikte)
    const charTimers: NodeJS.Timeout[] = [];
    for (let i = 0; i <= text.length; i++) {
      const timer = setTimeout(() => {
        setCurrentCharIndex(i);
      }, i * charDelayMultiplier);
      charTimers.push(timer);
    }

    // Cursor'u gizle
    const hideCursorTimer = setTimeout(() => {
      setShowCursor(false);
    }, text.length * charDelayMultiplier + 500);

    // İkonları göster
    const iconsTimer = setTimeout(() => {
      setShowIcons(true);
    }, iconAppearanceDelay);

    // Disappear animasyonunu başlat
    const disappearTimer = setTimeout(() => {
      setStartDisappear(true);
    }, text.length * charDelayMultiplier + textStaticDisplayDuration);

    // Move up and grow animasyonunu başlat
    const moveUpTimer = setTimeout(() => {
      setMoveUpAndGrow(true);
    }, text.length * charDelayMultiplier + textStaticDisplayDuration);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onAnimationComplete();
    }, text.length * charDelayMultiplier + textStaticDisplayDuration + 2000);

    return () => {
      charTimers.forEach(clearTimeout);
      clearTimeout(hideCursorTimer);
      clearTimeout(iconsTimer);
      clearTimeout(disappearTimer);
      clearTimeout(moveUpTimer);
      clearTimeout(completeTimer);
    };
  }, [onAnimationComplete, text.length, isReady]);

  if (!isVisible) return null;

  return (
    <div
      className="splash-screen"
      style={{ visibility: isReady ? "visible" : "hidden" }}
    >
      <style jsx>{`
        .splash-screen {
          position: fixed;
          inset: 0;
          background-color: black;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          overflow: hidden;
          user-select: none;
          padding: 0 1rem;
          opacity: 1;
          visibility: visible;
        }

        .stars-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .star {
          position: absolute;
          width: 3px;
          height: 3px;
          background: radial-gradient(
            circle,
            white 0%,
            white 60%,
            rgba(255, 255, 255, 0.7) 100%
          );
          border-radius: 50%;
          opacity: 1;
          animation: star-move-up 5s linear infinite;
          animation-fill-mode: forwards;
          animation-delay: var(--animation-delay, 0s);
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
        }

        .star::before,
        .star::after {
          content: "";
          position: absolute;
          background: radial-gradient(
            ellipse,
            white 0%,
            white 30%,
            rgba(255, 255, 255, 0.8) 70%,
            rgba(255, 255, 255, 0.3) 100%
          );
          opacity: 0.9;
        }

        .star::before {
          width: 8px;
          height: 1px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .star::after {
          width: 1px;
          height: 8px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        @keyframes star-move-up {
          0% {
            transform: translateY(0);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-20vh);
            opacity: 0;
          }
        }

        .stars-move-up .star {
          animation-play-state: running;
        }

        .splash-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: transform 2s ease, font-size 2s ease;
          transform-origin: center bottom;
          width: 100%;
          max-width: 100vw;
        }

        .splash-content.move-up-grow {
          transform: translateY(-50vh) scale(1.8);
          transition-timing-function: cubic-bezier(0.55, 0.06, 0.68, 0.19);
        }

        /* Mobil için özel scale değeri */
        @media (max-width: 768px) {
          .splash-content.move-up-grow {
            transform: translateY(-50vh) scale(1.2);
          }
        }

        .splash-text {
          font-size: clamp(2rem, 8vw, 4rem);
          font-weight: 700;
          letter-spacing: clamp(1px, 0.3vw, 2px);
          white-space: nowrap;
          margin-bottom: 20px;
          display: flex;
          gap: clamp(0.1em, 0.2em, 0.2em);
          position: relative;
          text-align: center;
          width: 100%;
          justify-content: center;
        }

        /* Çok küçük ekranlar için */
        @media (max-width: 480px) {
          .splash-text {
            font-size: clamp(1.5rem, 10vw, 2.5rem);
            letter-spacing: clamp(0.5px, 1vw, 1.5px);
          }
        }

        .splash-char {
          display: inline-block;
          opacity: 1;
          transform: translateY(0);
          transition: all 0.8s ease;
          flex-shrink: 0;
        }

        .splash-char.disappear {
          opacity: 0;
          transform: translateY(-100px) translateX(var(--spread-x));
          transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .cursor {
          display: inline-block;
          width: 3px;
          height: 1em;
          background-color: white;
          margin-left: 2px;
          animation: blink 1s step-start infinite;
          transition: opacity 0.3s ease;
          position: relative;
          flex-shrink: 0;
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        .splash-icons {
          display: flex;
          gap: clamp(15px, 5vw, 30px);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 100%;
        }

        .splash-icons.show {
          opacity: 1;
          transform: translateY(0);
        }

        .splash-icons.fall {
          transform: translateY(100vh) !important;
          opacity: 0 !important;
          transition: all 1.5s cubic-bezier(0.55, 0.06, 0.68, 0.19) !important;
        }

        .icon-item {
          width: clamp(35px, 8vw, 50px);
          height: clamp(35px, 8vw, 50px);
          filter: invert(100%);
          opacity: 0;
          transform: translateY(20px);
          object-fit: contain;
          transition: opacity 0.6s ease var(--delay, 0s),
            transform 0.6s ease var(--delay, 0s);
          flex-shrink: 0;
        }

        .icon-item.show {
          opacity: 1;
          transform: translateY(0);
        }

        .icon-item.fall {
          transform: translateY(100vh) rotateZ(180deg) !important;
          opacity: 0 !important;
          transition: all 1.5s cubic-bezier(0.55, 0.06, 0.68, 0.19) !important;
        }

        /* Çok küçük ekranlar için ikonları gizle */
        @media (max-width: 375px) {
          .splash-icons {
            display: none;
          }
        }
      `}</style>

      {/* Yıldızlar */}
      <div
        className={`stars-container ${moveUpAndGrow ? "stars-move-up" : ""}`}
      >
        {starsData.map(({ top, left, animationDelay }, i) => (
          <div
            key={i}
            className="star"
            style={
              {
                top,
                left,
                "--animation-delay": animationDelay,
              } as React.CSSProperties & { "--animation-delay": string }
            }
          />
        ))}
      </div>

      <div className={`splash-content ${moveUpAndGrow ? "move-up-grow" : ""}`}>
        <h1 className={`splash-text ${lato.className}`}>
          {text.split("").map((char, index) => {
            const totalChars = text.length;
            const centerIndex = totalChars / 2;
            const spreadDistance = isMobile ? 30 : 50; // Use state instead of window.innerWidth
            const spreadX = (index - centerIndex) * spreadDistance;

            return (
              <span
                key={index}
                className={`splash-char ${startDisappear ? "disappear" : ""}`}
                style={
                  {
                    visibility: index < currentCharIndex ? "visible" : "hidden",
                    "--spread-x": `${spreadX}px`,
                  } as React.CSSProperties & { "--spread-x": string }
                }
              >
                {char === " " ? "\u00A0" : char}
                {index === currentCharIndex - 1 && showCursor && (
                  <span
                    className="cursor"
                    style={{ opacity: showCursor ? 1 : 0 }}
                  />
                )}
              </span>
            );
          })}
        </h1>

        <div
          className={`splash-icons ${showIcons ? "show" : ""} ${
            startDisappear ? "fall" : ""
          }`}
        >
          {architecturalIcons.map((icon, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={index}
              src={icon}
              alt={`Architectural Icon ${index + 1}`}
              className={`icon-item ${showIcons ? "show" : ""} ${
                startDisappear ? "fall" : ""
              }`}
              style={
                {
                  transitionDelay: `${index * 0.15}s`,
                  "--delay": `${index * 0.15}s`,
                } as React.CSSProperties & { "--delay": string }
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
