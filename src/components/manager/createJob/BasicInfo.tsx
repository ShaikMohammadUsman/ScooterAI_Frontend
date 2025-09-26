"use client"

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Props = {
    form: UseFormReturn<any>;
    onNext: () => void;
};

export default function BasicInfo({ form, onNext }: Props) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-base font-medium">Basic Information</h2>
                <p className="text-xs text-muted-foreground mt-1">Provide the essential details to kick things off.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                                <Input placeholder="XYZ Company" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Job Title *</FormLabel>
                            <FormControl>
                                <Input placeholder="XYZ Position" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="roleType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role Type *</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SDR">SDR</SelectItem>
                                        <SelectItem value="AE">AE</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="primaryFocus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Primary Focus *</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Inbound Conversion" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Inbound Conversion">Inbound Conversion</SelectItem>
                                        <SelectItem value="Outbound">Outbound</SelectItem>
                                        <SelectItem value="Full-cycle">Full-cycle</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-end">
                <Button type="button" onClick={onNext}>Next</Button>
            </div>
        </div>
    );
}


