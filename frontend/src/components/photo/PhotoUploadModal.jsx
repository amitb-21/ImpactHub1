import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadEventPhoto } from "../../store/slices/photoSlice";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { FiUpload, FiAlertCircle } from "react-icons/fi";
import styles from "./styles/PhotoUploadModal.module.css";

const PhotoUploadModal = ({ eventId, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { isUploading, error } = useSelector((state) => state.photo);

  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [photoType, setPhotoType] = useState("during_event");
  const [description, setDescription] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("File is too large! Max 5MB.");
        return;
      }
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoFile) {
      alert("Please select a photo to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", photoFile);
    formData.append("photoType", photoType);
    formData.append("description", description);

    const result = await dispatch(uploadEventPhoto({ eventId, formData }));

    if (result.payload) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Upload Event Photo" size="md">
      <form onSubmit={handleSubmit} className={styles.container}>
        {error && (
          <div className={styles.errorAlert}>
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className={styles.uploadArea}>
          {preview ? (
            <img src={preview} alt="Preview" className={styles.previewImage} />
          ) : (
            <div className={styles.uploadPlaceholder}>
              <FiUpload size={32} />
              <p>Click to select a photo</p>
              <span>Max 5MB (JPG, PNG, GIF)</span>
            </div>
          )}
          <input
            type="file"
            accept="image/png, image/jpeg, image/gif, image/webp"
            onChange={handleFileChange}
            className={styles.fileInput}
            aria-label="Upload photo"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="photoType" className={styles.label}>
            Photo Type
          </label>
          <select
            id="photoType"
            value={photoType}
            onChange={(e) => setPhotoType(e.target.value)}
            className={styles.select}
          >
            <option value="during_event">During Event</option>
            <option value="after_event">After Event</option>
            <option value="event_preview">Event Preview</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description (Optional)
          </label>
          <textarea
            id="description"
            placeholder="Add a caption for the photo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isUploading}
            disabled={!photoFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Photo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PhotoUploadModal;
