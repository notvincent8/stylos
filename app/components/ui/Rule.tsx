type RuleProps = { className?: string }

const Rule = ({ className }: RuleProps = {}) => {
  return <div className={`h-px bg-edge${className ? ` ${className}` : ""}`} />
}

export default Rule
