import OliveBranch from './OliveBranch'

function BotanicalDivider({ className = '' }) {
  return (
    <div className={`flex justify-center ${className}`} aria-hidden="true">
      <OliveBranch className="h-6 w-40 text-sage opacity-20 md:w-56" />
    </div>
  )
}

export default BotanicalDivider
