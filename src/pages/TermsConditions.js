import React from 'react';
import { ClipboardList, ShieldCheck, Tag, Truck, Lock, Scale, Mail, Phone, MapPin } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const highlightCards = [
  {
    title: 'Transparent Service',
    description: 'Clear commitments for product quality, payments, delivery, and support across every interaction.',
    icon: ClipboardList,
  },
  {
    title: 'Trusted Payments',
    description: 'Verified transactions, manual payment guidance, and proof-based confirmations keep your orders secure.',
    icon: ShieldCheck,
  },
  {
    title: 'Customer Protection',
    description: 'From availability updates to secure data handling, we safeguard your experience end to end.',
    icon: Lock,
  },
];

const termsSections = [
  {
    heading: '1. Acceptance of Terms',
    description: [
      'By placing an order or using our services, you confirm that you have read, understood, and agreed to these Terms and Conditions.',
      'Valora Gold reserves the right to update or modify these terms at any time without prior notice. Any changes will be posted on this page.',
    ],
  },
  {
    heading: '2. Products and Availability',
    description: [
      'All product images, descriptions, and prices are listed accurately to the best of our ability. However, minor variations in packaging or design may occur due to manufacturer updates or lighting differences in photos.',
      'If a product becomes unavailable after you place an order, our team will notify you and offer an alternative or a full refund.',
    ],
    icon: Tag,
  },
  {
    heading: '3. Pricing and Payments',
    description: [
      'All prices are listed in Pakistani Rupees (PKR) unless stated otherwise.',
      'Valora Gold reserves the right to change prices at any time without notice.',
      'Payment must be made in full before order confirmation.',
      'Manual payments require proof of transaction to be shared on our official WhatsApp number.',
      'Orders will only be processed once payment is verified.',
    ],
  },
  {
    heading: '4. Shipping and Delivery',
    description: [
      'Orders are processed within 1–2 working days after payment confirmation.',
      'Delivery times may vary depending on your city or courier availability.',
      'Any delays caused by courier services or unforeseen events are beyond our control, but we always assist customers until the order is received safely.',
      'Delivery charges (if any) are mentioned clearly at checkout.',
    ],
    icon: Truck,
  },
  {
    heading: '5. Returns, Refunds, and Cancellations',
    description: [
      'Our refund and cancellation process is governed by our official Refund & Cancellation Policy, which should be reviewed separately before placing an order.',
      'We only accept claims made according to the policy terms.',
    ],
  },
  {
    heading: '6. Use of Website',
    description: [
      'Customers agree not to use the website for any fraudulent or illegal activity.',
      'Copying, modifying, or distributing any content, images, or materials without permission is prohibited.',
      'Posting misleading, false, or harmful information related to Valora Gold is not allowed.',
      'Any misuse of the website or violation of these conditions may lead to restricted access or legal action.',
    ],
  },
  {
    heading: '7. Intellectual Property',
    description: [
      'All brand names, product names, logos, images, and website content are the property of Valora Gold.',
      'Unauthorized use, reproduction, or distribution of any content is strictly prohibited and may result in legal action.',
    ],
  },
  {
    heading: '8. Limitation of Liability',
    description: [
      'Valora Gold is not responsible for any indirect, incidental, or consequential damages arising from the use of our website or products.',
      'We are only liable for the value of the purchased product in case of a verified and valid claim.',
    ],
    icon: Scale,
  },
  {
    heading: '9. Privacy and Data Security',
    description: [
      'Your personal data is handled according to our Privacy Policy. We ensure that your details remain confidential and are never shared without consent.',
    ],
  },
];

const contactInfo = [
  {
    label: 'Email',
    value: 'support@valoragold.com',
    href: 'mailto:support@valoragold.com',
    icon: Mail,
  },
  {
    label: 'WhatsApp',
    value: '+92 339 0005256',
    href: 'https://wa.me/923390005256',
    icon: Phone,
  },
  {
    label: 'Address',
    value: 'Valora Gold, Lahore, Pakistan',
    icon: MapPin,
  },
];

const TermsConditions = () => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Terms & Conditions', path: '/terms-conditions' }]} />

        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-logo-green via-banner-green to-emerald-500 px-6 sm:px-10 py-10 text-white">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/80">
              <ClipboardList className="h-5 w-5" />
              Valora Gold Guidelines
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold font-sans">Terms & Conditions</h1>
            <p className="mt-4 text-white/90 leading-relaxed max-w-3xl font-sans">
              Welcome to Valora Gold. By accessing or purchasing from our website or social platforms, you agree to follow the terms designed to ensure a fair, transparent, and secure experience for every customer.
            </p>
          </div>

          <div className="px-6 sm:px-10 py-10 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {highlightCards.map(({ title, description, icon: Icon }) => (
                <div key={title} className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm">
                  <Icon className="h-10 w-10 text-logo-green" />
                  <h2 className="mt-4 text-lg font-semibold text-gray-900 font-sans">{title}</h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed font-sans">{description}</p>
                </div>
              ))}
            </div>

            <article className="space-y-8">
              {termsSections.map(({ heading, description }) => (
                <section key={heading} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 font-sans">{heading}</h3>
                  <div className="mt-3 space-y-3">
                    {description.map((paragraph) => (
                      <p key={paragraph} className="text-sm text-gray-600 leading-relaxed font-sans">{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </article>

            <section className="bg-gray-50 border border-gray-100 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 font-sans">10. Contact Information</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed font-sans">
                If you have any questions about these Terms and Conditions, please reach out—we are here to help.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700 font-sans">
                {contactInfo.map(({ label, value, href, icon: Icon }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-logo-green mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          className="text-logo-green hover:underline"
                          target={href.startsWith('http') ? '_blank' : undefined}
                          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-gray-600">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsConditions;

