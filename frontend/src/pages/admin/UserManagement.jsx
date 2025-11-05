/* frontend/src/pages/admin/UserManagement.jsx */
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  updateUserRole,
  deactivateUser,
  reactivateUser,
} from "../../store/slices/adminSlice";
import { usePagination } from "../../hooks/usePagination";
import { debounce } from "../../config/helpers";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Loader } from "../../components/common/Loader";
import { Modal } from "../../components/common/Modal";
import { Pagination } from "../../components/common/Pagination";
import { Badge } from "../../components/common/Badge";
import { FiSearch, FiUser, FiAlertCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { formatPoints } from "../../config/formatters";

// Basic inline styles for the table
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
  userName: { fontWeight: "600", color: "#00796B", textDecoration: "none" },
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

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, pagination, isLoading } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState({ role: "", status: "", search: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'role', 'deactivate', 'reactivate'
  const [newRole, setNewRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { page, totalPages, goToPage, startIndex, endIndex } = usePagination(
    pagination?.total || 0,
    1,
    20
  );

  const debouncedFetch = useCallback(
    debounce((dispatch, params) => {
      dispatch(getAllUsers(params));
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

  const openModal = (action, user) => {
    setSelectedUser(user);
    setModalAction(action);
    if (action === "role") setNewRole(user.role);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalAction(null);
  };

  const handleConfirmAction = () => {
    if (!selectedUser) return;

    if (modalAction === "role") {
      dispatch(updateUserRole({ userId: selectedUser._id, role: newRole }));
    } else if (modalAction === "deactivate") {
      dispatch(
        deactivateUser({ userId: selectedUser._id, reason: "Admin action" })
      );
    } else if (modalAction === "reactivate") {
      dispatch(reactivateUser(selectedUser._id));
    }
    closeModal();
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>User Management</h1>
      </div>

      <Card padding="lg" shadow="md">
        <div style={styles.controls}>
          <div style={styles.searchInput}>
            <FiSearch color="#666" />
            <input
              type="text"
              placeholder="Search by name or email..."
              style={styles.input}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div style={styles.filters}>
            <select
              style={styles.select}
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
            <select
              style={styles.select}
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isLoading && users.data.length === 0 ? (
          <Loader text="Loading users..." />
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Points</th>
                  <th style={styles.th}>Level</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.data.map((user) => (
                  <tr key={user._id}>
                    <td style={styles.td}>
                      <Link to={`/profile/${user._id}`} style={styles.userName}>
                        {user.name}
                      </Link>
                    </td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>
                      <Badge
                        label={user.role}
                        variant={
                          user.role === "admin"
                            ? "error"
                            : user.role === "moderator"
                            ? "warning"
                            : "default"
                        }
                        size="sm"
                      />
                    </td>
                    <td style={styles.td}>
                      <Badge
                        label={user.isActive ? "Active" : "Inactive"}
                        variant={user.isActive ? "success" : "default"}
                        size="sm"
                      />
                    </td>
                    <td style={styles.td}>{formatPoints(user.points)}</td>
                    <td style={styles.td}>{user.level}</td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModal("role", user)}
                        >
                          Role
                        </Button>
                        {user.isActive ? (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => openModal("deactivate", user)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => openModal("reactivate", user)}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && users.data.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            No users found matching filters.
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
          {modalAction === "role" && (
            <>
              <p style={styles.modalText}>
                Change role for <strong>{selectedUser?.name}</strong>:
              </p>
              <select
                style={{ ...styles.select, width: "100%" }}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}
          {modalAction === "deactivate" && (
            <p style={styles.modalText}>
              Are you sure you want to deactivate{" "}
              <strong>{selectedUser?.name}</strong>? They will lose access to
              the platform.
            </p>
          )}
          {modalAction === "reactivate" && (
            <p style={styles.modalText}>
              Are you sure you want to reactivate{" "}
              <strong>{selectedUser?.name}</strong>?
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

export default UserManagement;
