import React from 'react'
import Modal from '../../../common/Modal'
import MenuItemForm from './MenuItemForm'

const MenuItemModal = ({ isOpen, onClose, item, onSuccess }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Menu Item' : 'Add New Menu Item'}
      size="lg"
      showCloseButton={false}
    >
      <MenuItemForm
        item={item}
        onSuccess={() => {
          onSuccess()
          onClose()
        }}
        onCancel={onClose}
      />
    </Modal>
  )
}

export default MenuItemModal