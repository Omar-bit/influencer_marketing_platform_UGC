import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from './Modal';
import Button from '../ui/button';
import {
  FaUser,
  FaChild,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaChartLine,
} from 'react-icons/fa';
import { LuInstagram } from 'react-icons/lu';

interface FakeFollowersAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  followers?: number;
}

interface AnalysisResult {
  totalFollowers: number;
  realFollowers: number;
  fakeFollowers: number;
  fakeFollowersPercentage: number;
  suspiciousFollowers: number;
  suspiciousFollowersPercentage: number;
  qualityScore: number;
  engagementQuality: 'High' | 'Medium' | 'Low';
  riskLevel: 'Low' | 'Medium' | 'High';
  lastAnalyzed: Date;
}

interface ApiResponse {
  data: {
    prediction_results: {
      estimated_fake_followers: number;
      estimated_real_followers: number;
      fake_follower_percentage: number;
    };
    profile_stats: {
      biography: string;
      external_url: string;
      followers_count: number;
      following_count: number;
      full_name: string;
      highlight_reel_count: number;
      is_business_account: boolean;
      is_private: boolean;
      is_verified: boolean;
      posts_count: number;
    };
    risk_scores: {
      gmm_uncertainty: number;
      kmeans_risk_score: number;
      outlier_score: number;
    };
    username: string;
  };
  success: boolean;
}

const FakeFollowersAnalysisModal: React.FC<FakeFollowersAnalysisModalProps> = ({
  isOpen,
  onClose,
  username,
  followers = 0,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const performAnalysis = async () => {
    if (!username) {
      toast.error('Username is required for analysis');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('http://localhost:9000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'name=express',
        },
        body: JSON.stringify({
          username: username,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData: ApiResponse = await response.json();

      if (!apiData.success) {
        throw new Error('Analysis failed');
      }

      const { prediction_results, profile_stats, risk_scores } = apiData.data;

      // Map API response to our AnalysisResult interface
      const result: AnalysisResult = {
        totalFollowers: profile_stats.followers_count,
        realFollowers: prediction_results.estimated_real_followers,
        fakeFollowers: prediction_results.estimated_fake_followers,
        fakeFollowersPercentage: prediction_results.fake_follower_percentage,
        suspiciousFollowers: 0, // Not provided by API, could be calculated from risk scores
        suspiciousFollowersPercentage: 0,
        qualityScore: Math.floor(
          100 - prediction_results.fake_follower_percentage
        ),
        engagementQuality: 'High' as const,
        riskLevel: 'Low' as const,
        lastAnalyzed: new Date(),
      };

      // Calculate suspicious followers based on risk scores (optional enhancement)
      const riskThreshold = 0.5; // Adjust based on your needs
      if (risk_scores.outlier_score > riskThreshold) {
        result.suspiciousFollowers = Math.floor(result.totalFollowers * 0.1);
      }
      result.suspiciousFollowersPercentage =
        (result.suspiciousFollowers / result.totalFollowers) * 100;

      // Determine engagement quality and risk level based on fake follower percentage
      if (result.fakeFollowersPercentage < 10) {
        result.engagementQuality = 'High';
        result.riskLevel = 'Low';
      } else if (result.fakeFollowersPercentage < 25) {
        result.engagementQuality = 'Medium';
        result.riskLevel = 'Medium';
      } else {
        result.engagementQuality = 'Low';
        result.riskLevel = 'High';
      }

      setAnalysisResult(result);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);

      let errorMessage = 'Failed to analyze followers. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('HTTP error')) {
          errorMessage =
            'Server error. Please check if the analysis service is running.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Unable to connect to analysis service. Please check your connection.';
        } else if (error.message.includes('Analysis failed')) {
          errorMessage =
            'Analysis failed. The username might not exist or be private.';
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'text-green-600 bg-green-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'High':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'High':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Instagram Fake Followers Analysis'
      className={{
        header: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white',
        headerTitle: 'text-white',
      }}
    >
      <div className='p-6 space-y-6'>
        {/* Account Info */}
        <div className='flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
          <div className='p-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full'>
            <LuInstagram className='text-white size-6' />
          </div>
          <div>
            <h3 className='font-semibold text-lg dark:text-white'>
              @{username || 'unknown'}
            </h3>{' '}
            <p className='text-gray-600 dark:text-gray-400'>
              {analysisResult
                ? analysisResult.totalFollowers.toLocaleString()
                : followers?.toLocaleString() || 0}{' '}
              followers
            </p>
          </div>
        </div>

        {/* Analysis Button */}
        {!analysisResult && (
          <div className='text-center'>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              Analyze this Instagram account to detect fake followers and assess
              account quality.
            </p>
            <Button
              user='influencer'
              color='gradient'
              onClick={performAnalysis}
              disabled={isAnalyzing}
              className='px-8 py-3'
            >
              {isAnalyzing ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block'></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <FaChild className='mr-2' />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className='space-y-6'>
            {/* Quality Score */}
            <div className='text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg'>
              <div className='text-4xl font-bold text-purple-600 mb-2'>
                {analysisResult.qualityScore}%
              </div>
              <div className='text-lg font-medium text-gray-700 dark:text-gray-300'>
                Account Quality Score
              </div>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRiskLevelColor(
                  analysisResult.riskLevel
                )}`}
              >
                {analysisResult.riskLevel === 'Low' && (
                  <FaCheckCircle className='mr-1' />
                )}
                {analysisResult.riskLevel === 'Medium' && (
                  <FaExclamationTriangle className='mr-1' />
                )}
                {analysisResult.riskLevel === 'High' && (
                  <FaTimes className='mr-1' />
                )}
                {analysisResult.riskLevel} Risk
              </div>
            </div>

            {/* Followers Breakdown */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center'>
                <FaUser className='text-green-600 text-2xl mx-auto mb-2' />
                <div className='text-2xl font-bold text-green-600'>
                  {analysisResult.realFollowers.toLocaleString()}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Real Followers
                </div>
                <div className='text-xs text-green-600 font-medium'>
                  {(
                    (analysisResult.realFollowers /
                      analysisResult.totalFollowers) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>

              <div className='p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center'>
                <FaTimes className='text-red-600 text-2xl mx-auto mb-2' />
                <div className='text-2xl font-bold text-red-600'>
                  {analysisResult.fakeFollowers.toLocaleString()}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Fake Followers
                </div>
                <div className='text-xs text-red-600 font-medium'>
                  {analysisResult.fakeFollowersPercentage.toFixed(1)}%
                </div>
              </div>

              <div className='p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center'>
                <FaExclamationTriangle className='text-yellow-600 text-2xl mx-auto mb-2' />
                <div className='text-2xl font-bold text-yellow-600'>
                  {analysisResult.suspiciousFollowers.toLocaleString()}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Suspicious
                </div>
                <div className='text-xs text-yellow-600 font-medium'>
                  {analysisResult.suspiciousFollowersPercentage.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Engagement Quality */}
            <div className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <FaChartLine className='text-gray-600' />
                  <span className='font-medium text-gray-700 dark:text-gray-300'>
                    Engagement Quality
                  </span>
                </div>
                <span
                  className={`font-semibold ${getQualityColor(
                    analysisResult.engagementQuality
                  )}`}
                >
                  {analysisResult.engagementQuality}
                </span>
              </div>
            </div>

            {/* Analysis Date */}
            <div className='text-center text-sm text-gray-500 dark:text-gray-400'>
              Analysis completed on{' '}
              {analysisResult.lastAnalyzed.toLocaleDateString()} at{' '}
              {analysisResult.lastAnalyzed.toLocaleTimeString()}
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3'>
              <Button
                user='influencer'
                variant='outlined'
                onClick={() => setAnalysisResult(null)}
                className='flex-1'
              >
                Run New Analysis
              </Button>
              <Button
                user='influencer'
                color='primary'
                onClick={onClose}
                className='flex-1'
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FakeFollowersAnalysisModal;
