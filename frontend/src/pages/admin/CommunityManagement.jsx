import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCommunities,
  deactivateCommunity,
  reactivateCommunity,
} from "../../store/slices/adminSlice";
import { usePagination } from "../../hooks/usePagination";
import { debounce } from "../../config/helpers";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Loader } from "../../components/common/Loader";
import { Modal } from "../../components/common/Modal";
import { Pagination } from "../../components/common/Pagination";
import { Badge } from "../../components/common/Badge";
import { FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import { calculateTier } from "../../config/helpers";

const styles = {
  header: { marginBottom: "24px" },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    color: "#212121",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  searchInput: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "8px 12px",
    flex: 1,
    minWidth: "250px",
  },
  input: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    flex: 1,
    background: "transparent",
  },
  filters: { display: "flex", gap: "12px" },
  select: {
    padding: "8px 12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "900px" },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#666",
    fontSize: "12px",
    textTransform: "uppercase",
    borderBottom: "2px solid #e0e0e0",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "13px",
  },
  commName: { fontWeight: "600", color: "#00796B", textDecoration: "none" },
  actions: { display: "flex", gap: "8px" },
  modalContent: { display: "flex", flexDirection: "column", gap: "16px" },
  modalText: { fontSize: "14px", color: "#666" },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "16px",
  },
};

const CommunityManagement = () => {
  const dispatch = useDispatch();
  const { communities, pagination, isLoading } = useSelector(
    (state) => state.admin
  );

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    category: "",
  });
  const [selectedComm, setSelectedComm] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'deactivate', 'reactivate'
  const [searchTerm, setSearchTerm] = useState("");

  const { page, totalPages, goToPage, startIndex, endIndex } = usePagination(
    pagination?.total || 0,
    1,
    20
  );

  const debouncedFetch = useCallback(
    debounce((dispatch, params) => {
      dispatch(getAllCommunities(params));
    }, 300),
    []
  );

  useEffect(() => {
    const params = { page, ...filters };
    debouncedFetch(dispatch, params);
  }, [dispatch, page, filters, debouncedFetch]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    goToPage(1);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    handleFilterChange("search", query);
  };

  const openModal = (action, community) => {
    setSelectedComm(community);
    setModalAction(action);
  };

  const closeModal = () => {
    setSelectedComm(null);
    setModalAction(null);
  };

  const handleConfirmAction = () => {
    if (!selectedComm) return;

    if (modalAction === "deactivate") {
      dispatch(
        deactivateCommunity({
          communityId: selectedComm._id,
          reason: "Admin action",
        })
      );
    } else if (modalAction === "reactivate") {
      dispatch(reactivateCommunity(selectedComm._id));
    }
    closeModal();
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Community Management</h1>
      </div>

      <Card padding="lg" shadow="md">
        <div style={styles.controls}>
          <div style={styles.searchInput}>
            <FiSearch color="#666" />
            <input
              type="text"
              placeholder="Search by name..."
              style={styles.input}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div style={styles.filters}>
            <select
              style={styles.select}
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              style={styles.select}
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Environment">Environment</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Social">Social</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {isLoading && communities.data.length === 0 ? (
          <Loader text="Loading communities..." />
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Creator</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Verification</th>
                  <th style={styles.th}>Members</th>
                  <th style={styles.th}>Events</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {communities.data.map((comm) => {
                  const tier = calculateTier(comm.communityPoints || 0);
                  return (
                    <tr key={comm._id}>
                      <td style={styles.td}>
                        <Link
                          to={`/communities/${comm._id}`}
                          style={styles.commName}
                        >
                          {comm.name}
                        </Link>
                      </td>
                      <td style={styles.td}>{comm.createdBy?.name || "N/A"}</td>
                      <td style={styles.td}>
                        <Badge
                          label={comm.isActive ? "Active" : "Inactive"}
                          variant={comm.isActive ? "success" : "default"}
                          size="sm"
                        />
                      </td>
                      <td style={styles.td}>
                        <Badge
                          label={comm.verificationStatus}
                          variant={
                            comm.verificationStatus === "verified"
                              ? "success"
                              : comm.verificationStatus === "pending"
                              ? "warning"
                              : "default"
                          }
                          size="sm"
                        />
                      </td>
                      <td style={styles.td}>{comm.totalMembers}</td>
                      <td style={styles.td}>{comm.totalEvents}</td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          {comm.isActive ? (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => openModal("deactivate", comm)}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => openModal("reactivate", comm)}
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && communities.data.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            No communities found matching filters.
          </div>
        )}

        {pagination && totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            startIndex={startIndex}
            endIndex={endIndex}
            total={pagination.total}
          />
        )}
      </Card>

      {/* Confirmation Modals */}
      <Modal isOpen={!!modalAction} onClose={closeModal} title="Confirm Action">
        <div style={styles.modalContent}>
          {modalAction === "deactivate" && (
            <p style={styles.modalText}>
              Are you sure you want to deactivate{" "}
              <strong>{selectedComm?.name}</strong>? This will hide it from
              public lists and prevent new event creation.
            </p>
          )}
          {modalAction === "reactivate" && (
            <p style={styles.modalText}>
              Are you sure you want to reactivate{" "}
              <strong>{selectedComm?.name}</strong>?
            </p>
          )}
          <div style={styles.modalActions}>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant={modalAction === "deactivate" ? "danger" : "primary"}
              onClick={handleConfirmAction}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CommunityManagement;
