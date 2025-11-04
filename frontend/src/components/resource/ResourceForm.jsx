import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import {
  createResource,
  updateResource,
} from "../../store/slices/resourceSlice";
import { resourceSchema } from "../../config/validators";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_TYPES,
  RESOURCE_DIFFICULTY,
} from "../../config/constants";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { FiAlertCircle } from "react-icons/fi";
import styles from "./styles/ResourceForm.module.css";

const ResourceForm = ({ resource = null, onSuccess, onClose }) => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.resources);
  const isLoading = status === "loading";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: resource?.title || "",
      description: resource?.description || "",
      content: resource?.content || "",
      category: resource?.category || "",
      type: resource?.type || "article",
      difficulty: resource?.difficulty || "Beginner",
      tags: resource?.tags?.join(", ") || "",
      estimatedReadTime: resource?.estimatedReadTime || 5,
      videoUrl: resource?.videoUrl || "",
      downloadUrl: resource?.downloadUrl || "",
    },
  });

  const onSubmit = (data) => {
    // Convert tags string to array
    const resourceData = {
      ...data,
      tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
    };

    if (resource) {
      dispatch(updateResource({ id: resource._id, resourceData })).then(
        (result) => {
          if (!result.error) onSuccess?.();
        }
      );
    } else {
      dispatch(createResource(resourceData)).then((result) => {
        if (!result.error) onSuccess?.();
      });
    }
  };

  return (
    <Card padding="lg" shadow="md" className={styles.card}>
      <h2 className={styles.title}>
        {resource ? "Edit Resource" : "Create Resource"}
      </h2>
      <p className={styles.subtitle}>
        {resource
          ? "Edit your resource. Note: Updating a published resource will revert it to pending for admin re-approval."
          : "Share your knowledge! All new resources are submitted for admin review before being published."}
      </p>

      {error && (
        <div className={styles.errorAlert}>
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <FormField
          label="Title"
          name="title"
          register={register}
          error={errors.title}
          placeholder="e.g., How to Start a Community Garden"
        />

        <FormField
          label="Description (Short Summary)"
          name="description"
          register={register}
          error={errors.description}
          placeholder="A brief summary of what this resource is about..."
          isTextarea
          rows={3}
        />

        <FormField
          label="Content (Markdown supported)"
          name="content"
          register={register}
          error={errors.content}
          placeholder="Write the full content of your article here..."
          isTextarea
          rows={10}
        />

        <div className={styles.gridTwoColumns}>
          <FormField
            label="Category"
            name="category"
            register={register}
            error={errors.category}
            isSelect
            options={RESOURCE_CATEGORIES}
          />

          <FormField
            label="Type"
            name="type"
            register={register}
            error={errors.type}
            isSelect
            options={RESOURCE_TYPES}
          />
        </div>

        <div className={styles.gridTwoColumns}>
          <FormField
            label="Difficulty"
            name="difficulty"
            register={register}
            error={errors.difficulty}
            isSelect
            options={RESOURCE_DIFFICULTY}
          />

          <FormField
            label="Estimated Read Time (minutes)"
            name="estimatedReadTime"
            type="number"
            register={register}
            error={errors.estimatedReadTime}
            placeholder="e.g., 5"
          />
        </div>

        <FormField
          label="Tags (comma-separated)"
          name="tags"
          register={register}
          error={errors.tags}
          placeholder="e.g., planning, sustainability, tips"
        />

        <h3 className={styles.sectionTitle}>Optional Links</h3>

        <FormField
          label="Video URL (if type is 'video')"
          name="videoUrl"
          register={register}
          error={errors.videoUrl}
          placeholder="https://youtube.com/watch?v=..."
        />

        <FormField
          label="Download URL (for PDFs, templates)"
          name="downloadUrl"
          register={register}
          error={errors.downloadUrl}
          placeholder="https://.../your-file.pdf"
        />

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading
              ? "Submitting..."
              : resource
              ? "Update Resource"
              : "Submit for Review"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

// Helper component for form fields
const FormField = ({
  label,
  name,
  register,
  error,
  isTextarea,
  isSelect,
  options,
  ...props
}) => (
  <div className={styles.formGroup}>
    <label htmlFor={name} className={styles.label}>
      {label}
    </label>
    {isTextarea ? (
      <textarea
        id={name}
        {...register(name)}
        className={`${styles.textarea} ${error ? styles.inputError : ""}`}
        {...props}
      />
    ) : isSelect ? (
      <select
        id={name}
        {...register(name)}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        {...props}
      >
        <option value="">Select {label}...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        id={name}
        {...register(
          name,
          props.type === "number" ? { valueAsNumber: true } : {}
        )}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        {...props}
      />
    )}
    {error && <span className={styles.errorMessage}>{error.message}</span>}
  </div>
);

export default ResourceForm;
