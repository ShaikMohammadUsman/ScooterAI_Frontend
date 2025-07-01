"use client";

import {
  ArrowRight,
  Calendar1,
  IdCard,
  MonitorPlay,
  Trophy,
  UserSearch,
} from "lucide-react";
import React from "react";
import { easeOut, motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const fadeInVariant = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, easeOut },
  },
});

const About = () => {
  return (
    <div id="about" className="flex md:flex-row flex-col md:h-screen justify-between px-6 md:px-[8rem] bg-neutral-50 pt-[6rem] py-[6rem] text-neutral-800">
      <motion.div
        variants={fadeInVariant(0)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="flex md:flex-row flex-col justify-center md:justify-between pt-4 w-full md:w-6xl"
      >
        {/* Left Content */}
        <motion.div
          variants={fadeInVariant(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col gap-3 max-w-lg"
        >
          <motion.div
            variants={fadeInVariant(0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-[#cfff92] border-[1px] border-neutral-300 text-xs rounded-full px-6 text-neutral-900 py-1 uppercase z-50 w-fit"
          >
            <p>✨ About Us</p>
          </motion.div>
          <motion.h1
            variants={fadeInVariant(0.3)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-5xl font-medium tracking-tighter"
          >
            Meet the team
          </motion.h1>
          <motion.p
            variants={fadeInVariant(0.4)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-md text-neutral-700"
          >
            Together, they’re helping founders confidently hire sales talent.
          </motion.p>
        </motion.div>
      </motion.div>

      <div className="w-[100%] flex md:flex-row flex-col gap-6 items-center md:pt-0 pt-[4rem]">
        {/*Kartik*/}
        <motion.div
          variants={fadeInVariant(0.5)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-lg bg-neutral-100 p-6 text-neutral-800 h-fit border-[1px] border-neutral-300 space-y-2 md:w-full w-[90%]"
        >
          <Image
            src="/2.jpg"
            alt="mock"
            width={300}
            height={300}
            className="rounded-lg"
          />
          <h1 className="text-xl font-medium">Kartik Mandrekar</h1>
          <p className="text-sm leading-tight text-neutral-700 md:w-full max-w-xs">
            Kartik’s a sales leader with 15+ years of GTM experience.
          </p>
          <Link
            href="https://www.linkedin.com/in/kartik-mandrekar-3950865/"
            className={cn(buttonVariants)}
          >
            <Button className="bg-neutral-800 px-6 mt-2 rounded-full text-sm">
              View
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </motion.div>

        {/*Saumya*/}
        <motion.div
          variants={fadeInVariant(0.7)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-lg bg-neutral-100 p-6 text-neutral-800 h-fit border-[1px] border-neutral-300 space-y-2 w-[90%] md:w-full"
        >
          <Image
            src="/1.jpg"
            alt="mock"
            width={300}
            height={300}
            className="rounded-lg"
          />
          <h1 className="text-xl font-medium">Saumya Seth</h1>
          <p className="text-sm leading-tight text-neutral-700">
            Saumya’s a behavioral scientist obsessed with hiring right.
          </p>
          <Link
            href="https://www.linkedin.com/in/seth-saumya/"
            className={cn(buttonVariants)}
          >
            <Button className="bg-neutral-800 px-6 mt-2 rounded-full text-sm">
              View
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
