import { SpeechConfig, SpeechSynthesizer, AudioConfig, ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from './interviewService';

let isSpeaking = false;
let synthesizer: SpeechSynthesizer | null = null;
let currentLanguage: SupportedLanguageCode | null = null;

export const initializeSynthesizer = async (language: SupportedLanguageCode = "en-IN"): Promise<boolean> => {
    try {
        // If language changed, close existing synthesizer
        if (currentLanguage !== language && synthesizer) {
            synthesizer.close();
            synthesizer = null;
        }
        
        // Update current language
        currentLanguage = language;
        
        const speechConfig = SpeechConfig.fromSubscription(
            process.env.NEXT_PUBLIC_AZURE_API_KEY || "",
            process.env.NEXT_PUBLIC_AZURE_REGION || ""
        );
        
        // Get the Azure voice for the selected language
        const languageConfig = SUPPORTED_LANGUAGES.find(lang => lang.code === language);
        const voiceName = languageConfig?.azureVoice || "en-IN-ArjunNeural";
        
        speechConfig.speechSynthesisVoiceName = voiceName;
        
        // Configure audio output
        const audioConfig = AudioConfig.fromDefaultSpeakerOutput();
        
        // Create new synthesizer
        synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
        
        // Wait a bit to ensure the synthesizer is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // console.log(`Synthesizer initialized successfully with voice: ${voiceName} for language: ${language}`);
        return true;
    } catch (error) {
        console.error("Failed to initialize synthesizer:", error);
        return false;
    }
};

export function stopSpeaking() {
    if (isSpeaking && synthesizer) {
        try {
            synthesizer.close();
            synthesizer = null;
            isSpeaking = false;
            console.log("Speech stopped successfully");
        } catch (error) {
            console.error("Error stopping speech:", error);
        }
    }
}

export async function resetSynthesizer() {
    if (synthesizer) {
        try {
            synthesizer.close();
            synthesizer = null;
            currentLanguage = null;
            console.log("Synthesizer reset successfully");
        } catch (error) {
            console.error("Error resetting synthesizer:", error);
        }
    }
}

export async function textInAudioOut(
    text: string,
    onTextReceived: (text: string) => void,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setIsSpeaking?: React.Dispatch<React.SetStateAction<boolean>>,
    language: SupportedLanguageCode = "en-IN"
): Promise<number> {
    // console.log("Starting text-to-speech for:", text);
    
    if (!process.env.NEXT_PUBLIC_AZURE_API_KEY || !process.env.NEXT_PUBLIC_AZURE_REGION) {
        console.error("Missing Azure Speech Services configuration");
        throw new Error("Azure Speech Services configuration is missing");
    }

    // Initialize synthesizer if not already initialized or if language changed
    if (!synthesizer || currentLanguage !== language) {
        // console.log(`Initializing synthesizer for language: ${language}`);
        if (!await initializeSynthesizer(language)) {
            throw new Error("Failed to initialize speech synthesizer");
        }
        // Double-check that synthesizer is ready
        if (!synthesizer) {
            throw new Error("Synthesizer not properly initialized");
        }
        // Small delay to ensure voice change is fully applied
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Stop any ongoing speech
    stopSpeaking();

    try {
        isSpeaking = true;
        setLoading(true);
        setIsSpeaking?.(true);

        // Calculate estimated speech duration (average speaking rate is ~150 words per minute)
        const wordCount = text.split(' ').length;
        const estimatedDurationMs = (wordCount / 150) * 60 * 1000; // Convert to milliseconds
        
        const startTime = Date.now();
        
        await new Promise<void>((resolve, reject) => {
            if (!synthesizer) {
                reject(new Error("Synthesizer not initialized"));
                return;
            }

            // console.log("Starting speech synthesis for:", text);
            
            // Get the Azure voice for the selected language
            const languageConfig = SUPPORTED_LANGUAGES.find(lang => lang.code === language);
            const voiceName = languageConfig?.azureVoice || "en-IN-ArjunNeural";
            
            // Create SSML with increased speech rate and appropriate voice
            const ssmlText = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
                <voice name="${voiceName}">
                    <prosody rate="+10%">
                        ${text}
                    </prosody>
                </voice>
            </speak>`;
            
            synthesizer.speakSsmlAsync(
                ssmlText,
                result => {
                    if (result.reason === ResultReason.SynthesizingAudioCompleted) {
                        console.log("Speech synthesis completed successfully");
                        isSpeaking = false;
                        setLoading(false);
                        setIsSpeaking?.(false);
                        onTextReceived(text);
                        resolve();
                    } else {
                        console.error("Speech synthesis failed:", result.errorDetails);
                        isSpeaking = false;
                        setLoading(false);
                        setIsSpeaking?.(false);
                        reject(new Error(result.errorDetails));
                    }
                },
                error => {
                    console.error("Speech synthesis error:", error);
                    isSpeaking = false;
                    setLoading(false);
                    setIsSpeaking?.(false);
                    reject(error);
                }
            );
        });
        
        const actualDuration = Date.now() - startTime;
        return Math.max(estimatedDurationMs, actualDuration);
    } catch (error) {
        console.error("Error in textInAudioOut:", error);
        isSpeaking = false;
        setLoading(false);
        setIsSpeaking?.(false);
        throw error;
    }
}
