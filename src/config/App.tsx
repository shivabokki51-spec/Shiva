import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { birthdayConfig } from "./birthday";

type SafePhotoProps = {
  src: string;
  alt: string;
  className?: string;
};

// Renders a photo, but falls back to a clean placeholder instead
// of a broken-image icon if the file ever fails to load.
function SafePhoto({
  src,
  alt,
  className,
}: SafePhotoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={className}>
        <div className="photo-fallback">
          Photo unavailable
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

type Section = "home" | "letter" | "loveList" | "memories" | "final";

type AppProps = {
  muted: boolean;
  onToggleMuted: () => void;
  onUnlock: () => void;
};

export default function App({
  muted,
  onToggleMuted,
  onUnlock,
}: AppProps) {
  const [section, setSection] =
    useState<Section>("home");

  const [secret, setSecret] = useState("");
  const [secretError, setSecretError] =
    useState(false);
  const [unlocking, setUnlocking] =
    useState(false);

  const [selectedPhoto, setSelectedPhoto] =
    useState<number | null>(null);

  const [revealedLoveCount, setRevealedLoveCount] =
    useState(0);
  const [heartTaps, setHeartTaps] = useState(0);

  const heartBurst = Array.from(
    { length: 14 },
    (_, i) => {
      const angle = (i / 14) * Math.PI * 2;
      const distance = 55 + (i % 3) * 15;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      };
    },
  );

  // Deterministic layout pattern for the memory wall — cycles
  // through a fixed set of rotations/offsets/widths so it looks
  // organically scattered but stays stable across re-renders.
  const memoryWallLayout = [
    { rotate: -6, offsetY: 0, width: 128 },
    { rotate: 4, offsetY: 26, width: 108 },
    { rotate: -3, offsetY: -14, width: 118 },
    { rotate: 7, offsetY: 18, width: 100 },
    { rotate: -8, offsetY: -8, width: 122 },
    { rotate: 3, offsetY: 10, width: 104 },
  ];

  const memorySequenceRefs =
    useRef<(HTMLDivElement | null)[]>([]);
  const memoryWallIntroRef =
    useRef<HTMLDivElement | null>(null);
  const lastMomentButtonRef =
    useRef<HTMLButtonElement | null>(null);

  // Auto-scroll the page down through each photo one at a time
  // (phase 1), then bring the assembled wall into view (phase 2),
  // then finish by scrolling to the "one last moment" button —
  // so she doesn't have to scroll manually through any of it.
  useEffect(() => {
    if (section !== "memories") {
      return;
    }

    const total = birthdayConfig.memories.length;
    const timers: number[] = [];
    const stepMs = 1600;

    for (let i = 0; i < total; i++) {
      timers.push(
        window.setTimeout(() => {
          const el = memorySequenceRefs.current[i];

          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, i * stepMs),
      );
    }

    timers.push(
      window.setTimeout(() => {
        const intro = memoryWallIntroRef.current;

        if (intro) {
          intro.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, total * stepMs),
    );

    timers.push(
      window.setTimeout(() => {
        const button = lastMomentButtonRef.current;

        if (button) {
          button.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, total * stepMs + 1600),
    );

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [section]);

  const SECRET_CODE = "2000";

  const goTo = (next: Section) => {
    setSection(next);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const unlockBirthday = () => {
    if (secret.trim() !== SECRET_CODE) {
      setSecretError(true);

      window.setTimeout(() => {
        setSecretError(false);
      }, 1200);

      return;
    }

    setSecretError(false);
    setUnlocking(true);
    onUnlock();

    window.setTimeout(() => {
      setUnlocking(false);
      goTo("letter");
    }, 500);
  };
const currentPhoto =
    selectedPhoto !== null
      ? birthdayConfig.memories[selectedPhoto]
      : null;

  return (
    <main className="birthday-app">
      {/* BACKGROUND */}
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />
  

      {/* TOP BAR */}
      <header className="topbar">
        <button
          className="brand"
          onClick={() => goTo("home")}
          aria-label="Go home"
        >
          kothi <span>♥</span>
        </button>

        <div className="topbar-right">
          <button
            className="sound-toggle"
            onClick={onToggleMuted}
            aria-label={
              muted
                ? "Unmute music"
                : "Mute music"
            }
          >
            {muted ? "♪ OFF" : "♪ ON"}
          </button>

          <div className="top-date">
            07 · 10
          </div>
        </div>
      </header>

      {/* PROGRESS */}
      <div className="progress">
        <span
          className={
            section === "home"
              ? "active"
              : ""
          }
        />
        <span
          className={
            section === "letter"
              ? "active"
              : ""
          }
        />
        <span
          className={
            section === "loveList"
              ? "active"
              : ""
          }
        />
        <span
          className={
            section === "memories"
              ? "active"
              : ""
          }
        />
        <span
          className={
            section === "final"
              ? "active"
              : ""
          }
        />
      </div>

      {/* =====================================================
          PAGE TRANSITIONS
      ===================================================== */}

      <AnimatePresence mode="wait">

        {/* =====================================================
            HOME / PASSWORD
        ===================================================== */}

        {section === "home" && (
          <motion.section
            key="home"
            className="page hero-page premium-home"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
              scale: 1.02,
            }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
          >
            {/* PETALS */}
            <div
              className="home-petals"
              aria-hidden="true"
            >
              <span className="home-petal home-petal-1" />
              <span className="home-petal home-petal-2" />
              <span className="home-petal home-petal-3" />
              <span className="home-petal home-petal-4" />
              <span className="home-petal home-petal-5" />
            </div>

            {/* AURA */}
            <div
              className="home-aura"
              aria-hidden="true"
            />

            <div className="hero-content premium-home-content">

              {/* EYEBROW */}
              <motion.p
                className="premium-eyebrow"
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.15,
                  duration: 0.7,
                }}
              >
                A LITTLE WORLD MADE FOR YOU
              </motion.p>

              {/* TITLE */}
              <motion.h1
                className="premium-home-title"
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.3,
                  duration: 0.85,
                }}
              >
                This is
                <br />
                <em>just for you.</em>
              </motion.h1>

              {/* DIVIDER */}
              <motion.div
                className="premium-home-divider"
                initial={{
                  scaleX: 0,
                }}
                animate={{
                  scaleX: 1,
                }}
                transition={{
                  delay: 0.75,
                  duration: 0.6,
                }}
              />

              {/* DESCRIPTION */}
              <motion.p
                className="premium-home-description"
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.9,
                  duration: 0.7,
                }}
              >
                Some things are meant to be
                <br />
                opened with a little secret.
              </motion.p>

              {/* PASSWORD CARD */}
              <motion.div
                className={`secret-card ${
                  secretError
                    ? "secret-error"
                    : ""
                } ${
                  unlocking
                    ? "secret-unlocking"
                    : ""
                }`}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 1.05,
                  duration: 0.7,
                }}
              >
                <div className="secret-label">
                  ENTER THE SECRET
                </div>

                <div className="secret-input-row">
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={4}
                    value={secret}
                    onChange={(event) => {
                      setSecret(
                        event.target.value
                      );
                      setSecretError(false);
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter"
                      ) {
                        unlockBirthday();
                      }
                    }}
                    placeholder="••••"
                    aria-label="Birthday secret"
                  />

                  <button
                    type="button"
                    onClick={
                      unlockBirthday
                    }
                    disabled={unlocking}
                    aria-label="Open birthday story"
                  >
                    <span>
                      {unlocking
                        ? "✦"
                        : "→"}
                    </span>
                  </button>
                </div>

                <div className="secret-hint">
                  {secretError
                    ? "Not quite... try again ♥"
                    : "A little secret between us."}
                </div>
              </motion.div>

              {/* FOOTER */}
              <motion.div
                className="premium-home-footer"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 1.35,
                  duration: 0.8,
                }}
              >
                MADE ESPECIALLY FOR Akshitha
                <span>♥</span>
              </motion.div>
            </div>

            {/* DATE */}
            <motion.div
              className="home-date"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 1.5,
                duration: 0.8,
              }}
            >
              07 · 10
            </motion.div>
          </motion.section>
        )}

        {/* =====================================================
            LETTER
        ===================================================== */}

        {section === "letter" && (
          <motion.section
            key="letter"
            className="page letter-page"
            initial={{
              opacity: 0,
              x: 35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -35,
            }}
            transition={{
              duration: 0.6,
            }}
          >
            <div className="section-number">
              01
            </div>

            <div className="paper-card">

              <div className="paper-top">
                <span>
                  A LETTER FOR YOU
                </span>

                <span>
                  07 · 10
                </span>
              </div>

              <div className="paper-content">

                <p className="letter-small">
                  Hey
                </p>

                <h2>
                  A little something
                  <br />
                  <em>
                    from the heart.
                  </em>
                </h2>

                <div className="letter-body">
                  {birthdayConfig.letter.paragraphs.map(
                    (
                      paragraph,
                      index
                    ) => (
                      <p
                        key={`${paragraph}-${index}`}
                      >
                        {paragraph}
                      </p>
                    )
                  )}
                </div>

              </div>

              <div className="paper-stamp">
                AKSK
              </div>
            </div>

            <button
              className="outline-button"
              onClick={() =>
                goTo("loveList")
              }
            >
              KEEP READING
              <span>→</span>
            </button>
          </motion.section>
        )}

        {/* =====================================================
            LOVE LIST
        ===================================================== */}

        {section === "loveList" && (
          <motion.section
            key="loveList"
            className="page love-list-page"
            initial={{
              opacity: 0,
              x: 35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -35,
            }}
            transition={{
              duration: 0.6,
            }}
          >
            <div className="section-number">
              02
            </div>

            <h2 className="love-list-heading">
              A few things I love
              <br />
              <em>about you.</em>
            </h2>

            <div className="love-list-items">
              {birthdayConfig.loveList
                .slice(0, revealedLoveCount)
                .map((item, index) => (
                  <motion.div
                    key={item}
                    className="love-list-item"
                    initial={{
                      opacity: 0,
                      y: 14,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.5,
                    }}
                  >
                    <span className="love-list-number">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>

                    <span className="love-list-text">
                      {item}
                    </span>
                  </motion.div>
                ))}
            </div>

            {revealedLoveCount <
            birthdayConfig.loveList.length ? (
              <div className="heart-tap-wrap">
                <p className="eyebrow">
                  {revealedLoveCount === 0
                    ? "Tap it."
                    : "Tap for more."}
                </p>

                <div className="heart-tap-stage">
                  <AnimatePresence>
                    {Array.from({
                      length: heartTaps,
                    }).map((_, burstIndex) => (
                      <div
                        key={burstIndex}
                        className="heart-burst"
                      >
                        {heartBurst.map(
                          (p) => (
                            <motion.span
                              key={p.id}
                              className="heart-burst-dot"
                              initial={{
                                x: 0,
                                y: 0,
                                opacity: 1,
                                scale: 1,
                              }}
                              animate={{
                                x: p.x,
                                y: p.y,
                                opacity: 0,
                                scale: 0,
                              }}
                              transition={{
                                duration: 0.9,
                                ease: "easeOut",
                              }}
                            />
                          ),
                        )}
                      </div>
                    ))}
                  </AnimatePresence>

                  <motion.button
                    className="heart-tap-button"
                    onClick={() => {
                      setRevealedLoveCount(
                        (count) => count + 1,
                      );
                      setHeartTaps(
                        (count) => count + 1,
                      );
                    }}
                    whileTap={{
                      scale: 0.85,
                    }}
                    animate={{
                      scale: [1, 1.08, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    aria-label="Reveal next"
                  >
                    <svg
                      viewBox="0 0 32 29"
                      className="heart-icon"
                    >
                      <path d="M16 28.5C16 28.5 1 19.4 1 9.6C1 4.8 4.7 1 9.4 1C12.3 1 14.9 2.5 16 4.9C17.1 2.5 19.7 1 22.6 1C27.3 1 31 4.8 31 9.6C31 19.4 16 28.5 16 28.5Z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.div
                className="heart-message-block"
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.7,
                }}
              >
                <p className="heart-message-text">
                  No matter how far apart we
                  are... you're always close
                  to my heart.
                </p>

                <button
                  className="outline-button"
                  onClick={() =>
                    goTo("memories")
                  }
                >
                  OPEN THE MEMORIES
                  <span>→</span>
                </button>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* =====================================================
            MEMORIES
        ===================================================== */}

        {section === "memories" && (
          <motion.section
            key="memories"
            className="page memories-page"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >
            <div className="memories-heading">

              <div>
                <span className="eyebrow">
                  02 · THE MEMORY BOOK
                </span>

                <h2>
                  Moments that
                  <br />
                  <em>stayed.</em>
                </h2>
              </div>

              <p className="memories-instruction">
                Swipe or scroll
                <br />
                through the memories ↓
              </p>

            </div>

            {/* PHASE 1 — one photo at a time */}
            <div className="memory-sequence">
              {birthdayConfig.memories.map(
                (memory, index) => (
                  <div
                    key={`seq-${memory.image}-${index}`}
                    ref={(el) => {
                      memorySequenceRefs.current[
                        index
                      ] = el;
                    }}
                    className="memory-sequence-item"
                  >
                    <button
                      className="memory-photo-button"
                      onClick={() =>
                        setSelectedPhoto(
                          index
                        )
                      }
                      aria-label={`Open memory ${
                        index + 1
                      }`}
                    >
                      <SafePhoto
                        src={memory.image}
                        alt={`${birthdayConfig.name} memory ${
                          index + 1
                        }`}
                      />
                    </button>

                    <span className="memory-sequence-number">
                      {String(
                        index + 1
                      ).padStart(2, "0")}{" "}
                      / {birthdayConfig.memories.length}
                    </span>
                  </div>
                )
              )}
            </div>

            {/* PHASE 2 — the wall, all together */}
            <div
              className="memory-wall-intro"
              ref={memoryWallIntroRef}
            >
              <span>· all together ·</span>
            </div>

            <div className="memory-wall">
              {birthdayConfig.memories.map(
                (memory, index) => {
                  const layout =
                    memoryWallLayout[
                      index %
                        memoryWallLayout.length
                    ];

                  return (
                    <motion.div
                      key={`wall-${memory.image}-${index}`}
                      className="memory-wall-card"
                      style={{
                        width: layout.width,
                      }}
                      initial={{
                        opacity: 0,
                        y: 24,
                        rotate: 0,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: layout.offsetY,
                        rotate: layout.rotate,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.4,
                      }}
                      whileTap={{
                        scale: 1.08,
                        rotate: 0,
                        zIndex: 10,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.08,
                        ease: [
                          0.22, 1, 0.36, 1,
                        ],
                      }}
                    >
                      <button
                        className="memory-wall-button"
                        onClick={() =>
                          setSelectedPhoto(
                            index
                          )
                        }
                        aria-label={`Open memory ${
                          index + 1
                        }`}
                      >
                        <SafePhoto
                          src={memory.image}
                          alt={`${birthdayConfig.name} memory ${
                            index + 1
                          }`}
                          className="memory-wall-photo"
                        />
                      </button>
                    </motion.div>
                  );
                }
              )}
            </div>

            <p className="memories-instruction memories-instruction-end">
              One last moment
              <br />
              waits below ↓
            </p>

            <button
              ref={lastMomentButtonRef}
              className="outline-button memory-next"
              onClick={() =>
                goTo("final")
              }
            >
              ONE LAST MOMENT
              <span>→</span>
            </button>

          </motion.section>
        )}

        {/* =====================================================
            FINAL BIRTHDAY PAGE
        ===================================================== */}

        {section === "final" && (
          <motion.section
            key="final"
            className="page final-page"
            initial={{
              opacity: 0,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.8,
            }}
          >

            {/* FLYING PETALS */}
            <div
              className="petals"
              aria-hidden="true"
            >
              <span className="petal petal-1" />
              <span className="petal petal-2" />
              <span className="petal petal-3" />
              <span className="petal petal-4" />
              <span className="petal petal-5" />
              <span className="petal petal-6" />
              <span className="petal petal-7" />
              <span className="petal petal-8" />
            </div>

            {/* FLOATING DOTS */}
            <div
              className="final-dots"
              aria-hidden="true"
            >
              <span className="final-dot final-dot-1" />
              <span className="final-dot final-dot-2" />
              <span className="final-dot final-dot-3" />
              <span className="final-dot final-dot-4" />
              <span className="final-dot final-dot-5" />
              <span className="final-dot final-dot-6" />
              <span className="final-dot final-dot-7" />
              <span className="final-dot final-dot-8" />
              <span className="final-dot final-dot-9" />
              <span className="final-dot final-dot-10" />
            </div>

            {/* ORBITS */}
            <div
              className="final-orbit orbit-one"
            />

            <div
              className="final-orbit orbit-two"
            />

            <div className="final-content">

              {/* DATE */}
              <motion.span
                className="eyebrow"
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2,
                  duration: 0.7,
                }}
              >
                {
                  birthdayConfig
                    .finalMessage
                    .eyebrow
                }
              </motion.span>

              {/* PRETITLE */}
              <motion.p
                className="final-pretitle"
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.35,
                  duration: 0.7,
                }}
              >
                For someone who makes
                <br />
                ordinary moments special.
              </motion.p>

              {/* HAPPY BIRTHDAY */}
              <motion.h1
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.5,
                  duration: 0.8,
                }}
              >
                Happy
                <br />
                <em>Birthday</em>
              </motion.h1>

              {/* DIVIDER */}
              <motion.div
                className="final-divider"
                initial={{
                  scaleX: 0,
                }}
                animate={{
                  scaleX: 1,
                }}
                transition={{
                  delay: 0.9,
                  duration: 0.6,
                }}
              />

              {/* NAME */}
              <motion.div
                className="final-name"
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.8,
                  duration: 0.7,
                }}
              >
                {
                  birthdayConfig
                    .finalMessage
                    .name
                }

                <span>♥</span>
              </motion.div>

              {/* MESSAGE */}

              {/* MISS YOU */}
              <motion.p
                className="final-miss-you"
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 1.1,
                  duration: 0.7,
                }}
              >
                potti ga  <span>♥</span>
              </motion.p>

              {/* FOOTER */}
              <motion.div
                className="final-footer"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 1.3,
                  duration: 0.8,
                }}
              >
                <span>
                  07 · 10
                </span>

                <span>
                  MADE WITH LOVE
                </span>

                <span>
                  2026
                </span>
              </motion.div>

            </div>

            {/* RESTART */}
            <motion.button
              className="restart-button"
              onClick={() =>
                goTo("home")
              }
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 1.5,
                duration: 0.8,
              }}
            >
              ↻ &nbsp; EXPERIENCE AGAIN
            </motion.button>

          </motion.section>
        )}

      </AnimatePresence>

      {/* =====================================================
          PHOTO LIGHTBOX
      ===================================================== */}

      <AnimatePresence>
        {currentPhoto &&
          selectedPhoto !== null && (
            <motion.div
              className="lightbox"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setSelectedPhoto(null)
              }
            >

              <motion.div
                className="lightbox-card"
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                }}
                onClick={(event) =>
                  event.stopPropagation()
                }
              >

                <button
                  className="close-lightbox"
                  onClick={() =>
                    setSelectedPhoto(null)
                  }
                  aria-label="Close photo"
                >
                  ×
                </button>

                <SafePhoto
                  src={currentPhoto.image}
                  alt={
                    currentPhoto.caption
                  }
                />

                <div className="lightbox-info">

                  <span>
                    MEMORY{" "}
                    {String(
                      selectedPhoto + 1
                    ).padStart(2, "0")}
                  </span>

                  <strong>
                    {currentPhoto.caption}
                  </strong>

                </div>

              </motion.div>

            </motion.div>
          )}
      </AnimatePresence>

    </main>
  );
}
