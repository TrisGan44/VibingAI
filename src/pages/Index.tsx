import AnimatedBackground from "@/components/AnimatedBackground";
import ChatContainer from "@/components/ChatContainer";

const Index = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AnimatedBackground />
      
      {/* Main chat interface */}
      <div className="relative z-10 h-screen">
        <ChatContainer />
      </div>
    </div>
  );
};

export default Index;
