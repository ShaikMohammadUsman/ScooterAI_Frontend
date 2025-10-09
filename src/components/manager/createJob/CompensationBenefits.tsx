"use client"

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";

type Props = {
    form: UseFormReturn<any>;
    onBack: () => void;
    submitting?: boolean;
};

export default function CompensationBenefits({ form, onBack, submitting }: Props) {
    const addChallenge = () => {
        const current: string[] = (form.getValues('challenges') as string[] | undefined) || [];
        form.setValue('challenges', [...current, ''], { shouldDirty: true, shouldValidate: false });
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-base font-medium">Compensation & Benefits</h2>
                <p className="text-xs text-muted-foreground mt-1">Share salary range and what makes this role exciting.</p>
            </div>
            <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Base Salary Range */}
                <div className="">
                    <FormLabel className="mb-2 block">Base Salary Range *</FormLabel>
                    <div className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">Currency</FormLabel>
                                    <FormControl className="w-20">
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-20 p-2">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">₹ INR</SelectItem>
                                                <SelectItem value="USD">$ USD</SelectItem>
                                                <SelectItem value="EUR">€ EUR</SelectItem>
                                                <SelectItem value="GBP">£ GBP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-row gap-4 justify-start">
                            <FormField
                                control={form.control}
                                name="salaryFrom"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">From</FormLabel>
                                        <FormControl>
                                            <Input placeholder="₹ 12,00,000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="salaryTo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">To</FormLabel>
                                        <FormControl>
                                            <Input placeholder="₹ 15,00,000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Commission Structure */}
                <FormField
                    control={form.control}
                    name="oteStructure"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Commission Structure</FormLabel>
                            <FormControl>
                                <Textarea rows={5} placeholder="Add specific commission details or variable pay" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 3. What Makes This Opportunity Exciting */}
                <FormField
                    control={form.control}
                    name="opportunityHighlights"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>What Makes This Opportunity Exciting *</FormLabel>
                            <FormControl>
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-3">
                                        {(() => {
                                            const defaults = [
                                                "Fast-growing company",
                                                "Great team culture",
                                                "Market Leader",
                                                "Learning Opportunities",
                                                "Career Growth",
                                                "Innovative Product",
                                                "International Exposure",
                                                "Startup Environment",
                                                "Flexible Work",
                                                "High Earning Potential",
                                            ];
                                            const current: string[] = field.value || [];
                                            const extras = current.filter((v) => !defaults.includes(v));
                                            const all = [...defaults, ...extras];
                                            return all.map((opt) => {
                                                const selected = current.includes(opt);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={opt}
                                                        onClick={() => {
                                                            const set = new Set<string>(current);
                                                            if (set.has(opt)) set.delete(opt); else set.add(opt);
                                                            field.onChange(Array.from(set));
                                                        }}
                                                        className={`px-4 py-2 rounded-full text-sm ${selected ? 'bg-purple-200 text-gray-900' : 'bg-purple-100 text-gray-700'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                );
                                            });
                                        })()}
                                    </div>
                                    <Input
                                        placeholder="Add another highlight and press Enter"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = (e.target as HTMLInputElement).value.trim();
                                                if (val) {
                                                    const set = new Set<string>((field.value || []) as string[]);
                                                    set.add(val);
                                                    field.onChange(Array.from(set));
                                                    (e.target as HTMLInputElement).value = '';
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                {/* 4. Key Challenges */}
                <div className="relative">
                    <FormLabel className="mb-2 block">Key Challenges</FormLabel>
                    <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
                        {(form.watch('challenges') as string[] | undefined)?.map((_, i) => (
                            <FormField
                                key={i}
                                control={form.control}
                                name={`challenges.${i}` as any}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                rows={3}
                                                placeholder={`Challenge ${i + 1}`}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex justify-end mt-3">
                        <Button type="button" variant="outline" onClick={addChallenge}>
                            Add
                        </Button>
                    </div>
                </div>

                {/* 5. Language */}
                <FormField
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Language</FormLabel>
                            <FormControl>
                                <MultiSelect
                                    instanceId="languages"
                                    options={[
                                        "English",
                                        "Hindi",
                                        "Spanish",
                                        "French",
                                        "German",
                                        "Italian",
                                        "Portuguese",
                                        "Russian",
                                        "Chinese (Mandarin)",
                                        "Japanese",
                                        "Korean",
                                        "Arabic",
                                        "Dutch",
                                        "Swedish",
                                        "Norwegian",
                                        "Danish",
                                        "Finnish",
                                        "Polish",
                                        "Czech",
                                        "Hungarian",
                                        "Romanian",
                                        "Bulgarian",
                                        "Croatian",
                                        "Serbian",
                                        "Slovak",
                                        "Slovenian",
                                        "Estonian",
                                        "Latvian",
                                        "Lithuanian",
                                        "Greek",
                                        "Turkish",
                                        "Hebrew",
                                        "Persian",
                                        "Urdu",
                                        "Bengali",
                                        "Tamil",
                                        "Telugu",
                                        "Marathi",
                                        "Gujarati",
                                        "Punjabi",
                                        "Kannada",
                                        "Malayalam",
                                        "Odia",
                                        "Assamese",
                                        "Nepali",
                                        "Sinhala",
                                        "Thai",
                                        "Vietnamese",
                                        "Indonesian",
                                        "Malay",
                                        "Filipino",
                                        "Swahili",
                                        "Amharic",
                                        "Yoruba",
                                        "Igbo",
                                        "Hausa",
                                        "Zulu",
                                        "Afrikaans",
                                        "Other"
                                    ]}
                                    selected={field.value || []}
                                    onChange={field.onChange}
                                    placeholder="Select languages"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="flex justify-center">
                <div className="text-center">
                    <Button variant="primary" type="submit" className="w-full sm:w-auto" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Confirm'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Step 3/3</p>
                </div>
            </div>
        </div>
    );
}


