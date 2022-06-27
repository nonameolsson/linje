import { Menu, Transition } from '@headlessui/react'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useCatch,
  useLoaderData
} from '@remix-run/react'
import cx from 'classnames'
import { Fragment } from 'react'
import invariant from 'tiny-invariant'
import { Page } from '~/components/page'
import type { Timeline } from '~/models/timeline.server'
import { deleteTimeline, getTimeline } from '~/models/timeline.server'
import { requireUserId } from '~/session.server'

type LoaderData = {
  timeline: Timeline
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.timelineId, 'timelineId not found')

  const timeline = await getTimeline({
    userId,
    id: params.timelineId
  })
  if (!timeline) {
    throw new Response('Not Found', { status: 404 })
  }

  return json<LoaderData>({ timeline })
}

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.timelineId, 'timelineId not found')

  await deleteTimeline({ userId, id: params.timelineId })

  return redirect('/timelines')
}

export default function TimelineDetailsPage() {
  const data = useLoaderData() as LoaderData

  return (
    <Page
      description={data.timeline.description}
      title={data.timeline.title}
      actions={
        <Menu as='div' className='dropdown dropdown-end'>
          <div>
            <Menu.Button className='m-1 btn'>Options</Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items
              as='ul'
              className='p-2 mt-3 w-52 shadow menu menu-compact dropdown-content bg-base-100 rounded-box'
            >
              <Menu.Item as='li'>
                <Link to='/timelines'>Close</Link>
              </Menu.Item>
              <Menu.Item as='li'>
                <Form method='post'>
                  <button type='submit'>Delete</button>
                </Form>
              </Menu.Item>
              <Menu.Item as='li'>
                <Link to='edit'>Edit</Link>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      }
    >
      <div>
        <div className='sm:hidden'>
          <label htmlFor='tabs' className='sr-only'>
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            id='tabs'
            name='tabs'
            className='block py-2 pr-10 pl-3 w-full text-base rounded-md border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
            defaultValue='events'
          >
            <option>Events</option>
            <option>People</option>
            <option>Places</option>
          </select>
        </div>
        <div className='hidden sm:block'>
          <div className='tabs' aria-label='Tabs'>
            <NavLink
              to='events'
              className={({ isActive }) =>
                cx('tab tab-bordered', { 'tab-active': isActive })
              }
            >
              Events
            </NavLink>
            <NavLink
              to='places'
              className={({ isActive }) =>
                cx('tab tab-bordered', { 'tab-active': isActive })
              }
            >
              Places
            </NavLink>
            <NavLink
              to='people'
              className={({ isActive }) =>
                cx('tab tab-bordered', { 'tab-active': isActive })
              }
            >
              People
            </NavLink>
          </div>
        </div>
      </div>

      <Outlet />
    </Page>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return <div>Timeline not found</div>
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`)
}
