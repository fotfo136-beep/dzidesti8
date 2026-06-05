import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Calculator,
  FileText,
  Receipt,
  Settings,
  Menu,
  X,
  ChevronRight,
  Download,
  Upload,
  Trash2,
  LogOut,
  Cloud,
  CloudOff,
  User,
} from "lucide-react";
import { Quote, Receipt as ReceiptType, Client, AppSettings } from "./types";
import {
  generateId,
  generateQuoteNumber,
  generateReceiptNumber,
  formatCurrency,
  numberToWords,
  formatDate,
  getWhatsAppLink,
  defaultCompanySettings,
} from "./utils";
import { isFirebaseConfigured } from "./firebase";
import {
  subscribeToReceipts,
  subscribeToQuotes,
  subscribeToSettings,
  updateReceipt,
  deleteReceipt,
  exportAllData,
  importAllData,
} from "./firebaseData";
import { useAuth } from "./AuthContext";
import LoginPage from "./LoginPage";
import { jsPDF } from "jspdf";

type Tab = "calculator" | "quotes" | "receipts" | "settings";

export default function App() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show login page if Firebase is configured and user is not logged in
  if (isFirebaseConfigured() && !loading && !user) {
    return <LoginPage />;
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "calculator" as Tab, label: "Calculator", icon: Calculator },
    { id: "quotes" as Tab, label: "Quotes", icon: FileText },
    { id: "receipts" as Tab, label: "Receipts", icon: Receipt },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Estim8</h1>
                <p className="text-xs text-gray-500">Pro Trades Estimator</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  {isFirebaseConfigured() ? (
                    <Cloud className="w-4 h-4 text-green-600" />
                  ) : (
                    <CloudOff className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="hidden md:inline">{user.email}</span>
                </div>
              )}
              <button
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Nav with user menu */}
          <div className="hidden lg:flex items-center justify-between mt-4">
            <nav className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
            {user && (
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t bg-white"
            >
              <div className="px-4 py-2 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                ))}
                {user && (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "calculator" && <CalculatorView />}
        {activeTab === "quotes" && <QuotesView userId={user?.uid || ""} />}
        {activeTab === "receipts" && <ReceiptsView userId={user?.uid || ""} />}
        {activeTab === "settings" && <SettingsView userId={user?.uid || ""} />}
      </main>
    </div>
  );
}

function CalculatorView() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [dimensions, setDimensions] = useState({ length: 0, width: 0, height: 0 });
  const [customRatio, setCustomRatio] = useState(1.0);
  const [rate, setRate] = useState(0);

  const services = [
    { id: "pop", label: "POP Ceiling", icon: "🏗️", ratio: 1.0 },
    { id: "tiling", label: "Floor Tiling", icon: "🧱", ratio: 1.0 },
    { id: "painting", label: "Painting", icon: "🎨", ratio: 1.5 },
    { id: "plastering", label: "Plastering", icon: "🧹", ratio: 1.2 },
    { id: "partitions", label: "Partitions", icon: "📐", ratio: 1.0 },
  ];

  const calculateArea = () => {
    if (selectedService === "partitions") {
      return dimensions.length * dimensions.height;
    }
    return dimensions.length * dimensions.width;
  };

  const area = calculateArea();
  const adjustedArea = area * customRatio;
  const total = adjustedArea * rate;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Service Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => {
                setSelectedService(service.id);
                setCustomRatio(service.ratio);
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedService === service.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">{service.icon}</span>
              <p className="mt-2 font-medium text-sm">{service.label}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Length (m)</label>
            <input
              type="number"
              value={dimensions.length || ""}
              onChange={(e) => setDimensions({ ...dimensions, length: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width (m)</label>
            <input
              type="number"
              value={dimensions.width || ""}
              onChange={(e) => setDimensions({ ...dimensions, width: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          {selectedService === "partitions" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (m)</label>
              <input
                type="number"
                value={dimensions.height || ""}
                onChange={(e) => setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate (GHS/m²)</label>
            <input
              type="number"
              value={rate || ""}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom Ratio Factor</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={customRatio}
            onChange={(e) => setCustomRatio(parseFloat(e.target.value) || 1)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Adjust for wastage or complexity</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-6">Estimation Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-blue-200">Base Area</span>
            <span className="font-medium">{area.toFixed(2)} m²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">Ratio Factor</span>
            <span className="font-medium">× {customRatio.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">Adjusted Area</span>
            <span className="font-medium">{adjustedArea.toFixed(2)} m²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">Rate</span>
            <span className="font-medium">GHS {rate.toFixed(2)}/m²</span>
          </div>
          <div className="border-t border-blue-400 pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total Estimate</span>
              <span>GHS {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <button className="w-full mt-6 bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors">
          Generate Quote
        </button>
      </div>
    </div>
  );
}

function QuotesView({ userId }: { userId: string }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!userId) return;
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToQuotes(userId, setQuotes);
    return () => unsubscribe();
  }, [userId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quotes & Quotations</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <FileText className="w-5 h-5" />
          New Quote
        </button>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
          <p className="text-gray-500">Create your first quote to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Quote #{quote.quoteNumber}</p>
                  <h3 className="text-lg font-semibold">{quote.client.name}</h3>
                  <p className="text-gray-600">{quote.client.businessName || quote.client.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(quote.total)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    quote.status === "accepted" ? "bg-green-100 text-green-700" :
                    quote.status === "sent" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>{quote.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReceiptsView({ userId }: { userId: string }) {
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [quotes] = useState<Quote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptType | null>(null);
  
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientBusiness, setClientBusiness] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<ReceiptType["paymentMethod"]>("cash");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [relatedQuoteId, setRelatedQuoteId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!userId) return;
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToReceipts(userId, setReceipts);
    return () => unsubscribe();
  }, [userId]);

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "mobile_money", label: "Mobile Money" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cheque", label: "Cheque" },
    { value: "other", label: "Other" },
  ];

  const resetForm = () => {
    setClientName(""); setClientPhone(""); setClientBusiness("");
    setAmount(""); setPaymentMethod("cash"); setReference("");
    setDescription(""); setRelatedQuoteId(""); setNotes("");
    setEditingReceipt(null); setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    const client: Client = {
      id: generateId(), name: clientName, phone: clientPhone,
      businessName: clientBusiness || undefined,
    };
    const amountNum = parseFloat(amount);
    const relatedQuote = quotes.find(q => q.id === relatedQuoteId);
    const receipt: Omit<ReceiptType, "id"> = {
      receiptNumber: editingReceipt?.receiptNumber || generateReceiptNumber(),
      quoteId: relatedQuoteId || undefined,
      quoteNumber: relatedQuote?.quoteNumber,
      client,
      date: new Date().toISOString(),
      amount: amountNum,
      amountWords: numberToWords(amountNum),
      paymentMethod,
      reference: reference || undefined,
      receivedFrom: clientName,
      description: description || "Payment received",
      status: "issued",
      notes: notes || undefined,
    };

    if (editingReceipt) {
      await updateReceipt(userId, editingReceipt.id, receipt);
    }
    resetForm();
  };

  const editReceipt = (receipt: ReceiptType) => {
    setEditingReceipt(receipt);
    setClientName(receipt.client.name); setClientPhone(receipt.client.phone);
    setClientBusiness(receipt.client.businessName || "");
    setAmount(receipt.amount.toString()); setPaymentMethod(receipt.paymentMethod);
    setReference(receipt.reference || ""); setDescription(receipt.description);
    setRelatedQuoteId(receipt.quoteId || ""); setNotes(receipt.notes || "");
    setShowForm(true);
  };

  const handleDeleteReceipt = async (id: string) => {
    if (!userId) return;
    if (confirm("Are you sure you want to delete this receipt?")) {
      await deleteReceipt(userId, id);
    }
  };

  const generatePDF = (receipt: ReceiptType, settings: AppSettings) => {
    const doc = new jsPDF();
    const companyName = settings?.name || "Estim8 Ghana";

    doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text(companyName, 105, 30, { align: "center" });
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("RECEIPT", 105, 70, { align: "center" });

    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text("Receipt No: " + receipt.receiptNumber, 20, 85);
    doc.text("Date: " + formatDate(new Date(receipt.date)), 140, 85);

    doc.rect(20, 100, 170, 25);
    doc.setFontSize(10); doc.text("Received From:", 25, 108);
    doc.setFont("helvetica", "bold"); doc.text(receipt.client.name, 25, 115);
    doc.setFont("helvetica", "normal");
    doc.text(receipt.client.businessName || receipt.client.phone, 25, 122);

    doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text("AMOUNT: " + formatCurrency(receipt.amount), 20, 140);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(receipt.amountWords, 20, 148);

    doc.text("Payment Method: " + paymentMethods.find(p => p.value === receipt.paymentMethod)?.label, 20, 160);
    if (receipt.reference) doc.text("Reference: " + receipt.reference, 20, 167);

    doc.text("Description:", 20, 180);
    doc.setFont("helvetica", "bold"); doc.text(receipt.description, 20, 187);

    doc.setFontSize(9); doc.setTextColor(100, 100, 100);
    doc.text("This receipt serves as official proof of payment.", 105, 250, { align: "center" });
    doc.text("Thank you for your business!", 105, 256, { align: "center" });

    doc.save("Receipt_" + receipt.receiptNumber + ".pdf");
  };

  const shareOnWhatsApp = (receipt: ReceiptType, settings: AppSettings) => {
    const message = "🧾 *RECEIPT*\n\nReceipt No: " + receipt.receiptNumber + "\nDate: " + formatDate(new Date(receipt.date)) + "\n\nReceived From: " + receipt.client.name + "\nAmount: *" + formatCurrency(receipt.amount) + "*\n(" + receipt.amountWords + ")\n\nPayment Method: " + paymentMethods.find(p => p.value === receipt.paymentMethod)?.label + "\n\n" + (settings?.name || "Estim8 Ghana") + "\n" + (settings?.phone || "");
    window.open(getWhatsAppLink(receipt.client.phone, message), "_blank");
  };

  const [settings, setSettings] = useState<AppSettings>(defaultCompanySettings as AppSettings);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToSettings(userId, (newSettings) => {
      if (newSettings) {
        setSettings(newSettings as AppSettings);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Receipts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Receipt className="w-5 h-5" />
          {showForm ? "Cancel" : "New Receipt"}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingReceipt ? "Edit Receipt" : "Create New Receipt"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Enter client name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="+233 XX XXX XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business/Company Name</label>
                <input type="text" value={clientBusiness} onChange={(e) => setClientBusiness(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (GHS) *</label>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as ReceiptType["paymentMethod"])} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                  {paymentMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference/Transaction ID</label>
                <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Optional" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description/Purpose *</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="e.g., Payment for POP ceiling installation" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Optional notes" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                {editingReceipt ? "Update Receipt" : "Create Receipt"}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {receipts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts yet</h3>
          <p className="text-gray-500">Create your first receipt to record payments</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {receipts.map((receipt) => (
            <motion.div key={receipt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500">#{receipt.receiptNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${receipt.status === "issued" ? "bg-green-100 text-green-700" : receipt.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {receipt.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{receipt.client.name}</h3>
                  <p className="text-gray-600">{receipt.client.businessName || receipt.client.phone}</p>
                  <p className="text-sm text-gray-500 mt-1">{receipt.description} • {paymentMethods.find(p => p.value === receipt.paymentMethod)?.label}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(receipt.amount)}</p>
                  <p className="text-xs text-gray-500">{formatDate(new Date(receipt.date))}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <button onClick={() => generatePDF(receipt, settings)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                  <FileText className="w-4 h-4" /> Download PDF
                </button>
                <button onClick={() => shareOnWhatsApp(receipt, settings)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                  Share via WhatsApp
                </button>
                <button onClick={() => editReceipt(receipt)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDeleteReceipt(receipt.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsView({ userId }: { userId: string }) {
  const [settings, setSettings] = useState<AppSettings>(defaultCompanySettings as AppSettings);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToSettings(userId, (newSettings) => {
      if (newSettings) {
        setSettings({ ...defaultCompanySettings, ...newSettings } as AppSettings);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    const { saveSettings } = await import("./firebaseData");
    await saveSettings(userId, { ...settings, lastUpdated: new Date().toISOString() });
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  const handleExport = async () => {
    if (!userId) return;
    const { exportAllData } = await import("./firebaseData");
    const data = await exportAllData(userId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "estim8-backup-" + new Date().toISOString().split("T")[0] + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!userId) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setImportLoading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            const { importAllData } = await import("./firebaseData");
            await importAllData(userId, data);
            alert("Data imported successfully!");
          } catch {
            alert("Invalid backup file.");
          }
          setImportLoading(false);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Company Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input type="text" value={settings.name || ""} onChange={(e) => setSettings({ ...settings, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input type="text" value={settings.tagline || ""} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={settings.phone || ""} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={settings.email || ""} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" value={settings.address || ""} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            {showSaveConfirm ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Cloud Sync</h3>
        <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg">
          <Cloud className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-700">Your data is synced to Firebase cloud</span>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleExport} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" /> Export Backup
            </button>
            <button onClick={handleImport} disabled={importLoading} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              <Upload className="w-4 h-4" /> {importLoading ? "Importing..." : "Import Backup"}
            </button>
          </div>
          <p className="text-sm text-gray-500">Export your data to save a local backup. Import to restore data.</p>
        </div>
      </div>
    </div>
  );
}
