import type { FrameElement } from '@hotwired/turbo'

// Intercept form submissions
const onSubmit = (event: any) => {
  if (!event.detail.success)
    return

  const response = event.detail.fetchResponse
  const formSubmission = event.detail.formSubmission
  const form = formSubmission.formElement

  refreshFrames(form, response, formSubmission.submitter)
}

// Intercept link clicks
const onClick = (event: any) => {
  const target = event.target
  addEventListener('turbo:before-fetch-response', (event: any) => refreshFrames(target, event.detail.fetchResponse), { once: true })
}

/**
 * Refresh multiple frames at once
 * @param initiator Initiator element, e.g. a form or a link
 * @param response Turbo FetchResponse
 * @param submitter Submitter element, e.g. a submit button
 */
const refreshFrames = (initiator: HTMLElement, response: any, submitter?: HTMLElement) => {
  const targetFrame = initiator.dataset.turboFrame || ''
  
  // Find frames to refresh
  const frames = targetFrame
    .split(' ')
    .filter(Boolean)
    .map(id => document.querySelector<FrameElement>(`turbo-frame#${id}`))

  // Turbo will refresh the first frame natively
  frames.shift()

  // Refresh other frames
  frames.forEach(frame => {
    if (!frame)
      return

    // https://github.com/hotwired/turbo/blob/4593d06ce58d17af5b17495ad8524eaa9bc2f5d2/src/core/frames/frame_controller.ts#L265C13-L274
    frame.delegate.proposeVisitIfNavigatedWithAction(frame, initiator, submitter)
    frame.delegate.loadResponse(response)
  })
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
  addEventListener('turbo:submit-end', onSubmit)
  addEventListener('turbo:click', onClick)
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
  removeEventListener('turbo:submit-end', onSubmit)
  removeEventListener('turbo:click', onClick)
}