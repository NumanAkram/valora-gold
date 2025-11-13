const Setting = require('../models/Setting');

const DEFAULT_SHIPPING_CHARGE = Number(process.env.DEFAULT_SHIPPING_CHARGE || 200);

const parseAmount = (amount) => {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }
  return Math.round(numeric);
};

const getShippingCharge = async () => {
  const setting = await Setting.findOne({ key: 'shippingCharge' });
  if (!setting) {
    return DEFAULT_SHIPPING_CHARGE;
  }

  const stored = setting.value?.amount ?? setting.value;
  const parsed = parseAmount(stored);
  if (parsed === null) {
    return DEFAULT_SHIPPING_CHARGE;
  }

  return parsed;
};

const updateShippingCharge = async ({ amount, updatedBy }) => {
  const parsed = parseAmount(amount);
  if (parsed === null) {
    throw new Error('Shipping amount must be a non-negative number');
  }

  const setting = await Setting.findOneAndUpdate(
    { key: 'shippingCharge' },
    {
      key: 'shippingCharge',
      value: { amount: parsed },
      ...(updatedBy ? { updatedBy } : {}),
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return {
    amount: setting.value?.amount ?? parsed,
    updatedAt: setting.updatedAt,
  };
};

module.exports = {
  DEFAULT_SHIPPING_CHARGE,
  getShippingCharge,
  updateShippingCharge,
};
