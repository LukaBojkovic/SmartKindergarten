/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaSyncAlt } from "react-icons/fa";
import childrenApi from "../api/childrenApi";
import paymentsApi from "../api/paymentsApi";
import systemSettingsApi from "../api/systemSettingsApi";
import FinanceFilters from "../components/finance/FinanceFilters";
import FinanceStatusCard from "../components/finance/FinanceStatusCard";
import MonthlyFinanceReport from "../components/finance/MonthlyFinanceReport";
import PaymentForm from "../components/finance/PaymentForm";
import PaymentsTable from "../components/finance/PaymentsTable";
import { useAuth } from "../hooks/useAuth";

const initialForm = {
  amount: "",
  paymentDate: getTodayDateInputValue(),
  description: "",
};

const MONTHLY_FEE_KEY = "MonthlyFee";

function FinancePage() {
  const { user } = useAuth();

  const today = new Date();

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildOption, setSelectedChildOption] = useState(null);

  const [payments, setPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [financeStatus, setFinanceStatus] = useState(null);

  const [monthlyFee, setMonthlyFee] = useState("");
  const [numberOfMonths, setNumberOfMonths] = useState("1");
  const [searchFilter, setSearchFilter] = useState("");

  const [reportMonth, setReportMonth] = useState(
    String(today.getMonth() + 1)
  );
  const [reportYear, setReportYear] = useState(String(today.getFullYear()));
  const [monthlyReportRefreshKey, setMonthlyReportRefreshKey] = useState(0);

  const [form, setForm] = useState(initialForm);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [isPaymentFormVisible, setIsPaymentFormVisible] = useState(false);

  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [isLoadingMonthlyFee, setIsLoadingMonthlyFee] = useState(true);
  const [isLoadingFinance, setIsLoadingFinance] = useState(false);
  const [isLoadingMonthlyReport, setIsLoadingMonthlyReport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canViewMonthlyReport =
    user?.role === "Administrator" || user?.role === "AdministrativeStaff";

  const canManagePayments = user?.role === "AdministrativeStaff";

  const selectedChildId = selectedChildOption?.value;

  const expectedAmount = useMemo(() => {
    const parsedMonthlyFee = Number(monthlyFee);
    const parsedNumberOfMonths = Number(numberOfMonths);

    if (
      Number.isNaN(parsedMonthlyFee) ||
      Number.isNaN(parsedNumberOfMonths) ||
      parsedMonthlyFee <= 0 ||
      parsedNumberOfMonths <= 0
    ) {
      return "";
    }

    return parsedMonthlyFee * parsedNumberOfMonths;
  }, [monthlyFee, numberOfMonths]);

  useEffect(() => {
    let isCancelled = false;

    setIsLoadingMonthlyFee(true);

    systemSettingsApi
      .getByKey(MONTHLY_FEE_KEY)
      .then((setting) => {
        if (isCancelled) {
          return;
        }

        const parsedValue = Number(setting.value);

        if (Number.isNaN(parsedValue) || parsedValue <= 0) {
          setMonthlyFee("");
          setError("Mesečna članarina nije ispravno podešena.");
          return;
        }

        setMonthlyFee(parsedValue);
      })
      .catch((requestError) => {
        if (!isCancelled) {
          setMonthlyFee("");

          if (requestError.response?.status === 404) {
            setError(
              "Mesečna članarina nije podešena. Administrator treba da je podesi na stranici Sistemska podešavanja."
            );
          } else {
            setError(getErrorMessage(requestError));
          }
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingMonthlyFee(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

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
    if (!canViewMonthlyReport) {
      setAllPayments([]);
      return;
    }

    let isCancelled = false;

    setIsLoadingMonthlyReport(true);

    paymentsApi
      .getAll()
      .then((paymentsData) => {
        if (!isCancelled) {
          setAllPayments(paymentsData);
        }
      })
      .catch((requestError) => {
        if (!isCancelled) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingMonthlyReport(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [canViewMonthlyReport, monthlyReportRefreshKey]);

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
      paymentsApi.getChildStatus(selectedChildId, expectedAmount),
    ])
      .then(([paymentsData, statusData]) => {
        if (!isCancelled) {
          setPayments(paymentsData);
          setFinanceStatus(statusData);
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
        paymentsApi.getChildStatus(selectedChildId, expectedAmount),
      ]);

      setPayments(paymentsData);
      setFinanceStatus(statusData);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoadingFinance(false);
    }
  };

  const refreshMonthlyReport = () => {
    setMonthlyReportRefreshKey((previousValue) => previousValue + 1);
  };

  const openCreatePaymentForm = () => {
    setEditingPaymentId(null);

    setForm({
      ...initialForm,
      paymentDate: getTodayDateInputValue(),
    });

    setIsPaymentFormVisible(true);
    setError("");
    setSuccessMessage("");

    setTimeout(() => {
      document
        .getElementById("payment-form-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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

    if (!selectedChildId || !canManagePayments) {
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
      setIsPaymentFormVisible(false);
      await loadFinance();
      refreshMonthlyReport();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (payment) => {
    if (!canManagePayments) {
      return;
    }

    setEditingPaymentId(payment.id);

    setForm({
      amount: String(payment.amount),
      paymentDate: toDateInputValue(payment.paymentDate),
      description: payment.description || "",
    });

    setIsPaymentFormVisible(true);
    setError("");
    setSuccessMessage("");

    setTimeout(() => {
      document
        .getElementById("payment-form-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const cancelEdit = () => {
    resetForm();
    setIsPaymentFormVisible(false);
  };

  const deletePayment = async (payment) => {
    if (!canManagePayments) {
      return;
    }

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
      refreshMonthlyReport();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const clearFilters = () => {
    setSearchFilter("");
    setNumberOfMonths("1");
  };

  const resetForm = () => {
    setEditingPaymentId(null);
    setForm({
      ...initialForm,
      paymentDate: getTodayDateInputValue(),
    });
  };

  const pageDescription = getPageDescription(user?.role);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Finansije</h1>
          <p className="text-muted mb-0">{pageDescription}</p>
        </div>

        <div className="d-flex gap-2">
          {canManagePayments && (
            <button
              className="btn btn-primary"
              onClick={openCreatePaymentForm}
              disabled={!selectedChildId}
            >
              <FaPlus className="me-2" />
              Evidentiraj uplatu
            </button>
          )}

          <button
            className="btn btn-outline-primary"
            onClick={loadFinance}
            disabled={!selectedChildId || isLoadingFinance}
          >
            <FaSyncAlt className="me-2" />
            Osveži
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {canViewMonthlyReport && (
        <MonthlyFinanceReport
          childrenList={childrenList}
          payments={allPayments}
          monthlyFee={monthlyFee}
          reportMonth={reportMonth}
          reportYear={reportYear}
          isLoading={isLoadingMonthlyReport || isLoadingChildren}
          onMonthChange={setReportMonth}
          onYearChange={setReportYear}
          onRefresh={refreshMonthlyReport}
        />
      )}

      <FinanceFilters
        childOptions={childOptions}
        selectedChildOption={selectedChildOption}
        monthlyFee={monthlyFee}
        numberOfMonths={numberOfMonths}
        expectedAmount={expectedAmount}
        searchFilter={searchFilter}
        isLoadingChildren={isLoadingChildren}
        isLoadingMonthlyFee={isLoadingMonthlyFee}
        onChildChange={setSelectedChildOption}
        onNumberOfMonthsChange={setNumberOfMonths}
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
        monthlyFee={monthlyFee}
        numberOfMonths={numberOfMonths}
      />

      {canManagePayments && isPaymentFormVisible && (
        <div id="payment-form-section">
          <PaymentForm
            form={form}
            editingPaymentId={editingPaymentId}
            selectedChildOption={selectedChildOption}
            isSaving={isSaving}
            canManage={canManagePayments}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancelEdit={cancelEdit}
          />
        </div>
      )}

      <PaymentsTable
        payments={filteredPayments}
        isLoading={isLoadingFinance}
        canManage={canManagePayments}
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

function getPageDescription(role) {
  if (role === "Administrator") {
    return "Pregled finansijskog statusa dece i mesečnih finansijskih izveštaja.";
  }

  if (role === "AdministrativeStaff") {
    return "Pregled finansija, mesečni izveštaji i evidentiranje uplata.";
  }

  return "Pregled uplata i finansijskog statusa za vaše dete.";
}

function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Niste prijavljeni ili je sesija istekla. Prijavite se ponovo.";
  }

  if (error.response?.status === 403) {
    return "Nemate dozvolu za ovu akciju.";
  }

  if (typeof error.response?.data === "string") {
    return error.response.data;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  return "Došlo je do greške. Proveri da li backend radi i da li imaš dozvolu.";
}

export default FinancePage;