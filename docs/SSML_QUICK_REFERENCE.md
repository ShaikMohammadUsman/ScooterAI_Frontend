# SSML Quick Reference Guide

## 🚀 Quick Start

### Basic SSML Structure

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
    <voice name="en-IN-ArjunNeural">
        <prosody rate="+10%">
            Your text here
        </prosody>
    </voice>
</speak>
```

## 📝 Common SSML Elements

### Voice Selection

```xml
<voice name="en-IN-ArjunNeural">Male voice</voice>
<voice name="en-IN-NeerjaNeural">Female voice</voice>
```

### Speech Rate

```xml
<prosody rate="slow">Slow speech</prosody>
<prosody rate="medium">Normal speed</prosody>
<prosody rate="fast">Fast speech</prosody>
<prosody rate="+20%">20% faster</prosody>
<prosody rate="-10%">10% slower</prosody>
```

### Pitch Control

```xml
<prosody pitch="low">Deep voice</prosody>
<prosody pitch="medium">Normal pitch</prosody>
<prosody pitch="high">High pitch</prosody>
<prosody pitch="+10%">10% higher</prosody>
<prosody pitch="-5%">5% lower</prosody>
```

### Volume Control

```xml
<prosody volume="silent">Whisper</prosody>
<prosody volume="soft">Soft</prosody>
<prosody volume="medium">Normal</prosody>
<prosody volume="loud">Loud</prosody>
<prosody volume="x-loud">Very loud</prosody>
```

### Emphasis

```xml
<emphasis level="reduced">Quiet emphasis</emphasis>
<emphasis level="moderate">Normal emphasis</emphasis>
<emphasis level="strong">Strong emphasis</emphasis>
<emphasis level="x-strong">Very strong emphasis</emphasis>
```

### Pauses

```xml
<break time="0.5s"/>      <!-- Half second -->
<break time="1s"/>         <!-- One second -->
<break strength="weak"/>   <!-- Short pause -->
<break strength="strong"/> <!-- Long pause -->
```

## 🎯 Interview-Specific Examples

### Question Format

```xml
<speak>
    <voice name="en-IN-ArjunNeural">
        <prosody rate="+10%">
            <emphasis level="moderate">Question 1:</emphasis>
            <break time="0.5s"/>
            What is your greatest strength?
        </prosody>
    </voice>
</speak>
```

### Introduction

```xml
<speak>
    <voice name="en-IN-ArjunNeural">
        <prosody rate="medium" volume="loud">
            <emphasis level="strong">Welcome!</emphasis>
            <break time="0.3s"/>
            Let's begin the interview.
        </prosody>
    </voice>
</speak>
```

### Alert/Error

```xml
<speak>
    <voice name="en-IN-ArjunNeural">
        <prosody rate="slow" pitch="low" volume="loud">
            <emphasis level="strong">Alert:</emphasis>
            <break time="0.3s"/>
            Please check your microphone.
        </prosody>
    </voice>
</speak>
```

## 🔢 Number & Date Formatting

### Numbers

```xml
<say-as interpret-as="cardinal">123</say-as>     <!-- "one hundred twenty three" -->
<say-as interpret-as="ordinal">1st</say-as>      <!-- "first" -->
<say-as interpret-as="spell-out">AI</say-as>     <!-- "A I" -->
```

### Dates & Times

```xml
<say-as interpret-as="date">2024-01-15</say-as>  <!-- "January fifteenth, twenty twenty four" -->
<say-as interpret-as="time">14:30</say-as>       <!-- "two thirty PM" -->
<say-as interpret-as="currency">$50.00</say-as>  <!-- "fifty dollars" -->
```

## 🌍 Multi-Language

### Hindi-English Mix

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

## 🎭 Emotional Expression

### Happy/Excited

```xml
<prosody rate="fast" pitch="high" volume="loud">
    Congratulations! You did great!
</prosody>
```

### Serious/Calm

```xml
<prosody rate="slow" pitch="low" volume="soft">
    I understand your concern.
</prosody>
```

### Confident

```xml
<prosody rate="medium" pitch="medium" volume="loud">
    I am confident in my abilities.
</prosody>
```

## ⚡ TypeScript Helper Functions

### Create Question SSML

```typescript
const createQuestionSSML = (number: number, question: string) => {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
        <voice name="en-IN-ArjunNeural">
            <prosody rate="+10%">
                <emphasis level="moderate">Question ${number}:</emphasis>
                <break time="0.5s"/>
                ${question}
            </prosody>
        </voice>
    </speak>`;
};
```

### Create Alert SSML

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

## 🛠️ Troubleshooting

### Common Issues

- **Invalid XML**: Check for unclosed tags
- **Voice not found**: Verify voice name spelling
- **Performance**: Keep SSML simple
- **Audio quality**: Adjust prosody gradually

### Debug Tips

- Log SSML output for verification
- Test with simple SSML first
- Use browser dev tools for audio debugging

## 📚 Available Voices

### Indian English

- `en-IN-ArjunNeural` - Male (currently used)
- `en-IN-NeerjaNeural` - Female
- `en-IN-PrabhatNeural` - Male (alternative)

### Hindi

- `hi-IN-MadhurNeural` - Male
- `hi-IN-SwaraNeural` - Female

---

_Quick reference for SSML implementation in the interview system. For detailed documentation, see `SSML_VOICE_CONFIGURATION.md`_
