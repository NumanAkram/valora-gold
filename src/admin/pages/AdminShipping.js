import React, { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import { shippingAPI } from '../../utils/api';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

const AdminShipping = () => {
  const [amount, setAmount] = useState('200');
  const [initialAmount, setInitialAmount] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchShippingCharge = async () => {
      try {
        setLoading(true);
        const response = await shippingAPI.get();
        if (!isMounted) return;

        if (response?.success) {
          const fetchedAmount = Number(response?.data?.amount ?? 0);
          const normalized = Number.isFinite(fetchedAmount) && fetchedAmount >= 0 ? fetchedAmount : 0;
          setAmount(String(normalized));
          setInitialAmount(normalized);
        } else {
          showToast(response?.message || 'Failed to load shipping charge', 'error');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Fetch shipping charge failed:', error);
          showToast(error.message || 'Failed to load shipping charge', 'error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchShippingCharge();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      showToast('Please enter a valid non-negative delivery charge.', 'error');
      return;
    }

    if (initialAmount !== null && numericAmount === initialAmount) {
      showToast('No changes detected in delivery charge.', 'info');
      return;
    }

    try {
      setSaving(true);
      const response = await shippingAPI.update(numericAmount);

      if (response?.success) {
        showToast(response?.message || 'Shipping charge updated successfully.', 'success');
        setInitialAmount(numericAmount);
        setUpdatedAt(response?.data?.updatedAt || new Date().toISOString());
      } else {
        showToast(response?.message || 'Failed to update shipping charge.', 'error');
      }
    } catch (error) {
      console.error('Update shipping charge failed:', error);
      showToast(error.message || 'Failed to update shipping charge.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 font-sans">Manage Shipping Charges</h1>
          <p className="text-gray-600 font-sans">
            Control the flat delivery charge that is applied to every order during checkout, regardless of the payment method.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {loading ? (
              <Spinner label="Loading current delivery charge..." />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="shipping-amount" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                    Delivery Charge (Rs.)
                  </label>
                  <input
                    id="shipping-amount"
                    type="number"
                    min="0"
                    step="1"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans text-base"
                    placeholder="Enter amount"
                  />
                  <p className="mt-2 text-sm text-gray-500 font-sans">
                    This amount is added once per order as the shipping or delivery fee.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-logo-green text-white font-semibold px-5 py-3 rounded-lg hover:bg-banner-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={loading || saving}
                    onClick={() => {
                      setAmount(initialAmount !== null ? String(initialAmount) : '0');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Reset
                  </button>
                </div>

                {updatedAt && (
                  <p className="text-sm text-gray-500 font-sans">
                    Last updated on{' '}
                    {new Date(updatedAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                )}
              </form>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-10 w-10 text-logo-green shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 font-sans">Why adjust shipping?</h2>
                <p className="text-sm text-gray-600 font-sans">
                  Fine-tune delivery charges to balance logistics expenses, promotional offers, and customer expectations.
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-gray-600 font-sans leading-relaxed">
              <li>• Update the amount any time to react to courier cost changes.</li>
              <li>• Customers see the updated charge instantly on the checkout page.</li>
              <li>• Applies automatically across all payment methods and order types.</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminShipping;
