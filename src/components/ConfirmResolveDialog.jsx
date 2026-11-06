import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'

function ConfirmResolveDialog({
  alert,
  onCancel,
  onConfirm,
  isResolving,
  error,
}) {
  const cancelButtonRef = useRef(null)
  const confirmButtonRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    cancelButtonRef.current?.focus()

    return () => {
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus()
      }
    }
  }, [])

  useEffect(() => {
    if (isResolving) {
      dialogRef.current?.focus()
    } else {
      cancelButtonRef.current?.focus()
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isResolving) {
        event.preventDefault()
        onCancel()
        return
      }

      if (event.key === 'Tab') {
        const focusableButtons = [
          cancelButtonRef.current,
          confirmButtonRef.current,
        ].filter((button) => button && !button.disabled)
        const firstButton = focusableButtons[0]
        const lastButton = focusableButtons[focusableButtons.length - 1]

        if (!firstButton) {
          event.preventDefault()
          dialogRef.current?.focus()
        } else if (
          event.shiftKey &&
          (document.activeElement === firstButton ||
            !dialogRef.current?.contains(document.activeElement))
        ) {
          event.preventDefault()
          lastButton?.focus()
        } else if (
          !event.shiftKey &&
          (document.activeElement === lastButton ||
            !dialogRef.current?.contains(document.activeElement))
        ) {
          event.preventDefault()
          firstButton?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isResolving, onCancel])

  return (
    <div
      className="resolve-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isResolving) {
          onCancel()
        }
      }}
    >
      <section
        aria-describedby="resolve-dialog-description"
        aria-labelledby="resolve-dialog-title"
        aria-modal="true"
        className="resolve-dialog"
        ref={dialogRef}
        role="alertdialog"
        tabIndex={-1}
      >
        <span aria-hidden="true" className="resolve-dialog-icon">
          <AlertTriangle size={20} />
        </span>
        <h2 id="resolve-dialog-title">Resolve this alert?</h2>
        <p id="resolve-dialog-description">
          Mark <strong>{alert.title}</strong> as resolved? You can still view it
          in the resolved alerts list.
        </p>
        {error && <p className="resolve-dialog-error" role="alert">{error}</p>}
        <div className="resolve-dialog-actions">
          <button
            disabled={isResolving}
            onClick={onCancel}
            ref={cancelButtonRef}
            type="button"
          >
            Keep open
          </button>
          <button
            className="resolve-confirm-button"
            disabled={isResolving}
            onClick={onConfirm}
            ref={confirmButtonRef}
            type="button"
          >
            {isResolving ? 'Resolving…' : 'Resolve alert'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmResolveDialog
