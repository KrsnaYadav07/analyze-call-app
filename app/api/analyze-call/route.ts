import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const PARAMETERS = [
  { name: 'greeting', weight: 5, type: 'SCORE' },
  { name: 'collectionUrgency', weight: 12, type: 'SCORE' },
  { name: 'empathy', weight: 10, type: 'SCORE' },
  { name: 'tapeDisclosure', weight: 6, type: 'PASS_FAIL' },
  { name: 'disclaimer', weight: 7, type: 'PASS_FAIL' },
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = new Blob([buffer], { type: file.type });

    // Transcribe audio with Whisper
    let transcript =
      'Hello, this is a test call. We are reaching out about your pending payment.'; // fallback

    if (
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== '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'
    ) {
      const transcription = await openai.audio.transcriptions.create({
        file: blob,
        model: 'whisper-1',
      });

      transcript = transcription.text;
    }

    // Analyze transcript
    const evaluation = await analyzeTranscript(transcript);

    return NextResponse.json({
      transcript,
      ...evaluation,
    });
  } catch (error: any) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simple evaluation logic (mocked with random or keyword detection)
async function analyzeTranscript(transcript: string) {
  const scores: Record<string, number> = {};

  for (const param of PARAMETERS) {
    if (param.type === 'PASS_FAIL') {
      const passed = transcript.toLowerCase().includes(param.name.toLowerCase());
      scores[param.name] = passed ? param.weight : 0;
    } else {
      const score = Math.floor(Math.random() * (param.weight + 1));
      scores[param.name] = score;
    }
  }

  return {
    scores,
    overallFeedback:
      'The agent was confident and persuasive, though failed to provide disclaimer.',
    observation:
      'Customer raised objections about penalty. Agent managed well but missed tape disclosure.',
  };
}
