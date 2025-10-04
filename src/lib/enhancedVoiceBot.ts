import { SpeechConfig, SpeechSynthesizer, AudioConfig, ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from './interviewService';

let isSpeaking = false;
let synthesizer: SpeechSynthesizer | null = null;
let currentLanguage: SupportedLanguageCode | null = null;
let currentVoiceName: string = "en-IN-ArjunNeural";

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
        currentVoiceName = voiceName; // Store the voice name for later use
        
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
            currentLanguage = null;
            console.log("Synthesizer reset successfully");
        } catch (error) {
            console.error("Error resetting synthesizer:", error);
        }
    }
}

export function resetSynthesizer() {
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

// Enhanced TTS function that captures audio data
export async function textInAudioOutWithCapture(
    text: string,
    onTextReceived: (text: string) => void,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setIsSpeaking?: React.Dispatch<React.SetStateAction<boolean>>,
    language: SupportedLanguageCode = "en-IN"
): Promise<{ duration: number; audioData?: ArrayBuffer }> {
    // console.log("Starting text-to-speech for:", text);
    
    if (!process.env.NEXT_PUBLIC_AZURE_API_KEY || !process.env.NEXT_PUBLIC_AZURE_REGION) {
        console.error("Missing Azure Speech Services configuration");
        throw new Error("Azure Speech Services not configured");
    }

    if (isSpeaking) {
        console.warn("Already speaking, stopping current speech");
        stopSpeaking();
    }

    try {
        // Initialize synthesizer if needed
        if (!synthesizer || currentLanguage !== language) {
            const initialized = await initializeSynthesizer(language);
            if (!initialized) {
                throw new Error("Failed to initialize speech synthesizer");
            }
        }

        isSpeaking = true;
        setIsSpeaking?.(true);
        setLoading(true);

        const startTime = Date.now();
        
        // Estimate duration based on text length (rough estimate: 150 words per minute)
        const wordCount = text.split(' ').length;
        const estimatedDurationMs = Math.max(1000, (wordCount / 150) * 60 * 1000);

        // Create SSML for better speech quality
        const ssmlText = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
            <voice name="${currentVoiceName}">
                <prosody rate="1" pitch="+0Hz">
                    ${text}
                </prosody>
            </voice>
        </speak>`;

        return new Promise<{ duration: number; audioData?: ArrayBuffer }>((resolve, reject) => {
            let audioData: ArrayBuffer | undefined;

            synthesizer!.speakSsmlAsync(
                ssmlText,
                (result) => {
                    if (result.reason === ResultReason.SynthesizingAudioCompleted) {
                        isSpeaking = false;
                        setLoading(false);
                        setIsSpeaking?.(false);
                        
                        // Get the audio data if available
                        if (result.audioData && result.audioData.byteLength > 0) {
                            audioData = result.audioData;
                        }
                        
                        const actualDuration = Date.now() - startTime;
                        resolve({ 
                            duration: Math.max(estimatedDurationMs, actualDuration),
                            audioData: audioData
                        });
                    } else if (result.reason === ResultReason.Canceled) {
                        isSpeaking = false;
                        setLoading(false);
                        setIsSpeaking?.(false);
                        reject(new Error(`Speech synthesis canceled: ${result.errorDetails}`));
                    }
                },
                (error) => {
                    isSpeaking = false;
                    setLoading(false);
                    setIsSpeaking?.(false);
                    reject(error);
                }
            );

            // Simulate text streaming for better UX
            const words = text.split(' ');
            let currentWordIndex = 0;
            const wordInterval = setInterval(() => {
                if (currentWordIndex < words.length && isSpeaking) {
                    const currentText = words.slice(0, currentWordIndex + 1).join(' ');
                    onTextReceived(currentText);
                    currentWordIndex++;
                } else {
                    clearInterval(wordInterval);
                }
            }, Math.max(50, estimatedDurationMs / words.length));

            // Fallback timeout
            setTimeout(() => {
                if (isSpeaking) {
                    isSpeaking = false;
                    setLoading(false);
                    setIsSpeaking?.(false);
                    clearInterval(wordInterval);
                    reject(new Error("Speech synthesis timeout"));
                }
            }, estimatedDurationMs + 5000);
        });
        
    } catch (error) {
        console.error("Error in textInAudioOutWithCapture:", error);
        isSpeaking = false;
        setLoading(false);
        setIsSpeaking?.(false);
        throw error;
    }
}

// Original function for backward compatibility
export async function textInAudioOut(
    text: string,
    onTextReceived: (text: string) => void,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setIsSpeaking?: React.Dispatch<React.SetStateAction<boolean>>,
    language: SupportedLanguageCode = "en-IN"
): Promise<number> {
    const result = await textInAudioOutWithCapture(text, onTextReceived, setLoading, setIsSpeaking, language);
    return result.duration;
}
