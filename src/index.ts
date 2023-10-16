import type { FrameElement, TurboBeforeFetchResponseEvent } from '@hotwired/turbo'
import type { FormSubmission } from '@hotwired/turbo/dist/types/core/drive/form_submission'
import type { FetchResponse } from '@hotwired/turbo/dist/types/http/fetch_response'

function beforeFetchResponseListener (
  this: CustomEvent,
  fetchEvent: TurboBeforeFetchResponseEvent
) {
  const initiator = this.target as HTMLElement
  const formSubmission = this.detail.formSubmission as FormSubmission

  if (refreshFrames(initiator, fetchEvent.detail.fetchResponse, formSubmission))
    fetchEvent.preventDefault()
}

// Intercept form submissions
const onSubmit = (event: any) => {
  addEventListener(
    'turbo:before-fetch-response',
    beforeFetchResponseListener.bind(event) as any,
    { once: true }
  )
}

// Intercept link clicks
const onClick = (event: any) => {
  addEventListener(
    'turbo:before-fetch-response',
    beforeFetchResponseListener.bind(event) as any,
    { once: true }
  )
}

/**
 * Refresh multiple frames at once
 * @param initiator Initiator element, e.g. a form or a link
 * @param response Turbo FetchResponse
 * @param formSubmission Turbo FormSubmission
 */
const refreshFrames = (initiator: HTMLElement, response: FetchResponse, formSubmission?: FormSubmission) => {
  const targetFrame = initiator.dataset.turboFrame

  // Nothing to do here, let Turbo handle it
  if (!targetFrame)
    return false
  
  // Find frames to refresh
  const frames = targetFrame
    .split(' ')
    .filter((value, index, array) => value && array.indexOf(value) === index) // Remove duplicates
    .map((id) => {
      if (id === '_self') {
        // Support data-turbo-frame="_self"
        // selfFrameTargetIndex = index
        return initiator.closest<FrameElement>('turbo-frame')
      } else {
        // Support data-turbo-frame="frame_id"
        return document.querySelector<FrameElement>(`turbo-frame#${id}`)
      }
    })

  // Refresh other frames
  frames.forEach(frame => {
    if (!frame)
      return

    /**
     * Mock default behavior of Turbo
     * @see https://github.com/hotwired/turbo/blob/c207f5b25758e4a084e8ae42e49712b91cf37114/src/core/frames/frame_controller.js#L235-L244
     */
    frame.delegate.proposeVisitIfNavigatedWithAction(frame, initiator, formSubmission?.submitter)
    frame.delegate.loadResponse(response)

    if (formSubmission && !formSubmission.isSafe) {
      // @ts-ignore
      window?.Turbo?.cache?.clear?.()
    }
  })

  // Prevent Turbo from refreshing the frame
  return true
}


/**
 * Enable support for multiple frame targeting in Turbo
 * @see https://github.com/miii/turbo-target-multiple-frames
 * @example
 *   <form data-turbo-frame="item_23 featured_list">
 *     ...
 *   </form>
 */
export const enable = () => {
  addEventListener('turbo:submit-start', onSubmit)
  addEventListener('turbo:click', onClick as EventListener)
}

export default enable

/**
 * Disable support for multiple frame targeting in Turbo
 * @see https://github.com/miii/turbo-target-multiple-frames
 * @example
 *   <form data-turbo-frame="item_23 featured_list">
 *     ...
 *   </form>
 */
export const disable = () => {
  removeEventListener('turbo:submit-start', onSubmit)
  removeEventListener('turbo:click', onClick as EventListener)
}