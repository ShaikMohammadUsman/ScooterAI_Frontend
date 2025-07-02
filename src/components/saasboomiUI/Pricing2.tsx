"use client";
import React from "react";
import { easeOut, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  CircleCheckBig,
  CircleX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeInVariant = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, easeOut },
  },
});

const Sales = () => {
  return (
    <div className="flex flex-col items-center h-auto md:px-[10rem] px-6 py-[6rem] gap-6 bg-neutral-900 text-white">
      <div className="flex flex-col items-center justify-center">
        <motion.div
          variants={fadeInVariant(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-[#cfff92] border-[1px] border-neutral-300 text-xs rounded-full px-6 text-neutral-900 py-1 uppercase z-50 w-fit"
        >
          <p>✨ Pricing</p>
        </motion.div>

        <motion.div
          variants={fadeInVariant(0.2)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col gap-3 max-w-2xl items-center justify-between text-center pt-4"
        >
          <h1 className="text-4xl font-medium tracking-tighter">
            What we offer
          </h1>
          <p className="text-md text-neutral-500 max-w-md">
            Special pricing for early access partners. No recruiter fees.
            High-signal outcomes.
          </p>
        </motion.div>
      </div>

      <div className="flex md:flex-col flex-col gap-10 pt-[4rem]">
        {/* Card 1 */}
        {/* <motion.div
          variants={fadeInVariant(0.4)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-neutral-100 rounded-md p-6 py-10 md:w-auto w-full md:max-w-3xl min-w-[50%] text-neutral-900 flex md:flex-row flex-col justify-between"
        >
          <div className="space-y-4 md:w-[50%] md:border-r-[1px] md:border-neutral-400 md:pr-4">
            <motion.div
              variants={fadeInVariant(0.5)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="flex items-center gap-2"
            >
              <CircleX className="rounded-md bg-red-200 p-1 text-red-500 size-5" />
              <h1 className="text-2xl font-medium">Traditional way</h1>
            </motion.div>

            <motion.div
              variants={fadeInVariant(0.6)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="border-b-[1px] border-neutral-400 pb-4"
            >
              <h1 className="text-neutral-500 text-sm max-w-md">
                This is 80% lower than recruiter fees — with 10x more signal.
              </h1>
            </motion.div>

            <motion.div
              variants={fadeInVariant(0.7)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="md:block hidden"
            >
              <div className="flex flex-col gap-2 justify-between w-full pt-4">
                <Button className="bg-neutral-800 px-6 rounded-full py-2 z-50 hover:cursor-pointer">
                  Stuck with this ?
                </Button>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={fadeInVariant(0.8)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="md:w-[50%] md:px-4 md:pt-0 pt-4 flex flex-col gap-4"
          >
            <h1 className="text-neutral-700 text-xl font-medium">
              What it really costs
            </h1>
            <div className="space-y-4 text-md">
              {[
                "₹50,000 per shortlist",
                "or 2% of CTC per hire",
                "Low signal hires",
                "Long hiring cycles",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  variants={fadeInVariant(0.9 + i * 0.1)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <X className="rounded-full bg-red-200 p-1 text-red-500 size-5" />
                  {text}
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeInVariant(1.3)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="md:hidden block"
            >
              <div className="flex flex-col gap-2 justify-between w-full pt-4">
                <Button className="bg-neutral-800 px-6 rounded-full py-2 z-50 hover:cursor-pointer">
                  Stuck with this ?
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div> */}

        {/* Card 2 */}
        <motion.div
          variants={fadeInVariant(1.5)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-[#cfff92] rounded-md p-6 py-10 md:w-auto w-full md:max-w-3xl min-w-[50%] text-neutral-900 flex md:flex-row flex-col justify-between"
        >
          <div className="space-y-4 md:w-[50%] md:border-r-[1px] md:border-neutral-700 md:pr-4">
            <motion.div
              variants={fadeInVariant(1.6)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="flex items-center gap-2"
            >
              <CircleCheckBig className="text-neutral-900 p-1 rounded-md bg-white" />
              <h1 className="text-2xl font-medium">SaasBoomi Special</h1>
            </motion.div>

            <motion.div
              variants={fadeInVariant(1.7)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="border-b-[1px] border-neutral-700 pb-4"
            >
              <h1 className="text-neutral-700 text-sm max-w-md">
                Usually a shortlist for a role would cost INR 50,000 or 2% of CTC (whichever is lower) but for SaaSBoomi founders this is discounted by 90% in exchange of feedback on the product
              </h1>
            </motion.div>

            <motion.div
              variants={fadeInVariant(1.8)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="md:block hidden"
            >
              <div className="flex flex-col gap-2 justify-between w-full pt-4">
                <a
                  href="https://thescooterai.typeform.com/salesrolexray"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-neutral-800 px-6 rounded-full py-2 z-50 hover:cursor-pointer">
                    Yes, I want it <ArrowRight className="size-5" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={fadeInVariant(1.9)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="md:w-[50%] md:px-4 md:pt-0 pt-4 flex flex-col gap-4"
          >
            <h1 className="text-neutral-700 text-xl font-medium">
              What you are saving:
            </h1>
            <div className="space-y-4 text-md">
              {[
                "4-6 weeks of hiring time",
                "₹75K–₹1L+ per hire in recruiter fees",
                "Dozens of hours screening resumes",
                "The hidden cost of a wrong hire often ₹5L–₹10L",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  variants={fadeInVariant(2.0 + i * 0.1)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <ChevronRight className="rounded-full bg-white p-1 text-neutral-900 size-5" />
                  {text}
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeInVariant(2.5)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="md:hidden block"
            >
              <div className="flex flex-col gap-2 justify-between w-full pt-4">
                <a
                  href="https://thescooterai.typeform.com/salesrolexray"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-neutral-800 px-6 rounded-full py-2 z-50 hover:cursor-pointer">
                    Yes, I want it <ArrowRight className="size-5" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Sales;
