"use client";

import React from "react";
import { easeOut, motion } from "framer-motion";
import { AnimatedGridPattern } from "@/components/magicui/grid-pattern";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AvatarCirclesDemo } from "@/components/saasboomiUI/AvatarCirclesDemo";
import { ArrowRight } from "lucide-react";

const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      easeOut,
    },
  },
});

const Hero = () => {
  return (
    <div className="flex md:justify-center md:items-center h-screen md:h-[90vh] md:pt-0 pt-[10rem] relative overflow-hidden">
      <AnimatedGridPattern
        numSquares={20}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "absolute inset-0 w-full h-screen opacity-58",
          "[mask-image:linear-gradient(to_bottom,white_52%,transparent)]",
          "mask-size-100 mask-repeat-no-repeat",
          "pointer-events-none"
        )}
      />

      <div className="flex flex-col md:justify-center items-center text-center md:px-0 px-3 md:max-w-3xl gap-6 text-neutral-800">
        <motion.div
          variants={fadeIn(0.1)}
          initial="hidden"
          animate="visible"
          className="bg-neutral-100 border-[1px] border-neutral-300 text-xs rounded-full px-8 py-1 uppercase z-40"
        >
          <p>✨ Early access is limited</p>
        </motion.div>

        <motion.h1
          variants={fadeIn(0.3)}
          initial="hidden"
          animate="visible"
          className="md:text-[1.5rem] text-2xl tracking-tighter md:leading-normal leading-tight"
        >
          <span className="md:text-[4rem] text-3xl font-medium tracking-tighter leading-10">
            Hiring sales reps ?
          </span>
          <br /> Stop wasting weeks on searching, screening and second-guessing.
        </motion.h1>

        <motion.p
          variants={fadeIn(0.5)}
          initial="hidden"
          animate="visible"
          className="md:text-lg text-sm max-w-xl text-neutral-600"
        >
          Get a high-fit shortlist. Fast, accurate and built for SaaSBoomi Founders
        </motion.p>

        <motion.div
          variants={fadeIn(0.7)}
          initial="hidden"
          animate="visible"
          className="flex items-center"
        >
          <Button className="bg-neutral-800 px-6 rounded-full py-6 z-40 hover:cursor-pointer">
            Apply for early access <ArrowRight className="size-5" />
          </Button>
        </motion.div>

        <motion.div
          variants={fadeIn(0.9)}
          initial="hidden"
          animate="visible"
          className="flex md:flex-row flex-col items-center absolute bottom-[20%] md:bottom-[10%] gap-2"
        >
          <AvatarCirclesDemo />
          <p className="text-xs max-w-xs">
            Join our early access program. Discounted by 90% for SaaSBoomi
            founders.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
