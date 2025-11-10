import React from 'react';
import { RefreshCcw, PackageCheck, ShieldAlert, Undo2, Mail, Phone, MapPin } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const quickHighlights = [
  {
    title: 'Flexible Cancellations',
    description: 'Cancel any order before it ships—manual payments must request within six hours of confirmation.',
    icon: Undo2,
  },
  {
    title: 'Quality Assurance',
    description: 'Refunds and exchanges are available for damaged, defective, or incorrect items reported within 24 hours.',
    icon: ShieldAlert,
  },
  {
    title: 'Transparent Timelines',
    description: 'Approved refunds are released within 5–7 working days through the same payment channel used at checkout.',
    icon: PackageCheck,
  },
];

const policySections = [
  {
    heading: '1. Order Cancellation',
    description: 'We understand plans can change. To keep things smooth for everyone, please note the following:',
    listType: 'ul',
    items: [
      'Orders can be canceled at any time before they are shipped.',
      'Once an order is dispatched, it cannot be canceled or modified.',
      'For manual payment orders, cancellation requests must be made within 6 hours of payment confirmation.',
      'If a product becomes unavailable after your order is placed, we will notify you and issue a full refund immediately.',
    ],
  },
  {
    heading: '2. Refund Policy',
    description: 'Refunds are only issued under valid and approved conditions. A request qualifies when:',
    listType: 'ul',
    items: [
      'The product you received is damaged, defective, or incorrect.',
      'You inform our support team within 24 hours of receiving the product.',
      'The product is unused, unopened, and returned in its original packaging.',
      'The return is accompanied by proof of purchase and complete order details.',
      'Our team receives, inspects, and approves the returned product.',
      'Refunds are processed within 5–7 working days through the original payment method.',
    ],
    subheading: 'Refunds are not issued for:',
    subItems: [
      'Change of mind or personal preference.',
      'Minor variations in colour, packaging, or design.',
      'Delays caused by courier or logistics partners.',
    ],
  },
  {
    heading: '3. Exchange Policy',
    description: 'We are happy to arrange an exchange under the following circumstances:',
    listType: 'ul',
    items: [
      'The wrong product was delivered.',
      'The product was damaged during delivery.',
      'The exchange request is made within 24 hours of receiving the order.',
    ],
    note: 'Exchange requests submitted after 24 hours cannot be accommodated. Replacement items are shipped only after the original product is received and verified.',
  },
  {
    heading: '4. Non-Refundable Items',
    description: 'Certain categories are ineligible for refund or return due to health, safety, or promotional considerations:',
    listType: 'ul',
    items: [
      'Sale, discounted, or promotional items.',
      'Products damaged after delivery because of mishandling.',
      'Used or opened skincare, beauty, or personal care products.',
      'Digital or downloadable products.',
    ],
  },
  {
    heading: '5. Return Process',
    description: 'If your order qualifies for a return or replacement, follow these simple steps:',
    listType: 'ol',
    items: [
      'Contact our customer support via WhatsApp or email with your order number and issue details.',
      'Our team will verify your claim and share the return address.',
      'Pack the product securely in its original packaging and ship it back within 3 days of approval.',
      'Once the product is received and verified, we will process your refund or ship the replacement.',
    ],
  },
  {
    heading: '6. Shipping Costs for Returns',
    description: 'Shipping responsibility depends on the reason for return:',
    listType: 'ul',
    items: [
      'Customers cover return shipping charges for standard returns.',
      'Valora Gold covers return shipping if the product is wrong, damaged, or defective due to our error.',
    ],
  },
];

const contactDetails = [
  {
    title: 'Email',
    value: 'support@valoragold.com',
    href: 'mailto:support@valoragold.com',
    icon: Mail,
  },
  {
    title: 'WhatsApp',
    value: '+92 339 0005256',
    href: 'https://wa.me/923390005256',
    icon: Phone,
  },
  {
    title: 'Address',
    value: 'Valora Gold, Lahore, Pakistan',
    icon: MapPin,
  },
];

const RefundCancellation = () => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Refund & Cancellation', path: '/refund-cancellation' }]} />

        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-logo-green via-banner-green to-emerald-500 px-6 sm:px-10 py-10 text-white">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/80">
              <RefreshCcw className="h-5 w-5" />
              Valora Gold Policies
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold font-sans">Refund & Cancellation Policy</h1>
            <p className="mt-4 text-white/90 leading-relaxed max-w-3xl font-sans">
              Customer satisfaction is at the heart of Valora Gold. Explore how we handle cancellations, refunds, and exchanges to keep your shopping experience secure and dependable.
            </p>
          </div>

          <div className="px-6 sm:px-10 py-10 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickHighlights.map(({ title, description, icon: Icon }) => (
                <div key={title} className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm">
                  <Icon className="h-10 w-10 text-logo-green" />
                  <h2 className="mt-4 text-lg font-semibold text-gray-900 font-sans">{title}</h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed font-sans">{description}</p>
                </div>
              ))}
            </div>

            <article className="space-y-8">
              {policySections.map(({ heading, description, listType, items, subheading, subItems, note }) => {
                const ListComponent = listType === 'ol' ? 'ol' : 'ul';
                return (
                  <section key={heading} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 font-sans">{heading}</h3>
                    {description && <p className="mt-2 text-sm text-gray-600 leading-relaxed font-sans">{description}</p>}
                    <ListComponent className={`mt-4 space-y-3 text-sm text-gray-600 font-sans ${listType === 'ol' ? 'list-decimal pl-6' : 'list-disc pl-6'}`}>
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ListComponent>
                    {subheading && (
                      <div className="mt-6">
                        <p className="text-sm font-semibold text-gray-900 font-sans">{subheading}</p>
                        <ul className="mt-3 space-y-2 text-sm text-gray-600 font-sans list-disc pl-6">
                          {subItems?.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {note && <p className="mt-4 text-sm text-logo-green font-semibold font-sans">{note}</p>}
                  </section>
                );
              })}
            </article>

            <section className="bg-gray-50 border border-gray-100 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 font-sans">7. Contact for Refunds & Cancellations</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed font-sans">
                Need help with a recent order? Reach out to our dedicated support team—we are here to resolve your concerns quickly.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700 font-sans">
                {contactDetails.map(({ title, value, href, icon: Icon }) => (
                  <div key={title} className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-logo-green mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{title}</p>
                      {href ? (
                        <a href={href} className="text-logo-green hover:underline" target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                          {value}
                        </a>
                      ) : (
                        <p className="text-gray-600">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-gray-600 font-sans">
                Valora Gold — Delivering trust, quality, and care in every order.
              </p>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RefundCancellation;

