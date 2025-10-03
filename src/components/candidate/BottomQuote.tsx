import { QuoteIcon } from '@radix-ui/react-icons';
import { LucideQuote } from 'lucide-react';
import React from 'react';

interface BottomQuoteProps {
    quote: string;
    icon?: React.ReactNode;
}

function BottomQuote(props: BottomQuoteProps) {
    return (
        <div className='relative flex justify-center items-center gap-4'>
            <blockquote className="relative z-10 text-gray-700 text-sm leading-relaxed mb-4">
                {props.quote}
            </blockquote>
            {
                props.icon && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                        {props.icon}
                    </div>
                )
            }
            <div className='absolute z-0 top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%]'>
                <QuoteIcon className='h-24 w-24 text-bg-secondary-4 transform -rotate-180' />
            </div>
        </div>
    )
}

export default BottomQuote;