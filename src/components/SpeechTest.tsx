import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
const SpeechTest: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questions = [
    "Question 1: What is React?",
    "Question 2: What is useState?",
    "Question 3: What is useEffect?",
    "Question 4: What is props?",
    "Question 5: What is state?"
  ];
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  // Update answer with transcript
  useEffect(() => {
    if (transcript) {
      console.log("Transcript:", transcript);
      setUserAnswer(transcript);
    }
  }, [transcript]);
  // Reset when question changes
  useEffect(() => {
    console.log("Question changed to:", currentQuestionIndex + 1);
    handleStopRecording();
    setUserAnswer("");
    resetTranscript();
  }, [currentQuestionIndex]);
  const handleStartRecording = () => {
    console.log("Start recording");
    resetTranscript();
    setUserAnswer("");
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };
  const handleStopRecording = () => {
    console.log("Stop recording");
    SpeechRecognition.stopListening();
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      alert("Test complete!");
    }
  };
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  if (!browserSupportsSpeechRecognition) {
    return <div>Browser doesn't support speech recognition.</div>;
  }
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Speech Recognition Test</h1>
      <div className="mb-4 p-4 bg-blue-100 rounded">
        <p className="font-semibold">Current Question: {currentQuestionIndex + 1}/5</p>
        <p className="text-lg">{questions[currentQuestionIndex]}</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Your Answer:</label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          rows={4}
          className="w-full p-2 border rounded"
          placeholder="Speech will appear here..."
        />
      </div>
      {listening && (
        <div className="mb-2 text-green-600 font-semibold">
          🎤 Listening... {formatTime(recordingTime)}
        </div>
      )}
      <div className="flex gap-2 mb-4">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Stop Recording
          </button>
        )}
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Next
        </button>
      </div>
      <div className="text-sm text-gray-600">
        <p>Transcript length: {transcript.length}</p>
        <p>Listening: {listening ?  "Yes" : "No"}</p>
        <p>Recording: {isRecording ? "Yes" : "No"}</p>
      </div>
    </div>
  );
};
export default SpeechTest;
