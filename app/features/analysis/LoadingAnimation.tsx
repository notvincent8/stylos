const LoadingAnimation = () => {
  return (
    <div className="flex flex-col gap-7 py-4">
      <div className="flex flex-col gap-0.5 leading-none">
        <div className="font-display text-[3.8rem] tracking-[0.16em] text-ink/40 uppercase">Reading</div>
        <div className="font-display text-[3.8rem] tracking-[0.16em] text-accent uppercase">Aesthetics</div>
      </div>

      <div className="flex flex-col gap-1.75">
        <div className="relative h-0.5 w-full bg-edge-mid overflow-hidden">
          <div className="absolute inset-0 bg-accent animate-scanbar" />
        </div>
        <div className="relative h-0.5 w-[73%] bg-edge-mid overflow-hidden">
          <div className="absolute inset-0 bg-accent animate-scanbar [animation-delay:220ms]" />
        </div>
        <div className="relative h-[2px] w-[88%] bg-edge-mid overflow-hidden">
          <div className="absolute inset-0 bg-accent animate-scanbar [animation-delay:440ms]" />
        </div>
      </div>
    </div>
  )
}

export default LoadingAnimation
