"use client"

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";

type Props = {
    form: UseFormReturn<any>;
    onBack: () => void;
    onNext: () => void;
    submitting?: boolean;
};

export default function ExperienceSkills({ form, onBack, onNext, submitting }: Props) {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-base font-medium">Experience & Skills</h2>
                <p className="text-xs text-muted-foreground mt-1">Define the skills and experience expectations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2 block">Years of Experience Required *</FormLabel>
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
                    name="mustHaveSkills"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2 block">Must-Have Skills/Experience/Tools *</FormLabel>
                            <FormControl>
                                <MultiSelect
                                    instanceId="must-have-skills"
                                    options={[
                                        "Field Sales",
                                        "Inside Sales",
                                        "Outbound",
                                        "Prospecting",
                                        "Negotiation",
                                        "CRM",
                                        "Salesforce",
                                        "HubSpot",
                                        "Outreach",
                                        "Salesloft",
                                        "Cold Calling",
                                        "Email Sequences",
                                    ]}
                                    selected={field.value || []}
                                    onChange={field.onChange}
                                    placeholder="Field Sales, Inside Sales, Outreach, Salesloft"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="workLocationType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2 block">Work Location Type *</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select work location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="inPerson">In-Person</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                        <SelectItem value="remote">Remote</SelectItem>
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
                            <FormLabel className="mb-2 block">Location *</FormLabel>
                            <FormControl>
                                <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2 block">Timezone</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="US East overlap (2-4h)">US East overlap (2-4h)</SelectItem>
                                        <SelectItem value="US West overlap (2-4h)">US West overlap (2-4h)</SelectItem>
                                        <SelectItem value="EMEA overlap (2-4h)">EMEA overlap (2-4h)</SelectItem>
                                        <SelectItem value="IST">India Standard Time (IST)</SelectItem>
                                        <SelectItem value="GMT">GMT</SelectItem>
                                        <SelectItem value="Any">Any</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-center">
                <Button type="button" variant="primary" onClick={onNext} disabled={submitting}>
                    {submitting ? 'Saving...' : 'Next'}
                </Button>
            </div>
        </div>
    );
}


