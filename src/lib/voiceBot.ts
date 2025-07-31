import { SpeechConfig, SpeechSynthesizer, AudioConfig, ResultReason } from 'microsoft-cognitiveservices-speech-sdk';

let isSpeaking = false;
let synthesizer: SpeechSynthesizer | null = null;

export const initializeSynthesizer = () => {
    try {
        const speechConfig = SpeechConfig.fromSubscription(
            process.env.NEXT_PUBLIC_AZURE_API_KEY || "",
            process.env.NEXT_PUBLIC_AZURE_REGION || ""
        );
        // speechConfig.speechSynthesisVoiceName = "en-US-AvaMultilingualNeural";
        
        // Configure audio output
        const audioConfig = AudioConfig.fromDefaultSpeakerOutput();
        
        // Create new synthesizer
        synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
        
        console.log("Synthesizer initialized successfully");
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

export async function textInAudioOut(
    text: string,
    onTextReceived: (text: string) => void,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
    // console.log("Starting text-to-speech for:", text);
    
    if (!process.env.NEXT_PUBLIC_AZURE_API_KEY || !process.env.NEXT_PUBLIC_AZURE_REGION) {
        console.error("Missing Azure Speech Services configuration");
        throw new Error("Azure Speech Services configuration is missing");
    }

    // Initialize synthesizer if not already initialized
    if (!synthesizer && !initializeSynthesizer()) {
        throw new Error("Failed to initialize speech synthesizer");
    }

    // Stop any ongoing speech
    stopSpeaking();

    try {
        isSpeaking = true;
        setLoading(true);

        await new Promise<void>((resolve, reject) => {
            if (!synthesizer) {
                reject(new Error("Synthesizer not initialized"));
                return;
            }

            // console.log("Starting speech synthesis for:", text);
            synthesizer.speakTextAsync(
                text,
                result => {
                    if (result.reason === ResultReason.SynthesizingAudioCompleted) {
                        console.log("Speech synthesis completed successfully");
                        isSpeaking = false;
                        setLoading(false);
                        onTextReceived(text);
                        resolve();
                    } else {
                        console.error("Speech synthesis failed:", result.errorDetails);
                        isSpeaking = false;
                        setLoading(false);
                        reject(new Error(result.errorDetails));
                    }
                },
                error => {
                    console.error("Speech synthesis error:", error);
                    isSpeaking = false;
                    setLoading(false);
                    reject(error);
                }
            );
        });
    } catch (error) {
        console.error("Error in textInAudioOut:", error);
        isSpeaking = false;
        setLoading(false);
        throw error;
    }
}
