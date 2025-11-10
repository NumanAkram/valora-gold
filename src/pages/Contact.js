import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Breadcrumbs from '../components/Breadcrumbs';

// Official WhatsApp Icon SVG
const WhatsAppIcon = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const Contact = () => {
  const { showToast } = useToast();
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult("Sending....");

    const formData = new FormData(e.target);
    formData.append("access_key", "729e83c5-801f-495d-b96e-b07ea5d7875b");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("Form Submitted Successfully");
      e.target.reset();
      showToast('Message sent successfully! We will contact you soon.', 'success');
    } else {
      setResult("Error");
      showToast('Failed to send message. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Contact Us', path: '/contact' }]} />
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-logo-green mb-4 font-sans">Contact Us</h1>
          <p className="text-gray-600 font-sans">Get in touch with Valora Gold</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-logo-green p-3 rounded-full">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-sans">Phone</h3>
                    <a href="tel:03390005256" className="text-gray-600 hover:text-logo-green transition-colors font-sans">
                      0339-0005256
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-500 p-3 rounded-full">
                    <WhatsAppIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-sans">WhatsApp</h3>
                    <a href="https://wa.me/923390005256" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors font-sans">
                      Chat with us on WhatsApp
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-logo-green p-3 rounded-full">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-sans">Email</h3>
                    <a href="mailto:info@valoragold.store" className="text-gray-600 hover:text-logo-green transition-colors font-sans">
                      info@valoragold.store
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-logo-green p-3 rounded-full">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-sans">Address</h3>
                    <p className="text-gray-600 font-sans">15-B Gulberg II, Lahore, Pakistan</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-logo-green p-3 rounded-full">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-sans">Business Hours</h3>
                    <p className="text-gray-600 font-sans">Monday - Saturday: 10:00 AM - 7:00 PM</p>
                    <p className="text-gray-600 font-sans">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4 font-sans">Our Location</h3>
              <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.2345678901234!2d74.3456789!3d31.5200000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDMxJzEyLjAiTiA3NMKwMjAnNDQuNSJF!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Valora Gold Location"
                ></iframe>
              </div>
              <p className="text-sm text-gray-600 mt-2 font-sans">15-B Gulberg II, Lahore</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans"
                  placeholder="0339-0005256"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans"
                  placeholder="What is this regarding?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans"
                  placeholder="Your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-logo-green text-white py-3 px-6 rounded-lg hover:bg-banner-green transition-colors font-sans font-bold flex items-center justify-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>Send Message</span>
              </button>
              {result && (
                <span className={`block text-center font-sans mt-2 ${result === 'Form Submitted Successfully' ? 'text-green-600' : result === 'Error' ? 'text-red-600' : 'text-gray-600'}`}>
                  {result}
                </span>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
