const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="glass px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex items-center gap-1">
          <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
          <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
          <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
