import { Link, NavLink } from '@remix-run/react'
import type { SidebarNavigationItem } from './page'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function Sidebar({
  sidebarNavigation
}: {
  sidebarNavigation: SidebarNavigationItem[]
}): JSX.Element {
  return (
    <div className='hidden overflow-y-auto w-28 bg-indigo-700 md:block'>
      <div className='flex flex-col items-center py-6 w-full'>
        <div className='flex shrink-0 items-center'>
          <Link to='/'>
            <img
              className='w-auto h-8'
              src='https://tailwindui.com/img/logos/workflow-mark.svg?color=white'
              alt='Workflow'
            />
          </Link>
        </div>
        <div className='flex-1 px-2 mt-6 space-y-1 w-full'>
          {sidebarNavigation.map(item => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `group flex w-full flex-col items-center rounded-md p-3 text-xs font-medium ${
                  isActive
                    ? 'bg-indigo-800 text-white'
                    : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
                }`
              }
              // aria-current={({ isActive }) => isActive ? "page" : undefined}
            >
              <item.icon
                className={classNames(
                  item.current
                    ? 'text-white'
                    : 'text-indigo-300 group-hover:text-white',
                  'h-6 w-6'
                )}
                aria-hidden='true'
              />
              <span className='mt-2'>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}
