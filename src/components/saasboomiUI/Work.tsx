"use client";
import { CalendarCheck, FileUser, LaptopMinimalCheck, MailCheck, TvMinimalPlay } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Ripple = () => {
  const [ripples, setRipples] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRipples((prev) => [...prev, Date.now()]);
    }, 1000); // One ripple every 1 second (adjust as needed)

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {ripples.map((id: any) => (
        <motion.div
          key={id}
          className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-green-300/30 via-green-400/20 to-green-500/10 border border-green-300/20"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{
            duration: 3,
            ease: "easeOut",
          }}
          onAnimationComplete={() => {
            // Remove ripple after it fades out to prevent buildup
            setRipples((prev) => prev.filter((item) => item !== id));
          }}
        />
      ))}
    </>
  );
};

const Work = () => {
  return (
    <div id="work" className="relative flex flex-col h-auto items-center px-6 md:px-[8rem] py-[6rem] bg-neutral-900 text-white">
      {/* Header Tag */}

      {/* Heading Section */}
      <div className="flex flex-col gap-3 max-w-2xl items-center text-center pt-4">
        <h1 className="text-5xl font-medium tracking-tighter">How It Works</h1>
        <p className="md:text-md text-sm text-neutral-400">
          Access a complete toolkit — from behavior-based assessments to
          strategic guidance — designed to help you hire the right sales reps,
          faster and smarter.
        </p>
      </div>

      {/* Plus Sign and Step Cards */}
      <div className="relative w-full max-w-2xl aspect-square mt-20">
        {/* Vertical Line */}
        <div className="absolute inset-y-0 left-1/2 w-px transform -translate-x-1/2 opacity-60 bg-gradient-to-b from-transparent via-white to-transparent"></div>

        {/* Horizontal Line */}
        <div className="absolute inset-x-0 top-1/2 h-px transform -translate-y-1/2 opacity-60 bg-gradient-to-r from-transparent via-white to-transparent"></div>

        {/* Ripple + Icon */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <Ripple />
            <MailCheck className="text-green-400 z-10 w-6 h-6" />
          </div>
        </div>

        {/* Step Cards */}
        <div className="absolute w-[50%] top-[22%] md:top-[25%] left-[22%] md:left-[25%] -translate-x-1/2 -translate-y-1/2 px-4 py-2 text-sm flex flex-col md:text-center md:items-center gap-1">
          <CalendarCheck className="bg-neutral-800 rounded-md p-2 size-10 md:size-12 mb-4" />
          <h1 className="md:text-2xl text-md tracking-tight leading-tight">
            Tell us who you are hiring
          </h1>
          <p className="md:text-sm text-xs text-neutral-400 max-w-xs">
            {" "}
            Share your goals, role requirements, and must-haves.
          </p>
        </div>
        <div className="absolute w-[50%] top-[22%] md:top-[25%] right-[25%] translate-x-1/2 -translate-y-1/2  px-4 py-2  text-sm flex flex-col md:text-center md:items-center gap-1">
          <TvMinimalPlay className="bg-neutral-800 rounded-md p-2 size-10 md:size-12 mb-4" />
          <h1 className="md:text-2xl text-md tracking-tight leading-tight">
            We screen for you
          </h1>
          <p className="md:text-sm text-xs text-neutral-400 max-w-xs">
            {" "}
            Candidates complete async video prompts and behavior-based assessments
          </p>{" "}
        </div>
        <div className="absolute w-[50%] bottom-[20%] md:bottom-[25%] left-[22%] md:left-[25%] -translate-x-1/2 translate-y-1/2  px-4 py-2 text-sm flex flex-col md:text-center md:items-center gap-1">
          <FileUser className="bg-neutral-800 rounded-md p-2 size-10 md:size-12 mb-4" />
          <h1 className="md:text-2xl text-md tracking-tight leading-tight">
            You get a ranked shortlist
          </h1>
          <p className="md:text-sm text-xs text-neutral-400 max-w-xs">
            {" "}
            Each profile includes structured scorecards, behavioral traits, and voice/video responses.



          </p>{" "}
        </div>
        <div className="absolute w-[50%] bottom-[20%] md:bottom-[25%] right-[25%] translate-x-1/2 translate-y-1/2 px-4 py-2 flex flex-col md:text-center md:items-center gap-1 text-sm">
          <LaptopMinimalCheck className="bg-neutral-800 rounded-md p-2 size-10 md:size-12 mb-4" />
          <h1 className="md:text-2xl text-md tracking-tight leading-tight">
            Hire with confidence

          </h1>
          <p className="md:text-sm text-xs text-neutral-400 max-w-xs">
            {" "}
            No resume roulette. No recruiter noise. Just signal-rich candidates, ready to interview.
          </p>{" "}
        </div>
      </div>
    </div>
  );
};

export default Work;
