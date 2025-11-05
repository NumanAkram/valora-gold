import React, { useState } from 'react';
import { Share2, Facebook, Instagram, Music2 } from 'lucide-react';

const SocialMediaSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // WhatsApp Icon Component
  const WhatsAppIcon = ({ className }) => (
    <svg 
      className={className}
      fill="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );

  // Pinterest Icon Component
  const PinterestIcon = ({ className }) => (
    <svg 
      className={className}
      fill="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  );

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      url: 'https://api.whatsapp.com/send?phone=923390005256&text=Hello%20Valora%20Gold%20Team%20%F0%9F%91%8B',
      color: 'text-green-500'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://www.facebook.com/valoragold.pk/',
      color: 'text-blue-600'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/valoragold/#',
      color: 'text-pink-600'
    },
    {
      name: 'TikTok',
      icon: Music2,
      url: 'https://www.tiktok.com/@valoragold.pk',
      color: 'text-black'
    },
    {
      name: 'Pinterest',
      icon: PinterestIcon,
      url: 'https://www.pinterest.com/valoragoldpk/',
      color: 'text-red-600'
    }
  ];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center">
      {/* Main Share Button - Green Background */}
      <button
        onClick={toggleExpanded}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-l-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center w-14 h-14 group"
        aria-label="Share on social media"
        title="Share on social media"
      >
        <Share2 className="h-6 w-6 transition-transform duration-300 group-hover:rotate-180" />
      </button>

      {/* Expanded Social Icons - White Panel */}
      <div
        className={`bg-white shadow-2xl rounded-l-lg transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'w-auto opacity-100 ml-0' : 'w-0 opacity-0 ml-0'
        }`}
      >
        <div className="py-3 px-3 space-y-2">
          {socialLinks.map((social, index) => {
            const IconComponent = social.icon;
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 w-12 h-12 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                title={social.name}
                aria-label={`Follow us on ${social.name}`}
                style={{
                  animationDelay: isExpanded ? `${index * 50}ms` : '0ms'
                }}
              >
                <IconComponent className={`h-5 w-5 ${social.color}`} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaSidebar;

