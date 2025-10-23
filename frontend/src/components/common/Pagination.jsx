import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Button from "./Button";

export const Pagination = ({
  page = 1,
  totalPages = 1,
  onPageChange,
  maxButtons = 5,
  showInfo = true,
  startIndex = 0,
  endIndex = 0,
  total = 0,
}) => {
  if (totalPages <= 1) return null;

  const getPageButtons = () => {
    const pages = [];
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    // First page
    if (start > 1) {
      pages.push(
        <button key="1" style={styles.pageBtn} onClick={() => onPageChange(1)}>
          1
        </button>
      );
      if (start > 2) {
        pages.push(
          <span key="dots1" style={styles.dots}>
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          style={{
            ...styles.pageBtn,
            ...(i === page ? styles.pageActive : {}),
          }}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(
          <span key="dots2" style={styles.dots}>
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          style={styles.pageBtn}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div style={styles.paginationContainer}>
      {showInfo && (
        <p style={styles.info}>
          Showing {startIndex}-{endIndex} of {total} results
        </p>
      )}

      <div style={styles.controls}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          icon={FiChevronLeft}
        >
          Previous
        </Button>

        <div style={styles.pageNumbers}>{getPageButtons()}</div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          icon={FiChevronRight}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

const styles = {
  paginationContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px",
    backgroundColor: "#FAFAFA",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    marginTop: "20px",
    flexWrap: "wrap",
    gap: "20px",
  },
  info: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
    fontWeight: "500",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  pageNumbers: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  pageBtn: {
    minWidth: "36px",
    height: "36px",
    padding: "0 8px",
    border: "1px solid #ddd",
    backgroundColor: "#FAFAFA",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    color: "#212121",
    transition: "all 0.2s ease",
  },
  pageActive: {
    backgroundColor: "#00796B",
    color: "#FAFAFA",
    border: "1px solid #00796B",
  },
  dots: {
    padding: "0 4px",
    color: "#999",
  },
};

export default Pagination;
