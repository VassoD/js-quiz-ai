interface LoadingCardProps {
  message?: string;
}

export const LoadingCard = ({ message = "Loading..." }: LoadingCardProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-card rounded-xl shadow-lg animate-pulse">
      <div className="flex items-center justify-center">
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
