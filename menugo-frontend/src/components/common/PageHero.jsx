
import Button from './Button'

// const Stat = ({ label, value }) => (
//   <div className="bg-white bg-opacity-10 px-4 py-3 rounded-xl">
//     <div className="text-sm text-black/90">{label}</div>
//     <div className="text-2xl font-extrabold text-black/90">{value}</div>
//   </div>
// )

const PageHero = ({ title, subtitle, stats = [], primaryAction }) => {
  return (
    <div className="-mx-6 rounded-b-2xlbg-white text-black/90 p-8 mb-8 ">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl tracking-tight">{title}</h2>
          {subtitle && <p className="mt-2 text-black/90 max-w-2xl">{subtitle}</p>}
          {/* {stats.length > 0 && (
            <div className="flex gap-3 mt-4">{stats.map((s, i) => <Stat key={i} {...s} />)}</div>
          )} */}
        </div>

        <div className="flex items-center gap-3">
          {primaryAction}
        </div>
      </div>
    </div>
  )
}

export default PageHero
