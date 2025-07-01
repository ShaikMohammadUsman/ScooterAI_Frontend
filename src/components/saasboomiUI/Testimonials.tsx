'use client'

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

// Testimonials data
const testimonials = [
  {
    name: 'Pawanjeet Singh',
    title: 'VP Sales',
    company: 'DemandFarm',
    quote:
      'What stood out for me was being able to watch the candidate’s video and see real deal history before the first call. It gave me a clear sense of how they actually sell. I didn’t have to waste time on interviews that go nowhere.',
  },
  {
    name: 'Gopala Naidu',
    title: 'Founder',
    company: 'Macroni Technologies',
    quote:
      'We don’t have an HR or TA team, so we handed the entire process over to Scooter. They took our JD, ran the whole thing, and gave us a shortlist of people who were actually a great fit. It was like having a plug-and-play hiring team.',
  },
  {
    name: 'Naqisa Silva',
    title: 'CEO',
    company: 'Discover Resorts',
    quote:
      'We made a hire in under a week. No resume scanning, no job posting fatigue. Just saw how someone spoke and sold, and knew right away if they’d work for our team and customers. It made the decision easy.',
  },
];

// Sequential fade-in variant
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.3,
    },
  }),
};

const Testimonials = () => {
  const [api, setApi] = React.useState<CarouselApi>();

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="flex flex-col h-auto justify-center items-center px-6 md:px-[8rem] pt-[6rem] text-neutral-800"
    >
      <motion.div
        variants={fadeInUp}
        custom={0}
        className="flex md:flex-row flex-col justify-center md:justify-between pt-4 w-full md:w-6xl"
      >
        <motion.div variants={fadeInUp} custom={1} className="flex flex-col gap-3 max-w-lg">
          <div className="bg-[#cfff92] w-fit border-[1px] border-neutral-300 text-xs rounded-full px-6 py-1 uppercase z-50">
            <p>✨ Case studies</p>
          </div>
          <h1 className="text-5xl font-medium tracking-tighter">What Founders Say</h1>
          <p className="text-md text-neutral-700">
            Hear directly from the entrepreneurs, founders, and teams we've
            worked with. Real experiences. Real results.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} custom={2} className="md:w-md md:pt-0 pt-[4rem]">
          <Carousel setApi={setApi}>
            <CarouselContent>
              {testimonials.map((item, index) => (
                <CarouselItem key={index}>
                  <motion.div
                    variants={fadeInUp}
                    custom={index + 3}
                    className="bg-neutral-100 space-y-6 border-[1px] border-neutral-300 p-6 rounded-xl w-full md:w-md"
                  >
                    <div className="flex gap-1">
                      <Star className="fill-[#cfff92] text-[#cfff92]" />
                      <Star className="fill-[#cfff92] text-[#cfff92]" />
                      <Star className="fill-[#cfff92] text-[#cfff92]" />
                      <Star className="fill-[#cfff92] text-[#cfff92]" />
                      <Star className="fill-neutral-300 text-neutral-300" />
                    </div>
                    <p className="md:text-lg text-sm text-neutral-700">“{item.quote}”</p>
                    <div>
                      <h1 className="md:text-xl text-lg font-medium">{item.name}</h1>
                      <p className="text-sm italic">
                        {item.title}, {item.company}
                      </p>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <motion.div
            variants={fadeInUp}
            custom={testimonials.length + 3}
            className="flex gap-4 pt-4 justify-center items-center"
          >
            <Button onClick={() => api?.scrollPrev()} className="bg-neutral-800 rounded-full p-2">
              <ArrowRight className="size-4 -rotate-180 fill-white" />
            </Button>
            <Button onClick={() => api?.scrollNext()} className="bg-neutral-800 rounded-full p-2">
              <ArrowRight className="size-4 fill-white" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Testimonials;
