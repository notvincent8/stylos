import type {ReactNode} from "react";

const Label = ({ children }: { children: ReactNode }) => {
  return (
    <div className="text-[0.68rem] tracking-[0.22em] uppercase text-ink/42 font-body font-semibold mb-[0.6rem]">
      {children}
    </div>
  )
}

export default Label