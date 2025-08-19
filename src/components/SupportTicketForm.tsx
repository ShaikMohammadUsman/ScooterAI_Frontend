"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from '@/hooks/use-toast'
import { submitSupportTicket } from '@/lib/userService'
import { Copy } from 'lucide-react'

export interface SupportTicketFormValues {
    name: string
    email: string
    phonenumber: string
    description: string
    screenshot?: FileList
}

export default function SupportTicketForm({ onSubmitted }: { onSubmitted?: () => void }) {
    const form = useForm<SupportTicketFormValues>({
        defaultValues: {
            name: '',
            email: '',
            phonenumber: '',
            description: '',
        }
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [fileKey, setFileKey] = useState<number>(Date.now())
    const [referenceNumber, setReferenceNumber] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const onSubmit = async (values: SupportTicketFormValues) => {
        try {
            setIsSubmitting(true)
            const fileInput = (values as any).screenshot as FileList | undefined
            const screenshot = fileInput && fileInput.length > 0 ? fileInput[0] : undefined
            const res = await submitSupportTicket({
                name: values.name,
                email: values.email,
                phonenumber: `+91${values.phonenumber}`,
                description: values.description,
                screenshot,
            })
            const ref = (res as any)?.reference_number || (res as any)?.ticket_id || null
            setReferenceNumber(ref)
            toast({ title: 'Submitted', description: 'Your support ticket was submitted successfully.' })
            form.reset()
            setFileKey(Date.now())
        } catch (err: any) {
            toast({ title: 'Submission failed', description: err.message || 'Please try again later.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (referenceNumber) {
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Issue submitted successfully</h3>
                    <p className="text-sm text-muted-foreground">Our team will contact you shortly.</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-medium">Reference number</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-lg border bg-gray-50 px-3 py-2 font-mono text-sm select-all">
                            {referenceNumber}
                        </div>
                        <Button type="button" variant="outline" onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(referenceNumber)
                                setCopied(true)
                                toast({ title: 'Copied', description: 'Reference number copied to clipboard.' })
                                setTimeout(() => setCopied(false), 1500)
                            } catch {
                                toast({ title: 'Oops!', description: 'Cannot copy to clipboard.', variant: 'destructive' })

                            }
                        }}>
                            <Copy className="h-4 w-4 mr-2" /> {copied ? 'Copied' : 'Copy'}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your name" autoComplete="name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    rules={{ required: 'Email is required', pattern: { value: /[^@\s]+@[^@\s]+\.[^@\s]+/, message: 'Invalid email' } }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phonenumber"
                    rules={{
                        required: 'Phone number is required',
                        pattern: { value: /^[0-9]{10}$/, message: 'Enter 10 digits' }
                    }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone number</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                    <div className="h-11 px-3 inline-flex items-center rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 text-sm select-none">
                                        +91
                                    </div>
                                    <Input
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder="9876543210"
                                        autoComplete="tel-national"
                                        value={field.value}
                                        onChange={(e) => {
                                            const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10)
                                            field.onChange(digitsOnly)
                                        }}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    rules={{ required: 'Description is required', minLength: { value: 5, message: 'Minimum 5 characters' } }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea rows={4} placeholder="Describe your issue or question" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="screenshot"
                    render={({ field: { onChange, value, ref, name, ...rest } }) => (
                        <FormItem>
                            <FormLabel>Screenshot (optional)</FormLabel>
                            <FormControl>
                                <Input key={fileKey} type="file" accept="image/*" name={name} ref={ref as any} onChange={(e) => onChange(e.target.files)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="pt-2 flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</Button>
                </div>
            </form>
        </Form>
    )
}


