import React from 'react';
import './Modal.css';

const Modal = ({ children, userType }) => {
  function handleOutsideClick() {
    console.log('outside clicked');
    // document.querySelector('.edit-modal-overlay').classList.remove('.edit-modal-overlay');
  }
  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <div className={`modal-content ${userType}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
