/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import childrenApi from "../api/childrenApi";
import paymentsApi from "../api/paymentsApi";
import FinanceFilters from "../components/finance/FinanceFilters";
import FinanceStatusCard from "../components/finance/FinanceStatusCard";
import PaymentForm from "../components/finance/PaymentForm";
import PaymentsTable from "../components/finance/PaymentsTable";
import { useAuth } from "../hooks/useAuth";

const initialForm = {
  amount: "",
  paymentDate: getTodayDateInputValue(),
  description: "",
};

function FinancePage() {
  const { user } = useAuth();

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildOption, setSelectedChildOption] = useState(null);

  const [payments, setPayments] = useState([]);
  const [financeStatus, setFinanceStatus] = useState(null);

  const [expectedAmount, setExpectedAmount] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const [form, setForm] = useState(initialForm);
  const [editingPaymentId, setEditingPaymentId] = useState(null);

  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [isLoadingFinance, setIsLoadingFinance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canManage =
    user?.role === "Administrator" || user?.role === "AdministrativeStaff";

  const selectedChildId = selectedChildOption?.value;

  useEffect(() => {
    let isCancelled = false;

    setIsLoadingChildren(true);

    childrenApi
      .getAll({
        search: "",
        groupId: "",
        isActive: "true",
      })
      .then((data) => {
        if (!isCancelled) {
          setChildrenList(data);
          setError("");

          setSelectedChildOption((previousSelectedChild) => {
            if (
              previousSelectedChild &&
              data.some((child) => child.id === previousSelectedChild.value)
            ) {
              const updatedChild = data.find(
                (child) => child.id === previousSelectedChild.value
              );

              return {
                value: updatedChild.id,
                label: getChildLabel(updatedChild),
              };
            }

            if (data.length === 0) {
              return null;
            }

            const firstChild = data[0];

            return {
              value: firstChild.id,
              label: getChildLabel(firstChild),
            };
          });
        }
      })
      .catch((requestError) => {
        if (!isCancelled) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingChildren(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedChildId) {
      setPayments([]);
      setFinanceStatus(null);
      return;
    }

    let isCancelled = false;

    setIsLoadingFinance(true);

    Promise.all([
      paymentsApi.getByChild(selectedChildId),
      paymentsApi.getChildStatus(
        selectedChildId,
        expectedAmount ? Number(expectedAmount) : ""
      ),
    ])
      .then(([paymentsData, statusData]) => {
        if (!isCancelled) {
          setPayments(paymentsData);
          setFinanceStatus(statusData);
          setError("");
        }
      })
      .catch((requestError) => {
        if (!isCancelled) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingFinance(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedChildId, expectedAmount]);

  const childOptions = childrenList.map((child) => ({
    value: child.id,
    label: getChildLabel(child),
  }));

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchFilter.trim().toLowerCase();

    if (!normalizedSearch) {
      return payments;
    }

    return payments.filter((payment) => {
      return (
        payment.childFullName.toLowerCase().includes(normalizedSearch) ||
        payment.recordedByFullName.toLowerCase().includes(normalizedSearch) ||
        (payment.description || "").toLowerCase().includes(normalizedSearch)
      );
    });
  }, [payments, searchFilter]);

  const loadFinance = async () => {
    if (!selectedChildId) {
      return;
    }

    setIsLoadingFinance(true);
    setError("");

    try {
      const [paymentsData, statusData] = await Promise.all([
        paymentsApi.getByChild(selectedChildId),
        paymentsApi.getChildStatus(
          selectedChildId,
          expectedAmount ? Number(expectedAmount) : ""
        ),
      ]);

      setPayments(paymentsData);
      setFinanceStatus(statusData);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoadingFinance(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedChildId) {
      return;
    }

    const paymentData = {
      amount: Number(form.amount),
      paymentDate: toUtcIsoDate(form.paymentDate),
      description: form.description || null,
    };

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      if (editingPaymentId) {
        await paymentsApi.update(editingPaymentId, paymentData);

        setSuccessMessage("Uplata je uspešno ažurirana.");
      } else {
        await paymentsApi.create({
          ...paymentData,
          childId: selectedChildId,
        });

        setSuccessMessage("Uplata je uspešno evidentirana.");
      }

      resetForm();
      await loadFinance();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (payment) => {
    setEditingPaymentId(payment.id);

    setForm({
      amount: String(payment.amount),
      paymentDate: toDateInputValue(payment.paymentDate),
      description: payment.description || "",
    });

    setError("");
    setSuccessMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    resetForm();
  };

  const deletePayment = async (payment) => {
    const confirmed = window.confirm(
      `Da li sigurno želiš da obrišeš uplatu za ${payment.childFullName}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      await paymentsApi.delete(payment.id);

      setSuccessMessage("Uplata je obrisana.");
      await loadFinance();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const clearFilters = () => {
    setSearchFilter("");
    setExpectedAmount("");
  };

  const resetForm = () => {
    setEditingPaymentId(null);
    setForm({
      ...initialForm,
      paymentDate: getTodayDateInputValue(),
    });
  };

  const pageDescription = canManage
    ? "Pregled finansijskog statusa dece i evidentiranje uplata."
    : "Pregled uplata i finansijskog statusa za vaše dete.";

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Finansije</h1>
          <p className="text-muted mb-0">{pageDescription}</p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadFinance}
          disabled={!selectedChildId || isLoadingFinance}
        >
          Osveži
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      <FinanceFilters
        childOptions={childOptions}
        selectedChildOption={selectedChildOption}
        expectedAmount={expectedAmount}
        searchFilter={searchFilter}
        isLoadingChildren={isLoadingChildren}
        onChildChange={setSelectedChildOption}
        onExpectedAmountChange={setExpectedAmount}
        onSearchFilterChange={setSearchFilter}
        onClearFilters={clearFilters}
      />

      {!selectedChildId && !isLoadingChildren && (
        <div className="alert alert-info">
          Nema dece dostupne za prikaz finansija.
        </div>
      )}

      <FinanceStatusCard
        status={financeStatus}
        isLoading={isLoadingFinance}
      />

      {canManage && (
        <PaymentForm
          form={form}
          editingPaymentId={editingPaymentId}
          selectedChildOption={selectedChildOption}
          isSaving={isSaving}
          canManage={canManage}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancelEdit={cancelEdit}
        />
      )}

      <PaymentsTable
        payments={filteredPayments}
        isLoading={isLoadingFinance}
        canManage={canManage}
        onStartEdit={startEdit}
        onDelete={deletePayment}
      />
    </div>
  );
}

function getChildLabel(child) {
  const groupPart = child.groupName ? ` - ${child.groupName}` : " - bez grupe";

  return `${child.firstName} ${child.lastName}${groupPart}`;
}

function getTodayDateInputValue() {
  return new Date().toISOString().substring(0, 10);
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  return value.substring(0, 10);
}

function toUtcIsoDate(value) {
  if (!value) {
    return null;
  }

  return `${value}T00:00:00Z`;
}

function getErrorMessage(error) {
  if (typeof error.response?.data === "string") {
    return error.response.data;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  return "Došlo je do greške. Proveri da li backend radi i da li imaš dozvolu.";
}

export default FinancePage;