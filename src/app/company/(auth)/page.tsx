"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companyLogin, companySignup } from '@/lib/adminService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

export default function CompanyAuth() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        company_name: '',
        contact_number: '',
        description: '',
        address: ''
    });

    const [error, setError] = useState({
        email: '',
        password: '',
        company_name: '',
        contact_number: '',
        description: '',
        address: ''
    });

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: '',
            password: '',
            company_name: '',
            contact_number: '',
            description: '',
            address: ''
        };

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                newErrors.password = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character';
                isValid = false;
            }
        }

        // Additional validations for signup
        if (!isLogin) {
            if (!formData.company_name) {
                newErrors.company_name = 'Company name is required';
                isValid = false;
            }
            if (!formData.contact_number) {
                newErrors.contact_number = 'Contact number is required';
                isValid = false;
            }
            if (!formData.description) {
                newErrors.description = 'Company description is required';
                isValid = false;
            }
            if (!formData.address) {
                newErrors.address = 'Company address is required';
                isValid = false;
            }
        }

        setError(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                const response = await companyLogin({
                    email: formData.email,
                    password: formData.password
                });
                if (response.status) {
                    if (response?.company_id && response?.company_name) {
                        localStorage.setItem('company_id', response?.company_id || '');
                        const companyDetails = {
                            company_id: response?.company_id,
                            company_name: response?.company_name,
                            email: response?.email,
                            contact_number: response?.contact_number,
                            description: response?.description,
                            address: response?.address
                        }
                        localStorage.setItem('company_details', JSON.stringify(companyDetails));
                        toast.success('Login successful!');
                        router.push('/company/dashboard');
                    } else {
                        toast.error('Invalid response from server');
                    }
                }
            } else {
                const response = await companySignup({
                    company_name: formData.company_name,
                    email: formData.email,
                    contact_number: formData.contact_number,
                    description: formData.description,
                    address: formData.address,
                    password: formData.password
                });
                if (response.status) {
                    toast.success('Signup successful! Please login.');
                    setIsLogin(true);
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (

        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-8"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={isLogin ? 'login' : 'signup'}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center"
                >
                    <Card className="w-full max-w-md p-8 shadow-xl">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isLogin ? 'Login' : 'Signup'}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {isLogin ? 'Welcome back! Please login to your account.' : 'Create your company account'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {!isLogin && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="company_name">Company Name</Label>
                                        <Input
                                            id="company_name"
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        // required
                                        />
                                        {error.company_name && (
                                            <p className="text-sm text-red-500">{error.company_name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_number">Contact Number</Label>
                                        <Input
                                            id="contact_number"
                                            value={formData.contact_number}
                                            onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                        // required
                                        />
                                        {error.contact_number && (
                                            <p className="text-sm text-red-500">{error.contact_number}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Company Description</Label>
                                        <Input
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        // required
                                        />
                                        {error.description && (
                                            <p className="text-sm text-red-500">{error.description}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Company Address</Label>
                                        <Input
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        // required
                                        />
                                        {error.address && (
                                            <p className="text-sm text-red-500">{error.address}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                // required
                                />
                                {error.email && (
                                    <p className="text-sm text-red-500">{error.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                // required
                                />
                                {error.password && (
                                    <p className="text-sm text-red-500">{error.password}</p>
                                )}
                                {!isLogin && (
                                    <p className="text-xs text-gray-500">
                                        Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : isLogin ? 'Login' : 'Signup'}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError({
                                            email: '',
                                            password: '',
                                            company_name: '',
                                            contact_number: '',
                                            description: '',
                                            address: ''
                                        });
                                    }}
                                    className="text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                    {isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}
                                </button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
} 