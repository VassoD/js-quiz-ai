import QuizApp from "../components/QuizApp";
import { ThemeToggle } from "../components/ui/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background relative">
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <ThemeToggle />
      </div>
      <QuizApp />
    </div>
  );
}
