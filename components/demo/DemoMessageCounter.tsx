"use client";

interface DemoMessageCounterProps {
  currentCount: number;
  maxCount: number;
}

export function DemoMessageCounter({ currentCount, maxCount }: DemoMessageCounterProps) {
  const percentage = (currentCount / maxCount) * 100;

  let barColor = "bg-green-500";
  if (percentage >= 80 && percentage < 100) {
    barColor = "bg-yellow-500";
  } else if (percentage >= 100) {
    barColor = "bg-red-500";
  }

  return (
    <div className="w-40">
      <div className="flex justify-between text-xs mb-1">
        <span>{currentCount}/{maxCount} messages</span>
      </div>

      {/* progress bar wrapper */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
