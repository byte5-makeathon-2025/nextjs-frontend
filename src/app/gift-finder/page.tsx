'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

type Answer = string | number;

interface Question {
  id: string;
  question: string;
  emoji: string;
  options: {
    value: string;
    label: string;
    emoji: string;
  }[];
  getNext?: (answer: string, answers: Record<string, Answer>) => string | null;
}

const questions: Record<string, Question> = {
  start: {
    id: 'start',
    question: "If you could have ONE superpower, what would it be?",
    emoji: "🦸",
    options: [
      { value: 'fly', label: 'Flying through the clouds', emoji: '✈️' },
      { value: 'invisible', label: 'Becoming invisible', emoji: '👻' },
      { value: 'strong', label: 'Super strength', emoji: '💪' },
      { value: 'talk-animals', label: 'Talking to animals', emoji: '🐕' },
    ],
    getNext: () => 'food',
  },
  food: {
    id: 'food',
    question: "If you could only eat ONE food for the rest of your life...",
    emoji: "🍕",
    options: [
      { value: 'pizza', label: 'Pizza (obviously!)', emoji: '🍕' },
      { value: 'ice-cream', label: 'Ice cream forever', emoji: '🍦' },
      { value: 'broccoli', label: 'Broccoli (are you okay?)', emoji: '🥦' },
      { value: 'tacos', label: 'Tacos all day!', emoji: '🌮' },
    ],
    getNext: (answer) => {
      return answer === 'broccoli' ? 'broccoli-check' : 'vacation';
    },
  },
  'broccoli-check': {
    id: 'broccoli-check',
    question: "Wait... you REALLY chose broccoli? Are you sure?",
    emoji: "🤔",
    options: [
      { value: 'yes', label: 'Yes! I love broccoli!', emoji: '😋' },
      { value: 'no', label: 'No, I changed my mind...', emoji: '😅' },
      { value: 'maybe', label: 'Maybe with cheese?', emoji: '🧀' },
    ],
    getNext: () => 'vacation',
  },
  vacation: {
    id: 'vacation',
    question: "Your dream vacation destination is...",
    emoji: "🌍",
    options: [
      { value: 'space', label: 'Outer space!', emoji: '🚀' },
      { value: 'underwater', label: 'Underwater city', emoji: '🐠' },
      { value: 'candyland', label: 'A land made of candy', emoji: '🍬' },
      { value: 'dinosaurs', label: 'Dinosaur park (safe one)', emoji: '🦕' },
    ],
    getNext: () => 'animal',
  },
  animal: {
    id: 'animal',
    question: "If you woke up as an animal tomorrow, you'd be a...",
    emoji: "🦄",
    options: [
      { value: 'unicorn', label: 'Unicorn (duh)', emoji: '🦄' },
      { value: 'dragon', label: 'Fire-breathing dragon', emoji: '🐉' },
      { value: 'sloth', label: 'Sleepy sloth', emoji: '🦥' },
      { value: 'penguin', label: 'Fancy penguin', emoji: '🐧' },
    ],
    getNext: () => 'time',
  },
  time: {
    id: 'time',
    question: "Your favorite time of day is...",
    emoji: "⏰",
    options: [
      { value: 'morning', label: 'Early morning (sunrise!)', emoji: '🌅' },
      { value: 'afternoon', label: 'Afternoon playtime', emoji: '☀️' },
      { value: 'night', label: 'Nighttime adventures', emoji: '🌙' },
      { value: 'snacktime', label: 'Snack time (best time)', emoji: '🍪' },
    ],
    getNext: () => 'toy',
  },
  toy: {
    id: 'toy',
    question: "If YOU were a toy, what would you do?",
    emoji: "🎮",
    options: [
      { value: 'noise', label: 'Make silly noises', emoji: '📢' },
      { value: 'lights', label: 'Light up and glow', emoji: '✨' },
      { value: 'fast', label: 'Go super fast', emoji: '💨' },
      { value: 'cuddly', label: 'Be super cuddly', emoji: '🧸' },
    ],
    getNext: () => 'weather',
  },
  weather: {
    id: 'weather',
    question: "Pick your perfect weather!",
    emoji: "🌤️",
    options: [
      { value: 'sunny', label: 'Sunny and warm', emoji: '☀️' },
      { value: 'rainy', label: 'Rainy and cozy', emoji: '🌧️' },
      { value: 'snowy', label: 'Snowy wonderland', emoji: '❄️' },
      { value: 'rainbow', label: 'Always rainbows', emoji: '🌈' },
    ],
    getNext: () => null,
  },
};

interface GiftRecommendation {
  name: string;
  description: string;
  emoji: string;
  reason: string;
}

function getGiftRecommendation(answers: Record<string, Answer>): GiftRecommendation {
  const superpower = answers.start;
  const food = answers.food;
  const animal = answers.animal;
  const toy = answers.toy;
  const weather = answers.weather;

  // Fun logic based on combinations
  if (superpower === 'fly' && weather === 'sunny') {
    return {
      name: 'Remote Control Drone',
      emoji: '🚁',
      description: 'A cool flying drone you can control!',
      reason: 'You love flying and sunny days - perfect for outdoor flying adventures!',
    };
  }

  if (animal === 'unicorn' || animal === 'dragon') {
    return {
      name: 'Magical Fantasy Book Set',
      emoji: '📚',
      description: 'Epic fantasy adventure books with dragons and magic!',
      reason: 'Your imagination loves magical creatures - these stories are perfect for you!',
    };
  }

  if (toy === 'cuddly' || animal === 'sloth') {
    return {
      name: 'Giant Plush Stuffed Animal',
      emoji: '🧸',
      description: 'A super soft, huggable giant plush friend!',
      reason: 'You appreciate the cozy, cuddly things in life!',
    };
  }

  if (toy === 'fast' || superpower === 'strong') {
    return {
      name: 'Racing Car Track Set',
      emoji: '🏎️',
      description: 'Build tracks and race super-fast cars!',
      reason: 'Speed and action are your thing - time to race!',
    };
  }

  if (superpower === 'talk-animals' || animal === 'penguin') {
    return {
      name: 'Pet Care Playset',
      emoji: '🐾',
      description: 'Take care of adorable toy pets!',
      reason: 'You have a special connection with animals!',
    };
  }

  if (toy === 'lights' || weather === 'rainbow') {
    return {
      name: 'LED Light-Up Art Kit',
      emoji: '🎨',
      description: 'Create glowing artwork that lights up!',
      reason: 'You love bright, colorful, sparkly things!',
    };
  }

  if (food === 'broccoli') {
    return {
      name: 'Gardening Kit for Kids',
      emoji: '🌱',
      description: 'Grow your own vegetables and plants!',
      reason: 'You appreciate healthy food - let\'s grow some!',
    };
  }

  if (answers['broccoli-check'] === 'yes') {
    return {
      name: 'Junior Chef Cooking Set',
      emoji: '👨‍🍳',
      description: 'Real cooking tools for kids to make healthy meals!',
      reason: 'You truly are a health champion - time to cook!',
    };
  }

  if (toy === 'noise' || food === 'tacos') {
    return {
      name: 'Musical Instrument Starter Kit',
      emoji: '🎸',
      description: 'Learn to play real music!',
      reason: 'You love fun, loud, exciting things!',
    };
  }

  // Default recommendations based on superpower
  const defaults: Record<string, GiftRecommendation> = {
    fly: {
      name: 'Kite Flying Set',
      emoji: '🪁',
      description: 'Colorful kites for soaring adventures!',
      reason: 'Get as close to flying as possible!',
    },
    invisible: {
      name: 'Magic & Illusion Kit',
      emoji: '🎩',
      description: 'Learn amazing magic tricks!',
      reason: 'Master the art of misdirection and surprise!',
    },
  };

  return defaults[superpower as string] || {
    name: 'Ultimate Board Game Collection',
    emoji: '🎲',
    description: 'Hours of family fun with classic games!',
    reason: 'You have great taste - these games are timeless!',
  };
}

export default function GiftFinder() {
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('start');
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentQuestionId];
  const questionNumber = Object.keys(answers).length + 1;

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestionId]: value };
    setAnswers(newAnswers);

    const nextQuestionId = currentQuestion.getNext?.(value, newAnswers);

    if (nextQuestionId) {
      setCurrentQuestionId(nextQuestionId);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    const answerKeys = Object.keys(answers);
    if (answerKeys.length === 0) return;

    const previousQuestionId = answerKeys[answerKeys.length - 1];
    const newAnswers = { ...answers };
    delete newAnswers[previousQuestionId];

    setAnswers(newAnswers);
    setCurrentQuestionId(previousQuestionId);
    setShowResult(false);
  };

  const handleRestart = () => {
    setCurrentQuestionId('start');
    setAnswers({});
    setShowResult(false);
  };

  const recommendation = showResult ? getGiftRecommendation(answers) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-4 left-4 text-sm text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-8 text-white text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3" />
            <h1 className="text-3xl font-bold mb-2">Gift Finder</h1>
            <p className="text-purple-100">Answer some silly questions to find your perfect gift!</p>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            {!showResult ? (
              <div className="space-y-8">
                {/* Progress */}
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Question {questionNumber}</span>
                  {Object.keys(answers).length > 0 && (
                    <button
                      onClick={handleBack}
                      className="text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                </div>

                {/* Question */}
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4 animate-bounce">{currentQuestion.emoji}</div>
                  <h2 className="text-2xl md:text-3xl text-slate-800 font-medium">
                    {currentQuestion.question}
                  </h2>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className="group relative p-6 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-purple-50 hover:to-pink-50 rounded-2xl border-2 border-slate-200 hover:border-purple-400 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl group-hover:scale-110 transition-transform">
                          {option.emoji}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-800 font-medium group-hover:text-purple-700 transition-colors">
                            {option.label}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                {/* Result */}
                <div className="space-y-4">
                  <div className="text-8xl animate-bounce mb-6">{recommendation?.emoji}</div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">
                    Your Perfect Gift Is...
                  </h2>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
                    <h3 className="text-2xl font-bold text-purple-700 mb-3">
                      {recommendation?.name}
                    </h3>
                    <p className="text-slate-700 text-lg mb-4">
                      {recommendation?.description}
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-purple-600">Why? </span>
                        {recommendation?.reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    onClick={handleRestart}
                    variant="outline"
                    fullWidth
                    className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => {
                      // Navigate to home page with the gift name as a query param
                      const giftName = encodeURIComponent(recommendation?.name || '');
                      window.location.href = `/?gift=${giftName}`;
                    }}
                    variant="primary"
                    fullWidth
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Make a Wish for This Gift
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fun footer message */}
        {!showResult && (
          <p className="text-center mt-6 text-purple-600 text-sm">
            Don&apos;t worry, there are no wrong answers... except maybe broccoli
          </p>
        )}
      </div>
    </div>
  );
}
