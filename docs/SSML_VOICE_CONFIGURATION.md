# SSML Voice Configuration Documentation

## Overview

This document covers the Speech Synthesis Markup Language (SSML) implementation used in the interview system for text-to-speech functionality.

## Current Implementation

### Voice Configuration

```typescript
// Current voice setup in voiceBot.ts
speechConfig.speechSynthesisVoiceName = "en-IN-ArjunNeural";
```

### SSML Structure

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
    <voice name="en-IN-ArjunNeural">
        <prosody rate="+10%">
            ${text}
        </prosody>
    </voice>
</speak>
```

## SSML Features & Benefits

### 1. Voice Control & Customization

#### Basic Voice Selection

```xml
<speak>
    <voice name="en-IN-ArjunNeural">
        Hello, this is Arjun speaking.
    </voice>
</speak>
```

#### Available Indian English Voices

- `en-IN-ArjunNeural` - Male voice (currently used)
- `en-IN-NeerjaNeural` - Female voice
- `en-IN-PrabhatNeural` - Male voice (alternative)

### 2. Prosody Control (Speech Characteristics)

#### Rate Control

```xml
<prosody rate="slow">Take your time</prosody>
<prosody rate="medium">Normal speed</prosody>
<prosody rate="fast">Quick speech</prosody>
<prosody rate="+20%">20% faster</prosody>
<prosody rate="-10%">10% slower</prosody>
```

#### Pitch Control

```xml
<prosody pitch="low">Deep voice</prosody>
<prosody pitch="medium">Normal pitch</prosody>
<prosody pitch="high">High pitch</prosody>
<prosody pitch="+10%">10% higher</prosody>
<prosody pitch="-5%">5% lower</prosody>
```

#### Volume Control

```xml
<prosody volume="silent">Whisper</prosody>
<prosody volume="x-soft">Very soft</prosody>
<prosody volume="soft">Soft</prosody>
<prosody volume="medium">Normal</prosody>
<prosody volume="loud">Loud</prosody>
<prosody volume="x-loud">Very loud</prosody>
```

#### Combined Prosody

```xml
<prosody rate="+20%" pitch="+10%" volume="loud">
    Fast, high-pitched, and loud speech
</prosody>
```

### 3. Emphasis & Stress

#### Emphasis Levels

```xml
<emphasis level="reduced">Quiet emphasis</emphasis>
<emphasis level="moderate">Normal emphasis</emphasis>
<emphasis level="strong">Strong emphasis</emphasis>
<emphasis level="x-strong">Very strong emphasis</emphasis>
```

#### Practical Examples

```xml
<speak>
    <emphasis level="strong">Question 1:</emphasis>
    <break time="0.5s"/>
    What is your greatest strength?
</speak>
```

### 4. Pauses & Breaks

#### Time-based Pauses

```xml
<break time="0.5s"/>  <!-- Half second -->
<break time="1s"/>     <!-- One second -->
<break time="2s"/>     <!-- Two seconds -->
```

#### Strength-based Pauses

```xml
<break strength="x-weak"/>   <!-- Very short -->
<break strength="weak"/>     <!-- Short -->
<break strength="medium"/>   <!-- Medium -->
<break strength="strong"/>   <!-- Long -->
<break strength="x-strong"/> <!-- Very long -->
```

### 5. Pronunciation & Phonetics

#### IPA Phonetic Pronunciation

```xml
<phoneme alphabet="ipa" ph="təˈmeɪtoʊ">tomato</phoneme>
<phoneme alphabet="ipa" ph="ˈæpl">apple</phoneme>
```

#### Spell-out Mode

```xml
<say-as interpret-as="spell-out">AI</say-as>
<say-as interpret-as="spell-out">CEO</say-as>
```

### 6. Number & Date Formatting

#### Cardinal Numbers

```xml
<say-as interpret-as="cardinal">123</say-as>  <!-- "one hundred twenty three" -->
<say-as interpret-as="cardinal">2024</say-as> <!-- "two thousand twenty four" -->
```

#### Ordinal Numbers

```xml
<say-as interpret-as="ordinal">1st</say-as>   <!-- "first" -->
<say-as interpret-as="ordinal">2nd</say-as>   <!-- "second" -->
```

#### Dates

```xml
<say-as interpret-as="date">2024-01-15</say-as>  <!-- "January fifteenth, twenty twenty four" -->
<say-as interpret-as="date">01/15/2024</say-as>  <!-- "January fifteenth, twenty twenty four" -->
```

#### Times

```xml
<say-as interpret-as="time">14:30</say-as>  <!-- "two thirty PM" -->
<say-as interpret-as="time">09:15</say-as>  <!-- "nine fifteen AM" -->
```

#### Currency

```xml
<say-as interpret-as="currency">$50.00</say-as>  <!-- "fifty dollars" -->
<say-as interpret-as="currency">₹1000</say-as>   <!-- "one thousand rupees" -->
```

### 7. Multi-Voice Conversations

#### Interview Scenario

```xml
<speak>
    <voice name="en-IN-ArjunNeural">
        <prosody rate="+10%">
            <emphasis level="moderate">Interviewer:</emphasis>
            <break time="0.3s"/>
            Tell me about your experience.
        </prosody>
    </voice>
    <break time="1s"/>
    <voice name="en-IN-NeerjaNeural">
        <prosody rate="medium">
            <emphasis level="moderate">Candidate:</emphasis>
            <break time="0.3s"/>
            I have 5 years of experience in software development.
        </prosody>
    </voice>
</speak>
```

### 8. Emotional Expression

#### Sad/Serious Tone

```xml
<prosody rate="slow" pitch="low" volume="soft">
    I'm sorry to hear that.
</prosody>
```

#### Excited/Happy Tone

```xml
<prosody rate="fast" pitch="high" volume="loud">
    Congratulations! You did great!
</prosody>
```

#### Confident Tone

```xml
<prosody rate="medium" pitch="medium" volume="loud">
    I am confident in my abilities.
</prosody>
```

### 9. Language Switching

#### Hindi-English Mix

```xml
<speak>
    <voice name="en-IN-ArjunNeural" xml:lang="en-IN">
        Welcome to the interview.
    </voice>
    <break time="0.5s"/>
    <voice name="hi-IN-MadhurNeural" xml:lang="hi-IN">
        आपका स्वागत है।
    </voice>
</speak>
```

### 10. Audio Effects & Background

#### Background Music

```xml
<speak>
    <audio src="background-music.mp3">
        <prosody rate="slow">This text is spoken over background music.</prosody>
    </audio>
</speak>
```

## Implementation Examples

### 1. Interview Question Format

```typescript
const createInterviewQuestionSSML = (
  questionNumber: number,
  question: string
) => {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
        <voice name="en-IN-ArjunNeural">
            <prosody rate="+10%">
                <emphasis level="moderate">Question ${questionNumber}:</emphasis>
                <break time="0.5s"/>
                ${question}
            </prosody>
        </voice>
    </speak>`;
};
```

### 2. Introduction Message

```typescript
const createIntroductionSSML = (message: string) => {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
        <voice name="en-IN-ArjunNeural">
            <prosody rate="medium" pitch="medium" volume="loud">
                <emphasis level="strong">Welcome!</emphasis>
                <break time="0.3s"/>
                ${message}
            </prosody>
        </voice>
    </speak>`;
};
```

### 3. Error/Alert Message

```typescript
const createAlertSSML = (message: string) => {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
        <voice name="en-IN-ArjunNeural">
            <prosody rate="slow" pitch="low" volume="loud">
                <emphasis level="strong">Alert:</emphasis>
                <break time="0.3s"/>
                ${message}
            </prosody>
        </voice>
    </speak>`;
};
```

### 4. Multi-language Support

```typescript
const createBilingualSSML = (englishText: string, hindiText: string) => {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
        <voice name="en-IN-ArjunNeural" xml:lang="en-IN">
            ${englishText}
        </voice>
        <break time="0.5s"/>
        <voice name="hi-IN-MadhurNeural" xml:lang="hi-IN">
            ${hindiText}
        </voice>
    </speak>`;
};
```

## Best Practices

### 1. Performance

- Keep SSML simple for better performance
- Avoid excessive nesting of elements
- Use appropriate break times (0.3s - 1s for natural flow)

### 2. Accessibility

- Provide clear emphasis for important information
- Use consistent prosody patterns
- Include appropriate pauses for comprehension

### 3. User Experience

- Match voice characteristics to content type
- Use emotional expression appropriately
- Maintain consistency across the application

### 4. Error Handling

```typescript
try {
  const ssmlText = createInterviewQuestionSSML(1, "What is your experience?");
  await synthesizer.speakSsmlAsync(ssmlText, (result) => {
    // Handle result
  });
} catch (error) {
  console.error("SSML synthesis failed:", error);
  // Fallback to plain text
  await synthesizer.speakTextAsync(question);
}
```

## Troubleshooting

### Common Issues

1. **Invalid SSML**: Check XML syntax and element nesting
2. **Voice not found**: Verify voice name spelling
3. **Performance issues**: Simplify complex SSML structures
4. **Audio quality**: Adjust prosody parameters gradually

### Debug Tips

- Log SSML output for verification
- Test with simple SSML first
- Use browser developer tools for audio debugging
- Monitor Azure Speech Service logs

## Future Enhancements

### Potential Features

1. **Dynamic voice selection** based on user preference
2. **Emotion detection** for automatic prosody adjustment
3. **Multi-language interview** support
4. **Custom pronunciation** for technical terms
5. **Background audio** integration
6. **Voice cloning** for personalized experience

### Implementation Roadmap

1. **Phase 1**: Basic SSML implementation (current)
2. **Phase 2**: Enhanced prosody and emphasis
3. **Phase 3**: Multi-language support
4. **Phase 4**: Advanced features and customization

---

_This documentation covers the SSML implementation for the interview system. For technical support or questions, refer to the Azure Speech Service documentation or contact the development team._
