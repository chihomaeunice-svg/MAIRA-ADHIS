import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Briefcase, Scale, Heart, Building, Users, Shield, FileText, X, ArrowRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

const PRACTICE_AREAS = [
  {
    id: "commercial",
    label: "Commercial & Corporate",
    icon: Briefcase,
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200",
    description: "Expert handling of business disputes, contract enforcement, debt recovery, and corporate governance for businesses of all sizes.",
    services: ["Business dispute resolution", "Contract drafting & enforcement", "Debt recovery proceedings", "Company formation & registration", "Corporate restructuring", "Mergers & acquisitions", "Shareholder agreements"],
  },
  {
    id: "civil",
    label: "Civil Litigation",
    icon: Scale,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200",
    description: "Skilled representation in civil suits including breach of contract, tort claims, injunctions, and general civil disputes before all levels of court.",
    services: ["Breach of contract claims", "Tort & negligence claims", "Injunctions & restraining orders", "Debt recovery suits", "Appeals & judicial review", "Mediation & arbitration"],
  },
  {
    id: "family",
    label: "Family Matters",
    icon: Heart,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200",
    description: "Compassionate representation in divorce, custody, maintenance, inheritance, and all family dispute resolutions with sensitivity and discretion.",
    services: ["Divorce & separation", "Child custody & guardianship", "Maintenance & alimony", "Estate & inheritance disputes", "Matrimonial property division", "Adoption proceedings"],
  },
  {
    id: "land",
    label: "Conveyances & Land",
    icon: Building,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200",
    description: "Comprehensive property and land law services including title transfers, land disputes, tribunal proceedings, and conveyancing.",
    services: ["Title deed transfers", "Sale & purchase agreements", "Land tribunal proceedings", "Lease agreements", "Mortgage & charges", "Land dispute resolution", "Surveying & boundary matters"],
  },
  {
    id: "labour",
    label: "Labour & Employment",
    icon: Users,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200",
    description: "Protecting employee and employer rights in employment disputes, unfair dismissal, CMA proceedings, and all labour court matters.",
    services: ["Unfair dismissal claims", "CMA & labour court proceedings", "Employment contracts", "Workplace discrimination", "Redundancy & retrenchment", "Trade union matters", "Employment policy drafting"],
  },
  {
    id: "criminal",
    label: "Criminal Defense",
    icon: Shield,
    image: "https://images.unsplash.com/photo-1453945619913-79ec89a82c51?q=80&w=1200",
    description: "Vigorous defense representation for individuals facing criminal charges, bail applications, appeals, and all criminal court matters.",
    services: ["Bail applications", "Criminal trial defense", "Appeals & revisions", "White collar crime defense", "Traffic & road offense defense", "Plea bargaining", "Sentence mitigation"],
  },
  {
    id: "notary",
    label: "Notary Public & Oaths",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200",
    description: "Official notarization, certification of documents, affidavits, statutory declarations, and commissioner for oaths services for local and international use.",
    services: ["Document notarization", "Affidavits & sworn statements", "Statutory declarations", "Power of attorney", "International document certification", "Commissioner for oaths", "Apostille services"],
  },
];

const AUTO_PLAY_INTERVAL = 3500;
const ITEM_HEIGHT = 65;
const BRAND_COLOR = "#1e4d8c";

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

type PracticeArea = typeof PRACTICE_AREAS[0];

function DetailModal({ area, onClose }: { area: PracticeArea; onClose: () => void }) {
  const Icon = area.icon;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    // Prevent body scroll while modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] overflow-y-auto"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" />

      {/* Always-visible close button fixed to viewport */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[110] w-11 h-11 bg-black/60 hover:bg-black/80 backdrop-blur rounded-full flex items-center justify-center transition-colors shadow-lg"
      >
        <X className="h-5 w-5 text-white" />
      </button>

      {/* Scroll container — centres modal, allows scrolling if taller than screen */}
      <div className="relative min-h-full flex items-center justify-center p-4 py-16">
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-xl bg-white rounded-[1.5rem] overflow-hidden shadow-2xl"
        >
          {/* Image header — fixed short height so it never dominates */}
          <div className="relative h-44 sm:h-52">
            <img src={area.image} alt={area.label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Practice Area</span>
              </div>
              <h2 className="text-white text-xl sm:text-2xl font-bold leading-tight">{area.label}</h2>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-7">
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{area.description}</p>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Services We Provide</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {area.services.map((svc) => (
                <div key={svc} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="mt-1 w-1.5 h-1.5 bg-primary-600 rounded-full flex-shrink-0" />
                  <span className="text-gray-700 text-sm leading-snug">{svc}</span>
                </div>
              ))}
            </div>

            <a
              href="#contact"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-semibold transition-colors text-sm"
            >
              Book a Consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function PracticeCarousel() {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [detailArea, setDetailArea] = useState<PracticeArea | null>(null);

  const currentIndex = ((step % PRACTICE_AREAS.length) + PRACTICE_AREAS.length) % PRACTICE_AREAS.length;

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleChipClick = (index: number) => {
    const diff = (index - currentIndex + PRACTICE_AREAS.length) % PRACTICE_AREAS.length;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused || detailArea) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused, detailArea]);

  const getCardStatus = (index: number) => {
    const diff = index - currentIndex;
    const len = PRACTICE_AREAS.length;
    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;
    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  const active = PRACTICE_AREAS[currentIndex];

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 md:p-8">
        <div className="relative overflow-hidden rounded-[2rem] lg:rounded-[3rem] flex flex-col lg:flex-row min-h-[600px] lg:aspect-video border border-gray-200 shadow-xl">

          {/* Left: Scrolling labels */}
          <div
            className="w-full lg:w-[42%] min-h-[320px] lg:h-full relative z-30 flex flex-col items-start justify-center overflow-hidden px-8 md:px-16 lg:pl-14"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            <div className="absolute inset-x-0 top-0 h-16 z-40" style={{ background: `linear-gradient(to bottom, ${BRAND_COLOR}, transparent)` }} />
            <div className="absolute inset-x-0 bottom-0 h-16 z-40" style={{ background: `linear-gradient(to top, ${BRAND_COLOR}, transparent)` }} />
            <div className="relative w-full h-full flex items-center justify-center lg:justify-start z-20">
              {PRACTICE_AREAS.map((area, index) => {
                const isActive = index === currentIndex;
                const distance = index - currentIndex;
                const wrappedDistance = wrap(-(PRACTICE_AREAS.length / 2), PRACTICE_AREAS.length / 2, distance);
                const Icon = area.icon;

                return (
                  <motion.div
                    key={area.id}
                    style={{ height: ITEM_HEIGHT, width: "fit-content" }}
                    animate={{
                      y: wrappedDistance * ITEM_HEIGHT,
                      opacity: 1 - Math.abs(wrappedDistance) * 0.28,
                    }}
                    transition={{ type: "spring", stiffness: 90, damping: 22, mass: 1 }}
                    className="absolute flex items-center justify-start"
                  >
                    <button
                      onClick={() => handleChipClick(index)}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                      className={cn(
                        "relative flex items-center gap-3 px-5 py-3 rounded-full transition-all duration-500 text-left border",
                        isActive
                          ? "bg-white border-white z-10"
                          : "bg-transparent text-white/60 border-white/20 hover:border-white/50 hover:text-white"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 flex-shrink-0 transition-colors duration-500", isActive ? "text-primary-700" : "text-white/50")} />
                      <span className={cn("text-sm font-semibold whitespace-nowrap tracking-wide", isActive ? "text-primary-800" : "")}>
                        {area.label}
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: Image cards */}
          <div className="flex-1 min-h-[440px] lg:h-full relative bg-gray-50 flex items-center justify-center py-12 lg:py-8 px-6 md:px-10 overflow-hidden border-t lg:border-t-0 lg:border-l border-gray-200">
            <div className="relative w-full max-w-[380px] aspect-[4/5] flex items-center justify-center">
              {PRACTICE_AREAS.map((area, index) => {
                const status = getCardStatus(index);
                const isActive = status === "active";
                const isPrev = status === "prev";
                const isNext = status === "next";
                const Icon = area.icon;

                return (
                  <motion.div
                    key={area.id}
                    initial={false}
                    animate={{
                      x: isActive ? 0 : isPrev ? -90 : isNext ? 90 : 0,
                      scale: isActive ? 1 : isPrev || isNext ? 0.87 : 0.7,
                      opacity: isActive ? 1 : isPrev || isNext ? 0.35 : 0,
                      rotate: isPrev ? -3 : isNext ? 3 : 0,
                      zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.8 }}
                    className={cn(
                      "absolute inset-0 rounded-[1.8rem] overflow-hidden border-4 border-white bg-white shadow-2xl origin-center",
                      isActive ? "cursor-pointer" : ""
                    )}
                    onClick={() => isActive && setDetailArea(area)}
                  >
                    <img
                      src={area.image}
                      alt={area.label}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-700",
                        isActive ? "grayscale-0" : "grayscale blur-[2px] brightness-75"
                      )}
                    />

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute inset-x-0 bottom-0 p-6 pt-28 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-white/20 backdrop-blur rounded-full px-3 py-1 flex items-center gap-1.5">
                              <Icon className="h-3 w-3 text-white" />
                              <span className="text-white text-[10px] font-semibold uppercase tracking-widest">{area.label}</span>
                            </div>
                          </div>
                          <p className="text-white font-semibold text-base leading-snug drop-shadow mb-3">{area.description}</p>
                          <ul className="space-y-1 mb-3">
                            {area.services.slice(0, 3).map((svc) => (
                              <li key={svc} className="flex items-center gap-2 text-white/80 text-xs">
                                <span className="w-1 h-1 bg-amber-400 rounded-full flex-shrink-0" />
                                {svc}
                              </li>
                            ))}
                          </ul>
                          {/* Tap to expand hint */}
                          <div className="flex items-center gap-1.5 text-white/60 text-xs">
                            <Expand className="h-3 w-3" />
                            <span>Tap to view full details</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className={cn("absolute top-5 right-5 transition-opacity duration-300", isActive ? "opacity-100" : "opacity-0")}>
                      <div className="bg-white/15 backdrop-blur rounded-full p-2">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Services list beside the card on large screens */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="hidden xl:flex flex-col gap-2 ml-6 max-w-[180px]"
              >
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Key Services</p>
                {active.services.map((svc) => (
                  <div key={svc} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-primary-600 rounded-full flex-shrink-0" />
                    <span className="text-gray-700 text-xs leading-snug">{svc}</span>
                  </div>
                ))}
                <button
                  onClick={() => setDetailArea(active)}
                  className="mt-4 bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-3 rounded-lg text-xs font-semibold transition-colors"
                >
                  Learn More →
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailArea && (
          <DetailModal area={detailArea} onClose={() => setDetailArea(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

export default PracticeCarousel;
