// Email validation function
export const isValidEmail = (email: string): boolean => {
    if (!email || email.trim() === '') return false;

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email.trim());
};

// Phone number validation and formatting function
export const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If it doesn't start with +91, add it
    if (!cleaned.startsWith('+91')) {
        // Remove any existing +91 if it's duplicated
        cleaned = cleaned.replace(/^\+91\+91/, '+91');
        // If it starts with 91 (without +), add the +
        if (cleaned.startsWith('91') && cleaned.length > 2) {
            cleaned = '+' + cleaned;
        } else if (!cleaned.startsWith('+')) {
            // If it doesn't start with +, add +91
            cleaned = '+91' + cleaned;
        }
    }

    // Limit to 10 digits after country code (total 13 characters: +91 + 10 digits)
    if (cleaned.startsWith('+91') && cleaned.length > 13) {
        cleaned = cleaned.substring(0, 13);
    }

    return cleaned;
};

export const isValidPhoneNumber = (phone: string): boolean => {
    if (!phone || phone.trim() === '') return false;

    // Check if it matches the pattern: +91 followed by exactly 10 digits
    const phonePattern = /^\+91\d{10}$/;
    return phonePattern.test(phone.trim());
};

// Enhanced phone number handling for input with +91 prefix
export const handlePhoneInputChange = (phone: string): string => {
    // Remove any non-digit characters from user input
    const cleaned = phone.replace(/[^\d]/g, '');

    // Limit to 10 digits
    const limitedDigits = cleaned.substring(0, 10);

    // Format with +91 prefix
    return limitedDigits.length > 0 ? `+91${limitedDigits}` : '';
};

// Get display value for phone input (without +91 prefix)
export const getPhoneDisplayValue = (phone: string): string => {
    if (!phone) return '';
    return phone.replace('+91', '');
};

// LinkedIn URL validation function
export const isValidLinkedInUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false;

    const linkedInPatterns = [
        /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_]+\/?$/,
        /^https?:\/\/(www\.)?linkedin\.com\/company\/[a-zA-Z0-9\-_]+\/?$/,
        /^https?:\/\/(www\.)?linkedin\.com\/pub\/[a-zA-Z0-9\-_]+\/?$/,
        /^linkedin\.com\/in\/[a-zA-Z0-9\-_]+\/?$/,
        /^linkedin\.com\/company\/[a-zA-Z0-9\-_]+\/?$/,
        /^linkedin\.com\/pub\/[a-zA-Z0-9\-_]+\/?$/
    ];

    return linkedInPatterns.some(pattern => pattern.test(url.trim()));
}; 