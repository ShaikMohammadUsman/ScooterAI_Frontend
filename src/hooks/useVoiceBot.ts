import { useEffect, useRef, useState } from 'react';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { textInAudioOut } from '@/lib/voiceBot'; 

interface VoiceBotProps{
    initialRecognizedText: string;
    initialResponseText: string[];
    setLoading:React.Dispatch<React.SetStateAction<boolean>>
    setMessageLoading:React.Dispatch<React.SetStateAction<boolean>>,
    setGotResponse:React.Dispatch<React.SetStateAction<boolean>>,
}
const useVoiceBot = ({initialRecognizedText, initialResponseText, setLoading, setMessageLoading, setGotResponse}:VoiceBotProps) => {
    const [recognizedText, setRecognizedText] = useState(initialRecognizedText);
    const [responseText, setResponseText] = useState<string[]>(initialResponseText);
    const recognizerRef = useRef<speechsdk.SpeechRecognizer | null>(null);

    const speechConfig = speechsdk.SpeechConfig.fromSubscription(`${process.env.AZURE_SUBSCRIPTION_KEY}`, `${process.env.AZURE_REGION}`);
    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();

    useEffect(()=>{
        return ()=>{
            if(recognizerRef.current){
                recognizerRef.current.close();
                recognizerRef.current = null;
                setLoading(false);
            }
        }
    },[])

    const startRecognition = () => {
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
        recognizerRef.current = recognizer;
        setRecognizedText('');
        setResponseText([]);
        recognizer.recognizeOnceAsync(
            async (result) => {
                if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
                    setRecognizedText(result.text);
                    // setLoading(false);
                    await textInAudioOut(result.text, (text: string) => setResponseText((prev) => [...prev, text]), setLoading);
                    setMessageLoading(false);
                    setGotResponse(true);
                } else {
                    setResponseText(["Having trouble recognizing speech? Give it another shot!"])
                    console.error('Error recognizing speech');
                    setLoading(false);
                    setMessageLoading(false);
                }
            },
            (error) => {
                console.error(`Error: ${error}`);
            }
        );
    };

    return {
        recognizedText,
        responseText,
        startRecognition,
    };
};

export default useVoiceBot;
