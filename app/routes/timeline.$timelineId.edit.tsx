import type { Timeline } from '@prisma/client'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import invariant from 'tiny-invariant'
import { z } from 'zod'

import { Page, TextArea, TextField } from '~/components'
import { getTimeline, updateTimeline } from '~/models/timeline.server'
import { requireUserId } from '~/session.server'
import { badRequestWithError } from '~/utils/index'

type LoaderData = {
  timeline: Timeline
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.timelineId, 'timelineId is required')

  const timeline = await getTimeline({
    userId,
    id: params.timelineId
  })

  if (!timeline) {
    throw new Response('Not Found', { status: 404 })
  }

  return json<LoaderData>({ timeline })
}

const formSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters long' }),
  description: z.string().optional(),
  imageUrl: z.string().optional() // TODO: Add validation for optional string URL. Meanwhile, client field validation is activated
})
type FormSchema = z.infer<typeof formSchema>

type ActionData = {
  formPayload?: FormSchema
  error?: any
}

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  const formPayload = Object.fromEntries(await request.formData()) as FormSchema
  invariant(params.timelineId, 'timelineId is required')

  try {
    const result = formSchema.parse(formPayload)

    const { title, description, imageUrl } = result
    const timeline = await updateTimeline({
      description,
      title,
      userId,
      imageUrl,
      id: params.timelineId
    })

    return redirect(`/timeline/${timeline.id}/events`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequestWithError<FormSchema>({
        error,
        formPayload,
        status: 400
      })
    }
    throw json(error, { status: 400 }) // Unknown error, should not happen
  }
}

export default function EditTimelinePage() {
  const loaderData = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()

  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const imageUrlRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.error?.title) {
      titleRef.current?.focus()
    } else if (actionData?.error?.description) {
      descriptionRef.current?.focus()
    } else if (actionData?.error?.imageUrl) {
      imageUrlRef.current?.focus()
    }
  }, [actionData])

  return (
    <Page
      title='Edit Timeline'
      showBackButton
      toolbarButtons={
        <button
          form='edit-timeline'
          className='btn btn-ghost'
          type='submit'
          name='action'
          value='update'
        >
          Save
        </button>
      }
    >
      <div className='flex flex-1 items-stretch overflow-hidden'>
        <main className='flex-1 overflow-y-auto p-4'>
          <section className='flex h-full min-w-0 flex-1 flex-col lg:order-last'>
            <Form
              id='edit-timeline'
              replace
              method='post'
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                width: '100%'
              }}
            >
              <TextField
                name='title'
                id='title'
                label='Title'
                ref={titleRef}
                errorMessage={actionData?.error?.title?._errors[0]}
                defaultValue={loaderData.timeline.title}
              />

              <TextArea
                name='description'
                ref={descriptionRef}
                rows={4}
                className='mt-2'
                label='Description'
                defaultValue={loaderData.timeline.description || ''}
                errorMessage={actionData?.error?.description?._errors[0]}
                required={false}
              />

              <TextField
                name='imageUrl'
                ref={imageUrlRef}
                id='imageUrl'
                type='url'
                label='Cover image (Optional)'
                errorMessage={actionData?.error?.imageUrl?._errors[0]}
                placeholder='https://myurl.com/image.png'
                defaultValue={loaderData.timeline.imageUrl || ''}
                required={false}
              />
            </Form>
          </section>
        </main>
      </div>
    </Page>
  )
}
