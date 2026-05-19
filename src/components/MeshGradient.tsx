export default function MeshGradient() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] rounded-full opacity-60 animate-mesh-1 blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(125, 211, 232, 0.4) 0%, rgba(125, 211, 232, 0) 70%)' }}
      />
      <div 
        className="absolute top-[20%] right-[-10%] w-[45%] h-[55%] rounded-full opacity-50 animate-mesh-2 blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(49, 184, 210, 0.3) 0%, rgba(49, 184, 210, 0) 70%)' }}
      />
      <div 
        className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full opacity-40 animate-mesh-3 blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(232, 247, 250, 0.8) 0%, rgba(232, 247, 250, 0) 70%)' }}
      />
    </div>
  );
}
