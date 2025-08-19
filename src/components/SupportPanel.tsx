"use client"
import React, { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import SupportTicketForm from '@/components/SupportTicketForm'
import { LifeBuoy, X, HelpCircle, Handshake } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { usePathname } from 'next/navigation'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function SupportPanel() {
    const pathname = usePathname()
    const isInterview = useMemo(() => pathname?.startsWith('/interview'), [pathname])
    const [ticketOpen, setTicketOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    const openWhatsApp = () => {
        const text = encodeURIComponent('Hi ScooterAI support')
        const number = '917709279309' // +91 77092 79309 without symbols/spaces
        const url = `https://wa.me/${number}?`
        if (typeof window !== 'undefined') window.open(url, '_blank')
    }

    if (isInterview) {
        return null
    }

    // if (isInterview) {
    //     // Compact vertical actions during interview
    //     return (
    //         <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
    //             <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
    //                 <DialogTrigger asChild>
    //                     <Button size="icon" variant="secondary" aria-label="Support">
    //                         <LifeBuoy className="h-5 w-5" />
    //                     </Button>
    //                 </DialogTrigger>
    //                 <DialogContent>
    //                     <DialogTitle>Submit a support ticket</DialogTitle>
    //                     <SupportTicketForm onSubmitted={() => setTicketOpen(false)} />
    //                 </DialogContent>
    //             </Dialog>
    //             <Button size="icon" variant="secondary" aria-label="WhatsApp" onClick={openWhatsApp}>
    //                 <FaWhatsapp className="h-5 w-5" />
    //             </Button>
    //         </div>
    //     )
    // }

    // Non-interview: right-center floating button that toggles a small menu
    return (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex items-center">
            {menuOpen && (
                <div className="mr-3 flex flex-col gap-3 bg-white/90 backdrop-blur rounded-xl shadow-lg p-3 border">
                    <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="secondary" aria-label="Support Ticket">
                                <Handshake className="h-5 w-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>Submit a support ticket</DialogTitle>
                            <SupportTicketForm onSubmitted={() => setTicketOpen(false)} />
                        </DialogContent>
                    </Dialog>
                    <Button size="icon" variant="secondary" aria-label="WhatsApp" onClick={openWhatsApp}>
                        <FaWhatsapp className="h-5 w-5" />
                    </Button>
                </div>
            )}
            <TooltipProvider>
                <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                        <Button
                            className='bg-black text-white rounded-full shadow-xl transition-transform duration-200 hover:scale-105'
                            size="icon"
                            variant={menuOpen ? 'destructive' : 'default'}
                            aria-label={menuOpen ? 'Close support menu' : 'Open support menu'}
                            onClick={() => setMenuOpen((v) => !v)}
                        >
                            {menuOpen ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
                        </Button>
                    </TooltipTrigger>
                    {!menuOpen && (
                        <TooltipContent side="left">Need Help ?</TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}


