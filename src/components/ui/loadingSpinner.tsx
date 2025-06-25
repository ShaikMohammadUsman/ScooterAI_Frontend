import React from 'react';
import { motion, Variants } from 'framer-motion';

const scooterVariants: Variants = {
    ride: {
        x: [0, 80],
        transition: {
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 4,
            ease: 'linear',
        },
    },
};

const roadVariants: Variants = {
    move: {
        x: [0, -70],
        transition: {
            repeat: Infinity,
            duration: 1.2,
            ease: 'linear',
        },
    },
};

const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative flex flex-col items-center">
                {/* Scooter with simple left-to-right movement, positioned lower and more left */}
                <motion.div
                    className="relative z-10"
                    variants={scooterVariants}
                    animate="ride"
                    style={{ width: 128, height: 128, marginLeft: '-32px', marginTop: '32px' }}
                >
                    <img
                        src="/assets/images/scooterLogo.png"
                        alt="Scooter Logo"
                        className="w-32 h-32 object-contain drop-shadow-xl"
                        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.18))', marginTop: '32px' }}
                    />
                </motion.div>
                {/* Animated road (SVG) */}
                <div className="relative w-72 h-10 mt-2 overflow-hidden">
                    <svg width="100%" height="40" viewBox="0 0 320 40" className="absolute top-0 left-0 z-0">
                        {/* Road base */}
                        <rect x="0" y="18" width="320" height="12" rx="6" fill="#444" />
                        {/* Roadside grass */}
                        <rect x="0" y="30" width="320" height="6" fill="#b6e388" />
                    </svg>
                    {/* Animated dashed line */}
                    <motion.svg
                        width="360" height="40" viewBox="0 0 360 40"
                        className="absolute top-0 left-0 z-10"
                        variants={roadVariants}
                        animate="move"
                    >
                        <g>
                            {Array.from({ length: 20 }).map((_, i) => (
                                <rect
                                    key={i}
                                    x={i * 32}
                                    y={25}
                                    width={18}
                                    height={3}
                                    rx={2}
                                    fill="#ffe066"
                                />
                            ))}
                        </g>
                    </motion.svg>
                </div>
            </div>
            {text && <p className="text-gray-600 text-md font-semibold font-merienda mt-6">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
