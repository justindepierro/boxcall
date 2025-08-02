import React, { useState } from 'react';
import { 
  SquareProgressBar, 
  SquareLoadingSpinner, 
  SquareSkeleton, 
  SquarePulseIndicator,
  FootballLoadingSpinner,
  SquarePageTransition 
} from '../components/ui/Animations/SquareAnimations';
import Button from '../components/ui/Button/Button';
import Card from '../components/ui/Card/Card';

const AnimationShowcasePage: React.FC = () => {
  const [progressValue, setProgressValue] = useState(75);
  const [isLoading, setIsLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const triggerLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const triggerTransition = () => {
    setShowTransition(!showTransition);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Square Animation System
          </h1>
          <p className="text-lg font-sans text-gray-600 dark:text-gray-400">
            Masculine, confident motion language for professional football management
          </p>
        </div>

        {/* Progress Bars Section */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white mb-4">
              Progress Indicators
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-sans font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Team Performance Metrics
                </h3>
                <SquareProgressBar
                  value={progressValue}
                  label="Offensive Efficiency"
                  variant="jade"
                  size="lg"
                  animated
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SquareProgressBar
                  value={82}
                  label="Defensive Rating"
                  variant="navy"
                  size="md"
                  animated
                />
                <SquareProgressBar
                  value={67}
                  label="Special Teams"
                  variant="gray"
                  size="md"
                  animated
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setProgressValue(Math.random() * 100)}
                  variant="primary"
                  size="sm"
                >
                  Randomize Progress
                </Button>
                <Button
                  onClick={() => setProgressValue(100)}
                  variant="secondary"
                  size="sm"
                >
                  Complete
                </Button>
                <Button
                  onClick={() => setProgressValue(0)}
                  variant="outline"
                  size="sm"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Loading States Section */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white mb-4">
              Loading States
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-sans font-medium text-gray-800 dark:text-gray-200">
                  Basic Spinner
                </h3>
                <SquareLoadingSpinner variant="jade" size="lg" label="Loading..." />
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-lg font-sans font-medium text-gray-800 dark:text-gray-200">
                  Status Indicators
                </h3>
                <div className="space-y-3">
                  <SquarePulseIndicator variant="jade" label="Online" />
                  <SquarePulseIndicator variant="navy" label="Processing" />
                  <SquarePulseIndicator variant="red" label="Alert" />
                </div>
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-lg font-sans font-medium text-gray-800 dark:text-gray-200">
                  Football Loading
                </h3>
                {isLoading ? (
                  <FootballLoadingSpinner message="Analyzing game data..." />
                ) : (
                  <div className="py-8">
                    <Button onClick={triggerLoading} variant="primary">
                      Start Loading
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Skeleton Loading Section */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white mb-4">
              Skeleton Loading
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-sans font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Player Stats Loading
                </h3>
                <SquareSkeleton lines={4} height="h-6" />
              </div>

              <div>
                <h3 className="text-lg font-sans font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Game Summary Loading
                </h3>
                <SquareSkeleton lines={6} height="h-4" />
              </div>
            </div>
          </div>
        </Card>

        {/* Button Animations Section */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white mb-4">
              Enhanced Button Interactions
            </h2>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg">
                Primary Action
              </Button>
              <Button variant="secondary" size="lg">
                Secondary Action
              </Button>
              <Button variant="outline" size="lg">
                Outline Button
              </Button>
              <Button variant="ghost" size="lg">
                Ghost Button
              </Button>
              <Button variant="danger" size="lg">
                Danger Action
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Hover and click buttons to see enhanced square animations with lift, press, and focus effects.
            </p>
          </div>
        </Card>

        {/* Page Transitions Section */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white mb-4">
              Page Transitions
            </h2>
            
            <div className="space-y-4">
              <Button onClick={triggerTransition} variant="primary">
                Toggle Transition Demo
              </Button>
              
              {showTransition && (
                <SquarePageTransition direction="right">
                  <div className="bg-jade-50 dark:bg-jade-900/20 p-6 rounded-sm border border-jade-200 dark:border-jade-800">
                    <h3 className="text-xl font-display font-semibold text-jade-900 dark:text-jade-100 mb-2">
                      Transition Content
                    </h3>
                    <p className="text-jade-700 dark:text-jade-300">
                      This content slides in with square, confident motion. The animation uses technical timing curves
                      designed for professional applications with masculine, direct movement patterns.
                    </p>
                  </div>
                </SquarePageTransition>
              )}
            </div>
          </div>
        </Card>

        {/* Animation Principles */}
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white mb-4">
              Square Animation Principles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-jade-500 rounded-sm mx-auto mb-3 animate-punchScale"></div>
                <h4 className="font-sans font-semibold text-gray-900 dark:text-white mb-1">Confident</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Direct, purposeful motion</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-navy-500 rounded-sm mx-auto mb-3 transition-square hover:scale-105"></div>
                <h4 className="font-sans font-semibold text-gray-900 dark:text-white mb-1">Technical</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Precise, calculated timing</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gray-500 rounded-sm mx-auto mb-3 hover-lift"></div>
                <h4 className="font-sans font-semibold text-gray-900 dark:text-white mb-1">Masculine</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Strong, substantial feel</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-jade-600 rounded-sm mx-auto mb-3 active-press"></div>
                <h4 className="font-sans font-semibold text-gray-900 dark:text-white mb-1">Responsive</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clear interaction feedback</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnimationShowcasePage;
