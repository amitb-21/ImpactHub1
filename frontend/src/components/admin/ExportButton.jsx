import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { exportParticipantsCSV } from "../../store/slices/adminSlice";
import { Button } from "../common/Button";
import { FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";

const ExportButton = ({ eventId, disabled = false, ...props }) => {
  const dispatch = useDispatch();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!eventId) {
      toast.error("No Event ID provided for export.");
      return;
    }
    setIsExporting(true);
    try {
      // The thunk handles the download and success toast
      await dispatch(exportParticipantsCSV(eventId)).unwrap();
    } catch (error) {
      // The thunk/slice handles the error toast
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      icon={FiDownload}
      onClick={handleExport}
      loading={isExporting}
      disabled={disabled || isExporting}
      {...props}
    >
      {isExporting ? "Exporting..." : "Export as CSV"}
    </Button>
  );
};

export default ExportButton;
