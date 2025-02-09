import { Brain, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatsDisplayProps {
  score: number;
  streak: number;
  difficulty: string;
  correctAnswersInRow: number;
}

export function StatsDisplay({
  score,
  streak,
  difficulty,
  correctAnswersInRow,
}: StatsDisplayProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Tooltip>
        <TooltipTrigger>
          <StatCard
            icon={<Brain className="w-5 h-5 text-purple-500" />}
            label="Score"
            value={score}
            animate={true}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Total points earned</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <StatCard
            icon={<Star className="w-5 h-5 text-yellow-500" />}
            label="Streak"
            value={streak}
            animate={true}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Consecutive correct answers</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
            label="Difficulty"
            value={`${difficulty} (${correctAnswersInRow})`}
            capitalize
            animate={true}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Current difficulty level</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  capitalize?: boolean;
  animate?: boolean;
}

function StatCard({ icon, label, value, capitalize }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-xl p-4 shadow-sm transition-all hover:shadow-md border border-gray-200"
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <motion.p
            key={value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-lg font-bold text-gray-900 ${
              capitalize ? "capitalize" : ""
            }`}
          >
            {value}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
