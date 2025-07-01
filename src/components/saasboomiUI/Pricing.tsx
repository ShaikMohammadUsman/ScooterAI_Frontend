'use client'

import { ArrowRight, BellPlus, Check } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { easeOut, motion } from "framer-motion";

const fadeInVariant = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, easeOut },
  },
});

const Pricing = () => {
  return (
    <div id="pricing" className="flex flex-col h-auto justify-center items-center px-6 md:px-[8rem] bg-neutral-50 pt-[6rem] py-[6rem] text-neutral-800">
      <motion.div
        variants={fadeInVariant(0)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="flex md:flex-row flex-col justify-center md:justify-between items-center pt-4 w-full md:w-6xl"
      >
        {/* Left Content */}
        <motion.div
          variants={fadeInVariant(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col gap-3 max-w-lg"
        >
          <motion.h1
            variants={fadeInVariant(0.3)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-5xl font-medium tracking-tighter"
          >
            Why now ?
          </motion.h1>
          <motion.p
            variants={fadeInVariant(0.4)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-md text-neutral-700"
          >
            If you're scaling GTM, you're likely hiring 5–10 salespeople this
            year. One in three will miss quota or churn early.
          </motion.p>
          <motion.p
            variants={fadeInVariant(0.5)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-md text-neutral-700"
          >
            Scooter helps you avoid those mistakes using behavior science and
            real voice/video responses instead of resumes or gut feel.
          </motion.p>
          <motion.div
            variants={fadeInVariant(0.6)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Button className="bg-neutral-800 px-6 w-fit rounded-full py-6 z-50 hover:cursor-pointer">
              Get started <ArrowRight className="size-5" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Right Card */}
        <motion.div
          variants={fadeInVariant(0.7)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-xl bg-neutral-100 border-[1px] flex flex-col gap-6 border-neutral-300 p-6 w-full md:w-sm mt-[4rem]"
        >
          <motion.div
            variants={fadeInVariant(0.8)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="flex justify-between items-center"
          >
            <BellPlus />
            <h1 className="text-neutral-500 text-md">
              <span className="text-3xl tracking-tighter font-semibold text-neutral-800">
                <del>INR 50,000</del><br />
                <span className="text-neutral-800">₹ 5,000</span>
              </span>{" "}
              / for early access
            </h1>
          </motion.div>

          <motion.div
            variants={fadeInVariant(0.9)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="flex items-center gap-3"
          >
            <h1 className="text-2xl font-medium">Pro</h1>
            <div className="bg-[#cfff92] w-fit border-[1px] border-neutral-300 text-xs rounded-full px-3 py-1 z-50">
              <p>Early Access</p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInVariant(1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <p className="text-lg text-neutral-600">
              We’re prioritizing startups actively hiring in the next 60 days.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInVariant(1.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Button className="bg-neutral-800 rounded-full w-full font-medium py-4">
              Get started
            </Button>
          </motion.div>

          <motion.div
            variants={fadeInVariant(1.2)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-white rounded-xl border-[1px] border-neutral-300 p-6 py-8"
          >
            <h1 className="text-lg text-neutral-600 leading-tight">
              This program is designed for:
            </h1>
            <div className="flex flex-col gap-3 text-md pt-6">
              {[
                "Saas or AI Startups",
                "Teams with 1-10 people",
                "Founders hiring sales talent",
                "Teams that want signal not noise",
              ].map((text, index) => (
                <motion.div
                  key={index}
                  variants={fadeInVariant(1.3 + index * 0.1)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <Check className="text-neutral-800 bg-[#cfff92] rounded-full p-1 size-6" />
                  {text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Pricing;
