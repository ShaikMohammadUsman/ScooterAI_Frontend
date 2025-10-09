"use client"

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";

type Props = {
    form: UseFormReturn<any>;
    onNext: () => void;
    submitting?: boolean;
};

export default function BasicInfo({ form, onNext, submitting }: Props) {
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [showOtherSalesInput, setShowOtherSalesInput] = useState(false);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-base font-medium">Basic Information</h2>
                <p className="text-xs text-muted-foreground mt-1">Provide the essential details to kick things off.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2 block">Company Name *</FormLabel>
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
                            <FormLabel className="mb-2 block">Job Title *</FormLabel>
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
                            <FormLabel className="mb-2 block">Role Type *</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SDR">Sales Development Representative (SDR)</SelectItem>
                                        <SelectItem value="BDR">Business Development Representative (BDR)</SelectItem>
                                        <SelectItem value="AE">Account Executive (AE)</SelectItem>
                                        <SelectItem value="Account Manager">Account Manager</SelectItem>
                                        <SelectItem value="Sales Manager">Sales Manager</SelectItem>
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
                            <FormLabel className="mb-2 block">Primary Focus *</FormLabel>
                            <FormControl>
                                <div className="space-y-3">
                                    <MultiSelect
                                        instanceId="primary-focus"
                                        options={[
                                            "Inbound Conversion",
                                            "Outbound",
                                            "Full-cycle",
                                            "Other (please specify)"
                                        ]}
                                        selected={field.value || []}
                                        onChange={(selectedValues) => {
                                            // Check if "Other (please specify)" is in the selection
                                            const hasOther = selectedValues.includes("Other (please specify)");
                                            setShowOtherInput(hasOther);

                                            // Filter out "Other (please specify)" from the actual values
                                            const filteredValues = selectedValues.filter(v => v !== "Other (please specify)");
                                            field.onChange(filteredValues);
                                        }}
                                        closeOnOtherSelect={true}
                                        placeholder="Select primary focus areas"
                                    />
                                    {showOtherInput && (
                                        <Input
                                            placeholder="Type other focus area and press Enter"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = (e.currentTarget.value || '').trim();
                                                    if (!val) return;
                                                    const currentValues = (field.value || []) as string[];
                                                    field.onChange([...currentValues, val]);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="salesProcessStages"
                    render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                            <FormLabel className="mb-2 block">Sales Process Stages *</FormLabel>
                            <FormControl>
                                <div className="space-y-3">
                                    <MultiSelect
                                        instanceId="sales-stages"
                                        options={[
                                            "Full cycle (prospecting → closing)",
                                            "Lead qualification & demos",
                                            "Closing & account expansion",
                                            "Inbound lead conversion",
                                            "Other (please specify)",
                                        ]}
                                        selected={field.value || []}
                                        onChange={(selectedValues) => {
                                            // Check if "Other (please specify)" is in the selection
                                            const hasOther = selectedValues.includes("Other (please specify)");
                                            setShowOtherSalesInput(hasOther);

                                            // Filter out "Other (please specify)" from the actual values
                                            const filteredValues = selectedValues.filter(v => v !== "Other (please specify)");
                                            field.onChange(filteredValues);
                                        }}
                                        closeOnOtherSelect={true}
                                        placeholder="Select stages"
                                    />
                                    {showOtherSalesInput && (
                                        <Input
                                            placeholder="Type other stage and press Enter"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = (e.currentTarget.value || '').trim();
                                                    if (!val) return;
                                                    const currentValues = (field.value || []) as string[];
                                                    // Remove "Other (please specify)" and add the custom value
                                                    const filteredValues = currentValues.filter(v => v !== "Other (please specify)");
                                                    field.onChange([...filteredValues, val]);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-center flex-col items-center gap-2 mt-2">
                <Button type="button" variant="primary" onClick={onNext} disabled={submitting}>
                    {submitting ? 'Saving...' : 'Next'}
                </Button>
                <div className="text-xs text-muted-foreground">Step 1/3</div>
            </div>
        </div>
    );
}


