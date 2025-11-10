import React, { useEffect } from 'react';
import { ShieldCheck, RefreshCcw, AlertCircle, FileText, Mail, Phone, MapPin } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';

const infoHighlights = [
  {
    title: 'Transparent Practices',
    description: 'We outline how Valora Gold collects, uses, and protects customer information across every touchpoint.',
    icon: ShieldCheck,
  },
  {
    title: 'Customer-First Policies',
    description: 'Every policy is written to make sure you feel secure, informed, and confident when shopping with us.',
    icon: FileText,
  },
  {
    title: 'Dedicated Support',
    description: 'Our team is always ready to help you with privacy concerns, refunds, and cancellations.',
    icon: RefreshCcw,
  },
];

const refundSections = [
  {
    heading: 'Order Cancellation',
    points: [
      'Orders can be canceled before dispatch by contacting our support team through WhatsApp or email.',
      'Once the order has been processed or shipped, it cannot be canceled.',
      'For manual payment orders, cancellation requests must be made within 6 hours of payment confirmation.',
      'If the product is unavailable after placing the order, our team will inform you and issue a full refund immediately.',
    ],
  },
  {
    heading: 'Refund Policy',
    intro: 'We offer refunds only under valid conditions listed below:',
    points: [
      'If you receive a damaged, defective, or wrong product, you must report it within 24 hours of delivery.',
      'The product must be returned in unused and original condition with packaging, invoice, and proof of purchase.',
      'Refunds are processed after inspection and approval by our quality team.',
      'Approved refunds will be made via the same payment method within 5–7 working days.',
      'In case of manual payments, refunds are transferred directly to the same account used for payment.',
    ],
    note: 'Please note: Refunds are not issued for reasons such as personal dislike, change of mind, or delay caused by courier services.',
  },
  {
    heading: 'Exchange Policy',
    intro: 'We provide an exchange only if:',
    points: [
      'The wrong product was sent.',
      'The product arrived damaged due to shipping.',
      'A replacement request is made within 24 hours of receiving the product.',
    ],
    note: 'Exchange requests after the given time frame will not be accepted.',
  },
  {
    heading: 'Non-Refundable Items',
    intro: 'Certain items are not eligible for refund or return, including:',
    bulletStyle: 'disc',
    points: [
      'Products purchased during sale or promotion offers',
      'Items damaged after delivery due to mishandling',
      'Used or opened beauty and skincare products',
      'Digital or downloadable items (if applicable)',
    ],
  },
  {
    heading: 'Return Process',
    intro: 'If your product qualifies for return or replacement:',
    points: [
      'Contact our support team via WhatsApp or email with your order ID and issue details.',
      'Our representative will confirm eligibility and share the return address.',
      'The product must be securely packed and shipped back within 3 days of approval.',
      'After verification, your refund or replacement will be processed accordingly.',
    ],
  },
];

const PrivacyPolicy = () => {
  const location = useLocation();
  const isRefundPage = location.pathname.includes('refund');
  const pageTitle = isRefundPage ? 'Refund & Cancellation Policy' : 'Privacy, Refund & Cancellation Policy';

  useEffect(() => {
    if (isRefundPage) {
      const refundSection = document.getElementById('refund-policy');
      if (refundSection) {
        refundSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [isRefundPage]);

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Privacy Policy', path: '/privacy-policy' },
            ...(isRefundPage ? [{ label: 'Refund & Cancellation', path: '/refund-cancellation' }] : []),
          ]}
        />

        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-logo-green via-banner-green to-emerald-500 px-6 sm:px-10 py-10 text-white">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/80">
              <ShieldCheck className="h-5 w-5" />
              Valora Gold Policies
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold font-sans">{pageTitle}</h1>
            <p className="mt-4 text-white/90 leading-relaxed max-w-3xl font-sans">
              At Valora Gold, we value the trust you place in us. This page explains how we safeguard your personal information and outlines the policies that protect your purchases.
            </p>
          </div>

          <div className="px-6 sm:px-10 py-10 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {infoHighlights.map(({ title, description, icon: Icon }) => (
                <div key={title} className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm">
                  <Icon className="h-10 w-10 text-logo-green" />
                  <h2 className="mt-4 text-lg font-semibold text-gray-900 font-sans">{title}</h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed font-sans">{description}</p>
                </div>
              ))}
            </div>

            <article className="space-y-6">
              <header>
                <h2 className="text-2xl font-bold text-gray-900 font-sans">Privacy Policy Overview</h2>
                <p className="mt-2 text-gray-600 leading-relaxed font-sans">
                  We collect personal details such as your name, contact information, and shipping address solely to process and deliver your orders. Payment data is secured through trusted gateways and never stored on our servers. We may send you updates about new collections or offers, but you can opt out at any time. Your information remains confidential and is never sold to third parties.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 font-sans">How We Protect Your Data</h3>
                  <ul className="mt-4 space-y-3 text-sm text-gray-600 font-sans">
                    <li className="flex gap-3">
                      <ShieldCheck className="h-5 w-5 text-logo-green mt-0.5 flex-shrink-0" />
                      <span>Secure sockets layer (SSL) technology keeps your checkout experience encrypted and safe.</span>
                    </li>
                    <li className="flex gap-3">
                      <ShieldCheck className="h-5 w-5 text-logo-green mt-0.5 flex-shrink-0" />
                      <span>Access to customer information is restricted to authorized personnel solely for order fulfilment.</span>
                    </li>
                    <li className="flex gap-3">
                      <ShieldCheck className="h-5 w-5 text-logo-green mt-0.5 flex-shrink-0" />
                      <span>Regular audits ensure compliance with Pakistani e-commerce regulations and best practices.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 font-sans">Your Rights & Preferences</h3>
                  <ul className="mt-4 space-y-3 text-sm text-gray-600 font-sans">
                    <li className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-logo-green mt-0.5 flex-shrink-0" />
                      <span>You may request a copy, update, or deletion of your personal information by contacting our support team.</span>
                    </li>
                    <li className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-logo-green mt-0.5 flex-shrink-0" />
                      <span>Marketing emails and SMS are entirely optional—unsubscribe links are included in every message.</span>
                    </li>
                    <li className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-logo-green mt-0.5 flex-shrink-0" />
                      <span>We retain transaction history only as long as legally required for taxation and customer service.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            <article id="refund-policy" className="space-y-6">
              <header className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-logo-green/10 px-4 py-2 text-logo-green">
                  <RefreshCcw className="h-5 w-5" />
                  <span className="text-sm font-semibold tracking-wide uppercase">Refund & Cancellation Policy</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 font-sans">Valora Gold — Committed to Your Confidence</h2>
                <p className="text-gray-600 leading-relaxed font-sans">
                  Customer satisfaction is our top priority. The following guidelines explain how refunds, replacements, and cancellations are handled for every purchase made through our official channels.
                </p>
              </header>

              <div className="space-y-8">
                {refundSections.map(({ heading, intro, points, note, bulletStyle = 'decimal' }) => {
                  const ListTag = bulletStyle === 'disc' ? 'ul' : 'ol';
                  return (
                    <section key={heading} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-900 font-sans">{heading}</h3>
                      {intro && <p className="mt-2 text-sm text-gray-600 leading-relaxed font-sans">{intro}</p>}
                      <ListTag className={`mt-4 space-y-3 text-sm text-gray-600 font-sans ${bulletStyle === 'disc' ? 'list-disc pl-6' : 'list-decimal pl-6'}`}>
                        {points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ListTag>
                      {note && <p className="mt-4 text-sm text-logo-green font-semibold font-sans">{note}</p>}
                    </section>
                  );
                })}
              </div>
            </article>

            <section className="bg-gray-50 border border-gray-100 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 font-sans">Contact for Privacy, Refunds & Cancellations</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed font-sans">
                Reach out to our support team if you have questions about your data, a recent order, or need help with an exchange.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700 font-sans">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-logo-green mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <a href="mailto:valoragoldpk@gmail.com" className="text-logo-green hover:underline">valoragoldpk@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-logo-green mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">WhatsApp</p>
                    <a href="https://wa.me/923390005256" target="_blank" rel="noopener noreferrer" className="text-logo-green hover:underline">+92 339 0005256</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-logo-green mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-600">Valora Gold, Lahore, Pakistan</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

