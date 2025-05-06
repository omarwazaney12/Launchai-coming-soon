export default function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-800/20 rounded-full blur-[100px]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-primary-500/5 to-purple-800/20 bg-gradient-animate"></div>
      
      <div className="absolute inset-0 bg-primary-950/10"></div>
    </div>
  );
} 