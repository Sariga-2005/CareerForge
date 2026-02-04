import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  VideoCameraIcon,
  MicrophoneIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  StopIcon,
  ArrowRightIcon,
  ClockIcon,
  BoltIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { AppDispatch, RootState } from '../../store';
import {
  startInterview,
  endInterview,
  getNextQuestion,
  submitResponse,
  setRecording,
  setLiveTranscript,
  setNervousnessLevel,
  resetInterview,
} from '../../store/slices/interviewSlice';
import { socketService } from '../../services/socket/socketService';
import toast from 'react-hot-toast';

// Extend Window interface for Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const MockInterview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    currentInterview,
    currentQuestion,
    currentQuestionIndex,
    isLoading,
    isRecording,
    isProcessing,
    liveTranscript,
    nervousnessLevel,
  } = useSelector((state: RootState) => state.interview);

  const [interviewType, setInterviewType] = useState<'mock' | 'technical'>('mock');
  const [isStarted, setIsStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef<string>('');

  // Check for Speech Recognition support
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
      console.warn('Speech Recognition not supported in this browser');
    }
  }, []);

  // Initialize Speech Recognition
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = transcriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      transcriptRef.current = finalTranscript;
      const displayTranscript = finalTranscript + interimTranscript;
      dispatch(setLiveTranscript(displayTranscript.trim()));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else if (event.error === 'no-speech') {
        // Restart recognition if no speech detected
        if (isRecording && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started
          }
        }
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Restart if still recording
      if (isRecording && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('Recognition already started');
        }
      }
    };

    return recognition;
  }, [dispatch, isRecording]);

  // Initialize camera
  useEffect(() => {
    if (isStarted) {
      initializeMedia();
    }
    return () => {
      stopMedia();
    };
  }, [isStarted]);

  // Timer
  useEffect(() => {
    if (isStarted && currentInterview?.status === 'in-progress') {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, currentInterview?.status]);

  // Simulate nervousness updates
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        const newLevel = Math.random() * 0.3 + (nervousnessLevel * 0.7);
        dispatch(setNervousnessLevel(Math.min(100, Math.max(0, newLevel * 100))));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isRecording, dispatch, nervousnessLevel]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast.error('Failed to access camera/microphone');
      console.error('Media error:', error);
    }
  };

  const stopMedia = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const handleStartInterview = async () => {
    try {
      await dispatch(startInterview({ type: interviewType })).unwrap();
      setIsStarted(true);
      socketService.startInterviewSession(currentInterview?.id || '');
      toast.success('Interview started!');
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to start interview';
      toast.error(errorMessage);
    }
  };

  const handleStartRecording = useCallback(() => {
    if (!videoRef.current?.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const audioStream = new MediaStream(stream.getAudioTracks());

    mediaRecorderRef.current = new MediaRecorder(audioStream, {
      mimeType: 'audio/webm',
    });

    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.start(1000);
    dispatch(setRecording(true));

    // Reset transcript
    transcriptRef.current = '';
    dispatch(setLiveTranscript(''));

    // Start speech recognition
    if (speechSupported) {
      recognitionRef.current = initializeSpeechRecognition();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          toast.success('Listening... Speak now!');
        } catch (e) {
          console.error('Failed to start speech recognition:', e);
        }
      }
    }
  }, [dispatch, speechSupported, initializeSpeechRecognition]);

  const handleStopRecording = useCallback(async () => {
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);

    if (!mediaRecorderRef.current) return;

    return new Promise<Blob>((resolve) => {
      mediaRecorderRef.current!.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        resolve(audioBlob);
      };
      mediaRecorderRef.current!.stop();
      dispatch(setRecording(false));
    });
  }, [dispatch]);

  const handleSubmitAnswer = async () => {
    if (!currentInterview || !currentQuestion) return;

    try {
      const audioBlob = await handleStopRecording();

      await dispatch(
        submitResponse({
          interviewId: currentInterview.id,
          questionId: currentQuestion.id,
          answer: liveTranscript,
          audioBlob,
        })
      ).unwrap();

      dispatch(setLiveTranscript(''));
      transcriptRef.current = '';

      // Get next question or end interview
      if (currentQuestionIndex < (currentInterview.questions.length - 1)) {
        await dispatch(getNextQuestion(currentInterview.id)).unwrap();
      } else {
        await handleEndInterview();
      }
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to submit answer';
      toast.error(errorMessage);
    }
  };

  const handleEndInterview = async () => {
    if (!currentInterview) return;

    try {
      // Stop speech recognition if active
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      await dispatch(endInterview(currentInterview.id)).unwrap();
      socketService.endInterviewSession(currentInterview.id);
      stopMedia();
      toast.success('Interview completed!');
      navigate('/student/interview/history');
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to end interview';
      toast.error(errorMessage);
    }
  };

  const handleRestartInterview = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    dispatch(resetInterview());
    setIsStarted(false);
    setTimeElapsed(0);
    transcriptRef.current = '';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getNervousnessColor = () => {
    if (nervousnessLevel < 30) return 'bg-success';
    if (nervousnessLevel < 60) return 'bg-warning';
    return 'bg-error';
  };

  // Pre-interview setup
  if (!isStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-light mb-2">AI Mock Interview</h1>
          <p className="text-light-400">
            Practice with our AI interviewer powered by GPT-4o
          </p>
        </motion.div>

        {/* Speech Support Warning */}
        {!speechSupported && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-warning/20 border border-warning/50 rounded-xl p-4 flex items-start gap-3"
          >
            <ExclamationTriangleIcon className="w-6 h-6 text-warning flex-shrink-0" />
            <div>
              <p className="text-warning font-medium">Speech Recognition Not Supported</p>
              <p className="text-sm text-light-400 mt-1">
                Your browser doesn't support speech recognition. For the best experience,
                please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-dark"
        >
          <h3 className="text-lg font-semibold text-light mb-4">Select Interview Type</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setInterviewType('mock')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${interviewType === 'mock'
                  ? 'border-steel bg-steel/10'
                  : 'border-charcoal-300 hover:border-charcoal-200'
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-4 h-4 rounded-full border-2 ${interviewType === 'mock' ? 'border-steel bg-steel' : 'border-light-400'
                  }`} />
                <span className="font-medium text-light">General Mock</span>
              </div>
              <p className="text-sm text-light-400 ml-7">
                Behavioral + situational questions. Perfect for practice.
              </p>
            </button>
            <button
              onClick={() => setInterviewType('technical')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${interviewType === 'technical'
                  ? 'border-steel bg-steel/10'
                  : 'border-charcoal-300 hover:border-charcoal-200'
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-4 h-4 rounded-full border-2 ${interviewType === 'technical' ? 'border-steel bg-steel' : 'border-light-400'
                  }`} />
                <span className="font-medium text-light">Technical</span>
              </div>
              <p className="text-sm text-light-400 ml-7">
                Role-specific technical questions based on your profile.
              </p>
            </button>
          </div>

          <div className="bg-charcoal rounded-xl p-4 mb-6">
            <h4 className="font-medium text-light mb-3">Before you start:</h4>
            <ul className="space-y-2 text-sm text-light-400">
              <li className="flex items-center gap-2">
                <VideoCameraIcon className="w-4 h-4 text-steel" />
                Ensure your camera is working properly
              </li>
              <li className="flex items-center gap-2">
                <MicrophoneIcon className="w-4 h-4 text-steel" />
                Use a quiet environment with good audio
              </li>
              <li className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-steel" />
                Set aside 15-20 minutes for the interview
              </li>
              <li className="flex items-center gap-2">
                <BoltIcon className="w-4 h-4 text-steel" />
                Speak clearly and take your time
              </li>
            </ul>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Preparing Interview...
              </span>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                Start Interview
              </>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  // Interview completed
  if (currentInterview?.status === 'completed') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-dark text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-light mb-2">Interview Complete!</h1>
          <p className="text-light-400 mb-8">
            Great job! Here's how you did.
          </p>

          {/* Scores */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-charcoal rounded-xl p-4">
              <p className="text-3xl font-bold text-accent">
                {currentInterview.metrics?.overallScore || 0}%
              </p>
              <p className="text-sm text-light-400">Overall Score</p>
            </div>
            <div className="bg-charcoal rounded-xl p-4">
              <p className="text-3xl font-bold text-steel">
                {currentInterview.metrics?.technicalScore || 0}%
              </p>
              <p className="text-sm text-light-400">Technical</p>
            </div>
            <div className="bg-charcoal rounded-xl p-4">
              <p className="text-3xl font-bold text-success">
                {currentInterview.metrics?.communicationScore || 0}%
              </p>
              <p className="text-sm text-light-400">Communication</p>
            </div>
          </div>

          {/* Decision */}
          <div className={`p-4 rounded-xl mb-6 ${currentInterview.passed ? 'bg-success/20' : 'bg-warning/20'
            }`}>
            <p className={`font-semibold ${currentInterview.passed ? 'text-success' : 'text-warning'}`}>
              {currentInterview.passed ? '✅ Passed' : '⚠️ Needs Improvement'}
            </p>
            <p className="text-sm text-light-400 mt-1">
              {currentInterview.decisionReason}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={handleRestartInterview} className="btn-secondary">
              <ArrowPathIcon className="w-5 h-5" />
              Practice Again
            </button>
            <button onClick={() => navigate('/student/interview/history')} className="btn-primary">
              View Detailed Feedback
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active interview
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="badge-primary">
            Question {currentQuestionIndex + 1} / {currentInterview?.questions.length || 0}
          </div>
          <div className="flex items-center gap-2 text-light-400">
            <ClockIcon className="w-4 h-4" />
            <span className="font-mono">{formatTime(timeElapsed)}</span>
          </div>
        </div>
        <button
          onClick={handleEndInterview}
          className="btn-danger btn-sm"
        >
          <StopIcon className="w-4 h-4" />
          End Interview
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid lg:grid-cols-2 gap-6">
        {/* Video Panel */}
        <div className="space-y-4">
          <div className="card-dark p-0 overflow-hidden">
            <div className="relative aspect-video bg-charcoal">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-error/80">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-sm font-medium">Recording</span>
                </div>
              )}
              {/* Listening indicator */}
              {isListening && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-success/80">
                  <MicrophoneIcon className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-white text-sm font-medium">Listening</span>
                </div>
              )}
              {/* Mute button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 p-2 rounded-lg bg-charcoal/80 text-light"
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <MicrophoneIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Nervousness Meter */}
          <div className="card-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-light-400">Confidence Level</span>
              <span className={`text-sm font-medium ${nervousnessLevel < 30 ? 'text-success' :
                  nervousnessLevel < 60 ? 'text-warning' : 'text-error'
                }`}>
                {nervousnessLevel < 30 ? 'Confident' :
                  nervousnessLevel < 60 ? 'Moderate' : 'Nervous'}
              </span>
            </div>
            <div className="nervousness-meter">
              <motion.div
                className={`h-full ${getNervousnessColor()} ${nervousnessLevel > 60 ? 'nervousness-high' : ''
                  }`}
                animate={{ width: `${100 - nervousnessLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question & Transcript Panel */}
        <div className="flex flex-col space-y-4">
          {/* Current Question */}
          <div className="card-dark">
            <div className="flex items-center gap-2 mb-3">
              <div className={`badge ${currentQuestion?.difficulty === 'easy' ? 'badge-success' :
                  currentQuestion?.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                }`}>
                {currentQuestion?.difficulty}
              </div>
              <div className="badge-primary">{currentQuestion?.type}</div>
            </div>
            <p className="text-lg text-light leading-relaxed">
              {currentQuestion?.question}
            </p>
          </div>

          {/* Live Transcript */}
          <div className="flex-1 card-dark flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-light-400">Your Response</span>
              <div className="flex items-center gap-2">
                {!speechSupported && (
                  <span className="text-xs text-warning">Speech not supported</span>
                )}
                {isListening && (
                  <span className="flex items-center gap-1 text-xs text-success animate-pulse">
                    <MicrophoneIcon className="w-3 h-3" />
                    Listening...
                  </span>
                )}
                {isRecording && !isListening && speechSupported && (
                  <span className="text-xs text-warning">Starting recognition...</span>
                )}
              </div>
            </div>
            <div className="flex-1 bg-charcoal rounded-xl p-4 overflow-y-auto min-h-[150px]">
              <p className={`${liveTranscript ? 'text-light' : 'text-light-400'}`}>
                {liveTranscript || 'Start speaking to see your response here...'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="btn-accent flex-1"
              >
                <MicrophoneIcon className="w-5 h-5" />
                Start Answer
              </button>
            ) : (
              <button
                onClick={handleSubmitAnswer}
                disabled={isProcessing}
                className="btn-primary flex-1"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <ArrowRightIcon className="w-5 h-5" />
                    Submit Answer
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
