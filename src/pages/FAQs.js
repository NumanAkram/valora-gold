import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageCircle, Zap, ShieldCheck, Clock, Mail, Phone, MapPin } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const faqs = [
  {
    question: 'What type of products or services do you offer?',
    answer:
      'We offer a wide range of digital and social media services, including followers, likes, watch time, ad promotions, and other marketing solutions. All our services are designed to help you grow your online presence effectively and safely.',
  },
  {
    question: 'How can I place an order?',
    answer:
      'You can place an order directly through our website. Simply select your desired service, provide the required details, and complete the payment using our available payment methods. After successful payment, your order will be processed automatically.',
  },
  {
    question: 'How long does it take to deliver the services?',
    answer:
      'Delivery time varies depending on the type of service and the quantity ordered. Most services start within a few hours and are usually completed within the given timeframe mentioned on the service page.',
  },
  {
    question: 'Are your services safe for my account?',
    answer:
      'Yes, our services are completely safe and secure. We do not require your account password and only use ethical methods to ensure your account’s safety and long-term stability.',
  },
  {
    question: 'What if my order is delayed or not completed?',
    answer:
      'In case of any delay, you can contact our support team. We will check your order status and make sure it is completed as soon as possible. If we are unable to deliver your order, a full or partial refund will be provided according to our refund policy.',
  },
  {
    question: 'Can I cancel my order after placing it?',
    answer:
      'Once the order has started processing, it cannot be canceled. However, if the order is still pending, you can contact us to request a cancellation.',
  },
  {
    question: 'Do you offer any guarantees for your services?',
    answer:
      'Yes, most of our services come with a lifetime guarantee. If you notice any drops in followers, likes, or engagement within the guarantee period, we will refill or fix the issue free of cost.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept multiple payment methods including bank transfer, Easypaisa, JazzCash, and other manual payment options for local and international clients.',
  },
  {
    question: 'How can I contact customer support?',
    answer:
      'You can reach us through our Contact Us page, WhatsApp number, or email. Our support team is available 24/7 to assist you with any queries or issues.',
  },
  {
    question: 'Do you provide discounts or special offers?',
    answer:
      'Yes, we frequently offer special discounts, bundle deals, and giveaways for our customers. Stay connected with us on our social platforms to get updates on new offers and promotions.',
  },
];

const supportHighlights = [
  {
    title: 'Fast Responses',
    description: 'Our support team monitors every request and responds within minutes during working hours.',
    icon: MessageCircle,
  },
  {
    title: 'Safe & Secure',
    description: 'Services are delivered without passwords using trusted, organic-friendly methods.',
    icon: ShieldCheck,
  },
  {
    title: 'On-Time Delivery',
    description: 'Clear timelines and proactive updates keep you informed at every step.',
    icon: Clock,
  },
];

const contactDetails = [
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

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleQuestion = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'FAQs', path: '/faqs' }]} />

        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-logo-green via-banner-green to-emerald-500 px-6 sm:px-10 py-10 text-white">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/80">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold font-sans">Answers to Your Most Common Questions</h1>
            <p className="mt-4 text-white/90 leading-relaxed max-w-3xl font-sans">
              Get quick clarity on Valora Gold services, delivery timelines, guarantees, and support. We are committed to making every experience effortless and transparent.
            </p>
          </div>

          <div className="px-6 sm:px-10 py-10 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {supportHighlights.map(({ title, description, icon: Icon }) => (
                <div key={title} className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm">
                  <Icon className="h-10 w-10 text-logo-green" />
                  <h2 className="mt-4 text-lg font-semibold text-gray-900 font-sans">{title}</h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed font-sans">{description}</p>
                </div>
              ))}
            </div>

            <article className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-100">
              {faqs.map(({ question, answer }, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={question}>
                    <button
                      type="button"
                      onClick={() => toggleQuestion(index)}
                      className="w-full flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-logo-green"
                    >
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 font-sans">{question}</h3>
                        {!isOpen && (
                          <p className="mt-1 text-sm text-gray-500 font-sans">Tap to see the answer</p>
                        )}
                      </div>
                      <span
                        className={`flex items-center justify-center w-9 h-9 rounded-full border border-white/40 bg-logo-green text-white transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 sm:px-8 pb-6 text-sm text-gray-600 leading-relaxed font-sans">
                        {answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </article>

            <section className="bg-gray-50 border border-gray-100 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 font-sans">Need more help?</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed font-sans">
                If your question isn’t listed here, our support team is available 24/7. Reach out and we will guide you personally.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700 font-sans">
                {contactDetails.map(({ label, value, href, icon: Icon }) => (
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

export default FAQs;

