"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedFormContainerProps {
    children: React.ReactNode;
    direction: "left" | "right";
    stepKey: string | number;
}

export default function AnimatedFormContainer({ children, direction, stepKey }: AnimatedFormContainerProps) {
    const slideVariants = {
        enter: {
            x: direction === "left" ? 300 : -300,
            opacity: 0
        },
        center: {
            x: 0,
            opacity: 1
        },
        exit: {
            x: direction === "left" ? -300 : 300,
            opacity: 0
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={stepKey}
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                }}
                className="w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
} 