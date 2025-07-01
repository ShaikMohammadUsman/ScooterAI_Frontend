'use client'

import {
  Calendar1,
  IdCard,
  MonitorPlay,
  Trophy,
  UserSearch,
} from "lucide-react";
import React from "react";
import { easeOut, motion } from "framer-motion";

const fadeInVariant = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, easeOut },
  },
});

const Benefit = () => {
  return (
    <div className="flex flex-col items-center h-auto px-6 md:px-[6rem] bg-neutral-50 py-[6rem] text-neutral-800">
      <motion.div
        variants={fadeInVariant(0)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-[#cfff92] border-[1px] border-neutral-300 text-xs rounded-full px-6 py-1 uppercase z-50"
      >
        <p>✨ Our toolkit</p>
      </motion.div>

      <motion.div
        variants={fadeInVariant(0.2)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="flex flex-col gap-3 max-w-2xl items-center justify-between text-center pt-4"
      >
        <h1 className="text-5xl font-medium tracking-tighter">What you get</h1>
        <p className="text-md text-neutral-700">
          Access a complete toolkit — from behavior-based assessments to
          strategic guidance — designed to help you hire the right sales reps,
          faster and smarter.
        </p>
      </motion.div>

      <div className="flex md:flex-row flex-col gap-14 w-full md:max-w-4xl items-center justify-center pt-[4rem]">
        {/* Tangible Tools */}
        <motion.div
          variants={fadeInVariant(0.4)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-3xl bg-stone-200 p-4 w-full md:min-w-[40%] hover:cursor-pointer hover:scale-[1.006] duration-300 transition-all"
        >
          <div className="rounded-3xl bg-neutral-800 p-6 text-white min-h-[60vh]">
            <h1 className="text-2xl font-medium tracking-tighter text-center underline underline-offset-4">
              Tangible Tools
            </h1>
            <div className="flex flex-col pt-[2rem] gap-6 text-neutral-400 px-3">
              {[
                {
                  icon: <IdCard className="text-neutral-100" />,
                  title: "Structured scorecards",
                  desc: "See how each rep ranks on key behaviors",
                },
                {
                  icon: <MonitorPlay className="text-neutral-100" />,
                  title: "Async video assessments",
                  desc: "Candidates pitch, respond, and solve on their own time",
                },
                {
                  icon: <Trophy className="text-neutral-100" />,
                  title: "Ranked shortlist",
                  desc: "Only the most aligned reps, vetted and ready",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInVariant(0.5 + index * 0.2)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  className="border-b-[1px] border-neutral-400 pb-2"
                >
                  {item.icon}
                  <div className="pt-3">
                    <p className="text-md text-neutral-200">{item.title}</p>
                    <p className="text-xs">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Strategic Support */}
        <motion.div
          variants={fadeInVariant(0.6)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-3xl bg-neutral-800 p-4 w-full md:min-w-[40%] hover:cursor-pointer hover:scale-[1.006] duration-300 transition-all"
        >
          <div className="rounded-3xl bg-neutral-100 p-6 text-neutral-800 min-h-[60vh]">
            <h1 className="text-2xl font-medium tracking-tighter text-center underline underline-offset-4">
              Clear Outcomes
            </h1>
            <div className="flex flex-col pt-[2rem] gap-6 p-3">
              {[
                {
                  icon: <UserSearch />,
                  title: "1 high-signal shortlist for you next hire",
                  desc: "See your candidates in action before your first interview",
                },
                {
                  icon: <Calendar1 />,
                  title: "1:1 Session",
                  desc: "Clarity on ctc, motion, role, onboarding for your first hire",
                },

              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInVariant(0.7 + index * 0.2)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  className="border-b-[1px] border-neutral-400 pb-2"
                >
                  {item.icon}
                  <div className="pt-3">
                    <p className="text-md">{item.title}</p>
                    <p className="text-xs">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Benefit;
