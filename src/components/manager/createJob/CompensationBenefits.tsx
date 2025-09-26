"use client"

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Props = {
    form: UseFormReturn<any>;
    onBack: () => void;
};

export default function CompensationBenefits({ form, onBack }: Props) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-base font-medium">Compensation & Benefits</h2>
                <p className="text-xs text-muted-foreground mt-1">Share salary range and what makes this role exciting.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Currency *</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="₹">₹</SelectItem>
                                        <SelectItem value="$">$</SelectItem>
                                        <SelectItem value="€">€</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="salaryFrom"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>From *</FormLabel>
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
                                <FormLabel>To *</FormLabel>
                                <FormControl>
                                    <Input placeholder="₹ 15,00,000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <FormField
                control={form.control}
                name="opportunityHighlights"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>What Makes This Opportunity Exciting *</FormLabel>
                        <FormControl>
                            <Input placeholder="Add tags, separated by commas" value={field.value?.join(", ") || ""} onChange={(e) => field.onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="opportunityNote"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tell us more about what makes this role special</FormLabel>
                        <FormControl>
                            <Textarea rows={4} placeholder="Details" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="oteStructure"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>OTE Structure</FormLabel>
                            <FormControl>
                                <Textarea rows={5} placeholder="Add specific commission details or variable pay" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-rows-3 gap-4">
                    {[0, 1, 2].map((i) => (
                        <FormField
                            key={i}
                            control={form.control}
                            name={`challenges.${i}` as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Key Challenge {i + 1}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={`Challenge ${i + 1}`} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
            </div>

            <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                            <Input placeholder="English, Hindi, Marathi" value={field.value?.join(", ") || ""} onChange={(e) => field.onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onBack}>Back</Button>
                {/* Submit button is rendered in parent form */}
            </div>
        </div>
    );
}


