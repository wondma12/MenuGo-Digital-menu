import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Button from './Button'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  actions,
  closeOnOverlayClick = true,
}) => {
  // Use responsive max-width helpers so modals fit well on small screens
  const sizes = {
    sm: 'max-w-full sm:max-w-md',
    md: 'max-w-full sm:max-w-lg md:max-w-2xl',
    lg: 'max-w-full md:max-w-2xl lg:max-w-4xl',
    xl: 'max-w-full lg:max-w-4xl xl:max-w-6xl',
    full: 'max-w-[95vw]',
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className={`
              inline-block w-full ${sizes[size]} my-8 overflow-hidden text-left
              align-middle transition-all transform bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] rounded-none
            `}>
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                {title && (
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-slate-900">
                    {title}
                  </Dialog.Title>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-orange-600 focus:outline-none"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                )}
              </div>

              <div className="px-6 py-6">{children}</div>

              {actions && (
                <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                  {actions}
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default Modal