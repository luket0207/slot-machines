/**
 * Usage
 *
 * import { useModal } from "../../engine/ui/modal/modalContext";
 * import { MODAL_BUTTONS } from "../../engine/ui/modal/modalContext";
 *
 * const Example = () => {
 *   const { openModal } = useModal();
 *
 *   return (
 *     <button
 *       onClick={() =>
 *         openModal({
 *           modalTitle: "Confirm",
 *           modalContent: <div>Are you sure?</div>,
 *           buttons: MODAL_BUTTONS.YES_NO,
 *           onYes: () => console.log("yes"),
 *           onNo: () => console.log("no"),
 *         })
 *       }
 *     >
 *       Open Modal
 *     </button>
 *   );
 * };
 */

import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import Button, { BUTTON_VARIANT } from "../button/button";
import { MODAL_BUTTONS } from "./modalContext";
import "./modal.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";


const Modal = ({
  isOpen,
  title,
  content,
  buttons = MODAL_BUTTONS.OK,
  flashModal = false,
  duration = 2,
  customButtonText = "Submit",
  onClick,
  onYes,
  onNo,
  onClose,
}) => {
  const safeDurationSeconds = Math.max(0.1, Number(duration) || 2);

  const footerConfig = useMemo(() => {
    const baseClose = typeof onClose === "function" ? onClose : () => {};

    const okHandler = typeof onClick === "function" ? onClick : baseClose;
    const yesHandler = typeof onYes === "function" ? onYes : baseClose;
    const noHandler = typeof onNo === "function" ? onNo : baseClose;
    const safeClose = buttons === MODAL_BUTTONS.YES_NO ? noHandler : baseClose;

    return { okHandler, yesHandler, noHandler, safeClose };
  }, [buttons, onClick, onYes, onNo, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (!flashModal && e.key === "Escape") footerConfig.safeClose();
    };

    document.addEventListener("keydown", onKeyDown);

    // Prevent background scroll while modal is open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, footerConfig, flashModal]);

  useEffect(() => {
    if (!isOpen || !flashModal) return undefined;

    const durationMs = safeDurationSeconds * 1000;
    const closeFlash = typeof onClose === "function" ? onClose : () => {};
    const timeout = setTimeout(() => {
      closeFlash();
    }, durationMs);

    return () => clearTimeout(timeout);
  }, [flashModal, isOpen, onClose, safeDurationSeconds]);

  if (!isOpen) return null;

  const modalNode = (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        // Close when clicking the backdrop only (not the modal itself)
        if (!flashModal && e.target === e.currentTarget) footerConfig.safeClose();
      }}
    >
      <div
        className={`modal ${flashModal ? "modal--flash" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={flashModal ? "Flash Modal" : title || "Modal"}
      >
        {!flashModal && (
          <div className="modal__header">
            <div className="modal__title">{title || "Modal"}</div>

            <button type="button" className="modal__close" onClick={footerConfig.safeClose} aria-label="Close modal">
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        )}

        {flashModal ? (
          <div className="modal__body modal__body--flash" style={{ "--flash-duration": `${safeDurationSeconds}s` }}>
            <div className="modalFlashContent">{content || <h2>Modal</h2>}</div>
            <div className="modalFlashTimer" aria-hidden="true">
              <span className="modalFlashTimer__fill" />
            </div>
          </div>
        ) : (
          <div className="modal__body">{content || <h2>Modal</h2>}</div>
        )}

        {!flashModal && buttons !== MODAL_BUTTONS.NONE && (
          <div className="modal__footer">
            {buttons === MODAL_BUTTONS.YES_NO && (
              <>
                <Button variant={BUTTON_VARIANT.SECONDARY} onClick={footerConfig.noHandler}>
                  No
                </Button>
                <Button variant={BUTTON_VARIANT.PRIMARY} onClick={footerConfig.yesHandler}>
                  Yes
                </Button>
              </>
            )}

            {buttons === MODAL_BUTTONS.OK && (
              <Button variant={BUTTON_VARIANT.PRIMARY} onClick={footerConfig.okHandler}>
                OK
              </Button>
            )}

            {buttons === MODAL_BUTTONS.CUSTOM_TEXT && (
              <Button variant={BUTTON_VARIANT.PRIMARY} onClick={footerConfig.okHandler}>
                {customButtonText || "Submit"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalNode, document.body);
};

export default Modal;
