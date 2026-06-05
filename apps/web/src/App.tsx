import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiRequest, loadAuthUsers } from "./api/client";
import { AppHeader } from "./components/layout/AppHeader";
import { AppLoadingScreen } from "./components/layout/AppLoadingScreen";
import { SectionTabs } from "./components/navigation/SectionTabs";
import { Toast } from "./components/ui/Toast";
import { minimumAppLoadingMs, minimumSubmitFeedbackMs, roles } from "./constants";
import { AnalyticsView } from "./features/analytics/AnalyticsView";
import { BookingsView } from "./features/bookings/BookingsView";
import { UsersView } from "./features/users/UsersView";
import type {
  Booking,
  BookingFormState,
  NewUserFormState,
  Role,
  Summary,
  Tab,
  User
} from "./types/domain";
import { wait } from "./utils/async";
import { toUtcIso } from "./utils/date";
import { describeApiError } from "./utils/errors";
import { tabFromHash } from "./utils/routing";

const emptyBookingForm: BookingFormState = {
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: ""
};

const emptyUserForm: NewUserFormState = {
  name: "",
  role: "user"
};

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormState>(emptyBookingForm);
  const [newUserForm, setNewUserForm] = useState<NewUserFormState>(emptyUserForm);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loginUsersReady, setLoginUsersReady] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [userSubmitting, setUserSubmitting] = useState(false);
  const appLoadStartedAt = useRef(Date.now());

  const currentUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  );

  const visibleTabs = useMemo<Tab[]>(() => {
    if (!currentUser) {
      return ["bookings"];
    }
    if (currentUser.role === "admin") {
      return ["bookings", "analytics", "users"];
    }
    if (currentUser.role === "owner") {
      return ["bookings", "analytics"];
    }
    return ["bookings"];
  }, [currentUser]);

  const summaryRows = summary?.bookingsByUser ?? users.map((user) => ({ user, bookingCount: 0 }));
  const maxBookingCount = Math.max(1, ...summaryRows.map((item) => item.bookingCount));

  function changeTab(tab: Tab) {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  }

  async function loadLoginUsers(nextSelectedId = selectedUserId) {
    const data = await loadAuthUsers();
    setUsers(data.users);

    const stillExists = data.users.some((user) => user.id === nextSelectedId);
    if (!nextSelectedId || !stillExists) {
      setSelectedUserId(data.users[0]?.id ?? null);
    }
  }

  async function loadProtectedData() {
    if (!currentUser) {
      setBookings([]);
      setAdminUsers([]);
      setSummary(null);
      return;
    }

    const bookingData = await apiRequest<{ bookings: Booking[] }>(
      "/api/bookings",
      currentUser
    );
    setBookings(bookingData.bookings);

    if (currentUser.role === "admin") {
      const userData = await apiRequest<{ users: User[] }>("/api/users", currentUser);
      setAdminUsers(userData.users);
    } else {
      setAdminUsers([]);
    }

    if (currentUser.role === "admin" || currentUser.role === "owner") {
      const summaryData = await apiRequest<{ summary: Summary }>("/api/summary", currentUser);
      setSummary(summaryData.summary);
    } else {
      setSummary(null);
    }
  }

  async function refreshAll(message?: string) {
    setError("");
    await loadLoginUsers(selectedUserId);
    await loadProtectedData();
    if (message) {
      setStatus(message);
    }
  }

  async function handleCreateBooking(event: FormEvent) {
    event.preventDefault();
    if (bookingSubmitting) {
      return;
    }

    const startedAt = Date.now();
    let didCreateBooking = false;
    setBookingSubmitting(true);
    setStatus("");
    setError("");

    try {
      await apiRequest(
        "/api/bookings",
        currentUser,
        {
          method: "POST",
          body: JSON.stringify({
            startTime: toUtcIso(bookingForm.startDate, bookingForm.startTime),
            endTime: toUtcIso(bookingForm.endDate, bookingForm.endTime)
          })
        }
      );
      setBookingForm(emptyBookingForm);
      await refreshAll("Booking created.");
      didCreateBooking = true;
    } catch (caught) {
      setError(describeApiError(caught));
    } finally {
      const remainingTime = minimumSubmitFeedbackMs - (Date.now() - startedAt);
      if (remainingTime > 0) {
        await wait(remainingTime);
      }
      setBookingSubmitting(false);
      if (didCreateBooking) {
        setBookingDialogOpen(false);
      }
    }
  }

  async function handleDeleteBooking(id: number) {
    setStatus("");
    setError("");

    try {
      await apiRequest(`/api/bookings/${id}`, currentUser, { method: "DELETE" });
      await refreshAll("Booking deleted.");
    } catch (caught) {
      setError(describeApiError(caught));
    }
  }

  async function handleCreateUser(event: FormEvent) {
    event.preventDefault();
    if (userSubmitting) {
      return;
    }

    const startedAt = Date.now();
    let didCreateUser = false;
    setUserSubmitting(true);
    setStatus("");
    setError("");

    try {
      await apiRequest("/api/users", currentUser, {
        method: "POST",
        body: JSON.stringify(newUserForm)
      });
      setNewUserForm(emptyUserForm);
      await refreshAll("User created.");
      didCreateUser = true;
    } catch (caught) {
      setError(describeApiError(caught));
    } finally {
      const remainingTime = minimumSubmitFeedbackMs - (Date.now() - startedAt);
      if (remainingTime > 0) {
        await wait(remainingTime);
      }
      setUserSubmitting(false);
      if (didCreateUser) {
        setAddUserDialogOpen(false);
      }
    }
  }

  async function handleRoleChange(userId: number, role: Role) {
    setStatus("");
    setError("");

    try {
      await apiRequest(`/api/users/${userId}`, currentUser, {
        method: "PATCH",
        body: JSON.stringify({ role })
      });
      await refreshAll("Role updated.");
    } catch (caught) {
      setError(describeApiError(caught));
    }
  }

  async function handleDeleteUser(userId: number) {
    setStatus("");
    setError("");

    try {
      await apiRequest(`/api/users/${userId}`, currentUser, { method: "DELETE" });
      await refreshAll("User and associated bookings deleted.");
    } catch (caught) {
      setError(describeApiError(caught));
    }
  }

  useEffect(() => {
    let cancelled = false;

    loadLoginUsers()
      .catch((caught) => {
        if (!cancelled) {
          setError(describeApiError(caught));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoginUsersReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function finishInitialLoading() {
      const remainingTime = minimumAppLoadingMs - (Date.now() - appLoadStartedAt.current);
      if (remainingTime > 0) {
        await wait(remainingTime);
      }
      if (!cancelled) {
        setLoading(false);
      }
    }

    if (!loginUsersReady) {
      return () => {
        cancelled = true;
      };
    }

    if (!currentUser) {
      finishInitialLoading();
      return () => {
        cancelled = true;
      };
    }

    async function loadCurrentUserData() {
      setStatus("");
      setError("");
      try {
        await loadProtectedData();
      } catch (caught) {
        if (!cancelled) {
          setError(describeApiError(caught));
        }
      } finally {
        if (loading) {
          await finishInitialLoading();
        }
      }
    }

    loadCurrentUserData();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, loginUsersReady]);

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab("bookings");
    }
  }, [activeTab, visibleTabs]);

  useEffect(() => {
    const hashTab = tabFromHash();
    if (hashTab && visibleTabs.includes(hashTab)) {
      setActiveTab(hashTab);
    }
  }, [visibleTabs]);

  useEffect(() => {
    if (!status && !error) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStatus("");
      setError("");
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [status, error]);

  if (loading) {
    return <AppLoadingScreen />;
  }

  return (
    <main className="app-shell">
      <AppHeader
        users={users}
        currentUser={currentUser}
        selectedUserId={selectedUserId}
        loading={loading}
        userMenuOpen={userMenuOpen}
        onToggleUserMenu={() => setUserMenuOpen((open) => !open)}
        onCloseUserMenu={() => setUserMenuOpen(false)}
        onSelectUser={(userId) => {
          setSelectedUserId(userId);
          setUserMenuOpen(false);
        }}
      />

      <section className="page-frame main-content">
        <SectionTabs activeTab={activeTab} visibleTabs={visibleTabs} onChange={changeTab} />

        <Toast
          error={error}
          status={status}
          onDismiss={() => {
            setError("");
            setStatus("");
          }}
        />

        {activeTab === "bookings" && currentUser && (
          <BookingsView
            currentUser={currentUser}
            bookings={bookings}
            bookingForm={bookingForm}
            bookingDialogOpen={bookingDialogOpen}
            bookingSubmitting={bookingSubmitting}
            onOpenBookingDialog={() => setBookingDialogOpen(true)}
            onCloseBookingDialog={() => setBookingDialogOpen(false)}
            onCreateBooking={handleCreateBooking}
            onBookingFormChange={setBookingForm}
            onDeleteBooking={handleDeleteBooking}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsView
            totalBookings={summary?.totalBookings ?? 0}
            summaryRows={summaryRows}
            maxBookingCount={maxBookingCount}
          />
        )}

        {activeTab === "users" && currentUser?.role === "admin" && (
          <UsersView
            users={adminUsers}
            roles={roles}
            newUserForm={newUserForm}
            addUserDialogOpen={addUserDialogOpen}
            userSubmitting={userSubmitting}
            onOpenAddUserDialog={() => setAddUserDialogOpen(true)}
            onCloseAddUserDialog={() => setAddUserDialogOpen(false)}
            onCreateUser={handleCreateUser}
            onNewUserFormChange={setNewUserForm}
            onRoleChange={handleRoleChange}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </section>
    </main>
  );
}
