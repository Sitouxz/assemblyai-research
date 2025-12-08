'use client';

interface ComparisonBenchmarksProps {
  yourWpm: number;
  yourFluency: number;
}

export default function ComparisonBenchmarks({ yourWpm, yourFluency }: ComparisonBenchmarksProps) {
  const benchmarks = [
    { label: 'Podcasters', wpm: 160, fluency: 75 },
    { label: 'Presenters', wpm: 145, fluency: 82 },
    { label: 'Conversations', wpm: 165, fluency: 68 },
    { label: 'News Anchors', wpm: 150, fluency: 88 },
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        📊 How You Compare
      </h4>
      
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="font-medium text-blue-900 dark:text-blue-400 mb-2">Your Performance</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">WPM:</span>
              <span className="ml-2 font-bold text-blue-700 dark:text-blue-400">{yourWpm}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Fluency:</span>
              <span className="ml-2 font-bold text-blue-700 dark:text-blue-400">{yourFluency}</span>
            </div>
          </div>
        </div>

        {benchmarks.map((benchmark, index) => {
          const wpmDiff = yourWpm - benchmark.wpm;
          const fluencyDiff = yourFluency - benchmark.fluency;
          
          return (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="font-medium text-gray-900 dark:text-white mb-2">{benchmark.label}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">WPM:</span>
                  <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">{benchmark.wpm}</span>
                  <span className={`ml-2 text-xs ${wpmDiff > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    ({wpmDiff > 0 ? '+' : ''}{wpmDiff})
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Fluency:</span>
                  <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">{benchmark.fluency}</span>
                  <span className={`ml-2 text-xs ${fluencyDiff > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    ({fluencyDiff > 0 ? '+' : ''}{fluencyDiff})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
        📝 Benchmarks are approximate averages from various speech contexts
      </p>
    </div>
  );
}

