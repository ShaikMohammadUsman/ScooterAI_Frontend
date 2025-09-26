"use client"

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type Props = {
    form: UseFormReturn<any>;
    onBack: () => void;
    onNext: () => void;
};

export default function ExperienceSkills({ form, onBack, onNext }: Props) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-base font-medium">Experience & Skills</h2>
                <p className="text-xs text-muted-foreground mt-1">Define the skills and experience expectations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Years of Experience Required *</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0-1">0-1 Years</SelectItem>
                                        <SelectItem value="2-3">2-3 Years</SelectItem>
                                        <SelectItem value="3-5">3-5 Years</SelectItem>
                                        <SelectItem value=">5">5+ Years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location *</FormLabel>
                            <FormControl>
                                <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., US East overlap (2-4h)" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="mustHaveSkills"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Must-Have Skills/Experience/Tools *</FormLabel>
                            <FormControl>
                                <Input placeholder="Type and separate with commas" value={field.value?.join(", ") || ""} onChange={(e) => field.onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="workLocationTypes"
                    render={({ field }) => {
                        const value: string[] = field.value || [];
                        const toggle = (key: string) => {
                            const next = value.includes(key) ? value.filter((v) => v !== key) : [...value, key];
                            field.onChange(next);
                        };
                        return (
                            <div className="sm:col-span-3 grid grid-cols-3 gap-6">
                                {[{ k: "in_person", label: "In-Person" }, { k: "hybrid", label: "Hybrid" }, { k: "remote", label: "Remote" }].map(({ k, label }) => (
                                    <div key={k} className="flex items-center gap-2">
                                        <Switch checked={value.includes(k)} onCheckedChange={() => toggle(k)} id={`wl-${k}`} />
                                        <label htmlFor={`wl-${k}`} className="text-sm cursor-pointer">{label}</label>
                                    </div>
                                ))}
                            </div>
                        )
                    }}
                />
            </div>

            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onBack}>Back</Button>
                <Button type="button" onClick={onNext}>Next</Button>
            </div>
        </div>
    );
}


