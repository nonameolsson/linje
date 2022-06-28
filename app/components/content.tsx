export function Content({
  children,
  actions,
  title
}: {
  children?: React.ReactNode
  actions?: JSX.Element
  title: string
}): JSX.Element {
  return (
    <main className='grid grid-cols-1 gap-4 items-start h-full lg:grid-cols-4 lg:gap-8'>
      <section
        aria-labelledby='primary-heading'
        className='col-span-4 col-start-1 lg:col-span-2 lg:col-start-2'
      >
        <h1 id='primary-heading' className='sr-only'>
          {title}
        </h1>

        <div className='flex justify-between'>
          <div className='flex items-start'>{actions}</div>
        </div>
        <div className='mt-4 h-full'>{children}</div>
      </section>
    </main>
  )
}
