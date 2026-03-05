'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FaVideo,
  FaMusic,
  FaLanguage,
  FaPlay,
  FaDownload,
  FaSpinner,
  FaExclamationTriangle,
  FaStop,
  FaPause,
} from 'react-icons/fa';
import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { GET_MUSIC_FILES, GENERATE_REEL } from '@/utils/api/routes/reels';

interface MusicFile {
  filename: string;
  path: string;
}

interface GenerationSequence {
  id: number;
  text: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
}

interface GenerationResult {
  videoUrl: string;
  sequences: GenerationSequence[];
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
];

export default function AIReelsGenerator() {
  const [prompt, setPrompt] = useState('');
  const [selectedMusic, setSelectedMusic] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [includeVideos, setIncludeVideos] = useState(false);
  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] =
    useState<GenerationResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generationStartTime, setGenerationStartTime] = useState<Date | null>(
    null
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  // Component mount check for hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch music files on component mount
  useEffect(() => {
    fetchMusicFiles();
  }, []);

  // Timer for elapsed time during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && generationStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - generationStartTime.getTime()) / 1000
        );
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, generationStartTime]);
  const fetchMusicFiles = async () => {
    try {
      const response = await fetch(GET_MUSIC_FILES);
      const data = await response.json();
      console.log('Fetched music files:', data);
      setMusicFiles(data);
    } catch (error) {
      console.error('Error fetching music files:', error);
      toast.error('Error loading background music options');
    }
  };

  const handleGenerateReel = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for your reel');
      return;
    }

    setIsGenerating(true);
    setGenerationStartTime(new Date());
    setElapsedTime(0);
    setLoadingMessage('Initializing AI reel generation...');

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      if (selectedMusic) {
        formData.append('backgroundMusic', selectedMusic);
      }
      formData.append('language', selectedLanguage);
      formData.append('includeVideos', includeVideos.toString());

      // Update loading messages
      setTimeout(
        () => setLoadingMessage('Creating script and scenes...'),
        2000
      );
      setTimeout(() => setLoadingMessage('Generating images...'), 5000);
      setTimeout(() => setLoadingMessage('Synthesizing speech...'), 10000);
      setTimeout(() => setLoadingMessage('Compiling final video...'), 15000);

      const response = await fetch(GENERATE_REEL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setGenerationResult(data);
        toast.success('Reel generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate reel');
      }
    } catch (error) {
      console.error('Error generating reel:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate reel'
      );
    } finally {
      setIsGenerating(false);
      setGenerationStartTime(null);
      setLoadingMessage('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const downloadVideo = () => {
    if (generationResult?.videoUrl) {
      const link = document.createElement('a');
      link.href = `http://localhost:5050${generationResult.videoUrl}`;
      link.download = 'generated-reel.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const playMusicPreview = (filename: string) => {
    if (!filename || filename === '') {
      toast.error('No music file selected');
      return;
    }

    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (currentlyPlaying === filename) {
      // If same track is playing, stop it
      setCurrentlyPlaying(null);
      setAudioElement(null);
      return;
    }

    // Create new audio element
    const audio = new Audio(`http://localhost:5050/music/${filename}`);
    audio.volume = 0.5; // Set volume to 50%

    audio.addEventListener('ended', () => {
      setCurrentlyPlaying(null);
      setAudioElement(null);
    });

    audio.addEventListener('error', (e) => {
      console.error('Error playing audio:', filename, e);
      toast.error(`Error playing music preview: ${filename}`);
      setCurrentlyPlaying(null);
      setAudioElement(null);
    });

    audio
      .play()
      .then(() => {
        setCurrentlyPlaying(filename);
        setAudioElement(audio);
      })
      .catch((error) => {
        console.error('Error playing audio:', error);
        toast.error(`Error playing music preview: ${filename}`);
        setCurrentlyPlaying(null);
        setAudioElement(null);
      });
  };

  const stopMusicPreview = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    setCurrentlyPlaying(null);
    setAudioElement(null);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [audioElement]);
  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='text-center space-y-2'>
        <div className='flex items-center justify-center gap-2'>
          <FaVideo className='text-3xl text-brand-primary' />
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            AI Reel Generator
          </h1>
        </div>{' '}
        <p className='text-gray-600 dark:text-gray-400'>
          Create engaging video content using AI-powered generation
        </p>
        {/* Duration Information */}
        <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto'>
          <div className='flex items-start gap-3'>
            <FaExclamationTriangle className='text-blue-500 mt-1 flex-shrink-0' />
            <div className='space-y-2 text-sm'>
              <h3 className='font-medium text-blue-800 dark:text-blue-200'>
                Generation Time Information
              </h3>
              <div className='text-blue-700 dark:text-blue-300 space-y-1'>
                <p>
                  • <strong>Without videos:</strong> Less than 3 minutes
                </p>
                <p>
                  • <strong>With videos:</strong> More than 45 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isMounted ? (
        <div className='flex justify-center items-center h-40'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary'></div>
        </div>
      ) : (
        <>
          {/* Warning Badge */}
          {isGenerating && (
            <div className='flex justify-center'>
              <Badge>
                <div className='flex items-center gap-2'>
                  {' '}
                  <FaExclamationTriangle className='text-yellow-500' />
                  <span>
                    ⚠️ Generation in progress - DO NOT close this page (
                    {includeVideos ? '45+ minutes' : '< 3 minutes'})
                  </span>
                </div>
              </Badge>
            </div>
          )}

          {/* Generation Form */}
          {!isGenerating && !generationResult && (
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Create Your Reel
              </h2>
              {/* Prompt Input */}
              <div>
                <TextArea
                  label='Reel Description'
                  placeholder='Describe the video content you want to create. Be as detailed as possible about the story, mood, and key messages...'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className={{
                    container: 'space-y-2',
                    textarea: 'min-h-32',
                  }}
                />
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  Example: "Create a promotional video for our new smartphone
                  featuring modern design, key features like camera quality and
                  battery life, with an upbeat and exciting tone"
                </p>
              </div>

              {/* Music Selection */}
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  <FaMusic className='inline mr-2' />
                  Background Music (Optional)
                </label>

                <div className='space-y-3'>
                  {' '}
                  <Select
                    value={
                      musicFiles?.find(
                        (file) => file.filename === selectedMusic
                      )
                        ? {
                            value: selectedMusic,
                            label: selectedMusic
                              .replace('.mp3', '')
                              .replace(/-/g, ' '),
                          }
                        : selectedMusic === ''
                        ? { value: '', label: 'No background music' }
                        : null
                    }
                    setValue={(selectedOption) => {
                      console.log('Selected music option:', selectedOption);
                      const value = selectedOption?.value || '';
                      console.log('Extracted value:', value, typeof value);
                      setSelectedMusic(value);
                    }}
                    options={[
                      { value: '', label: 'No background music' },
                      ...(musicFiles?.map((file) => ({
                        value: file.filename,
                        label: file.filename
                          .replace('.mp3', '')
                          .replace(/-/g, ' '),
                      })) || []),
                    ]}
                    instanceId='music-select'
                  />
                  {/* Debug info */}
                  {/* {process.env.NODE_ENV === 'development' && (
                    <div className='text-xs text-gray-500 p-2 bg-gray-100 rounded'>
                      Debug - Selected Music: "{selectedMusic}" | Type:{' '}
                      {typeof selectedMusic}
                    </div>
                  )} */}
                  {/* Music Preview Section */}
                  {selectedMusic && selectedMusic !== '' && (
                    <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <FaMusic className='text-brand-primary text-sm' />
                          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                            {selectedMusic
                              .replace('.mp3', '')
                              .replace(/-/g, ' ')}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          {selectedMusic && selectedMusic !== '' && (
                            <button
                              type='button'
                              onClick={() => playMusicPreview(selectedMusic)}
                              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                currentlyPlaying === selectedMusic
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                  : 'bg-brand-primary text-white hover:bg-brand-primary/80'
                              }`}
                            >
                              {currentlyPlaying === selectedMusic ? (
                                <>
                                  <FaStop className='text-xs' />
                                  Stop
                                </>
                              ) : (
                                <>
                                  <FaPlay className='text-xs' />
                                  Preview
                                </>
                              )}
                            </button>
                          )}
                          {currentlyPlaying && (
                            <button
                              type='button'
                              onClick={stopMusicPreview}
                              className='flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors'
                            >
                              <FaPause className='text-xs' />
                            </button>
                          )}
                        </div>
                      </div>
                      {currentlyPlaying === selectedMusic && (
                        <div className='mt-2'>
                          <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                            <div className='flex items-center gap-1'>
                              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                              <span>Playing preview...</span>
                            </div>
                            <span>•</span>
                            <span>Volume: 50%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}{' '}
                  {/* Music Library Preview */}
                  {(!selectedMusic || selectedMusic === '') &&
                    musicFiles &&
                    musicFiles.length > 0 && (
                      <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3'>
                        <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                          Available Music Library
                        </h4>
                        <div className='space-y-2 max-h-32 overflow-y-auto'>
                          {musicFiles.slice(0, 3).map((file) => (
                            <div
                              key={file.filename}
                              className='flex items-center justify-between py-1'
                            >
                              {' '}
                              <span className='text-xs text-gray-600 dark:text-gray-400 truncate flex-1'>
                                {file.filename &&
                                typeof file.filename === 'string'
                                  ? file.filename
                                      .replace('.mp3', '')
                                      .replace(/-/g, ' ')
                                  : file.filename}
                              </span>
                              <button
                                type='button'
                                onClick={() => playMusicPreview(file.filename)}
                                className={`ml-2 flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                  currentlyPlaying === file.filename
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                                }`}
                              >
                                {currentlyPlaying === file.filename ? (
                                  <>
                                    <FaStop className='text-xs' />
                                    Stop
                                  </>
                                ) : (
                                  <>
                                    <FaPlay className='text-xs' />
                                    Preview
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                          {musicFiles.length > 3 && (
                            <p className='text-xs text-gray-500 dark:text-gray-400 text-center pt-1'>
                              ...and {musicFiles.length - 3} more tracks
                            </p>
                          )}
                        </div>
                      </div>
                    )}{' '}
                </div>
              </div>

              {/* Language Selection */}
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  <FaLanguage className='inline mr-2' />
                  Voice Language
                </label>
                <Select
                  value={selectedLanguage}
                  setValue={(value) => setSelectedLanguage(value)}
                  options={languages}
                  instanceId='language-select'
                />
              </div>
              {/* Include Videos Checkbox */}
              <div className='space-y-2'>
                <div className='flex items-start gap-3'>
                  <input
                    type='checkbox'
                    id='include-videos'
                    checked={includeVideos}
                    onChange={(e) => setIncludeVideos(e.target.checked)}
                    className='mt-1 h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary'
                  />
                  <div className='flex-1'>
                    <label
                      htmlFor='include-videos'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer'
                    >
                      <FaVideo className='inline mr-2' />
                      Include Video Clips
                    </label>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                      {includeVideos ? (
                        <span className='text-orange-600 dark:text-orange-400 font-medium'>
                          ⚠️ This will significantly increase generation time to
                          45+ minutes
                        </span>
                      ) : (
                        <span className='text-green-600 dark:text-green-400'>
                          ✓ Fast generation: Less than 3 minutes
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              {/* Generate Button */}
              <Button
                onClick={handleGenerateReel}
                className='w-full py-3 bg-brand-primary hover:bg-brand-primary/80'
              >
                <div className='flex items-center gap-2 justify-center'>
                  <FaVideo className='mr-2' />
                  <span>Generate AI Reel</span>
                </div>
              </Button>
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center space-y-6'>
              <div className='space-y-4'>
                <FaSpinner className='animate-spin text-4xl text-brand-primary mx-auto' />
                <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  Generating Your Reel
                </h2>
                <p className='text-gray-600 dark:text-gray-400'>
                  {loadingMessage}
                </p>{' '}
                {/* Progress Info */}
                <div className='space-y-2'>
                  <div className='flex justify-center items-center gap-4 text-sm text-gray-500 dark:text-gray-400'>
                    <span>Elapsed: {formatTime(elapsedTime)}</span>
                    <span>•</span>
                    <span>
                      Estimated: {includeVideos ? '45+ minutes' : '< 3 minutes'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                    <div
                      className='bg-brand-primary h-2 rounded-full transition-all duration-500'
                      style={{
                        width: `${Math.min(
                          (elapsedTime / (includeVideos ? 45 * 60 : 3 * 60)) *
                            100,
                          95
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
                <div className='flex items-start gap-3'>
                  <FaExclamationTriangle className='text-yellow-500 mt-1 flex-shrink-0' />
                  <div className='space-y-1'>
                    {' '}
                    <h3 className='font-medium text-yellow-800 dark:text-yellow-200'>
                      Important: Do Not Close This Page
                    </h3>
                    <p className='text-sm text-yellow-700 dark:text-yellow-300'>
                      The AI reel generation process typically takes{' '}
                      {includeVideos
                        ? '45+ minutes when including video clips'
                        : 'less than 3 minutes without video clips'}
                      . Closing this page will interrupt the generation and
                      you'll lose your progress.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generation Result */}
          {generationResult && (
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6'>
              <div className='text-center'>
                <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
                  🎉 Your Reel is Ready!
                </h2>

                {/* Video Player */}
                <div className='bg-black rounded-lg overflow-hidden max-w-md mx-auto mb-6'>
                  <video
                    controls
                    className='w-full h-auto'
                    src={`http://localhost:5050${generationResult.videoUrl}`}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-4 justify-center'>
                  <Button
                    onClick={downloadVideo}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    {' '}
                    <FaDownload className='mr-2' />
                    Download Video
                  </Button>
                  <Button
                    onClick={() => {
                      setGenerationResult(null);
                      setPrompt('');
                      setSelectedMusic('');
                      setSelectedLanguage('en');
                      setIncludeVideos(false);
                      stopMusicPreview(); // Stop any playing music
                    }}
                    variant='outlined'
                  >
                    Create Another Reel
                  </Button>
                </div>
              </div>
              {/* Generation Details */}
              {generationResult.sequences &&
                generationResult.sequences.length > 0 && (
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                      Video Sequences
                    </h3>
                    <div className='grid gap-4 md:grid-cols-2'>
                      {generationResult.sequences.map((sequence) => (
                        <div
                          key={sequence.id}
                          className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2'
                        >
                          <div className='flex justify-between items-start'>
                            <span className='text-sm font-medium text-brand-primary'>
                              Sequence {sequence.id}
                            </span>
                            <span className='text-xs text-gray-500'>
                              {sequence.duration}s
                            </span>
                          </div>
                          <p className='text-sm text-gray-700 dark:text-gray-300'>
                            {sequence.text}
                          </p>
                          {sequence.imageUrl && (
                            <img
                              src={`http://localhost:5050${sequence.imageUrl}`}
                              alt={`Sequence ${sequence.id}`}
                              className='w-full h-20 object-cover rounded'
                            />
                          )}
                        </div>
                      ))}{' '}
                    </div>
                  </div>
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
